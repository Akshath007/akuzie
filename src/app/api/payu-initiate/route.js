import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getPayUConfig, generatePayUHash, generateTxnId } from '@/lib/payu';

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId, customerName, customerEmail, customerPhone, amount, productinfo } = body;

        if (!orderId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Missing orderId or invalid amount' }, { status: 400 });
        }

        const config = getPayUConfig();

        if (!config.key || !config.salt) {
            console.error('Missing PayU credentials in .env.local');
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
        }

        // Generate unique transaction ID
        const txnid = generateTxnId();

        // Format amount to 2 decimal places
        const formattedAmount = parseFloat(amount).toFixed(2);

        // Generate hash
        const hash = generatePayUHash({
            key: config.key,
            salt: config.salt,
            txnid,
            amount: formattedAmount,
            productinfo: productinfo || `Order #${orderId}`,
            firstname: customerName || 'Customer',
            email: customerEmail || 'customer@example.com',
        });

        // Return form params for the frontend to submit
        const formData = {
            key: config.key,
            txnid,
            amount: formattedAmount,
            productinfo: productinfo || `Order #${orderId}`,
            firstname: customerName || 'Customer',
            email: customerEmail || 'customer@example.com',
            phone: customerPhone || '',
            surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu-callback`,
            furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payu-callback`,
            hash,
            udf1: orderId, // Store our Firestore orderId in udf1 so we can retrieve it on callback
            udf2: '',
            udf3: '',
            udf4: '',
            udf5: '',
        };

        return NextResponse.json({
            formData,
            paymentUrl: config.paymentUrl,
        });

    } catch (error) {
        console.error('PayU initiate error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
