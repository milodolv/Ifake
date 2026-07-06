"use client";

import Link from "next/link";
import { ConfigPanel } from "./ConfigPanel";
import { PreviewPanel } from "./PreviewPanel";

export function EditorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="text-lg font-bold text-white">
          iFake
        </Link>
        <span className="text-xs text-white/40">Éditeur</span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="lg:w-[420px] xl:w-[480px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto p-4">
          <ConfigPanel />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex items-start justify-center bg-background/50">
          <PreviewPanel />
        </main>
      </div>
    </div>
  );
}
