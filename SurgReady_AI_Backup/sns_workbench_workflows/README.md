# SurgReady AI — SNS Agent Workbench Multi-Workflow Architecture

This directory contains the complete set of separate, interconnected workflows designed for **SNS Agent Workbench** (SNS Square / SNS iHub), mapping directly to every core feature of the **SurgReady AI** healthcare platform.

---

## 1. Architectural Overview & Workflow Mapping

```mermaid
flowchart TD
    UI1["Web App: New Procedure (/new-procedure)"] -->|POST /procedure-intake| WF1["Workflow 1: Procedure Intake (SR-WF-01-INTAKE)"]
    
    WF1 -->|Event: PROCEDURE_REGISTERED| EB[("SurgReady Event Bus (Pub/Sub)")]
    
    EB -->|Trigger| WF2["Workflow 2: AI Workbench Sizing (SR-WF-02-AI-WORKBENCH)"]
    EB -->|Trigger| WF4["Workflow 4: OR Inventory Allocation (SR-WF-04-INVENTORY)"]
    
    WF2 <-->|Sync Sub-workflow Call| WF3["Workflow 3: Manual Retrieval RAG (SR-WF-03-MANUAL-RAG)"]
    WF2 <-->|Sync Stock Query| WF4
    
    WF2 -->|Event: AI_PLAN_RECOMMENDED| EB
    WF4 -->|Event: INVENTORY_RESERVED| EB
    
    EB -->|Trigger Sizing & Stock Data| WF5["Workflow 5: Surgical Checklist (SR-WF-05-CHECKLIST)"]
    
    WF5 -->|Event: PROCEDURE_CLEARED_FOR_OR| EB
    WF4 -.->|Event: INVENTORY_SHORTAGE_DETECTED| EB
    
    EB -->|Trigger Audit Trail| WF6["Workflow 6: Reports & Audit (SR-WF-06-REPORTS)"]
    
    WF6 -->|Certified Output| PDF["Hospital Audit Records (PDF / CSV / FHIR)"]

    style WF1 fill:#EFF6FF,stroke:#2563EB,stroke-width:2px;
    style WF2 fill:#EFF6FF,stroke:#163B72,stroke-width:2px;
    style WF3 fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px;
    style WF4 fill:#EFF6FF,stroke:#F59E0B,stroke-width:2px;
    style WF5 fill:#EFF6FF,stroke:#10B981,stroke-width:2px;
    style WF6 fill:#EFF6FF,stroke:#8B5CF6,stroke-width:2px;
    style EB fill:#1E293B,stroke:#64748B,stroke-width:2px,color:#FFFFFF;
```

---

## 2. Directory Contents

| File | Purpose | Corresponding Web App Feature |
|---|---|---|
| [`workflow_01_procedure_intake.json`](./workflow_01_procedure_intake.json) | Patient demographics & 3D scan series metadata validator | **New Procedure Wizard** (`/new-procedure`) |
| [`workflow_02_ai_workbench_analysis.json`](./workflow_02_ai_workbench_analysis.json) | 3D biomechanical landmark detection & implant sizing agent | **AI Surgical Workbench** (`/ai-workbench`) |
| [`workflow_03_manual_retrieval_rag.json`](./workflow_03_manual_retrieval_rag.json) | Semantic vector RAG search over Stryker/Zimmer IFUs & manuals | **Surgical Technique Manuals** (`/manuals`) |
| [`workflow_04_inventory_allocation.json`](./workflow_04_inventory_allocation.json) | Depot stock audit, reservation locks & shortage alert router | **Surgical Inventory & Trays** (`/inventory`) |
| [`workflow_05_checklist_verification.json`](./workflow_05_checklist_verification.json) | 5-section checklist assembler, RFID matcher & dual sign-off | **Surgical Safety Checklist** (`/checklist`) |
| [`workflow_06_reports_audit.json`](./workflow_06_reports_audit.json) | Prep turnaround calculator, audit ledger & report exporter | **Analytics & Quality Reports** (`/reports`) |
| [`orchestrator_bus.js`](./orchestrator_bus.js) | Executable Node.js inter-workflow runner & event simulator | *Central Orchestrator* |
| [`orchestrator_bus.py`](./orchestrator_bus.py) | Python async event bus implementation | *Central Orchestrator* |

---

## 3. Inter-Workflow Event Life Cycle (Step-by-Step)

```mermaid
sequenceDiagram
    autonumber
    actor Nurse as OR Circulating Nurse
    participant WF1 as WF1: Procedure Intake
    participant Bus as Event Bus
    participant WF2 as WF2: AI Workbench
    participant WF3 as WF3: Manual RAG
    participant WF4 as WF4: Inventory
    participant WF5 as WF5: Checklist
    participant WF6 as WF6: Reports

    Nurse->>WF1: Submit Patient & Helical CT Scan
    WF1->>WF1: Validate Demographics & DICOM Metadata
    WF1->>Bus: Publish 'PROCEDURE_REGISTERED'
    
    par Asynchronous Fan-Out
        Bus->>WF2: Trigger 3D Biomechanical Sizing
        Bus->>WF4: Trigger Preliminary Tray Check
    end

    WF2->>WF3: Synchronous RAG Call: Query Bushing & Resection Angles
    WF3-->>WF2: Return Stryker Triathlon Section 4.2 Citations
    WF2->>WF4: Synchronous Stock Call: Check Size 5 Femur + Size 4 Tibia
    WF4-->>WF2: Confirm Available (OR Bin A-14 & A-16)
    
    WF4->>Bus: Publish 'INVENTORY_RESERVED' (Lot & Location Locked)
    WF2->>Bus: Publish 'AI_PLAN_RECOMMENDED'
    
    Bus->>WF5: Trigger 5-Section Checklist Assembly
    WF5->>WF5: Populate Instruments, Implants, Sterilizer Specs
    WF5->>WF5: Verify RFID Barcode Scans
    Nurse->>WF5: Attending Surgeon & Nurse Dual Sign-Off
    WF5->>Bus: Publish 'PROCEDURE_CLEARED_FOR_OR'
    
    Bus->>WF6: Trigger Quality & Audit Telemetry
    WF6->>WF6: Log 18.2 min Turnaround & SHA-256 Audit Record
    WF6-->>Nurse: Certified Surgical Readiness Report Cleared
```

---

## 4. How to Import into SNS Agent Workbench

1. **Log in** to your SNS Agent Workbench workspace.
2. In the **Workflows** navigation pane, click **Create New Workflow** or **Import Blueprint**.
3. Select **Import JSON** and choose each workflow definition file (`workflow_01_procedure_intake.json` through `workflow_06_reports_audit.json`).
4. **Configure Endpoints**:
   - In **Workflow 1**, configure the Webhook Trigger to match your deployment domain (`/api/v1/workflows/procedure-intake`).
   - In **Workflow 3**, connect your vector knowledge collection containing PDF copies of Stryker, Zimmer Biomet, and Medtronic technique manuals.
5. **Verify Inter-Workflow Links**:
   - Confirm that the `node_publish_event` nodes publish to the named topic, and downstream workflows have matching event listener triggers.

---

## 5. Running the Local Multi-Workflow Interaction Simulator

To see all 6 workflows interact in real-time on your local machine:

```powershell
node sns_workbench_workflows/orchestrator_bus.js
```

This will run an end-to-end simulated case intake, trigger 3D landmark analysis, query the RAG manual database, lock inventory reservations, assemble the 5-section checklist, execute the dual clinical sign-off, and commit the quality audit record.
