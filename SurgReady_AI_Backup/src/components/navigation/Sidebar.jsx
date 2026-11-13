import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Boxes,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  ShieldCheck,
  Building2,
  HeartPulse,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProcedure } from '../../context/ProcedureContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, currentUser } = useAuth();
  const { procedures, inventory } = useProcedure();
  const navigate = useNavigate();

  const userRole = (currentUser?.role || 'doctor').toLowerCase();

  const pendingCount = procedures.filter(
    (p) => p.status === 'Pending Review' || p.status === 'In Progress'
  ).length;

  const lowStockCount = inventory.filter(
    (i) => i.stock_status === 'Low Stock' || i.stock_status === 'Out of Stock' || i.status === 'Low Stock' || i.status === 'Critical'
  ).length;

  // Role-Based Navigation Configuration
  const getNavItemsForRole = () => {
    switch (userRole) {
      case 'management':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'New Procedure', path: '/new-procedure', icon: PlusCircle, highlight: true },
          {
            name: 'Hospital Inventory',
            path: '/inventory',
            icon: Boxes,
            count: lowStockCount > 0 ? lowStockCount : null,
            countType: 'warning'
          },
          { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
          { name: 'Surgical Manuals', path: '/manuals', icon: BookOpen },
          { name: 'System Settings', path: '/settings', icon: Settings },
        ];

      case 'nurse':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'New Procedure', path: '/new-procedure', icon: PlusCircle, highlight: true },
          {
            name: 'Surgical Checklist',
            path: '/checklist',
            icon: ClipboardCheck,
            count: pendingCount > 0 ? pendingCount : null
          },
          {
            name: 'Inventory & Trays',
            path: '/inventory',
            icon: Boxes,
            count: lowStockCount > 0 ? lowStockCount : null,
            countType: 'warning'
          },
          { name: 'Surgical Manuals', path: '/manuals', icon: BookOpen },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];

      case 'patient':
        return [
          { name: 'My Procedure & Care', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Patient Guides', path: '/manuals', icon: BookOpen },
          { name: 'Account Settings', path: '/settings', icon: Settings },
        ];

      case 'doctor':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'New Procedure', path: '/new-procedure', icon: PlusCircle, highlight: true },
          { name: 'Surgical Manuals', path: '/manuals', icon: BookOpen },
          {
            name: 'Inventory',
            path: '/inventory',
            icon: Boxes,
            count: lowStockCount > 0 ? lowStockCount : null,
            countType: 'warning'
          },
          {
            name: 'Surgical Checklist',
            path: '/checklist',
            icon: ClipboardCheck,
            count: pendingCount > 0 ? pendingCount : null
          },
          { name: 'Reports', path: '/reports', icon: BarChart3 },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItemsForRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role visual configuration
  const getRoleBadgeConfig = () => {
    switch (userRole) {
      case 'management':
        return {
          label: 'MANAGEMENT',
          icon: Building2,
          bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'nurse':
        return {
          label: 'NURSE',
          icon: HeartPulse,
          bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'patient':
        return {
          label: 'PATIENT',
          icon: User,
          bgColor: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'doctor':
      default:
        return {
          label: 'DOCTOR',
          icon: ShieldCheck,
          bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
        };
    }
  };

  const roleBadge = getRoleBadgeConfig();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-surface-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl healthcare-gradient flex items-center justify-center text-white shadow-card">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-brand-navy text-lg tracking-tight">SurgReady</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-brand-light text-brand-primary border border-blue-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-muted font-medium tracking-tight">Smart Surgical Preparation</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {userRole.toUpperCase()} PORTAL
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${roleBadge.bgColor}`}>
              {roleBadge.label}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-light text-brand-primary font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-surface-hover'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-brand-primary'
                            : 'text-slate-400 group-hover:text-brand-navy'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-brand-primary">
                          {item.badge}
                        </span>
                      )}
                      {item.count && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.countType === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-brand-primary'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Clinical Safe Mode Card in Sidebar */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Hospital Security</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Role-verified access. Audited session with encrypted credentials.
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-surface-border bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full object-cover border border-blue-200"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-text truncate">{currentUser?.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleBadge.bgColor}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-status-error hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
