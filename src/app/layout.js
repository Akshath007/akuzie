import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export const metadata = {
  title: "Akuzie | Handmade Acrylic Paintings",
  description: "Exclusive handmade acrylic paintings on canvas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-white min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
