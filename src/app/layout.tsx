import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "দৈনিক রমজান ট্র্যাকার",
  description:
    "বরকতময় রমজান মাসজুড়ে আপনার দৈনিক ইবাদাত অনুসরণ করুন — সালাত, কুরআন, দু'আ এবং আরও অনেক কিছু।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <body className={`${hindSiliguri.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
