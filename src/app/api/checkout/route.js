import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId, customerName, customerEmail, customerPhone, amount, items } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // Determine API endpoint based on mode
        const isSandbox = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'sandbox';
        const apiUrl = isSandbox
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2022-09-01',
            },
            body: JSON.stringify({
                order_amount: amount,
                order_currency: 'INR',
                order_id: orderId,
                customer_details: {
                    customer_id: customerEmail || `cust_${Date.now()}`,
                    customer_name: customerName || 'Guest',
                    customer_email: customerEmail,
                    customer_phone: customerPhone || '9999999999',
                },
                order_meta: {
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id={order_id}`,
                    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
                },
                order_note: `Order #${orderId}`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree API error:', data);
            throw new Error(data.message || 'Failed to create Cashfree order');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Checkout creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
