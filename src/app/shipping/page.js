
export const metadata = {
    title: 'Shipping Policy | Akuzie',
    description: 'Shipping Information for Akuzie.',
};

export default function ShippingPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Shipping Policy</h1>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <h3>Processing Time</h3>
                <p>
                    All orders are processed within 2-4 business days. You will receive a confirmation email once your order has shipped containing your tracking number(s).
                </p>

                <h3>Domestic Shipping (India)</h3>
                <p>
                    We offer free standard shipping across India. Delivery typically takes 5-7 business days depending on your location.
                </p>

                <h3>International Shipping</h3>
                <p>
                    We currently ship to select international countries. Shipping charges for your order will be calculated and displayed at checkout. Please note that international orders may be subject to import duties and taxes, which are incurred once a shipment reaches your destination country. Akuzie is not responsible for these charges if they are applied.
                </p>

                <h3>Packaging</h3>
                <p>
                    All paintings are carefully packaged to ensure they arrive in perfect condition. Large canvases may be removed from their stretcher bars and rolled in a tube for safety and cost-effectiveness (this will be noted in the product description if applicable).
                </p>
            </div>
        </div>
    );
}
