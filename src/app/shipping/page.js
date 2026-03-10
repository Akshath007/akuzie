
export const metadata = {
    title: 'Shipping Policy | Akuzie',
    description: 'Shipping Information for Akuzie. Learn about our shipping timelines, charges, and packaging for paintings and crochet products.',
};

export default function ShippingPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Shipping Policy</h1>
            <p className="text-sm text-gray-400 mb-12 uppercase tracking-wider">Last Updated: February 20, 2026</p>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <p>
                    This Shipping Policy is applicable to all orders placed on <strong>akuzie.in</strong>, operated by <strong>Akuzie</strong>.
                </p>

                <h3>Processing Time</h3>
                <p>
                    All orders are processed within <strong>2–4 business days</strong> after payment confirmation. Orders are not processed on weekends or public holidays. You will receive an email notification once your order has been dispatched along with tracking details.
                </p>

                <h3>Domestic Shipping (India)</h3>
                <ul>
                    <li><strong>Standard Shipping:</strong> Free shipping across India. Delivery within <strong>5–7 business days</strong> from dispatch.</li>
                    <li><strong>Express Shipping:</strong> Available on select items. Delivery within <strong>2–3 business days</strong> from dispatch (additional charges may apply).</li>
                </ul>

                <h3>International Shipping</h3>
                <p>
                    We currently ship to select international countries. For international orders:
                </p>
                <ul>
                    <li><strong>Delivery Timeline:</strong> <strong>10–15 business days</strong> from dispatch, depending on destination.</li>
                    <li>Shipping charges for international orders will be calculated and displayed at checkout.</li>
                    <li>International orders may be subject to import duties and taxes, which are the responsibility of the buyer. Akuzie is not responsible for any customs charges.</li>
                </ul>

                <h3>Order Tracking</h3>
                <p>
                    Once your order is shipped, you will receive an email with the tracking number and courier partner details. You can track your order status using the tracking link provided.
                </p>

                <h3>Packaging</h3>
                <p>
                    All products are carefully packaged to ensure they arrive in perfect condition:
                </p>
                <ul>
                    <li><strong>Paintings:</strong> Wrapped in protective bubble wrap with cardboard support, placed in a sturdy box. Large canvases may be removed from their stretcher bars and rolled in a tube for safety (noted in the product description if applicable).</li>
                    <li><strong>Crochet Products:</strong> Packed in eco-friendly pouches with protective padding.</li>
                </ul>

                <h3>Delivery Issues</h3>
                <p>
                    If your order is delayed, lost, or damaged during transit, please contact us immediately at <strong>akuzie27@gmail.com</strong>. We will coordinate with our shipping partner to resolve the issue as quickly as possible.
                </p>

                <h3>Shipping Address</h3>
                <p>
                    Please ensure that the shipping address provided at checkout is complete and accurate. We are not responsible for orders delivered to incorrect addresses due to customer error.
                </p>

                <h3>Contact Us</h3>
                <p>
                    For any shipping-related queries, please reach out to us:
                </p>
                <p>
                    <strong>Email:</strong> akuzie27@gmail.com<br />
                    <strong>Akuzie</strong><br />
                    Bengaluru, Karnataka, India
                </p>
            </div>
        </div>
    );
}
