import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  RotateCw,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { verifyAuthWithWorkbench } from '../../services/snsAuthEventService';

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, setIsAuthenticated, updateUserPassword } = useAuth();

  // Mode detection: OAuth callback vs. Password Recovery (Section 6)
  const typeParam = searchParams.get('type') || '';
  const isRecoveryMode = typeParam === 'recovery' || (typeof window !== 'undefined' && window.location.hash.includes('type=recovery'));

  const [status, setStatus] = useState(isRecoveryMode ? 'recovery_form' : 'processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusCode, setStatusCode] = useState(null);
  const [targetPortal, setTargetPortal] = useState('doctor');

  // Password Recovery State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    // If this is password recovery, do not execute OAuth sign-in flow
    if (isRecoveryMode) {
      const portalParam = (searchParams.get('role') || 'doctor').toLowerCase();
      setTargetPortal(portalParam);
      return;
    }

    const handleAuthCallback = async () => {
      try {
        const portalParam = (searchParams.get('role') || 'doctor').toLowerCase();
        setTargetPortal(portalParam);

        if (!isSupabaseConfigured()) {
          // Validate with Workbench even in staging
          const verifyResult = await verifyAuthWithWorkbench({
            event_type: 'SIGN_IN',
            provider: 'google',
            email: 'google.doctor@hospital.org',
            role: portalParam,
            user_id: 'usr_oauth_' + Date.now(),
            full_name: 'Dr. Google Specialist',
            page: `${portalParam.toUpperCase()}_SIGN_IN`
          });

          if (!verifyResult || verifyResult.verified !== true || verifyResult.http_status_code !== 200) {
            setStatusCode(verifyResult?.http_status_code || 500);
            throw new Error(
              verifyResult?.message || `Authentication verification failed with SNS Workbench [HTTP ${verifyResult?.http_status_code || 500}].`
            );
          }

          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 800);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'Authentication session could not be established.');
        }

        const user = session.user;
        const userEmail = (user.email || '').toLowerCase();

        // 1. Fetch user profile from database
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        const isPatient = portalParam === 'patient';
        const approvalStatus = isPatient ? 'approved' : (profile?.approval_status || 'pending_admin_approval');

        if (!profile) {
          await supabase.from('user_profiles').insert([
            {
              auth_user_id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Hospital User',
              email: userEmail,
              role: portalParam,
              hospital_name: 'St. Jude Medical Center',
              department: portalParam === 'doctor' ? 'Orthopedic Surgery' : 'Hospital Operations',
              account_status: isPatient ? 'active' : 'pending_approval',
              approval_status: approvalStatus,
              created_at: new Date().toISOString()
            }
          ]);
        } else {
          // Check role alignment
          const dbRole = (profile.role || 'doctor').toLowerCase();
          if (dbRole !== portalParam) {
            await supabase.auth.signOut();
            throw new Error(
              `Privilege Mismatch: This account is registered as '${dbRole.toUpperCase()}'. Please sign in via the ${dbRole.toUpperCase()} Portal.`
            );
          }
        }

        // 2. Validate Workbench HTTP Response Before Dashboard Access
        const verifyResult = await verifyAuthWithWorkbench({
          event_type: 'SIGN_IN',
          provider: 'google',
          email: userEmail,
          role: portalParam,
          user_id: user.id,
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Hospital User',
          registration_status: isPatient ? 'active' : (profile?.account_status || 'active'),
          approval_status: approvalStatus,
          page: `${portalParam.toUpperCase()}_SIGN_IN`
        });

        if (!verifyResult || verifyResult.verified !== true || verifyResult.http_status_code !== 200) {
          await supabase.auth.signOut().catch(() => {});
          setStatusCode(verifyResult?.http_status_code || 500);
          throw new Error(
            verifyResult?.message || `Authentication verification failed with SNS Workbench [HTTP ${verifyResult?.http_status_code || 500}].`
          );
        }

        // 3. Approval gate verification
        if (!isPatient && approvalStatus !== 'approved' && approvalStatus !== 'active') {
          await supabase.auth.signOut();
          setStatus('approval_required');
          return;
        }

        // Setup session
        const authPayload = {
          id: user.id,
          auth_user_id: user.id,
          email: userEmail,
          name: profile?.full_name || user.user_metadata?.full_name || 'Hospital User',
          role: profile?.role || portalParam,
          hospital: profile?.hospital_name || 'St. Jude Medical Center',
          department: profile?.department || 'Surgical Services',
          status: 'active',
          approval_status: 'approved'
        };

        setCurrentUser(authPayload);
        setIsAuthenticated(true);
        localStorage.setItem('surgready_auth_token', 'true');
        localStorage.setItem('surgready_hospital_session', JSON.stringify(authPayload));

        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 800);
      } catch (err) {
        console.error('[OAuth Callback Error]', err);
        setErrorMessage(err.message || 'Single Sign-On authentication encountered an issue.');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, setCurrentUser, setIsAuthenticated, isRecoveryMode]);

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');

    if (!newPassword || newPassword.length < 8) {
      setRecoveryError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setIsSubmittingReset(true);
      await updateUserPassword(newPassword);
      setRecoverySuccess(true);
      setTimeout(() => {
        navigate(`/${targetPortal}/signin`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error('[Password Reset Callback Error]', err);
      setRecoveryError(err.message || 'Failed to update password. Please request a new recovery link.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center">
          
          {/* 1. PASSWORD RECOVERY FORM (Section 6) */}
          {isRecoveryMode && (
            <div>
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
                Set New Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Choose a secure password for your SurgReady AI account.
              </p>

              {recoverySuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-left flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Password Updated Successfully</p>
                    <p className="mt-0.5 text-emerald-700">Redirecting to your department sign-in page...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-4 text-left">
                  {recoveryError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{recoveryError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (recoveryError) setRecoveryError('');
                        }}
                        required
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (recoveryError) setRecoveryError('');
                        }}
                        required
                        placeholder="Re-enter your new password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs mt-2"
                  >
                    {isSubmittingReset ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* 2. OAUTH PROCESSING */}
          {!isRecoveryMode && status === 'processing' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-1">Verifying Credentials</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Validating authentication event with SNS AI Agent Workbench...
              </p>
            </div>
          )}

          {/* 3. OAUTH SUCCESS */}
          {!isRecoveryMode && status === 'success' && (
            <div className="py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Authentication Verified</h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">
                Verification successful. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {/* 4. OAUTH APPROVAL REQUIRED */}
          {!isRecoveryMode && status === 'approval_required' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Pending Administrator Approval</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                Your hospital profile has been successfully connected, but clinical / administrative access is awaiting verification by your authorized hospital administrator.
              </p>
              <Link to="/portals">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Return to Portal Directory
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* 5. OAUTH ERROR */}
          {!isRecoveryMode && status === 'error' && (
            <div className="py-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
                {statusCode && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                    HTTP {statusCode}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-red-700 mb-6 bg-red-50 border border-red-200 rounded-xl p-3 text-left leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-2">
                <Link to={`/${targetPortal}/signin`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Retry Sign In
                  </Button>
                </Link>
                <Link to="/portals">
                  <Button variant="outline" className="w-full">
                    Return to Portals
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
