import { NextRequest, NextResponse } from 'next/server';

// Minimum time (in ms) a human would need to fill out the form
const MIN_SUBMISSION_TIME = 3000; // 3 seconds

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  _honey?: string;
  _loadTime?: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();
    const { name, email, message, _honey, _loadTime } = data;

    // Honeypot check - if filled, it's a bot
    if (_honey) {
      // Return success to not alert bots, but don't process
      console.log('[Contact] Honeypot triggered - bot detected');
      return NextResponse.json({ success: true });
    }

    // Time-based validation - reject if submitted too quickly
    if (_loadTime) {
      const submissionTime = Date.now() - _loadTime;
      if (submissionTime < MIN_SUBMISSION_TIME) {
        console.log(`[Contact] Submission too fast (${submissionTime}ms) - bot detected`);
        return NextResponse.json({ success: true });
      }
    }

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Sanitize inputs (basic XSS prevention)
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 254),
      message: message.trim().slice(0, 5000),
    };

    // Log the contact submission (in production, you'd send an email here)
    // You can integrate with services like:
    // - Resend (https://resend.com)
    // - SendGrid
    // - AWS SES
    // - Or forward to a webhook
    console.log('[Contact] New message received:', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      messageLength: sanitizedData.message.length,
      timestamp: new Date().toISOString(),
    });

    // TODO: Add email sending here
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'contact@yourdomain.com',
    //   to: 'dakota@twofold.tech',
    //   subject: `Contact form: ${sanitizedData.name}`,
    //   text: `From: ${sanitizedData.name} (${sanitizedData.email})\n\n${sanitizedData.message}`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Message received successfully.',
    });
  } catch (error) {
    console.error('[Contact] Error processing form:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}
