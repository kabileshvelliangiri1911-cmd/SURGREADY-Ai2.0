import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Stethoscope,
  Building2,
  HeartPulse,
  User
} from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dispatchAuthEvent } from '../services/snsAuthEventService';

export const LoginPage = () => {
  const { login, demoUsers } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // 4 User Categories
  const [selectedRole, setSelectedRole] = useState('doctor'); // 'doctor' | 'management' | 'nurse' | 'patient'
  const [email, setEmail] = useState('doctor.sarah@stjude-health.org');
  const [password, setPassword] = useState('SurgReady2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const ROLE_CATEGORIES = [
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, badge: 'Clinical', hint: 'Surgical scheduling, anatomical scan sizing & checklists' },
    { id: 'management', label: 'Management', icon: Building2, badge: 'Executive', hint: 'Smart inventory alerts, notification history & throughput' },
    { id: 'nurse', label: 'Nurse', icon: HeartPulse, badge: 'Surgical Team', hint: 'OR preparation, tray count verification & nursing tasks' },
    { id: 'patient', label: 'Patient', icon: User, badge: 'Care Portal', hint: 'Procedure care instructions & pre-op milestones' },
  ];

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    if (roleId === 'doctor') {
      setEmail('doctor.sarah@stjude-health.org');
    } else if (roleId === 'management') {
      setEmail('management.officer@stjude-health.org');
    } else if (roleId === 'nurse') {
      setEmail('nurse.elena@stjude-health.org');
    } else if (roleId === 'patient') {
      setEmail('patient.robert@gmail.com');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your hospital email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);

      // Verify credentials & enforce database role verification
      const authenticatedUser = await login(cleanEmail, password, selectedRole);

      // Dispatch SUCCESS event to SNS Workbench webhook (non-blocking)
      dispatchAuthEvent({
        event_type: 'SIGN_IN',
        page: 'SIGN_IN',
        timestamp: new Date().toISOString(),
        email: cleanEmail,
        status: 'SUCCESS',
      });

      toast.success(`Welcome to SurgReady AI, ${authenticatedUser.name}!`);
      navigate('/dashboard');
    } catch (err) {
      // Dispatch FAILED event to SNS Workbench webhook (non-blocking)
      dispatchAuthEvent({
        event_type: 'SIGN_IN',
        page: 'SIGN_IN',
        timestamp: new Date().toISOString(),
        email: cleanEmail,
        status: 'FAILED',
      });

      const displayError = err.message || 'Invalid hospital email or password.';
      setErrorMessage(displayError);
      toast.error(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (user) => {
    const roleKey = (user.role || 'doctor').toLowerCase();
    setSelectedRole(roleKey);
    setEmail(user.email);
    setPassword('SurgReady2026!');
    setErrorMessage('');
    try {
      setIsLoading(true);
      const authenticatedUser = await login(user.email, 'SurgReady2026!', roleKey);

      dispatchAuthEvent({
        event_type: 'SIGN_IN',
        page: 'SIGN_IN',
        timestamp: new Date().toISOString(),
        email: user.email,
        status: 'SUCCESS',
      });

      toast.success(`Signed in as ${authenticatedUser.name} (${authenticatedUser.role.toUpperCase()})`);
      navigate('/dashboard');
    } catch (e) {
      dispatchAuthEvent({
        event_type: 'SIGN_IN',
        page: 'SIGN_IN',
        timestamp: new Date().toISOString(),
        email: user.email,
        status: 'FAILED',
      });
      setErrorMessage(e.message || 'Invalid hospital email or password.');
      toast.error(e.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your hospital email address.');
      return;
    }
    setIsForgotPasswordOpen(false);
    toast.info(`Password reset instructions sent to ${resetEmail} via Hospital Secure Mail.`);
    setResetEmail('');
  };

  return (
    <AuthLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-primary text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Hospital Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted mt-1">
            Sign in to access your surgical dashboard, procedures, and checklists.
          </p>
        </div>

        {/* Validation Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Category Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-text mb-2">
            Select Your Hospital Role Category:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            {ROLE_CATEGORIES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-brand-primary shadow-xs ring-1 ring-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-brand-primary' : 'text-slate-400'}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 px-1 leading-snug">
            {ROLE_CATEGORIES.find((r) => r.id === selectedRole)?.hint}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1.5">
              Hospital Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor.name@hospital.org"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all shadow-xs"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-text">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs font-medium text-brand-primary hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/30"
              />
              <span className="text-xs text-slate-600 font-medium">Remember on this workstation</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-semibold shadow-md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to SurgReady
          </Button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="mt-6 pt-5 border-t border-surface-border">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Role Quick Demo Access:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'usr_doc_01', name: 'Dr. Sarah', role: 'doctor', roleTitle: 'Doctor', email: 'doctor.sarah@stjude-health.org' },
              { id: 'usr_mgmt_01', name: 'Arthur V.', role: 'management', roleTitle: 'Management', email: 'management.officer@stjude-health.org' },
              { id: 'usr_nurse_01', name: 'Elena R.', role: 'nurse', roleTitle: 'Nurse', email: 'nurse.elena@stjude-health.org' },
              { id: 'usr_pat_01', name: 'Robert M.', role: 'patient', roleTitle: 'Patient', email: 'patient.robert@gmail.com' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickDemoLogin(u)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all text-left group"
              >
                <div className="text-[11px] font-bold text-brand-navy truncate group-hover:text-brand-primary">
                  {u.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate capitalize font-medium">
                  {u.roleTitle}
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Demo Mode • 1-Click Role Testing (Password: SurgReady2026!)
          </p>
        </div>

        {/* Register Navigation Link */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-600">
            Need an authorized account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-primary hover:text-blue-700 hover:underline"
            >
              Register Surgical Team Account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        title="Reset Hospital Credentials"
        subtitle="Password recovery for authorized surgical personnel"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePasswordReset}>
              Send Reset Link
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your registered hospital email address. You will receive an encrypted verification link to reset your workstation password.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-text mb-1">Hospital Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. s.jenkins@stjude-health.org"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-text"
            />
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
};

