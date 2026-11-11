import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
  Cpu,
  Boxes,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  RefreshCw,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';

export const SNSWorkflowMonitorModal = ({ isOpen, onClose }) => {
  const toast = useToast();

  const [activeStep, setActiveStep] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'logs' | 'blueprints'

  const workflows = [
    {
      id: 'SR-WF-01-INTAKE',
      num: 1,
      name: 'Procedure Intake',
      desc: 'Demographic validation & DICOM series ingestion',
      icon: Layers,
      color: 'border-blue-300 bg-blue-50/70 text-brand-primary',
      activeColor: 'ring-2 ring-brand-primary bg-blue-100',
      eventOut: 'PROCEDURE_REGISTERED'
    },
    {
      id: 'SR-WF-02-AI-WORKBENCH',
      num: 2,
      name: 'AI 3D Sizing Engine',
      desc: 'Landmark detection, resection calculation & sizing',
      icon: Cpu,
      color: 'border-indigo-300 bg-indigo-50/70 text-indigo-700',
      activeColor: 'ring-2 ring-indigo-600 bg-indigo-100',
      eventOut: 'AI_PLAN_RECOMMENDED'
    },
    {
      id: 'SR-WF-03-MANUAL-RAG',
      num: 3,
      name: 'Manual Retrieval RAG',
      desc: 'OEM technique protocol & sterilization extraction',
      icon: BookOpen,
      color: 'border-sky-300 bg-sky-50/70 text-sky-700',
      activeColor: 'ring-2 ring-sky-600 bg-sky-100',
      eventOut: 'MANUAL_CITATIONS_RETURNED'
    },
    {
      id: 'SR-WF-04-INVENTORY',
      num: 4,
      name: 'Inventory & Tray Allocator',
      desc: 'Depot stock verification & lot reservation locks',
      icon: Boxes,
      color: 'border-amber-300 bg-amber-50/70 text-amber-700',
      activeColor: 'ring-2 ring-amber-600 bg-amber-100',
      eventOut: 'INVENTORY_RESERVED'
    },
    {
      id: 'SR-WF-05-CHECKLIST',
      num: 5,
      name: 'Checklist Verification',
      desc: '5-section assembly, RFID scans & dual sign-off',
      icon: ClipboardCheck,
      color: 'border-emerald-300 bg-emerald-50/70 text-emerald-700',
      activeColor: 'ring-2 ring-emerald-600 bg-emerald-100',
      eventOut: 'PROCEDURE_CLEARED_FOR_OR'
    },
    {
      id: 'SR-WF-06-REPORTS',
      num: 6,
      name: 'Reports & Quality Audit',
      desc: 'Turnaround metric (18.2m) & SHA-256 audit ledger',
      icon: BarChart3,
      color: 'border-purple-300 bg-purple-50/70 text-purple-700',
      activeColor: 'ring-2 ring-purple-600 bg-purple-100',
      eventOut: 'AUDIT_COMMITTED'
    }
  ];

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, text, type }]);
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setLogs([]);
    setActiveStep(1);

    addLog('🚀 Initializing SurgReadyEventBus & registering 6 SNS Agent Workflows...', 'info');
    await new Promise((r) => setTimeout(r, 600));

    // Step 1: Intake
    addLog('[SR-WF-01-INTAKE] Ingested Case SR-2026-0841 (Robert Miller • TKA)', 'success');
    addLog('[EVENT BUS] 🔔 Emitted \'PROCEDURE_REGISTERED\' ➡️ Fan-out to WF2 & WF4', 'bus');
    setActiveStep(2);
    await new Promise((r) => setTimeout(r, 700));

    // Step 2 & 3: AI Workbench & Manual RAG
    addLog('[SR-WF-02-AI-WORKBENCH] Ingested Helical CT (512 slices). Detected 6.5° Varus alignment.', 'info');
    setActiveStep(3);
    addLog('[SR-WF-02-AI-WORKBENCH] Calling SR-WF-03-MANUAL-RAG for Stryker Triathlon valgus bushing spec...', 'info');
    await new Promise((r) => setTimeout(r, 600));
    addLog('[SR-WF-03-MANUAL-RAG] Retrieved Section 4.2 (Page 18): 6° Valgus Bushing Recommended', 'success');

    // Step 4: Inventory
    setActiveStep(4);
    addLog('[SR-WF-04-INVENTORY] Querying OR Depot for Size 5 Femur + Size 4 Tibia...', 'info');
    await new Promise((r) => setTimeout(r, 600));
    addLog('[SR-WF-04-INVENTORY] Reserved Lot LOT-98214-E (Bin A-14) & LOT-94412-B (Bin A-16)', 'success');
    addLog('[EVENT BUS] 🔔 Emitted \'INVENTORY_RESERVED\' & \'AI_PLAN_RECOMMENDED\'', 'bus');

    // Step 5: Checklist
    setActiveStep(5);
    addLog('[SR-WF-05-CHECKLIST] Assembled 5-section interactive checklist.', 'info');
    await new Promise((r) => setTimeout(r, 700));
    addLog('[SR-WF-05-CHECKLIST] RFID scans matched 100%. Dual sign-offs verified (Dr. Jenkins MD + E. Rostova RN).', 'success');
    addLog('[EVENT BUS] 🔔 Emitted \'PROCEDURE_CLEARED_FOR_OR\'', 'bus');

    // Step 6: Reports
    setActiveStep(6);
    addLog('[SR-WF-06-REPORTS] Turnaround calculated: 18.2 min (48% faster than benchmark).', 'info');
    await new Promise((r) => setTimeout(r, 600));
    addLog('[SR-WF-06-REPORTS] ✅ SHA-256 Audit Ledger committed (AUDIT-4IZXG1). Case Ready for Incision!', 'success');

    setActiveStep('complete');
    setIsRunning(false);
    toast.success('SNS Agent Workbench multi-workflow pipeline executed successfully!');
  };

  const handleDownloadBlueprint = (wfId) => {
    toast.info(`Downloading SNS Workbench JSON Blueprint: ${wfId}.json`);
    const jsonStr = JSON.stringify({ workflow_id: wfId, platform: 'SNS Agent Workbench', version: '1.0.0' }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wfId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SNS Agent Workbench • Multi-Workflow Orchestrator"
      subtitle="Visualizing 6 interconnected autonomous workflows powering SurgReady AI"
      maxWidth="max-w-5xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Event Bus Active • 6 Registered Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Monitor
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunSimulation}
              disabled={isRunning}
              leftIcon={isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isRunning ? 'Executing Pipeline...' : 'Run End-to-End Simulation'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'diagram'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Interactive Node Canvas
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Event Bus Telemetry ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('blueprints')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'blueprints'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              JSON Blueprints (6)
            </button>
          </div>

          <Badge variant="navy" size="sm">
            SNS Square / iHub Compatible
          </Badge>
        </div>

        {/* TAB 1: VISUAL INTERACTION NODE CANVAS */}
        {activeTab === 'diagram' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-brand-navy flex items-center justify-between">
              <span>
                <strong>Inter-Workflow Architecture:</strong> Workflows communicate via Pub/Sub events and typed sub-workflow calls using Case ID correlation.
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Sanitized
              </span>
            </div>

            {/* Visual Workflow Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {workflows.map((wf) => {
                const Icon = wf.icon;
                const isCurrentlyActive = activeStep === wf.num;
                const isCompleted = activeStep === 'complete' || (typeof activeStep === 'number' && activeStep > wf.num);

                return (
                  <div
                    key={wf.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                      isCurrentlyActive
                        ? `${wf.activeColor} shadow-md scale-[1.02]`
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : `${wf.color} hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                          <Icon className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block font-bold">WF-0{wf.num}</span>
                          <h5 className="font-bold text-xs text-brand-navy leading-tight">{wf.name}</h5>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : isCurrentlyActive ? (
                        <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs animate-spin">
                          <RefreshCw className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">IDLE</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug mb-3">
                      {wf.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">Emits:</span>
                      <span className="font-mono font-bold text-brand-primary bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[170px]">
                        {wf.eventOut}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE TELEMETRY LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-200 min-h-[360px] max-h-[420px] overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
            <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800 flex justify-between">
              <span>SurgReadyEventBus • Real-time Event Transmission Log</span>
              <span>Buffer: {logs.length} events</span>
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Terminal className="w-8 h-8 mb-2 opacity-50" />
                <p>No active execution events yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">Click "Run End-to-End Simulation" to observe inter-workflow messaging.</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 text-[10px] select-none">{log.time}</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'bus'
                        ? 'text-amber-400 font-bold'
                        : 'text-blue-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: DOWNLOADABLE BLUEPRINTS */}
        {activeTab === 'blueprints' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Download individual JSON workflow definitions to import directly into your SNS Agent Workbench canvas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-3.5 rounded-xl border border-surface-border bg-white flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">WF-0{wf.num}</span>
                    <h5 className="font-bold text-xs text-brand-navy">{wf.name}</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{wf.id}.json</p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleDownloadBlueprint(wf.id)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

