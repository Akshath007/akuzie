
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { orderId, amount, items } = await req.json();

        const apiKey = process.env.SHIPROCKET_CHECKOUT_API_KEY;
        const secretKey = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;

        if (!apiKey || !secretKey) {
            return NextResponse.json({ error: 'Shiprocket credentials missing' }, { status: 500 });
        }

        const timestamp = new Date().toISOString();

        // The documentation says HMAC SHA256 using secret key and request body.
        // However, usually GET requests sign query params or timestamp. 
        // The example provided shows data being sent in body.

        // We need to map our cart items to Shiprocket's expected format.
        // NOTE: In a real "Headless" flow, products are usually synced beforehand 
        // and we pass variant_id. Since we might not have synced catalog, 
        // we'll try to pass ad-hoc items if supported, otherwise we might see an error
        // "Variant not found" if Shiprocket expects pre-synced items.
        // Based on the doc, it expects "variant_id". 
        // Since we are a custom website without a sync, we might need to use 
        // SKU as variant_id if we did the sync, or hope it accepts descriptive items.

        // ASSUMPTION: You have synced your products or Shiprocket allows ad-hoc items.
        // If not, this step will fail with "Invalid Variant".
        // For now, we pass our item ID as variant_id.
        const cartData = {
            cart_data: {
                items: items.map(item => ({
                    variant_id: item.id.toString(), // Ensure string
                    quantity: 1,
                    // optional fields if supported by ad-hoc
                    title: item.name,
                    price: item.price
                }))
            },
            redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id=${orderId}`,
            timestamp: timestamp
        };

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(JSON.stringify(cartData))
            .digest('base64');

        const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-HMAC-SHA256': signature
            },
            body: JSON.stringify(cartData)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Shiprocket Token Error:", result);
            return NextResponse.json({ error: result.message || 'Failed to generate token' }, { status: response.status });
        }

        return NextResponse.json({ token: result.token });

    } catch (error) {
        console.error("Shiprocket API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
