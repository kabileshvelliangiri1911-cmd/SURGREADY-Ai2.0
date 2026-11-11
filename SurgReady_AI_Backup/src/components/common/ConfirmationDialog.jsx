import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this surgical preparation action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger' | 'warning'
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'navy' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`p-3 rounded-xl flex-shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : variant === 'warning'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-blue-50 text-brand-primary'
          }`}
        >
          {variant === 'danger' && <AlertCircle className="w-6 h-6" />}
          {variant === 'warning' && <AlertTriangle className="w-6 h-6" />}
          {variant === 'primary' && <Info className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-sm text-slate-text leading-relaxed">{description}</p>
          <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-brand-navy">
            <span className="font-semibold">Notice:</span> Changes will be logged to the hospital surgical record audit trail.
          </div>
        </div>
      </div>
    </Modal>
  );
};

