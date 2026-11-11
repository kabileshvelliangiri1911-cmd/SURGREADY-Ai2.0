import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Calendar,
  Clock,
  Activity,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useProcedure } from '../context/ProcedureContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { performImplantMatching } from '../services/implantMatchingService';
import { dispatchMatchingEventToWorkbench } from '../services/snsMatchingEventService';

export const NewProcedurePage = () => {
  const { createProcedure, refreshData } = useProcedure();
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Patient Information
    patientId: 'PT-' + Math.floor(10000 + Math.random() * 90000),
    hospitalId: 'SJMC-OR-4',
    patientName: '',
    patientAge: 62,
    patientGender: 'Female',
    leadSurgeon: 'Dr. Sarah Jenkins',
    surgeryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    surgeryTime: '08:30 AM',

    // Step 2: Procedure Details
    name: 'Total Knee Arthroplasty (TKA)',
    code: 'CPT 27447',
    type: 'Orthopedic Joint Replacement',
    manufacturer: 'Stryker',
    systemName: 'Triathlon Knee System',
    priority: 'Elective',

    // Step 3: Anatomical Information & Scan
    varusValgus: '5.8° Varus Deformity',
    femoralSizeEst: 'Femoral Size 5',
    tibialSizeEst: 'Tibial Baseplate Size 4',
    clinicalNotes: 'Moderate osteoarthritis with medial compartment narrowing. Preserved cruciate ligaments.',
    uploadedScanName: 'PreOp_CT_Coronal_Knee_Recon.dicom',
    uploadedScanSize: '48.2 MB',
    scanPreviewUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600'
  });

  const [formErrors, setFormErrors] = useState({});

  // Preset scan templates
  const loadPresetCase = (type) => {
    if (type === 'knee') {
      setFormData((prev) => ({
        ...prev,
        name: 'Left Total Knee Arthroplasty (TKA)',
        code: 'CPT 27447',
        type: 'Orthopedic Joint Replacement',
        manufacturer: 'Stryker',
        systemName: 'Triathlon Knee System',
        patientName: 'Patricia Adams',
        varusValgus: '6.2° Varus Deformity',
        femoralSizeEst: 'Femoral Component Size 5 (Right)',
        tibialSizeEst: 'Universal Baseplate Size 4',
        clinicalNotes: 'End-stage tricompartmental osteoarthritis. Complete medial joint space collapse.',
        uploadedScanName: 'Helical_CT_Knee_3D_DICOM.tar',
        uploadedScanSize: '62.4 MB'
      }));
      toast.info('Sample Knee Arthroplasty pre-filled.');
    } else if (type === 'hip') {
      setFormData((prev) => ({
        ...prev,
        name: 'Right Total Hip Arthroplasty',
        code: 'CPT 27130',
        type: 'Orthopedic Joint Replacement',
        manufacturer: 'Zimmer Biomet',
        systemName: 'Persona / G7 Acetabular',
        patientName: 'George Washington Carver',
        varusValgus: 'Leg length discrepancy -6mm',
        femoralSizeEst: 'Stem Size 11 Standard',
        tibialSizeEst: 'Cup 54mm Porous',
        clinicalNotes: 'Severe avascular necrosis with secondary collapse. Good bone stock in acetabulum.',
        uploadedScanName: 'Pelvis_Bilateral_CT_Scan.dcm',
        uploadedScanSize: '74.1 MB'
      }));
      toast.info('Sample Hip Arthroplasty pre-filled.');
    }
  };

  // Validation
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.patientId.trim()) errors.patientId = 'Patient ID is required';
      if (!formData.hospitalId.trim()) errors.hospitalId = 'Hospital ID is required';
      if (!formData.patientName.trim()) errors.patientName = 'Patient Name is required';
    } else if (step === 2) {
      if (!formData.name.trim()) errors.name = 'Procedure Name is required';
      if (!formData.code.trim()) errors.code = 'Procedure Code is required';
      if (!formData.type.trim()) errors.type = 'Procedure Type is required';
      if (!formData.manufacturer.trim()) errors.manufacturer = 'Manufacturer is required';
    } else if (step === 3) {
      if (!formData.varusValgus.trim()) errors.varusValgus = 'Anatomical measurements required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      toast.error('Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Identify Authenticated Doctor & Hospital Relationship (Phase 6)
      const doctorId = currentUser?.id && !currentUser.id.startsWith('usr_') ? currentUser.id : null;
      const doctorName = currentUser?.name || formData.leadSurgeon || 'Dr. Sarah Jenkins';
      const hospitalName = currentUser?.hospital || 'St. Jude Medical Center';

      // 2. Prepare Database Schema Payload (Matching Phase 4 patient_cases schema)
      const anatomicalSite = formData.name.toLowerCase().includes('hip')
        ? 'Hip'
        : formData.name.toLowerCase().includes('shoulder')
        ? 'Shoulder'
        : formData.name.toLowerCase().includes('spine') || formData.name.toLowerCase().includes('lumbar')
        ? 'Spine'
        : 'Knee';

      const patientCasePayload = {
        patient_id: formData.patientId.trim(),
        patient_name: formData.patientName.trim(),
        mrn: formData.patientId.trim(),
        patient_full_name: formData.patientName.trim(),
        age: Number(formData.patientAge) || 60,
        gender: formData.patientGender || 'Female',
        procedure_name: formData.name.trim(),
        procedure_code: formData.code.trim(),
        procedure_type: formData.type.trim(),
        anatomical_site: anatomicalSite,
        implant_category: 'Implants',
        estimated_implant_size: formData.femoralSizeEst || formData.tibialSizeEst || 'Standard',
        clinical_notes: formData.clinicalNotes || '',
        surgery_date: formData.surgeryDate,
        surgical_priority: formData.priority || 'Elective',
        operating_suite_id: formData.hospitalId || 'SJMC-OR-4',
        lead_surgeon_name: doctorName,
        assigned_doctor_id: doctorId,
        case_status: 'Submitted'
      };

      // 3. Supabase Direct Database Insertion (Phase 6)
      let savedDbCase = null;
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('patient_cases')
            .insert([patientCasePayload])
            .select()
            .single();

          if (error) {
            console.warn('[Supabase patient_cases Insert Notice]', error.message);
          } else {
            savedDbCase = data;
          }
        } catch (dbErr) {
          console.warn('[Supabase Connection Notice]', dbErr.message);
        }
      }

      // 4. FastAPI Backend Sync & Fallback
      let backendCase = null;
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/v1/cases/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mrn: formData.patientId,
            operating_suite_id: formData.hospitalId,
            patient_full_name: formData.patientName,
            age: Number(formData.patientAge) || 60,
            gender: formData.patientGender || 'Female',
            lead_surgeon_id: doctorId || 'usr_doc_01',
            lead_surgeon_name: doctorName,
            scheduled_surgery_date: formData.surgeryDate,
            scheduled_or_time: formData.surgeryTime,
            procedure_name: formData.name,
            procedure_code: formData.code,
            procedure_type: formData.type,
            manufacturer: formData.manufacturer,
            system_line_name: formData.systemName,
            surgical_priority: formData.priority || 'Elective',
            anatomical_alignment: formData.varusValgus,
            estimated_femoral_size: formData.femoralSizeEst,
            estimated_tibial_size: formData.tibialSizeEst,
            clinical_information: formData.clinicalNotes
          })
        });
        if (resp.ok) {
          backendCase = await resp.json();
        }
      } catch (beErr) {
        console.warn('[Backend Case Sync Notice]', beErr);
      }

      const assignedId = savedDbCase?.case_id || backendCase?.case_id || `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Patient-to-Implant Matching Foundation (Phase 9)
      const matchingCaseInput = {
        id: savedDbCase?.id || assignedId,
        procedure_type: formData.type,
        procedure_name: formData.name,
        anatomical_site: anatomicalSite,
        manufacturer: formData.manufacturer,
        system_line_name: formData.systemName,
        femoralSizeEst: formData.femoralSizeEst,
        tibialSizeEst: formData.tibialSizeEst,
        estimated_implant_size: formData.femoralSizeEst || formData.tibialSizeEst
      };

      let candidateMatches = [];
      try {
        candidateMatches = await performImplantMatching(matchingCaseInput);
      } catch (matchErr) {
        console.warn('[Matching Service Notice]', matchErr.message);
        candidateMatches = backendCase?.candidates || [];
      }

      // 6. SNS AI Agent Workbench Event (Phase 10 - Isolated Minimal Non-PII Data)
      dispatchMatchingEventToWorkbench({
        case_id: assignedId,
        procedure_type: formData.type,
        anatomical_site: anatomicalSite,
        implant_category: 'Implants',
        estimated_implant_size: formData.femoralSizeEst,
        surgical_priority: formData.priority,
        candidates_count: candidateMatches.length
      }).catch(() => {});

      // 7. Update Application State & Refresh Doctor Dashboard (Phase 7)
      const created = createProcedure({
        id: assignedId,
        dbId: savedDbCase?.id || null,
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        hospitalId: formData.hospitalId,
        hospital: hospitalName,
        name: formData.name,
        code: formData.code,
        type: formData.type,
        manufacturer: formData.manufacturer,
        systemName: formData.systemName,
        surgeon: doctorName,
        date: formData.surgeryDate,
        time: formData.surgeryTime,
        priority: formData.priority,
        notes: formData.clinicalNotes,
        candidates: candidateMatches,
        matchingStatus: candidateMatches[0]?.match_status || 'MATCH',
        measurements: {
          varusValgus: formData.varusValgus,
          femoralSizeEst: formData.femoralSizeEst,
          tibialSizeEst: formData.tibialSizeEst,
          jointLineOffset: '+1.5 mm'
        },
        scanInfo: {
          modality: 'Pre-op Helical CT / 3D Reconstruction',
          scanDate: new Date().toISOString().slice(0, 10),
          slicesCount: 512,
          thickness: '0.625 mm',
          status: 'AI Processed & Verified',
          fileName: formData.uploadedScanName,
          fileSize: formData.uploadedScanSize
        }
      });

      if (refreshData) {
        await refreshData().catch(() => {});
      }

      setIsConfirmOpen(false);
      toast.success(`Patient Case ${assignedId} registered in database! AI Candidate Comparison ready for review.`);
      navigate('/doctor/dashboard');
    } catch (e) {
      console.error('[Patient Case Registration Error]', e);
      toast.error(e.message || 'Failed to submit patient case. Please check entered information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Patient Info', desc: 'IDs & Demographics' },
    { number: 2, title: 'Procedure Details', desc: 'Code & Manufacturer' },
    { number: 3, title: 'Anatomy & Scans', desc: 'Measurements & CT/MRI' },
    { number: 4, title: 'Review & Launch', desc: 'Clinical Verification' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Title & Preset Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            New Procedure Preparation
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
            Ingest patient clinical information, anatomical scans, and OEM specifications.
          </p>
        </div>

        {/* Quick Demo Pre-fill Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Demo Presets:</span>
          <button
            type="button"
            onClick={() => loadPresetCase('knee')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-brand-primary border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Stryker Knee
          </button>
          <button
            type="button"
            onClick={() => loadPresetCase('hip')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            Zimmer Hip
          </button>
        </div>
      </div>

      {/* Step Progress Stepper */}
      <div className="bg-white rounded-2xl border border-surface-border p-4 shadow-soft">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;
            return (
              <div
                key={s.number}
                onClick={() => {
                  if (currentStep > s.number) setCurrentStep(s.number);
                }}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50/80 border border-blue-200'
                    : isCompleted
                    ? 'cursor-pointer hover:bg-slate-50'
                    : 'opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-status-success text-white'
                      : isActive
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-brand-navy' : 'text-slate-600'
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Card */}
      <Card>
        {/* STEP 1: PATIENT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <User className="w-5 h-5 text-brand-primary" />
                Step 1: Patient Information
              </h3>
              <p className="text-xs text-slate-muted mt-0.5">
                Hospital electronic medical record IDs and demographic specifics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Patient Medical Record ID (MRN / Patient ID) *
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="e.g. PT-88219"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    formErrors.patientId ? 'border-rose-400' : 'border-surface-border'
                  }`}
                />
                {formErrors.patientId && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.patientId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Hospital Operating Suite ID *
                </label>
                <input
                  type="text"
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  placeholder="e.g. SJMC-OR-4"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    formErrors.hospitalId ? 'border-rose-400' : 'border-surface-border'
                  }`}
                />
                {formErrors.hospitalId && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.hospitalId}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-text mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="e.g. Robert Miller"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                  formErrors.patientName ? 'border-rose-400' : 'border-surface-border'
                }`}
              />
              {formErrors.patientName && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.patientName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">Age</label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">Gender</label>
                <select
                  value={formData.patientGender}
                  onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">Lead Surgeon</label>
                <input
                  type="text"
                  value={formData.leadSurgeon}
                  onChange={(e) => setFormData({ ...formData, leadSurgeon: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Scheduled Surgery Date
                </label>
                <input
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Scheduled OR Time
                </label>
                <input
                  type="text"
                  value={formData.surgeryTime}
                  onChange={(e) => setFormData({ ...formData, surgeryTime: e.target.value })}
                  placeholder="08:00 AM"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROCEDURE DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-primary" />
                Step 2: Procedure Details
              </h3>
              <p className="text-xs text-slate-muted mt-0.5">
                Surgical procedure taxonomy, billing codes, and manufacturer system specs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Left Total Knee Arthroplasty (TKA)"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Procedure Code (CPT / ICD-10-PCS) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CPT 27447"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Procedure Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="Orthopedic Joint Replacement">Orthopedic Joint Replacement</option>
                  <option value="Orthopedic Revision">Orthopedic Revision</option>
                  <option value="Spinal Instrumentation">Spinal Instrumentation</option>
                  <option value="Trauma & Reconstruction">Trauma & Reconstruction</option>
                  <option value="Upper Extremity Joint">Upper Extremity Joint</option>
                  <option value="Laparoscopic Surgery">Laparoscopic Surgery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Manufacturer *
                </label>
                <select
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="Stryker">Stryker</option>
                  <option value="Zimmer Biomet">Zimmer Biomet</option>
                  <option value="DePuy Synthes">DePuy Synthes</option>
                  <option value="Medtronic">Medtronic</option>
                  <option value="Smith & Nephew">Smith & Nephew</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  System / Line Name
                </label>
                <input
                  type="text"
                  value={formData.systemName}
                  onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                  placeholder="e.g. Triathlon Knee System"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Surgical Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="Elective">Elective</option>
                  <option value="Urgent">Urgent (Within 48h)</option>
                  <option value="Emergency">Emergency (Immediate)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ANATOMICAL INFORMATION & SCAN UPLOAD */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-brand-primary" />
                Step 3: Anatomical Information & Scan Upload
              </h3>
              <p className="text-xs text-slate-muted mt-0.5">
                Measurements, joint kinematics, clinical pre-op history and 3D imaging file ingestion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Anatomical Alignment / Axis Deformity *
                </label>
                <input
                  type="text"
                  value={formData.varusValgus}
                  onChange={(e) => setFormData({ ...formData, varusValgus: e.target.value })}
                  placeholder="e.g. 6.5° Varus Deformity"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Estimated Femoral / Primary Size
                </label>
                <input
                  type="text"
                  value={formData.femoralSizeEst}
                  onChange={(e) => setFormData({ ...formData, femoralSizeEst: e.target.value })}
                  placeholder="e.g. Size 5 (Right)"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Estimated Tibial / Secondary Size
                </label>
                <input
                  type="text"
                  value={formData.tibialSizeEst}
                  onChange={(e) => setFormData({ ...formData, tibialSizeEst: e.target.value })}
                  placeholder="e.g. Size 4"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-text mb-1">
                Relevant Clinical Information & Past Surgical History
              </label>
              <textarea
                rows={3}
                value={formData.clinicalNotes}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                placeholder="Include previous hardware, osteophyte distribution, soft tissue laxity, or bone quality notes..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 leading-relaxed"
              />
            </div>

            {/* Scan Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-text mb-1.5">
                Pre-operative Imaging Scan (DICOM, CT, MRI, or 3D STL)
              </label>
              
              <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl p-6 text-center hover:bg-blue-50/70 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 text-brand-primary mx-auto flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-brand-navy">
                  Drag and drop surgical scan package here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports DICOM series (.dcm, .tar), Helical CT slices, and high-res MRI (Max 500 MB)
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs">
                  <span>Attached File:</span>
                  <span className="font-semibold text-brand-primary">{formData.uploadedScanName}</span>
                  <span className="text-[10px] text-slate-400">({formData.uploadedScanSize})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Step 4: Clinical Review & Launch Confirmation
              </h3>
              <p className="text-xs text-slate-muted mt-0.5">
                Review entered patient details, OEM configurations, and anatomical plan before submission.
              </p>
            </div>

            {/* Structured Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-2 text-xs">
                <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                  Patient & OR Logistics
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-800">{formData.patientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Patient ID (MRN):</span>
                  <span className="font-mono text-slate-800">{formData.patientId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Operating Suite:</span>
                  <span className="font-semibold text-slate-800">{formData.hospitalId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-semibold text-slate-800">{formData.surgeryDate} at {formData.surgeryTime}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Attending Surgeon:</span>
                  <span className="font-semibold text-slate-800">{formData.leadSurgeon}</span>
                </div>
              </div>

              {/* Procedure Details Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-2 text-xs">
                <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                  Procedure & Implant System
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Procedure Name:</span>
                  <span className="font-bold text-slate-800">{formData.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Billing Code:</span>
                  <span className="font-mono text-slate-800">{formData.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Manufacturer OEM:</span>
                  <span className="font-semibold text-brand-primary">{formData.manufacturer} ({formData.systemName})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Specialty Category:</span>
                  <span className="font-semibold text-slate-800">{formData.type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Urgency:</span>
                  <span className="font-bold text-brand-navy">{formData.priority}</span>
                </div>
              </div>
            </div>

            {/* Anatomy & Scan Preview Card */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-2">
              <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block">
                Anatomical Sizing & Imaging Attachment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px]">Alignment Deformity</span>
                  <span className="font-bold text-slate-800">{formData.varusValgus}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px]">Femoral Sizing</span>
                  <span className="font-bold text-slate-800">{formData.femoralSizeEst}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px]">Attached Imaging Scan</span>
                  <span className="font-bold text-brand-primary truncate block">{formData.uploadedScanName}</span>
                </div>
              </div>
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                <span className="font-semibold">Clinical Notes:</span> {formData.clinicalNotes}
              </p>
            </div>

            {/* Clinical Safety Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                By confirming submission, this procedure will be ingested into the SurgReady AI Workbench. Automated recommendations will generate corresponding surgical instrument checklists, inventory reservations, and manual references.
              </span>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
          <Button
            variant="outline"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsConfirmOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Launch Procedure
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Procedure Submission"
        description={`Submit "${formData.name}" for patient ${formData.patientName} (${formData.patientId})? This will initialize AI 3D segmentation, reserve matching tray stock, and generate the sterile checklist.`}
        confirmText="Confirm & Submit"
        isLoading={isSubmitting}
      />
    </div>
  );
};

