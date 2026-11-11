import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  HeartPulse,
  User,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Boxes,
  ClipboardCheck,
  Calendar
} from 'lucide-react';

export const PortalSelectionPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'doctor',
      name: 'Doctor Portal',
      subtitle: 'Attending Surgeons & Clinical Specialists',
      description: 'Surgical planning, 3D anatomical scan inspection, AI implant sizing candidate comparison, and clinical checklist sign-offs.',
      icon: Stethoscope,
      route: '/doctor/signin',
      accentColor: 'blue',
      badge: 'Clinical Authority',
      gradient: 'from-blue-600 to-indigo-700',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-500/10',
      iconBg: 'bg-blue-50 text-blue-600',
      features: ['3D Scan Viewer', 'AI Implant Matching', 'Checklist Sign-Off']
    },
    {
      id: 'management',
      name: 'Management Portal',
      subtitle: 'Hospital Administration & Supply Chain',
      description: 'Hospital operational oversight, low-stock threshold monitoring, automatic procurement alerts, and SURGREADY Management Assistant.',
      icon: Building2,
      route: '/management/signin',
      accentColor: 'indigo',
      badge: 'Hospital Operations',
      gradient: 'from-indigo-600 to-slate-900',
      borderHover: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-50 text-indigo-600',
      features: ['Inventory Alerts', 'Management Assistant', 'Audit Trail']
    },
    {
      id: 'nurse',
      name: 'Nurse Portal',
      subtitle: 'OR Circulators, Scrub Coordinators & PACU',
      description: 'Pre-op patient verification, autoclave batch Class 5 indicator checks, implant tray readiness logs, and intra-operative counts.',
      icon: HeartPulse,
      route: '/nurse/signin',
      accentColor: 'emerald',
      badge: 'Nursing Care',
      gradient: 'from-emerald-600 to-teal-700',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-50 text-emerald-600',
      features: ['Sterile Tray Logs', 'Patient Prep Tracking', 'OR Verification']
    },
    {
      id: 'patient',
      name: 'Patient Portal',
      subtitle: 'Surgical Patients & Family Navigators',
      description: 'Personalized procedure schedule, arrival guidelines, pre-operative fasting milestones, and direct surgical care team communication.',
      icon: User,
      route: '/patient/signin',
      accentColor: 'amber',
      badge: 'Patient Portal',
      gradient: 'from-amber-600 to-orange-700',
      borderHover: 'hover:border-amber-500 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-50 text-amber-600',
      features: ['Surgery Timeline', 'Pre-Op Milestones', 'Care Team Contact']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased selection:bg-brand-primary selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-surface-border py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl healthcare-gradient flex items-center justify-center text-white shadow-card">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-brand-navy text-xl tracking-tight">SurgReady</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-brand-light text-brand-primary border border-blue-200">
                  AI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider ml-1">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-muted font-medium">Smart Surgical Preparation & Hospital Inventory</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-Isolated Healthcare Architecture</span>
          </div>
        </div>
      </header>

      {/* Hero & Portal Selection */}
      <main className="max-w-7xl mx-auto px-6 py-10 sm:py-16 w-full flex-1 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-primary text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Department-Specific Access Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
            Welcome to SURGREADY AI
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
            Select your portal to continue. Each department features dedicated authentication, role verification, and authorized surgical tools.
          </p>
        </div>

        {/* 4 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => navigate(portal.route)}
                className={`group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${portal.borderHover} hover:-translate-y-1.5`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl ${portal.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {portal.badge}
                    </span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <h3 className="text-xl font-black text-brand-navy tracking-tight group-hover:text-brand-primary transition-colors">
                    {portal.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {portal.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {portal.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
                    {portal.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-primary transition-colors" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                  <span>Enter Portal</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Access Attestation Footnote */}
        <div className="mt-14 max-w-3xl mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-brand-navy flex-shrink-0" />
            <span>
              <strong>Healthcare Security:</strong> Selecting a portal requires verified database credentials. Doctor, Nurse, and Management accounts require authorized hospital administrator approval.
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
            v2.4 HIPAA-Ready
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-surface-border py-6 px-6 sm:px-10 text-center text-xs text-slate-400">
        <p>© 2026 SURGREADY AI — St. Jude Medical Center Surgical Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

