import { NextResponse } from 'next/server';
import { SHIPROCKET_BASE_URL } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const requestBody = {
            token: token
        };

        // Note: No API Key/HMAC needed for customer data according to Postman docs
        const response = await fetch(`${SHIPROCKET_BASE_URL}/api/v1/customer-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Shiprocket Customer Data Error:", data);
            return NextResponse.json({ error: data.error?.message || 'Failed to fetch customer data', details: data }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
