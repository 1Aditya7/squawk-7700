from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio, ctypes, os, sys, math, time

# Load C++ PID
libname = "libcontroller.dylib" if sys.platform == "darwin" else "libcontroller.so"
libpath = os.path.join(os.path.dirname(__file__), "controller", "build", libname)
lib = ctypes.CDLL(libpath)
lib.pid_update.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.pid_update.restype  = ctypes.c_double

try:
    lib.pid_reset.argtypes = []
    lib.pid_reset.restype  = None
except AttributeError:
    pass


app = FastAPI(title="Squawk-7700 Telemetry API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# Simulation model
class Sim:
    def __init__(self):
        self.dt = 0.2               # 5 Hz
        self.mass = 100.0           # kg (scaled)
        self.g = 9.81               # m/s^2
        self.drag = 0.8             # N per (m/s)
        self.hover = self.mass * self.g  # ~981 N
        self.alt = 950.0            # m
        self.vel = 0.0              # m/s
        self.setpoint = 1100.0      # m
        self.status = "ACTIVE"
        self._last_t = time.time()

        try:
            lib.pid_reset()
        except Exception:
            pass

    def step(self):
        # PID gives delta-thrust around hover to eliminate gravity term
        u_delta = lib.pid_update(self.setpoint, self.alt, self.dt)
        # clamp controller output to avoid crazy accelerations
        u_delta = max(-400.0, min(400.0, u_delta))
        thrust = self.hover + u_delta

        # dynamics: a = (thrust - mg - drag*vel) / m  -> with hover cancel this is (u_delta - drag*vel)/m
        acc = (u_delta - self.drag * self.vel) / self.mass
        self.vel += acc * self.dt
        self.alt += self.vel * self.dt

        # status heuristic
        err = abs(self.setpoint - self.alt)
        if err < 2.0 and abs(self.vel) < 0.05:
            self.status = "STABLE"
        elif self.vel < -0.5:
            self.status = "DESCENT"
        else:
            self.status = "ACTIVE"

        t = time.time()
        return {
            "time": t,
            "altitude": round(self.alt, 2),
            "thrust": round(thrust, 2),
            "samples": 0,
            "status": self.status,
        }

sim = Sim()

@app.get("/")
def root():
    return {"status": "ok", "message": "Squawk-7700 backend running"}

# One-shot snapshot
@app.get("/telemetry")
def telemetry():
    return sim.step()

# Change setpoint at runtime: /setpoint?alt=1200
@app.get("/setpoint")
def setpoint(alt: float = Query(..., description="Altitude setpoint in meters")):
    sim.setpoint = alt
    try:
        lib.pid_reset()
    except Exception:
        pass
    return {"ok": True, "setpoint": sim.setpoint}

# WebSocket streaming at ~5 Hz using the PID-driven plant
@app.websocket("/ws/telemetry")
async def ws_telemetry(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await asyncio.sleep(sim.dt)
            sample = sim.step()
            await ws.send_json(sample)
    except WebSocketDisconnect:
        return
