from fastapi import APIRouter, HTTPException, status
from app.schemas.cases import ChatbotMessageRequest, ChatbotMessageResponse
from app.services.management_chatbot_service import management_chatbot_service

router = APIRouter()

@router.post("/management-assistant", response_model=ChatbotMessageResponse)
def chat_with_management_assistant(payload: ChatbotMessageRequest):
    """
    SURGREADY Management Assistant Chatbot Endpoint
    Restricted to authenticated users with actual verified database role of 'management'.
    Answers operations, case schedule, and inventory queries using live hospital records.
    """
    # Strict role verification: Reject unauthorized roles with HTTP 403 Forbidden
    if (payload.user_role or "").strip().lower() != "management":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Forbidden: SURGREADY Management Assistant is accessible only to verified Hospital Management accounts."
        )

    result = management_chatbot_service.process_message(
        message=payload.message,
        user_role=payload.user_role,
        user_name=payload.user_name or "Hospital Administrator",
        hospital_id=payload.hospital_id or "HOSP-STJUDE-01"
    )

    return result

