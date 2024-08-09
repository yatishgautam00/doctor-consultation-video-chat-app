import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request) {
  const { doctorPhone, message } = await request.json();

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: `+91${doctorPhone}`,
    }) ; 

    // console.log(`SMS sent: ${response.sid}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SMS sending error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
