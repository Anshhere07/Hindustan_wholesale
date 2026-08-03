import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const result = await verifyOtpCode(email, otp);

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    return NextResponse.json({ error: err.message || 'Failed to verify OTP' }, { status: 500 });
  }
}
