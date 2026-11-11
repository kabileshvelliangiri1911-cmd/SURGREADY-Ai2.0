import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopNav } from '../components/navigation/TopNav';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Page title mapping based on route
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Surgical Dashboard',
          subtitle: 'Active procedures, readiness telemetry, and OR operational flow'
        };
      case '/new-procedure':
        return {
          title: 'New Procedure Preparation',
          subtitle: 'Step-by-step procedural ingestion, anatomical modeling & plan creation'
        };
      case '/ai-workbench':
        return {
          title: 'AI Surgical Workbench',
          subtitle: 'Automated 3D scan analysis, implant recommendation & manual citations'
        };
      case '/manuals':
        return {
          title: 'Surgical Technique Manuals',
          subtitle: 'Manufacturer-verified operative manuals, IFU documentation & protocols'
        };
      case '/inventory':
        return {
          title: 'Surgical Inventory & Trays',
          subtitle: 'Real-time implant availability, stock alerts & sterile tray verification'
        };
      case '/checklist':
        return {
          title: 'Surgical Safety Checklist',
          subtitle: 'Multi-disciplinary pre-op sign-off, tool trays & sterilization compliance'
        };
      case '/reports':
        return {
          title: 'Analytics & Audit Reports',
          subtitle: 'Surgical preparation metrics, compliance logs & performance indicators'
        };
      case '/settings':
        return {
          title: 'Hospital & System Settings',
          subtitle: 'Facility configuration, user profile, security & notification controls'
        };
      default:
        return {
          title: 'SurgReady AI',
          subtitle: 'Smart Surgical Preparation. Simplified.'
        };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNav
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

