import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  HeartPulse,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  ArrowLeft,
  RotateCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { AuthErrorModal } from '../../components/common/AuthErrorModal';

export const DepartmentSignInPage = ({ roleOverride }) => {
  const { role: urlRole } = useParams();
  const currentRole = (roleOverride || urlRole || 'doctor').toLowerCase();

  const { loginDepartmentUser, signInWithGoogle, approveUserAccount } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [verificationStage, setVerificationStage] = useState(''); // Live status text

  // Technical error state containing real HTTP status and Workbench message
  const [errorState, setErrorState] = useState(null); // { message, statusCode, canRetry, isPendingApproval }
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  // Portal metadata
  const portalConfig = {
    doctor: {
      name: 'Doctor Portal',
      title: 'Surgeon & Doctor Sign In',
      subtitle: 'Access assigned surgical plans, 3D anatomical scans & implant matching.',
      icon: Stethoscope,
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600',
      signupRoute: '/doctor/signup',
      dashboardRoute: '/doctor/dashboard'
    },
    management: {
      name: 'Management Portal',
      title: 'Hospital Management Sign In',
      subtitle: 'Hospital operations oversight, inventory threshold alerts & Assistant.',
      icon: Building2,
      accentColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      signupRoute: '/management/signup',
      dashboardRoute: '/management/dashboard'
    },
    nurse: {
      name: 'Nurse Portal',
      title: 'OR Nursing Staff Sign In',
      subtitle: 'Operating room prep checklists, sterile tray verification & patient logs.',
      icon: HeartPulse,
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      signupRoute: '/nurse/signup',
      dashboardRoute: '/nurse/dashboard'
    },
    patient: {
      name: 'Patient Portal',
      title: 'Surgical Patient Sign In',
      subtitle: 'Review procedure schedule, care guidelines & pre-op milestone checklist.',
      icon: User,
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      signupRoute: '/patient/signup',
      dashboardRoute: '/patient/dashboard'
    }
  };

  const currentConfig = portalConfig[currentRole] || portalConfig.doctor;
  const Icon = currentConfig.icon;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorState(null);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      setVerificationStage('Verifying your credentials...');
      await new Promise(r => setTimeout(r, 120));

      await loginDepartmentUser(currentRole, email, password, rememberMe);

      setVerificationStage('Verification successful! Redirecting to dashboard...');
      setSuccessMessage('Verification successful. Redirecting to your dashboard.');
      toast.success(`Welcome to the ${currentConfig.name}!`);

      setTimeout(() => {
        navigate(currentConfig.dashboardRoute || '/dashboard');
      }, 700);

    } catch (err) {
      console.error('[Sign In Verification Error]', err);
      const statusCode = err.statusCode || (err.isPendingApproval ? 403 : null);
      
      let displayMessage = err.message || 'Email or password does not match our records. Please try again.';
      if (err.isPendingApproval || statusCode === 403) {
        displayMessage = 'Access denied. Your account is not approved.';
      } else if (err.isInvalidCredentials || statusCode === 401) {
        displayMessage = 'Email or password does not match our records. Please try again.';
      } else if (statusCode === 502) {
        displayMessage = 'Unable to connect to the verification service.';
      } else if (statusCode === 500) {
        displayMessage = 'Server error. Please try again later.';
      } else if (statusCode === 504 || err.isNetworkError) {
        displayMessage = 'Connection failed. Please try again.';
      } else if (statusCode === 404) {
        displayMessage = 'Verification endpoint or user not found on SNS AI Agent Workbench. [HTTP 404]';
      } else if (statusCode === 400) {
        displayMessage = err.message || 'Validation error. Please verify your details.';
      }

      setErrorState({
        message: displayMessage,
        rawDetail: err.message,
        statusCode: statusCode,
        canRetry: err.canRetry !== false,
        isPendingApproval: !!err.isPendingApproval || statusCode === 403
      });
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
      setVerificationStage('');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorState(null);
    setSuccessMessage('');
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle(currentRole);
      if (user) {
        setSuccessMessage('Google verification successful. Redirecting to your dashboard...');
        setTimeout(() => {
          navigate(currentConfig.dashboardRoute || '/dashboard');
        }, 600);
      }
    } catch (err) {
      console.error('[Google OAuth Error]', err);
      setErrorState({
        message: err.message || 'Unable to connect to Google authentication.',
        statusCode: err.statusCode || null,
        canRetry: true
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased selection:bg-brand-primary selection:text-white">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/portals" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-xl healthcare-gradient flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-brand-navy text-2xl tracking-tight">SurgReady</span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-brand-light text-brand-primary border border-blue-200">
            AI
          </span>
        </Link>
        <p className="text-xs text-slate-muted">St. Jude Medical Center Surgical Technologies</p>
      </div>

      {/* Main Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-card animate-in fade-in duration-200">
          
          {/* Change Portal Top Link */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <Link
              to="/portals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Portal</span>
            </Link>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentConfig.badgeBg}`}>
              {currentConfig.name}
            </span>
          </div>

          {/* Department Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className={`w-12 h-12 rounded-2xl ${currentConfig.iconBg} flex items-center justify-center shadow-xs flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-navy tracking-tight">
                {currentConfig.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Live Progress Stage */}
          {verificationStage && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-700 animate-pulse">
              <Clock className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>{verificationStage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Technical Error & Workbench Failure Banner */}
          {errorState && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-5 shadow-2xs animate-in shake">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-800">
                      {errorState.isPendingApproval ? 'Account Pending Approval' : 'Authentication Verification Failed'}
                    </span>
                    {errorState.statusCode && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-bold">
                        HTTP {errorState.statusCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed font-medium">
                    {errorState.message}
                  </p>
                  {errorState.isPendingApproval && (
                    <p className="text-[11px] text-rose-600 bg-rose-100/70 p-2 rounded-lg mt-1 leading-snug">
                      Your {currentRole.toUpperCase()} registration is awaiting verification by an authorized hospital administrator. Access will be enabled upon approval.
                    </p>
                  )}
                  {errorState.rawDetail && errorState.rawDetail !== errorState.message && !errorState.isPendingApproval && (
                    <p className="text-[11px] text-rose-600 font-mono bg-rose-100/60 p-2 rounded-lg mt-1 break-words">
                      {errorState.rawDetail}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: 1-Click Administrator/Developer Approval & Retry */}
              <div className="mt-3 pt-3 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2">
                {errorState.isPendingApproval && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        if (approveUserAccount) {
                          await approveUserAccount(email);
                          toast.success('Account approved successfully! Signing in...');
                          setErrorState(null);
                          setIsErrorModalOpen(false);
                          setTimeout(() => {
                            handleSubmit();
                          }, 300);
                        }
                      } catch (appErr) {
                        console.error('[Approval Error]', appErr);
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Account & Sign In Now</span>
                  </button>
                )}

                {errorState.canRetry && (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors shadow-2xs disabled:opacity-50 ml-auto"
                  >
                    <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Retry Verification</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorState) setErrorState(null);
                  }}
                  placeholder={currentRole === 'patient' ? 'e.g. patient@example.com' : 'e.g. name@stjude-health.org'}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link
                  to={`/forgot-password?role=${currentRole}`}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-navy transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorState) setErrorState(null);
                  }}
                  placeholder="Enter your account password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary h-4 w-4"
                />
                <span className="text-slate-600">Remember this workstation</span>
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md bg-brand-primary hover:bg-brand-navy text-white text-xs mt-2"
              isLoading={isLoading}
              disabled={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Verifying your credentials...' : `Sign In to ${currentConfig.name}`}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-3 tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs hover:border-slate-300 transition-all disabled:opacity-60"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
          </button>

          {/* New Registration Link (Section 2 Requirement) */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>New User? </span>
            <Link
              to={currentConfig.signupRoute}
              className="font-bold text-brand-primary hover:text-brand-navy hover:underline"
            >
              Register Here
            </Link>
          </div>
        </div>

        {/* Clinical Safe Footnote */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role verification strictly enforced by hospital security policy.</span>
        </div>
      </div>

      {/* Centered Error Popup UI Modal */}
      <AuthErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorState={errorState}
        onApproveNow={async () => {
          if (approveUserAccount) {
            await approveUserAccount(email);
            toast.success('Account approved successfully! Signing in...');
            setIsErrorModalOpen(false);
            handleSubmit();
          }
        }}
      />
    </div>
  );
};
