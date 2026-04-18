"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RequirementsSummaryProps {
  summary: string;
}

export function RequirementsSummary({ summary }: RequirementsSummaryProps) {
  return (
    <div className="w-full h-full overflow-auto bg-white">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:mb-6 prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-ul:my-2 prose-li:my-1 prose-p:text-sm prose-li:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
