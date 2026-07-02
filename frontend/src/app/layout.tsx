import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL("https://shiv-demo.vercel.app"),
  title: "Shiv Shakti Project",
  description:
    "Avant-garde clothing for the post-apocalyptic era. Deconstructed silhouettes, ritual textures, and ceremonial armor designed for the Council of Light.",
  keywords: ["fashion", "avant-garde", "luxury", "neo-primitive", "post-apocalyptic"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico?v=ref-design-7" },
      { url: "/icon.png?v=ref-design-7", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png?v=ref-design-7", type: "image/png", sizes: "180x180" },
      { url: "/apple-touch-icon.png?v=ref-design-7", type: "image/png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.png?v=ref-design-7",
      },
    ],
  },
  openGraph: {
    title: "Shiv Shakti Project \u2014 SS26 Wholesale Buying Room",
    description:
      "Premium wholesale fashion. Deconstructed silhouettes, ritual textures, and limited seasonal releases.",
    url: "https://shiv-demo.vercel.app",
    siteName: "Shiv Shakti Project",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shiv Shakti SS26 Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shiv Shakti Project \u2014 SS26 Wholesale Buying Room",
    description:
      "Premium wholesale fashion. Deconstructed silhouettes, ritual textures, and limited seasonal releases.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen">
        <div className="noise-overlay" />
        <Navbar />
        <CartDrawer />
        <main id="main-content" className="flex-1 pt-[80px]">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
