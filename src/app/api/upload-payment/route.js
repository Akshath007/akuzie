import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// Google Drive Shared Folder ID
const FOLDER_ID = '1SZSTLb9U_OM-VhpeZly-nzfne3WUNNwK';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.includes('\\n')
            ? process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : process.env.GOOGLE_DRIVE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const orderId = formData.get('orderId');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const fileMetadata = {
            name: `Payment_${orderId}_${Date.now()}.jpg`,
            parents: [FOLDER_ID],
        };

        const media = {
            mimeType: file.type,
            body: Readable.from(buffer),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;

        // Make file readable by anyone with the link
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Construct a direct viewing URL
        const viewUrl = `https://lh3.googleusercontent.com/u/0/d/${fileId}`;

        return NextResponse.json({
            success: true,
            fileId: fileId,
            url: response.data.webViewLink,
            directUrl: viewUrl
        });

    } catch (error) {
        console.error('SERVER_ERROR_DRIVE_UPLOAD:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error.response?.data?.error?.message || error.message || 'Unknown error'
        }, { status: 500 });
    }
}
