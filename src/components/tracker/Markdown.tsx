'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

/**
 * Dark-themed markdown renderer tuned for compact contexts (project notes).
 * Scales headings down so notes stay readable inside cards and dialogs.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'text-xs leading-relaxed text-white/70 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-1.5 mt-3 text-sm font-bold text-white first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-1.5 mt-3 text-[13px] font-semibold text-white first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1 mt-2.5 text-xs font-semibold uppercase tracking-wide text-white/60 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1 mt-2 text-xs font-semibold text-white/80 first:mt-0">{children}</h4>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/80">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-300 underline decoration-violet-400/40 underline-offset-2 transition hover:text-violet-200 hover:decoration-violet-300"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-0.5 pl-4 marker:text-violet-400/70 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-0.5 pl-4 marker:text-violet-400/70 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          code: ({ children, className }) => {
            const isBlock = /language-/.test(className ?? '')
            if (isBlock) {
              return (
                <code className="font-mono text-[11px] leading-relaxed text-violet-100">
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-violet-500/15 px-1 py-0.5 font-mono text-[11px] text-violet-200">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-2 mt-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2.5 last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-violet-400/40 pl-3 italic text-white/50 last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-white/10" />,
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
              <table className="w-full text-left text-[11px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/10 pb-1 pr-3 font-semibold text-white/80">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-white/5 py-1 pr-3">{children}</td>,
          input: ({ checked }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-1.5 h-3 w-3 translate-y-[1px] rounded-sm accent-violet-500"
            />
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}