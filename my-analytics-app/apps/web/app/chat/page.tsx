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
      <div className='overflow-x-auto border border-border rounded-lg'>
        <table className='min-w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              {columns.map((col) => (
                <th key={col} className='text-left px-3 py-2 font-medium'>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, idx) => (
              <tr key={idx} className='border-t border-border/50'>
                {columns.map((col) => (
                  <td key={col} className='px-3 py-2 text-muted-foreground'>
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
    <div className='container mx-auto px-4 py-8 max-w-5xl'>
      <h1 className='text-3xl font-bold mb-2'>💬 Chat with Data</h1>
      <p className='text-muted-foreground mb-8'>
        Ask questions about your analytics dataset and get instant SQL +
        results.
      </p>

      {/* Prompt Input */}
      <Card className='mb-8 bg-background border-border'>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Try: “Top 5 vendors by spend”, “Invoices from last month”, “Average
            invoice value”
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
              className='flex-1'
            />
            <Button type='submit' disabled={loading || !prompt.trim()}>
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
          <Card className='border-dashed border-muted-foreground/30'>
            <CardContent className='py-12 text-center text-muted-foreground'>
              No queries yet. Start by asking a question above!
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
            <Card className='bg-muted/20 border-border'>
              <CardHeader>
                <CardTitle className='text-sm font-semibold text-foreground'>
                  Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-base font-medium'>{item.prompt}</p>
              </CardContent>
            </Card>

            {/* SQL */}
            <Card className='bg-muted/10 border-border'>
              <CardHeader>
                <CardTitle className='text-sm text-muted-foreground'>
                  🧠 Generated SQL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='bg-background border border-border/30 p-3 rounded-md text-xs overflow-x-auto text-green-400'>
                  {item.response.sql || "No SQL generated"}
                </pre>
              </CardContent>
            </Card>

            {/* Results */}
            {item.response.error ? (
              <Card className='border-destructive/50 bg-destructive/10'>
                <CardHeader>
                  <CardTitle className='text-sm text-destructive'>
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-destructive text-sm'>
                    {item.response.error}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className='bg-muted/10 border-border'>
                <CardHeader>
                  <CardTitle className='text-sm text-muted-foreground'>
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
