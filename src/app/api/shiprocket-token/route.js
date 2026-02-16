import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { orderId, amount, items } = await req.json();

        const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
        const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("Missing Shiprocket credentials in .env.local");
            return NextResponse.json({ error: 'Shiprocket credentials missing' }, { status: 500 });
        }

        const timestamp = new Date().toISOString();

        // Build the request body exactly as per Shiprocket docs
        const requestBody = {
            cart_data: {
                items: items.map(item => ({
                    variant_id: item.id.toString(),
                    quantity: 1
                }))
            },
            redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}`,
            timestamp: timestamp
        };

        const bodyString = JSON.stringify(requestBody);

        // HMAC SHA256 signature using secret key and the JSON body string
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(bodyString)
            .digest('base64');

        console.log("=== Shiprocket Token Request ===");
        console.log("URL:", 'https://checkout-api.shiprocket.com/api/v1/access-token/checkout');
        console.log("Body:", bodyString);
        console.log("HMAC Signature:", signature);
        console.log("API Key:", apiKey);

        const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': `Bearer ${apiKey}`,
                'X-Api-HMAC-SHA256': signature
            },
            body: bodyString
        });

        const responseText = await response.text();
        console.log("=== Shiprocket Token Response ===");
        console.log("Status:", response.status);
        console.log("Body:", responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Shiprocket response:", responseText);
            return NextResponse.json({ error: 'Invalid response from payment gateway' }, { status: 502 });
        }

        if (!response.ok) {
            console.error("Shiprocket Token Error:", result);
            return NextResponse.json({
                error: result.message || result.error || 'Failed to generate token',
                details: result
            }, { status: response.status });
        }

        // The token might be at result.token or result.result.token
        const token = result.token || result?.result?.token;

        if (!token) {
            console.error("No token in Shiprocket response:", result);
            return NextResponse.json({
                error: 'No token received from payment gateway',
                details: result
            }, { status: 500 });
        }

        return NextResponse.json({ token });

    } catch (error) {
        console.error("Shiprocket API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
