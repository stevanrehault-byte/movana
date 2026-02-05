import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Movana — Cycling Experiences in Thailand",
  description:
    "Discover authentic cycling routes across Thailand. Curated experiences by local operators, GPS-guided adventures, hassle-free exploration.",
  keywords:
    "cycling, Thailand, bike tours, GPS routes, Pattaya, Jomtien, cycling experiences",
  openGraph: {
    title: "Movana — Cycling Experiences in Thailand",
    description:
      "Discover authentic cycling routes across Thailand. Curated experiences by local operators.",
    url: "https://movana.bike",
    siteName: "Movana",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
