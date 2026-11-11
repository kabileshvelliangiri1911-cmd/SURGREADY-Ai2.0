import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Cpu,
  ClipboardCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Calendar,
  Building2,
  List,
  LayoutGrid,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useProcedure } from '../../context/ProcedureContext';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

export const RecentProceduresTable = () => {
  const { procedures, setSelectedProcedureId, updateProcedureStatus } = useProcedure();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [selectedProcModal, setSelectedProcModal] = useState(null);

  // Workflow Stages Summary (matching reference layout)
  const workflowStages = [
    { title: 'Images Pending', count: procedures.filter(p => p.scanInfo?.status?.includes('Pending') || p.status === 'Pending Review').length, badgeColor: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Case QA & Verification', count: 0, badgeColor: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Planning in Progress', count: procedures.filter(p => p.status === 'In Progress').length, badgeColor: 'text-brand-primary bg-blue-50 border-blue-200' },
    { title: 'Ready Awaiting Approval', count: procedures.filter(p => p.readiness < 90 && p.readiness >= 60).length, badgeColor: 'text-purple-600 bg-purple-50 border-purple-200' },
    { title: 'Sterilization Verified', count: procedures.filter(p => p.readiness >= 80).length, badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'In OR / Completed', count: procedures.filter(p => p.status === 'Completed').length, badgeColor: 'text-slate-600 bg-slate-100 border-slate-200' },
  ];

  // Filtering
  const filtered = procedures.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.surgeon.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <Badge variant="success" dot>
            Completed
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge variant="primary" dot>
            In Progress
          </Badge>
        );
      case 'Pending Review':
        return (
          <Badge variant="warning" dot>
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleOpenWorkbench = (procId) => {
    setSelectedProcedureId(procId);
    navigate('/ai-workbench');
  };

  const handleOpenChecklist = (procId) => {
    setSelectedProcedureId(procId);
    navigate('/checklist');
  };

  return (
    <div className="space-y-4">
      {/* Workflow Stage Tracker Cards (inspired by reference UI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {workflowStages.map((stage) => (
          <div
            key={stage.title}
            className="bg-white p-3.5 rounded-2xl border border-surface-border shadow-soft flex flex-col justify-between"
          >
            <span className="text-[11px] font-semibold text-slate-500 truncate block">
              {stage.title}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-brand-navy">
                {stage.count}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeColor}`}>
                cases
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card
        title="Recent Surgical Procedures"
        subtitle="Active clinical cases scheduled across hospital surgical operating suites"
        padding={false}
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: List View vs Kanban View */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-brand-navy shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-brand-navy shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/new-procedure')}
            >
              + New Case
            </Button>
          </div>
        }
      >
        {/* Table Controls / Filters Bar */}
        <div className="p-4 border-b border-surface-border bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'In Progress', 'Pending Review', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-primary text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border border-surface-border hover:bg-slate-100'
                }`}
              >
                {tab === 'ALL' ? 'All Procedures' : tab}
              </button>
            ))}
          </div>

          {/* Search box inside table */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter table cases..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-text placeholder:text-slate-400 shadow-xs"
            />
          </div>
        </div>

        {/* View Mode Switch: LIST VIEW vs KANBAN VIEW */}
        {viewMode === 'kanban' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Pending Review */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-surface-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h5 className="font-bold text-xs text-brand-navy">Pending Review</h5>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border">
                    {filtered.filter(p => p.status === 'Pending Review').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filtered.filter(p => p.status === 'Pending Review').map((proc) => (
                    <div
                      key={proc.id}
                      className="bg-white p-4 rounded-xl border border-surface-border shadow-xs hover:shadow-card transition-all cursor-pointer"
                      onClick={() => setSelectedProcModal(proc)}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{proc.id}</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {proc.priority}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-1 leading-snug">
                        {proc.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {proc.patientName} • {proc.surgeon}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px]">{formatDate(proc.date)}</span>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWorkbench(proc.id);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-surface-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h5 className="font-bold text-xs text-brand-navy">In Progress</h5>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border">
                    {filtered.filter(p => p.status === 'In Progress').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filtered.filter(p => p.status === 'In Progress').map((proc) => (
                    <div
                      key={proc.id}
                      className="bg-white p-4 rounded-xl border border-surface-border shadow-xs hover:shadow-card transition-all cursor-pointer"
                      onClick={() => setSelectedProcModal(proc)}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{proc.id}</span>
                        <span className="font-semibold text-brand-primary bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {proc.readiness}% Ready
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-1 leading-snug">
                        {proc.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {proc.patientName} • {proc.surgeon}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px]">{proc.hospitalId}</span>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChecklist(proc.id);
                          }}
                        >
                          Checklist
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Completed / Cleared */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-surface-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h5 className="font-bold text-xs text-brand-navy">Completed & Cleared</h5>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border">
                    {filtered.filter(p => p.status === 'Completed').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filtered.filter(p => p.status === 'Completed').map((proc) => (
                    <div
                      key={proc.id}
                      className="bg-white p-4 rounded-xl border border-surface-border shadow-xs hover:shadow-card transition-all cursor-pointer"
                      onClick={() => setSelectedProcModal(proc)}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{proc.id}</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          100% Cleared
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-1 leading-snug">
                        {proc.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {proc.patientName} • {proc.surgeon}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px]">{formatDate(proc.date)}</span>
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Procedures Table (List View) */
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No matching surgical procedures"
                  description="No procedures found matching the current search query and status filter."
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Procedure ID</th>
                    <th className="py-3 px-4">Procedure Name</th>
                    <th className="py-3 px-4 hidden md:table-cell">Hospital & Suite</th>
                    <th className="py-3 px-4">Surgery Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/70 text-xs">
                  {filtered.map((proc) => (
                    <tr
                      key={proc.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Procedure ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-brand-navy whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{proc.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {proc.code}
                          </span>
                        </div>
                      </td>

                      {/* Procedure Name & Surgeon */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs group-hover:text-brand-primary transition-colors">
                          {proc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {proc.patientName} ({proc.patientId}) • {proc.surgeon}
                        </div>
                      </td>

                      {/* Hospital & Suite */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="text-slate-700 font-medium">{proc.hospital}</div>
                        <div className="text-[11px] text-slate-400">{proc.hospitalId}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-700 font-medium">{formatDate(proc.date)}</div>
                        <div className="text-[11px] text-slate-400">{proc.time || '08:00 AM'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(proc.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProcModal(proc)}
                            className="p-1.5 text-slate-500 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Procedure Summary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenWorkbench(proc.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-brand-primary hover:bg-blue-100 transition-colors flex items-center gap-1"
                            title="Open AI Workbench"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Workbench</span>
                          </button>
                          <button
                            onClick={() => handleOpenChecklist(proc.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
                            title="Open Checklist"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Checklist</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* Procedure Details Modal */}
      {selectedProcModal && (
        <Modal
          isOpen={!!selectedProcModal}
          onClose={() => setSelectedProcModal(null)}
          title={`Procedure Details • ${selectedProcModal.id}`}
          subtitle={`${selectedProcModal.name} (${selectedProcModal.code})`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={selectedProcModal.status}
                  onChange={(e) => {
                    updateProcedureStatus(selectedProcModal.id, e.target.value);
                    setSelectedProcModal({ ...selectedProcModal, status: e.target.value });
                  }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedProcModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleOpenWorkbench(selectedProcModal.id);
                    setSelectedProcModal(null);
                  }}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Launch Workbench
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-surface-border text-xs">
              <div>
                <span className="text-slate-400 block">Patient</span>
                <span className="font-bold text-slate-800">{selectedProcModal.patientName}</span>
                <span className="text-slate-500 block text-[11px]">{selectedProcModal.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Operating Surgeon</span>
                <span className="font-bold text-slate-800">{selectedProcModal.surgeon}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Surgery Schedule</span>
                <span className="font-bold text-slate-800">{formatDate(selectedProcModal.date)}</span>
                <span className="text-slate-500 block text-[11px]">{selectedProcModal.time}</span>
              </div>
              <div>
                <span className="text-slate-400 block">OEM System</span>
                <span className="font-bold text-slate-800">{selectedProcModal.manufacturer}</span>
                <span className="text-slate-500 block text-[11px]">{selectedProcModal.systemName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Urgency / Priority</span>
                <span className="font-bold text-brand-navy">{selectedProcModal.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Readiness Score</span>
                <span className="font-bold text-emerald-700">{selectedProcModal.readiness}% Ready</span>
              </div>
            </div>

            {selectedProcModal.measurements && (
              <div>
                <h5 className="text-xs font-semibold text-brand-navy uppercase tracking-wider mb-2">
                  AI Anatomical Sizing Parameters
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(selectedProcModal.measurements).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-slate-400 text-[10px] block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProcModal.notes && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                <span className="font-bold text-brand-navy block mb-0.5">Clinical Pre-Op Notes:</span>
                {selectedProcModal.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
