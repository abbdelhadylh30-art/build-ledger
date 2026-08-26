'use client'

import { useRef, useState } from 'react'
import { Bold, Italic, Heading2, List, ListChecks, Code, Eye, PencilLine, type LucideIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Markdown } from './Markdown'

interface MarkdownNotesEditorProps {
  value: string
  onChange: (v: string) => void
  id?: string
  placeholder?: string
  rows?: number
}

type Mode = 'write' | 'preview'

/** Pure data — which markdown transform each toolbar button applies. */
type ToolAction =
  | { kind: 'surround'; marker: string; fallback: string }
  | { kind: 'prefixLines'; prefix: string }

interface Tool {
  id: string
  icon: LucideIcon
  label: string
  action: ToolAction
}

const TOOLS: Tool[] = [
  { id: 'bold', icon: Bold, label: 'Bold (**text**)', action: { kind: 'surround', marker: '**', fallback: 'bold' } },
  { id: 'italic', icon: Italic, label: 'Italic (*text*)', action: { kind: 'surround', marker: '*', fallback: 'italic' } },
  { id: 'heading', icon: Heading2, label: 'Heading (## )', action: { kind: 'prefixLines', prefix: '## ' } },
  { id: 'list', icon: List, label: 'Bullet list (- )', action: { kind: 'prefixLines', prefix: '- ' } },
  { id: 'task', icon: ListChecks, label: 'Task list (- [ ] )', action: { kind: 'prefixLines', prefix: '- [ ] ' } },
  { id: 'code', icon: Code, label: 'Inline code (`text`)', action: { kind: 'surround', marker: '`', fallback: 'code' } },
]

/**
 * Notes editor with a lightweight markdown toolbar + live preview toggle.
 * Toolbar actions operate on the current selection of the textarea.
 */
export function MarkdownNotesEditor({
  value,
  onChange,
  id = 'notes',
  placeholder = 'Anything to remember — gotchas, lessons, follow-ups…\n\n**Markdown supported:** headings, lists, `code`, [links](https://), - [ ] tasks…',
  rows = 5,
}: MarkdownNotesEditorProps) {
  const [mode, setMode] = useState<Mode>('write')
  const taRef = useRef<HTMLTextAreaElement>(null)

  /** Wrap the current selection with markdown markers. */
  const surround = (marker: string, fallback = 'text') => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = value.slice(s, e) || fallback
    const next = value.slice(0, s) + marker + selected + marker + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + marker.length, s + marker.length + selected.length)
    })
  }

  /** Prefix every selected line (or the line the caret sits on) with a marker. */
  const prefixLines = (prefix: string) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const lineEndIdx = value.indexOf('\n', e)
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx
    const block = value.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    // Toggle: if all lines already carry the prefix, remove it instead
    const allPrefixed = lines.every((l) => l.startsWith(prefix))
    const nextBlock = lines
      .map((l) => (allPrefixed ? l.slice(prefix.length) : prefix + l))
      .join('\n')
    const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(lineStart, lineStart + nextBlock.length)
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-violet-400/40">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-white/10 bg-white/[0.03] px-1.5 py-1">
        {mode === 'write' ? (
          <>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={() =>
                  t.action.kind === 'surround'
                    ? surround(t.action.marker, t.action.fallback)
                    : prefixLines(t.action.prefix)
                }
                className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
              >
                <t.icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="ml-auto hidden text-[10px] text-white/30 sm:block">
              Markdown supported
            </span>
          </>
        ) : (
          <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Live preview
          </span>
        )}

        {/* Write / Preview toggle */}
        <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-black/30 p-0.5">
          {(
            [
              { m: 'write' as Mode, icon: PencilLine, label: 'Write' },
              { m: 'preview' as Mode, icon: Eye, label: 'Preview' },
            ]
          ).map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition',
                mode === m
                  ? 'bg-violet-600/80 text-white shadow-sm shadow-violet-500/30'
                  : 'text-white/50 hover:bg-white/10 hover:text-white/80'
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {mode === 'write' ? (
        <Textarea
          id={id}
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="min-h-[100px] resize-y border-0 bg-transparent px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      ) : (
        <div className="max-h-64 min-h-[100px] overflow-y-auto px-3 py-2.5">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-xs italic text-white/30">Nothing to preview yet…</p>
          )}
        </div>
      )}

      {/* Footer: char count */}
      <div className="flex justify-between border-t border-white/10 bg-white/[0.02] px-3 py-1 text-[10px] text-white/30">
        <span>{value.length === 0 ? 'No notes yet' : `${value.length} characters`}</span>
        {value.trim() && mode === 'write' && (
          <button
            type="button"
            onClick={() => setMode('preview')}
            className="text-violet-300/70 transition hover:text-violet-200"
          >
            Preview →
          </button>
        )}
      </div>
    </div>
  )
}
