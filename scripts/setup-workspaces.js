const admin = require('firebase-admin');
const { loadEnvConfig } = require('@next/env');
const crypto = require('crypto');

loadEnvConfig(process.cwd());

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

function hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
}

async function setupWorkspaces() {
    const targetEmail = 'akuzie27@gmail.com';
    const defaultPin = '1234';
    const pinHash = hashPin(defaultPin);

    const workspaces = [
        {
            id: 'art',
            label: 'Art Gallery',
            description: 'Workspace for managing art pieces and auctions.',
            category: 'Art',
            icon: '🎨',
            bgGradient: 'from-violet-500 to-purple-700',
            color: 'violet',
            allowedEmails: [targetEmail],
            pinHash: pinHash
        },
        {
            id: 'crochet',
            label: 'Crochet Shop',
            description: 'Workspace for managing crochet products and orders.',
            category: 'Crochet',
            icon: '🧶',
            bgGradient: 'from-emerald-500 to-teal-700',
            color: 'emerald',
            allowedEmails: [targetEmail],
            pinHash: pinHash
        }
    ];

    try {
        for (const ws of workspaces) {
            console.log(`Setting up workspace: ${ws.label} (${ws.id})...`);
            
            // Check if exists
            const snapshot = await db.collection('workspaces').where('id', '==', ws.id).limit(1).get();
            
            if (snapshot.empty) {
                // Create
                await db.collection('workspaces').add({
                    ...ws,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Created workspace: ${ws.id}`);
            } else {
                // Update
                const docRef = snapshot.docs[0].ref;
                const existingData = snapshot.docs[0].data();
                
                // Merge allowedEmails to ensure we don't remove existing ones if any, but specifically adding akuzie
                const updatedEmails = Array.from(new Set([...(existingData.allowedEmails || []), targetEmail]));
                
                await docRef.update({
                    label: ws.label,
                    description: ws.description,
                    category: ws.category,
                    icon: ws.icon,
                    bgGradient: ws.bgGradient,
                    color: ws.color,
                    allowedEmails: updatedEmails,
                    pinHash: existingData.pinHash || ws.pinHash, // Preserve existing PIN if set
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Updated workspace: ${ws.id}`);
            }
        }

        // Also ensure akuzie27@gmail.com exists in users collection
        const userSnap = await db.collection('users').where('email', '==', targetEmail).limit(1).get();
        if (userSnap.empty) {
            console.log(`Note: User ${targetEmail} not found in 'users' collection yet. They should log in first to be fully registered as a user, but workspace access is now mapped.`);
        }

    } catch (error) {
        console.error('Error setting up workspaces:', error);
    } finally {
        process.exit(0);
    }
}

setupWorkspaces();
