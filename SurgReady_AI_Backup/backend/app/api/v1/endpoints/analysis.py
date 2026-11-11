import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException, status
from app.schemas.analysis import (
    DocumentAnalysisRequest,
    DocumentAnalysisResponse
)
from app.services.file_validator import file_validator
from app.services.sns_webhook_service import sns_webhook_service
from app.core.sample_data import SAMPLE_ANALYSIS_DATABASE

router = APIRouter()

# In-memory registry for extracted documents
PROCESSED_DOCUMENTS_CACHE = {}

@router.post(
    "/documents/analyze",
    response_model=DocumentAnalysisResponse,
    summary="Analyze Surgical Document via SNS AI Agent Workbench Webhook"
)
async def analyze_document_json(request: DocumentAnalysisRequest):
    """
    Analyzes surgical document information by dispatching metadata and content
    to the configured SNS AI Agent Workbench webhook asynchronously.
    """
    case_id = request.case_id or f"SR-2026-{uuid.uuid4().hex[:4].upper()}"

    payload = {
        "case_id": case_id,
        "procedure_name": request.procedure_name,
        "procedure_code": request.procedure_code,
        "manufacturer": request.manufacturer,
        "system_name": request.system_name,
        "clinical_notes": request.clinical_notes,
        "document_name": request.document_name,
        "document_content": request.document_content,
        "parameters": request.parameters or {}
    }

    result = await sns_webhook_service.dispatch_analysis(payload_data=payload)

    response = DocumentAnalysisResponse(
        success=result.get("success", False),
        status=result.get("status", "UNKNOWN"),
        case_id=case_id,
        procedure_name=request.procedure_name,
        manufacturer=request.manufacturer,
        webhook_status_code=result.get("webhook_status_code"),
        execution_time_ms=result.get("execution_time_ms"),
        extracted_data=result.get("extracted_data"),
        raw_webhook_response=result.get("raw_webhook_response"),
        error_detail=result.get("error_detail")
    )

    PROCESSED_DOCUMENTS_CACHE[case_id] = response.model_dump()
    return response


@router.post(
    "/documents/upload-and-analyze",
    response_model=DocumentAnalysisResponse,
    summary="Upload Synthetic File & Dispatch to Webhook"
)
async def upload_and_analyze_document(
    file: UploadFile = File(..., description="Uploaded synthetic surgical document or scan metadata"),
    procedure_name: str = Form("Total Knee Arthroplasty (TKA)"),
    procedure_code: str = Form("CPT 27447"),
    manufacturer: str = Form("Stryker"),
    clinical_notes: Optional[str] = Form(None)
):
    """
    Uploads a synthetic surgical document or scan, validates safe extension and size,
    and forwards the file / metadata to the SNS AI Agent Workbench webhook.
    """
    # Safe validation and writing to uploads folder
    safe_name, destination_path, file_size = await file_validator.validate_and_save(file)
    case_id = f"SR-2026-{uuid.uuid4().hex[:4].upper()}"

    payload = {
        "case_id": case_id,
        "procedure_name": procedure_name,
        "procedure_code": procedure_code,
        "manufacturer": manufacturer,
        "clinical_notes": clinical_notes,
        "document_name": safe_name,
        "file_size_bytes": file_size
    }

    result = await sns_webhook_service.dispatch_analysis(
        payload_data=payload,
        file_path=destination_path
    )

    response = DocumentAnalysisResponse(
        success=result.get("success", False),
        status=result.get("status", "UNKNOWN"),
        case_id=case_id,
        procedure_name=procedure_name,
        manufacturer=manufacturer,
        webhook_status_code=result.get("webhook_status_code"),
        execution_time_ms=result.get("execution_time_ms"),
        extracted_data=result.get("extracted_data"),
        raw_webhook_response=result.get("raw_webhook_response"),
        error_detail=result.get("error_detail")
    )

    PROCESSED_DOCUMENTS_CACHE[case_id] = response.model_dump()
    return response


@router.get(
    "/documents/{document_id}/extracted-info",
    summary="Retrieve Extracted Surgical Information"
)
async def get_extracted_info(document_id: str):
    """
    Returns previously extracted surgical data for a given document or case ID.
    If not in live memory cache, returns matching clinical baseline demo data.
    """
    if document_id in PROCESSED_DOCUMENTS_CACHE:
        return PROCESSED_DOCUMENTS_CACHE[document_id]

    # Check sample database
    sample = SAMPLE_ANALYSIS_DATABASE.get(document_id) or SAMPLE_ANALYSIS_DATABASE.get("SAMPLE-STRYKER-TKA")
    return {
        "success": True,
        "document_id": document_id,
        "source": "CLINICAL_SAMPLE_DATABASE",
        "data": sample
    }

