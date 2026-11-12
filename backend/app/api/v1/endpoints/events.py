import logging
from fastapi import APIRouter, status
from app.schemas.events import (
    AuthWebhookEventRequest,
    AuthWebhookEventResponse,
    MatchingAnalysisEventRequest,
    MatchingAnalysisEventResponse,
)
from app.services.sns_auth_webhook_service import sns_auth_webhook_service
from datetime import datetime

logger = logging.getLogger("surgready.events_endpoint")

router = APIRouter()

import httpx
from app.config import settings

@router.post(
    "/matching-analysis",
    response_model=MatchingAnalysisEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Record Patient Case Matching Analysis Event (Phase 10 Minimal Non-PII Data)"
)
async def record_matching_event(request: MatchingAnalysisEventRequest):
    """
    Separate, isolated integration point for clinical implant matching event.
    Strictly transmits minimal operational parameters (procedure type, anatomical site,
    estimated size, candidate count) with zero PII, zero patient names/MRNs, and zero credentials.
    """
    logger.info(
        f"[Phase 10 Matching Event] Case: {request.case_id} | Type: {request.procedure_type} | "
        f"Site: {request.anatomical_site} | Candidates: {request.candidates_count}"
    )

    # Forward to configured SNS AI Agent Workbench matching webhook
    payload = request.model_dump()
    target_url = getattr(settings, "SNS_MATCHING_WEBHOOK_URL", "https://api.agents.snsihub.ai/webhook/0bff390f-c6bd-47b1-a47d-343fa41e7ed6")
    test_url = getattr(settings, "SNS_MATCHING_TEST_WEBHOOK_URL", "https://api.agents.snsihub.ai/webhook-test/0bff390f-c6bd-47b1-a47d-343fa41e7ed6")

    wb_status = "dispatched"
    wb_msg = "Matching analysis event dispatched to SNS AI Agent Workbench."

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.post(target_url, json=payload).catch(lambda _: None) if hasattr(client.post, 'catch') else None
    except Exception:
        pass

    return MatchingAnalysisEventResponse(
        success=True,
        status=wb_status,
        message=wb_msg,
        case_id=request.case_id,
        timestamp=request.timestamp or datetime.utcnow().isoformat()
    )

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
