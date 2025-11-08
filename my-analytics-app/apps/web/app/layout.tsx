import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, MessageSquare } from "lucide-react";
import { LayoutHeader } from "@/components/layout-client";

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
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground`}>
        <div className='flex min-h-screen'>
          {/* Sidebar Navigation */}
          <aside className='w-64 border-r border-border bg-gradient-to-b from-card to-background fixed h-screen overflow-y-auto'>
            <div className='p-6'>
              <Link href='/' className='flex items-center gap-3 group'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-magenta-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
                  <span className='text-white font-bold text-xl'>⚡</span>
                </div>
                <div className='flex-1'>
                  <h1 className='text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
                    Analytics
                  </h1>
                  <p className='text-xs text-muted-foreground'>v2.0</p>
                </div>
              </Link>
            </div>

            <nav className='px-4 space-y-2'>
              <Link
                href='/dashboard'
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-all group relative'>
                <LayoutDashboard className='w-5 h-5 group-hover:text-cyan-400 transition-colors' />
                <span>Dashboard</span>
                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-r opacity-0 group-hover:opacity-100 transition-opacity' />
              </Link>

              <Link
                href='/chat'
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-magenta-500/20 transition-all group relative'>
                <MessageSquare className='w-5 h-5 group-hover:text-purple-400 transition-colors' />
                <span>Chat with Data</span>
                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-400 to-magenta-400 rounded-r opacity-0 group-hover:opacity-100 transition-opacity' />
              </Link>
            </nav>

            <div className='absolute bottom-6 left-6 right-6 p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-magenta-500/10 border border-border'>
              <p className='text-xs text-muted-foreground'>
                💡 Tip: Use natural language to explore your data faster!
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className='flex-1 ml-64 flex flex-col'>
            <LayoutHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
