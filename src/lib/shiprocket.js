import crypto from 'crypto';

export const SHIPROCKET_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://checkout-api.shiprocket.com'
    : 'https://fastrr-api-dev.pickrr.com';

export function generateShiprocketSignature(body, secretKey) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(body)
        .digest('base64');
}
