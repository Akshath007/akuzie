import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    // Rate limit public email endpoints (max 5 per minute)
    const limiter = await rateLimit(request, 5);
    if (!limiter.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { to, subject, html } = await request.json();
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Akuzie <onboarding@resend.dev>',
                to,
                subject,
                html,
            }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
