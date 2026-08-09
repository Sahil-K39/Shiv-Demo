import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://www.shivshaktiproject.com"),
  title: "Shiv Shakti Project",
  description:
    "Avant-garde clothing for the post-apocalyptic era. Deconstructed silhouettes, ritual textures, and ceremonial armor designed for the Council of Light.",
  keywords: ["fashion", "avant-garde", "luxury", "neo-primitive", "post-apocalyptic"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico?v=trident-emblem-ss26-large" },
      { url: "/icon.png?v=trident-emblem-ss26-large", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png?v=trident-emblem-ss26-large", type: "image/png", sizes: "180x180" },
      { url: "/apple-touch-icon.png?v=trident-emblem-ss26-large", type: "image/png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.png?v=trident-emblem-ss26-large",
      },
    ],
  },
  openGraph: {
    title: "Shiv Shakti Project \u2014 SS26 Wholesale Buying Room",
    description:
      "Premium wholesale fashion. Deconstructed silhouettes, ritual textures, and limited seasonal releases.",
    url: "https://www.shivshaktiproject.com",
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen bg-black text-white items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-widest text-red-500 uppercase">Hosting Expired</h1>
          <p className="text-sm text-gray-400">The hosting for this website has expired.</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest border-t border-white/10 pt-4">Files have been removed from the hosting.</p>
        </div>
      </body>
    </html>
  );
}
