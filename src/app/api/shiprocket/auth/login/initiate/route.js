import { NextResponse } from 'next/server';
import { SHIPROCKET_BASE_URL, generateShiprocketSignature } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
        const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("Missing Shiprocket credentials");
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const timestamp = new Date().toISOString();
        const requestBody = {
            country_code: '91', // Assuming India for now
            phone: phone,
            modes: ['SMS'],
            timestamp: timestamp
        };

        const bodyString = JSON.stringify(requestBody);
        const signature = generateShiprocketSignature(bodyString, secretKey);

        const response = await fetch(`${SHIPROCKET_BASE_URL}/api/v1/access-token/s2s-login/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-HMAC-SHA256': signature // Signature needed for Initiate
            },
            body: bodyString
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Shiprocket Login Initiate Error:", data);
            return NextResponse.json({ error: data.error?.message || 'Failed to initiate login', details: data }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
