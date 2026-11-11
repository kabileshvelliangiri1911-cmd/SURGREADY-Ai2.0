from fastapi import APIRouter
from app.config import settings
from app.schemas.analysis import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="System Health & Webhook Status Check")
async def health_check():
    """
    Returns the health status of the SurgReady AI FastAPI backend
    and verifies whether the SNS AI Agent Workbench webhook URL is loaded.
    """
    is_webhook_configured = bool(
        settings.SNS_WORKBENCH_WEBHOOK_URL and 
        "your-webhook-id" not in settings.SNS_WORKBENCH_WEBHOOK_URL
    )

    return HealthResponse(
        status="healthy",
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        api_version="v1",
        workbench_webhook_configured=is_webhook_configured
    )

