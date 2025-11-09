import json

def evaluate(path="artifacts/telemetry.json"):
    with open(path) as f: data = json.load(f)
    altitudes = [d["alt"] for d in data]
    max_alt = max(altitudes)
    min_alt = min(altitudes)
    overshoot = max_alt - 10.0
    settled = abs(altitudes[-1] - 10.0) < 0.1
    summary = {
        "max_altitude": round(max_alt,2),
        "min_altitude": round(min_alt,2),
        "overshoot": round(overshoot,2),
        "settled": settled
    }
    print("Verification summary:", summary)
    with open("artifacts/summary.json","w") as f: json.dump(summary,f,indent=2)
    return summary

if __name__=="__main__":
    evaluate()