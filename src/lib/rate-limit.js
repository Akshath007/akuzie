import { LRUCache } from 'lru-cache';

const rateLimitConfig = {
    uniqueTokenPerInterval: 500,
    interval: 60000, // 1 minute
};

const tokenCache = new LRUCache({
    max: rateLimitConfig.uniqueTokenPerInterval,
    ttl: rateLimitConfig.interval,
});

export async function rateLimit(req, limit = 10) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
        const tokenCount = tokenCache.get(ip) || [0];

        if (tokenCount[0] === 0) {
            tokenCache.set(ip, [1]);
        } else {
            tokenCount[0] += 1;
            tokenCache.set(ip, tokenCount);
        }

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return {
            success: !isRateLimited,
            limit,
            remaining: isRateLimited ? 0 : limit - currentUsage,
        };
    } catch (e) {
        return { success: true, error: e };
    }
}
