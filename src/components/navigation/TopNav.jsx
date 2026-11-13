import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  HelpCircle,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Workflow
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProcedure } from '../../context/ProcedureContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { SNSWorkflowMonitorModal } from '../workbench/SNSWorkflowMonitorModal';

export const TopNav = ({ onOpenMobileMenu, title, subtitle }) => {
  const { currentUser, logout, switchUser, demoUsers } = useAuth();
  const { activities, procedures, setSelectedProcedureId } = useProcedure();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSNSModalOpen, setIsSNSModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = procedures.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.patientName.toLowerCase().includes(q) ||
        p.surgeon.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  }, [searchQuery, procedures]);

  const handleSelectSearchResult = (procedureId) => {
    setSelectedProcedureId(procedureId);
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate('/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 flex items-center justify-between no-print">
        {/* Left: Mobile menu toggle + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-brand-navy tracking-tight truncate">
              {title || 'Dashboard'}
            </h1>
            {subtitle && (
              <p className="hidden md:block text-xs text-slate-muted truncate font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchRef} className="hidden md:block relative w-72 lg:w-96">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search procedures, patients, surgeons..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white rounded-xl placeholder:text-slate-400 text-slate-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Autocomplete Results Popover */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-surface-border shadow-dropdown overflow-hidden z-50">
              <div className="px-3 py-2 bg-slate-50 border-b border-surface-border text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Matching Procedures
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSearchResult(p.id)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-brand-navy">{p.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.patientName} ({p.patientId}) • {p.surgeon}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-brand-primary">
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions & User menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition-colors"
              title="Recent Clinical Alerts"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-primary ring-2 ring-white animate-pulse" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-surface-border shadow-dropdown overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 bg-white border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-brand-navy">Notifications</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-primary">
                      {activities.length} New
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-brand-primary hover:underline font-medium"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {act.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {act.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {act.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {act.type === 'info' && <Info className="w-4 h-4 text-brand-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-text">{act.action}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{act.target}</p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-surface-border text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/dashboard');
                    }}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    View All Activity Log
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SNS Agent Workbench Multi-Workflow Modal Trigger */}
          <button
            onClick={() => setIsSNSModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-primary border border-blue-200 text-xs font-bold transition-all shadow-2xs group"
            title="SNS Agent Workbench Multi-Workflow Monitor"
          >
            <Workflow className="w-3.5 h-3.5 text-brand-primary group-hover:rotate-12 transition-transform" />
            <span>SNS Workflows</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
          </button>

          {/* Help & Documentation Modal trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition-colors"
            title="SurgReady Support & Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-blue-200"
              />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-brand-navy block leading-tight">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-slate-muted block leading-tight">
                  {currentUser?.hospital}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-surface-border shadow-dropdown overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-4 border-b border-surface-border bg-slate-50/70">
                  <p className="text-xs font-bold text-brand-navy">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-muted">{currentUser?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-brand-primary text-[10px] font-semibold">
                    <Sparkles className="w-3 h-3" /> {currentUser?.role}
                  </div>
                </div>

                {/* Role Switcher for Demo */}
                <div className="p-3 border-b border-surface-border">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Switch Demo Persona:
                  </p>
                  <div className="space-y-1">
                    {demoUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsProfileOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentUser?.id === u.id
                            ? 'bg-blue-50 text-brand-primary font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.role.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-brand-navy hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-status-error hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-status-error" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help & Support Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="SurgReady AI • Clinical Platform Guide"
        subtitle="Healthcare Technology Support & Procedure Preparation Guidelines"
        maxWidth="max-w-xl"
        footer={
          <Button variant="primary" onClick={() => setIsHelpOpen(false)}>
            Close Guide
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-slate-600">
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
            <h4 className="font-semibold text-brand-navy text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              SurgReady Preparation Workflow
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. <strong>New Procedure:</strong> Input patient, procedural details, and upload pre-op imaging scans.<br/>
              2. <strong>Case Review:</strong> Review automated implant matching, manual references, and required implants.<br/>
              3. <strong>Checklist:</strong> Circulating nurse and lead surgeon sign off on instrument trays and sterilization.<br/>
              4. <strong>Inventory:</strong> Real-time reservation guarantees OR availability before incision.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-brand-navy text-xs uppercase tracking-wider">
              Safety & Regulatory Disclaimer
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              SurgReady AI is designed as clinical decision support. Final implant sizing, surgical approach, and instrument choice must always be verified by the board-certified operating surgeon.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Hospital OR Command Center Hotline</p>
                <p className="text-[11px] text-slate-500">24/7 Priority Clinical Support • Ext. 8400</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </Modal>
      {/* SNS Agent Workbench Multi-Workflow Interactive Monitor Modal */}
      <SNSWorkflowMonitorModal
        isOpen={isSNSModalOpen}
        onClose={() => setIsSNSModalOpen(false)}
      />
    </>
  );
};

