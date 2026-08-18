// ─────────────────────────────────────────────────────────────────────────────
// Mail OTP Verification Service — Hindustan Wholesale
// Handles: secure 6-digit code generation, Firestore TTL storage & Nodemailer SMTP dispatch
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Firebase client SDK — works in both local dev and Vercel serverless
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
} from 'firebase/firestore';

// ── Firebase init (safe singleton for server-side API routes) ────────────────
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const OTP_COLLECTION = 'otp_codes';
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_OTP_REQUESTS_PER_HOUR = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Mask email for safe logging: "s***@gmail.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  return `${local[0]}***@${domain}`;
}

/** Generate cryptographically secure 6-digit OTP */
function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/** Create deterministic Firestore doc ID from email */
function emailToDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
}

// ── SMTP Transporter ─────────────────────────────────────────────────────────

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // strip any accidental whitespace

  if (!user || !pass) {
    console.error(
      '❌ OTP_SMTP_CONFIG_MISSING: SMTP_USER or SMTP_PASS is not set. ' +
      'Emails cannot be sent.'
    );
    return null;
  }

  // When connecting to Gmail, use service: 'gmail' for robust SSL/TLS connectivity across serverless platforms
  if (host.includes('gmail.com') || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
}

// ── Rate Limiting (Single Document Key-Value, No Composite Index Needed) ──────

async function checkAndIncrementRateLimit(docId: string, normalizedEmail: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, OTP_COLLECTION, docId));
    if (!snap.exists()) return true;

    const data = snap.data();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Reset rate counter if window expired
    if (!data.windowStart || data.windowStart < oneHourAgo) {
      return true;
    }

    if ((data.requestCount || 0) >= MAX_OTP_REQUESTS_PER_HOUR) {
      return false;
    }

    return true;
  } catch (err) {
    console.warn('OTP_RATE_LIMIT_CHECK_ERROR:', err);
    return true;
  }
}

// ── Generate & Send OTP ──────────────────────────────────────────────────────

