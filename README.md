# Akuzie - Minimal Art Gallery

A minimal website for selling original handmade acrylic paintings.

## Deployment Instructions (Vercel + GitHub)

### 1. GitHub Setup
1.  Initialize git in this folder (if not already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on your GitHub account (e.g., `akuzie-art`).
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/akuzie-art.git
    git branch -M main
    git push -u origin main
    ```

### 2. Vercel Setup
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** > **Project**.
3.  Import the `akuzie-art` repository.
4.  **Environment Variables**:
    *   Copy-paste the content of `.env.local` into the Environment Variables section in Vercel.
    *   *Make sure `NEXT_PUBLIC_ADMIN_EMAILS` is set properly.*
5.  Click **Deploy**.

### 3. Domain Setup
1.  Once deployed, go to your Project Settings > **Domains**.
2.  Add `akuzie.in`.
3.  Follow the instructions to update your DNS records (A record or CNAME) with your domain provider.

### 4. Admin Workflow (Very Important)
**Image Uploads**:
This system does **not** allow file uploads directly. You must use Google Drive.
1.  Upload your painting image to a **Public** folder in Google Drive.
2.  Right-click image > "Share" > "Anyone with the link".
3.  Copy the link.
4.  Paste this link into the "Image URL" field in the Admin Panel.
    *   The system will automatically convert it to a visible image link.
