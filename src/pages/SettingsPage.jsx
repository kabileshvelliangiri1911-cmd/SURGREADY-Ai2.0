import React, { useState } from 'react';
import {
  User,
  Building2,
  Lock,
  Bell,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Save,
  RotateCcw,
  Smartphone,
  AlertTriangle,
  Key
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';

export const SettingsPage = () => {
  const { currentUser, switchUser, demoUsers } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'hospital' | 'account' | 'notifications' | 'preferences'
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Settings State initialized from storageService
  const initialSettings = storageService.getSettings();

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Dr. Sarah Jenkins',
    title: currentUser?.role || 'Lead Orthopedic Surgeon',
    email: currentUser?.email || 's.jenkins@stjude-health.org',
    phone: currentUser?.phone || '+1 (555) 234-8900',
    department: currentUser?.department || 'Department of Orthopedic Surgery',
    license: currentUser?.license || 'MD-940218-CA',
    bio: 'Board-certified adult reconstruction specialist focusing on complex primary and revision hip and knee arthroplasty.'
  });

  const [hospitalForm, setHospitalForm] = useState({
    name: initialSettings.hospitalName || 'St. Jude Medical Center',
    campus: initialSettings.campus || 'Main Surgical Pavilion - Tower A',
    traumaLevel: initialSettings.traumaLevel || 'Level 1 Trauma Center',
    orSuitesCount: initialSettings.orSuitesCount || 16,
    sterileProcessingLead: 'Marcus Vance, CST (Ext. 8412)',
    accreditationId: 'JC-OR-90812'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    twoFactorEnabled: true,
    sessionTimeoutMinutes: 30
  });

  const [notificationForm, setNotificationForm] = useState({
    checklistSignoff: initialSettings.notifications?.checklistSignoff ?? true,
    lowStockAlerts: initialSettings.notifications?.lowStockAlerts ?? true,
    aiAnalysisComplete: initialSettings.notifications?.aiAnalysisComplete ?? true,
    scheduleChanges: initialSettings.notifications?.scheduleChanges ?? true
  });

  const [appPreferences, setAppPreferences] = useState({
    defaultManufacturer: initialSettings.defaultManufacturer || 'Stryker',
    units: initialSettings.units || 'metric',
    highContrast: initialSettings.highContrast || false,
    autoSaveMinutes: initialSettings.autoSaveMinutes || 2
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('User profile updated successfully.');
  };

  const handleSaveHospital = (e) => {
    e.preventDefault();
    storageService.saveSettings({
      ...initialSettings,
      hospitalName: hospitalForm.name,
      campus: hospitalForm.campus,
      traumaLevel: hospitalForm.traumaLevel,
      orSuitesCount: Number(hospitalForm.orSuitesCount)
    });
    toast.success('Hospital facility information updated.');
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    toast.success('Workstation security preferences updated.');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    storageService.saveSettings({
      ...initialSettings,
      notifications: notificationForm
    });
    toast.success('Notification preferences saved.');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    storageService.saveSettings({
      ...initialSettings,
      defaultManufacturer: appPreferences.defaultManufacturer,
      units: appPreferences.units,
      highContrast: appPreferences.highContrast,
      autoSaveMinutes: Number(appPreferences.autoSaveMinutes)
    });
    toast.success('Application preferences updated.');
  };

  const handleConfirmReset = () => {
    storageService.resetAll();
    setIsResetConfirmOpen(false);
    toast.info('All data reset to initial demo state. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const tabs = [
    { id: 'profile', name: 'User Profile', icon: User },
    { id: 'hospital', name: 'Hospital Information', icon: Building2 },
    { id: 'account', name: 'Account & Security', icon: Lock },
    { id: 'notifications', name: 'Notification Preferences', icon: Bell },
    { id: 'preferences', name: 'Application Preferences', icon: Sliders }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
          System & Facility Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
          Configure clinical profile, facility parameters, security controls, and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Navigation Tabs (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-surface-border p-2 shadow-soft space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Demo Persona Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Active Demo Persona:
            </span>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover border border-blue-200"
              />
              <div>
                <p className="font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser?.role}</p>
              </div>
            </div>
            <div className="space-y-1">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                    currentUser?.id === u.id
                      ? 'bg-blue-100 text-brand-primary font-bold'
                      : 'hover:bg-white text-slate-600'
                  }`}
                >
                  <span>{u.name.split(' ')[0]} {u.name.split(' ')[1]?.[0]}.</span>
                  <span className="text-[10px] text-slate-400">{u.role.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Content (8 cols) */}
        <div className="md:col-span-8">
          {/* 1. USER PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card
              title="Clinician Profile"
              subtitle="Personal identifiers and surgical role credentials"
              actions={
                <Button variant="primary" size="sm" onClick={handleSaveProfile} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Profile
                </Button>
              }
            >
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="flex items-center gap-4 pb-4 border-b border-surface-border">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-brand-primary shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-base text-brand-navy">{profileForm.name}</h4>
                    <p className="text-slate-500">{profileForm.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Staff ID / License: {profileForm.license}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Clinical Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Hospital Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-text mb-1">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-text mb-1">Clinical Specialty Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white leading-relaxed"
                  />
                </div>
              </form>
            </Card>
          )}

          {/* 2. HOSPITAL INFORMATION TAB */}
          {activeTab === 'hospital' && (
            <Card
              title="Hospital & Facility Parameters"
              subtitle="Institution credentials, trauma designation, and operating suite count"
              actions={
                <Button variant="primary" size="sm" onClick={handleSaveHospital} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Facility
                </Button>
              }
            >
              <form onSubmit={handleSaveHospital} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-text mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Campus / Building</label>
                    <input
                      type="text"
                      value={hospitalForm.campus}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, campus: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Trauma Designation</label>
                    <input
                      type="text"
                      value={hospitalForm.traumaLevel}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, traumaLevel: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Active OR Suites</label>
                    <input
                      type="number"
                      value={hospitalForm.orSuitesCount}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, orSuitesCount: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Joint Commission ID</label>
                    <input
                      type="text"
                      value={hospitalForm.accreditationId}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, accreditationId: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-text mb-1">Central Sterile Processing Contact</label>
                  <input
                    type="text"
                    value={hospitalForm.sterileProcessingLead}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, sterileProcessingLead: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                  />
                </div>
              </form>
            </Card>
          )}

          {/* 3. ACCOUNT & SECURITY TAB */}
          {activeTab === 'account' && (
            <Card
              title="Workstation Security & Authentication"
              subtitle="Password management, two-factor authentication, and active sessions"
              actions={
                <Button variant="primary" size="sm" onClick={handleSaveSecurity} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Security
                </Button>
              }
            >
              <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-brand-primary" />
                    <div>
                      <p className="font-bold text-brand-navy">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-500">Requires authenticator app token at each OR shift login</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityForm.twoFactorEnabled}
                      onChange={(e) => setSecurityForm({ ...securityForm, twoFactorEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
                  </label>
                </div>

                <div className="border-t border-surface-border pt-4 space-y-3">
                  <h4 className="font-bold text-brand-navy">Change Hospital Workstation Password</h4>
                  <div>
                    <label className="block font-semibold text-slate-text mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-text mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-text mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-3">
                  <label className="block font-semibold text-slate-text mb-1">
                    Automatic Workstation Screen Timeout (Minutes)
                  </label>
                  <select
                    value={securityForm.sessionTimeoutMinutes}
                    onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white cursor-pointer"
                  >
                    <option value={15}>15 Minutes (High Security OR Standard)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </form>
            </Card>
          )}

          {/* 4. NOTIFICATIONS PREFERENCES TAB */}
          {activeTab === 'notifications' && (
            <Card
              title="Clinical Notification Preferences"
              subtitle="Control automated alerts for checklists, inventory shortages, and AI sizing"
              actions={
                <Button variant="primary" size="sm" onClick={handleSaveNotifications} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Preferences
                </Button>
              }
            >
              <form onSubmit={handleSaveNotifications} className="space-y-3 text-xs">
                {[
                  {
                    key: 'checklistSignoff',
                    title: 'Checklist Sign-Off Completion',
                    desc: 'Notify when both attending surgeon and circulating nurse finalize sterile verification.'
                  },
                  {
                    key: 'lowStockAlerts',
                    title: 'Critical Inventory & Tray Shortages',
                    desc: 'Instant alert when implants or cutting blades drop below minimum buffer levels.'
                  },
                  {
                    key: 'aiAnalysisComplete',
                    title: 'AI 3D Scan Ingestion & Plan Ready',
                    desc: 'Receive notification when helical CT 3D segmentation and sizing recommendations are compiled.'
                  },
                  {
                    key: 'scheduleChanges',
                    title: 'OR Schedule & Suite Reassignments',
                    desc: 'Alerts regarding OR room changes or case timing updates.'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-xl border border-surface-border bg-slate-50/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={notificationForm[item.key]}
                        onChange={(e) => setNotificationForm({ ...notificationForm, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary" />
                    </label>
                  </div>
                ))}
              </form>
            </Card>
          )}

          {/* 5. APPLICATION PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <Card
              title="Application Display & System Preferences"
              subtitle="Default OEM filters, anatomical measurement units, and demo resets"
              actions={
                <Button variant="primary" size="sm" onClick={handleSavePreferences} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Settings
                </Button>
              }
            >
              <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-text mb-1">
                    Primary Default Manufacturer Filter
                  </label>
                  <select
                    value={appPreferences.defaultManufacturer}
                    onChange={(e) => setAppPreferences({ ...appPreferences, defaultManufacturer: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white cursor-pointer"
                  >
                    <option value="Stryker">Stryker (Triathlon / Mako)</option>
                    <option value="Zimmer Biomet">Zimmer Biomet (Persona / ROSA)</option>
                    <option value="DePuy Synthes">DePuy Synthes (ATTUNE / VELYS)</option>
                    <option value="Medtronic">Medtronic (Solera / Stealth)</option>
                    <option value="Smith & Nephew">Smith & Nephew (EVOS / Journey)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-text mb-1">
                    Anatomical Measurement Units
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      onClick={() => setAppPreferences({ ...appPreferences, units: 'metric' })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        appPreferences.units === 'metric'
                          ? 'bg-blue-50 border-brand-primary text-brand-navy font-bold'
                          : 'bg-white border-surface-border text-slate-600'
                      }`}
                    >
                      <span>Metric (Millimeters mm / Degrees °)</span>
                      <input
                        type="radio"
                        checked={appPreferences.units === 'metric'}
                        onChange={() => {}}
                        className="text-brand-primary"
                      />
                    </label>
                    <label
                      onClick={() => setAppPreferences({ ...appPreferences, units: 'imperial' })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        appPreferences.units === 'imperial'
                          ? 'bg-blue-50 border-brand-primary text-brand-navy font-bold'
                          : 'bg-white border-surface-border text-slate-600'
                      }`}
                    >
                      <span>Imperial (Inches in / Degrees °)</span>
                      <input
                        type="radio"
                        checked={appPreferences.units === 'imperial'}
                        onChange={() => {}}
                        className="text-brand-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* Reset Demo Data Action */}
                <div className="pt-4 border-t border-surface-border">
                  <h4 className="font-bold text-slate-800 mb-1">Reset Demo Database</h4>
                  <p className="text-slate-500 mb-3">
                    Restore all procedure cases, surgical checklists, and inventory stock back to original factory demo state.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    Reset All Demo Data
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Demo Reset */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Demo Data?"
        description="Are you sure you want to clear custom procedures and restocked inventory? The platform will reload with initial hospital baseline data."
        confirmText="Yes, Reset Data"
        variant="danger"
      />
    </div>
  );
};

