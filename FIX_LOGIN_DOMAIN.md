# 🚨 Fix "Unauthorized Domain" Error

This error means **Firebase is blocking the login** because it doesn't trust the website domain (even `localhost` sometimes needs re-adding).

## ✅ solution: Add Domain to Firebase

1.  **Go to Firebase Console**:
    *   Visit: [https://console.firebase.google.com/](https://console.firebase.google.com/)
    *   Select your project: **akuzie-a0918**

2.  **Go to Authentication Settings**:
    *   Click **Build** -> **Authentication** in the left sidebar.
    *   Click the **Settings** tab (top menu).
    *   Click **Authorized Domains** (scroll down).

3.  **Add Your Domains**:
    *   Click **Add Domain**.
    *   Add: `localhost` (if missing).
    *   Add: `127.0.0.1` (just in case).
    *   **Crucial**: If you are testing on Vercel, add your Vercel domain (e.g., `akuzie.vercel.app`).
    *   **Crucial**: If you are testing on mobile via network ID, you MUST add that IP (e.g., `192.168.242.32` from your logs).

## 🔄 After Adding:
1.  Wait 1-2 minutes.
2.  Refresh your app page.
3.  Try logging in again.

---

### 💡 Why this happens?
Firebase restricts where logins can happen to prevent people from stealing your API key and using it on their own malicious sites. You must explicitly tell Firebase "This is my site, it's safe".
