import logging
import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.implant_comparison_service import implant_comparison_service
from app.services.sns_patient_webhook_service import sns_patient_webhook_service

logger = logging.getLogger("surgready.patient_case_service")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CASES_FILE = os.path.join(DATA_DIR, "patient_cases.json")
NOTIFS_FILE = os.path.join(DATA_DIR, "case_notifications.json")

os.makedirs(DATA_DIR, exist_ok=True)

# Initial Seed Cases
INITIAL_CASES: List[Dict[str, Any]] = [
    {
        "id": "CASE-2026-0841",
        "case_id": "SR-2026-0841",
        "hospital_id": "HOSP-STJUDE-01",
        "hospital_name": "St. Jude Medical Center",
        "mrn": "PT-88219",
        "operating_suite_id": "SJMC-OR-4",
        "patient_full_name": "Robert Miller",
        "age": 64,
        "gender": "Male",
        "lead_surgeon_id": "usr_doc_01",
        "lead_surgeon_name": "Dr. Sarah Jenkins",
        "scheduled_surgery_date": "2026-11-12",
        "scheduled_or_time": "07:30 AM",
        "procedure_name": "Left Total Knee Arthroplasty (TKA)",
        "procedure_code": "CPT 27447",
        "procedure_type": "Orthopedic Joint Replacement",
        "manufacturer": "Stryker",
        "system_line_name": "Triathlon Knee System",
        "surgical_priority": "Elective",
        "anatomical_alignment": "6.5° Varus Deformity",
        "estimated_femoral_size": "Size 5 (Right)",
        "estimated_tibial_size": "Size 4 Universal Baseplate",
        "clinical_information": "Prior arthroscopy 2021. Moderate varus deformity (6.5°). Medial joint line reduction. Preserved cruciate ligaments.",
        "case_status": "Pending Review",
        "surgeon_review_status": "Pending",
        "surgeon_comments": None,
        "readiness_percentage": 84,
        "scans": [
            {
                "id": "SCAN-01",
                "case_id": "SR-2026-0841",
                "file_name": "Helical_CT_Knee_Coronal_3D.dicom",
                "file_type": "DICOM",
                "storage_path": "uploads/scans/SR-2026-0841/Helical_CT_Knee_Coronal_3D.dicom",
                "file_size_bytes": 48200000,
                "file_size_formatted": "48.2 MB",
                "uploaded_by": "Dr. Sarah Jenkins",
                "uploaded_at": "2026-10-28T14:20:00Z",
                "processing_status": "Ready"
            }
        ],
        "candidates": [],
        "created_by": "Dr. Sarah Jenkins",
        "created_at": "2026-10-28T14:00:00Z",
        "updated_at": "2026-11-10T09:30:00Z"
    },
    {
        "id": "CASE-2026-0839",
        "case_id": "SR-2026-0839",
        "hospital_id": "HOSP-STJUDE-01",
        "hospital_name": "St. Jude Medical Center",
        "mrn": "PT-90142",
        "operating_suite_id": "SJMC-OR-2",
        "patient_full_name": "Eleanor Vance",
        "age": 71,
        "gender": "Female",
        "lead_surgeon_id": "usr_doc_02",
        "lead_surgeon_name": "Dr. Arthur Chen",
        "scheduled_surgery_date": "2026-11-13",
        "scheduled_or_time": "09:00 AM",
        "procedure_name": "Right Anterior Total Hip Arthroplasty",
        "procedure_code": "CPT 27130",
        "procedure_type": "Orthopedic Joint Replacement",
        "manufacturer": "Zimmer Biomet",
        "system_line_name": "Persona / G7 Acetabular System",
        "surgical_priority": "Urgent",
        "anatomical_alignment": "Leg length discrepancy -6mm",
        "estimated_femoral_size": "Stem Size 12 High Offset",
        "estimated_tibial_size": "Cup 52 mm",
        "clinical_information": "Severe avascular necrosis right femoral head. Osteopenic bone stock requiring porous coating.",
        "case_status": "Submitted",
        "surgeon_review_status": "Pending",
        "surgeon_comments": None,
        "readiness_percentage": 62,
        "scans": [
            {
                "id": "SCAN-02",
                "case_id": "SR-2026-0839",
                "file_name": "Pelvis_Bilateral_CT_Angio.tar",
                "file_type": "CT",
                "storage_path": "uploads/scans/SR-2026-0839/Pelvis_Bilateral_CT_Angio.tar",
                "file_size_bytes": 62400000,
                "file_size_formatted": "62.4 MB",
                "uploaded_by": "Dr. Arthur Chen",
                "uploaded_at": "2026-11-02T10:15:00Z",
                "processing_status": "Ready"
            }
        ],
        "candidates": [],
        "created_by": "Dr. Arthur Chen",
        "created_at": "2026-11-02T10:00:00Z",
        "updated_at": "2026-11-09T11:00:00Z"
    }
]

