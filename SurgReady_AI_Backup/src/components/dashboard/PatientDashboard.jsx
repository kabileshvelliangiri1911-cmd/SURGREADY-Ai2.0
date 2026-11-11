import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Circle,
  FileText,
  Phone,
  HeartHandshake,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  // Patient Pre-Op Checklist interactive state
  const [patientChecklist, setPatientChecklist] = useState([
    {
      id: 'p-1',
      title: 'Fasting (NPO) after midnight',
      desc: 'Do not eat or drink anything (including water, coffee, gum) starting at 12:00 AM tonight.',
      completed: true,
      time: 'Midnight prior to surgery'
    },
    {
      id: 'p-2',
      title: 'Chlorhexidine (CHG) antiseptic skin shower',
      desc: 'Use the provided antibacterial sponge to wash surgical knee area tonight and morning of surgery.',
      completed: true,
      time: 'Night before & Morning of'
    },
    {
      id: 'p-3',
      title: 'Hold blood thinner medications',
      desc: 'Stop aspirin/anticoagulants 7 days before as instructed by Dr. Jenkins’ clinical clearance team.',
      completed: true,
      time: 'Completed 7 days prior'
    },
    {
      id: 'p-4',
      title: 'Confirm adult designated driver',
      desc: 'An adult driver must accompany you to discharge and drive you home following anesthesia recovery.',
      completed: true,
      time: 'Confirmed with Martha Wilson'
    },
    {
      id: 'p-5',
      title: 'Bring government photo ID & insurance card',
      desc: 'Have your physical cards ready for rapid morning registration at the West Pavilion desk.',
      completed: false,
      time: 'Day of Surgery Check-in'
    },
    {
      id: 'p-6',
      title: 'Wear loose-fitting, comfortable clothing',
      desc: 'Wear wide-leg pants or shorts that will fit comfortably over a knee surgical dressing.',
      completed: false,
      time: 'Day of Surgery Morning'
    }
  ]);

  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleCheck = (id) => {
    setPatientChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          toast.info(`${item.title}: ${next ? 'Confirmed completed' : 'Marked pending'}`);
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const completedCount = patientChecklist.filter((c) => c.completed).length;
  const progressPct = Math.round((completedCount / patientChecklist.length) * 100);

  const faqs = [
    {
      q: 'What should I do if I accidentally drink water in the morning?',
      a: 'Please immediately notify the registration nurse upon arrival. Do not drink anything further. A small sip of water with approved heart or blood pressure medication is usually permitted.'
    },
    {
      q: 'Where do I park and check in?',
      a: 'Park in the West Visitor Garage (Free parking voucher provided). Enter through Pavilion 2 and follow signs to Surgical Admissions on the 2nd Floor.'
    },
    {
      q: 'How long will the procedure and recovery take?',
      a: 'The surgical procedure typically takes between 75 to 90 minutes. You will then spend 2 hours in the Post-Anesthesia Care Unit (PACU) before moving to recovery.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Patient Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-60 -top-10 w-52 h-52 rounded-full bg-sky-300/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-semibold mb-3">
              <HeartHandshake className="w-3.5 h-3.5 text-sky-200" />
              <span>Patient Surgical Care Portal • St. Jude Medical Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {currentUser?.name || 'James Wilson'}!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Your surgical care team has prepared your personalized pre-operative guidance. Please review your procedure schedule, fasting guidelines, and milestone checklist.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center self-start md:self-center">
            <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider block">Surgery Date</span>
            <span className="text-xl font-extrabold text-white block mt-0.5">Tomorrow, 07:30 AM</span>
            <span className="text-xs text-sky-200 block mt-0.5">Arrival Check-in: 06:00 AM</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Procedure Details & Milestone Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Procedure Card + Milestone Checklist */}
        <div className="lg:col-span-7 space-y-4">
          {/* Upcoming Surgery Card */}
          <Card className="p-6 shadow-card border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-navy">Right Total Knee Arthroplasty (TKA)</h3>
                  <p className="text-xs text-slate-muted">Case ID: PROC-2026-089 • Orthopedic Surgery</p>
                </div>
              </div>
              <Badge variant="primary" size="md">Scheduled</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Date & Arrival</span>
                  <strong className="text-slate-800 text-xs block mt-0.5">Tomorrow, 06:00 AM</strong>
                  <span className="text-[11px] text-slate-500">Incision: 07:30 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Location</span>
                  <strong className="text-slate-800 text-xs block mt-0.5">West Pavilion • OR 3</strong>
                  <span className="text-[11px] text-slate-500">Admissions Desk 2nd Fl</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Lead Surgeon</span>
                  <strong className="text-slate-800 text-xs block mt-0.5">Dr. Sarah Jenkins</strong>
                  <span className="text-[11px] text-slate-500">MD, FAAOS Orthopedics</span>
                </div>
              </div>
            </div>

            {/* AI Verified Readiness Note */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong className="font-semibold text-brand-navy">AI Sizing & Verification Ready:</strong> Your pre-operative CT scans have been processed by SurgReady AI. Your Stryker Triathlon sizing match (Femoral #4 / Tibial #3) has been verified and staged in the operating suite.
              </div>
            </div>
          </Card>

          {/* Patient Pre-Op Checklist */}
          <Card className="p-6 shadow-card border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-brand-navy">Pre-Op Milestone Checklist</h3>
                <p className="text-xs text-slate-muted">Complete these required steps prior to hospital arrival</p>
              </div>
              <Badge variant={progressPct === 100 ? 'success' : 'primary'} size="sm">
                {completedCount} of {patientChecklist.length} Complete
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-3">
              {patientChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="mt-0.5 text-brand-primary focus:outline-none"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-primary fill-blue-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-brand-primary" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          item.completed ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap self-start">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Care Team Contacts & FAQ */}
        <div className="lg:col-span-5 space-y-4">
          {/* Care Team Contacts */}
          <Card className="p-5 shadow-card border-slate-100 bg-white">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-brand-navy">Your Surgical Care Team</h3>
                <p className="text-[11px] text-slate-muted">Direct contacts for any pre-op questions</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dr. Sarah Jenkins, MD</h4>
                  <p className="text-[11px] text-slate-500">Lead Orthopedic Surgeon</p>
                  <p className="text-[10px] text-brand-primary font-semibold mt-0.5">Office: (555) 234-4402</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                  Surgeon
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Nurse Elena Rostova, RN</h4>
                  <p className="text-[11px] text-slate-500">Pre-Op Nurse Navigator</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">OR Core: (555) 234-4419</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                  Nurse
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">St. Jude Admissions Desk</h4>
                  <p className="text-[11px] text-slate-500">West Pavilion, 2nd Floor</p>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Reception: (555) 234-5000</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-800">
                  Admissions
                </span>
              </div>
            </div>
          </Card>

          {/* Pre-Op Patient FAQs */}
          <Card className="p-5 shadow-card border-slate-100 bg-white">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-brand-navy">Frequently Asked Questions</h3>
                <p className="text-[11px] text-slate-muted">What to expect on surgery morning</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

