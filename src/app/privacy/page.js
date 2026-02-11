
export const metadata = {
    title: 'Privacy Policy | Akuzie',
    description: 'Privacy Policy for Akuzie. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Privacy Policy</h1>
            <p className="text-sm text-gray-400 mb-12 uppercase tracking-wider">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <p>
                    At Akuzie, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
                </p>

                <h3>1. Information We Collect</h3>
                <p>
                    When you visit Akuzie, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
                </p>
                <p>
                    When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.
                </p>

                <h3>2. How We Use Your Information</h3>
                <p>
                    We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
                </p>
                <ul>
                    <li>Communicate with you;</li>
                    <li>Screen our orders for potential risk or fraud; and</li>
                    <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                </ul>

                <h3>3. Sharing Your Personal Information</h3>
                <p>
                    We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site.
                </p>

                <h3>4. Your Rights</h3>
                <p>
                    If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
                </p>

                <h3>5. Contact Us</h3>
                <p>
                    For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at akuzie27@gmail.com.
                </p>
            </div>
        </div>
    );
}
