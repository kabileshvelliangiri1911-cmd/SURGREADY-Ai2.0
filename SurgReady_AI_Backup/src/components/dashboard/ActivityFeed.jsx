import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { useProcedure } from '../../context/ProcedureContext';
import { useNavigate } from 'react-router-dom';

export const ActivityFeed = () => {
  const { activities } = useProcedure();
  const navigate = useNavigate();

  return (
    <Card
      title="Recent OR Activity Stream"
      subtitle="Audit-compliant log of checklist completions, inventory actions & plan approvals"
      actions={
        <button
          onClick={() => navigate('/reports')}
          className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
        >
          Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-4">
        {activities.slice(0, 5).map((act, idx) => (
          <div key={act.id || idx} className="flex items-start gap-3 relative">
            {/* Timeline connector line */}
            {idx !== activities.slice(0, 5).length - 1 && (
              <span className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-100" />
            )}

            <div className="relative z-10 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              {act.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {act.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {act.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              {act.type === 'info' && <Info className="w-4 h-4 text-brand-primary" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-brand-navy truncate">
                  {act.user}
                </span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {act.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {act.action}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {act.target}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

