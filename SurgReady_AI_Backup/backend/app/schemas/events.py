from typing import Optional, Literal, Any, Dict
from pydantic import BaseModel, Field

class AuthWebhookEventRequest(BaseModel):
    event_type: Literal["SIGN_IN", "SIGN_UP"] = Field(
        ...,
        description="Identifies whether the event originated from SIGN_IN or SIGN_UP"
    )
    email: str = Field(
        ...,
        description="User email address"
    )
    role: Literal["doctor", "management", "nurse", "patient"] = Field(
        ...,
        description="Authenticated database role"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Supabase user UUID or staged user ID"
    )
    full_name: Optional[str] = Field(
        default=None,
        description="User's full name"
    )
    provider: Optional[Literal["email", "google"]] = Field(
        default="email",
        description="Authentication provider"
    )
    registration_status: Optional[str] = Field(
        default="active",
        description="Registration lifecycle status"
    )
    approval_status: Optional[str] = Field(
        default="approved",
        description="Approval state: approved, pending_admin_approval, or rejected"
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="ISO 8601 timestamp"
    )
    page: Optional[str] = Field(
        default=None,
        description="Originating portal page identifier"
    )
    hospital_name: Optional[str] = Field(
        default=None,
        description="Hospital Name"
    )
    department: Optional[str] = Field(
        default=None,
        description="Department name"
    )
    registration_number: Optional[str] = Field(
        default=None,
        description="License or hospital registration number"
    )
    contact_number: Optional[str] = Field(
        default=None,
        description="Contact Phone Number"
    )
    # Optional simulation parameter for rigorous verification of all HTTP status test cases
    simulate_status: Optional[int] = Field(
        default=None,
        description="Simulate a specific HTTP status code (e.g., 400, 401, 403, 500, 504) for testing"
    )
    simulate_denial: Optional[bool] = Field(
        default=False,
        description="Simulate HTTP 200 with explicit JSON access denial"
    )

class AuthWebhookEventResponse(BaseModel):
    verified: bool = Field(
        ...,
        description="True ONLY if HTTP status is exactly 200, JSON is valid, and no access denial is present"
    )
    http_status_code: int = Field(
        ...,
        description="Real HTTP response code from SNS Workbench (200, 400, 401, 403, 404, 500, 502, 504)"
    )
    event_type: str
    email: str
    role: Optional[str] = None
    approval_status: Optional[str] = None
    message: str = Field(
        ...,
        description="User-facing status message explaining verification outcome"
    )
    workbench_response: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Parsed JSON payload returned by SNS AI Agent Workbench"
    )
    execution_time_ms: float = Field(
        default=0.0,
        description="Round-trip execution time in milliseconds"
    )
    timestamp: str

class MatchingAnalysisEventRequest(BaseModel):
    event_type: str = "PATIENT_IMPLANT_MATCHING_ANALYSIS"
    case_id: str
    procedure_type: str
    anatomical_site: str
    implant_category: str = "Implants"
    estimated_size: Optional[str] = None
    surgical_priority: str = "Elective"
    candidates_count: int = 0
    timestamp: Optional[str] = None
    status: str = "COMPLETED_RULE_BASED"

class MatchingAnalysisEventResponse(BaseModel):
    success: bool
    status: str  # 'dispatched' | 'pending_configuration'
    message: str
    case_id: str
    timestamp: str

