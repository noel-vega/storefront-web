import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AccountNavLink } from "@/components/account-nav-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storefront",
  description: "A reference storefront built on @ordersail/storefront-sdk",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-black/10 dark:border-white/15">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-medium">
              Storefront
            </Link>
            <div className="flex items-center gap-6">
              <AccountNavLink />
              <Link
                href="/cart"
                className="text-sm text-black/60 hover:underline dark:text-white/60"
              >
                Cart
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
