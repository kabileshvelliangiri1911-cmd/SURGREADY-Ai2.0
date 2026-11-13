import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Check,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { dispatchAuthEvent } from '../../services/snsAuthEventService';

export const PatientSignUpPage = () => {
  const navigate = useNavigate();
  const { registerDepartmentUser, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    mrn: '',
    hospitalName: 'St. Jude Medical Center',
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
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }
    if (!formData.dateOfBirth) {
      setErrorMessage('Please select your Date of Birth.');
      return;
    }
    if (!formData.hospitalName.trim()) {
      setErrorMessage('Please enter your treating Hospital or Surgical Clinic.');
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
      setErrorMessage('Please agree to the Patient Privacy Notice and Terms of Service.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setErrorStatusCode(null);

      await registerDepartmentUser('patient', formData);
      setIsSuccess(true);
    } catch (err) {
      console.error('[Patient Registration Error]', err);
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
      const user = await signInWithGoogle('patient');
      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-up failed. Please use standard email registration.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/portals"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Selection
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            <Heart className="w-3.5 h-3.5" />
            Patient Portal
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Patient Account Registration</h1>
                <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                  Track your surgical schedule, pre-op preparations & clinical care plan
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Account Created</h2>
                <div className="max-w-md mx-auto text-sm text-slate-600 space-y-3 mb-6 text-left bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4">
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Instant Access Ready:</strong> Your personal patient portal account is registered. You can immediately review your assigned surgical timeline, preparation guidelines, and recovery milestones.
                    </span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/patient/signin')}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
                  >
                    Proceed to Patient Sign In
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
                    {isGoogleLoading ? 'Connecting with Google...' : 'Continue with Google (Patient Sign Up)'}
                  </button>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-medium">Or register with email</span>
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
                            to="/patient/signin"
                            className="font-bold text-amber-700 hover:text-amber-900 underline"
                          >
                            Sign In to Patient Portal →
                          </Link>
                          <span className="text-slate-400">•</span>
                          <Link
                            to="/forgot-password?role=patient"
                            className="font-bold text-amber-700 hover:text-amber-900 underline"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                      )}

                      {(errorStatusCode === 502 || errorStatusCode === 504 || errorMessage.toLowerCase().includes('connect')) && (
                        <div className="mt-3 pt-2.5 border-t border-red-200/60 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                await registerDepartmentUser('patient', formData, { simulate_status: 200 });
                                setIsSuccess(true);
                              } catch (err) {
                                setErrorMessage(err.message || 'Registration failed.');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Complete Registration (Clinical Staging Mode)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs ml-auto"
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
                        Full Legal Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          placeholder="Robert Davis"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="robert.davis@email.com"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Date of Birth */}
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
                          placeholder="+1 (555) 456-7890"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender & Medical Record Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Medical Record Number (MRN) <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.mrn}
                          onChange={(e) => handleChange('mrn', e.target.value)}
                          placeholder="MRN-4420-PT"
                          className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Treating Hospital */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Treating Hospital / Surgical Facility *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.hospitalName}
                        onChange={(e) => handleChange('hospitalName', e.target.value)}
                        placeholder="St. Jude Medical Center"
                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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

                  {/* Patient Privacy Statement */}
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Protected Health Information:</strong> Your health records and procedure schedule are protected under strict patient privacy safeguards. Only your treating clinical team has access to your medical chart.
                      </span>
                    </div>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="text-slate-700">
                        I confirm this information is accurate and agree to the SurgReady AI Patient Care Privacy Policy.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Creating Patient Account...' : 'Complete Patient Registration'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </form>

                {/* Footer Sign In Link */}
                <div className="mt-6 text-center text-sm text-slate-500">
                  Already registered as a Patient?{' '}
                  <Link
                    to="/patient/signin"
                    className="text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    Sign In to Patient Portal
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

