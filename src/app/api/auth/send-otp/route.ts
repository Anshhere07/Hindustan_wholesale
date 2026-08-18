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

    if (!result.emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Unable to send verification email. Please check your email or try again.',
          emailSent: false,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      emailSent: true,
    });
  } catch (err: any) {
    console.error('OTP_ROUTE_ERROR:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to process OTP request' },
      { status: 500 }
    );
  }
}
