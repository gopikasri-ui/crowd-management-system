from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, crowd, alerts, feedback, chat

app = FastAPI(
    title="AI Crowd Management System",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Auth"]
)
app.include_router(
    crowd.router,
    prefix="/api/crowd",
    tags=["Crowd"]
)
app.include_router(
    alerts.router,
    prefix="/api/alerts",
    tags=["Alerts"]
)
app.include_router(
    feedback.router,
    prefix="/api/feedback",
    tags=["Feedback"]
)
app.include_router(
    chat.router,
    prefix="/api/chat",
    tags=["Chat"]
)

@app.get("/")
def root():
    return {
        "status": "AI Crowd Management System is Live",
        "version": "2.0.0"
    }