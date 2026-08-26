'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  /** Icon node — defaults to a Sparkles icon. */
  icon?: React.ReactNode
  /** Headline, e.g. "No matches", "No campaigns yet". */
  title: string
  /** Supporting text shown under the title. */
  description?: string
  /** Optional CTA button. */
  action?: {
    label: string
    onClick: () => void
  }
  /** 'default' = solid card; 'dashed' = dashed border (more "add" CTA style). */
  variant?: 'default' | 'dashed'
  /** Extra classes appended to the root container. */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isDashed = variant === 'dashed'

  return (
    <div
      role="status"
      className={[
        'relative overflow-hidden rounded-2xl p-10 text-center flex flex-col items-center gap-3 sm:p-12',
        isDashed
          ? 'border border-dashed border-white/15 bg-white/[0.03]'
          : 'border border-white/10 bg-white/5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300"
      >
        {icon ?? <Sparkles className="h-6 w-6" />}
      </motion.div>

      <h3 className="text-base font-medium text-white/80">{title}</h3>

      {description && (
        <p className="max-w-sm text-sm text-white/50">{description}</p>
      )}

      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          aria-label={action.label}
          className="mt-1 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-violet-400/30"
        >
          {action.label}
        </Button>
      )}

      {/* Subtle bottom gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
    </div>
  )
}

export default EmptyState
