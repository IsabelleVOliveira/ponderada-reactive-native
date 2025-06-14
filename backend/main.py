from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, EmailStr
import random, json, os
from datetime import datetime, timedelta
from utils import send_otp_email

DATA_FILE = "users.json"

app = FastAPI()

class UserIn(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.post("/send-otp")
def send_otp(user: UserIn):
    data = load_data()
    otp = str(random.randint(100000, 999999))
    data[user.email] = {
        **data.get(user.email, {}),
        "otp": otp,
        "otp_expiry": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    }
    save_data(data)
    send_otp_email(user.email, otp)
    return {"msg": "OTP enviado com sucesso"}

@app.post("/verify-otp")
def verify_otp(payload: OTPVerify):
    data = load_data()
    user = data.get(payload.email)
    if not user or user.get("otp") != payload.otp:
        raise HTTPException(status_code=400, detail="OTP inválido")
    if datetime.fromisoformat(user["otp_expiry"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expirado")
    return {"msg": "OTP verificado com sucesso"}

@app.post("/register")
def register(user: UserRegister):
    data = load_data()
    if user.email in data and data[user.email].get("password"):
        raise HTTPException(status_code=400, detail="Usuário já registrado")
    data[user.email] = {**data.get(user.email, {}), "password": user.password}
    save_data(data)
    return {"msg": "Usuário registrado com sucesso"}

@app.post("/login")
def login(credentials: LoginIn):
    data = load_data()
    user = data.get(credentials.email)
    if not user or user.get("password") != credentials.password:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"msg": "Login bem-sucedido"}
