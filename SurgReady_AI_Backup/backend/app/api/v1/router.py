from fastapi import APIRouter
from app.api.v1.endpoints import health, analysis, events, inventory, cases, chat

api_router = APIRouter()

# Register endpoint modules
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(analysis.router, tags=["Document Analysis & Webhook"])
api_router.include_router(events.router, prefix="/events", tags=["SNS Workbench Events"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Smart Hospital Inventory"])
api_router.include_router(cases.router, prefix="/cases", tags=["Patient Cases & Implant Comparison"])
api_router.include_router(chat.router, prefix="/chat", tags=["Management AI Chatbot"])
