import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, Boxes, ClipboardCheck, ArrowUpRight } from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create New Procedure',
      description: 'Ingest patient info, 3D imaging & schedule',
      icon: PlusCircle,
      path: '/new-procedure',
      badge: 'Step Wizard',
      color: 'bg-blue-600 text-white',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Technique Manuals',
      description: 'Search OEM surgical guides & sizing charts',
      icon: BookOpen,
      path: '/manuals',
      badge: 'OEM Library',
      color: 'bg-brand-navy text-white',
      badgeColor: 'bg-slate-100 text-brand-navy'
    },
    {
      title: 'Check Inventory',
      description: 'Audit trays, implants & restock alerts',
      icon: Boxes,
      path: '/inventory',
      badge: 'OR Depot',
      color: 'bg-blue-500 text-white',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'View Surgical Checklist',
      description: 'Surgeon and nurse sterilization sign-offs',
      icon: ClipboardCheck,
      path: '/checklist',
      badge: 'Safety First',
      color: 'bg-sky-600 text-white',
      badgeColor: 'bg-sky-50 text-sky-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <div
            key={act.title}
            onClick={() => navigate(act.path)}
            className="group relative bg-white rounded-2xl border border-surface-border p-5 shadow-soft hover:shadow-card hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-primary transition-colors">
                {act.title}
              </h4>
              <p className="text-xs text-slate-muted mt-1 leading-relaxed">
                {act.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-primary">
              <span>Launch</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

