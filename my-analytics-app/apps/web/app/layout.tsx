import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "Analytics dashboard with chat with data feature",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav className='border-b'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <h1 className='text-2xl font-bold'>Analytics Dashboard</h1>
              <div className='flex gap-4'>
                <Link
                  href='/dashboard'
                  className='text-sm font-medium hover:underline'>
                  Dashboard
                </Link>
                <Link
                  href='/chat'
                  className='text-sm font-medium hover:underline'>
                  Chat with Data
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
