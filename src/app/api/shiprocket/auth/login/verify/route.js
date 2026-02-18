import { NextResponse } from 'next/server';
import { SHIPROCKET_BASE_URL } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        const { token, otp, user_address_consent } = await req.json();

        if (!token || !otp) {
            return NextResponse.json({ error: 'Token and OTP are required' }, { status: 400 });
        }

        const requestBody = {
            token: token,
            otp: otp,
            user_address_consent: user_address_consent !== undefined ? user_address_consent : true
        };

        // Note: No API Key/HMAC needed for verify according to Postman docs
        const response = await fetch(`${SHIPROCKET_BASE_URL}/api/v1/access-token/s2s-login/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Shiprocket Login Verify Error:", data);
            return NextResponse.json({ error: data.error?.message || 'Failed to verify OTP', details: data }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
