'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderKanban, Megaphone, Activity as ActivityIcon, Inbox, Briefcase } from 'lucide-react'
import { useProjectsStore } from '@/store/projects-store'
import { useMarketingStore } from '@/store/marketing-store'
import { useClientsStore } from '@/store/clients-store'
import { getLocationMeta, getStatusMeta, type Project } from '@/lib/projects'
import {
  getPlatformMeta,
  getCampaignStatusMeta,
  getPostStatusMeta,
  type Campaign,
  type Post,
} from '@/lib/marketing'
import { getStageMeta, type Client } from '@/lib/clients'
import { timeAgo } from '@/lib/time'

type ActivityEvent =
  | { kind: 'project'; ts: string; project: Project }
  | { kind: 'client'; ts: string; client: Client }
  | { kind: 'campaign'; ts: string; campaign: Campaign }
  | { kind: 'post'; ts: string; post: Post }

type FilterKind = 'all' | 'project' | 'client' | 'campaign' | 'post'

interface ActivityTimelineProps {
  onOpenProject: (p: Project) => void
  onOpenClient: (c: Client) => void
  onOpenCampaign: (c: Campaign) => void
  onOpenPost: (p: Post) => void
}

const DAY_MS = 24 * 60 * 60 * 1000

function bucketFor(ts: string, nowMs: number): 'today' | 'week' | 'earlier' {
  const diff = nowMs - new Date(ts).getTime()
  if (diff < DAY_MS) return 'today'
  if (diff < 7 * DAY_MS) return 'week'
  return 'earlier'
}

function projectSubtitle(p: Project): string {
  const status = getStatusMeta(p.clientStatus).label
  const location = getLocationMeta(p.storageLocation).label
  const tail = p.inPortfolio ? ' · in portfolio' : ''
  return `${status} · ${location}${tail}`
}

function campaignSubtitle(c: Campaign): string {
  const status = getCampaignStatusMeta(c.status).label
  if (c.goalTarget > 0) {
    const pct = Math.min(100, Math.round((c.goalCurrent / c.goalTarget) * 100))
    return `${status} · ${c.goalCurrent} / ${c.goalTarget} · ${pct}%`
  }
  return `${status} · no target set`
}

function clientSubtitle(c: Client): string {
  const stage = getStageMeta(c.stage).label
  const touches = c.communications.length
  const touchLabel = touches === 0 ? 'no touches yet' : `${touches} touch${touches === 1 ? '' : 'es'}`
  return `${stage}${c.company ? ' · ' + c.company : ''} · ${touchLabel}`
}

function postSubtitle(p: Post, campaignName: string | undefined): string {
  const platform = getPlatformMeta(p.platform).label
  const status = getPostStatusMeta(p.status).label
  const owner = campaignName ?? 'standalone'
  return `${platform} · ${status} · ${owner}`
}

export function ActivityTimeline({
  onOpenProject,
  onOpenClient,
  onOpenCampaign,
  onOpenPost,
}: ActivityTimelineProps) {
  const projects = useProjectsStore((s) => s.projects)
  const campaigns = useMarketingStore((s) => s.campaigns)
  const posts = useMarketingStore((s) => s.posts)
  const clients = useClientsStore((s) => s.clients)

  const [filter, setFilter] = useState<FilterKind>('all')

  const events = useMemo<ActivityEvent[]>(() => {
    const all: ActivityEvent[] = [
      ...projects.map((p) => ({ kind: 'project' as const, ts: p.updatedAt, project: p })),
      ...clients.map((c) => ({ kind: 'client' as const, ts: c.updatedAt, client: c })),
      ...campaigns.map((c) => ({ kind: 'campaign' as const, ts: c.updatedAt, campaign: c })),
      ...posts.map((p) => ({ kind: 'post' as const, ts: p.updatedAt, post: p })),
    ]
    all.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0))
    return all
  }, [projects, clients, campaigns, posts])

  const counts = useMemo(
    () => ({
      all: events.length,
      project: projects.length,
      client: clients.length,
      campaign: campaigns.length,
      post: posts.length,
    }),
    [events.length, projects.length, clients.length, campaigns.length, posts.length],
  )

  const filtered = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.kind === filter)),
    [events, filter],
  )

  const buckets = useMemo(() => {
    const nowMs = Date.now()
    const today: ActivityEvent[] = []
    const week: ActivityEvent[] = []
    const earlier: ActivityEvent[] = []
    for (const e of filtered) {
      const b = bucketFor(e.ts, nowMs)
      if (b === 'today') today.push(e)
      else if (b === 'week') week.push(e)
      else earlier.push(e)
    }
    return { today, week, earlier }
  }, [filtered])

  const filters: { id: FilterKind; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'project', label: 'Projects', count: counts.project },
    { id: 'client', label: 'Clients', count: counts.client },
    { id: 'campaign', label: 'Campaigns', count: counts.campaign },
    { id: 'post', label: 'Posts', count: counts.post },
  ]

  const isEmpty = filtered.length === 0

  return (
    <div className="space-y-1">
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
        <ActivityIcon className="h-4 w-4 text-violet-400" />
        <span>Activity timeline</span>
      </div>

      {/* Filter chip row */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={
                active
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-medium text-white shadow-md shadow-violet-500/30 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950'
              }
            >
              {f.label}
              <span
                className={
                  active
                    ? 'rounded-full bg-white/20 px-1.5 text-[10px] tabular-nums text-white'
                    : 'rounded-full bg-white/10 px-1.5 text-[10px] tabular-nums text-white/70'
                }
              >
                {f.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Inbox className="h-5 w-5 text-white/40" />
          </div>
          <p className="text-sm font-medium text-white/70">No activity yet</p>
          <p className="mt-1 text-xs text-white/40">
            Create or edit projects, campaigns, or posts to see them here.
          </p>
        </div>
      ) : (
        <>
          <Bucket
            label="Today"
            events={buckets.today}
            startIndex={0}
            campaigns={campaigns}
            onOpenProject={onOpenProject}
            onOpenClient={onOpenClient}
            onOpenCampaign={onOpenCampaign}
            onOpenPost={onOpenPost}
          />
          <Bucket
            label="This week"
            events={buckets.week}
            startIndex={buckets.today.length}
            campaigns={campaigns}
            onOpenProject={onOpenProject}
            onOpenClient={onOpenClient}
            onOpenCampaign={onOpenCampaign}
            onOpenPost={onOpenPost}
          />
          <Bucket
            label="Earlier"
            events={buckets.earlier}
            startIndex={buckets.today.length + buckets.week.length}
            campaigns={campaigns}
            onOpenProject={onOpenProject}
            onOpenClient={onOpenClient}
            onOpenCampaign={onOpenCampaign}
            onOpenPost={onOpenPost}
          />
        </>
      )}
    </div>
  )
}

