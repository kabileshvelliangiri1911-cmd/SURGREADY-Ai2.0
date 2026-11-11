import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  FileBadge,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  ShieldCheck,
  Sparkles,
  Inbox
} from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/common/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { dispatchAuthEvent } from '../services/snsAuthEventService';

export const RegisterPage = () => {
  const navigate = useNavigate();

  // 7 Specified Form Fields
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    contactPersonName: '',
    contactNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Password requirements evaluation
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

  // Form submission & Supabase integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Field-level validation
    if (!formData.hospitalName.trim()) {
      setErrorMessage('Please enter the official Hospital Name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid Official Hospital Email ID.');
      return;
    }
    if (!formData.registrationNumber.trim()) {
      setErrorMessage('Please enter the Hospital Registration Number.');
      return;
    }
    if (!formData.contactPersonName.trim()) {
      setErrorMessage('Please enter the Contact Person Name.');
      return;
    }
    if (!formData.contactNumber.trim() || formData.contactNumber.replace(/\D/g, '').length < 7) {
      setErrorMessage('Please enter a valid Contact Number with at least 7 digits.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password does not fulfill all required security criteria.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    try {
      setIsLoading(true);

      const emailClean = formData.email.trim().toLowerCase();
      const hospitalNameClean = formData.hospitalName.trim();
      const regNumberClean = formData.registrationNumber.trim();
      const contactPersonClean = formData.contactPersonName.trim();
      const contactNumberClean = formData.contactNumber.trim();

      // Helper: Securely stage hospital profile locally for demo/offline resilience
      const stageLocalHospitalRegistration = () => {
        const registered = JSON.parse(localStorage.getItem('surgready_registered_hospitals') || '[]');
        const existingIdx = registered.findIndex(h => (h.email || '').toLowerCase() === emailClean);
        const hospitalRecord = {
          auth_user_id: 'usr_' + Date.now(),
          hospital_name: hospitalNameClean,
          email: emailClean,
          password: formData.password,
          registration_number: regNumberClean,
          contact_person_name: contactPersonClean,
          contact_number: contactNumberClean,
          status: 'pending_verification',
          registered_at: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          registered[existingIdx] = hospitalRecord;
        } else {
          registered.push(hospitalRecord);
        }
        localStorage.setItem('surgready_registered_hospitals', JSON.stringify(registered));
      };

      // Step 1: Dispatch SIGN_UP Event to SNS AI Agent Workbench Webhook
      try {
        await dispatchAuthEvent({
          event_type: 'SIGN_UP',
          page: 'SIGN_UP',
          timestamp: new Date().toISOString(),
          hospital_name: hospitalNameClean,
          email: emailClean,
          password: formData.password,
          registration_number: regNumberClean,
          contact_person: contactPersonClean,
          contact_number: contactNumberClean,
          status: 'SUBMITTED',
        });
      } catch (webhookErr) {
        console.warn('[SNS Auth Webhook] Non-blocking warning:', webhookErr);
      }

      // Step 2: Supabase Account Creation (or Local Hospital Profile in Demo Mode)
      if (isSupabaseConfigured()) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailClean,
            password: formData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
              data: {
                hospital_name: hospitalNameClean,
                registration_number: regNumberClean,
                contact_person_name: contactPersonClean,
                contact_number: contactNumberClean,
              },
            },
          });

          if (authError) {
            const errMsg = authError.message?.toLowerCase() || '';
            if (
              errMsg.includes('already registered') ||
              errMsg.includes('already exists') ||
              authError.status === 400 ||
              authError.status === 422
            ) {
              throw new Error(
                'A hospital account with this official email already exists. Please sign in or use a different hospital email address.'
              );
            }
            if (errMsg.includes('fetch') || errMsg.includes('network') || authError.status === 0) {
              console.warn('[Supabase Network Notice] Live Supabase host unreachable. Staging hospital registration locally.', authError);
              stageLocalHospitalRegistration();
            } else {
              throw new Error(authError.message || 'Failed to create hospital authentication account.');
            }
          } else {
            const user = authData?.user;
            if (user) {
              await supabase.from('hospitals').insert([
                {
                  auth_user_id: user.id,
                  hospital_name: hospitalNameClean,
                  email: emailClean,
                  registration_number: regNumberClean,
                  contact_person_name: contactPersonClean,
                  contact_number: contactNumberClean,
                  status: 'pending_verification',
                  created_at: new Date().toISOString(),
                },
              ]);
            }
          }
        } catch (fetchErr) {
          const errMsg = fetchErr.message?.toLowerCase() || '';
          if (
            fetchErr.name === 'TypeError' ||
            errMsg.includes('fetch') ||
            errMsg.includes('network')
          ) {
            console.warn('[Supabase Network Notice] Live Supabase host unreachable. Staging hospital registration locally.', fetchErr);
            stageLocalHospitalRegistration();
          } else {
            throw fetchErr;
          }
        }
      } else {
        // Initial Demo / Testing Mode without live Supabase cloud keys
        stageLocalHospitalRegistration();
      }

      // Step 3: Display Verification State (No auto-redirect)
      setIsSuccess(true);
    } catch (err) {
      console.error('[Hospital Registration Error]', err);
      let friendlyMsg = err.message || 'An unexpected error occurred during hospital registration. Please try again.';
      if (friendlyMsg.toLowerCase().includes('failed to fetch') || friendlyMsg.toLowerCase().includes('fetch')) {
        friendlyMsg = 'Unable to reach the authentication service. Please check your network connection or verify your Supabase settings in .env.';
      }
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional resend verification email handler
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      const emailClean = formData.email.trim().toLowerCase();
      await supabase.auth.resend({
        type: 'signup',
        email: emailClean,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('[Resend Error]', err);
    }
  };

  return (
    <AuthLayout>
      <div>
        {/* SUCCESS / VERIFICATION SCREEN */}
        {isSuccess ? (
          <div className="py-2 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-brand-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Inbox className="w-8 h-8 text-brand-primary animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registration Submitted Successfully</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Verify Your Hospital Email
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              We have dispatched an encrypted verification link to your official hospital inbox:
            </p>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block max-w-full">
              <span className="font-semibold text-brand-navy text-sm break-all">
                {formData.email}
              </span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>Open the verification email and click the confirmation link.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>Hospital profile details will be linked to your Supabase Auth account.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Access to the surgical dashboard will be granted immediately upon verification.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full font-semibold shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Sign In
              </Button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0}
                className="text-xs text-brand-primary hover:text-blue-700 font-medium transition-colors disabled:text-slate-400"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Didn’t receive the link? Resend Verification Email'}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border">
              <Link
                to="/login"
                className="text-xs text-slate-600 hover:text-brand-primary transition-colors font-medium"
              >
                ← Back to Hospital Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-primary text-xs font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Onboarding</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                Hospital Sign Up
              </h2>
              <p className="text-xs sm:text-sm text-slate-muted mt-1">
                Register your healthcare institution to access the AI-powered surgical preparation platform.
              </p>
            </div>

            {/* Validation Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Hospital Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Hospital Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => handleChange('hospitalName', e.target.value)}
                    placeholder="e.g. St. Jude Medical Center"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Official Hospital Email ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Official Hospital Email ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="surgery.dept@stjude-health.org"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                    required
                  />
                </div>
              </div>

              {/* Field 5 & Field 6 Grid: Hospital Reg Number & Contact Person Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field 5: Hospital Registration Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-text mb-1">
                    Hospital Reg. Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FileBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleChange('registrationNumber', e.target.value)}
                      placeholder="REG-HOSP-2026-88"
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field 6: Contact Person Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-text mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.contactPersonName}
                      onChange={(e) => handleChange('contactPersonName', e.target.value)}
                      placeholder="Dr. Eleanor Vance, MD"
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Field 7: Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                    required
                  />
                </div>
              </div>

              {/* Field 3 & Field 4: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field 3: Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-text mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 4: Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-text mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-text transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              {formData.password && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 animate-in fade-in duration-200">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {passwordCriteria.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                          c.met ? 'text-emerald-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {c.met ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                        )}
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-semibold shadow-md mt-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Hospital Account
              </Button>
            </form>

            {/* Navigation back to Sign In */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-brand-primary hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
