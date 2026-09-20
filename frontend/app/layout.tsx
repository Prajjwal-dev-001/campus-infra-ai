import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LPU RMS AI Maintenance Portal",
  description: "Lovely Professional University - AI-Powered Relationship Management & Maintenance System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-lpu-blue-light text-lpu-black">
        {children}
      </body>
    </html>
  );
}
