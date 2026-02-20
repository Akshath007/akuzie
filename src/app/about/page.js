
export const metadata = {
    title: 'About Us | Akuzie',
    description: 'Learn about Akuzie — a creative brand by Manasa K offering original handmade paintings, crochet products, and unique art pieces from Bengaluru, India.',
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">About Us</h1>
            <div className="w-12 h-px bg-gray-300 mb-12"></div>

            <div className="prose prose-stone prose-lg max-w-none text-gray-600 font-light">
                <h3>Our Story</h3>
                <p>
                    <strong>Akuzie</strong> is a creative brand founded and operated by <strong>Manasa K</strong>, based in Bengaluru, Karnataka, India. Born out of a deep love for art and handmade craftsmanship, Akuzie brings together original paintings and unique crochet creations to offer something truly one-of-a-kind.
                </p>
                <p>
                    Every piece at Akuzie is handcrafted with care, passion, and attention to detail. From vibrant canvas paintings that capture emotions and stories, to beautifully crafted crochet items that blend functionality with art — each product is a labor of love.
                </p>

                <h3>What We Offer</h3>
                <ul>
                    <li><strong>Original Paintings:</strong> Hand-painted artwork on canvas, each piece unique and signed by the artist. From abstract expressions to detailed compositions, our paintings are designed to add soul to any space.</li>
                    <li><strong>Crochet Products:</strong> Handmade crochet items including accessories, home décor, and gifting items. Each piece is carefully crocheted with premium quality yarn.</li>
                    <li><strong>Custom Commissions:</strong> We accept custom orders for personalized artwork and crochet pieces tailored to your preferences.</li>
                    <li><strong>Art Auctions:</strong> Exclusive auction events for limited-edition and special artworks.</li>
                </ul>

                <h3>Our Mission</h3>
                <p>
                    At Akuzie, we believe that art should be accessible, personal, and meaningful. Our mission is to connect people with original, handmade creations that spark joy and inspire creativity. We aim to create a space where art lovers can discover unique pieces that resonate with their personal style.
                </p>

                <h3>Why Choose Akuzie?</h3>
                <ul>
                    <li><strong>100% Handmade:</strong> Every product is handcrafted from start to finish — no mass production.</li>
                    <li><strong>Original Artwork:</strong> Each painting is an original creation, never replicated.</li>
                    <li><strong>Quality Materials:</strong> We use premium paints, canvases, and yarns to ensure lasting quality.</li>
                    <li><strong>Secure Payments:</strong> Safe and secure checkout powered by trusted payment gateways.</li>
                    <li><strong>Pan-India Shipping:</strong> Free shipping across India with careful packaging.</li>
                </ul>

                <h3>Business Details</h3>
                <p>
                    <strong>Legal Name:</strong> Manasa K<br />
                    <strong>Brand Name:</strong> Akuzie<br />
                    <strong>Registered Address:</strong> No.20, Gokula, Elite Palms, Medarahalli Railway Crossing Rd, Medaralli, Jalahalli West, Bengaluru, Myadarahalli, Karnataka 560090, India<br />
                    <strong>Email:</strong> akuzie27@gmail.com<br />
                    <strong>Phone:</strong> +91 82172 62053
                </p>

                <h3>Get In Touch</h3>
                <p>
                    We love hearing from our customers! Whether you have a question about a product, want to discuss a custom commission, or just want to say hello — feel free to reach out to us through our <a href="/contact">Contact page</a> or drop us an email at <strong>akuzie27@gmail.com</strong>.
                </p>
                <p>
                    Follow us on Instagram at <a href="https://instagram.com/akuzie27" target="_blank" rel="noopener noreferrer"><strong>@akuzie27</strong></a> for the latest updates, behind-the-scenes content, and new releases.
                </p>
            </div>
        </div>
    );
}
