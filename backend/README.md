# SurgReady AI — FastAPI Backend & SNS AI Agent Workbench Webhook Integration

This directory contains the Python FastAPI backend for **SurgReady AI**, providing secure document analysis, file validation, and integration with the **SNS AI Agent Workbench webhook**.

---

## 🔒 Security & Privacy Guarantees

1. **Zero Credential Exposure**: The webhook endpoint (`https://api.agents.snsihub.ai/webhook/...`) and any authentication tokens are stored exclusively in `backend/.env`. They are never passed to or exposed in the React frontend code.
2. **Flexible & Non-Assuming Integration**: The webhook client does not assume rigid JSON schemas, authentication mechanisms, or HTTP methods. It adapts dynamically to any webhook response format or status code.
3. **No Real Patient Data**: Default testing uses synthetic clinical mock profiles (e.g. Robert Miller, Total Knee Arthroplasty, Stryker Triathlon).
4. **Safe File Handling**: Uploaded files are checked against an extension whitelist (`.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.dcm`), sanitized to prevent directory traversal (`../`), and restricted by a maximum file size limit (25 MB).

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   ├── health.py          # GET /api/v1/health
│   │   │   └── analysis.py        # POST /api/v1/documents/analyze
│   │   └── router.py              # Aggregated v1 API router
│   ├── core/
│   │   └── sample_data.py         # Clinical baseline data for initial testing
│   ├── schemas/
│   │   └── analysis.py            # Pydantic request & response models
│   ├── services/
│   │   ├── file_validator.py      # Safe file upload and sanitization
│   │   └── sns_webhook_service.py # Secure SNS Workbench Webhook Client
│   ├── config.py                  # Pydantic Settings configuration
│   └── main.py                    # FastAPI application & CORS configuration
├── uploads/                       # Local directory for temporary synthetic files
├── requirements.txt               # Dependencies
├── .env                           # Server-side environment variables (contains webhook URL)
├── .env.example                   # Template configuration file
└── README.md
```

---

## 🚀 How to Run the Backend

### 1. Create and Activate Virtual Environment (Recommended)

```powershell
# Navigate to the backend folder
cd "c:\Users\Kabilesh\surgReady ai\backend"

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Verify Environment File (`.env`)

The `.env` file is pre-configured with your webhook URL:
```env
SNS_WORKBENCH_WEBHOOK_URL="https://api.agents.snsihub.ai/webhook/2040abd9-b11a-459b-82eb-e4084ce0ab6d"
SNS_WORKBENCH_HTTP_METHOD="POST"
SNS_WORKBENCH_TIMEOUT_SECONDS=60
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
```

### 4. Launch the FastAPI Server

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌐 API Documentation & Testing

Once running, access the interactive OpenAPI documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### Test Analysis via `curl` (JSON Payload):

```powershell
curl.exe -X POST "http://localhost:8000/api/v1/documents/analyze" `
  -H "Content-Type: application/json" `
  -d '{
    "procedure_name": "Left Total Knee Arthroplasty (TKA)",
    "procedure_code": "CPT 27447",
    "manufacturer": "Stryker",
    "clinical_notes": "Synthetic case: 6.5 degree varus deformity, moderate medial compartment narrowing."
  }'
```

### Test Analysis via `curl` (File Upload):

```powershell
curl.exe -X POST "http://localhost:8000/api/v1/documents/upload-and-analyze" `
  -F "file=@sample_scan.txt" `
  -F "procedure_name=Total Knee Arthroplasty" `
  -F "manufacturer=Stryker"
```

