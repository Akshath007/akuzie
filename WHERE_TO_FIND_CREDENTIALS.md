# 🔍 Where to Find Your Lemon Squeezy Credentials

You have the API key ✅. Here's where to find the rest:

## 1️⃣ Store ID

### Steps:
1. Log into your Lemon Squeezy dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **Stores**
4. You'll see your store listed with a number next to it
5. That number is your **Store ID**

**Example**: If you see "My Store #12345", your Store ID is `12345`

**Alternative Method**:
- Look at the URL when you're in your dashboard
- It will be something like: `app.lemonsqueezy.com/stores/12345/...`
- The number after `/stores/` is your Store ID

---

## 2️⃣ Variant ID (Product Variant)

You need to create a product first if you haven't already.

### Steps to Create Product:

1. In your Lemon Squeezy dashboard, click **Products** in the left sidebar
2. Click **New Product** (or **+ Create Product**)
3. Fill in the details:
   - **Name**: "Akuzie Original Painting" (or any name)
   - **Description**: "Handmade acrylic painting on canvas"
   - **Price**: ₹5000 (this will be overridden dynamically, so any amount is fine)
4. Click **Create Product** or **Save**

### Steps to Get Variant ID:

After creating the product:

1. Click on your product from the Products list
2. Scroll down to the **Variants** section
3. You'll see at least one variant (usually "Default")
4. Click on the variant
5. Look at the URL in your browser

**The URL will look like**:
```
app.lemonsqueezy.com/products/123456/variants/789012
```

The number after `/variants/` is your **Variant ID** (in this example: `789012`)

**Alternative**: Some dashboards show the Variant ID directly in the variant details panel.

---

## 3️⃣ Webhook Secret

This is created when you set up a webhook endpoint.

### Steps:

1. In Lemon Squeezy dashboard, go to **Settings** → **Webhooks**
2. Click **Create Webhook** (or **+ New Webhook**)
3. Fill in the form:
   - **URL**: For now, use a placeholder like `https://example.com/api/webhook`
     - (You'll update this later when you deploy or use ngrok for local testing)
   - **Signing Secret**: Type any random string (e.g., `my-secret-key-12345`)
     - This is YOUR secret - you create it!
     - Make it long and random for security
     - Example: `whsec_akuzie_2024_super_secret_key_xyz789`
   - **Events**: Select these:
     - ✅ `order_created`
     - ✅ `order_refunded`
4. Click **Create Webhook** or **Save**
5. Copy the **Signing Secret** you just created

**Important**: The webhook secret is something YOU create, not something Lemon Squeezy gives you. It's used to verify that webhook requests are genuinely from Lemon Squeezy.

---

## 📝 Summary Checklist

Once you have all the values, your `.env.local` should look like this:

```bash
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCx7_-N6KX9X4WrI3vnGj0NqCwJmgjIeAs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=akuzie-a0918.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=akuzie-a0918
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=298348371637
NEXT_PUBLIC_FIREBASE_APP_ID=1:298348371637:web:391118672a26fd4c14e8fc
NEXT_PUBLIC_ADMIN_EMAILS=akuzie27@gmail.com

# Lemon Squeezy (fill these in)
LEMONSQUEEZY_API_KEY=your_api_key_here ✅ (you have this!)
LEMONSQUEEZY_STORE_ID=12345 ⬅️ Find in Settings → Stores
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_your_secret_here ⬅️ Create when setting up webhook
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID=789012 ⬅️ Find in Products → Your Product → Variants
```

---

## 🎯 Quick Reference

| Credential | Where to Find | Example Value |
|------------|---------------|---------------|
| **API Key** | Settings → API | `lmsq_sk_abc123...` ✅ |
| **Store ID** | Settings → Stores OR URL | `12345` |
| **Variant ID** | Products → [Product] → Variants → URL | `789012` |
| **Webhook Secret** | Settings → Webhooks (YOU create this) | `whsec_my_secret_123` |

---

## ⚠️ Important Notes

1. **Test Mode**: Make sure you're in **Test Mode** (toggle in top-right of dashboard)
2. **Webhook URL**: For local testing, you can use a placeholder. We'll set up the real URL later.
3. **Webhook Secret**: This is a password YOU create, not something Lemon Squeezy generates.

---

## 🆘 Still Can't Find Something?

### Can't find Store ID?
- Check the URL when you're logged into Lemon Squeezy
- It's the number after `/stores/` in the URL

### Don't have a product yet?
- Go to Products → Create Product
- Fill in basic details (name and price)
- Save it, then get the Variant ID from the product page

### Confused about Webhook Secret?
- It's just a password you make up
- Use something like: `whsec_akuzie_dev_secret_2024`
- You'll enter this same value in both Lemon Squeezy AND your `.env.local`

---

## 🎬 Next Steps After Getting Credentials

1. Update `.env.local` with all 4 values
2. Restart your dev server: `npm run dev`
3. Test the checkout flow
4. Use test card: `4242 4242 4242 4242`

Need help? Let me know which credential you're stuck on! 🚀
