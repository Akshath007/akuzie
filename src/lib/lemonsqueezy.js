import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy with API key
export function configureLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        throw new Error('LEMONSQUEEZY_API_KEY is not set in environment variables');
    }

    lemonSqueezySetup({
        apiKey,
        onError: (error) => {
            console.error('Lemon Squeezy Error:', error);
            throw error;
        },
    });
}

export const LEMON_SQUEEZY_CONFIG = {
    storeId: process.env.LEMONSQUEEZY_STORE_ID,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
};
