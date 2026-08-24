'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getPlatformMeta,
  getPostStatusMeta,
  getCampaignStatusMeta,
  toCalendarDate,
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
  }, [posts])

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

  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">{monthName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-white/60 hover:bg-white/10 hover:text-white"
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
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="text-white/60 hover:bg-white/10 hover:text-white"
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

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/40"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const dateStr = toCalendarDate(date.toISOString())
          const dayPosts = postsByDate.get(dateStr) || []
          const isCurrentMonth = date.getMonth() === currentMonth.month
          const isToday = dateStr === today

          return (
            <div
              key={i}
              onDrop={(e) => handleDrop(e, date)}
              onDragOver={handleDragOver}
              className={`group relative min-h-[100px] rounded-lg border p-1 transition ${
                isCurrentMonth
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-white/5 bg-transparent opacity-40'
              } ${isToday ? 'ring-1 ring-violet-500/50' : ''} ${
                draggedPost ? 'hover:border-violet-500/40' : ''
              }`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? 'rounded bg-violet-600 px-1.5 text-white' : 'text-white/50'
                  }`}
                >
                  {date.getDate()}
                </span>
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
                  return (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onEditPost(post)}
                      className="cursor-pointer rounded px-1 py-0.5 text-[10px] transition hover:scale-[1.02]"
                      style={{
                        background: `${campaign?.color ?? platform.color}22`,
                        borderLeft: `2px solid ${campaign?.color ?? platform.color}`,
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
                      </div>
                    </div>
                  )
                })}
                {dayPosts.length > 3 && (
                  <div className="px-1 text-[9px] text-white/40">
                    +{dayPosts.length - 3} more
                  </div>
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
        <span className="ml-4 text-white/40">Tip: drag posts to reschedule</span>
      </div>
    </div>
  )
}
