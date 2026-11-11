import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Bell,
  Mail,
  History,
  ShieldCheck,
  Check,
  Building2,
  X
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useProcedure } from '../context/ProcedureContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateUtils';

export const InventoryPage = () => {
  const { currentUser } = useAuth();
  const {
    inventory,
    managementNotifications,
    inventoryTransactions,
    updateInventoryStock,
    addInventoryItem,
    markNotificationAsRead
  } = useProcedure();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'alerts' | 'transactions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL'); // 'ALL' | 'Normal Stock' | 'Low Stock' | 'Out of Stock'

  // Edit / Restock Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editReason, setEditReason] = useState('Standard Stock Adjustment');

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    item_id: 'INV-' + Math.floor(2000 + Math.random() * 8000),
    name: '',
    category: 'Implants',
    manufacturer: 'Stryker',
    product_model: 'TRIA-MOD-2026',
    available_stock: 10,
    minimum_stock_level: 3,
    unit: 'Boxes',
  });

  const categories = ['ALL', 'Implants', 'Surgical Trays', 'Disposables', 'Power Equipment'];
  const stockStatuses = ['ALL', 'Normal Stock', 'Low Stock', 'Out of Stock'];

  // Metrics
  const totalItems = inventory.length;
  const normalStockCount = inventory.filter((i) => i.stock_status === 'Normal Stock').length;
  const lowStockCount = inventory.filter((i) => i.stock_status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((i) => i.stock_status === 'Out of Stock').length;
  const unreadAlertsCount = managementNotifications.filter((n) => !n.is_read).length;

  // Filtered Items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.item_id || item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product_model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.manufacturer || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesStatus =
      selectedStockStatus === 'ALL' || item.stock_status === selectedStockStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditQty(item.available_stock);
    setEditReason('Manual Count Reconciled');
  };

  // Submit Stock Update
  const handleSaveStockUpdate = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const newQtyNumber = Number(editQty);
    const result = updateInventoryStock(
      editingItem.item_id || editingItem.id,
      newQtyNumber,
      editReason,
      currentUser?.name || 'Authorized Staff'
    );

    if (result?.triggeredAlert) {
      toast.warning(
        `LOW_STOCK Alert Dispatched to Hospital Management for ${editingItem.name} (${newQtyNumber} / ${editingItem.minimum_stock_level} ${editingItem.unit})`
      );
    } else {
      toast.success(
        `Inventory updated for ${editingItem.name}: ${newQtyNumber} ${editingItem.unit || 'Units'}.`
      );
    }

    setEditingItem(null);
  };

  // Quick Adjustment handler
  const handleQuickAdjust = (item, delta) => {
    const current = Number(item.available_stock || 0);
    const nextQty = Math.max(0, current + delta);
    const actionReason = delta > 0 ? 'Quick Restock Delivery' : 'Quick OR Case Consumption';

    const result = updateInventoryStock(
      item.item_id || item.id,
      nextQty,
      actionReason,
      currentUser?.name || 'Staff User'
    );

    if (result?.triggeredAlert) {
      toast.warning(`LOW_STOCK Alert Dispatched: ${item.name} is now ${nextQty} ${item.unit}.`);
    } else {
      toast.info(`Stock adjusted for ${item.name}: ${nextQty} ${item.unit}.`);
    }
  };

  // Add Item Submit
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      toast.error('Item name is required.');
      return;
    }

    const available = Number(addFormData.available_stock);
    const threshold = Number(addFormData.minimum_stock_level);
    const status = available <= 0 ? 'Out of Stock' : available <= threshold ? 'Low Stock' : 'Normal Stock';

    addInventoryItem({
      item_id: addFormData.item_id || 'INV-' + Math.floor(2000 + Math.random() * 8000),
      name: addFormData.name.trim(),
      category: addFormData.category,
      manufacturer: addFormData.manufacturer,
      product_model: addFormData.product_model,
      available_stock: available,
      minimum_stock_level: threshold,
      unit: addFormData.unit || 'Units',
      last_updated: new Date().toISOString(),
      stock_status: status,
      alert_active: available <= threshold
    });

    toast.success(`New item '${addFormData.name}' registered to hospital inventory.`);
    setIsAddModalOpen(false);
    setAddFormData({
      item_id: 'INV-' + Math.floor(2000 + Math.random() * 8000),
      name: '',
      category: 'Implants',
      manufacturer: 'Stryker',
      product_model: 'TRIA-MOD-2026',
      available_stock: 10,
      minimum_stock_level: 3,
      unit: 'Boxes',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">Smart Hospital Inventory</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-primary border border-blue-200">
              Live Threshold System
            </span>
          </div>
          <p className="text-slate-muted text-xs sm:text-sm mt-1">
            Real-time tracking of surgical implants, sterile trays, and automatic hospital management notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => setActiveTab('alerts')}
            leftIcon={<Bell className="w-4 h-4 text-amber-600" />}
          >
            Management Alerts ({managementNotifications.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Item
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Tracked Items</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalItems}</span>
            <span className="text-[11px] text-slate-500">Across 4 hospital departments</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Normal Stock</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{normalStockCount}</span>
            <span className="text-[11px] text-emerald-700">Above minimum threshold</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{lowStockCount}</span>
            <span className="text-[11px] text-amber-700">Below threshold level</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{outOfStockCount}</span>
            <span className="text-[11px] text-rose-700">Immediate action needed</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Low Stock Threshold Alerts Active ({lowStockCount + outOfStockCount} Items)
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Automated alert notifications dispatched to <strong className="font-semibold">management@stjude-health.org</strong> via FastAPI backend.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedStockStatus('Low Stock');
                setActiveTab('inventory');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
            >
              Filter Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
            >
              View Management Alerts
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-brand-primary text-brand-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Monitored Inventory ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-amber-600 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            Management Alerts History ({managementNotifications.length})
            {unreadAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-brand-primary text-brand-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            Transaction Audit Trail ({inventoryTransactions.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: ACTIVE INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Item Name, ID, Model, or Manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Status:</span>
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {stockStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table displaying all 10 required fields */}
          <Card className="p-0 overflow-hidden shadow-card border-slate-200/80 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">1. Item ID</th>
                    <th className="py-3 px-3">2. Item Name</th>
                    <th className="py-3 px-3">3. Category</th>
                    <th className="py-3 px-3">4. Manufacturer</th>
                    <th className="py-3 px-3">5. Product Model</th>
                    <th className="py-3 px-3 text-center">6. Available Stock</th>
                    <th className="py-3 px-3 text-center">7. Min Level</th>
                    <th className="py-3 px-3 text-center">8. Unit</th>
                    <th className="py-3 px-3 text-center">9. Stock Status</th>
                    <th className="py-3 px-3 text-center">10. Last Updated</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-10 text-center text-slate-400">
                        <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">No inventory items matched your filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = item.stock_status === 'Low Stock';
                      const isOut = item.stock_status === 'Out of Stock';

                      return (
                        <tr
                          key={item.item_id || item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isOut
                              ? 'bg-rose-50/20'
                              : isLow
                              ? 'bg-amber-50/20'
                              : ''
                          }`}
                        >
                          {/* 1. Item ID */}
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                            {item.item_id || item.id}
                          </td>

                          {/* 2. Item Name & Verified Clinical Implant Attributes (Phase 8) */}
                          <td className="py-3 px-3 max-w-xs">
                            <div className="font-bold text-brand-navy text-xs leading-snug">
                              {item.name}
                            </div>
                            {(item.anatomical_site || item.material || item.available_sizes || item.compatibility_doc) && (
                              <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                {item.anatomical_site && (
                                  <span className="inline-block text-slate-600 mr-2 font-medium">
                                    Site: <strong className="text-slate-700">{item.anatomical_site}</strong>
                                    {item.material ? ` • ${item.material}` : ''}
                                  </span>
                                )}
                                {item.available_sizes && (
                                  <div className="text-slate-500 font-mono text-[9px] truncate">
                                    Sizes: {item.available_sizes}
                                  </div>
                                )}
                                {item.compatibility_doc && (
                                  <div className="text-blue-600/90 text-[9px] truncate" title={item.compatibility_doc}>
                                    Ref: {item.compatibility_doc}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 3. Category */}
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                              {item.category}
                            </span>
                          </td>

                          {/* 4. Manufacturer */}
                          <td className="py-3 px-3 text-slate-700 font-semibold">
                            {item.manufacturer}
                          </td>

                          {/* 5. Product Model */}
                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                            {item.product_model || item.sku || 'N/A'}
                          </td>

                          {/* 6. Available Stock */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-black text-sm ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.available_stock}
                            </span>
                          </td>

                          {/* 7. Minimum Stock Level */}
                          <td className="py-3 px-3 text-center text-slate-500 font-semibold">
                            {item.minimum_stock_level}
                          </td>

                          {/* 8. Unit */}
                          <td className="py-3 px-3 text-center text-slate-500">
                            {item.unit || 'Units'}
                          </td>

                          {/* 9. Stock Status */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isOut
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {item.stock_status}
                            </span>
                          </td>

                          {/* 10. Last Updated */}
                          <td className="py-3 px-3 text-center text-[10px] text-slate-400">
                            {formatDate(item.last_updated)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQuickAdjust(item, 5)}
                                title="Quick Restock +5"
                                className="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, -1)}
                                title="Quick Deduct 1"
                                className="px-2 py-1 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Stock / Audit"
                                className="p-1 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MANAGEMENT NOTIFICATIONS STREAM */}
      {activeTab === 'alerts' && (
        <Card className="p-5 shadow-card border-slate-200/80 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-brand-navy">Automatic Hospital Management Notifications</h3>
              </div>
              <p className="text-xs text-slate-muted mt-0.5">
                Sent automatically when any item stock falls to or below its minimum stock level.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="p-1 px-2.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                Destination: management@stjude-health.org
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {managementNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-700">No Low-Stock Alerts</p>
                <p className="text-xs text-slate-400 mt-1">All hospital inventory items are currently above threshold levels.</p>
              </div>
            ) : (
              managementNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.is_read
                      ? 'bg-slate-50/50 border-slate-200 opacity-80'
                      : 'bg-amber-50/50 border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          {notif.alert_type}: {notif.inventory_item_name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Threshold Reached
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                      {formatDate(notif.timestamp)}
                    </span>
                  </div>

                  {/* Notification Payload Spec */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600">
                    <div>
                      Hospital: <strong className="text-slate-800">{notif.hospital_name}</strong>
                    </div>
                    <div>
                      Manufacturer: <strong className="text-slate-800">{notif.manufacturer}</strong>
                    </div>
                    <div>
                      Current Stock: <strong className="text-rose-600">{notif.current_stock}</strong> / Min: {notif.minimum_stock_level}
                    </div>
                    <div>
                      Channel: <strong className="text-emerald-700">In-App + Email</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      Recipient: {notif.recipient_email}
                    </span>

                    {!notif.is_read ? (
                      <button
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          toast.info(`Acknowledged notification for ${notif.inventory_item_name}.`);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-navy"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as Acknowledged
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged by Management
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: TRANSACTION AUDIT TRAIL */}
      {activeTab === 'transactions' && (
        <Card className="p-5 shadow-card border-slate-200/80 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-extrabold text-brand-navy">Inventory Transaction Audit Trail</h3>
              </div>
              <p className="text-xs text-slate-muted mt-0.5">
                Complete chronological log of stock adjustments, restock deliveries, and OR consumption.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              {inventoryTransactions.length} Logged Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3 text-center">Previous</th>
                  <th className="py-2.5 px-3 text-center">Change</th>
                  <th className="py-2.5 px-3 text-center">New Stock</th>
                  <th className="py-2.5 px-3 text-center">Action Type</th>
                  <th className="py-2.5 px-3">Authorized By</th>
                  <th className="py-2.5 px-3">Reason / Notes</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  inventoryTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-[11px]">{tx.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{tx.item_name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{tx.previous_stock}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-bold ${
                            tx.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.change_amount > 0 ? `+${tx.change_amount}` : tx.change_amount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{tx.new_stock}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                            tx.action_type === 'RESTOCK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.action_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{tx.updated_by}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">{tx.notes || '—'}</td>
                      <td className="py-2.5 px-3 text-right text-[10px] text-slate-400">{formatDate(tx.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* EDIT / UPDATE STOCK MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Update Stock Quantity</h3>
                  <p className="text-[11px] text-slate-500">Item ID: {editingItem.item_id || editingItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="py-4 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-800">{editingItem.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Manufacturer: <strong>{editingItem.manufacturer}</strong> • Minimum Level: <strong>{editingItem.minimum_stock_level} {editingItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Available Stock ({editingItem.unit || 'Units'})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditQty((prev) => Math.max(0, Number(prev) - 1))}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditQty((prev) => Number(prev) + 5)}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                  >
                    +5
                  </button>
                </div>

                {Number(editQty) <= editingItem.minimum_stock_level && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Notice: This value will trigger a LOW_STOCK management alert.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Adjustment Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Physical count audit, supplier delivery"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Save & Log Audit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Hospital Inventory Item</h3>
                  <p className="text-[11px] text-slate-500">Register new surgical stock with 10 required attributes</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item ID</label>
                  <input
                    type="text"
                    value={addFormData.item_id}
                    onChange={(e) => setAddFormData({ ...addFormData, item_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Implants">Implants</option>
                    <option value="Surgical Trays">Surgical Trays</option>
                    <option value="Disposables">Disposables</option>
                    <option value="Power Equipment">Power Equipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., Stryker Triathlon Cruciate Retaining Femoral Component"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={addFormData.manufacturer}
                    onChange={(e) => setAddFormData({ ...addFormData, manufacturer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Model</label>
                  <input
                    type="text"
                    value={addFormData.product_model}
                    onChange={(e) => setAddFormData({ ...addFormData, product_model: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.available_stock}
                    onChange={(e) => setAddFormData({ ...addFormData, available_stock: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={addFormData.minimum_stock_level}
                    onChange={(e) => setAddFormData({ ...addFormData, minimum_stock_level: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={addFormData.unit}
                    onChange={(e) => setAddFormData({ ...addFormData, unit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-emerald-600 hover:bg-emerald-700"
                >
                  Register Inventory Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
