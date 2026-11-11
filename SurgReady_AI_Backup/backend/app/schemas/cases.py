from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class PatientScanFileSchema(BaseModel):
    id: Optional[str] = None
    case_id: str
    file_name: str
    file_type: str  # 'DICOM' | 'CT' | 'MRI' | '3D_STL' | 'DOC' | 'IMAGE'
    storage_path: str
    file_size_bytes: int
    file_size_formatted: Optional[str] = None
    uploaded_by: Optional[str] = None
    uploaded_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    processing_status: str = "Uploaded"

class ImplantCandidateSchema(BaseModel):
    id: Optional[str] = None
    case_id: str
    implant_id: Optional[str] = None
    implant_name: str
    manufacturer: str
    system_line_name: str
    product_model: str
    femoral_size: Optional[str] = None
    tibial_size: Optional[str] = None
    available_stock: int = 0
    minimum_stock_level: int = 2
    stock_status: str = "Normal Stock"
    comparison_status: str  # 'Exact Match' | 'Partial Match' | 'Mismatch' | 'Insufficient Information'
    matched_attributes: List[str] = []
    unmatched_attributes: List[str] = []
    missing_information: List[str] = []
    evidence_reference: str
    clinical_disclaimer: str = "Informational only. Attending surgeon clinical verification required before incision."
    surgeon_decision: str = "Pending"  # 'Pending' | 'Approved' | 'Rejected' | 'Info Requested'
    surgeon_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class PatientCaseCreate(BaseModel):
    # Section A: Patient Information
    mrn: str = Field(..., description="Patient Medical Record ID / Patient ID")
    operating_suite_id: str = Field(..., description="Hospital Operating Suite ID, e.g. SJMC-OR-4")
    patient_full_name: str
    age: int
    gender: str  # 'Male' | 'Female' | 'Other'
    lead_surgeon_id: str
    lead_surgeon_name: str
    scheduled_surgery_date: str
    scheduled_or_time: str

    # Section B: Procedure Details
    procedure_name: str
    procedure_code: str
    procedure_type: str
    manufacturer: str
    system_line_name: str
    surgical_priority: str = "Elective"  # 'Elective' | 'Urgent' | 'Emergency'

    # Section C: Anatomical Information & Notes
    anatomical_alignment: Optional[str] = None
    estimated_femoral_size: Optional[str] = None
    estimated_tibial_size: Optional[str] = None
    clinical_information: Optional[str] = None

class PatientCaseReviewRequest(BaseModel):
    surgeon_id: str
    surgeon_name: str
    decision: str  # 'Approved' | 'Rejected' | 'Info Requested'
    approved_candidate_id: Optional[str] = None
    comments: Optional[str] = None

class PatientCaseSchema(PatientCaseCreate):
    id: str
    case_id: str
    hospital_id: str = "HOSP-STJUDE-01"
    hospital_name: str = "St. Jude Medical Center"
    case_status: str = "Submitted"  # 'Submitted' | 'Pending Review' | 'Approved' | 'Flagged' | 'Completed'
    surgeon_review_status: str = "Pending"
    surgeon_comments: Optional[str] = None
    readiness_percentage: int = 75
    scans: List[PatientScanFileSchema] = []
    candidates: List[ImplantCandidateSchema] = []
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class CaseNotificationSchema(BaseModel):
    id: str
    hospital_id: str = "HOSP-STJUDE-01"
    recipient_role: str  # 'doctor' | 'management' | 'nurse' | 'patient' | 'all'
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    case_id: Optional[str] = None
    notification_type: str
    title: str
    message: str
    priority: str = "Normal"  # 'Normal' | 'High' | 'Critical'
    metadata: Dict[str, Any] = {}
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ChatbotMessageRequest(BaseModel):
    message: str
    user_role: str
    user_name: Optional[str] = "Hospital Management Officer"
    user_email: Optional[str] = "management@stjude-health.org"
    hospital_id: Optional[str] = "HOSP-STJUDE-01"

class ChatbotMessageResponse(BaseModel):
    reply: str
    sources_consulted: List[str] = []
    data_points: Dict[str, Any] = {}
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

