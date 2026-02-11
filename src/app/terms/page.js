
export const metadata = {
    title: 'Terms of Service | Akuzie',
    description: 'Terms of Service for Akuzie.',
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-sm text-gray-400 mb-12 uppercase tracking-wider">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <h3>1. Introduction</h3>
                <p>
                    Welcome to Akuzie. These Terms of Service govern your use of our website and the purchase of our products. By accessing or using our Service, you agree to be bound by these Terms.
                </p>

                <h3>2. Products and Services</h3>
                <p>
                    All our paintings are handmade and unique. While we make every effort to display the colors and textures accurately, we cannot guarantee that your computer monitor's display of any color will be accurate. We reserve the right to limit the sales of our products or Services to any person, geographic region, or jurisdiction.
                </p>

                <h3>3. Accuracy of Billing and Account Information</h3>
                <p>
                    We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
                </p>

                <h3>4. Intellectual Property</h3>
                <p>
                    The Service and its original content, features, and functionality are and will remain the exclusive property of Akuzie and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
                </p>

                <h3>5. Governing Law</h3>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>

                <h3>6. Changes to Terms</h3>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
            </div>
        </div>
    );
}
