"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

export function LayoutHeader() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40'>
        <div className='px-8 py-4 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            Premium Analytics Suite
          </h2>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className='p-2 rounded-lg bg-card border border-border hover:border-cyan-500/30 transition-colors text-muted-foreground hover:text-cyan-300'
              title='Keyboard shortcuts (Ctrl+Shift+?)'>
              <HelpCircle className='w-5 h-5' />
            </button>
            <ThemeToggle />
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500' />
          </div>
        </div>
      </header>
      {showShortcuts && (
        <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
      )}
    </>
  );
}
