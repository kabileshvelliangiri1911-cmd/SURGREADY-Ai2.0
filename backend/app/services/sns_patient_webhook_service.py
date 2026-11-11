import time
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("surgready.sns_patient_webhook")

VALID_AUTOMATION_EVENTS = {
    "PATIENT_CASE_CREATED",
    "IMPLANT_COMPARISON_COMPLETED",
    "SURGEON_REVIEW_REQUIRED",
    "SURGEON_REVIEW_COMPLETED",
    "INVENTORY_LOW_STOCK",
    "INVENTORY_OUT_OF_STOCK",
    "INVENTORY_STOCK_RESTORED"
}

class SNSPatientWebhookService:
    """
    Dedicated automation webhook dispatcher for Patient Cases & Inventory Notifications.
    Separated from authentication webhooks to safeguard sensitive clinical isolation.
    
    Security & Privacy:
    - Never transmits raw scans, 3D files, DICOM slices, or diagnostic images.
    - Never transmits passwords, auth tokens, or private user credentials.
    - Sends minimal identifiers (case_id, procedure_name, priority, status).
    - Webhook failures are non-blocking and never corrupt database state.
    """

    def __init__(self):
        # By default uses the configured webhook URL or workbench destination
        self.webhook_url = getattr(settings, "SNS_PATIENT_WEBHOOK_URL", settings.SNS_AUTH_WEBHOOK_URL)
        self.timeout = 15.0
        self._sent_event_hashes = set()

    def _build_safe_payload(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        timestamp = data.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        # Base minimal structure
        payload = {
            "event_type": event_type,
            "timestamp": timestamp,
            "hospital_id": data.get("hospital_id", "HOSP-STJUDE-01"),
            "case_id": data.get("case_id"),
            "procedure_name": data.get("procedure_name"),
            "status": data.get("status", "DISPATCHED")
        }

        # Add event-specific minimal details
        if event_type in ("INVENTORY_LOW_STOCK", "INVENTORY_OUT_OF_STOCK", "INVENTORY_STOCK_RESTORED"):
            payload.update({
                "item_id": data.get("item_id"),
                "implant_name": data.get("implant_name"),
                "manufacturer": data.get("manufacturer"),
                "available_stock": data.get("available_stock"),
                "minimum_stock_level": data.get("minimum_stock_level"),
                "alert_priority": data.get("priority", "High")
            })
        elif event_type in ("SURGEON_REVIEW_REQUIRED", "SURGEON_REVIEW_COMPLETED"):
            payload.update({
                "lead_surgeon": data.get("lead_surgeon_name") or data.get("surgeon"),
                "review_decision": data.get("decision") or data.get("review_status", "Pending"),
                "candidate_count": data.get("candidate_count", 0)
            })

        return payload

    async def dispatch_patient_event(self, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        if event_type not in VALID_AUTOMATION_EVENTS:
            logger.warning(f"[SNS Patient Webhook] Ignored unverified event type: '{event_type}'")
            return {"success": False, "reason": "unsupported_event_type"}

        # Duplicate event protection
        event_hash = f"{event_type}_{event_data.get('case_id')}_{event_data.get('item_id')}_{event_data.get('status')}"
        if event_hash in self._sent_event_hashes:
            logger.info(f"[SNS Patient Webhook] Suppressed duplicate event dispatch: {event_hash}")
            return {"success": True, "duplicate_suppressed": True}

        safe_payload = self._build_safe_payload(event_type, event_data)
        logger.info(f"[SNS Patient Webhook] Dispatching event: {event_type} for Case {safe_payload.get('case_id')}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.webhook_url,
                    json=safe_payload,
                    headers={"Content-Type": "application/json", "X-SurgReady-Event": event_type}
                )
                self._sent_event_hashes.add(event_hash)
                return {
                    "success": response.status_code in (200, 201, 202),
                    "status_code": response.status_code,
                    "event_type": event_type
                }
        except Exception as e:
            # Non-blocking graceful catch: Webhook failure NEVER breaks application or corrupts case
            logger.warn(f"[SNS Patient Webhook Notice] Webhook unreachable ({e}). Local operation completed safely.")
            return {"success": False, "error": str(e), "non_blocking": True}

sns_patient_webhook_service = SNSPatientWebhookService()

