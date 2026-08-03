// ─────────────────────────────────────────────────────────────────────────────
// Mail OTP Verification Service — Hindustan Wheels
// Handles: 6-digit random code generation, Firestore TTL storage & Nodemailer SMTP dispatch
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const OTP_COLLECTION = 'otp_codes';
const OTP_EXPIRY_MINUTES = 10; // 10 minutes TTL

// Configure Nodemailer transporter (supports Gmail SMTP with fallback)
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'hn.aditya321@gmail.com';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass && pass !== 'your_gmail_app_password') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Fallback dev transporter (Ethereal test account or console logger)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal_dev@ethereal.email',
      pass: 'ethereal_password',
    },
  });
}

/**
 * Generate and send a 6-digit OTP code to the specified email address
 */
export async function generateAndSendOtp(email: string): Promise<{ otp: string; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Generate random 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  // 2. Save OTP record to Firestore `otp_codes` collection
  const docId = normalizedEmail.replace(/[^a-z0-9]/gi, '_');
  await setDoc(doc(db, OTP_COLLECTION, docId), {
    email: normalizedEmail,
    otp: otpCode,
    expiresAt,
    attempts: 0,
    verified: false,
    createdAt: serverTimestamp(),
  });

  // 3. Send email with 6-digit code via Nodemailer
  const fromEmail = process.env.SMTP_FROM || '"Hindustan Wheels Security" <no-reply@hindustanwheels.com>';
  
  const mailOptions = {
    from: fromEmail,
    to: normalizedEmail,
    subject: `🔐 ${otpCode} is your Hindustan Wheels Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #8B0000; margin: 0; font-size: 24px; font-weight: 800;">HINDUSTAN WHEELS</h2>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">India's Premier B2B Wholesale Marketplace</p>
        </div>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />

        <h3 style="color: #111827; font-size: 18px; margin-bottom: 12px;">Email OTP Verification</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          Use the following 6-digit One-Time Password (OTP) to log in to your account. This code is valid for <strong>10 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 28px 0; padding: 20px; background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #8B0000;">
            ${otpCode}
          </span>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.4;">
          If you did not request this OTP code, please ignore this email or contact support. Never share your OTP with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Hindustan Wheels Wholesale Platform. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Real OTP email sent to ${normalizedEmail} with code [${otpCode}]`);
  } catch (err: any) {
    console.error(`❌ SMTP mail dispatch failed for ${normalizedEmail}: ${err.message}`);
  }

  return {
    otp: otpCode,
    message: `Verification code generated and sent to ${normalizedEmail}`,
  };
}

/**
 * Verify a 6-digit OTP code against Firestore
 */
export async function verifyOtpCode(email: string, inputOtp: string): Promise<{ valid: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const docId = normalizedEmail.replace(/[^a-z0-9]/gi, '_');

  const snap = await getDoc(doc(db, OTP_COLLECTION, docId));

  if (!snap.exists()) {
    return { valid: false, message: 'No active OTP request found for this email. Please click "Resend Code".' };
  }

  const data = snap.data();

  // Check expiration
  if (Date.now() > data.expiresAt) {
    await deleteDoc(doc(db, OTP_COLLECTION, docId));
    return { valid: false, message: 'Verification OTP has expired. Please click "Resend Code".' };
  }

  // Check attempts limit (max 5 invalid tries)
  if ((data.attempts || 0) >= 5) {
    await deleteDoc(doc(db, OTP_COLLECTION, docId));
    return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP code.' };
  }

  // Check code match against stored Firestore OTP
  const isValidCode = inputOtp.trim() === data.otp;

  if (!isValidCode) {
    await updateDoc(doc(db, OTP_COLLECTION, docId), {
      attempts: (data.attempts || 0) + 1,
    });
    return { valid: false, message: `Invalid OTP code (${4 - (data.attempts || 0)} attempts remaining).` };
  }

  // Mark as verified and clean up doc
  await deleteDoc(doc(db, OTP_COLLECTION, docId));
  return { valid: true, message: 'OTP verified successfully!' };
}
