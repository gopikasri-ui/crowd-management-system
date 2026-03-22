from fastapi import APIRouter
from pydantic import BaseModel
import time, json, os

router = APIRouter()

FEEDBACK_FILE = "feedback_data.json"

def load_feedbacks():
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, "r") as f:
            return json.load(f)
    return []

def save_feedbacks(data):
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(data, f, indent=2)

class FeedbackRequest(BaseModel):
    name: str
    email: str
    rating: int
    message: str

@router.post("/submit")
def submit_feedback(req: FeedbackRequest):
    feedbacks = load_feedbacks()
    feedbacks.append({
        "id": len(feedbacks) + 1,
        "name": req.name,
        "email": req.email,
        "rating": req.rating,
        "message": req.message,
        "timestamp": time.time(),
        "date": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    save_feedbacks(feedbacks)
    return {
        "status": "success",
        "message": "Feedback saved successfully!"
    }

@router.get("/all")
def get_feedbacks():
    feedbacks = load_feedbacks()
    return {
        "feedbacks": list(reversed(feedbacks)),
        "total": len(feedbacks)
    }

@router.get("/stats")
def get_stats():
    feedbacks = load_feedbacks()
    if not feedbacks:
        return {"total": 0, "avg_rating": 0}
    avg = sum(f["rating"] for f in feedbacks) / len(feedbacks)
    return {
        "total": len(feedbacks),
        "avg_rating": round(avg, 1),
        "five_stars": len([f for f in feedbacks if f["rating"] == 5]),
        "four_stars": len([f for f in feedbacks if f["rating"] == 4]),
    }