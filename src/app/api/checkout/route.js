import { NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy } from '@/lib/lemonsqueezy';

export async function POST(request) {
    try {
        configureLemonSqueezy();

        const body = await request.json();
        const { orderId, customerName, customerEmail, amount, items } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const storeId = process.env.LEMONSQUEEZY_STORE_ID;
        const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID;

        if (!storeId || !variantId) {
            return NextResponse.json(
                { error: 'Lemon Squeezy configuration missing' },
                { status: 500 }
            );
        }

        // Create checkout with custom price
        const checkout = await createCheckout(storeId, variantId, {
            checkoutData: {
                email: customerEmail || undefined,
                name: customerName || undefined,
                custom: {
                    orderId,
                    items: JSON.stringify(items),
                }
            },
            checkoutOptions: {
                embed: false,
                media: false,
                logo: true,
                desc: true,
                discount: true,
                dark: false,
                buttonColor: '#7c3aed',
            },
            expiresAt: null,
            preview: false,
            testMode: false, // Production mode
        });

        if (checkout.error) {
            throw new Error(checkout.error.message);
        }

        return NextResponse.json({
            checkoutUrl: checkout.data.data.attributes.url,
        });
    } catch (error) {
        console.error('Checkout creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
