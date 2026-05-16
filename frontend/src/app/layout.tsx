import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import PageTransition from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "SHIV SHAKTI PROJECT — Neo-Primitive Fashion",
  description:
    "Avant-garde clothing for the post-apocalyptic era. Deconstructed silhouettes, ritual textures, and ceremonial armor designed for the Council of Light.",
  keywords: ["fashion", "avant-garde", "luxury", "neo-primitive", "post-apocalyptic"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen">
        {}
        <div className="noise-overlay" />

        {}
        <Navbar />

        {}
        <CartDrawer />

        {}
        <PageTransition>{children}</PageTransition>

        {}
        <Footer />
      </body>
    </html>
  );
}
