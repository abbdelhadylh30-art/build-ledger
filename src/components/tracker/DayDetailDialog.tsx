'use client'

import { CalendarIcon, CalendarPlus, Eye, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getPlatformMeta,
  getPostStatusMeta,
  type Campaign,
  type Post,
} from '@/lib/marketing'

interface DayDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null // the calendar day being shown
  posts: Post[] // ALL posts for that day (already filtered by calendar filters, sorted by time)
  campaigns: Campaign[] // all campaigns (to resolve campaign names/colors)
  onEditPost: (p: Post) => void
  onNewPost: (dateISO: string) => void
}

export function DayDetailDialog({
  open,
  onOpenChange,
  date,
  posts,
  campaigns,
  onEditPost,
  onNewPost,
}: DayDetailDialogProps) {
  if (!date) return null

  const campaignMap = new Map(campaigns.map((c) => [c.id, c] as const))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md shadow-violet-500/30">
              <CalendarIcon className="h-4 w-4 text-white" />
            </span>
            {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {posts.length} post{posts.length === 1 ? '' : 's'} scheduled this day — as
            filtered in the calendar view.
          </DialogDescription>
        </DialogHeader>

        {/* Posts list (or empty state) */}
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                <CalendarPlus className="h-5 w-5 text-violet-400" />
              </span>
              <p className="text-sm font-medium text-white/70">Nothing scheduled</p>
              <p className="text-xs text-white/40">This day is completely free.</p>
            </div>
          ) : (
            posts.map((post, index) => {
              const platform = getPlatformMeta(post.platform)
              const status = getPostStatusMeta(post.status)
              const campaign = post.campaignId
                ? campaignMap.get(post.campaignId)
                : undefined
              const accent = campaign?.color ?? platform.color
              const time = post.scheduledDate
                ? new Date(post.scheduledDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null
              const excerpt = post.content?.trim().replace(/\s+/g, ' ')
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.25 }}
                >
                  <button
                    onClick={() => onEditPost(post)}
                    className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-violet-500/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                  {/* Header line: index · platform · status · time */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] tabular-nums text-white/30">{index + 1}</span>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                      style={{ background: platform.color }}
                    >
                      {platform.icon}
                    </span>
                    <span className="text-[10px] text-white/50">{platform.label}</span>
                    <span
                      className="rounded-full px-1.5 py-px text-[9px] font-semibold"
                      style={{ background: `${status.color}22`, color: status.color }}
                    >
                      {status.label}
                    </span>
                    {time && (
                      <span className="ml-auto text-[10px] tabular-nums text-white/40">
                        {time}
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <div className="mt-1.5 text-sm font-semibold text-white">{post.title}</div>
                  {/* Campaign */}
                  {campaign && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/50">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: campaign.color }}
                      />
                      {campaign.name}
                    </div>
                  )}
                  {/* Content excerpt */}
                  {excerpt && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">
                      {excerpt}
                    </p>
                  )}
                  {/* Metrics */}
                  {post.metrics?.impressions !== undefined && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] tabular-nums text-white/40">
                      <Eye className="h-3 w-3 shrink-0" />
                      {post.metrics.impressions.toLocaleString()} impressions
                      {post.metrics.clicks !== undefined &&
                        ` · ${post.metrics.clicks.toLocaleString()} clicks`}
                    </div>
                  )}
                </button>
                </motion.div>
              )
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const d = new Date(date)
              d.setHours(10, 0, 0, 0)
              onNewPost(d.toISOString())
            }}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add post on this day
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
