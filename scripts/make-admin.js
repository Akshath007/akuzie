const admin = require('firebase-admin');
const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env.local
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

async function makeAdmin(email) {
    if (!email) {
        console.error('Usage: node make-admin.js <email>');
        process.exit(1);
    }

    try {
        console.log(`Looking up user with email: ${email}...`);
        const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            console.error(`Error: User with email ${email} does not exist in the 'users' collection.`);
            console.error("Please have the user log in at least once so their document is created.");
            process.exit(1);
        }

        const userDoc = snapshot.docs[0];
        
        await userDoc.ref.update({
            role: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Success! Updated ${email} to be an admin.`);
    } catch (error) {
        console.error('Error updating user role:', error);
    } finally {
        process.exit(0);
    }
}

// Get email from command line args
const targetEmail = process.argv[2] || 'akshathhp123@gmail.com';
makeAdmin(targetEmail);
