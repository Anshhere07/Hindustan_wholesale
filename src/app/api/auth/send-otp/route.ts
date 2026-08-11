import { NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/otp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const result = await generateAndSendOtp(email);

    return NextResponse.json({
      success: true,
      message: result.message,
      emailSent: result.emailSent,
      // In dev mode, expose OTP for easy testing (remove in production)
      ...(process.env.NODE_ENV === 'development' ? { devOtp: result.otp } : {}),
    });
  } catch (err: any) {
    console.error('Error in send-otp route:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process OTP request' },
      { status: 500 }
    );
  }
}
