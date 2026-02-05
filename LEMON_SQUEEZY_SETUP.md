# Lemon Squeezy Payment Integration Guide

This guide will help you set up Lemon Squeezy payment gateway for the Akuzie painting store.

## 🚀 Setup Steps

### 1. Create a Lemon Squeezy Account
1. Go to [lemonsqueezy.com](https://lemonsqueezy.com) and sign up
2. Create a new store in your dashboard
3. Note down your **Store ID** (found in Settings → Stores)

### 2. Get Your API Key
1. Navigate to **Settings → API** in your Lemon Squeezy dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Akuzie Production")
4. Copy the API key (you won't be able to see it again!)

### 3. Create a Product and Variant
Since each painting is unique, you have two options:

#### Option A: Single Generic Product (Recommended for Dynamic Pricing)
1. Go to **Products** → **New Product**
2. Create a product called "Akuzie Original Painting"
3. Set a base price (this will be overridden dynamically)
4. Create a variant (e.g., "Original Artwork")
5. Copy the **Variant ID** from the URL or product details

#### Option B: Individual Products per Painting
- Create separate products for each painting in your catalog
- More management overhead but better tracking

### 4. Configure Environment Variables

Update your `.env.local` file with the actual values:

```bash
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=your_actual_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Add this for the checkout page
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID=your_variant_id_here
```

### 5. Set Up Webhooks

Webhooks keep your database in sync with payment events.

1. Go to **Settings → Webhooks** in Lemon Squeezy
2. Click **Create Webhook**
3. Set the URL to: `https://yourdomain.com/api/webhook`
   - For local testing, use [ngrok](https://ngrok.com) or [LocalCan](https://www.localcan.com/)
4. Select these events:
   - ✅ `order_created`
   - ✅ `order_refunded`
   - ✅ `subscription_created` (if you plan to add subscriptions)
   - ✅ `subscription_updated`
   - ✅ `subscription_cancelled`
5. Set a **Signing Secret** (a random string for security)
6. Copy the signing secret to your `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`

### 6. Test Mode vs Production

- **Test Mode**: Use test API keys and test credit cards
  - Test card: `4242 4242 4242 4242`
  - Any future expiry date and CVC
- **Production Mode**: Switch to live API keys when ready to accept real payments

## 📁 Files Created

### `/src/lib/lemonsqueezy.js`
Lemon Squeezy SDK configuration and initialization.

### `/src/app/api/checkout/route.js`
API endpoint to create checkout sessions. Called when user clicks "Proceed to Payment".

### `/src/app/api/webhook/route.js`
Webhook handler to process payment events from Lemon Squeezy.

### Updated: `/src/app/checkout/page.js`
Checkout page now redirects to Lemon Squeezy instead of showing UPI QR code.

## 🔄 Payment Flow

1. **User adds paintings to cart** → Stored in React Context
2. **User fills shipping details** → Step 1 of checkout
3. **User clicks "Proceed to Payment"** → Step 2
4. **Order created in Firebase** → Status: `payment_pending`
5. **Checkout session created** → API call to `/api/checkout`
6. **User redirected to Lemon Squeezy** → Secure payment page
7. **User completes payment** → Lemon Squeezy processes payment
8. **Webhook received** → `/api/webhook` updates order status to `paid`
9. **User redirected back** → Success page (you can configure this in Lemon Squeezy)

## 🛠️ Customization Options

### Custom Success/Failure URLs
In the checkout API route, you can add:

```javascript
checkoutOptions: {
  embed: false,
  media: false,
  logo: true,
  desc: true,
  discount: true,
  dark: false,
  subscriptionPreview: true,
  buttonColor: '#7c3aed', // Your brand color
},
redirect: {
  success: 'https://yourdomain.com/order-confirmation',
  cancel: 'https://yourdomain.com/checkout',
}
```

### Dynamic Pricing
To set the price dynamically based on the painting:

```javascript
checkoutData: {
  custom_price: total * 100, // Price in cents
}
```

### Passing Order Data
The `customData` object in the checkout API allows you to pass order information that will be returned in webhooks:

```javascript
customData: {
  orderId: 'firebase-order-id',
  customerEmail: 'customer@example.com',
  paintingIds: ['id1', 'id2'],
}
```

## 🔐 Security Notes

1. **Never expose API keys in client-side code** - They're only used in API routes
2. **Always verify webhook signatures** - Prevents fake payment notifications
3. **Use HTTPS in production** - Required for webhooks
4. **Store sensitive data in environment variables** - Never commit `.env.local`

## 🧪 Testing Locally

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update webhook URL in Lemon Squeezy to: `https://abc123.ngrok.io/api/webhook`
6. Test payments using test mode

## 📊 Monitoring

- View all transactions in **Lemon Squeezy Dashboard → Orders**
- Check webhook delivery status in **Settings → Webhooks**
- Monitor your server logs for webhook processing

## 🆘 Troubleshooting

### "Webhook signature invalid"
- Verify `LEMONSQUEEZY_WEBHOOK_SECRET` matches the one in Lemon Squeezy dashboard
- Check that the webhook URL is correct

### "Failed to create checkout session"
- Verify `LEMONSQUEEZY_API_KEY` is correct
- Check that the variant ID exists
- Ensure you're using the correct store ID

### Payments not updating in Firebase
- Check webhook is being received (Lemon Squeezy dashboard shows delivery status)
- Verify webhook signature validation is passing
- Check server logs for errors in `/api/webhook`

## 📚 Additional Resources

- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com/)
- [Lemon Squeezy.js SDK](https://github.com/lmsqueezy/lemonsqueezy.js)
- [Webhook Events Reference](https://docs.lemonsqueezy.com/api/webhooks)

## 🎨 Next Steps

1. Add email notifications after successful payment
2. Implement refund handling in the webhook
3. Add subscription products for art memberships
4. Create an admin dashboard to view Lemon Squeezy analytics
