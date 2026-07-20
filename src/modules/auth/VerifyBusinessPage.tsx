'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Building2, UploadCloud, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import styles from './VerifyBusinessPage.module.css';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// VerifyBusinessPage — KYC verification, document uploads, and tax details
// ─────────────────────────────────────────────────────────────────────────────

interface UploadedFile {
  name: string;
  size: string;
}

const VerifyBusinessPage: React.FC = () => {
  const [gstin, setGstin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [pan, setPan] = useState('');
  const [isVerifyingGstin, setIsVerifyingGstin] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addNotification } = useUIStore();
  const router = useRouter();

  const handleVerifyGstin = async () => {
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstin.toUpperCase())) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid 15-digit GSTIN (e.g. 27AABHW1234A1Z5)',
      });
      return;
    }

    setIsVerifyingGstin(true);
    await new Promise((r) => setTimeout(r, 1500));

    // Mock response validation
    setBusinessName('Ramesh Auto Parts & Logistics Pvt Ltd');
    setPan(gstin.substring(2, 12).toUpperCase());
    setGstVerified(true);
    setIsVerifyingGstin(false);

    addNotification({
      type: 'success',
      title: 'GSTIN Verified',
      message: 'Tax registration status verified via government records.',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setFiles((prev) => [...prev, { name: file.name, size: `${sizeMb} MB` }]);

      addNotification({
        type: 'success',
        title: 'File Uploaded',
        message: `${file.name} queued for verification.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstVerified) {
      addNotification({
        type: 'warning',
        title: 'GSTIN Verification Required',
        message: 'Please verify your GSTIN details before submitting KYC documentation.',
      });
      return;
    }
    if (files.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Documents Required',
        message: 'Please upload at least one valid identity/license document (GST certificate or shop license).',
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));

    addNotification({
      type: 'success',
      title: 'KYC Submitted Successfully',
      message: 'Our risk team will verify your business profile within 1-2 hours.',
      duration: 6000,
    });

    setIsSubmitting(false);
    router.push(ROUTES.BUYER.DASHBOARD);
  };

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <Building2 size={26} />
            </div>
            <h1 className={styles.title}>KYC & Business Verification</h1>
            <p className={styles.subtitle}>
              Verify your trade profile to activate bulk transaction privileges, credit options, and tax tax invoice credits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Step 1: GSTIN Info */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Business Registration</h2>
              <div className={styles.row}>
                <Input
                  label="GSTIN (GST Number)"
                  placeholder="Enter 15-digit GST number..."
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value);
                    setGstVerified(false);
                  }}
                  disabled={isVerifyingGstin || isSubmitting}
                  required
                />
                <div className={styles.verifyBtnWrap}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleVerifyGstin}
                    isLoading={isVerifyingGstin}
                    disabled={!gstin || gstVerified || isVerifyingGstin || isSubmitting}
                  >
                    Verify GSTIN
                  </Button>
                </div>
              </div>

              {gstVerified && (
                <div className={styles.verifiedBox} role="region" aria-label="Verified details">
                  <div className={styles.verifiedCheck}>
                    <CheckCircle2 size={16} /> <span>GST Active & Confirmed</span>
                  </div>
                  <div className={styles.detailsList}>
                    <div>
                      <span className={styles.detailLabel}>Company Name:</span>
                      <span className={styles.detailVal}>{businessName}</span>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>Corporate PAN:</span>
                      <span className={styles.detailVal}>{pan}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Documents upload */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Document Verification</h2>
              <p className={styles.sectionDesc}>
                Upload a copy of your GST registration certificate, shop establishment license, or corporate MSME license (PDF/Image formats, max 5MB).
              </p>

              <div className={styles.uploadZone}>
                <input
                  type="file"
                  id="kyc-files"
                  className={styles.fileInput}
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  disabled={isSubmitting}
                  aria-label="Upload verification files"
                />
                <label htmlFor="kyc-files" className={styles.uploadLabel}>
                  <UploadCloud size={28} className={styles.uploadIcon} />
                  <span className={styles.uploadMain}>Click to upload file</span>
                  <span className={styles.uploadSub}>PDF, JPEG, or PNG up to 5MB</span>
                </label>
              </div>

              {files.length > 0 && (
                <div className={styles.filesList} role="list" aria-label="Uploaded documents">
                  {files.map((file, index) => (
                    <div key={index} className={styles.fileRow} role="listitem">
                      <FileText size={18} className={styles.fileIcon} />
                      <div className={styles.fileDetails}>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileSize}>{file.size}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit KYC for Vetting
              </Button>
              <Link href={ROUTES.BUYER.DASHBOARD} className={styles.skipBtn}>
                Skip Verification (Demo Mode)
              </Link>
            </div>
          </form>

          {/* Secure disclaimer */}
          <div className={styles.disclaimer}>
            <ShieldCheck size={14} />
            <span>Documents are stored securely using 256-bit AES encryption.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyBusinessPage;
