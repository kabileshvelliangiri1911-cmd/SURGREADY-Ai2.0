import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints import events

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("surgready.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "FastAPI Backend for SurgReady AI providing surgical document analysis, "
        "safe file ingestion, and secure integration with the SNS AI Agent Workbench webhook."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration allowing the React frontend (running on http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register versioned API router
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix="/api/events", tags=["SNS Workbench Events Alias"])

@app.get("/", summary="Root Status")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "api_docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "environment": settings.ENVIRONMENT
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode.")
    logger.info(f"Allowed CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    if settings.SNS_WORKBENCH_WEBHOOK_URL:
        logger.info("SNS AI Agent Workbench webhook configured.")
    else:
        logger.warning("SNS AI Agent Workbench webhook URL not set in environment.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

