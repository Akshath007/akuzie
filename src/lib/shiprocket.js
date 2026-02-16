
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let token = null;

export async function authenticateShiprocket() {
    if (token) return token;

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
        console.warn("Shiprocket credentials missing. Skipping authentication.");
        return null;
    }

    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD })
        });

        const data = await response.json();
        if (data.token) {
            token = data.token;
            return token;
        } else {
            console.error("Shiprocket Auth Failed:", data);
            throw new Error("Shiprocket Authentication Failed");
        }
    } catch (error) {
        console.error("Shiprocket Auth Error:", error);
        return null;
    }
}

export async function createShiprocketOrder(orderData) {
    const authToken = await authenticateShiprocket();
    if (!authToken) {
        console.warn("Skipping Shiprocket order creation due to missing auth.");
        return null;
    }

    // Map your orderData to Shiprocket's format
    // This is a basic mapping, you might need to adjust based on your specific order structure
    const payload = {
        order_id: orderData.id,
        order_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
        pickup_location: "Primary", // You must define this in Shiprocket dashboard
        billing_customer_name: orderData.customerName.split(' ')[0],
        billing_last_name: orderData.customerName.split(' ')[1] || "",
        billing_address: orderData.address,
        billing_city: orderData.city,
        billing_pincode: orderData.postalCode || orderData.pincode,
        billing_state: orderData.state || "State", // You might need to capture state
        billing_country: "India",
        billing_email: orderData.customerEmail,
        billing_phone: orderData.phone,
        shipping_is_billing: true,
        order_items: orderData.items.map(item => ({
            name: item.title || item.name,
            sku: item.id,
            units: 1,
            selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: orderData.totalAmount,
        length: 10, // Placeholder
        breadth: 10,
        height: 10,
        weight: 1 // Placeholder
    };

    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/ad_hoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Shiprocket Create Order Response:", result);
        return result;
    } catch (error) {
        console.error("Shiprocket Create Order Error:", error);
        return null;
    }
}
