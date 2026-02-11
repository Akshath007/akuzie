import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://akuzie.in'),
  title: {
    default: "Akuzie | Handmade Acrylic Paintings",
    template: "%s | Akuzie"
  },
  description: "Exclusive handmade acrylic paintings on canvas. Discover unique abstract and contemporary art for your home or office.",
  keywords: ["art", "paintings", "acrylic", "handmade", "canvas", "abstract art", "contemporary art", "home decor", "akuzie"],
  authors: [{ name: "Akshath" }],
  creator: "Akshath",
  publisher: "Akuzie",
  openGraph: {
    title: "Akuzie | Handmade Acrylic Paintings",
    description: "Exclusive handmade acrylic paintings on canvas. Discover unique abstract and contemporary art.",
    url: 'https://akuzie.in',
    siteName: 'Akuzie',
    images: [
      {
        url: '/opengraph-image', // Dynamic image we will create
        width: 1200,
        height: 630,
        alt: 'Akuzie - Handmade Acrylic Paintings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Akuzie | Handmade Acrylic Paintings",
    description: "Exclusive handmade acrylic paintings on canvas.",
    images: ['/opengraph-image'], // Dynamic image
    creator: '@akuzie_art', // Replace with actual handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  verification: {
    google: 'google-site-verification=google9cfe29dd6eccd1c1',
    yandex: 'yandex-verification=YOUR_VERIFICATION_CODE', // Placeholder
    other: {
      'msvalidate.01': '3EEFA2BC8606071A2BC80F135DD9F5E8',
    },
  },
};

import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="bg-[#fafafa] min-h-screen flex flex-col font-sans selection:bg-stone-900 selection:text-white antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
        <GoogleAnalytics gaId="G-157L7EBZZG" /> {/* Replace with your GA4 Measurement ID */}
      </body>
    </html>
  );
}