class PatientCaseService:
    def __init__(self):
        self._cases: Dict[str, Dict[str, Any]] = {}
        self._notifications: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        if os.path.exists(CASES_FILE):
            try:
                with open(CASES_FILE, "r") as f:
                    data = json.load(f)
                    self._cases = {c["case_id"]: c for c in data}
            except Exception as e:
                logger.error(f"Error loading cases file: {e}")
                self._seed_initial()
        else:
            self._seed_initial()

        if os.path.exists(NOTIFS_FILE):
            try:
                with open(NOTIFS_FILE, "r") as f:
                    self._notifications = json.load(f)
            except Exception as e:
                logger.error(f"Error loading notifications file: {e}")
                self._notifications = []
        else:
            self._notifications = []

    def _seed_initial(self):
        self._cases = {c["case_id"]: c for c in INITIAL_CASES}
        # Precompute candidate comparisons for initial cases
        for case in self._cases.values():
            if not case.get("candidates"):
                candidates, alerts = implant_comparison_service.compare_case(case)
                case["candidates"] = candidates
                for a in alerts:
                    self._notifications.append(a)
        self._save_cases()

    def _save_cases(self):
        try:
            with open(CASES_FILE, "w") as f:
                json.dump(list(self._cases.values()), f, indent=2)
        except Exception as e:
            logger.error(f"Error saving cases file: {e}")

    def _save_notifications(self):
        try:
            with open(NOTIFS_FILE, "w") as f:
                json.dump(self._notifications, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving notifications file: {e}")

    def get_all_cases(self, hospital_id: Optional[str] = None, surgeon_name: Optional[str] = None) -> List[Dict[str, Any]]:
        cases = list(self._cases.values())
        if hospital_id:
            cases = [c for c in cases if c.get("hospital_id") == hospital_id]
        if surgeon_name:
            s_clean = surgeon_name.lower()
            cases = [c for c in cases if s_clean in (c.get("lead_surgeon_name") or "").lower()]
        return sorted(cases, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        return self._cases.get(case_id)

    def create_case(self, case_data: Dict[str, Any], created_by: Optional[str] = None) -> Dict[str, Any]:
        # Generate Unique Case ID
        seq_num = len(self._cases) + 842
        case_id = f"SR-2026-0{seq_num}"

        case_record = {
            **case_data,
            "id": f"CASE-2026-0{seq_num}",
            "case_id": case_id,
            "hospital_id": case_data.get("hospital_id") or "HOSP-STJUDE-01",
            "hospital_name": "St. Jude Medical Center",
            "case_status": "Pending Review",
            "surgeon_review_status": "Pending",
            "surgeon_comments": None,
            "readiness_percentage": 70,
            "scans": case_data.get("scans") or [],
            "candidates": [],
            "created_by": created_by or case_data.get("lead_surgeon_name"),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Step 1: Run AI Implant Candidate Comparison
        candidates, inventory_alerts = implant_comparison_service.compare_case(case_record)
        case_record["candidates"] = candidates

        # Step 2: Store Inventory Alerts in Notifications
        for alert in inventory_alerts:
            self._notifications.append(alert)

        # Step 3: Automatically Notify Assigned Lead Surgeon
        exact_matches = [c["implant_name"] for c in candidates if c["comparison_status"] == "Exact Match"]
        match_summary = f"{len(exact_matches)} Exact Matches found" if exact_matches else "Candidates require clinical review"
        surgeon_notif = {
            "id": f"NOTIF-SURG-{case_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "hospital_id": case_record["hospital_id"],
            "recipient_role": "doctor",
            "recipient_name": case_record["lead_surgeon_name"],
            "case_id": case_id,
            "notification_type": "SURGEON_REVIEW_REQUIRED",
            "title": f"Surgeon Review Required: Case {case_id}",
            "message": f"Pre-operative case registered for {case_record['patient_full_name']} (MRN: {case_record['mrn']}). Procedure: {case_record['procedure_name']} scheduled for {case_record['scheduled_surgery_date']} at {case_record['scheduled_or_time']}. AI implant comparison ready: {match_summary}.",
            "priority": "High",
            "metadata": {
                "mrn": case_record["mrn"],
                "procedure_name": case_record["procedure_name"],
                "surgery_date": case_record["scheduled_surgery_date"],
                "candidate_count": len(candidates),
                "review_status": "Pending"
            },
            "is_read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        self._notifications.append(surgeon_notif)

        self._cases[case_id] = case_record
        self._save_cases()
        self._save_notifications()

        # Non-blocking async event bus notification to SNS Workbench
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(sns_patient_webhook_service.dispatch_patient_event("PATIENT_CASE_CREATED", case_record))
                loop.create_task(sns_patient_webhook_service.dispatch_patient_event("SURGEON_REVIEW_REQUIRED", {
                    **case_record,
                    "candidate_count": len(candidates)
                }))
        except Exception as e:
            logger.debug(f"Event dispatch notice: {e}")

        logger.info(f"[PatientCaseService] Successfully created case {case_id} with {len(candidates)} candidates and surgeon notification.")
        return case_record

    def submit_surgeon_review(self, case_id: str, review_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        case = self._cases.get(case_id)
        if not case:
            return None

        decision = review_data.get("decision", "Approved")
        approved_candidate_id = review_data.get("approved_candidate_id")
        comments = review_data.get("comments")
        surgeon_name = review_data.get("surgeon_name") or case.get("lead_surgeon_name")

        case["surgeon_review_status"] = decision
        case["case_status"] = "Approved" if decision == "Approved" else "Flagged" if decision == "Rejected" else "Pending Review"
        case["surgeon_comments"] = comments
        case["updated_at"] = datetime.utcnow().isoformat()

        # Update Candidate records
        for candidate in case.get("candidates", []):
            if approved_candidate_id and (candidate["id"] == approved_candidate_id or candidate.get("implant_id") == approved_candidate_id):
                candidate["surgeon_decision"] = decision
                candidate["surgeon_comments"] = comments
                candidate["reviewed_by"] = surgeon_name
                candidate["reviewed_at"] = datetime.utcnow().isoformat()
            elif approved_candidate_id:
                candidate["surgeon_decision"] = "Rejected" if decision == "Approved" else candidate["surgeon_decision"]

        # Create Management Notification that review was completed
        mgmt_notif = {
            "id": f"NOTIF-REV-{case_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "hospital_id": case.get("hospital_id", "HOSP-STJUDE-01"),
            "recipient_role": "management",
            "recipient_name": "Hospital Management",
            "case_id": case_id,
            "notification_type": "SURGEON_REVIEW_COMPLETED",
            "title": f"Surgeon Review {decision}: Case {case_id}",
            "message": f"{surgeon_name} has completed clinical review for case {case_id} ({case['procedure_name']}). Decision: {decision}. Comments: '{comments or 'No additional notes'}'.",
            "priority": "Normal",
            "metadata": {
                "case_id": case_id,
                "surgeon": surgeon_name,
                "decision": decision
            },
            "is_read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        self._notifications.append(mgmt_notif)

        self._save_cases()
        self._save_notifications()

        # Non-blocking async event bus notification to SNS Workbench
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(sns_patient_webhook_service.dispatch_patient_event("SURGEON_REVIEW_COMPLETED", {
                    "case_id": case_id,
                    "procedure_name": case.get("procedure_name"),
                    "surgeon": surgeon_name,
                    "decision": decision
                }))
        except Exception as e:
            logger.debug(f"Event dispatch notice: {e}")

        return case

    def add_scan_to_case(self, case_id: str, scan_meta: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        case = self._cases.get(case_id)
        if not case:
            return None

        if "scans" not in case:
            case["scans"] = []

        case["scans"].append(scan_meta)
        case["updated_at"] = datetime.utcnow().isoformat()
        self._save_cases()
        return scan_meta

    def get_notifications(self, role: Optional[str] = None) -> List[Dict[str, Any]]:
        notifs = self._notifications
        if role:
            r_clean = role.lower()
            notifs = [n for n in notifs if n.get("recipient_role") == r_clean or n.get("recipient_role") == "all"]
        return sorted(notifs, key=lambda x: x.get("created_at", ""), reverse=True)

    def mark_notification_read(self, notif_id: str) -> bool:
        for n in self._notifications:
            if n["id"] == notif_id:
                n["is_read"] = True
                self._save_notifications()
                return True
        return False

patient_case_service = PatientCaseService()
