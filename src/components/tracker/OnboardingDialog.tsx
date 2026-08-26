'use client'

import { motion } from 'framer-motion'
import {
  Sparkles,
  LayoutDashboard,
  FolderPlus,
  Megaphone,
  Calendar,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface OnboardingDialogProps {
  open: boolean
  onDismiss: () => void
  onGoToDashboard: () => void
  onNewProject: () => void
  onNewCampaign: () => void
  onOpenCalendar: () => void
}

interface QuickStartCard {
  icon: LucideIcon
  title: string
  description: string
  /** Tailwind classes for the icon's tinted box (text + bg + optional border). */
  accent: string
  ariaLabel: string
  action: () => void
}

export function OnboardingDialog({
  open,
  onDismiss,
  onGoToDashboard,
  onNewProject,
  onNewCampaign,
  onOpenCalendar,
}: OnboardingDialogProps) {
  const cards: QuickStartCard[] = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'See your stats at a glance',
      accent: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
      ariaLabel: 'Go to the dashboard',
      action: onGoToDashboard,
    },
    {
      icon: FolderPlus,
      title: 'Add a project',
      description: 'Track AI tools used, storage, portfolio status',
      accent: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30',
      ariaLabel: 'Create a new project',
      action: onNewProject,
    },
    {
      icon: Megaphone,
      title: 'Plan a campaign',
      description: 'Schedule posts across platforms',
      accent: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
      ariaLabel: 'Plan a new campaign',
      action: onNewCampaign,
    },
    {
      icon: Calendar,
      title: 'Open calendar',
      description: 'See all scheduled posts at a glance',
      accent: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      ariaLabel: 'Open the campaign calendar',
      action: onOpenCalendar,
    },
  ]

  const handleCardClick = (action: () => void) => {
    action()
    onDismiss()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onDismiss() }}>
      <DialogContent className="border-white/10 bg-slate-950 p-0 text-white overflow-hidden sm:max-w-2xl">
        {/* Gradient hero header */}
        <DialogHeader className="gap-0 border-b border-white/10 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/15 to-transparent p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-bold text-white">
                Welcome to Build Ledger
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-white/60">
                Track every project you build AND every post you ship. Local-first,
                keyboard-driven, yours.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick-start grid */}
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => handleCardClick(card.action)}
                  aria-label={card.ariaLabel}
                  className="group relative w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors duration-200 hover:border-violet-400/40 hover:bg-violet-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    {card.title}
                  </span>
                  <span className="mt-1 block text-xs text-white/50">
                    {card.description}
                  </span>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/40">
            Tip: press{' '}
            <kbd className="inline-flex min-w-[1.25rem] items-center justify-center rounded-md border border-white/15 bg-white/[0.07] px-1 py-0.5 font-mono text-[10px] font-semibold text-white/80">
              ?
            </kbd>{' '}
            anytime for keyboard shortcuts
          </p>
          <Button
            type="button"
            onClick={onDismiss}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-fuchsia-500"
          >
            Get started →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
