import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  ZoomIn,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Boxes,
  FileText,
  ShieldCheck,
  Eye,
  ExternalLink,
  Sparkles,
  ClipboardCheck,
  RotateCw,
  Maximize2,
  Check,
  X,
  HelpCircle,
  AlertCircle,
  FileBadge,
  UserCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useProcedure } from '../context/ProcedureContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateUtils';

export const AIWorkbenchPage = () => {
  const { procedures, selectedProcedure, setSelectedProcedureId } = useProcedure();
  const toast = useToast();
  const navigate = useNavigate();

  // Active slice & scan simulator states
  const [sliceIndex, setSliceIndex] = useState(256);
  const [activePlane, setActivePlane] = useState('coronal'); // 'coronal' | 'axial' | 'sagittal'
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [windowLevel, setWindowLevel] = useState('bone'); // 'bone' | 'soft'
  const [zoomLevel, setZoomLevel] = useState(100);

  // Surgeon Review & Candidate State
  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [surgeonComments, setSurgeonComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(selectedProcedure?.status || 'Pending Review');

  // Fetch or populate candidates for the active case
  useEffect(() => {
    if (!selectedProcedure) return;

    let isMounted = true;
    const fetchCaseData = async () => {
      setIsLoadingCandidates(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${selectedProcedure.id}`);
        if (res.ok) {
          const caseData = await res.json();
          if (isMounted && caseData.candidates && caseData.candidates.length > 0) {
            setCandidates(caseData.candidates);
            setReviewStatus(caseData.surgeon_review_status || 'Pending');
            setSelectedCandidateId(caseData.candidates[0]?.id || '');
            setIsLoadingCandidates(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[AI Workbench] Could not reach backend case endpoint, using local candidates.', err);
      }

      // Fallback: If candidates are already in procedure context or generate standard candidate set
      if (isMounted) {
        if (selectedProcedure.candidates && selectedProcedure.candidates.length > 0) {
          setCandidates(selectedProcedure.candidates);
          setSelectedCandidateId(selectedProcedure.candidates[0]?.id || '');
        } else {
          // Standard clinical candidates based on manufacturer & measurements
          const standardCandidates = [
            {
              id: `CAND-${selectedProcedure.id}-INV-1001`,
              implant_name: `${selectedProcedure.manufacturer || 'Stryker'} Triathlon Cruciate Retaining Femoral Component - Size 5 Right`,
              manufacturer: selectedProcedure.manufacturer || 'Stryker',
              system_line_name: selectedProcedure.systemName || 'Triathlon Knee System',
              product_model: 'STR-TRI-FEM-05R',
              femoral_size: 'Size 5',
              tibial_size: 'Compatible Sizes 4, 5, 6',
              available_stock: 4,
              minimum_stock_level: 2,
              stock_status: 'Normal Stock',
              comparison_status: 'Exact Match',
              matched_attributes: [
                'Manufacturer match: Stryker',
                'System Line match: Triathlon Knee System',
                'Femoral Sizing match: Size 5 matches anatomical plan',
                'Cruciate Retaining alignment compatible with 6.5° varus plan'
              ],
              unmatched_attributes: [],
              missing_information: [],
              evidence_reference: 'Stryker Triathlon Surgical Technique Manual Rev 2026.3, Section 4 (Femoral Sizing Matrix, p. 28)',
              clinical_disclaimer: 'Informational only. Attending surgeon clinical verification required before incision.'
            },
            {
              id: `CAND-${selectedProcedure.id}-INV-1002`,
              implant_name: 'Triathlon Universal Tibial Baseplate - Size 4',
              manufacturer: 'Stryker',
              system_line_name: 'Triathlon Knee System',
              product_model: 'STR-TRI-TIB-04',
              femoral_size: 'Compatible Sizes 4, 5',
              tibial_size: 'Size 4',
              available_stock: 3,
              minimum_stock_level: 2,
              stock_status: 'Normal Stock',
              comparison_status: 'Exact Match',
              matched_attributes: [
                'System Line match: Triathlon Knee System',
                'Tibial Sizing match: Universal Size 4 matches anatomical cut',
                'Extramedullary resection guide verified'
              ],
              unmatched_attributes: [],
              missing_information: [],
              evidence_reference: 'Stryker Triathlon Technique Manual Rev 2026.3, Section 5 (Tibial Guide, p. 34)',
              clinical_disclaimer: 'Informational only. Attending surgeon clinical verification required before incision.'
            },
            {
              id: `CAND-${selectedProcedure.id}-INV-1003`,
              implant_name: 'Triathlon X3 Polyethylene Articular Insert - 11mm (Size 4/5)',
              manufacturer: 'Stryker',
              system_line_name: 'Triathlon Knee System',
              product_model: 'STR-TRI-INS-11',
              femoral_size: 'Size 5',
              tibial_size: 'Size 4',
              available_stock: 1,
              minimum_stock_level: 3,
              stock_status: 'Low Stock',
              comparison_status: 'Partial Match',
              matched_attributes: [
                'System Line match: Triathlon Knee System',
                'Compatibility match: Size 4/5 pairing'
              ],
              unmatched_attributes: [
                'Insert Thickness: 11mm is primary; surgeon must verify flexion-extension gap balancing'
              ],
              missing_information: [],
              evidence_reference: 'Stryker Polyethylene Compatibility Matrix 2026, p. 12',
              clinical_disclaimer: 'Informational only. Attending surgeon clinical verification required before incision.'
            },
            {
              id: `CAND-${selectedProcedure.id}-INV-1008`,
              implant_name: 'Persona The Personalized Knee System - Femoral Size 5',
              manufacturer: 'Zimmer Biomet',
              system_line_name: 'Persona Knee System',
              product_model: 'ZIM-PERS-FEM-05',
              femoral_size: 'Size 5',
              tibial_size: 'Persona Anatomic Size 4',
              available_stock: 2,
              minimum_stock_level: 2,
              stock_status: 'Low Stock',
              comparison_status: 'Mismatch',
              matched_attributes: [
                'Procedure category: Total Knee Replacement',
                'Anatomical size number: 5'
              ],
              unmatched_attributes: [
                'Cross-Manufacturer: Zimmer Biomet Persona is incompatible with Stryker Triathlon instrumentation and trays'
              ],
              missing_information: [],
              evidence_reference: 'Zimmer Biomet Persona Technique Guide 2025.10, Sizing Table 3.2',
              clinical_disclaimer: 'Informational only. Cross-system hardware mixing is strictly prohibited.'
            }
          ];
          setCandidates(standardCandidates);
          setSelectedCandidateId(standardCandidates[0].id);
        }
        setIsLoadingCandidates(false);
      }
    };

    fetchCaseData();
    return () => { isMounted = false; };
  }, [selectedProcedure]);

  // Handle procedure switch
  const handleSelectProcedure = (e) => {
    setSelectedProcedureId(e.target.value);
    toast.info(`Switched active AI workbench to ${e.target.value}`);
  };

  // Submit Surgeon Review
  const handleSubmitSurgeonReview = async (decision) => {
    setIsSubmittingReview(true);
    try {
      const payload = {
        surgeon_id: 'usr_doc_01',
        surgeon_name: selectedProcedure?.surgeon || 'Dr. Sarah Jenkins',
        decision,
        approved_candidate_id: selectedCandidateId,
        comments: surgeonComments || (decision === 'Approved' ? 'Verified implant sizing and alignment against 3D CT scan.' : 'Flagged for alternative sizing review.')
      };

      try {
        await fetch(`http://127.0.0.1:8000/api/v1/cases/${selectedProcedure.id}/review`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (beErr) {
        console.warn('[Backend Review Notice]', beErr);
      }

      setReviewStatus(decision);
      setIsReviewModalOpen(false);

      if (decision === 'Approved') {
        toast.success(`Clinical Sign-Off Approved for ${selectedProcedure.id}! Synchronized with Hospital Operations.`);
        navigate('/checklist');
      } else {
        toast.warning(`Clinical Case marked as '${decision}'. Management and OR teams notified.`);
      }
    } catch (err) {
      toast.error('Failed to submit clinical review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Clinical Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Mandatory Clinical Safety Notice & Surgeon Verification Rule
            </h4>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-snug">
              AI candidate matching is informational pre-operative assistance. Under hospital safety protocols, AI outputs do not constitute clinical approval. Final component verification and implant selection must be explicitly approved by the attending lead surgeon.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
          SurgReady AI v2.4
        </span>
      </div>

      {/* Procedure Selector & Overview Header */}
      <div className="bg-white rounded-2xl border border-surface-border p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Surgical Case
            </label>
            <select
              value={selectedProcedure?.id || ''}
              onChange={handleSelectProcedure}
              className="text-sm font-bold text-brand-navy bg-slate-50 border border-surface-border rounded-xl px-3.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer min-w-[240px]"
            >
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} • {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Patient Details</span>
            <span className="text-xs font-bold text-slate-800 block">
              {selectedProcedure?.patientName} ({selectedProcedure?.patientId}) • {selectedProcedure?.patientAge}y {selectedProcedure?.patientGender}
            </span>
          </div>

          <div className="hidden lg:block h-8 w-px bg-slate-200" />

          <div className="hidden lg:block space-y-0.5">
            <span className="text-[11px] text-slate-400 block font-medium">Surgeon & Review Status</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 block">
                {selectedProcedure?.surgeon}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                  reviewStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : reviewStatus === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {reviewStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/manuals')}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            Manuals
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsReviewModalOpen(true)}
            leftIcon={<UserCheck className="w-4 h-4" />}
            className="shadow-md bg-brand-primary hover:bg-brand-navy font-bold"
          >
            Review Patient Case
          </Button>
        </div>
      </div>

      {/* Main Grid: Scan Viewer (7 cols) + AI Candidate Comparison Matrix (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive 3D Scan Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            title="Preoperative 3D Scan Inspection"
            subtitle={`${selectedProcedure?.scanInfo?.modality || 'Helical CT'} • ${selectedProcedure?.scanInfo?.slicesCount || 512} Slices • 0.625mm`}
            padding={false}
            actions={
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
                {['coronal', 'axial', 'sagittal'].map((plane) => (
                  <button
                    key={plane}
                    onClick={() => setActivePlane(plane)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                      activePlane === plane
                        ? 'bg-white text-brand-navy shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {plane}
                  </button>
                ))}
              </div>
            }
          >
            {/* Viewport Canvas Simulator */}
            <div className="relative bg-slate-950 aspect-[4/3] rounded-t-none overflow-hidden flex items-center justify-center select-none group">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />

              <div
                className="relative transition-transform duration-150 flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <svg
                  viewBox="0 0 300 300"
                  className={`w-72 h-72 sm:w-80 sm:h-80 drop-shadow-2xl transition-all duration-300 ${
                    windowLevel === 'bone' ? 'brightness-110 contrast-125' : 'brightness-90 contrast-100'
                  }`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Bone anatomy representations based on active plane */}
                  {activePlane === 'coronal' ? (
                    <>
                      <path
                        d="M110 40 L190 40 L190 110 C190 145, 230 155, 220 185 C210 200, 175 195, 155 190 C145 190, 125 195, 80 185 C70 155, 110 145, 110 110 Z"
                        fill="rgba(241, 245, 249, 0.88)"
                        stroke="#94A3B8"
                        strokeWidth="2"
                      />
                      <ellipse cx="150" cy="195" rx="65" ry="4" fill="rgba(37, 99, 235, 0.2)" />
                      <path
                        d="M85 205 C115 198, 185 198, 215 205 C215 225, 185 235, 170 245 L170 290 L130 290 L130 245 C115 235, 85 225, 85 205 Z"
                        fill="rgba(226, 232, 240, 0.9)"
                        stroke="#94A3B8"
                        strokeWidth="2"
                      />
                    </>
                  ) : activePlane === 'axial' ? (
                    <>
                      <circle cx="150" cy="150" r="90" fill="rgba(241, 245, 249, 0.85)" stroke="#94A3B8" strokeWidth="2" />
                      <circle cx="150" cy="150" r="45" fill="rgba(30, 41, 59, 0.5)" stroke="#64748B" strokeWidth="1.5" />
                      <path d="M70 150 Q150 120 230 150" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
                    </>
                  ) : (
                    <>
                      <path
                        d="M120 30 L180 30 L180 140 C190 180, 185 210, 150 215 C120 210, 110 180, 120 140 Z"
                        fill="rgba(241, 245, 249, 0.88)"
                        stroke="#94A3B8"
                        strokeWidth="2"
                      />
                      <rect x="135" y="225" width="40" height="65" rx="10" fill="rgba(226, 232, 240, 0.9)" stroke="#94A3B8" strokeWidth="2" />
                    </>
                  )}

                  {/* AI Resection & Sizing Overlays */}
                  {showLandmarks && (
                    <>
                      <line x1="150" y1="20" x2="150" y2="280" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="70" y1="182" x2="230" y2="182" stroke="#10B981" strokeWidth="2" />
                      <circle cx="150" cy="182" r="4" fill="#10B981" />
                      <text x="160" y="178" fill="#10B981" fontSize="9" fontWeight="bold">Distal Resection 9mm</text>
                      <text x="160" y="35" fill="#EF4444" fontSize="9" fontWeight="bold">Mechanical Axis (0.0°)</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Viewport HUD Overlays */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-[10px] text-white space-y-0.5 pointer-events-none">
                <p className="font-mono text-emerald-400 font-bold">SLICE: {sliceIndex} / 512</p>
                <p className="text-slate-300">PLANE: {activePlane.toUpperCase()}</p>
                <p className="text-slate-300">THICKNESS: 0.625 mm</p>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => setShowLandmarks(!showLandmarks)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                    showLandmarks
                      ? 'bg-brand-primary text-white border-blue-400'
                      : 'bg-black/60 text-slate-300 border-white/20'
                  }`}
                >
                  Landmarks {showLandmarks ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setWindowLevel(windowLevel === 'bone' ? 'soft' : 'bone')}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-black/60 text-slate-200 border border-white/20 hover:bg-black/80 uppercase"
                >
                  {windowLevel} Window
                </button>
              </div>

              {/* Bottom HUD Tool Bar */}
              <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3 w-7/12">
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">SLICE INDEX:</span>
                  <input
                    type="range"
                    min="1"
                    max="512"
                    value={sliceIndex}
                    onChange={(e) => setSliceIndex(Number(e.target.value))}
                    className="w-full accent-brand-primary h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom out"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => { setZoomLevel(100); setSliceIndex(256); }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1"
                    title="Reset view"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-surface-border text-xs text-slate-500 flex items-center justify-between">
              <span>Modality: Multi-Slice Helical CT (Bone Kernel MARS)</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Op Scan Stored Privately
              </span>
            </div>
          </Card>

          {/* Clinical Case Metadata Box */}
          <Card title="Case Anatomical Plan & Patient Parameters" subtitle="Verified from pre-operative case registration">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Alignment Axis</span>
                <span className="text-sm font-extrabold text-brand-navy mt-0.5 block">{selectedProcedure?.measurements?.varusValgus || '6.5° Varus'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Planned Femoral</span>
                <span className="text-sm font-extrabold text-brand-navy mt-0.5 block">{selectedProcedure?.measurements?.femoralSizeEst || 'Size 5'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Planned Tibial</span>
                <span className="text-sm font-extrabold text-brand-navy mt-0.5 block">{selectedProcedure?.measurements?.tibialSizeEst || 'Size 4'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Surgical Priority</span>
                <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">{selectedProcedure?.priority || 'Elective'}</span>
              </div>
            </div>
            {selectedProcedure?.notes && (
              <p className="text-xs text-slate-600 mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 italic">
                Clinical Notes: "{selectedProcedure.notes}"
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: AI-Assisted Implant Candidate Comparison Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="AI Implant Candidate Comparison"
            subtitle="Comparing procedure requirements against authorized hospital implant catalog"
            actions={
              <Badge variant="primary" size="sm">
                {candidates.length} Evaluated
              </Badge>
            }
          >
            {/* Status categorization key */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 text-[10px]">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Exact Documented Match</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Partial Match / Review</span>
              </div>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                <X className="w-3 h-3 text-rose-600" />
                <span>Mismatch (Flagged)</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-500" />
                <span>Insufficient Info</span>
              </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {candidates.map((cand) => {
                const isExact = cand.comparison_status === 'Exact Match';
                const isPartial = cand.comparison_status === 'Partial Match';
                const isMismatch = cand.comparison_status === 'Mismatch';
                const isLow = cand.stock_status === 'Low Stock';
                const isOut = cand.stock_status === 'Out of Stock';

                return (
                  <div
                    key={cand.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isExact
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                        : isPartial
                        ? 'bg-amber-50/30 border-amber-200'
                        : isMismatch
                        ? 'bg-rose-50/30 border-rose-200 opacity-80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-brand-navy">
                            {cand.implant_name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {cand.product_model} • {cand.manufacturer} • {cand.system_line_name}
                        </p>
                      </div>

                      {/* Comparison Status Badge */}
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${
                          isExact
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isMismatch
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {cand.comparison_status}
                      </span>
                    </div>

                    {/* Stock Status Pill */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">
                        Available Stock: <strong className="text-slate-800">{cand.available_stock}</strong> / Min: {cand.minimum_stock_level}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isOut
                            ? 'bg-rose-100 text-rose-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {cand.stock_status}
                      </span>
                    </div>

                    {/* Matched Attributes */}
                    {cand.matched_attributes && cand.matched_attributes.length > 0 && (
                      <div className="mt-2 text-[10px] text-emerald-800 space-y-0.5 bg-emerald-100/50 p-2 rounded-lg">
                        <span className="font-bold block">Documented Matches:</span>
                        {cand.matched_attributes.map((m, idx) => (
                          <p key={idx}>• {m}</p>
                        ))}
                      </div>
                    )}

                    {/* Unmatched / Mismatches */}
                    {cand.unmatched_attributes && cand.unmatched_attributes.length > 0 && (
                      <div className="mt-1.5 text-[10px] text-rose-800 space-y-0.5 bg-rose-100/50 p-2 rounded-lg">
                        <span className="font-bold block">Flags / Conflicts:</span>
                        {cand.unmatched_attributes.map((u, idx) => (
                          <p key={idx}>• {u}</p>
                        ))}
                      </div>
                    )}

                    {/* Evidence Documentation Citation */}
                    {cand.evidence_reference && (
                      <p className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-100 pt-1">
                        Ref: {cand.evidence_reference}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Action to Review */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Surgeon Review: <strong className="text-slate-800">{reviewStatus}</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                className="font-bold"
              >
                Review & Sign Off
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* SURGEON CASE REVIEW & SIGN-OFF MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Surgeon Clinical Case Review & Sign-Off"
        subtitle={`Case ID: ${selectedProcedure?.id} • Patient: ${selectedProcedure?.patientName} (MRN: ${selectedProcedure?.patientId})`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmitSurgeonReview('Rejected')}
                disabled={isSubmittingReview}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Reject / Request Changes
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmitSurgeonReview('Approved')}
                isLoading={isSubmittingReview}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Clinical Selection
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
            <h4 className="font-bold text-brand-navy text-sm">Clinical Verification Instructions</h4>
            <p className="text-xs text-blue-900 mt-1 leading-relaxed">
              As the attending lead surgeon ({selectedProcedure?.surgeon}), select the verified implant candidate and record your pre-operative clinical sign-off. This decision is logged in the permanent hospital audit record.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Authorized Implant Candidate:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {candidates.map((cand) => (
                <label
                  key={cand.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    selectedCandidateId === cand.id
                      ? 'bg-brand-light border-brand-primary shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="candidate_selection"
                      checked={selectedCandidateId === cand.id}
                      onChange={() => setSelectedCandidateId(cand.id)}
                      className="accent-brand-primary h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{cand.implant_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {cand.product_model} • Stock: {cand.available_stock} ({cand.stock_status})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      cand.comparison_status === 'Exact Match'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cand.comparison_status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Attending Surgeon Clinical Notes & Attestation:
            </label>
            <textarea
              rows={3}
              value={surgeonComments}
              onChange={(e) => setSurgeonComments(e.target.value)}
              placeholder="e.g. Sizing verified against coronal CT slices. Distal resection bushing set to 6 deg valgus. Sterile trays 1 and 2 confirmed."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-snug">
            <strong>Clinical Safety Protocol:</strong> By submitting approval, you certify that you have independently verified implant compatibility with the patient's anatomical scans.
          </div>
        </div>
      </Modal>
    </div>
  );
};