export async function generateAndSendOtp(
  email: string
): Promise<{ message: string; emailSent: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const docId = emailToDocId(normalizedEmail);
  const masked = maskEmail(normalizedEmail);

  console.log(`OTP_REQUEST_START recipient=${masked}`);

  // Rate limit check
  const allowed = await checkAndIncrementRateLimit(docId, normalizedEmail);
  if (!allowed) {
    console.warn(`OTP_RATE_LIMITED recipient=${masked}`);
    return {
      message: 'Too many verification requests. Please wait before trying again.',
      emailSent: false,
    };
  }

  // Generate secure OTP
  const otpCode = generateSecureOtp();
  const now = Date.now();
  const expiresAt = now + OTP_EXPIRY_MINUTES * 60 * 1000;

  // Read existing doc to maintain sliding rate window
  let windowStart = now;
  let requestCount = 1;
  try {
    const existingSnap = await getDoc(doc(db, OTP_COLLECTION, docId));
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      const oneHourAgo = now - 60 * 60 * 1000;
      if (existingData.windowStart && existingData.windowStart > oneHourAgo) {
        windowStart = existingData.windowStart;
        requestCount = (existingData.requestCount || 0) + 1;
      }
    }
  } catch (e) {
    // best-effort
  }

  // Store OTP in Firestore (persists across serverless invocations)
  try {
    await setDoc(doc(db, OTP_COLLECTION, docId), {
      email: normalizedEmail,
      otp: otpCode,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: now,
      windowStart,
      requestCount,
    });
    console.log(`OTP_STORED recipient=${masked} expiresIn=${OTP_EXPIRY_MINUTES}min`);
  } catch (err: any) {
    console.error(`OTP_STORE_FAILED recipient=${masked} error=${err.message}`);
    throw new Error('Failed to generate verification code. Please try again.');
  }

  // Build email
  const fromEmail =
    process.env.SMTP_FROM ||
    '"Hindustan Wholesale" <saxenaansh387@gmail.com>';

  const mailOptions = {
    from: fromEmail,
    to: normalizedEmail,
    subject: 'Your Hindustan Wholesale Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#8B0000;margin:0;font-size:24px;font-weight:800;">Hindustan Wholesale</h2>
          <p style="color:#6b7280;font-size:13px;margin-top:4px;">India's Premier B2B Wholesale Marketplace</p>
        </div>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0;"/>
        <h3 style="color:#111827;font-size:18px;margin-bottom:12px;">Email Verification Code</h3>
        <p style="color:#4b5563;font-size:14px;line-height:1.5;">
          Use this 6-digit code to verify your email. Valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>
        <div style="text-align:center;margin:28px 0;padding:20px;background:#fef2f2;border:2px dashed #fca5a5;border-radius:12px;">
          <span style="font-family:monospace;font-size:40px;font-weight:800;letter-spacing:10px;color:#8B0000;">
            ${otpCode}
          </span>
        </div>
        <p style="color:#6b7280;font-size:12px;">
          If you did not request this code, ignore this email. Never share your OTP with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;"/>
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">
          &copy; ${new Date().getFullYear()} Hindustan Wholesale Pvt. Ltd.
        </p>
      </div>
    `,
  };

  // Send email via SMTP
  let emailSent = false;
  const transporter = getTransporter();

  if (!transporter) {
    console.error(`OTP_EMAIL_SKIPPED recipient=${masked} reason=SMTP_NOT_CONFIGURED`);
    return {
      message: 'Verification code generated but email service is not configured. Please contact support.',
      emailSent: false,
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    emailSent = true;
    console.log(`OTP_EMAIL_SENT recipient=${masked} messageId=${info.messageId}`);
  } catch (err: any) {
    // Classify SMTP errors for debugging
    const code = err.code || 'UNKNOWN';
    const responseCode = err.responseCode || '';
    let errorType = 'SMTP_UNKNOWN';

    if (code === 'EDNS' || code === 'ENOTFOUND') errorType = 'SMTP_DNS_FAILURE';
    else if (code === 'ECONNREFUSED') errorType = 'SMTP_CONNECTION_REFUSED';
    else if (code === 'ETIMEDOUT' || code === 'ESOCKET') errorType = 'SMTP_TIMEOUT';
    else if (code === 'EAUTH' || responseCode === 535) errorType = 'SMTP_AUTH_FAILURE';
    else if (responseCode === 550 || responseCode === 553) errorType = 'SMTP_SENDER_REJECTED';
    else if (responseCode === 421 || responseCode === 450) errorType = 'SMTP_RATE_LIMITED';

    console.error(
      `OTP_EMAIL_FAILED recipient=${masked} errorType=${errorType} ` +
      `code=${code} responseCode=${responseCode} message=${err.message}`
    );
  }

  return {
    message: emailSent
      ? `Verification code sent to ${normalizedEmail}`
      : 'Unable to send verification email. Please verify your email address or try again.',
    emailSent,
  };
}

// ── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtpCode(
  email: string,
  inputOtp: string
): Promise<{ valid: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const docId = emailToDocId(normalizedEmail);
  const masked = maskEmail(normalizedEmail);

  console.log(`OTP_VERIFY_START recipient=${masked}`);

  // Read OTP record from Firestore
  let data: any;
  try {
    const snap = await getDoc(doc(db, OTP_COLLECTION, docId));
    if (!snap.exists()) {
      console.warn(`OTP_VERIFY_NOT_FOUND recipient=${masked}`);
      return {
        valid: false,
        message: 'No active OTP found for this email. Please click "Resend Code".',
      };
    }
    data = snap.data();
  } catch (err: any) {
    console.error(`OTP_VERIFY_READ_ERROR recipient=${masked} error=${err.message}`);
    return {
      valid: false,
      message: 'Failed to verify code. Please try again.',
    };
  }

  // Check expiration
  if (Date.now() > data.expiresAt) {
    await deleteDoc(doc(db, OTP_COLLECTION, docId)).catch(() => {});
    console.warn(`OTP_VERIFY_EXPIRED recipient=${masked}`);
    return {
      valid: false,
      message: 'OTP has expired. Please request a new code.',
    };
  }

  // Check max attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    await deleteDoc(doc(db, OTP_COLLECTION, docId)).catch(() => {});
    console.warn(`OTP_VERIFY_MAX_ATTEMPTS recipient=${masked}`);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  // Verify OTP
  if (inputOtp.trim() !== data.otp) {
    const newAttempts = (data.attempts || 0) + 1;
    try {
      await setDoc(doc(db, OTP_COLLECTION, docId), { ...data, attempts: newAttempts }, { merge: true });
    } catch { /* best effort */ }

    const remaining = MAX_ATTEMPTS - newAttempts;
    console.warn(`OTP_VERIFY_WRONG recipient=${masked} attemptsUsed=${newAttempts}`);
    return {
      valid: false,
      message: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Correct OTP — consume it (delete from Firestore)
  try {
    await deleteDoc(doc(db, OTP_COLLECTION, docId));
  } catch { /* best effort */ }

  console.log(`OTP_VERIFY_SUCCESS recipient=${masked}`);
  return { valid: true, message: 'OTP verified successfully!' };
}
