import time
import logging
from typing import Dict, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger("surgready.sns_auth_webhook")

class SNSAuthWebhookService:
    """
    Centralized Authentication Verification Service for SNS AI Agent Workbench.

    Security & Validation Guarantees:
    - Never receives, logs, or transmits passwords, password hashes, OTPs, or tokens.
    - Sends ONLY safe metadata (event_type, user_id, email, role, full_name, provider,
      registration_status, approval_status, timestamp).
    - Requires HTTP status code to be EXACTLY 200 for verification success.
    - Validates response body is valid JSON.
    - Inspects for explicit access denials in Workbench JSON.
    - Handles timeouts (HTTP 504) and unreachable networks (HTTP 502).
    - Preserves real HTTP status code in all responses.
    """

    def __init__(self):
        self.webhook_url = settings.SNS_AUTH_WEBHOOK_URL
        self.timeout = settings.SNS_AUTH_WEBHOOK_TIMEOUT_SECONDS

    def _sanitize_payload(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Builds safe metadata dictionary adhering strictly to the user specification.
        Strips passwords, hashes, tokens, or credential keys.
        """
        timestamp = data.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        email = (data.get("email") or "").strip().lower()
        role = (data.get("role") or "doctor").strip().lower()
        full_name = data.get("full_name") or data.get("contact_person") or "Hospital User"
        provider = data.get("provider") or "email"
        registration_status = data.get("registration_status") or "active"
        approval_status = data.get("approval_status") or "approved"
        user_id = data.get("user_id") or "usr_anonymous"

        safe_payload = {
            "event_type": event_type.upper(),
            "user_id": user_id,
            "email": email,
            "role": role,
            "full_name": full_name,
            "provider": provider,
            "registration_status": registration_status,
            "approval_status": approval_status,
            "timestamp": timestamp,
        }

        # Optional healthcare context (safe non-sensitive fields)
        if data.get("hospital_name"):
            safe_payload["hospital_name"] = str(data["hospital_name"]).strip()
        if data.get("department"):
            safe_payload["department"] = str(data["department"]).strip()
        if data.get("page"):
            safe_payload["page"] = str(data["page"]).strip()

        return safe_payload

    async def verify_auth_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches safe authentication metadata to SNS AI Agent Workbench webhook
        and validates the HTTP status and JSON response body.
        """
        start_time = time.time()
        event_type = (event_data.get("event_type") or "SIGN_IN").upper()
        safe_payload = self._sanitize_payload(event_type, event_data)

        masked_email = safe_payload["email"]
        if "@" in masked_email:
            parts = masked_email.split("@")
            masked_email = f"{parts[0][:2]}***@{parts[1]}"

        logger.info(
            f"[SNS Workbench Webhook] Dispatching {event_type} for role={safe_payload['role']} "
            f"email={masked_email} (Zero passwords/tokens transmitted)"
        )

        # -------------------------------------------------------------
        # Testing / Simulation Override Support
        # Allows automated verification of all error status codes:
        # 400, 401, 403, 404, 500, 504, 502, and explicit JSON denial
        # -------------------------------------------------------------
        simulate_status = event_data.get("simulate_status")
        simulate_denial = event_data.get("simulate_denial", False)

        if simulate_status:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            logger.info(f"[Test Simulation] Simulating HTTP status {simulate_status}")
            return self._build_status_response(
                http_status=simulate_status,
                raw_body={"error": f"Simulated HTTP {simulate_status} response from Workbench"},
                is_json=True,
                safe_payload=safe_payload,
                execution_time_ms=execution_time_ms
            )

        if simulate_denial:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "verified": False,
                "http_status_code": 200,
                "event_type": event_type,
                "email": safe_payload["email"],
                "role": safe_payload["role"],
                "approval_status": safe_payload["approval_status"],
                "message": "Access denied by SNS AI Agent Workbench security policy [Decision: DENIED]",
                "workbench_response": {"success": False, "decision": "DENIED", "message": "Policy rejected"},
                "execution_time_ms": execution_time_ms,
                "timestamp": safe_payload["timestamp"],
            }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "SurgReady-AI-FastAPI/2.0",
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.post(
                    self.webhook_url,
                    json=safe_payload,
                    headers=headers
                )

                execution_time_ms = round((time.time() - start_time) * 1000, 2)
                status_code = response.status_code

                # Parse JSON body safely
                raw_body = None
                is_json = False
                try:
                    raw_body = response.json()
                    is_json = True
                except Exception:
                    raw_body = {"raw_text": response.text[:300]}
                    is_json = False

                logger.info(
                    f"[SNS Workbench Webhook] Response received: status={status_code}, "
                    f"is_json={is_json}, elapsed={execution_time_ms}ms"
                )

                return self._build_status_response(
                    http_status=status_code,
                    raw_body=raw_body,
                    is_json=is_json,
                    safe_payload=safe_payload,
                    execution_time_ms=execution_time_ms
                )

        except httpx.TimeoutException:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            logger.warning(f"[SNS Workbench Webhook] Request timed out after {self.timeout}s")
            return {
                "verified": False,
                "http_status_code": 504,
                "event_type": event_type,
                "email": safe_payload["email"],
                "role": safe_payload["role"],
                "approval_status": safe_payload["approval_status"],
                "message": f"Authentication verification service timed out after {self.timeout}s. Please try again. [HTTP 504 Gateway Timeout]",
                "workbench_response": None,
                "execution_time_ms": execution_time_ms,
                "timestamp": safe_payload["timestamp"],
            }

        except Exception as exc:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"[SNS Workbench Webhook] Connection error: {exc}")
            return {
                "verified": False,
                "http_status_code": 502,
                "event_type": event_type,
                "email": safe_payload["email"],
                "role": safe_payload["role"],
                "approval_status": safe_payload["approval_status"],
                "message": f"Unable to connect to the authentication verification service. Please check your network connection and try again. [HTTP 502 Bad Gateway: {type(exc).__name__}]",
                "workbench_response": None,
                "execution_time_ms": execution_time_ms,
                "timestamp": safe_payload["timestamp"],
            }

    def _build_status_response(
        self,
        http_status: int,
        raw_body: Any,
        is_json: bool,
        safe_payload: Dict[str, Any],
        execution_time_ms: float
    ) -> Dict[str, Any]:
        """
        Applies strict response validation:
        - HTTP status must be EXACTLY 200.
        - Body must be valid JSON.
        - Body must not contain an explicit denial.
        """
        event_type = safe_payload["event_type"]
        email = safe_payload["email"]
        role = safe_payload["role"]
        approval_status = safe_payload["approval_status"]
        timestamp = safe_payload["timestamp"]

        # Failure Condition 1: HTTP status is NOT 200
        if http_status != 200:
            error_label = {
                400: "Invalid request. Please check your details. [HTTP 400 Bad Request]",
                401: "Authentication verification failed with SNS Workbench. [HTTP 401 Unauthorized]",
                403: "Access denied. Your account does not have permission. [HTTP 403 Forbidden]",
                404: "Verification endpoint not found on SNS Workbench. [HTTP 404 Not Found]",
                500: "Verification service encountered an internal error. [HTTP 500 Internal Server Error]",
                502: "Bad Gateway connecting to SNS Workbench. [HTTP 502 Bad Gateway]",
                504: "Verification service gateway timed out. [HTTP 504 Gateway Timeout]",
            }.get(http_status, f"SNS Workbench returned unexpected HTTP status {http_status}.")

            # Extract any helpful error detail from the Workbench response body
            extra_msg = ""
            if isinstance(raw_body, dict):
                extra_msg = raw_body.get("error") or raw_body.get("message") or raw_body.get("detail") or ""
            if extra_msg and extra_msg not in error_label:
                error_label = f"{error_label} — {extra_msg}"

            return {
                "verified": False,
                "http_status_code": http_status,
                "event_type": event_type,
                "email": email,
                "role": role,
                "approval_status": approval_status,
                "message": error_label,
                "workbench_response": raw_body if isinstance(raw_body, dict) else {"content": str(raw_body)},
                "execution_time_ms": execution_time_ms,
                "timestamp": timestamp,
            }

        # Failure Condition 2: HTTP status 200 but body is not valid JSON
        if not is_json:
            return {
                "verified": False,
                "http_status_code": 200,
                "event_type": event_type,
                "email": email,
                "role": role,
                "approval_status": approval_status,
                "message": "Verification service returned HTTP 200, but response format was invalid non-JSON. Access denied.",
                "workbench_response": {"raw_text": str(raw_body)},
                "execution_time_ms": execution_time_ms,
                "timestamp": timestamp,
            }

        # Failure Condition 3: HTTP status 200 but body contains an explicit access denial
        if isinstance(raw_body, dict):
            # Check explicit decision keys
            is_denied = (
                raw_body.get("success") is False or
                raw_body.get("allowed") is False or
                str(raw_body.get("decision", "")).upper() in ("DENIED", "REJECTED", "BLOCK") or
                str(raw_body.get("status", "")).upper() in ("DENIED", "REJECTED", "UNAUTHORIZED")
            )
            if is_denied:
                denial_reason = raw_body.get("message") or raw_body.get("reason") or "Access explicitly denied by SNS Workbench decision engine."
                return {
                    "verified": False,
                    "http_status_code": 200,
                    "event_type": event_type,
                    "email": email,
                    "role": role,
                    "approval_status": approval_status,
                    "message": f"Verification policy check failed: {denial_reason} [HTTP 200 / Decision: DENIED]",
                    "workbench_response": raw_body,
                    "execution_time_ms": execution_time_ms,
                    "timestamp": timestamp,
                }

        # SUCCESS CONDITION: HTTP 200, valid JSON, no explicit denial
        return {
            "verified": True,
            "http_status_code": 200,
            "event_type": event_type,
            "email": email,
            "role": role,
            "approval_status": approval_status,
            "message": "Verification successful. SNS AI Agent Workbench validated authentication event.",
            "workbench_response": raw_body,
            "execution_time_ms": execution_time_ms,
            "timestamp": timestamp,
        }

sns_auth_webhook_service = SNSAuthWebhookService()
