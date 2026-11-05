import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "BookNook | A quieter corner for readers",
    template: "%s | BookNook",
  },
  description: "Explore a community library, share your books, and discover your next favorite read.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="booknook">
      <body className="min-h-screen bg-[#faf6f0] font-sans text-[#00022E] antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-12">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
