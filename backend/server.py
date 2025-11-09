from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import asyncio, ctypes, os, sys, math, time, random

#Load C++ PID
libname = "libcontroller.dylib" if sys.platform == "darwin" else "libcontroller.so"
libpath = os.path.join(os.path.dirname(__file__), "controller", "build", libname)
lib = ctypes.CDLL(libpath)
lib.pid_update.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.pid_update.restype = ctypes.c_double
try:
    lib.pid_reset.argtypes = []
    lib.pid_reset.restype = None
except AttributeError:
    pass

app = FastAPI(title="Squawk-7700 Telemetry API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Simulation model (drop-in replacement) -----------------------------------
class Sim:
    def __init__(self):
        self.dt = 0.2                    # 5 Hz
        self.mass = 100.0                # kg
        self.g = 9.81                    # m/s^2
        self.drag = 0.8                  # N per (m/s)
        self.hover = self.mass * self.g  # N to hover

        # state
        self.alt = 950.0                 # m
        self.vel = 0.0                   # m/s
        self.acc = 0.0                   # m/s^2

        self.setpoint = 1100.0           # m (target altitude)
        self.status = "ACTIVE"
        self.fault = None
        self.fault_timer = 0.0

        lib.pid_reset()

    # optional, light randomness to feel "alive"
    def maybe_inject_fault(self):
        if self.fault:
            self.fault_timer -= self.dt
            if self.fault_timer <= 0:
                self.fault = None
                self.status = "ACTIVE"
            return

        # ~1% chance per tick to enter a transient fault (5–10 s)
        # (You can disable this when we add manual controls.)
        import random
        if random.random() < 0.01:
            self.fault = random.choice(["ENGINE_LOSS", "SENSOR_DRIFT", "CONTROL_LOCK"])
            self.fault_timer = random.uniform(5, 10)
            self.status = "EMERGENCY"

    def step(self):
        self.maybe_inject_fault()

        # --- Control law: compute commanded delta around hover
        if not self.fault:
            u_delta = lib.pid_update(self.setpoint, self.alt, self.dt)  # ΔN
        else:
            # degraded behaviors under fault
            import random
            if self.fault == "ENGINE_LOSS":
                u_delta = -400.0 + random.uniform(-30, 30)
            elif self.fault == "SENSOR_DRIFT":
                fake_alt = self.alt + random.uniform(-100, 100)
                u_delta = lib.pid_update(self.setpoint, fake_alt, self.dt)
            elif self.fault == "CONTROL_LOCK":
                u_delta = 0.0
            else:
                u_delta = lib.pid_update(self.setpoint, self.alt, self.dt)

        # saturate actuator authority
        u_delta = max(-400.0, min(400.0, u_delta))
        thrust = self.hover + u_delta  # N

        # --- Plant dynamics (1D vertical)
        #   m * dv/dt = u_delta - c*v
        self.acc = (u_delta - self.drag * self.vel) / self.mass
        self.vel += self.acc * self.dt
        self.alt += self.vel * self.dt

        # --- Health/phase classification
        error = self.setpoint - self.alt
        if not self.fault:
            if abs(error) < 2.0 and abs(self.vel) < 0.05:
                self.status = "STABLE"
            elif self.vel < -0.5:
                self.status = "DESCENT"
            else:
                self.status = "ACTIVE"

        return {
            "time": time.time(),
            "altitude": round(self.alt, 3),
            "velocity": round(self.vel, 3),
            "acceleration": round(self.acc, 3),
            "thrust": round(thrust, 2),
            "control_effort": round(u_delta, 2),
            "error": round(error, 3),
            "status": self.status,
            "fault": self.fault or "NONE",
        }

sim = Sim()

@app.websocket("/ws/telemetry")
async def ws_telemetry(ws: WebSocket):
    await ws.accept()
    while True:
        await asyncio.sleep(sim.dt)
        await ws.send_json(sim.step())

@app.get("/telemetry")
def telemetry():
    return sim.step()


@app.post("/setpoint")
def set_setpoint(value: float = Body(..., embed=True)):
    sim.setpoint = float(value)
    return {"ok": True, "setpoint": sim.setpoint}

@app.post("/trigger_fault/{fault_type}")
def trigger_fault(fault_type: str):
    fault_type = fault_type.upper()
    assert fault_type in {"ENGINE_LOSS", "SENSOR_DRIFT", "CONTROL_LOCK"}
    sim.fault = fault_type
    sim.fault_timer = 7.0
    sim.status = "EMERGENCY"
    return {"ok": True, "fault": sim.fault}