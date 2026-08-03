import { NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/otp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const result = await generateAndSendOtp(email);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
  }
}
