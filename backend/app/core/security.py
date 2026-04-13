import hashlib
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "visionguard-secret-key"
ALGORITHM = "HS256"

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain, hashed):
    return hash_password(plain) == hashed

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=10)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)