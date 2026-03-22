from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time

router = APIRouter()

users_db = {}

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class LoginRequest(BaseModel):
    email: str
    password: str

class OTPRequest(BaseModel):
    phone: str
    otp: str

@router.post("/signup")
def signup(req: SignupRequest):
    if req.email in users_db:
        raise HTTPException(
            status_code=400,
            detail="Email already exists. Please login."
        )
    users_db[req.email] = {
        "name": req.name,
        "email": req.email,
        "password": req.password,
        "phone": req.phone,
        "role": "public",
        "verified": False,
        "created_at": time.time()
    }
    return {
        "status": "otp_sent",
        "message": f"Account created! Use OTP 123456 to verify.",
        "phone": req.phone,
        "name": req.name,
        "email": req.email,
        "role": "public"
    }

@router.post("/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = users_db.get(email)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email not found. Please sign up first."
        )
    if user["password"] != req.password.strip():
        raise HTTPException(
            status_code=401,
            detail="Wrong password. Please try again."
        )
    return {
        "status": "otp_sent",
        "message": f"Use OTP 123456 to verify.",
        "phone": user["phone"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }

@router.post("/verify-otp")
def verify_otp_route(req: OTPRequest):
    if req.otp != "123456":
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Use 123456 for demo."
        )
    user = next(
        (u for u in users_db.values() if u["phone"] == req.phone),
        None
    )
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )
    user["verified"] = True
    return {
        "status": "verified",
        "token": f"token-{user['email']}-{time.time()}",
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "phone": user["phone"]
    }

@router.get("/me")
def get_me():
    return {"message": "Auth is working!"}