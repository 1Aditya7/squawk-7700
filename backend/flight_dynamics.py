import os, json, math, random, time, ctypes

lib_path = os.path.join(os.path.dirname(__file__), "controller/build/libcontroller.dylib")
lib = ctypes.CDLL(lib_path)
lib.pid_update.restype = ctypes.c_double

def simulate(duration=20.0, dt=0.05):
    data = []
    t = 0.0
    setpoint = 10.0
    measured = 0.0
    while t < duration:
        thrust = lib.pid_update(ctypes.c_double(setpoint), ctypes.c_double(measured), ctypes.c_double(dt))
        
        # basic mock flight dynamics
        measured += 0.1 * (thrust - 9.81) * dt
        measured += random.uniform(-0.02, 0.02)
        battery = 12.6 - 0.0004 * t
        data.append({"t": round(t,2), "alt": round(measured,3), "thrust": round(thrust,3), "battery": round(battery,3)})
        t += dt
        time.sleep(0.01)
    os.makedirs("artifacts", exist_ok=True)
    with open("artifacts/telemetry.json","w") as f:
        json.dump(data,f,indent=2)
    print(f"Generated {len(data)} samples.")
    return data

if __name__ == "__main__":
    simulate()