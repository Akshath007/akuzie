import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// Google Drive Folder Name
const FOLDER_NAME = 'Akuzie Payments';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

async function getOrCreateFolder(folderName) {
    const response = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
    });

    if (response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
    });

    return folder.data.id;
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const orderId = formData.get('orderId');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const folderId = await getOrCreateFolder(FOLDER_NAME);

        const fileMetadata = {
            name: `Payment_${orderId}_${Date.now()}.jpg`,
            parents: [folderId],
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

        // Construct a direct viewing URL or use webViewLink
        // webContentLink is a direct download link, webViewLink is the Drive UI
        const viewUrl = `https://lh3.googleusercontent.com/u/0/d/${fileId}`;

        return NextResponse.json({
            success: true,
            fileId: fileId,
            url: response.data.webViewLink,
            directUrl: viewUrl
        });

    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
    }
}
