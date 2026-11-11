import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  AlertTriangle,
  Bell,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Minus,
  RefreshCw,
  Mail,
  Calendar,
  Filter,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useProcedure } from '../../context/ProcedureContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dateUtils';
import { ManagementChatbot } from '../chatbot/ManagementChatbot';

export const ManagementDashboard = () => {
  const { currentUser } = useAuth();
  const {
    inventory,
    managementNotifications,
    inventoryTransactions,
    updateInventoryStock,
    markNotificationAsRead
  } = useProcedure();
  const navigate = useNavigate();
  const toast = useToast();

  const [filterAlertStatus, setFilterAlertStatus] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [quickRestockItemId, setQuickRestockItemId] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockReason, setRestockReason] = useState('Emergency Management Restock');

  // Low-Stock items calculation
  const lowStockItems = inventory.filter(
    (item) => item.stock_status === 'Low Stock' || item.stock_status === 'Out of Stock'
  );
  const outOfStockCount = inventory.filter((item) => item.stock_status === 'Out of Stock').length;
  const normalStockCount = inventory.filter((item) => item.stock_status === 'Normal Stock').length;

  // Filtered Notifications
  const filteredNotifications = managementNotifications.filter((n) => {
    if (filterAlertStatus === 'UNREAD') return !n.is_read;
    if (filterAlertStatus === 'READ') return n.is_read;
    return true;
  });

  const unreadAlertCount = managementNotifications.filter((n) => !n.is_read).length;

  const handleExecuteRestock = (item) => {
    const current = Number(item.available_stock || 0);
    const added = Number(restockAmount) || 10;
    const nextQty = current + added;

    updateInventoryStock(item.item_id || item.id, nextQty, restockReason, currentUser?.name || 'Hospital Management');
    toast.success(`Restocked ${item.name} by +${added} ${item.unit || 'Units'}. Stock is now ${nextQty}.`);
    setQuickRestockItemId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Management Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-60 -top-10 w-52 h-52 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Hospital Executive Management • St. Jude Medical Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operations & Inventory Oversight
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Real-time monitoring of surgical supply readiness, critical low-stock thresholds, and hospital staff allocation across operating suites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/inventory')}
            >
              Full Inventory Table
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold border-transparent shadow-lg"
              leftIcon={<Boxes className="w-4 h-4 text-white" />}
              onClick={() => navigate('/reports')}
            >
              Executive Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Inventory"
          value={inventory.length}
          subtitle="Hospital items tracked"
          icon={Boxes}
          color="blue"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Low-Stock Alerts"
          value={lowStockItems.length}
          subtitle={`${outOfStockCount} out of stock`}
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Active Notifications"
          value={unreadAlertCount}
          subtitle="Unacknowledged alerts"
          icon={Bell}
          color={unreadAlertCount > 0 ? 'amber' : 'blue'}
        />
        <StatCard
          title="Clinical Staff"
          value="98"
          subtitle="24 Doctors • 68 Nurses • 6 Admins"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Low Stock Urgent Attention Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-950">
                    Low Stock Threshold Warning ({lowStockItems.length} Items Require Restock)
                  </h4>
                  <Badge variant="warning" size="sm">Action Required</Badge>
                </div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  These items have fallen below their configured minimum threshold. Automated management notifications have been dispatched.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 self-start sm:self-center"
              onClick={() => navigate('/inventory')}
            >
              Manage in Inventory
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-3 border-t border-amber-200/80">
            {lowStockItems.slice(0, 6).map((item) => {
              const isOut = item.stock_status === 'Out of Stock';
              return (
                <div
                  key={item.item_id || item.id}
                  className="bg-white rounded-xl p-3 border border-amber-200/70 flex items-center justify-between shadow-xs hover:border-amber-300 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isOut ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.stock_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stock: <span className="font-bold text-slate-700">{item.available_stock}</span> / Min: {item.minimum_stock_level} {item.unit}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.manufacturer} • {item.product_model}
                    </p>
                  </div>

                  <button
                    onClick={() => setQuickRestockItemId(item.item_id || item.id)}
                    className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    Restock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Restock Inline Form Modal */}
      {quickRestockItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {(() => {
              const targetItem = inventory.find((i) => (i.item_id || i.id) === quickRestockItemId);
              if (!targetItem) return null;
              return (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Boxes className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Authorize Stock Restock</h3>
                        <p className="text-[11px] text-slate-500">ID: {targetItem.item_id || targetItem.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuickRestockItemId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="py-4 space-y-3.5">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-800">{targetItem.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Current: <strong className="text-slate-700">{targetItem.available_stock} {targetItem.unit}</strong> • Minimum Threshold: <strong>{targetItem.minimum_stock_level} {targetItem.unit}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Restock Quantity to Add ({targetItem.unit || 'Units'})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={restockAmount}
                          onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setRestockAmount(5)}
                          className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestockAmount(10)}
                          className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestockAmount(25)}
                          className="px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          +25
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        New stock will become: <strong className="text-indigo-600">{(targetItem.available_stock || 0) + Number(restockAmount)} {targetItem.unit}</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Authorized Management Audit Reason
                      </label>
                      <input
                        type="text"
                        value={restockReason}
                        onChange={(e) => setRestockReason(e.target.value)}
                        placeholder="e.g., Supplier bulk replenishment shipment"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickRestockItemId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      onClick={() => handleExecuteRestock(targetItem)}
                    >
                      Confirm Restock & Audit
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Main Grid: Live Inventory Quick Manager + Notification History Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Smart Inventory Overview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-brand-navy">Hospital Inventory Status</h3>
                <p className="text-xs text-slate-muted">Live stock monitoring against minimum safety levels</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-brand-primary"
                onClick={() => navigate('/inventory')}
              >
                View All {inventory.length} Items <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-2">Item Details</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2 text-center">Available</th>
                    <th className="py-2.5 px-2 text-center">Threshold</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.slice(0, 7).map((item) => {
                    const isLow = item.stock_status === 'Low Stock';
                    const isOut = item.stock_status === 'Out of Stock';
                    return (
                      <tr key={item.item_id || item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.item_id || item.id} • {item.manufacturer}</p>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 font-medium">{item.category}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                          {item.available_stock} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500 font-medium">
                          {item.minimum_stock_level} {item.unit}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-100 text-rose-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.stock_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={() => setQuickRestockItemId(item.item_id || item.id)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-semibold text-slate-600 transition-colors"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Inventory Transactions Log */}
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Inventory Transaction Audit Trail</h4>
                <p className="text-[11px] text-slate-muted">Stock movements and authorized adjustments</p>
              </div>
              <Badge variant="neutral" size="sm">Audit Log</Badge>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {inventoryTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No transactions recorded yet.</p>
              ) : (
                inventoryTransactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{tx.item_name}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                            tx.action_type === 'RESTOCK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.action_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tx.previous_stock} → <strong className="text-slate-700">{tx.new_stock}</strong> ({tx.change_amount > 0 ? `+${tx.change_amount}` : tx.change_amount}) • By {tx.updated_by}
                      </p>
                      {tx.notes && <p className="text-[10px] text-slate-400 italic">"{tx.notes}"</p>}
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {formatDate(tx.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Management Notifications Stream */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-brand-navy">Management Notifications</h3>
                  <p className="text-[11px] text-slate-muted">Automated LOW_STOCK alerts to management email</p>
                </div>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setFilterAlertStatus('ALL')}
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    filterAlertStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All ({managementNotifications.length})
                </button>
                <button
                  onClick={() => setFilterAlertStatus('UNREAD')}
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    filterAlertStatus === 'UNREAD' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Unread ({unreadAlertCount})
                </button>
              </div>
            </div>

            {/* Notification recipient note */}
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-[11px] text-blue-900 mb-3">
              <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>
                Dispatch Destination: <strong className="font-semibold">management@stjude-health.org</strong>
              </span>
            </div>

            {/* Notifications List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                  <p className="text-xs font-semibold">No notifications in this filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All stock thresholds are currently nominal.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.is_read
                        ? 'bg-white border-slate-200/80 opacity-80'
                        : 'bg-amber-50/60 border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-extrabold text-slate-900">
                          {notif.alert_type}: {notif.inventory_item_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {formatDate(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 p-2 rounded-lg bg-white/80 border border-slate-200/70 text-[10px] text-slate-600">
                      <div>
                        Hospital: <strong className="text-slate-800">{notif.hospital_name}</strong>
                      </div>
                      <div>
                        Manufacturer: <strong className="text-slate-800">{notif.manufacturer}</strong>
                      </div>
                      <div>
                        Stock: <strong className="text-rose-600">{notif.current_stock}</strong> (Threshold: {notif.minimum_stock_level})
                      </div>
                      <div>
                        Delivery: <strong className="text-emerald-700">In-App + Email</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-400">
                        Recipient: {notif.recipient_email}
                      </span>
                      {!notif.is_read ? (
                        <button
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            toast.info(`Marked notification for ${notif.inventory_item_name} as read.`);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-navy"
                        >
                          <Check className="w-3 h-3" /> Mark as Acknowledged
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Hospital Staff & Role Directory Summary */}
          <Card className="p-5 shadow-card border-slate-100">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-brand-navy">Authorized Role Directory</h4>
              <Badge variant="primary" size="sm">4 Categories</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="font-semibold text-blue-900">Surgeons & Doctors (DOCTOR)</span>
                <span className="font-bold text-blue-700">24 Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <span className="font-semibold text-indigo-900">Hospital Administration (MANAGEMENT)</span>
                <span className="font-bold text-indigo-700">6 Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="font-semibold text-emerald-900">Circulating & Scrub Nurses (NURSE)</span>
                <span className="font-bold text-emerald-700">68 Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="font-semibold text-amber-900">Enrolled Surgical Patients (PATIENT)</span>
                <span className="font-bold text-amber-700">142 Registered</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* SURGREADY Management Assistant (Visible only to authenticated management accounts) */}
      <ManagementChatbot />
    </div>
  );
};

