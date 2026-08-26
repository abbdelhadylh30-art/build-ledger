'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DayDetailDialog } from './DayDetailDialog'
import {
  getPlatformMeta,
  getPostStatusMeta,
  getCampaignStatusMeta,
  toCalendarDate,
  POST_STATUSES,
  type Post,
  type Campaign,
} from '@/lib/marketing'

interface CalendarViewProps {
  posts: Post[]
  campaigns: Campaign[]
  onNewPost: (date?: string) => void
  onEditPost: (p: Post) => void
  onMovePost: (postId: string, newDate: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: Date[] = []
  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }
  // Next month padding to fill 6 weeks (42 cells)
  while (days.length < 42) {
    const last = days[days.length - 1]
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1))
  }
  return days
}

export function CalendarView({ posts, campaigns, onNewPost, onEditPost, onMovePost }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [draggedPost, setDraggedPost] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null)

  const days = useMemo(
    () => getMonthGrid(currentMonth.year, currentMonth.month),
    [currentMonth],
  )

  const today = toCalendarDate(new Date().toISOString())

  const campaignMap = useMemo(() => {
    const m = new Map<string, Campaign>()
    for (const c of campaigns) m.set(c.id, c)
    return m
  }, [campaigns])

  const postsByDate = useMemo(() => {
    const m = new Map<string, Post[]>()
    for (const p of posts) {
      if (filterPlatform !== 'all' && p.platform !== filterPlatform) continue
      if (filterStatus !== 'all' && p.status !== filterStatus) continue
      const date = p.scheduledDate || p.postedDate
      if (!date) continue
      const key = toCalendarDate(date)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(p)
    }
    // Sort each day's posts by time
    for (const [, dayPosts] of m) {
      dayPosts.sort((a, b) => {
        const aDate = a.scheduledDate || a.postedDate || ''
        const bDate = b.scheduledDate || b.postedDate || ''
        return aDate.localeCompare(bDate)
      })
    }
    return m
  }, [posts, filterPlatform, filterStatus])

  const visibleCount = useMemo(
    () =>
      posts.filter(
        (p) =>
          (filterPlatform === 'all' || p.platform === filterPlatform) &&
          (filterStatus === 'all' || p.status === filterStatus),
      ).length,
    [posts, filterPlatform, filterStatus],
  )

  const handlePrevMonth = () => {
    setCurrentMonth((c) => ({
      year: c.month === 0 ? c.year - 1 : c.year,
      month: c.month === 0 ? 11 : c.month - 1,
    }))
  }

  const handleNextMonth = () => {
    setCurrentMonth((c) => ({
      year: c.month === 11 ? c.year + 1 : c.year,
      month: c.month === 11 ? 0 : c.month + 1,
    }))
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() })
  }

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', postId)
    setDraggedPost(postId)
  }

  const handleDragEnd = () => {
    setDraggedPost(null)
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const postId = e.dataTransfer.getData('text/plain')
    if (!postId) return
    const newDate = new Date(date)
    newDate.setHours(10, 0, 0, 0) // default to 10am
    onMovePost(postId, newDate.toISOString())
    setDraggedPost(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Arrow keys navigate months (Left/Right), "t" jumps to today.
  // Suppressed while the day-detail dialog is open (shadcn Dialog
  // handles Escape itself via its portal, so it still passes through).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (dayDetailDate !== null) return
      const target = e.target as HTMLElement
      const typing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft') handlePrevMonth()
      else if (e.key === 'ArrowRight') handleNextMonth()
      else if (e.key.toLowerCase() === 't') handleToday()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-xl font-bold text-transparent">{monthName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-white/60 hover:bg-white/10 hover:text-white"
            title="Today (t)"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            className="text-white/60 hover:bg-white/10 hover:text-white"
            title="Previous month (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="text-white/60 hover:bg-white/10 hover:text-white"
            title="Next month (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onNewPost()}
            className="ml-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
            size="sm"
          >
            <Plus className="mr-1 h-3 w-3" />
            New post
          </Button>
        </div>
      </div>

      {/* Filters + month stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Filter
          </span>
          <FilterChip
            active={filterPlatform === 'all'}
            label="All platforms"
            onClick={() => setFilterPlatform('all')}
          />
          {[...new Set(posts.map((p) => p.platform))].map((pf) => {
            const meta = getPlatformMeta(pf)
            return (
              <FilterChip
                key={pf}
                active={filterPlatform === pf}
                label={meta.label}
                dot={meta.color}
                onClick={() => setFilterPlatform(pf)}
              />
            )
          })}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <FilterChip
            active={filterStatus === 'all'}
            label="All statuses"
            onClick={() => setFilterStatus('all')}
          />
          {POST_STATUSES.map((s) => (
            <FilterChip
              key={s.value}
              active={filterStatus === s.value}
              label={s.label}
              dot={s.color}
              onClick={() => setFilterStatus(s.value)}
            />
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-white/40">
          {visibleCount} post{visibleCount === 1 ? '' : 's'} scheduled this view
        </span>
      </div>

      {/* Weekday headers — weekend labels get a subtle warm tint */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, i) => {
          const weekend = i === 0 || i === 6
          return (
            <div
              key={day}
              className={`py-2 text-center text-[10px] font-semibold uppercase tracking-wider ${
                weekend ? 'text-amber-200/40' : 'text-white/40'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const dateStr = toCalendarDate(date.toISOString())
          const dayPosts = postsByDate.get(dateStr) || []
          const isCurrentMonth = date.getMonth() === currentMonth.month
          const isToday = dateStr === today
          // Grid column of this cell (0=Sun … 6=Sat) — used to keep the
          // hover tooltip inside the viewport in the last two columns.
          const col = i % 7
          // Weekend cells (Sat/Sun) get a subtle warm tint when in the
          // current month. Hover affordance: neutral border brighten for
          // current-month cells; during a drag the violet drop-target
          // border wins (only one hover:border-* class at a time, so the
          // two never fight over CSS ordering).
          const isWeekend = col === 0 || col === 6
          const hoverBorder = draggedPost
            ? 'hover:border-violet-500/40'
            : isCurrentMonth
              ? 'hover:border-white/20'
              : ''

          return (
            <div
              key={i}
              onDrop={(e) => handleDrop(e, date)}
              onDragOver={handleDragOver}
              className={`group relative min-h-[100px] rounded-lg border p-1 transition ${
                isCurrentMonth
                  ? `border-white/10 ${isWeekend ? 'bg-amber-50/[0.02]' : 'bg-white/[0.02]'}`
                  : 'border-white/5 bg-transparent opacity-40'
              } ${
                isToday
                  ? 'ring-1 ring-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                  : ''
              } ${hoverBorder}`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between">
                {isCurrentMonth && dayPosts.length > 0 ? (
                  <button
                    tabIndex={0}
                    onClick={() => setDayDetailDate(date)}
                    className={
                      isToday
                        ? 'rounded bg-violet-600 px-1.5 text-[10px] font-medium text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950'
                        : 'rounded px-1 text-[10px] font-medium text-white/50 transition hover:bg-violet-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950'
                    }
                    aria-label={`Open ${date.toLocaleDateString([], { month: 'long', day: 'numeric' })} details`}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <span
                    className={`text-[10px] font-medium ${
                      isToday ? 'rounded bg-violet-600 px-1.5 text-white' : 'text-white/50'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                )}
                {isCurrentMonth && (
                  <button
                    onClick={() => {
                      const dateWithTime = new Date(date)
                      dateWithTime.setHours(10, 0, 0, 0)
                      onNewPost(dateWithTime.toISOString())
                    }}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="Add post on this day"
                  >
                    <Plus className="h-3 w-3 text-white/40 hover:text-white" />
                  </button>
                )}
              </div>

              {/* Posts */}
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 3).map((post) => {
                  const platform = getPlatformMeta(post.platform)
                  const status = getPostStatusMeta(post.status)
                  const campaign = post.campaignId ? campaignMap.get(post.campaignId) : null
                  const time = post.scheduledDate
                    ? new Date(post.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : null
                  const contentExcerpt = post.content?.trim().replace(/\s+/g, ' ').slice(0, 140)
                  const accent = campaign?.color ?? platform.color
                  return (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post.id)}
                      onDragEnd={handleDragEnd}
                      className="group/post relative"
                    >
                      {/* Chip — keyboard reachable (Enter / Space edit) */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Edit post: ${post.title}`}
                        onClick={() => onEditPost(post)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onEditPost(post)
                          }
                        }}
                        className="cursor-pointer rounded px-1 py-0.5 text-[10px] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
                        style={{
                          background: `${accent}22`,
                          borderLeft: `2px solid ${accent}`,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="flex h-3 w-3 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                            style={{ background: platform.color }}
                          >
                            {platform.icon}
                          </span>
                          <span className="truncate text-white/80">{post.title}</span>
                          <span
                            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: status.color }}
                            title={status.label}
                          />
                        </div>
                      </div>

                      {/* Hover preview popover — right-aligned in the two
                          last columns (Fri/Sat) so the 256px tooltip can't
                          extend past the viewport and force a horizontal
                          scrollbar; centered elsewhere (left overflow
                          doesn't create scrollbars, only visual clipping). */}
                      <div
                        className={`pointer-events-none absolute top-full z-40 w-64 translate-y-1.5 rounded-xl border border-white/10 bg-slate-900/95 p-3 opacity-0 shadow-xl shadow-black/50 backdrop-blur transition-opacity duration-150 group-hover/post:opacity-100 ${
                          col >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        role="tooltip"
                      >
                        {/* Popover header: platform + status + time */}
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                            style={{ background: platform.color }}
                          >
                            {platform.icon}
                          </span>
                          <span className="text-[10px] font-medium text-white/60">{platform.label}</span>
                          <span
                            className="rounded-full px-1.5 py-px text-[9px] font-semibold"
                            style={{ background: `${status.color}22`, color: status.color }}
                          >
                            {status.label}
                          </span>
                          {time && (
                            <span className="ml-auto text-[10px] tabular-nums text-white/40">{time}</span>
                          )}
                        </div>
                        {/* Full title */}
                        <div className="mb-1 text-xs font-semibold text-white">{post.title}</div>
                        {/* Campaign tag */}
                        {campaign && (
                          <div className="mb-1.5 flex items-center gap-1 text-[10px] text-white/50">
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ background: campaign.color }}
                            />
                            {campaign.name}
                          </div>
                        )}
                        {/* Content excerpt */}
                        {contentExcerpt && (
                          <p className="line-clamp-3 text-[10px] leading-relaxed text-white/55">
                            {contentExcerpt}
                            {(post.content?.trim().length ?? 0) > 140 && '…'}
                          </p>
                        )}
                        {/* Metrics hint */}
                        {post.metrics && post.metrics.impressions !== undefined && (
                          <div className="mt-1.5 border-t border-white/5 pt-1.5 text-[10px] tabular-nums text-white/40">
                            {post.metrics.impressions.toLocaleString()} impressions
                            {post.metrics.clicks !== undefined &&
                              ` · ${post.metrics.clicks.toLocaleString()} clicks`}
                          </div>
                        )}
                        <div className="mt-1.5 text-center text-[9px] text-white/25">
                          click to edit
                        </div>
                      </div>
                    </div>
                  )
                })}
                {dayPosts.length > 3 && (
                  <button
                    tabIndex={0}
                    onClick={() => setDayDetailDate(date)}
                    className="w-full rounded px-1 py-0.5 text-left text-[9px] font-medium text-violet-300/80 transition hover:bg-violet-500/10 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
                    title={`Show all ${dayPosts.length} posts on this day`}
                  >
                    +{dayPosts.length - 3} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[10px] text-white/50">
        <span className="font-semibold text-white/70">Platforms:</span>
        {['twitter', 'linkedin', 'reddit', 'hackernews', 'youtube', 'newsletter'].map((p) => {
          const meta = getPlatformMeta(p as any)
          return (
            <span key={p} className="flex items-center gap-1">
              <span
                className="flex h-3 w-3 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ background: meta.color }}
              >
                {meta.icon}
              </span>
              {meta.label}
            </span>
          )
        })}
        <span className="ml-4 text-white/40">
          ← / → months · t today · drag posts to reschedule
        </span>
      </div>

      {/* Day detail dialog ("+N more" / date number) */}
      <DayDetailDialog
        open={dayDetailDate !== null}
        onOpenChange={(o) => {
          if (!o) setDayDetailDate(null)
        }}
        date={dayDetailDate}
        posts={
          dayDetailDate
            ? (postsByDate.get(toCalendarDate(dayDetailDate.toISOString())) ?? [])
            : []
        }
        campaigns={campaigns}
        onEditPost={(p) => {
          setDayDetailDate(null)
          onEditPost(p)
        }}
        onNewPost={(iso) => {
          setDayDetailDate(null)
          onNewPost(iso)
        }}
      />
    </div>
  )
}

function FilterChip({
  active,
  label,
  dot,
  onClick,
}: {
  active: boolean
  label: string
  dot?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 ${
        active
          ? 'bg-violet-600/80 text-white shadow-sm shadow-violet-500/30'
          : 'text-white/50 hover:bg-white/10 hover:text-white/80'
      }`}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: dot }}
        />
      )}
      {label}
    </button>
  )
}
