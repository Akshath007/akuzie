import { NextResponse } from 'next/server';
import { SHIPROCKET_BASE_URL, generateShiprocketSignature } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        const { orderId, amount, items } = await req.json();

        // Validate Items
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
        }

        const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
        const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("Missing Shiprocket credentials in .env.local");
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const timestamp = new Date().toISOString();

        // Build the request body exactly as per Shiprocket docs
        const requestBody = {
            cart_data: {
                items: items.map(item => ({
                    variant_id: item.id.toString(), // Must match the ID exposed in /api/shiprocket/products
                    quantity: 1, // Assuming quantity 1 for art pieces
                    // catalog_data: { ... } // Optional: Can be passed if catalog sync is slow
                })),
                mobile_app: false, // Set to true if calling from mobile app
                // custom_attributes: { ... } 
            },
            redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}`,
            timestamp: timestamp
        };

        const bodyString = JSON.stringify(requestBody);
        const signature = generateShiprocketSignature(bodyString, secretKey);

        console.log("=== Shiprocket Token Request ===");
        console.log("URL:", `${SHIPROCKET_BASE_URL}/api/v1/access-token/checkout`);
        console.log("Body:", bodyString);

        const response = await fetch(`${SHIPROCKET_BASE_URL}/api/v1/access-token/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-HMAC-SHA256': signature
            },
            body: bodyString
        });

        const responseText = await response.text();
        console.log("Response:", responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Shiprocket response");
            return NextResponse.json({ error: 'Invalid response from gateway' }, { status: 502 });
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
            return NextResponse.json({
                error: 'No token received from gateway',
                details: result
            }, { status: 500 });
        }

        return NextResponse.json({ token });

    } catch (error) {
        console.error("Shiprocket API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
