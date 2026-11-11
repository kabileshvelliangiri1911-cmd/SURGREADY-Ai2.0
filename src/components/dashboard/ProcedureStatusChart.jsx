import React, { useState } from 'react';
import { BarChart2, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';

export const ProcedureStatusChart = ({ procedures = [] }) => {
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'specialty'

  const total = procedures.length || 1;
  const completed = procedures.filter(p => p.status === 'Completed').length;
  const inProgress = procedures.filter(p => p.status === 'In Progress').length;
  const pendingReview = procedures.filter(p => p.status === 'Pending Review').length;

  const completedPct = Math.round((completed / total) * 100);
  const inProgressPct = Math.round((inProgress / total) * 100);
  const pendingPct = Math.round((pendingReview / total) * 100);

  // Specialties
  const specialties = [
    { name: 'Knee & Hip Arthroplasty', count: procedures.filter(p => p.type?.toLowerCase().includes('joint') || p.type?.toLowerCase().includes('knee') || p.type?.toLowerCase().includes('hip')).length, color: 'bg-brand-primary' },
    { name: 'Spinal Instrumentation', count: procedures.filter(p => p.type?.toLowerCase().includes('spinal')).length, color: 'bg-brand-navy' },
    { name: 'Trauma & Reconstruction', count: procedures.filter(p => p.type?.toLowerCase().includes('trauma')).length, color: 'bg-blue-400' },
    { name: 'Upper Extremity / Other', count: procedures.filter(p => p.type?.toLowerCase().includes('upper') || p.type?.toLowerCase().includes('shoulder')).length, color: 'bg-sky-400' }
  ];

  return (
    <Card
      title="Surgical Preparation Flow & Distribution"
      subtitle="Real-time procedural lifecycle progression across operating suites"
      actions={
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-white text-brand-navy shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Status
          </button>
          <button
            onClick={() => setActiveTab('specialty')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'specialty'
                ? 'bg-white text-brand-navy shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Specialty
          </button>
        </div>
      }
    >
      {activeTab === 'status' ? (
        <div className="space-y-5">
          {/* Multi-segment Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Overall Pipeline Completion</span>
              <span className="font-bold text-brand-navy">{completed} of {total} Procedures Ready (100%)</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${completedPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Completed: ${completed} (${completedPct}%)`}
              />
              <div
                style={{ width: `${inProgressPct}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`In Progress: ${inProgress} (${inProgressPct}%)`}
              />
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Pending Review: ${pendingReview} (${pendingPct}%)`}
              />
            </div>
          </div>

          {/* Status Breakdown Columns */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-2">{completed}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{completedPct}% of total cases</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-navy">In Progress</span>
                <Clock className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-2xl font-bold text-brand-navy mt-2">{inProgress}</p>
              <p className="text-[11px] text-brand-primary mt-0.5">{inProgressPct}% of total cases</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">Pending Review</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-2">{pendingReview}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">{pendingPct}% awaiting sign-off</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fully cleared for incision
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Pre-op trays assembling
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Attending sign-off required
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Active surgical case volume categorized by clinical specialty:</p>
          <div className="space-y-3">
            {specialties.map((spec) => {
              const specPct = Math.round((spec.count / total) * 100) || 5;
              return (
                <div key={spec.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{spec.name}</span>
                    <span className="text-slate-500">{spec.count} Cases ({specPct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${specPct}%` }}
                      className={`h-full ${spec.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

