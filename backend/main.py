from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import random, json, os
from datetime import datetime, timedelta
from utils import send_otp_email
import uvicorn

DATA_FILE = "users.json"

app = FastAPI()

# Configuração do CORS mais permissiva para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos
    allow_headers=["*"],  # Permite todos os headers
)

class UserIn(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class UserRegister(BaseModel):
    email: EmailStr
    name: str

# class LoginIn(BaseModel):
#    email: EmailStr
#    password: str

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.post("/register")
def register(user: UserRegister):
    data = load_data()
    if user.email in data:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    data[user.email] = {
        "name": user.name,
        "registered_at": datetime.utcnow().isoformat()
    }
    save_data(data)
    return {"msg": "Usuário cadastrado com sucesso"}

@app.post("/send-otp")
def send_otp(user: UserIn):
    data = load_data()
    otp = str(random.randint(100000, 999999))
    
    # Salva apenas o email e o OTP
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
    
    # Após verificação bem-sucedida, mantém apenas os dados do usuário
    user_data = {
        "name": user.get("name", ""),
        "last_login": datetime.utcnow().isoformat()
    }
    data[payload.email] = user_data
    save_data(data)
    
    return {"msg": "OTP verificado com sucesso", "user": user_data}

@app.post("/login")
def login(user: UserIn):
    data = load_data()
    
    # Verifica se o usuário existe
    if user.email not in data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Gera novo OTP
    otp = str(random.randint(100000, 999999))
    
    # Atualiza os dados do usuário com novo OTP e expiração
    data[user.email] = {
        **data.get(user.email, {}),
        "otp": otp,
        "otp_expiry": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    }
    
    save_data(data)

    # Envia o OTP por e-mail
    send_otp_email(user.email, otp)
    
    return {"msg": "Novo OTP enviado para o e-mail"}


if __name__ == "__main__":  
    uvicorn.run(app, host="0.0.0.0", port=8000)