interface BucketProps {
  label: string
  events: ActivityEvent[]
  startIndex: number
  campaigns: Campaign[]
  onOpenProject: (p: Project) => void
  onOpenClient: (c: Client) => void
  onOpenCampaign: (c: Campaign) => void
  onOpenPost: (p: Post) => void
}

function Bucket({
  label,
  events,
  startIndex,
  campaigns,
  onOpenProject,
  onOpenClient,
  onOpenCampaign,
  onOpenPost,
}: BucketProps) {
  if (events.length === 0) return null
  return (
    <section className="space-y-1">
      <h3 className="mb-2 mt-6 text-xs uppercase tracking-wider text-white/40">{label}</h3>
      {events.map((e, i) => (
        <EventRow
          key={`${e.kind}-${e.ts}-${i}`}
          event={e}
          index={startIndex + i}
          campaigns={campaigns}
          onOpenProject={onOpenProject}
          onOpenClient={onOpenClient}
          onOpenCampaign={onOpenCampaign}
          onOpenPost={onOpenPost}
        />
      ))}
    </section>
  )
}

interface EventRowProps {
  event: ActivityEvent
  index: number
  campaigns: Campaign[]
  onOpenProject: (p: Project) => void
  onOpenClient: (c: Client) => void
  onOpenCampaign: (c: Campaign) => void
  onOpenPost: (p: Post) => void
}

function EventRow({
  event,
  index,
  campaigns,
  onOpenProject,
  onOpenClient,
  onOpenCampaign,
  onOpenPost,
}: EventRowProps) {
  const delay = Math.min(index, 10) * 0.03

  if (event.kind === 'project') {
    const p = event.project
    return (
      <RowShell
        delay={delay}
        iconBg="#8b5cf622"
        iconColor="#8b5cf6"
        iconEl={<FolderKanban className="h-4 w-4" />}
        title={p.name}
        subtitle={projectSubtitle(p)}
        ariaLabel={`Open project: ${p.name}`}
        ts={event.ts}
        onClick={() => onOpenProject(p)}
      />
    )
  }

  if (event.kind === 'client') {
    const c = event.client
    return (
      <RowShell
        delay={delay}
        iconBg={`${c.color}22`}
        iconColor={c.color}
        iconEl={<Briefcase className="h-4 w-4" />}
        title={c.name}
        subtitle={clientSubtitle(c)}
        ariaLabel={`Open client: ${c.name}`}
        ts={event.ts}
        onClick={() => onOpenClient(c)}
      />
    )
  }

  if (event.kind === 'campaign') {
    const c = event.campaign
    return (
      <RowShell
        delay={delay}
        iconBg={`${c.color}22`}
        iconColor={c.color}
        iconEl={<Megaphone className="h-4 w-4" />}
        title={c.name}
        subtitle={campaignSubtitle(c)}
        ariaLabel={`Open campaign: ${c.name}`}
        ts={event.ts}
        onClick={() => onOpenCampaign(c)}
      />
    )
  }

  const p = event.post
  const platform = getPlatformMeta(p.platform)
  const campaignName = p.campaignId
    ? campaigns.find((c) => c.id === p.campaignId)?.name
    : undefined
  return (
    <RowShell
      delay={delay}
      iconBg={`${platform.color}22`}
      iconColor={platform.color}
      iconEl={<span className="text-[11px] font-bold">{platform.icon}</span>}
      title={p.title}
      subtitle={postSubtitle(p, campaignName)}
      ariaLabel={`Open post: ${p.title}`}
      ts={event.ts}
      onClick={() => onOpenPost(p)}
    />
  )
}

interface RowShellProps {
  delay: number
  iconBg: string
  iconColor: string
  iconEl: React.ReactNode
  title: string
  subtitle: string
  ariaLabel: string
  ts: string
  onClick: () => void
}

function RowShell({
  delay,
  iconBg,
  iconColor,
  iconEl,
  title,
  subtitle,
  ariaLabel,
  ts,
  onClick,
}: RowShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ x: 2 }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg, color: iconColor }}
      >
        {iconEl}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/90">{title}</p>
        <p className="truncate text-xs text-white/50">{subtitle}</p>
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-white/40">{timeAgo(ts)}</span>
    </motion.div>
  )
}
