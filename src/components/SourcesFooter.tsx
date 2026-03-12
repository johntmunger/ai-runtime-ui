import { ExternalLink } from "lucide-react";
import type { Citation } from "@/types";

interface SourcesFooterProps {
  citations: Citation[];
}

export function SourcesFooter({ citations }: SourcesFooterProps) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-[var(--border)]">
      <div className="flex flex-col gap-3">
        {citations.map((citation, index) => (
          <div
            key={citation.id}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {citation.mdnTitle}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mb-3 leading-relaxed line-clamp-3">
                  {citation.excerpt}
                </div>
                <a
                  href={citation.mdnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on MDN
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
