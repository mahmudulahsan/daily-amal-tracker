import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "দৈনিক রমজান ট্র্যাকার",
  description:
    "বরকতময় রমজান মাসজুড়ে আপনার দৈনিক ইবাদাত অনুসরণ করুন — সালাত, কুরআন, দু'আ এবং আরও অনেক কিছু।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "রমজান ট্র্যাকার",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1120",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${hindSiliguri.variable} font-sans antialiased`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
