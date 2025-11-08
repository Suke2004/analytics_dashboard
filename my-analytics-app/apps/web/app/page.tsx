import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <main className='max-w-4xl mx-auto text-center'>
        <h1 className='text-4xl font-bold mb-4'>Analytics Dashboard</h1>
        <p className='text-xl text-muted-foreground mb-8'>
          View your analytics and chat with your data using natural language
        </p>
        <div className='flex gap-4 justify-center'>
          <Link href='/dashboard'>
            <Button size='lg'>Go to Dashboard</Button>
          </Link>
          <Link href='/chat'>
            <Button variant='outline' size='lg'>
              Chat with Data
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
