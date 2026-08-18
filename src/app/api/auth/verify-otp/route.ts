import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'A 6-digit OTP code is required' }, { status: 400 });
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
    console.error('OTP_VERIFY_ROUTE_ERROR:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
