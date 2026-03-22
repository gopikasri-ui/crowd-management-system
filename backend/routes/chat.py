from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

RESPONSES = {
    "crowd": "Current crowd density is being monitored in real time. Check the Live Map for density in your area.",
    "safe": "To stay safe, avoid areas marked red on the map. Use the AI Detection page to check crowd levels.",
    "alert": "Alerts are triggered automatically when crowd density reaches dangerous levels.",
    "webcam": "Go to AI Detection page and click Start Camera to use your webcam for live crowd counting.",
    "upload": "Go to AI Detection page and click Upload to analyze crowd density in any photo or video.",
    "map": "The Live Map page shows crowd density heatmap. Search any location to see its crowd level.",
    "emergency": "🚨 Emergency! Call 112 immediately. Move away from the crowd and find an open space.",
    "help": "I can help you with: crowd levels, map navigation, uploading images, safety tips, and alerts.",
    "hello": "Hello! I am CrowdAI Assistant. I can help you stay safe in crowded areas. How can I help?",
    "hi": "Hi there! Ask me about crowd levels, safety tips, or how to use this system.",
}

class ChatRequest(BaseModel):
    message: str

@router.post("/message")
def chat(req: ChatRequest):
    msg = req.message.lower()
    for key, response in RESPONSES.items():
        if key in msg:
            return {"reply": response}
    return {
        "reply": "I can help with crowd safety, map navigation, AI detection, and alerts. Try asking about 'crowd', 'map', 'upload', or 'emergency'."
    }