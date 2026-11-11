import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Upload,
  FileText,
  CheckCircle2,
  Download,
  ExternalLink,
  Tag,
  Calendar,
  X,
  Eye,
  Building2,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useProcedure } from '../context/ProcedureContext';
import { useToast } from '../context/ToastContext';

export const ManualsPage = () => {
  const { manuals, addManual } = useProcedure();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal states
  const [activeManualReader, setActiveManualReader] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Reader modal sub-state
  const [readerActiveSectionIndex, setReaderActiveSectionIndex] = useState(0);
  const [readerSearchTerm, setReaderSearchTerm] = useState('');

  // Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    manufacturer: 'Stryker',
    docType: 'Surgical Technique',
    category: 'Orthopedic Knee',
    procedure: 'Total Knee Arthroplasty',
    version: 'Rev 2026.1',
    fileName: 'Stryker_Technique_Guide.pdf',
    summary: 'Detailed surgical protocol covering component alignment, bone preparation, and trialing.',
    aiIndexed: true
  });

  // Filtering
  const manufacturers = ['ALL', 'Stryker', 'Zimmer Biomet', 'DePuy Synthes', 'Medtronic', 'Smith & Nephew'];
  const categories = ['ALL', 'Orthopedic Knee', 'Spinal Instrumentation', 'Trauma & Reconstruction', 'Upper Extremity'];

  const filteredManuals = manuals.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.procedure?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.docType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMfr =
      selectedManufacturer === 'ALL' ||
      m.manufacturer.toLowerCase() === selectedManufacturer.toLowerCase();

    const matchesCat =
      selectedCategory === 'ALL' ||
      m.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesMfr && matchesCat;
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.title.trim()) {
      toast.error('Please enter a manual title.');
      return;
    }

    const created = addManual({
      title: uploadFormData.title,
      manufacturer: uploadFormData.manufacturer,
      docType: uploadFormData.docType,
      category: uploadFormData.category,
      procedure: uploadFormData.procedure,
      version: uploadFormData.version,
      pages: 42,
      fileSize: '7.8 MB',
      summary: uploadFormData.summary,
      tags: [uploadFormData.manufacturer, uploadFormData.docType, 'Clinical OEM'],
      sections: [
        'Indications and Contraindications',
        'Surgical Exposure and Soft Tissue Release',
        'Instrument Assembly & Sizing Guide',
        'Final Trialing & Component Fixation'
      ]
    });

    setIsUploadModalOpen(false);
    toast.success(`Manual "${created.title}" uploaded and indexed for AI cross-referencing!`);
    setUploadFormData({
      title: '',
      manufacturer: 'Stryker',
      docType: 'Surgical Technique',
      category: 'Orthopedic Knee',
      procedure: 'Total Knee Arthroplasty',
      version: 'Rev 2026.1',
      fileName: 'Stryker_Technique_Guide.pdf',
      summary: 'Detailed surgical protocol covering component alignment, bone preparation, and trialing.',
      aiIndexed: true
    });
  };

  const handleDownloadSimulation = (title) => {
    toast.info(`Preparing secure hospital PDF download: ${title}`);
    setTimeout(() => {
      toast.success('Download completed successfully.');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            Surgical Technique Manuals
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
            Manufacturer-verified operative protocols, Instructions For Use (IFU), and reprocessing guides.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<Upload className="w-4 h-4" />}
          className="shadow-sm"
        >
          Upload Surgical Manual
        </Button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-surface-border p-4 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by manual title, OEM (Stryker, Zimmer), keyword, or procedure..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-text placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <div className="w-48">
              <select
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-text cursor-pointer"
              >
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m === 'ALL' ? 'All Manufacturers' : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-text cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Specialties' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Quick Filters:
          </span>
          {['Stryker Triathlon', 'Zimmer Persona', 'DePuy ATTUNE', 'Medtronic Solera'].map((preset) => (
            <button
              key={preset}
              onClick={() => setSearchQuery(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-brand-primary border border-slate-200 text-slate-600 transition-colors whitespace-nowrap text-xs font-medium"
            >
              {preset}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedManufacturer('ALL'); setSelectedCategory('ALL'); }}
              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Manuals Grid */}
      {filteredManuals.length === 0 ? (
        <EmptyState
          title="No surgical manuals found"
          description="Try broadening your search query or reset the manufacturer filter to view all operative guides."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedManufacturer('ALL');
            setSelectedCategory('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredManuals.map((man) => (
            <div
              key={man.id}
              className="bg-white rounded-2xl border border-surface-border p-5 shadow-soft hover:shadow-card hover:border-blue-200 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Meta Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-brand-primary flex items-center justify-center shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-brand-navy block">{man.manufacturer}</span>
                      <span className="text-[10px] text-slate-400 block">{man.version}</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      man.docType?.toLowerCase().includes('technique')
                        ? 'primary'
                        : man.docType?.toLowerCase().includes('ifu')
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {man.docType}
                  </Badge>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-primary transition-colors leading-snug">
                  {man.title}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {man.summary}
                </p>

                {/* Tags */}
                {man.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {man.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions & Details */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {man.pages} Pages • {man.fileSize}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadSimulation(man.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setActiveManualReader(man);
                      setReaderActiveSectionIndex(0);
                    }}
                    rightIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Read
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Reader Modal */}
      {activeManualReader && (
        <Modal
          isOpen={!!activeManualReader}
          onClose={() => setActiveManualReader(null)}
          title={activeManualReader.title}
          subtitle={`${activeManualReader.manufacturer} • ${activeManualReader.docType} • ${activeManualReader.version}`}
          maxWidth="max-w-4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Verified Clinical Document • Hospital Archive ID: {activeManualReader.id}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSimulation(activeManualReader.title)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveManualReader(null)}>
                  Close Viewer
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[460px]">
            {/* Table of Contents (4 cols) */}
            <div className="md:col-span-4 border-r border-surface-border pr-4 space-y-2">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={readerSearchTerm}
                  onChange={(e) => setReaderSearchTerm(e.target.value)}
                  placeholder="Search in manual..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-lg"
                />
              </div>

              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Table of Contents:
              </span>

              <div className="space-y-1 max-h-[360px] overflow-y-auto">
                {activeManualReader.sections?.map((sec, idx) => (
                  <button
                    key={sec}
                    onClick={() => setReaderActiveSectionIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      readerActiveSectionIndex === idx
                        ? 'bg-blue-50 text-brand-primary font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 mr-1.5">0{idx + 1}.</span>
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Reader Body (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-surface-border">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-brand-navy">
                    Section {readerActiveSectionIndex + 1}: {activeManualReader.sections?.[readerActiveSectionIndex] || 'Operative Protocol'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Page {readerActiveSectionIndex * 8 + 12} of {activeManualReader.pages}</span>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-700 font-normal">
                  <p>
                    <strong>1. Clinical Positioning and Exposure:</strong> Place the patient in standard supine position. Secure the pneumatic tourniquet high on the thigh. Establish surgical draping following aseptic OR technique.
                  </p>
                  <p>
                    <strong>2. Intramedullary Rod Insertion:</strong> Drill the distal femoral canal 10mm anterior to the femoral origin of the posterior cruciate ligament, slightly medial to the center of the intercondylar notch.
                  </p>
                  <p>
                    <strong>3. Alignment & Valgus Angle Selection:</strong> Select the calibrated valgus bushing matching the pre-op radiographic alignment (recommended 6° for moderate varus deformities). Slide the cutting block firmly against the distal condyles and pin securely with two parallel trocar pins.
                  </p>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                    <strong>OEM Caution Note:</strong> Verify that the cutting block is flush against bone before initiating resection. Inspect the oscillating saw blade thickness (1.19mm) to avoid resection gap distortion.
                  </div>
                </div>
              </div>

              {/* Cross-reference tag */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-brand-navy">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  Linked in AI Workbench for Case #SR-2026-0841
                </span>
                <span className="font-semibold text-emerald-700">Verified Citation</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Manual Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Surgical Technique Manual"
        subtitle="Ingest manufacturer technique guides, IFU documents, and hospital tray protocols"
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUploadSubmit} leftIcon={<Upload className="w-4 h-4" />}>
              Upload & Index Manual
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-text mb-1">Manual Title *</label>
            <input
              type="text"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
              placeholder="e.g. Stryker Mako Robotic Total Knee Surgical Protocol"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-text mb-1">Manufacturer *</label>
              <select
                value={uploadFormData.manufacturer}
                onChange={(e) => setUploadFormData({ ...uploadFormData, manufacturer: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
              >
                <option value="Stryker">Stryker</option>
                <option value="Zimmer Biomet">Zimmer Biomet</option>
                <option value="DePuy Synthes">DePuy Synthes</option>
                <option value="Medtronic">Medtronic</option>
                <option value="Smith & Nephew">Smith & Nephew</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-text mb-1">Document Type *</label>
              <select
                value={uploadFormData.docType}
                onChange={(e) => setUploadFormData({ ...uploadFormData, docType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
              >
                <option value="Surgical Technique">Surgical Technique</option>
                <option value="Instructions For Use (IFU)">Instructions For Use (IFU)</option>
                <option value="Sizing Guide">Sizing Guide</option>
                <option value="Reprocessing Guide">Reprocessing Guide</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-text mb-1">Clinical Specialty</label>
              <input
                type="text"
                value={uploadFormData.category}
                onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                placeholder="e.g. Orthopedic Knee"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-text mb-1">Revision / Version</label>
              <input
                type="text"
                value={uploadFormData.version}
                onChange={(e) => setUploadFormData({ ...uploadFormData, version: e.target.value })}
                placeholder="e.g. Rev 2026.1"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-text mb-1">Document Summary</label>
            <textarea
              rows={2}
              value={uploadFormData.summary}
              onChange={(e) => setUploadFormData({ ...uploadFormData, summary: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-4 text-center">
            <Upload className="w-6 h-6 text-brand-primary mx-auto mb-1" />
            <p className="font-semibold text-brand-navy">Drop PDF manual file here</p>
            <p className="text-[11px] text-slate-400">PDF, DOCX up to 50 MB</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={uploadFormData.aiIndexed}
              onChange={(e) => setUploadFormData({ ...uploadFormData, aiIndexed: e.target.checked })}
              className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/30"
            />
            <span className="text-xs text-slate-600 font-medium">
              Automatically index sections for SurgReady AI Workbench cross-referencing
            </span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

