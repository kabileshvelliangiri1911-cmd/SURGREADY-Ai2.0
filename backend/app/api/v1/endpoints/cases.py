import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, status
from app.schemas.cases import (
    PatientCaseCreate,
    PatientCaseSchema,
    PatientCaseReviewRequest,
    PatientScanFileSchema,
    CaseNotificationSchema
)
from app.services.patient_case_service import patient_case_service
from app.services.implant_comparison_service import implant_comparison_service
from app.config import settings

router = APIRouter()

# Directory for secure scan uploads
SCANS_DIR = os.path.join(settings.UPLOAD_DIR, "scans")
os.makedirs(SCANS_DIR, exist_ok=True)

ALLOWED_SCAN_EXTENSIONS = {".dcm", ".dicom", ".tar", ".zip", ".nii", ".stl", ".obj", ".pdf", ".png", ".jpg", ".jpeg"}

@router.get("/", response_model=List[PatientCaseSchema])
def list_patient_cases(
    hospital_id: Optional[str] = Query(None, description="Hospital Tenant ID"),
    surgeon: Optional[str] = Query(None, description="Filter by Lead Surgeon Name")
):
    """
    List all registered patient cases with hospital isolation and surgeon filters.
    """
    return patient_case_service.get_all_cases(hospital_id=hospital_id, surgeon_name=surgeon)

@router.post("/", response_model=PatientCaseSchema, status_code=status.HTTP_201_CREATED)
def create_patient_case(payload: PatientCaseCreate):
    """
    Register a new patient surgical case with 3-section information.
    Automatically triggers AI implant candidate comparison, inventory stock check,
    and lead surgeon in-app notification.
    """
    case_dict = payload.model_dump()
    created_case = patient_case_service.create_case(case_dict)
    return created_case

@router.get("/{case_id}", response_model=PatientCaseSchema)
def get_patient_case(case_id: str):
    """
    Get detailed patient case record including uploaded scans and structured implant candidate comparison.
    """
    case = patient_case_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient case with ID '{case_id}' was not found in hospital database."
        )
    return case

@router.post("/{case_id}/scans", response_model=PatientScanFileSchema)
async def upload_case_scan(
    case_id: str,
    file: UploadFile = File(...),
    file_type: str = Form("DICOM"),
    uploaded_by: str = Form("Attending Clinical Staff")
):
    """
    Secure file upload for pre-operative imaging scans (DICOM, CT, MRI, 3D STL).
    Validates file extensions, prevents directory traversal, and records private storage metadata.
    """
    case = patient_case_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient case '{case_id}' does not exist."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_SCAN_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scan file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_SCAN_EXTENSIONS))}"
        )

    # Isolated folder per case
    case_scan_dir = os.path.join(SCANS_DIR, case_id)
    os.makedirs(case_scan_dir, exist_ok=True)

    # Sanitize filename
    safe_name = os.path.basename(file.filename)
    target_path = os.path.join(case_scan_dir, safe_name)

    content = await file.read()
    file_size_bytes = len(content)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum configured limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    with open(target_path, "wb") as f:
        f.write(content)

    formatted_size = f"{file_size_bytes / (1024 * 1024):.1f} MB" if file_size_bytes >= 1024 * 1024 else f"{file_size_bytes / 1024:.1f} KB"

    scan_meta = {
        "id": f"SCAN-{case_id}-{os.urandom(3).hex()}",
        "case_id": case_id,
        "file_name": safe_name,
        "file_type": file_type.upper(),
        "storage_path": f"uploads/scans/{case_id}/{safe_name}",
        "file_size_bytes": file_size_bytes,
        "file_size_formatted": formatted_size,
        "uploaded_by": uploaded_by,
        "uploaded_at": os.path.basename(target_path), # placeholder
        "processing_status": "Ready"
    }

    patient_case_service.add_scan_to_case(case_id, scan_meta)
    return scan_meta

@router.post("/{case_id}/compare-implants")
def trigger_implant_comparison(case_id: str):
    """
    Explicitly trigger or re-compute implant candidate comparison for an existing patient case.
    """
    case = patient_case_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient case '{case_id}' not found."
        )

    candidates, alerts = implant_comparison_service.compare_case(case)
    case["candidates"] = candidates
    for alert in alerts:
        patient_case_service._notifications.append(alert)
    patient_case_service._save_cases()
    patient_case_service._save_notifications()

    return {
        "case_id": case_id,
        "candidate_count": len(candidates),
        "candidates": candidates,
        "alerts_generated": len(alerts)
    }

@router.put("/{case_id}/review", response_model=PatientCaseSchema)
def submit_surgeon_review(case_id: str, payload: PatientCaseReviewRequest):
    """
    Attending Lead Surgeon clinical sign-off: Approve, Reject, or Request Info for candidate implant.
    Never relies solely on AI recommendation. Records surgeon identity, comments, and decision audit.
    """
    case = patient_case_service.submit_surgeon_review(case_id, payload.model_dump())
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )
    return case

@router.get("/notifications/feed", response_model=List[CaseNotificationSchema])
def get_notifications_feed(role: Optional[str] = Query(None, description="Filter notifications by user role")):
    """
    Retrieve hospital notification stream (Surgeon review alerts, low stock alerts, review completions).
    """
    return patient_case_service.get_notifications(role=role)

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    """
    Acknowledge and mark a notification as read.
    """
    success = patient_case_service.mark_notification_read(notif_id)
    return {"id": notif_id, "is_read": True, "success": success}

