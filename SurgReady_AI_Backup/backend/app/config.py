import os
from typing import List

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SurgReady AI Backend")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

    # CORS settings allowing the React frontend (defaults to port 5173)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Hospital JWT Authentication Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "surgready_super_secret_jwt_hospital_master_key_2026_secured")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # SNS AI Agent Workbench - Document Analysis Webhook
    SNS_WORKBENCH_WEBHOOK_URL: str = os.getenv(
        "SNS_WORKBENCH_WEBHOOK_URL",
        "https://api.agents.snsihub.ai/webhook/2040abd9-b11a-459b-82eb-e4084ce0ab6d"
    )
    SNS_WORKBENCH_HTTP_METHOD: str = os.getenv("SNS_WORKBENCH_HTTP_METHOD", "POST")
    SNS_WORKBENCH_TIMEOUT_SECONDS: float = float(os.getenv("SNS_WORKBENCH_TIMEOUT_SECONDS", "60.0"))
    SNS_WORKBENCH_AUTH_HEADER_NAME: str = os.getenv("SNS_WORKBENCH_AUTH_HEADER_NAME", "Authorization")
    SNS_WORKBENCH_AUTH_TOKEN: str = os.getenv("SNS_WORKBENCH_AUTH_TOKEN", "")
    SNS_WORKBENCH_PAYLOAD_MODE: str = os.getenv("SNS_WORKBENCH_PAYLOAD_MODE", "json")

    # SNS AI Agent Workbench - Authentication Event Webhook (Sign In / Sign Up)
    SNS_AUTH_WEBHOOK_URL: str = os.getenv(
        "SNS_AUTH_WEBHOOK_URL",
        "https://api.agents.snsihub.ai/webhook/16b2d43d-5b9e-4956-b72f-f51e5cba00d8"
    )
    SNS_AUTH_WEBHOOK_TIMEOUT_SECONDS: float = float(os.getenv("SNS_AUTH_WEBHOOK_TIMEOUT_SECONDS", "15.0"))

    # File Upload settings
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".dcm"]

settings = Settings()
