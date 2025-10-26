import { ReactNode } from 'react';
import '@/app/ui/global.css';

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Learning Session</h1>
        <p className="text-sm text-gray-500">
          Next.js + MDX powered docs (next-docs-ui ready)
        </p>
      </header>
      <main className="prose max-w-none prose-headings:scroll-mt-20">
        {children}
      </main>
    </div>
  );
}

