import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  ShieldCheck,
  Cpu,
  ClipboardCheck,
  ChevronRight,
  Activity,
  User,
  Plus,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { ProcedureStatusChart } from './ProcedureStatusChart';
import { RecentProceduresTable } from './RecentProceduresTable';
import { useAuth } from '../../context/AuthContext';
import { useProcedure } from '../../context/ProcedureContext';
import { formatDate } from '../../utils/dateUtils';

export const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { procedures, setSelectedProcedureId } = useProcedure();
  const navigate = useNavigate();

  // Doctor's assigned procedures (clinical filter)
  const doctorProcedures = procedures.filter(
    (p) => !p.surgeon || p.surgeon.toLowerCase().includes('sarah') || p.surgeon.toLowerCase().includes('jenkins')
  );

  const pendingReviewCases = doctorProcedures.filter(
    (p) => p.status === 'Pending Review' || p.status === 'In Progress'
  );
  const completedCount = doctorProcedures.filter((p) => p.status === 'Completed').length;

  const handleReviewCase = (caseId) => {
    setSelectedProcedureId(caseId);
    const tableEl = document.getElementById('assigned-procedures-card');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-primary to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-semibold mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-blue-200" />
              <span>Surgeon Portal • {currentUser?.department || 'Orthopedic Surgery'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Dr. Sarah Jenkins'}!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Review assigned patient procedures, verify implant scan sizings in the AI Workbench, and perform surgical checklist sign-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/checklist')}
            >
              Sign-Off Checklist
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-white text-brand-navy hover:bg-blue-50 font-bold border-transparent shadow-lg"
              leftIcon={<Plus className="w-4 h-4 text-brand-primary" />}
              onClick={() => navigate('/new-procedure')}
            >
              New Patient Case
            </Button>
          </div>
        </div>
      </div>

      {/* Surgeon Review Required Action Banner */}
      {pendingReviewCases.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-primary text-white shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wide">
                  Surgeon Review Required ({pendingReviewCases.length} Cases Pending Approval)
                </h4>
                <p className="text-[11px] text-slate-500">
                  AI implant candidate comparisons ready for clinical verification.
                </p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              Clinical Action Required
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingReviewCases.slice(0, 2).map((proc) => (
              <div
                key={proc.id}
                className="bg-white p-3.5 rounded-xl border border-blue-100 flex items-center justify-between shadow-2xs hover:border-blue-300 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {proc.patientName || 'Robert Miller'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (MRN: {proc.patientId})
                    </span>
                  </div>
                  <p className="text-xs text-brand-navy font-semibold mt-0.5 truncate">
                    {proc.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Surgery: <strong className="text-slate-700">{formatDate(proc.date)} at {proc.time || '07:30 AM'}</strong> • Suite: {proc.hospitalId || 'OR-4'}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold whitespace-nowrap bg-brand-primary hover:bg-brand-navy text-xs"
                  onClick={() => handleReviewCase(proc.id)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Review Patient Case
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Patients"
          value={doctorProcedures.length}
          subtitle="Authorized surgical cases"
          icon={User}
          color="blue"
        />
        <StatCard
          title="Pending Pre-Op Reviews"
          value={pendingReviewCases.length}
          subtitle="Requires clinical clearance"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed Surgeries"
          value={completedCount}
          subtitle="This surgical cycle"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Active Operating Suites"
          value="OR 1-4 Active"
          subtitle="Sterile inventory verified"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Grid: Procedures Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="assigned-procedures-card" className="lg:col-span-2 space-y-6">
          <Card
            title="Assigned Patient Procedures"
            subtitle="Only authorized patient records for your clinical specialty"
            action={
              <button
                onClick={() => navigate('/new-procedure')}
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                <span>New Procedure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <RecentProceduresTable />
          </Card>
        </div>

        {/* Right Sidebar: Schedule & Quick Clinical Actions */}
        <div className="space-y-6">
          <Card title="Today's Surgical Schedule" subtitle="Operating Suite Timelines">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  OR-4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy">08:00 AM</span>
                    <Badge variant="warning" size="sm">Pre-Op Ready</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    Robert Miller (PT-88219)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Left Total Knee Arthroplasty (TKA) • Stryker
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  OR-2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy">11:30 AM</span>
                    <Badge variant="neutral" size="sm">Scheduled</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    Eleanor Vance (PT-99120)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Right Total Hip Arthroplasty (THA) • Zimmer Biomet
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Clinical Flow Status" subtitle="Readiness Across OR Stages">
            <ProcedureStatusChart />
          </Card>
        </div>
      </div>
    </div>
  );
};
