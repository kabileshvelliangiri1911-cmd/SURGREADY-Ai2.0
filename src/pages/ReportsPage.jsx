import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Boxes,
  TrendingUp,
  FileText,
  Printer,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useProcedure } from '../context/ProcedureContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateUtils';
import { exportService } from '../services/exportService';
import { INITIAL_ANALYTICS } from '../services/mockData';

export const ReportsPage = () => {
  const { procedures, inventory, checklists } = useProcedure();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('month'); // 'week' | 'month' | 'quarter' | 'all'
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const analytics = INITIAL_ANALYTICS;

  // History filtering
  const filteredHistory = procedures.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.patientName.toLowerCase().includes(q) ||
      p.surgeon.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    setIsExportModalOpen(false);
    if (exportFormat === 'pdf') {
      toast.info('Generating official surgical readiness PDF report...');
      setTimeout(() => {
        window.print();
      }, 400);
    } else if (exportFormat === 'csv') {
      const summaryData = procedures.map((p) => ({
        id: p.id,
        procedure: p.name,
        patient: p.patientName,
        surgeon: p.surgeon,
        date: p.date,
        status: p.status,
        readiness: p.readiness + '%'
      }));
      exportService.exportInventoryCSV(inventory);
      toast.success('Hospital audit report exported successfully.');
    } else {
      exportService.exportReportSummary({
        hospital: 'St. Jude Medical Center',
        generatedAt: new Date().toISOString(),
        metrics: analytics,
        procedures: procedures
      }, 'json');
      toast.success('Machine-readable JSON data exported.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            Analytics & Quality Audit Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
            Surgical preparation metrics, checklist completion records, and inventory audit logs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsExportModalOpen(true)}
          leftIcon={<Download className="w-4 h-4" />}
          className="shadow-sm"
        >
          Export Report
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Total Procedures Prepared</span>
            <FileText className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-3xl font-extrabold text-brand-navy mt-2">{analytics.monthlyPrepared}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% volume increase MoM</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Checklist Sign-Off Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{analytics.signOffRate}%</p>
          <div className="mt-2 text-xs text-slate-500">
            <span>182 checklists signed before incision</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Avg. OR Prep Turnaround</span>
            <Clock className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-3xl font-extrabold text-brand-navy mt-2">{analytics.avgPrepTimeMinutes} min</p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            <span>48% faster than 35-min standard</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Zero Missing Tool Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{analytics.zeroMissingRate}%</p>
          <div className="mt-2 text-xs text-slate-500">
            <span>0 delayed cases due to tray shortages</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Throughput Chart */}
        <Card
          title="Weekly Surgical Preparation Throughput"
          subtitle="Scheduled vs clinically cleared procedures per day"
        >
          <div className="space-y-4">
            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
              {analytics.weeklyVolume.map((item) => {
                const heightPct = Math.round((item.completed / 20) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.completed}
                    </div>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-36 flex items-end overflow-hidden p-1">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-brand-primary group-hover:bg-blue-700 rounded-t-lg transition-all duration-500 shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-md bg-brand-primary" /> Fully Cleared Cases
              </span>
              <span className="flex items-center gap-2 font-medium text-slate-400">
                <span className="w-3 h-3 rounded-md bg-slate-200" /> OR Suite Target Capacity
              </span>
            </div>
          </div>
        </Card>

        {/* Surgical Specialty Breakdown Chart */}
        <Card
          title="Surgical Specialty Distribution"
          subtitle="Case volume distribution across clinical services"
        >
          <div className="space-y-4">
            <div className="space-y-3 pt-2">
              {analytics.categoryBreakdown.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{cat.name}</span>
                    <span className="font-semibold text-slate-500">{cat.count} cases ({cat.percent}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-brand-navy flex items-center justify-between">
              <span>Joint Replacement accounts for highest tray turnover.</span>
              <span className="font-bold">Stryker Triathlon Dominant</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Procedure Preparation History Table */}
      <Card
        title="Procedure Preparation Audit History"
        subtitle="Chronological log of case readiness, surgical teams, and completion states"
        padding={false}
      >
        <div className="p-4 border-b border-surface-border bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by procedure, surgeon, or patient..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-surface-border rounded-xl focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="week">Past 7 Days</option>
              <option value="month">Current Month (November 2026)</option>
              <option value="quarter">Past Quarter (Q3-Q4)</option>
              <option value="all">All Historical Records</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Case ID</th>
                <th className="py-3 px-4">Procedure</th>
                <th className="py-3 px-4">Surgeon</th>
                <th className="py-3 px-4">Surgery Date</th>
                <th className="py-3 px-4 text-center">Readiness</th>
                <th className="py-3 px-4 sm:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/70 text-xs">
              {filteredHistory.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-brand-navy">
                    {p.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.patientName} ({p.patientId})</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {p.surgeon}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {formatDate(p.date)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-xs text-brand-navy">
                      {p.readiness}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <Badge
                      variant={
                        p.status === 'Completed'
                          ? 'success'
                          : p.status === 'In Progress'
                          ? 'primary'
                          : 'warning'
                      }
                      dot
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Report Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Clinical Readiness Report"
        subtitle="Generate certified hospital audit documentation"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
              Generate Export
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-text mb-2">Select Export Format</label>
            <div className="space-y-2">
              <label
                onClick={() => setExportFormat('pdf')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-blue-50 border-brand-primary text-brand-navy font-bold'
                    : 'bg-white border-surface-border text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Standard Hospital PDF (Printable)</p>
                  <p className="text-[11px] text-slate-500">Includes sign-off signatures & readiness percentages</p>
                </div>
                <input
                  type="radio"
                  name="format"
                  checked={exportFormat === 'pdf'}
                  onChange={() => {}}
                  className="text-brand-primary"
                />
              </label>

              <label
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-blue-50 border-brand-primary text-brand-navy font-bold'
                    : 'bg-white border-surface-border text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Spreadsheet CSV / Excel</p>
                  <p className="text-[11px] text-slate-500">Complete raw table with SKU numbers and lot tracking</p>
                </div>
                <input
                  type="radio"
                  name="format"
                  checked={exportFormat === 'csv'}
                  onChange={() => {}}
                  className="text-brand-primary"
                />
              </label>

              <label
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  exportFormat === 'json'
                    ? 'bg-blue-50 border-brand-primary text-brand-navy font-bold'
                    : 'bg-white border-surface-border text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Machine-Readable JSON</p>
                  <p className="text-[11px] text-slate-500">For EHR / HL7 Fast Healthcare Interoperability API</p>
                </div>
                <input
                  type="radio"
                  name="format"
                  checked={exportFormat === 'json'}
                  onChange={() => {}}
                  className="text-brand-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
