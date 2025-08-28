import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BikeHub - Reliable Second-Hand Bikes with Verified Papers",
  description: "Find your perfect ride with complete documentation, paper verification, and name change services. Quality bikes, transparent process, guaranteed satisfaction.",
  keywords: "second hand bikes, used motorcycles, bike verification, paper change service, reliable bikes",
  authors: [{ name: "BikeHub Team" }],
  openGraph: {
    title: "BikeHub - Reliable Second-Hand Bikes",
    description: "Quality second-hand bikes with verified papers and complete documentation.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
