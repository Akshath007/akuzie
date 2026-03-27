import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

import crypto from 'crypto';

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * GET /api/workspaces
 * Header: Authorization: Bearer <firebase-id-token>
 * 
 * Fetches all dynamic workspaces. Super admin sees all, 
 * regular users see only those where their email is in allowedEmails.
 */
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);
        const email = decoded.email;
        // Strictly only the primary admin is super admin for discovering ALL workspaces
        const isSuperAdmin = email === 'akshathhp123@gmail.com';

        const workspacesRef = adminDb.collection('workspaces');
        const snapshot = await workspacesRef.orderBy('createdAt', 'desc').get();

        let workspaces = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis?.() || null,
        }));

        // Filter for non-super admins (like akuzie27@gmail.com logging in as admin)
        if (!isSuperAdmin) {
            workspaces = workspaces.filter(ws =>
                ws.allowedEmails && ws.allowedEmails.includes(email)
            );
        }

        return NextResponse.json({ workspaces });
    } catch (error) {
        console.error('Fetch workspaces error:', error);
        return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
    }
}

/**
 * POST /api/workspaces
 * Body: { id, label, description, category, icon, bgGradient, color, allowedEmails, pin }
 * Header: Authorization: Bearer <super-admin-token>
 * 
 * Creates a new dynamic workspace.
 */
export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        const isSuperAdmin = decoded.email === 'akshathhp123@gmail.com';
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();
        const { id, label, description, category, icon, bgGradient, color, allowedEmails, pin } = data;

        if (!id || !label || !category || !pin) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (pin.length < 4) {
             return NextResponse.json({ error: 'PIN must be at least 4 characters' }, { status: 400 });
        }

        const workspacesRef = adminDb.collection('workspaces');

        // Ensure ID is unique
        const existing = await workspacesRef.where('id', '==', id).get();
        if (!existing.empty) {
            return NextResponse.json({ error: 'Workspace ID already exists' }, { status: 400 });
        }

        const newDoc = await workspacesRef.add({
            id,
            label,
            description: description || '',
            category,
            icon: icon || '📂',
            bgGradient: bgGradient || 'from-gray-500 to-gray-700',
            color: color || 'gray',
            allowedEmails: allowedEmails || [],
            pinHash: hashPin(pin),
            createdAt: new Date(),
            createdBy: decoded.email
        });

        // Log
        await adminDb.collection('admin_logs').add({
            adminEmail: decoded.email,
            action: 'CREATE_WORKSPACE',
            targetId: id,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, docId: newDoc.id });

    } catch (error) {
        console.error('Create workspace error:', error);
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }
}

/**
 * DELETE /api/workspaces
 * Body: { docId }
 * Header: Authorization: Bearer <super-admin-token>
 */
export async function DELETE(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        const isSuperAdmin = decoded.email === 'akshathhp123@gmail.com';
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { docId } = await request.json();

        if (!docId) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        // Get workspace details before delete for logging
        const workspacesRef = adminDb.collection('workspaces');
        const docSnap = await workspacesRef.where('id', '==', docId).limit(1).get();
        if (docSnap.empty) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const docRef = docSnap.docs[0].ref;
        const workspaceData = docSnap.docs[0].data();

        // Delete the workspace
        await docRef.delete();

        // Also delete any active sessions
        const sessionsSnap = await adminDb.collection('workspace_sessions')
            .where('workspace', '==', workspaceData.id).get();

        if (!sessionsSnap.empty) {
            const batch = adminDb.batch();
            sessionsSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // Log
        await adminDb.collection('admin_logs').add({
            adminEmail: decoded.email,
            action: 'DELETE_WORKSPACE',
            targetId: workspaceData.id,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete workspace error:', error);
        return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
    }
}

/**
 * PATCH /api/workspaces
 * Body: { docId, ...updates }
 * Header: Authorization: Bearer <super-admin-token>
 */
export async function PATCH(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(idToken);

        const isSuperAdmin = decoded.email === 'akshathhp123@gmail.com';
        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { docId, ...updates } = await request.json();

        if (!docId) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        // Prevent updating sensitive fields via PATCH
        delete updates.id;

        const workspacesRef = adminDb.collection('workspaces');
        const docSnap = await workspacesRef.where('id', '==', docId).limit(1).get();
        if (docSnap.empty) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const docRef = docSnap.docs[0].ref;

        await docRef.update({
            ...updates,
            updatedAt: new Date(),
            updatedBy: decoded.email
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update workspace error:', error);
        return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
    }
}
