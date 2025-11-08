"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface KeyboardShortcutsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcuts({ open = true, onOpenChange }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  if (!isOpen) return null;

  const closeModal = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-card border border-cyan-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
        <div className='sticky top-0 bg-card border-b border-cyan-500/20 p-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-foreground'>Keyboard Shortcuts</h2>
          <button
            onClick={closeModal}
            className='p-1 hover:bg-cyan-950/50 rounded transition-colors'>
            <X className='w-5 h-5 text-muted-foreground' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          <div>
            <h3 className='text-sm font-semibold text-cyan-200 mb-3 uppercase tracking-wide'>
              General
            </h3>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Search Invoices</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  Ctrl + K
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Toggle Theme</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  No shortcut yet
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Open Shortcuts</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  Ctrl + Shift + ?
                </kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-cyan-200 mb-3 uppercase tracking-wide'>
              Dashboard
            </h3>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>View Dashboard</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  Click sidebar
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Chat with Data</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  Click sidebar
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Export Invoices</span>
                <kbd className='px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300'>
                  Click Export CSV
                </kbd>
              </div>
            </div>
          </div>

          <div className='bg-cyan-950/20 border border-cyan-500/20 p-4 rounded text-xs text-muted-foreground'>
            💡 <strong>Tip:</strong> Use the quick filter buttons to view data from the last 30/90 days or all time.
          </div>
        </div>
      </div>
    </div>
  );
}
