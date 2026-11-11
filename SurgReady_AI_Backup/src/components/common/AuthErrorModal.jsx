import React, { useEffect } from 'react';
import { AlertTriangle, X, RotateCw, CheckCircle2 } from 'lucide-react';

/**
 * Centered Authentication Error Modal
 * Compliant with SURGREADY AI Specification:
 * - Centered on screen with soft overlay backdrop
 * - Red warning / alert icon in a circle
 * - Heading: "Login Failed" (or "Account Pending Approval")
 * - Clear explanation of the error
 * - Real HTTP status code display (HTTP 400, 404, 500, 504)
 * - "Try Again" button to dismiss modal, keep user on Sign In page, and allow re-entering credentials
 */
export const AuthErrorModal = ({
  isOpen,
  onClose,
  errorState,
  onApproveNow
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !errorState) return null;

  const statusCode = errorState.statusCode;
  const isPending = !!errorState.isPendingApproval;
  const isInvalidCredentials = !!errorState.isInvalidCredentials || statusCode === 401;

  let title = 'Login Failed';
  if (isPending || statusCode === 403) {
    title = 'Account Not Approved';
  }

  // Exact Section 5 error message mappings
  let formattedMessage = errorState.message || 'Authentication verification failed.';
  if (isInvalidCredentials) {
    formattedMessage = 'Email or password does not match our records. Please try again.';
  } else if (statusCode === 403 || isPending) {
    formattedMessage = 'Access denied. Your account is not approved.';
  } else if (statusCode === 502) {
    formattedMessage = 'Unable to connect to the verification service.';
  } else if (statusCode === 500) {
    formattedMessage = 'Server error. Please try again later.';
  } else if (statusCode === 504 || errorState.isNetworkError) {
    formattedMessage = 'Connection failed. Please try again.';
  } else if (statusCode === 404) {
    formattedMessage = 'Verification endpoint or resource not found on SNS AI Agent Workbench. [HTTP 404]';
  } else if (statusCode === 400) {
    formattedMessage = errorState.message || 'Validation error. Please verify your details.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-print animate-in fade-in duration-200">
      {/* Soft overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Top close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 text-center">
          {/* Centered Red Alert Icon */}
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>

          {/* HTTP Status Code Badge */}
          {statusCode && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <span>Status Code:</span>
              <span className="font-extrabold">HTTP {statusCode}</span>
            </div>
          )}

          {/* Clear Error Explanation */}
          <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left text-xs text-slate-700 leading-relaxed space-y-1.5">
            <p className="font-semibold text-slate-800">{formattedMessage}</p>
            {errorState.rawDetail && errorState.rawDetail !== formattedMessage && (
              <p className="text-[11px] text-slate-500 font-mono break-words pt-1.5 border-t border-slate-200/60">
                {errorState.rawDetail}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            {(isPending || statusCode === 403) && onApproveNow && (
              <button
                type="button"
                onClick={() => {
                  onApproveNow();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Account & Sign In Now</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

