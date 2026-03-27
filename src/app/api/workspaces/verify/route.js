import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

// ─── Firestore-backed Rate Limiter ───────────────────────────────────────────
// Unlike in-memory LRUCache, this survives serverless cold starts.
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkAndIncrementRateLimit(ip) {
    const key = `pin_rl_${ip}`;
    const docRef = adminDb.collection('rate_limits').doc(key);

    const result = await adminDb.runTransaction(async (tx) => {
        const doc = await tx.get(docRef);
        const now = Date.now();

        if (!doc.exists || doc.data().windowStart + RATE_LIMIT_WINDOW_MS < now) {
            // New window
            tx.set(docRef, { attempts: 1, windowStart: now });
            return { attempts: 1, blocked: false };
        }

        const data = doc.data();
        const newAttempts = data.attempts + 1;

        if (newAttempts > RATE_LIMIT_MAX_ATTEMPTS) {
            return { attempts: newAttempts, blocked: true };
        }

        tx.update(docRef, { attempts: newAttempts });
        return { attempts: newAttempts, blocked: false };
    });

    return result;
}

async function resetRateLimit(ip) {
    const key = `pin_rl_${ip}`;
    await adminDb.collection('rate_limits').doc(key).delete();
}
// ─────────────────────────────────────────────────────────────────────────────

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * POST /api/workspaces/verify
 * Body: { workspace: "art" | "crochet", pin: "1234" }
 *
 * Verifies workspace PIN and returns a session token.
 * Rate limited to 5 attempts per IP per 15 minutes — persisted in Firestore.
 */
export async function POST(request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

        // Check rate limit BEFORE processing the PIN
        const rateCheck = await checkAndIncrementRateLimit(ip);
        if (rateCheck.blocked) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again in 15 minutes.', locked: true },
                { status: 429 }
            );
        }

        const { workspace, pin } = await request.json();

        if (!workspace || !pin) {
            return NextResponse.json({ error: 'Workspace and PIN are required.' }, { status: 400 });
        }

        // Find the workspace
        const workspaceSnap = await adminDb.collection('workspaces').where('id', '==', workspace).limit(1).get();
        if (workspaceSnap.empty) {
            return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
        }

        const config = workspaceSnap.docs[0].data();

        if (!config.pinHash) {
            return NextResponse.json({ error: 'Workspace is not fully configured yet.' }, { status: 400 });
        }

        const pinHash = hashPin(pin);

        if (pinHash !== config.pinHash) {
            const remaining = Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - rateCheck.attempts);
            return NextResponse.json(
                { error: `Incorrect PIN. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Account locked.'}`, remainingAttempts: remaining },
                { status: 401 }
            );
        }

        // PIN correct — generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Store session in Firestore (already persistent — no change needed here)
        await adminDb.collection('workspace_sessions').doc(sessionToken).set({
            workspace,
            expiresAt,
            createdAt: new Date(),
            ip,
        });

        await adminDb.collection('admin_logs').add({
            action: 'WORKSPACE_ACCESS',
            workspace,
            ip,
            timestamp: new Date(),
            details: { method: 'pin_verification' },
        });

        // Reset rate limit counter on success
        await resetRateLimit(ip);

        return NextResponse.json({ success: true, token: sessionToken, workspace, expiresAt });
    } catch (error) {
        console.error('Workspace verify error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

/**
 * GET /api/workspaces/verify?token=xxx
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
 * PUT /api/workspaces/verify
 * Body: { workspace: "art", newPin: "newpin123" }
 * Header: Authorization: Bearer <firebase-id-token>
 *
 * Allows super admin (by Firestore role) to change workspace PINs.
 */
export async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        // Check role via Firestore (or fallback to hardcoded super admin email)
        const userSnap = await adminDb.collection('users').where('email', '==', decoded.email).limit(1).get();
        const isSuperAdmin = decoded.email === 'akshathhp123@gmail.com' ||
            (!userSnap.empty && userSnap.docs[0].data().role === 'admin');

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden. Only super admin can change PINs.' }, { status: 403 });
        }

        const { workspace, newPin } = await request.json();

        if (!workspace || !newPin) {
            return NextResponse.json({ error: 'Workspace and new PIN are required.' }, { status: 400 });
        }

        if (newPin.length < 4) {
            return NextResponse.json({ error: 'PIN must be at least 4 characters.' }, { status: 400 });
        }

        const workspaceSnap = await adminDb.collection('workspaces').where('id', '==', workspace).limit(1).get();
        if (workspaceSnap.empty) {
            return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
        }

        const docRef = workspaceSnap.docs[0].ref;
        await docRef.set({ pinHash: hashPin(newPin), updatedAt: new Date(), updatedBy: decoded.email }, { merge: true });

        // Invalidate all active sessions for this workspace
        const sessionsSnap = await adminDb.collection('workspace_sessions').where('workspace', '==', workspace).get();
        const batch = adminDb.batch();
        sessionsSnap.docs.forEach(doc => batch.delete(doc.ref));
        if (sessionsSnap.docs.length > 0) await batch.commit();

        await adminDb.collection('admin_logs').add({
            adminEmail: decoded.email,
            action: 'CHANGE_WORKSPACE_PIN',
            targetId: workspace,
            timestamp: new Date(),
            details: { workspace, sessionsInvalidated: sessionsSnap.docs.length },
        });

        return NextResponse.json({
            success: true,
            message: `PIN for ${workspace} updated. ${sessionsSnap.docs.length} active sessions revoked.`,
        });
    } catch (error) {
        console.error('Change PIN error:', error);
        return NextResponse.json({ error: 'Failed to update PIN.' }, { status: 500 });
    }
}
