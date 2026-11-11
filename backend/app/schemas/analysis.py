from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class HealthResponse(BaseModel):
    status: str = "healthy"
    app_name: str
    environment: str
    api_version: str = "v1"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    workbench_webhook_configured: bool

class DocumentAnalysisRequest(BaseModel):
    case_id: Optional[str] = Field(None, description="Optional procedure/case identifier")
    procedure_name: Optional[str] = Field("Total Knee Arthroplasty (TKA)", description="Surgical procedure name")
    procedure_code: Optional[str] = Field("CPT 27447", description="Billing/CPT code")
    manufacturer: Optional[str] = Field("Stryker", description="Implant OEM / Manufacturer")
    system_name: Optional[str] = Field("Triathlon Knee System", description="Specific implant system")
    clinical_notes: Optional[str] = Field(None, description="De-identified synthetic clinical preparation notes")
    document_name: Optional[str] = Field(None, description="Filename of uploaded surgical manual or scan")
    document_content: Optional[str] = Field(None, description="Optional extracted text or base64 data")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom parameters for the webhook")

class DocumentAnalysisResponse(BaseModel):
    success: bool
    status: str = Field(..., description="E.g. ANALYZED, COMPLETED, FALLBACK_MOCK, or ERROR")
    case_id: Optional[str] = None
    procedure_name: Optional[str] = None
    manufacturer: Optional[str] = None
    webhook_status_code: Optional[int] = None
    execution_time_ms: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None
    raw_webhook_response: Optional[Any] = None
    error_detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

