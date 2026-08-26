'use client'

import type { ReactNode } from 'react'
import {
  ArrowUpDown,
  Briefcase,
  Calendar as CalendarIcon,
  Command,
  CornerDownLeft,
  FolderKanban,
  Keyboard,
  LayoutDashboard,
  Megaphone,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutRow {
  keys: string[]
  label: string
  hint?: string
}

interface ShortcutGroup {
  title: string
  icon: LucideIcon
  accent: string
  rows: ShortcutRow[]
}

interface ShortcutTarget {
  icon: LucideIcon
  label: string
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Global',
    icon: Command,
    accent: 'text-violet-300 bg-violet-500/15 border-violet-500/30',
    rows: [
      { keys: ['⌘', 'K'], label: 'Command palette', hint: 'search everything + quick actions' },
      { keys: ['?'], label: 'This help', hint: 'shortcut reference' },
      { keys: ['N'], label: 'New item', hint: 'project · campaign · post (per tab)' },
      { keys: ['/'], label: 'Focus search', hint: 'projects & campaigns tabs' },
      { keys: ['Esc'], label: 'Close overlay', hint: 'palette → form → dialog, topmost first' },
    ],
  },
  {
    title: 'Command palette',
    icon: Search,
    accent: 'text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/30',
    rows: [
      { keys: ['↑', '↓'], label: 'Move selection', hint: 'wraps around at both ends' },
      { keys: ['↵'], label: 'Run action', hint: 'navigate · create · edit · export' },
      { keys: ['Esc'], label: 'Dismiss palette' },
    ],
  },
  {
    title: 'Calendar',
    icon: CalendarIcon,
    accent: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
    rows: [
      { keys: ['←', '→'], label: 'Previous / next month' },
      { keys: ['T'], label: 'Jump to today' },
    ],
  },
  {
    title: 'Views',
    icon: LayoutDashboard,
    accent: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    rows: [
      { keys: ['Drag'], label: 'Reschedule a post', hint: 'drop it on any calendar day' },
      { keys: ['Click'], label: 'Edit a post', hint: 'chip click opens the edit form' },
    ],
  },
]

const N_TARGETS: ShortcutTarget[] = [
  { icon: LayoutDashboard, label: 'Dashboard — overview & charts' },
  { icon: FolderKanban, label: 'Projects — N creates a project' },
  { icon: Briefcase, label: 'Clients — N creates a prospect' },
  { icon: Megaphone, label: 'Campaigns — N creates a campaign' },
  { icon: CalendarIcon, label: 'Calendar — N creates a post' },
]

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-white/15 bg-white/[0.07] px-1.5 py-1 font-mono text-[11px] font-semibold text-white/80 shadow-[inset_0_-2px_0_rgba(255,255,255,0.06)]">
      {children}
    </kbd>
  )
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md shadow-violet-500/30">
              <Keyboard className="h-4 w-4 text-white" />
            </span>
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Build Ledger is built keyboard-first — every list, form and view is reachable
            without touching the mouse.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable shortcut reference */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => {
            const GroupIcon = group.icon
            return (
              <section key={group.title} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${group.accent}`}
                  >
                    <GroupIcon className="h-3 w-3" />
                  </span>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    {group.title}
                  </h3>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                </div>
                <ul>
                  {group.rows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5"
                    >
                      <span className="flex items-center gap-1">
                        {row.keys.map((key) => (
                          <Kbd key={key}>{key}</Kbd>
                        ))}
                      </span>
                      <span className="text-xs font-medium text-white/85">{row.label}</span>
                      {row.hint && (
                        <span className="ml-auto hidden text-[10px] text-white/35 sm:block">
                          {row.hint}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          {/* Where "N" lands you */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3 text-white/50" />
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                Where “N” lands you
              </h4>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {N_TARGETS.map((target) => {
                const TargetIcon = target.icon
                return (
                  <div key={target.label} className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-violet-500/20 text-violet-300">
                      <TargetIcon className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[10px] text-white/60">{target.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reopen hint */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/5 pt-3 text-[10px] text-white/30">
          <ArrowUpDown className="h-3 w-3" />
          <span>
            press <Kbd>?</Kbd> anytime to reopen this reference
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
