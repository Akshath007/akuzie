
export const metadata = {
    title: 'Cancellation Policy | Akuzie',
    description: 'Cancellation Policy for Akuzie. Learn about our order cancellation terms, timelines, and refund process.',
};

export default function CancellationPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Cancellation Policy</h1>
            <p className="text-sm text-gray-400 mb-12 uppercase tracking-wider">Last Updated: February 20, 2026</p>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <p>
                    This Cancellation Policy is applicable to all orders placed on <strong>akuzie.in</strong>, operated by <strong>Manasa K</strong>.
                </p>

                <h3>Order Cancellation</h3>
                <p>
                    We understand that sometimes you may need to cancel an order. Please review the following cancellation terms:
                </p>

                <h3>Cancellation Before Shipment</h3>
                <ul>
                    <li>Orders can be cancelled within <strong>24 hours</strong> of placing the order.</li>
                    <li>To request a cancellation, please email us at <strong>akuzie27@gmail.com</strong> with your order number and the reason for cancellation.</li>
                    <li>If the order has not yet been dispatched, we will confirm the cancellation and initiate a full refund.</li>
                    <li><strong>Refund Timeline:</strong> The full amount will be refunded to the original payment method within <strong>5–7 business days</strong> of cancellation confirmation.</li>
                </ul>

                <h3>Cancellation After Shipment</h3>
                <ul>
                    <li>Once an order has been shipped, it <strong>cannot be cancelled</strong>.</li>
                    <li>You will need to wait for the delivery and then follow our <a href="/refund-policy">Return &amp; Refund Policy</a> if applicable.</li>
                </ul>

                <h3>Custom/Commission Orders</h3>
                <ul>
                    <li>Custom commission orders (personalized paintings or crochet items) <strong>cannot be cancelled</strong> once production has begun.</li>
                    <li>If the work has not yet started, a cancellation request may be considered on a case-by-case basis.</li>
                </ul>

                <h3>Auction Orders</h3>
                <ul>
                    <li>Winning bids in an auction are binding. Auction orders <strong>cannot be cancelled</strong> after the auction has concluded and payment has been confirmed.</li>
                </ul>

                <h3>Refund for Cancelled Orders</h3>
                <p>
                    For all approved cancellations:
                </p>
                <ul>
                    <li><strong>Refund Mode:</strong> Refund will be credited back to the <strong>original payment method</strong> (bank account / UPI / credit card / debit card).</li>
                    <li><strong>Refund Duration:</strong> <strong>5–7 business days</strong> from the date of cancellation approval.</li>
                    <li>If payment was made through PayU, the refund will be processed through PayU to the original payment source.</li>
                </ul>

                <h3>Contact Us</h3>
                <p>
                    For cancellation requests or queries, please contact us:
                </p>
                <p>
                    <strong>Email:</strong> akuzie27@gmail.com<br />
                    <strong>Phone:</strong> +91 82172 62053<br />
                    <strong>Manasa K</strong><br />
                    No.20, Gokula, Elite Palms, Medarahalli Railway Crossing Rd, Medaralli, Jalahalli West, Bengaluru, Myadarahalli, Karnataka 560090, India
                </p>
            </div>
        </div>
    );
}
