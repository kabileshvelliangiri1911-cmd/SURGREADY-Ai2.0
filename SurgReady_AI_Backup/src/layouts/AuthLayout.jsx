import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, Sparkles, Building2, Stethoscope } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        
        {/* Left Side: Medical Branding & Professional Healthcare Illustration */}
        <div className="md:w-5/12 bg-gradient-to-br from-brand-navy via-brand-primary to-blue-600 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight">SurgReady AI</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
            </div>
            <p className="text-blue-100 text-xs mt-2 font-medium">
              Smart Surgical Preparation. Simplified.
            </p>
          </div>

          {/* Central Medical Illustration & Graphic */}
          <div className="relative z-10 my-8 flex flex-col items-center justify-center text-center">
            {/* SVG Medical Illustration */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background medical grid circle */}
                <circle cx="100" cy="100" r="85" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="60" fill="rgba(255, 255, 255, 0.12)" />
                
                {/* Stylized Doctor/Surgeon Figure */}
                {/* Head */}
                <circle cx="100" cy="65" r="24" fill="#F8FAFC" />
                {/* Surgical Cap */}
                <path d="M78 65 C78 50, 122 50, 122 65 Z" fill="#2563EB" />
                {/* Face Mask */}
                <path d="M84 66 C84 78, 116 78, 116 66 Z" fill="#93C5FD" />
                <path d="M84 68 L78 65 M116 68 L122 65" stroke="#BFDBFE" strokeWidth="1.5" />
                {/* Eyes */}
                <circle cx="93" cy="58" r="2" fill="#1E293B" />
                <circle cx="107" cy="58" r="2" fill="#1E293B" />
                
                {/* Body / Scrubs */}
                <path d="M68 118 C68 92, 132 92, 132 118 L132 155 C132 155, 100 160, 68 155 Z" fill="#1E40AF" />
                <path d="M88 95 L100 115 L112 95" fill="#DBEAFE" />
                {/* Stethoscope */}
                <path d="M84 98 C84 125, 116 125, 116 98" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="126" r="4.5" fill="#FBBF24" />
                
                {/* Orbiting Tech Nodes */}
                <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '24s' }}>
                  <circle cx="100" cy="18" r="7" fill="#60A5FA" />
                  <circle cx="178" cy="100" r="6" fill="#38BDF8" />
                  <circle cx="100" cy="182" r="7" fill="#818CF8" />
                  <circle cx="22" cy="100" r="6" fill="#93C5FD" />
                </g>
              </svg>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Hospital OR Workflow Intelligence
            </h3>
            <p className="text-blue-100 text-xs mt-1 max-w-xs leading-relaxed">
              Verify implants, automate checklists, and streamline multi-specialty surgical preparation.
            </p>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 pt-4 border-t border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>HIPAA-Ready Architecture & Role-Based Access</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Stryker, Zimmer Biomet, DePuy & Medtronic Support</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

