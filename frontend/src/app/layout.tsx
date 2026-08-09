import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hosting Expired",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
