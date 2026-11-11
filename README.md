# SurgReady AI - Smart Surgical Preparation. Simplified.

An enterprise-grade, modern healthcare frontend application designed for hospital operating room teams to prepare surgical procedures, analyze 3D anatomical imaging scans, cross-reference manufacturer surgical manuals, audit implant inventory, and conduct pre-op safety sign-offs.

---

## 🎨 Theme & Design System
SurgReady AI is styled strictly according to the **Blue + White Healthcare Design System**:
- **Primary Blue**: `#2563EB` (Action buttons, active highlights, key accents)
- **Dark Navy**: `#163B72` (Brand headers, headings, primary contrast)
- **Light Blue**: `#EFF6FF` (Card highlights, active navigation backgrounds)
- **White**: `#FFFFFF` (Card surfaces, clean modals)
- **Background**: `#F8FAFC` (High-readability ergonomic neutral canvas)
- **Text**: `#1E293B` (Clinical typography)
- **Status Indicators**:
  - Success: `#16A34A` (Verified, sterile, completed)
  - Warning: `#F59E0B` (Low stock, pending review)
  - Error: `#DC2626` (Critical shortage, mandatory item alert)

---

## 🚀 Key Modules & Pages

1. **Login & Registration Pages (`/login`, `/register`)**
   - Clean split-screen layout with medical SVG illustration and trust badges.
   - Show/hide password toggles, remember me, and forgot password recovery.
   - One-click demo personas: Attending Surgeon (Dr. Jenkins), Surgical Technologist (Marcus Vance), OR Nurse (Elena Rostova).
   - Clear disclaimer: Demo Authentication (ready for SAML 2.0 / Hospital SSO).

2. **Main Dashboard (`/dashboard`)**
   - Collapsible desktop sidebar + mobile drawer.
   - Top navigation with real-time case search, notification center, help guide, and profile switcher.
   - Welcome banner: "Manage your surgical preparation workflow from one place."
   - 4 Live Statistics Cards: Total Procedures (248), Pending Preparations (7), Inventory Availability (96.4%), Generated Checklists (182).
   - Interactive Procedure Status Flow & Specialty distribution charts.
   - Quick action cards with one-click routing.
   - Recent Procedures table with search, filter tabs, modal preview, and deep links.
   - Live activity audit stream.

3. **New Procedure Preparation Wizard (`/new-procedure`)**
   - Step 1: Patient Information (MRN, Suite, Name, Age, Gender, Lead Surgeon, Scheduled Time).
   - Step 2: Procedure Details (Name, CPT/ICD code, Specialty, Manufacturer, Priority).
   - Step 3: Anatomical Information & Scan Upload (Varus/Valgus alignment, component sizing, drag-and-drop DICOM/CT scan package, pre-filled presets).
   - Step 4: Clinical Review & Launch Confirmation Dialog.

4. **AI Surgical Workbench (`/ai-workbench`)**
   - Active procedure selector bar.
   - Interactive 3D Scan Inspector (Coronal, Axial, Sagittal planes, slice slider 1–512, zoom, window level, and anatomical landmark overlays: Whiteside's Line, TEA, Mechanical Axis, 6.5° Varus angle).
   - AI Analysis Status (Confidence score 98.4%, Latency 1.42s, v2.4 Engine).
   - Implant Recommendations (Primary & standby sizes, clearance margins, stock location).
   - Instrument Requirements (Sterile cutting blocks, 4-in-1 jigs, power tools).
   - Surgical Manual References (Direct page citations to Stryker/Zimmer guides).
   - Evidence & FDA 510(k) citations.
   - Prominent Qualified Clinical Review Required safety banner.

5. **Surgical Technique Manuals (`/manuals`)**
   - Comprehensive repository for Stryker, Zimmer Biomet, DePuy Synthes, Medtronic, and Smith & Nephew.
   - Real-time search and dual filters by Manufacturer and Clinical Specialty.
   - Interactive Document Reader Modal with Table of Contents and in-document search.
   - Upload Surgical Manual Modal with AI auto-indexing toggle.

6. **Surgical Inventory & Trays (`/inventory`)**
   - Audit tracking with SKU, Category, Manufacturer, Available vs Required units, Lot numbers, and Expiry dates.
   - Low stock warning banner with 1-click auto-restock buffer.
   - Interactive Stock Evolution graph.
   - Add Inventory Item modal & Edit Stock quantity modal.
   - CSV export for hospital supply chain.

7. **Surgical Safety Checklist (`/checklist`)**
   - Contextual switcher between scheduled cases.
   - Pre-Op Readiness gauge & progress bar.
   - 5 Structured Sections:
     1. Required Instruments
     2. Implant Checklist
     3. Sterilization Requirements (Biological & Class 5 Chemical Integrators)
     4. Tool Tray Requirements
     5. Inventory & RFID Barcode Verification
   - Dual Electronic Sign-Off: Attending Surgeon + Circulating Nurse.
   - Formatted Print (`window.print()` with clean print CSS) & CSV Export.

8. **Analytics & Audit Reports (`/reports`)**
   - Quality metrics: Preparation throughput, checklist compliance, average turnaround time.
   - Weekly volume bar chart & clinical service category distribution.
   - Historical audit log table with date filters.
   - Multi-format report export (PDF, CSV, JSON).

9. **Settings & Facility Preferences (`/settings`)**
   - Clinician Profile, Hospital Information (Trauma Level, OR Suites count).
   - Account Security (2FA toggle, password update, workstation timeout).
   - Granular Notification Preferences.
   - Application Display (Metric/Imperial units, default OEM filter, demo reset).

---

## 🛠️ How to Run

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```
Default URL: `http://localhost:5173`

---

## 🔗 Backend Integration Architecture (FastAPI & AI Agent Workflows)
Frontend is architected with clean service abstractions ready for future backend integration:
- `src/services/storageService.js` ➡️ Replace localStorage calls with Axios/Fetch REST API clients.
- `FastAPI Endpoints`:
  - `POST /api/v1/procedures/` (Procedure ingestion & DICOM upload)
  - `GET /api/v1/procedures/{id}/workbench` (AI 3D landmark & sizing telemetry)
  - `GET /api/v1/manuals/` (Vector similarity search over OEM surgical manuals)
  - `GET /api/v1/inventory/` (Hospital ERP / RFID supply chain reconciliation)
  - `POST /api/v1/checklists/{id}/signoff` (Cryptographic digital signature verification)

