// ─────────────────────────────────────────────────────────────────────────────
// Mail OTP Verification Service — Hindustan Wholesale
// Handles: 6-digit random code generation, in-memory TTL storage & Nodemailer SMTP dispatch
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';

const OTP_EXPIRY_MINUTES = 10;

// ── In-Memory OTP Store ──────────────────────────────────────────────────────
interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  createdAt: number;
}

const otpStore = new Map<string, OtpRecord>();

// Cleanup expired records every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(key);
  }
}, 5 * 60 * 1000);

// ── Transporter ──────────────────────────────────────────────────────────────
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

// ── Generate & Send OTP ───────────────────────────────────────────────────────
export async function generateAndSendOtp(
  email: string
): Promise<{ otp: string; message: string; emailSent: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const docId = normalizedEmail.replace(/[^a-z0-9]/gi, '_');

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  // Save to in-memory store FIRST (before email attempt)
  otpStore.set(docId, {
    email: normalizedEmail,
    otp: otpCode,
    expiresAt,
    attempts: 0,
    verified: false,
    createdAt: Date.now(),
  });

  // Always log OTP to server console for dev/debug purposes
  console.log(`\n🔐 OTP for ${normalizedEmail}: [${otpCode}] (expires in ${OTP_EXPIRY_MINUTES} min)\n`);

  const fromEmail =
    process.env.SMTP_FROM ||
    '"Hindustan Wholesale" <saxenaansh387@gmail.com>';

  const mailOptions = {
    from: fromEmail,
    to: normalizedEmail,
    subject: `🔐 ${otpCode} is your Hindustan Wholesale Verification Code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#8B0000;margin:0;font-size:24px;font-weight:800;">Hindustan Wholesale</h2>
          <p style="color:#6b7280;font-size:13px;margin-top:4px;">India's Premier B2B Wholesale Marketplace</p>
        </div>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0;"/>
        <h3 style="color:#111827;font-size:18px;margin-bottom:12px;">Email Verification Code</h3>
        <p style="color:#4b5563;font-size:14px;line-height:1.5;">
          Use this 6-digit code to verify your email. Valid for <strong>10 minutes</strong>.
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
          © ${new Date().getFullYear()} Hindustan Wholesale Wholesale Platform
        </p>
      </div>
    `,
  };

  // Try to send email — non-blocking failure (OTP is still stored)
  let emailSent = false;
  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    emailSent = true;
    console.log(`✉️  OTP email sent successfully to ${normalizedEmail}`);
  } catch (err: any) {
    // Email failed but OTP is stored — log the error, don't throw
    console.error(`❌ SMTP failed for ${normalizedEmail}: ${err.message}`);
    console.log(`📋 OTP for manual use: ${otpCode}`);
    // Don't throw — let the API still return success so user can proceed
  }

  return {
    otp: otpCode,
    message: emailSent
      ? `Verification code sent to ${normalizedEmail}`
      : `Verification code generated. Check server console if email did not arrive.`,
    emailSent,
  };
}

// ── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOtpCode(
  email: string,
  inputOtp: string
): Promise<{ valid: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const docId = normalizedEmail.replace(/[^a-z0-9]/gi, '_');

  const data = otpStore.get(docId);

  if (!data) {
    return {
      valid: false,
      message: 'No active OTP found for this email. Please click "Resend Code".',
    };
  }

  if (Date.now() > data.expiresAt) {
    otpStore.delete(docId);
    return {
      valid: false,
      message: 'OTP has expired. Please request a new code.',
    };
  }

  if (data.attempts >= 5) {
    otpStore.delete(docId);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  if (inputOtp.trim() !== data.otp) {
    data.attempts += 1;
    otpStore.set(docId, data);
    const remaining = 5 - data.attempts;
    return {
      valid: false,
      message: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Correct OTP — clean up store
  otpStore.delete(docId);
  return { valid: true, message: 'OTP verified successfully!' };
}
