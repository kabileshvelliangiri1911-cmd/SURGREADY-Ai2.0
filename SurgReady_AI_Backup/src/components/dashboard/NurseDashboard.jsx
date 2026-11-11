import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  ClipboardCheck,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  User,
  Thermometer,
  Sparkles,
  ArrowRight,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useProcedure } from '../../context/ProcedureContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dateUtils';

export const NurseDashboard = () => {
  const { currentUser } = useAuth();
  const { procedures, inventory, checklists, updateChecklist } = useProcedure();
  const navigate = useNavigate();
  const toast = useToast();

  // Nursing Core Shift Checklist State (Interactive)
  const [shiftTasks, setShiftTasks] = useState([
    { id: 'task-1', title: 'Verify Patient ID & Surgical Consent', room: 'Pre-Op Holding Bed 4', patient: 'James Wilson', completed: true, critical: true },
    { id: 'task-2', title: 'Class 5 Sterilization Integrator Indicator Strip Confirmed', room: 'OR Suite 3', patient: 'James Wilson', completed: true, critical: true },
    { id: 'task-3', title: 'Stryker Triathlon Size 4 Tray Temperature & Seal Check', room: 'OR Clean Core Shelf 2', patient: 'James Wilson', completed: true, critical: true },
    { id: 'task-4', title: 'Pre-Op Vitals & Anesthesia Clearance Sign-Off', room: 'Pre-Op Holding Bed 4', patient: 'James Wilson', completed: false, critical: true },
    { id: 'task-5', title: 'Electrosurgical Cautery & Suction Line Prime', room: 'OR Suite 3', patient: 'James Wilson', completed: false, critical: false },
    { id: 'task-6', title: 'Pre-Incision Surgical Count (Sponges, Sharps, Instruments)', room: 'OR Suite 3', patient: 'James Wilson', completed: false, critical: true },
  ]);

  const toggleTask = (taskId) => {
    setShiftTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          toast.info(`${t.title}: marked as ${next ? 'Completed' : 'Pending'}`);
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const completedTasksCount = shiftTasks.filter((t) => t.completed).length;
  const progressPct = Math.round((completedTasksCount / shiftTasks.length) * 100);

  // Relevant active patient procedures in OR
  const activeProcedures = procedures.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Nurse Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="absolute right-60 -top-10 w-52 h-52 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs font-semibold mb-3">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
              <span>OR Nursing Care Portal • {currentUser?.department || 'Operating Suites & Clean Core'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Nurse Elena Rostova, RN'}!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Verify pre-operative sterile packs, confirm surgical tray indicators, log baseline patient vitals, and execute procedural safety checklists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/checklist')}
            >
              Master Surgical Checklist
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-transparent shadow-lg"
              leftIcon={<ClipboardCheck className="w-4 h-4 text-white" />}
              onClick={() => navigate('/inventory')}
            >
              Verify OR Tray Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Patients Today"
          value={activeProcedures.length}
          subtitle="Surgical suites 2, 3 & 4"
          icon={User}
          color="emerald"
        />
        <StatCard
          title="Nursing Task Progress"
          value={`${progressPct}%`}
          subtitle={`${completedTasksCount} of ${shiftTasks.length} tasks ready`}
          icon={ClipboardCheck}
          color="teal"
        />
        <StatCard
          title="Implant Trays Verified"
          value="4 Trays"
          subtitle="Autoclave indicators green"
          icon={Boxes}
          color="blue"
        />
        <StatCard
          title="Clinical Safety Status"
          value="Active Safe"
          subtitle="No alerts in active suites"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Main Grid: Shift Nursing Tasks + Patient Prep List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Authorized Nursing Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-brand-navy">Authorized Nursing Shift Tasks</h3>
                <p className="text-xs text-slate-muted">Pre-operative safety verification & sterile field sign-off</p>
              </div>
              <Badge variant={progressPct === 100 ? 'success' : 'primary'} size="sm">
                {progressPct}% Completed
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-2.5">
              {shiftTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-600 focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Location: <span className="font-semibold text-slate-700">{task.room}</span> • Patient: <span className="font-semibold text-slate-700">{task.patient}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.critical && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Critical
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Sterile Field Verification Notice */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-teal-950">OR Clean Core Sterility Protocol</h4>
              <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                Clean Core autoclave pressure batch #2891 cycle completed. All chemical indicator integrators verified Class 5 dark transition. Ready for OR Suite 3 incision.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Assigned Patient Pre-Op Readiness */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-brand-navy">Assigned Patient Prep List</h3>
                  <p className="text-[11px] text-slate-muted">Operating Room schedule & patient readiness</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {activeProcedures.map((proc, idx) => {
                const isReady = proc.status === 'Completed' || idx === 0;
                return (
                  <div
                    key={proc.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">{proc.patientName || 'James Wilson'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({proc.id})</span>
                        </div>
                        <p className="text-xs text-brand-navy font-semibold mt-0.5">{proc.name}</p>
                      </div>
                      <Badge
                        variant={isReady ? 'success' : 'warning'}
                        size="sm"
                      >
                        {isReady ? 'Prep Ready' : 'Pending Review'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600">
                      <div>
                        OR Room: <strong className="text-slate-800">Suite {idx + 2}</strong>
                      </div>
                      <div>
                        Surgeon: <strong className="text-slate-800">{proc.surgeon || 'Dr. S. Jenkins'}</strong>
                      </div>
                      <div>
                        Manufacturer: <strong className="text-slate-800">{proc.manufacturer || 'Stryker'}</strong>
                      </div>
                      <div>
                        Time: <strong className="text-emerald-700">07:30 AM</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">
                        Checklist: {idx === 0 ? '5/6 Verified' : '3/6 Verified'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 p-0 h-auto"
                        onClick={() => navigate('/checklist')}
                      >
                        Open Checklist <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
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

