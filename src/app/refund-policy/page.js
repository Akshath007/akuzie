
export const metadata = {
    title: 'Refund Policy | Akuzie',
    description: 'Refund and Cancellation Policy for Akuzie.',
};

export default function RefundPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Refund Policy</h1>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <h3>Returns</h3>
                <p>
                    Due to the delicate nature of original artwork, <strong>all sales are final</strong>. We do not accept returns or exchanges for change of mind. Please review all images and descriptions carefully before purchasing.
                </p>

                <h3>Damaged Artwork</h3>
                <p>
                    In the unlikely event that your painting arrives damaged, please contact us immediately at <strong>akuzie27@gmail.com</strong> with photos of the damage and the packaging. We will work with you to resolve the issue, either through a repair, a replacement (if applicable), or a refund.
                </p>

                <h3>Cancellations</h3>
                <p>
                    Orders can be cancelled within 24 hours of purchase, provided the item has not yet been shipped. Once an item has been shipped, the order cannot be cancelled.
                </p>
            </div>
        </div>
    );
}
