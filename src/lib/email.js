// This utility handles sending emails via our internal API to keep the key secure.

export async function sendEmail({ to, subject, html }) {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false, error };
    }
}

// Templates
export const templates = {
    welcome: (name) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #111; font-family: serif;">Welcome to Akuzie, ${name || 'Collector'}!</h1>
            <p>Thank you for joining our community of art lovers. We're excited to have you with us.</p>
            <p>You can now save artworks to your wishlist and participate in live auctions.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">Where Everything Hits Different.</p>
        </div>
    `,
    orderConfirmed: (order) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111;">Order Confirmed!</h1>
            <p>Hi ${order.customerName || 'Customer'},</p>
            <p>Your order <strong>#${order.id?.slice(-6).toUpperCase() || 'ERROR'}</strong> has been received and is being processed.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p>Items: ${order.items?.map(i => i.title).join(', ') || 'Your Art Pieces'}</p>
                <p>Total: <strong>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount || 0)}</strong></p>
            </div>
            <p>We'll notify you once your artwork is on its way.</p>
        </div>
    `
};
