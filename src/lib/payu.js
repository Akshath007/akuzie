import crypto from 'crypto';

// PayU environment configuration
const PAYU_TEST_URL = 'https://test.payu.in/_payment';
const PAYU_PRODUCTION_URL = 'https://secure.payu.in/_payment';
const PAYU_VERIFY_TEST_URL = 'https://test.payu.in/merchant/postservice.php?form=2';
const PAYU_VERIFY_PRODUCTION_URL = 'https://info.payu.in/merchant/postservice.php?form=2';

export function getPayUConfig() {
    const isTest = process.env.PAYU_MODE === 'test';
    return {
        key: process.env.PAYU_MERCHANT_KEY,
        salt: process.env.PAYU_MERCHANT_SALT,
        paymentUrl: isTest ? PAYU_TEST_URL : PAYU_PRODUCTION_URL,
        verifyUrl: isTest ? PAYU_VERIFY_TEST_URL : PAYU_VERIFY_PRODUCTION_URL,
        isTest,
    };
}

/**
 * Generate PayU payment hash
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params) {
    const { key, salt, txnid, amount, productinfo, firstname, email,
        udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' } = params;

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
}

/**
 * Validate reverse hash from PayU response (surl/furl callback)
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function validatePayUResponseHash(params) {
    const { salt, status, udf5 = '', udf4 = '', udf3 = '', udf2 = '', udf1 = '',
        email, firstname, productinfo, amount, txnid, key, hash } = params;

    const reverseHashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex').toLowerCase();

    return calculatedHash === hash;
}

/**
 * Generate a unique transaction ID
 */
export function generateTxnId() {
    return `AKZ_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
