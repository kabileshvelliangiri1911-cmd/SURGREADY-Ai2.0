import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProcedureProvider } from './context/ProcedureContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Core Pages
import { PortalSelectionPage } from './pages/PortalSelectionPage';
import { DepartmentSignInPage } from './pages/auth/DepartmentSignInPage';
import { DoctorSignUpPage } from './pages/auth/DoctorSignUpPage';
import { ManagementSignUpPage } from './pages/auth/ManagementSignUpPage';
import { NurseSignUpPage } from './pages/auth/NurseSignUpPage';
import { PatientSignUpPage } from './pages/auth/PatientSignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';

import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoctorDashboard } from './components/dashboard/DoctorDashboard';
import { ManagementDashboard } from './components/dashboard/ManagementDashboard';
import { NurseDashboard } from './components/dashboard/NurseDashboard';
import { PatientDashboard } from './components/dashboard/PatientDashboard';

import { NewProcedurePage } from './pages/NewProcedurePage';
import { ManualsPage } from './pages/ManualsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

// General Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/portals" replace />;
  }
  return children;
};

// Strict Role-Protected Route Guard with Privilege Mismatch barrier
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/portals" replace />;
  }

  const userRole = (currentUser.role || 'doctor').toLowerCase();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-4">
            Role Permission Mismatch
          </p>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 text-left mb-6 space-y-1">
            <p>
              Your authenticated database role is <strong>{userRole.toUpperCase()}</strong>.
            </p>
            <p className="text-rose-600">
              This dashboard is restricted to: {allowedRoles.map(r => r.toUpperCase()).join(', ')}.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold transition-colors shadow-sm"
          >
            <span>Return to Authorized Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route Guard (Redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Root Path Handler (Smart Navigation: to dashboard if logged in, to portal selection if not)
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/portals"} replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProcedureProvider>
          <ToastProvider>
            <Routes>
              {/* Root Smart Redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Portal Directory Landing */}
              <Route
                path="/portals"
                element={
                  <PublicRoute>
                    <PortalSelectionPage />
                  </PublicRoute>
                }
              />

              {/* Department Portals — Sign In */}
              <Route
                path="/doctor/signin"
                element={
                  <PublicRoute>
                    <DepartmentSignInPage roleOverride="doctor" />
                  </PublicRoute>
                }
              />
              <Route
                path="/management/signin"
                element={
                  <PublicRoute>
                    <DepartmentSignInPage roleOverride="management" />
                  </PublicRoute>
                }
              />
              <Route
                path="/nurse/signin"
                element={
                  <PublicRoute>
                    <DepartmentSignInPage roleOverride="nurse" />
                  </PublicRoute>
                }
              />
              <Route
                path="/patient/signin"
                element={
                  <PublicRoute>
                    <DepartmentSignInPage roleOverride="patient" />
                  </PublicRoute>
                }
              />

              {/* Department Portals — Sign Up */}
              <Route
                path="/doctor/signup"
                element={
                  <PublicRoute>
                    <DoctorSignUpPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/management/signup"
                element={
                  <PublicRoute>
                    <ManagementSignUpPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/nurse/signup"
                element={
                  <PublicRoute>
                    <NurseSignUpPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/patient/signup"
                element={
                  <PublicRoute>
                    <PatientSignUpPage />
                  </PublicRoute>
                }
              />

              {/* Shared Auth Utilities */}
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Legacy Aliases & Direct Redirects */}
              <Route path="/login" element={<Navigate to="/portals" replace />} />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Authenticated Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Dynamic Role-Based Hub */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Section 8: Dedicated Protected Department Dashboards */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/management/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['management']}>
                      <ManagementDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/nurse/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['nurse']}>
                      <NurseDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/patient/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </RoleProtectedRoute>
                  }
                />

                {/* Clinical Operational Tools */}
                <Route path="/new-procedure" element={<NewProcedurePage />} />
                <Route path="/ai-workbench" element={<Navigate to="/dashboard" replace />} />
                <Route path="/manuals" element={<ManualsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </ToastProvider>
        </ProcedureProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
