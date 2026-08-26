'use client'

import { FolderKanban, Megaphone, MessageSquare, Merge, Replace } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ImportPayload } from '@/lib/import'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload: ImportPayload | null
  invalidCount: number
  onImport: (mode: 'merge' | 'replace') => void
}

export function ImportDialog({ open, onOpenChange, payload, invalidCount, onImport }: ImportDialogProps) {
  if (!payload) return null
  const { projects, campaigns, posts } = payload
  const total = projects.length + campaigns.length + posts.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Import backup</DialogTitle>
          <DialogDescription className="text-white/60">
            This file contains <strong className="text-white/90">{total}</strong> item{total === 1 ? '' : 's'}.
            Choose how you want to bring them into your ledger.
          </DialogDescription>
        </DialogHeader>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex flex-col items-center gap-1 rounded-lg px-2 py-2">
            <FolderKanban className="h-4 w-4 text-violet-400" />
            <span className="text-lg font-bold tabular-nums text-white">{projects.length}</span>
            <span className="text-[10px] uppercase tracking-wide text-white/50">Projects</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg px-2 py-2">
            <Megaphone className="h-4 w-4 text-pink-400" />
            <span className="text-lg font-bold tabular-nums text-white">{campaigns.length}</span>
            <span className="text-[10px] uppercase tracking-wide text-white/50">Campaigns</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg px-2 py-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <span className="text-lg font-bold tabular-nums text-white">{posts.length}</span>
            <span className="text-[10px] uppercase tracking-wide text-white/50">Posts</span>
          </div>
        </div>

        {invalidCount > 0 && (
          <p className="text-xs text-amber-400/80">
            {invalidCount} invalid entr{invalidCount === 1 ? 'y was' : 'ies were'} skipped (unrecognized format).
          </p>
        )}

        <div className="space-y-2 text-xs text-white/60">
          <div className="flex items-start gap-2">
            <Merge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>
              <strong className="text-white/90">Merge</strong> keeps your current data and adds
              only items you don&apos;t already have (matched by id).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Replace className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>
              <strong className="text-white/90">Replace all</strong> wipes your current data and
              restores exactly what&apos;s in this file.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => onImport('replace')}
              className="bg-rose-600 text-white hover:bg-rose-500"
            >
              <Replace className="mr-1 h-4 w-4" />
              Replace all
            </Button>
            <Button
              onClick={() => onImport('merge')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40"
            >
              <Merge className="mr-1 h-4 w-4" />
              Merge
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
