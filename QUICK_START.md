# 🚀 Quick Start - Lemon Squeezy Integration

## ⚡ 5-Minute Setup

### Step 1: Create Lemon Squeezy Account (2 min)
1. Go to https://lemonsqueezy.com
2. Sign up and create a store
3. Enable **Test Mode** (toggle in top-right)

### Step 2: Create Product (1 min)
1. Click **Products** → **New Product**
2. Name: "Akuzie Original Painting"
3. Price: ₹5000 (or any amount - will be overridden)
4. Click **Create Product**
5. Copy the **Variant ID** from the URL

### Step 3: Get API Credentials (1 min)
1. Go to **Settings** → **API**
2. Click **Create API Key**
3. Name it "Akuzie Dev"
4. Copy the API key
5. Go to **Settings** → **Stores**
6. Copy your **Store ID**

### Step 4: Update Environment Variables (1 min)
Edit `g:\akuzie\.env.local`:

```bash
LEMONSQUEEZY_API_KEY=paste_your_api_key_here
LEMONSQUEEZY_STORE_ID=paste_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=any_random_string_for_now
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID=paste_variant_id_here
```

### Step 5: Restart Server
```bash
# Press Ctrl+C to stop current server
npm run dev
```

## ✅ Test It!

1. Go to http://localhost:3000
2. Add a painting to cart
3. Go to checkout
4. Fill in shipping details
5. Click "Proceed to Payment"
6. You'll be redirected to Lemon Squeezy
7. Use test card: **4242 4242 4242 4242**
8. Complete payment
9. You'll see the success page!

## 🎯 That's It!

Your payment system is now working in **test mode**.

### For Production:
1. Switch Lemon Squeezy to **Live Mode**
2. Get new **Live API keys**
3. Update `.env.local` with live keys
4. Set up webhooks (see LEMON_SQUEEZY_SETUP.md)
5. Deploy to production

## 📖 Need More Details?

- **Full Setup Guide**: `LEMON_SQUEEZY_SETUP.md`
- **Integration Summary**: `INTEGRATION_COMPLETE.md`
- **Environment Variables**: `.env.example`

## 🆘 Troubleshooting

**"Failed to create checkout session"**
- Check API key is correct
- Verify variant ID exists
- Make sure you're in test mode

**"Variant not found"**
- Double-check the variant ID
- Ensure the product is active

**Changes not working**
- Restart the dev server
- Clear browser cache
- Check browser console for errors

---

**Happy selling! 🎨**
