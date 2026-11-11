import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  BadgeAlert,
  FileBadge,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Check,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { dispatchAuthEvent } from '../../services/snsAuthEventService';

export const ManagementSignUpPage = () => {
  const navigate = useNavigate();
  const { registerDepartmentUser, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    designation: 'Operations Director',
    department: 'Hospital Administration & Supply Chain',
    hospitalName: 'St. Jude Medical Center',
    hospitalRegistrationNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorStatusCode, setErrorStatusCode] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) {
      setErrorMessage('');
      setErrorStatusCode(null);
    }
  };

  const passwordCriteria = useMemo(() => {
    const pwd = formData.password || '';
    return [
      { id: 'length', label: 'At least 8 characters', met: pwd.length >= 8 },
      { id: 'upper', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
      { id: 'lower', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
      { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
      { id: 'special', label: 'One special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(pwd) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordCriteria.every((c) => c.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full administrative name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid official hospital administration email.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage('Please enter your contact telephone number.');
      return;
    }
    if (!formData.employeeId.trim()) {
      setErrorMessage('Please provide your official Hospital Employee ID.');
      return;
    }
    if (!formData.hospitalName.trim()) {
      setErrorMessage('Please enter your Hospital / Health Organization Name.');
      return;
    }
    if (!formData.hospitalRegistrationNumber.trim()) {
      setErrorMessage('Please enter the official Hospital Registration / Facility Code.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must satisfy all security requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }
    if (!formData.agreeTerms) {
      setErrorMessage('Please accept the hospital security and governance agreement.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setErrorStatusCode(null);

      await registerDepartmentUser('management', {
        ...formData,
        medicalRegistrationNumber: formData.hospitalRegistrationNumber,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('[Management Registration Error]', err);
      let msg = err.message || 'An error occurred during registration. Please try again.';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('fetch')) {
        msg = 'Connection failed. Please check your network and try again.';
      }
      setErrorStatusCode(err.statusCode || null);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      await signInWithGoogle('management');
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-up failed. Please use standard email registration.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/portals"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Selection
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
            <Building2 className="w-3.5 h-3.5" />
            Management Portal
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hospital Management Registration</h1>
                <p className="text-indigo-100 text-xs sm:text-sm mt-0.5">
                  Administrative oversight, inventory automation & enterprise AI analytics
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Management Registration Approved</h2>
                <div className="max-w-md mx-auto text-sm text-slate-600 space-y-3 mb-6 text-left bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4">
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Enterprise Access Active:</strong> Your hospital management account is approved. Full access to inventory thresholds, procurement alerts, and the SURGREADY Management Assistant is active.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Inbox className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Confirmation dispatched to <strong>{formData.email}</strong>.
                    </span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/management/signin')}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                  >
                    Proceed to Management Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/portals')}
                    className="w-full sm:w-auto"
                  >
                    Return to Portals
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Social Google Auth */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-sm disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    {isGoogleLoading ? 'Connecting with Google...' : 'Continue with Google (Management SSO)'}
                  </button>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-medium">Or register with hospital credentials</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {errorMessage.includes('already exists') ? 'Account Already Exists' : 'Registration Issue'}
                        </p>
                        {errorStatusCode && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            HTTP {errorStatusCode}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed">{errorMessage}</p>

                      {/* Quick recovery options */}
                      {errorMessage.includes('already exists') && (
                        <div className="mt-3 pt-2.5 border-t border-red-200/60 flex items-center gap-3 text-xs">
                          <Link
                            to="/management/signin"
                            className="font-bold text-indigo-700 hover:text-indigo-900 underline"
                          >
                            Sign In to Management Portal →
                          </Link>
                          <span className="text-slate-400">•</span>
                          <Link
                            to="/forgot-password?role=management"
                            className="font-bold text-indigo-700 hover:text-indigo-900 underline"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                      )}

                      {(errorStatusCode === 502 || errorStatusCode === 504 || errorMessage.toLowerCase().includes('connect')) && (
                        <div className="mt-3 pt-2.5 border-t border-red-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Retry Verification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name & Title *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          placeholder="Marcus Vance, MBA"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Hospital Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="management.officer@hospital.org"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Employee ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => handleChange('phoneNumber', e.target.value)}
                          placeholder="+1 (555) 901-2345"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hospital Employee ID *
                      </label>
                      <div className="relative">
                        <FileBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.employeeId}
                          onChange={(e) => handleChange('employeeId', e.target.value)}
                          placeholder="EMP-MGMT-8940"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Designation & Management Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Executive / Operational Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => handleChange('designation', e.target.value)}
                        placeholder="Chief Operating Officer"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Management Department *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        placeholder="Hospital Operations & Supply Chain"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Hospital Name & Registration Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hospital / Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hospitalName}
                        onChange={(e) => handleChange('hospitalName', e.target.value)}
                        placeholder="St. Jude Medical Center"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hospital Registration Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hospitalRegistrationNumber}
                        onChange={(e) => handleChange('hospitalRegistrationNumber', e.target.value)}
                        placeholder="HOSP-REG-2026-901"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          placeholder="Enter strong password"
                          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Password Security Criteria:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {passwordCriteria.map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-1.5 text-xs ${
                            c.met ? 'text-emerald-600 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {c.met ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Governance Notice */}
                  <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Hospital Governance Gate:</strong> Executive privileges grant authority to configure inventory minimum thresholds, dispatch low-stock alerts, and view surgical team audit logs.
                      </span>
                    </div>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-slate-700">
                        I confirm my authorized management status and agree to SurgReady AI security protocols and hospital data governance standards.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Creating Management Account...' : 'Complete Management Registration'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </form>

                {/* Footer Sign In Link */}
                <div className="mt-6 text-center text-sm text-slate-500">
                  Already registered in Hospital Management?{' '}
                  <Link
                    to="/management/signin"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Sign In to Management Portal
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

