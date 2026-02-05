import { NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy } from '@/lib/lemonsqueezy';

export async function POST(request) {
    try {
        // Initialize Lemon Squeezy
        configureLemonSqueezy();

        const body = await request.json();
        const { variantId, productName, customData } = body;

        if (!variantId) {
            return NextResponse.json(
                { error: 'Variant ID is required' },
                { status: 400 }
            );
        }

        // Create a checkout session
        const checkout = await createCheckout(
            process.env.LEMONSQUEEZY_STORE_ID,
            variantId,
            {
                checkoutData: {
                    custom: customData || {},
                },
                checkoutOptions: {
                    embed: false,
                    media: false,
                    logo: true,
                    desc: true,
                    discount: true,
                    dark: false,
                    subscriptionPreview: true,
                    buttonColor: '#7c3aed', // Violet brand color
                },
                expiresAt: null,
                preview: false,
                testMode: process.env.NODE_ENV !== 'production',
            }
        );

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
