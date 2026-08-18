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

    // Never expose OTP in the response — not even in dev mode
    return NextResponse.json({
      success: true,
      message: result.message,
      emailSent: result.emailSent,
    });
  } catch (err: any) {
    console.error('OTP_ROUTE_ERROR:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to process OTP request' },
      { status: 500 }
    );
  }
}
