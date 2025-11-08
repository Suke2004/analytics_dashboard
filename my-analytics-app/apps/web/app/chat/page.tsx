"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";

interface ChatResponse {
  sql: string;
  result: any[];
  error?: string;
}

const API_BASE = "/api";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ prompt: string; response: ChatResponse }>
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new chat is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const currentPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat-with-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data: ChatResponse = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          prompt: currentPrompt,
          response: data,
        },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          prompt: currentPrompt,
          response: {
            sql: "",
            result: [],
            error:
              error instanceof Error ? error.message : "Unknown server error",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderResults(result: any[]) {
    if (!result || result.length === 0)
      return <p className='text-muted-foreground text-sm'>No results found.</p>;

    const columns = Object.keys(result[0]);
    return (
      <div className='overflow-x-auto border border-cyan-500/20 rounded-lg'>
        <table className='min-w-full text-sm'>
          <thead className='bg-cyan-950/50'>
            <tr>
              {columns.map((col) => (
                <th key={col} className='text-left px-3 py-2 font-medium text-cyan-200'>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, idx) => (
              <tr key={idx} className='border-t border-cyan-500/10 hover:bg-cyan-950/30 transition-colors'>
                {columns.map((col) => (
                  <td key={col} className='px-3 py-2 text-cyan-300'>
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className='px-8 py-8 max-w-5xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent'>
          💬 Chat with Data
        </h1>
        <p className='text-muted-foreground'>
          Ask questions about your analytics dataset and get instant SQL + results.
        </p>
      </div>

      {/* Prompt Input */}
      <Card className='mb-8 border border-purple-500/30 bg-gradient-to-br from-card to-card/50'>
        <CardHeader>
          <CardTitle className='text-purple-100'>Ask a Question</CardTitle>
          <CardDescription>
            Try: "Top 5 vendors by spend", "Invoices from last month", "Average invoice value"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex gap-2'>
            <Input
              id='prompt'
              placeholder='e.g. Show total spend this year'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className='flex-1 bg-background border-purple-500/30 text-foreground placeholder:text-muted-foreground'
            />
            <Button
              type='submit'
              disabled={loading || !prompt.trim()}
              className='bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50'>
              {loading ? (
                <Loader2 className='animate-spin w-4 h-4' />
              ) : (
                <Send className='w-4 h-4' />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Chat History */}
      <div className='space-y-8'>
        {history.length === 0 && (
          <Card className='border-2 border-dashed border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-cyan-900/10'>
            <CardContent className='py-12 text-center text-muted-foreground'>
              ✨ No queries yet. Start by asking a question above!
            </CardContent>
          </Card>
        )}

        {history.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-4'>
            {/* Question */}
            <Card className='border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-purple-900/10'>
              <CardHeader>
                <CardTitle className='text-sm font-semibold text-purple-200'>
                  ❓ Your Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-base font-medium text-foreground'>{item.prompt}</p>
              </CardContent>
            </Card>

            {/* SQL */}
            <Card className='border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-cyan-900/10'>
              <CardHeader>
                <CardTitle className='text-sm text-cyan-200'>
                  🧠 Generated SQL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='bg-background border border-cyan-500/30 p-4 rounded-lg text-xs overflow-x-auto text-cyan-300 font-mono'>
                  {item.response.sql || "No SQL generated"}
                </pre>
              </CardContent>
            </Card>

            {/* Results */}
            {item.response.error ? (
              <Card className='border border-red-500/30 bg-gradient-to-br from-red-950/30 to-red-900/10'>
                <CardHeader>
                  <CardTitle className='text-sm text-red-300'>
                    ⚠️ Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-red-300 text-sm'>
                    {item.response.error}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className='border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10'>
                <CardHeader>
                  <CardTitle className='text-sm text-emerald-200'>
                    📊 Results
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    {item.response.result.length} row(s) returned
                  </CardDescription>
                </CardHeader>
                <CardContent>{renderResults(item.response.result)}</CardContent>
              </Card>
            )}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
