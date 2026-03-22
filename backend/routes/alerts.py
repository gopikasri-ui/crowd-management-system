from fastapi import APIRouter
from pydantic import BaseModel
import time

router = APIRouter()

real_alerts = []
map_search_history = []

class AlertInput(BaseModel):
    people_count: int
    density: str
    source: str

class MapSearchInput(BaseModel):
    location: str
    lat: float
    lng: float
    density: str
    signal_strength: float

def get_recommendation(density):
    if density == "Critical":
        return "Evacuate immediately and call emergency services"
    elif density == "High":
        return "Avoid this area and use alternate routes"
    elif density == "Medium":
        return "Stay alert and maintain safe distance"
    else:
        return "Area is safe — normal crowd levels"

@router.post("/add")
def add_alert(data: AlertInput):
    if data.density in ["High", "Critical"]:
        real_alerts.append({
            "id": len(real_alerts) + 1,
            "people_count": data.people_count,
            "density": data.density,
            "severity": data.density.lower(),
            "source": data.source,
            "message": f"{data.people_count} people detected — {data.density} density",
            "recommendation": get_recommendation(data.density),
            "timestamp": time.time(),
            "type": "detection"
        })
    return {"status": "ok"}

@router.post("/map-search")
def add_map_search(data: MapSearchInput):
    map_search_history.append({
        "id": len(map_search_history) + 1,
        "location": data.location,
        "lat": data.lat,
        "lng": data.lng,
        "density": data.density,
        "signal_strength": data.signal_strength,
        "severity": data.density.lower(),
        "recommendation": get_recommendation(data.density),
        "timestamp": time.time(),
        "type": "map_search"
    })
    return {"status": "saved"}

@router.get("/live")
def get_live_alerts():
    recent = [
        a for a in real_alerts
        if time.time() - a["timestamp"] < 300
    ]
    return {"alerts": recent, "total": len(recent)}

@router.get("/history")
def get_alert_history():
    return {
        "alerts": list(reversed(real_alerts)),
        "total": len(real_alerts)
    }

@router.get("/map-history")
def get_map_history():
    return {
        "searches": list(reversed(map_search_history)),
        "total": len(map_search_history)
    }

@router.delete("/clear")
def clear_alerts():
    real_alerts.clear()
    return {"status": "cleared"}

@router.delete("/map-history/clear")
def clear_map_history():
    map_search_history.clear()
    return {"status": "cleared"}