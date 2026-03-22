from fastapi import APIRouter, UploadFile, File
from ai_engine.detector import detect_from_image_bytes, get_density_level
import random, time, datetime

router = APIRouter()

@router.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    contents = await file.read()
    result = detect_from_image_bytes(contents)
    return {
        "people_count": result["count"],
        "density": result["density"],
        "recommendation": result["recommendation"],
        "annotated_image": result["annotated_image"],
        "timestamp": time.time()
    }

@router.get("/live")
def get_live_data():
    count = random.randint(5, 80)
    return {
        "people_count": count,
        "density": get_density_level(count),
        "active_cameras": 8,
        "alerts_triggered": random.randint(0, 3),
        "timestamp": time.time()
    }

@router.get("/heatmap")
def get_heatmap_data():
    points = []
    for _ in range(60):
        points.append({
            "lat": 13.0827 + random.uniform(-0.03, 0.03),
            "lng": 80.2707 + random.uniform(-0.03, 0.03),
            "weight": random.uniform(0.1, 1.0)
        })
    return {"points": points}

@router.post("/heatmap/location")
def get_location_heatmap(data: dict):
    lat = data.get("lat", 13.0827)
    lng = data.get("lng", 80.2707)
    location_name = data.get("location_name", "").lower()

    known_places = [
        {"keywords": ["marina", "beach"], "base": 0.88},
        {"keywords": ["t nagar", "tnagar"], "base": 0.82},
        {"keywords": ["airport", "air port"], "base": 0.78},
        {"keywords": ["central station", "central"], "base": 0.84},
        {"keywords": ["mall", "shopping", "express avenue"], "base": 0.72},
        {"keywords": ["anna nagar"], "base": 0.58},
        {"keywords": ["velachery"], "base": 0.62},
        {"keywords": ["tambaram"], "base": 0.66},
        {"keywords": ["guindy"], "base": 0.52},
        {"keywords": ["mylapore"], "base": 0.74},
        {"keywords": ["vadapalani"], "base": 0.70},
        {"keywords": ["adyar"], "base": 0.46},
        {"keywords": ["besant nagar"], "base": 0.32},
        {"keywords": ["ecr", "east coast"], "base": 0.28},
        {"keywords": ["omr", "old mahabalipuram"], "base": 0.42},
        {"keywords": ["hospital", "clinic", "medical"], "base": 0.80},
        {"keywords": ["school", "college", "university", "srm", "vit"], "base": 0.68},
        {"keywords": ["temple", "kovil", "church", "mosque"], "base": 0.82},
        {"keywords": ["market", "bazaar", "vegetable"], "base": 0.87},
        {"keywords": ["park", "garden", "lake"], "base": 0.38},
        {"keywords": ["bus stand", "bus stop", "terminus"], "base": 0.80},
        {"keywords": ["railway", "station", "train"], "base": 0.83},
        {"keywords": ["bangalore", "bengaluru"], "base": 0.76},
        {"keywords": ["mumbai", "bombay"], "base": 0.85},
        {"keywords": ["delhi"], "base": 0.88},
        {"keywords": ["hyderabad"], "base": 0.74},
        {"keywords": ["coimbatore"], "base": 0.65},
        {"keywords": ["madurai"], "base": 0.70},
        {"keywords": ["salem"], "base": 0.60},
        {"keywords": ["namakkal"], "base": 0.45},
        {"keywords": ["trichy", "tiruchirappalli"], "base": 0.68},
        {"keywords": ["office", "tcs", "infosys", "wipro", "it park"], "base": 0.72},
        {"keywords": ["village", "rural"], "base": 0.22},
        {"keywords": ["highway", "road", "street"], "base": 0.48},
    ]

    base_weight = 0.50
    for place in known_places:
        for keyword in place["keywords"]:
            if keyword in location_name:
                base_weight = place["base"]
                break

    hour = datetime.datetime.now().hour
    if 7 <= hour <= 9:
        time_factor = 0.85
    elif 10 <= hour <= 13:
        time_factor = 0.92
    elif 14 <= hour <= 19:
        time_factor = 1.0
    elif 20 <= hour <= 22:
        time_factor = 0.75
    else:
        time_factor = 0.30

    final_weight = base_weight * time_factor
    final_weight = min(max(final_weight + random.uniform(-0.03, 0.03), 0.05), 1.0)

    points = []
    for _ in range(40):
        point_weight = final_weight + random.uniform(-0.08, 0.08)
        point_weight = max(0.05, min(1.0, point_weight))
        points.append({
            "lat": lat + random.uniform(-0.015, 0.015),
            "lng": lng + random.uniform(-0.015, 0.015),
            "weight": round(point_weight, 3)
        })

    signal_strength = round(final_weight * 100, 1)

    return {
        "points": points,
        "overall_density": get_density_level(int(final_weight * 80)),
        "signal_strength": signal_strength
    }

@router.get("/trends")
def get_crowd_trends():
    from routes.alerts import map_search_history
    if not map_search_history:
        return {
            "labels": [],
            "datasets": {
                "detected": [],
                "alerts": []
            },
            "locations": []
        }
    labels = []
    detected = []
    alerts_data = []
    for s in map_search_history[-14:]:
        labels.append(s["location"][:25] + "...")
        detected.append(round(s["signal_strength"], 1))
        alerts_data.append(
            1 if s["density"] in ["High", "Critical"] else 0
        )
    return {
        "labels": labels,
        "datasets": {
            "detected": detected,
            "alerts": alerts_data
        },
        "locations": [
            {
                "name": s["location"][:35],
                "density": s["density"],
                "signal": s["signal_strength"],
                "time": s["timestamp"]
            }
            for s in reversed(map_search_history[-10:])
        ]
    }