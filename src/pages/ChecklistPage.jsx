import React, { useState } from 'react';
import {
  ClipboardCheck,
  Printer,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useProcedure } from '../context/ProcedureContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportService } from '../services/exportService';

export const ChecklistPage = () => {
  const {
    procedures,
    selectedProcedure,
    selectedProcedureId,
    setSelectedProcedureId,
    checklists,
    toggleChecklistItem,
    addCustomChecklistItem,
    signOffChecklist
  } = useProcedure();

  const { currentUser } = useAuth();
  const toast = useToast();

  const currentChecklist = checklists[selectedProcedureId] || checklists['SR-2026-0841'] || {
    procedureName: selectedProcedure?.name,
    patientName: `${selectedProcedure?.patientName} (${selectedProcedure?.patientId})`,
    surgeonName: selectedProcedure?.surgeon,
    orSuite: selectedProcedure?.hospitalId,
    signOff: { reviewStatus: 'Pending Review', surgeonSigned: false, nurseSigned: false },
    sections: []
  };

  // Modals
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [signOffRole, setSignOffRole] = useState('surgeon'); // 'surgeon' | 'nurse'
  const [signerName, setSignerName] = useState(currentUser?.name || 'Dr. Sarah Jenkins, MD');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('sec-inst');
  const [newItemText, setNewItemText] = useState('');
  const [newItemCritical, setNewItemCritical] = useState(false);

  // Compute checklist stats
  const allItems = currentChecklist.sections?.flatMap((s) => s.items) || [];
  const totalItemsCount = allItems.length || 1;
  const checkedItemsCount = allItems.filter((i) => i.checked).length;
  const completionPercentage = Math.round((checkedItemsCount / totalItemsCount) * 100);

  const isFullySigned =
    currentChecklist.signOff?.surgeonSigned && currentChecklist.signOff?.nurseSigned;

  const handlePrint = () => {
    toast.info('Opening formatted print preview...');
    setTimeout(() => {
      exportService.triggerPrint();
    }, 300);
  };

  const handleExportCSV = () => {
    exportService.exportChecklistCSV(currentChecklist);
    toast.success('Checklist CSV exported successfully.');
  };

  const handleSignOffSubmit = (e) => {
    e.preventDefault();
    signOffChecklist(selectedProcedureId, signOffRole, signerName);
    setIsSignOffModalOpen(false);
    toast.success(`Checklist digitally signed by ${signerName}!`);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addCustomChecklistItem(selectedProcedureId, targetSectionId, newItemText, newItemCritical);
    setIsAddItemModalOpen(false);
    setNewItemText('');
    setNewItemCritical(false);
    toast.success('New checklist item added.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Printable Clinical Header (only visible when printing) */}
      <div className="hidden print-only mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">SURGREADY AI • SURGICAL SAFETY & INSTRUMENT CHECKLIST</h1>
        <p className="text-xs">Hospital: St. Jude Medical Center • Department of Surgical Services</p>
        <p className="text-xs mt-1">
          Case: {selectedProcedureId} | Procedure: {currentChecklist.procedureName} | Patient: {currentChecklist.patientName} | Suite: {currentChecklist.orSuite}
        </p>
      </div>

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            Surgical Safety & Instrument Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
            Interdisciplinary operating room verification before incision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Checklist
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsSignOffModalOpen(true)}
            leftIcon={<UserCheck className="w-4 h-4" />}
            className="shadow-sm"
          >
            Clinical Sign-Off
          </Button>
        </div>
      </div>

      {/* Case Context & Progress Bar Card */}
      <Card no-print>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Active Case Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Surgical Case Context:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedProcedureId}
                onChange={(e) => setSelectedProcedureId(e.target.value)}
                className="text-sm font-bold text-brand-navy bg-slate-50 border border-surface-border rounded-xl px-3.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[260px]"
              >
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} • {p.name}
                  </option>
                ))}
              </select>

              <Badge variant="navy" size="md">
                {currentChecklist.orSuite || 'OR-4'}
              </Badge>
              <Badge variant="default" size="md">
                Surgeon: {currentChecklist.surgeonName}
              </Badge>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="lg:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Pre-Op Readiness</span>
              <span className="font-extrabold text-brand-navy">
                {checkedItemsCount} of {totalItemsCount} Verified ({completionPercentage}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                style={{ width: `${completionPercentage}%` }}
                className={`h-full transition-all duration-500 rounded-full ${
                  completionPercentage === 100
                    ? 'bg-emerald-500'
                    : completionPercentage > 70
                    ? 'bg-brand-primary'
                    : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              {completionPercentage === 100
                ? 'All mandatory pre-op items completed'
                : `${totalItemsCount - checkedItemsCount} items remaining before incision`}
            </p>
          </div>
        </div>

        {/* Clinical Sign-Off Status Banner */}
        <div className="mt-5 pt-4 border-t border-surface-border grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Surgeon Sign-Off */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              currentChecklist.signOff?.surgeonSigned
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentChecklist.signOff?.surgeonSigned
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                MD
              </div>
              <div>
                <p className="font-bold">Attending Surgeon Verification</p>
                <p className="text-[11px] mt-0.5">
                  {currentChecklist.signOff?.surgeonSigned
                    ? `Signed by ${currentChecklist.signOff.surgeonSignee} (${currentChecklist.signOff.surgeonSignedAt})`
                    : 'Awaiting primary surgeon electronic signature'}
                </p>
              </div>
            </div>
            <Badge
              variant={currentChecklist.signOff?.surgeonSigned ? 'success' : 'warning'}
              size="sm"
            >
              {currentChecklist.signOff?.surgeonSigned ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          {/* Nurse Sign-Off */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              currentChecklist.signOff?.nurseSigned
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentChecklist.signOff?.nurseSigned
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                RN
              </div>
              <div>
                <p className="font-bold">OR Circulating Nurse Sign-Off</p>
                <p className="text-[11px] mt-0.5">
                  {currentChecklist.signOff?.nurseSigned
                    ? `Signed by ${currentChecklist.signOff.nurseSignee} (${currentChecklist.signOff.nurseSignedAt})`
                    : 'Awaiting circulating nurse physical count'}
                </p>
              </div>
            </div>
            <Badge
              variant={currentChecklist.signOff?.nurseSigned ? 'success' : 'warning'}
              size="sm"
            >
              {currentChecklist.signOff?.nurseSigned ? 'Verified' : 'Pending'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 5 Organized Checklist Sections */}
      <div className="space-y-4">
        {currentChecklist.sections?.map((section, sIdx) => {
          const secChecked = section.items.filter((i) => i.checked).length;
          const secTotal = section.items.length;
          const isComplete = secChecked === secTotal && secTotal > 0;

          return (
            <Card
              key={section.id}
              title={`${sIdx + 1}. ${section.title}`}
              subtitle={section.description}
              badge={
                <Badge variant={isComplete ? 'success' : 'primary'} size="sm">
                  {secChecked} / {secTotal} Checked
                </Badge>
              }
              actions={
                <Button
                  variant="ghost"
                  size="xs"
                  className="no-print"
                  onClick={() => {
                    setTargetSectionId(section.id);
                    setIsAddItemModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Item
                </Button>
              }
            >
              <div className="space-y-2.5">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(selectedProcedureId, section.id, item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      item.checked
                        ? 'bg-blue-50/40 border-blue-200 text-slate-800'
                        : 'bg-white border-surface-border text-slate-700 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}} // Handled by parent div onClick
                          className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/30 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-semibold ${
                              item.checked ? 'text-slate-900 line-through opacity-70' : 'text-slate-900'
                            }`}
                          >
                            {item.text}
                          </p>
                          {item.critical && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              MANDATORY
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full ${
                        item.checked
                          ? 'bg-emerald-100 text-emerald-800 font-semibold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.checked ? 'Verified' : 'Unchecked'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Clinical Sign-Off Modal */}
      <Modal
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        title="Electronic Clinical Sign-Off"
        subtitle={`Procedure: ${selectedProcedureId} • ${currentChecklist.procedureName}`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSignOffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSignOffSubmit} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Confirm Signature
            </Button>
          </>
        }
      >
        <form onSubmit={handleSignOffSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-text mb-1.5">Signer Role *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSignOffRole('surgeon');
                  setSignerName('Dr. Sarah Jenkins, MD');
                }}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                  signOffRole === 'surgeon'
                    ? 'bg-blue-50 border-brand-primary text-brand-navy'
                    : 'bg-slate-50 border-surface-border text-slate-600'
                }`}
              >
                Attending Surgeon
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignOffRole('nurse');
                  setSignerName('Elena Rostova, RN');
                }}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                  signOffRole === 'nurse'
                    ? 'bg-blue-50 border-brand-primary text-brand-navy'
                    : 'bg-slate-50 border-surface-border text-slate-600'
                }`}
              >
                Circulating Nurse
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-text mb-1">
              Signer Legal Name & Credentials *
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-brand-navy leading-relaxed">
            <span className="font-bold block mb-1">Electronic Attestation:</span>
            I certify that the surgical implants, instrument trays, sterilization indicators, and patient safety checks for this procedure have been physically inspected and confirmed compliant with hospital OR policy.
          </div>
        </form>
      </Modal>

      {/* Add Custom Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Custom Item to Checklist"
        subtitle="Insert specialized hospital protocol requirements"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddItemSubmit}>
              Add Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-text mb-1">Checklist Section *</label>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white cursor-pointer"
            >
              {currentChecklist.sections?.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-text mb-1">Item Description *</label>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="e.g. Specialized 20mm reamer shaft tested"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newItemCritical}
              onChange={(e) => setNewItemCritical(e.target.checked)}
              className="w-4 h-4 text-brand-primary border-slate-300 rounded"
            />
            <span className="text-slate-700 font-medium">Mark as MANDATORY prior to incision</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

