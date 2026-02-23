import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';
import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// Rate limiter: max 5 attempts per IP per 15 minutes
const rateLimiter = new LRUCache({
    max: 500,
    ttl: 15 * 60 * 1000, // 15 minutes
});

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * POST /api/workspace/verify
 * Body: { workspace: "art" | "crochet", pin: "1234" }
 * 
 * Verifies workspace PIN and returns a session token.
 * Rate limited to 5 attempts per IP per 15 minutes.
 */
export async function POST(request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const rateLimitKey = `workspace_pin_${ip}`;
        const attempts = rateLimiter.get(rateLimitKey) || 0;

        if (attempts >= 5) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again in 15 minutes.', locked: true },
                { status: 429 }
            );
        }

        const { workspace, pin } = await request.json();

        // Validate input
        if (!workspace || !pin) {
            return NextResponse.json({ error: 'Workspace and PIN are required.' }, { status: 400 });
        }

        if (!['art', 'crochet'].includes(workspace)) {
            return NextResponse.json({ error: 'Invalid workspace.' }, { status: 400 });
        }

        // Get workspace config from Firestore
        const configRef = adminDb.collection('workspace_config').doc(workspace);
        const configSnap = await configRef.get();

        if (!configSnap.exists) {
            // First-time setup: create default PIN (hashed)
            // Default PINs: art=1234, crochet=5678 (should be changed immediately)
            const defaultPin = workspace === 'art' ? '1234' : '5678';
            await configRef.set({
                pinHash: hashPin(defaultPin),
                workspace,
                createdAt: new Date(),
            });

            // If provided PIN matches default, allow access
            if (pin !== defaultPin) {
                rateLimiter.set(rateLimitKey, attempts + 1);
                return NextResponse.json(
                    { error: 'Incorrect PIN.', remainingAttempts: 4 - attempts },
                    { status: 401 }
                );
            }
        } else {
            const config = configSnap.data();
            const pinHash = hashPin(pin);

            if (pinHash !== config.pinHash) {
                rateLimiter.set(rateLimitKey, attempts + 1);
                const remaining = 4 - attempts;
                return NextResponse.json(
                    { error: `Incorrect PIN. ${remaining > 0 ? remaining + ' attempts remaining.' : 'Account locked.'}`, remainingAttempts: remaining },
                    { status: 401 }
                );
            }
        }

        // PIN correct — generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Store session in Firestore
        await adminDb.collection('workspace_sessions').doc(sessionToken).set({
            workspace,
            expiresAt,
            createdAt: new Date(),
            ip,
        });

        // Log workspace access
        await adminDb.collection('admin_logs').add({
            action: 'WORKSPACE_ACCESS',
            workspace,
            ip,
            timestamp: new Date(),
            details: { method: 'pin_verification' },
        });

        // Reset rate limiter on success
        rateLimiter.delete(rateLimitKey);

        return NextResponse.json({
            success: true,
            token: sessionToken,
            workspace,
            expiresAt,
        });
    } catch (error) {
        console.error('Workspace verify error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

/**
 * GET /api/workspace/verify?token=xxx
 * 
 * Validates an existing session token.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const sessionRef = adminDb.collection('workspace_sessions').doc(token);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        const session = sessionSnap.data();

        if (Date.now() > session.expiresAt) {
            // Session expired — clean up
            await sessionRef.delete();
            return NextResponse.json({ valid: false, expired: true }, { status: 401 });
        }

        return NextResponse.json({
            valid: true,
            workspace: session.workspace,
            expiresAt: session.expiresAt,
        });
    } catch (error) {
        console.error('Session verify error:', error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}

/**
 * PUT /api/workspace/verify
 * Body: { workspace: "art" | "crochet", newPin: "newpin123" }
 * Header: Authorization: Bearer <firebase-id-token>
 * 
 * Allows super admin to change workspace PINs.
 */
export async function PUT(request) {
    try {
        // Verify Firebase auth token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        // Only super admin can change PINs
        if (decoded.email !== 'akshathhp123@gmail.com') {
            return NextResponse.json({ error: 'Forbidden. Only super admin can change PINs.' }, { status: 403 });
        }

        const { workspace, newPin } = await request.json();

        // Validate
        if (!workspace || !newPin) {
            return NextResponse.json({ error: 'Workspace and new PIN are required.' }, { status: 400 });
        }

        if (!['art', 'crochet'].includes(workspace)) {
            return NextResponse.json({ error: 'Invalid workspace.' }, { status: 400 });
        }

        if (newPin.length < 4) {
            return NextResponse.json({ error: 'PIN must be at least 4 characters.' }, { status: 400 });
        }

        // Update PIN hash in Firestore
        const configRef = adminDb.collection('workspace_config').doc(workspace);
        await configRef.set({
            pinHash: hashPin(newPin),
            workspace,
            updatedAt: new Date(),
            updatedBy: decoded.email,
        }, { merge: true });

        // Invalidate all active sessions for this workspace
        const sessionsRef = adminDb.collection('workspace_sessions');
        const sessionsSnap = await sessionsRef.where('workspace', '==', workspace).get();
        const batch = adminDb.batch();
        sessionsSnap.docs.forEach(doc => batch.delete(doc.ref));
        if (sessionsSnap.docs.length > 0) await batch.commit();

        // Log the action
        await adminDb.collection('admin_logs').add({
            adminEmail: decoded.email,
            action: 'CHANGE_WORKSPACE_PIN',
            targetId: workspace,
            timestamp: new Date(),
            details: { workspace, sessionsInvalidated: sessionsSnap.docs.length },
        });

        return NextResponse.json({
            success: true,
            message: `PIN for ${workspace} workspace updated successfully. ${sessionsSnap.docs.length} active sessions revoked.`,
        });
    } catch (error) {
        console.error('Change PIN error:', error);
        return NextResponse.json({ error: 'Failed to update PIN.' }, { status: 500 });
    }
}
