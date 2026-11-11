import logging
from fastapi import APIRouter, status
from app.schemas.events import AuthWebhookEventRequest, AuthWebhookEventResponse
from app.services.sns_auth_webhook_service import sns_auth_webhook_service

logger = logging.getLogger("surgready.events_endpoint")

router = APIRouter()

@router.post(
    "/auth-webhook",
    response_model=AuthWebhookEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate Authentication Event with SNS AI Agent Workbench Webhook"
)
@router.post(
    "/verify-auth",
    response_model=AuthWebhookEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Authentication Event with SNS AI Agent Workbench Webhook"
)
async def verify_auth_event(request: AuthWebhookEventRequest):
    """
    Receives SIGN_IN or SIGN_UP authentication events, forwards safe metadata
    (zero credentials/passwords) to the SNS AI Agent Workbench POST webhook,
    validates the HTTP response code and response JSON, and returns a verified decision.

    Strict Evaluation Criteria:
    - verified: True ONLY if Workbench returns HTTP 200, valid JSON, and no explicit denial.
    - If status != 200, verified: False with exact HTTP status code and Workbench message.
    """
    payload_dict = request.model_dump()
    result = await sns_auth_webhook_service.verify_auth_event(payload_dict)

    return AuthWebhookEventResponse(
        verified=result.get("verified", False),
        http_status_code=result.get("http_status_code", 500),
        event_type=result.get("event_type", request.event_type),
        email=result.get("email", request.email),
        role=result.get("role", request.role),
        approval_status=result.get("approval_status", request.approval_status),
        message=result.get("message", "Processed"),
        workbench_response=result.get("workbench_response"),
        execution_time_ms=result.get("execution_time_ms", 0.0),
        timestamp=result.get("timestamp", request.timestamp or "")
    )
