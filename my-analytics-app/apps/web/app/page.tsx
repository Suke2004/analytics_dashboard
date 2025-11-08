import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Zap, TrendingUp, Database } from "lucide-react";

export default function Home() {
  return (
    <div className='flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]'>
      <main className='max-w-4xl mx-auto px-8 py-16 text-center'>
        <div className='mb-8 inline-block'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500 rounded-2xl blur-2xl opacity-40' />
            <h1 className='relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 bg-clip-text text-transparent'>
              Analytics Dashboard
            </h1>
          </div>
        </div>

        <p className='text-xl text-muted-foreground mb-4 max-w-2xl mx-auto'>
          Explore your data with powerful analytics and chat with your data using natural language intelligence.
        </p>

        <div className='text-muted-foreground text-sm mb-8'>
          <p>✨ Powered by premium analytics suite</p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
          <Link href='/dashboard' className='group'>
            <Button size='lg' className='bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white w-full sm:w-auto shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all'>
              <LayoutDashboard className='mr-2 w-5 h-5' />
              Go to Dashboard
            </Button>
          </Link>
          <Link href='/chat' className='group'>
            <Button size='lg' variant='outline' className='border-purple-500/30 text-purple-300 hover:bg-purple-950/50 hover:border-purple-400/60 w-full sm:w-auto transition-all'>
              <MessageSquare className='mr-2 w-5 h-5' />
              Chat with Data
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-16'>
          <div className='p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-cyan-900/30 hover:border-cyan-400/60 transition-all'>
            <div className='bg-gradient-to-br from-cyan-500 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50'>
              <TrendingUp className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-lg font-semibold text-cyan-100 mb-2'>Real-time Analytics</h3>
            <p className='text-sm text-muted-foreground'>Monitor your metrics in real-time with beautiful visualizations and instant insights.</p>
          </div>

          <div className='p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-purple-900/30 hover:border-purple-400/60 transition-all'>
            <div className='bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50'>
              <MessageSquare className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-lg font-semibold text-purple-100 mb-2'>AI Chat Interface</h3>
            <p className='text-sm text-muted-foreground'>Ask natural language questions about your data and get instant SQL results.</p>
          </div>

          <div className='p-6 rounded-xl border border-magenta-500/30 bg-gradient-to-br from-magenta-950/50 to-magenta-900/30 hover:border-magenta-400/60 transition-all'>
            <div className='bg-gradient-to-br from-magenta-500 to-magenta-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-magenta-500/50'>
              <Database className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-lg font-semibold text-magenta-100 mb-2'>Data Insights</h3>
            <p className='text-sm text-muted-foreground'>Deep dive into your invoices, vendors, and spending patterns with advanced filters.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
