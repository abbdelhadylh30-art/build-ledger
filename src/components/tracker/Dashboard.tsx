'use client'

import { useMemo, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { FolderKanban, Sparkles, Trophy, Briefcase, Megaphone, Eye, MousePointerClick, Calendar as CalendarIcon, Target, Flag, MessageSquare, Users, TrendingUp, CalendarClock } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useProjectsStore, selectStats } from '@/store/projects-store'
import { useMarketingStore, selectMarketingStats } from '@/store/marketing-store'
import { useClientsStore, selectClientStats } from '@/store/clients-store'
import { STORAGE_LOCATIONS, CLIENT_STATUSES, getLocationMeta, getStatusMeta } from '@/lib/projects'
import { PLATFORMS, getCampaignStatusMeta, getPlatformMeta, getPostStatusMeta, toCalendarDate } from '@/lib/marketing'
import { CLIENT_STAGES, getStageMeta, formatValue, isWon, isLost } from '@/lib/clients'
import { timeAgo } from '@/lib/time'
import { SEED_PROJECTS } from '@/lib/seed-projects'
import { SEED_CAMPAIGNS, SEED_POSTS } from '@/lib/seed-marketing'
import { SEED_CLIENTS } from '@/lib/seed-clients'
import { Button } from '@/components/ui/button'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  accent: string
  delay: number
}

// Animated counter — counts up from 0 to numeric values over ~800ms.
// String values (like "3/4" or "—") render unchanged. Uses framer-motion's
// motion-value + animate, which is an external-system update (NOT setState),
// so it doesn't trigger the react-hooks/set-state-in-effect lint rule.
function AnimatedCounter({ value, className }: { value: number | string; className?: string }) {
  const isNumeric = typeof value === 'number'
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => (isNumeric ? Math.round(v).toLocaleString() : String(value)))
  useEffect(() => {
    if (!isNumeric) return
    const controls = animate(mv, value as number, { duration: 0.8, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, isNumeric, mv])
  return <motion.span className={className}>{display}</motion.span>
}

function StatCard({ icon, label, value, accent, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -3, scale: 1.015 }}
      className="group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors duration-200 hover:border-white/20"
    >
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
        <AnimatedCounter value={value} className="block text-3xl font-bold tabular-nums text-white" />
        <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">
          {label}
        </div>
      </div>
    </motion.div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  delay: number
}

function ChartCard({ title, children, delay }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors duration-200 hover:border-white/20"
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
        <span className="h-1 w-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

export function Dashboard() {
  const projects = useProjectsStore((s) => s.projects)
  const campaigns = useMarketingStore((s) => s.campaigns)
  const posts = useMarketingStore((s) => s.posts)
  const clients = useClientsStore((s) => s.clients)
  const seedIfEmpty = useProjectsStore((s) => s.seedIfEmpty)
  const seedMarketingIfEmpty = useMarketingStore((s) => s.seedIfEmpty)
  const seedClientsIfEmpty = useClientsStore((s) => s.seedIfEmpty)

  const handleRestoreSamples = () => {
    seedIfEmpty(SEED_PROJECTS)
    seedMarketingIfEmpty(SEED_CAMPAIGNS, SEED_POSTS)
    seedClientsIfEmpty(SEED_CLIENTS)
  }

  const stats = useMemo(() => selectStats(projects), [projects])
  const mStats = useMemo(() => selectMarketingStats(campaigns, posts), [campaigns, posts])
  const cStats = useMemo(() => selectClientStats(clients), [clients])

  const aiData = useMemo(() => {
    return Object.entries(stats.byAi)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [stats])

  const storageData = useMemo(() => {
    return STORAGE_LOCATIONS.map((s) => ({
      name: s.label,
      value: stats.byStorage[s.value],
      color: s.color,
    })).filter((d) => d.value > 0)
  }, [stats])

  const statusData = useMemo(() => {
    return CLIENT_STATUSES.map((s) => ({
      name: s.label,
      value: stats.byStatus[s.value],
      color: s.color,
    }))
  }, [stats])

  // Marketing charts
  const platformData = useMemo(() => {
    return PLATFORMS.map((p) => ({
      name: p.label,
      shortName: p.icon,
      value: mStats.byPlatform[p.value] || 0,
      color: p.color,
    })).filter((d) => d.value > 0)
  }, [mStats])

  const goalData = useMemo(() => {
    return mStats.goalProgress
      .filter((g) => g.target > 0)
      .map((g) => ({
        name: g.name,
        current: g.current,
        target: g.target,
        pct: g.pct,
        rawPct: g.rawPct,
        color: g.color,
        met: g.met,
        unit: g.unit,
        typeLabel: g.typeLabel,
      }))
  }, [mStats])

  const hasProjects = projects.length > 0
  const hasMarketing = campaigns.length > 0 || posts.length > 0
  const hasClients = clients.length > 0

  // Client pipeline funnel data (all 6 stages, in canonical order)
  const clientPipeline = useMemo(() => {
    return CLIENT_STAGES.map((s) => ({
      name: s.label,
      value: cStats.byStage[s.value],
      color: s.color,
      terminal: !!s.terminal,
    }))
  }, [cStats])

  // Recent activity: merged timeline of projects / clients / campaigns / posts by updatedAt
  const recentActivity = useMemo(() => {
    type Activity = {
      id: string
      kind: 'project' | 'client' | 'campaign' | 'post'
      name: string
      sub: string
      iso: string
      color: string
    }
    const items: Activity[] = []
    for (const p of projects) {
      items.push({
        id: p.id,
        kind: 'project',
        name: p.name,
        sub: `Project · ${getStatusMeta(p.clientStatus).label}`,
        iso: p.updatedAt,
        color: '#8b5cf6',
      })
    }
    for (const c of clients) {
      const stage = getStageMeta(c.stage).label
      items.push({
        id: c.id,
        kind: 'client',
        name: c.name,
        sub: `Client · ${stage}${c.company ? ' · ' + c.company : ''}`,
        iso: c.updatedAt,
        color: c.color,
      })
    }
    for (const c of campaigns) {
      items.push({
        id: c.id,
        kind: 'campaign',
        name: c.name,
        sub: `Campaign · ${getCampaignStatusMeta(c.status).label}`,
        iso: c.updatedAt,
        color: c.color,
      })
    }
    for (const p of posts) {
      const pm = getPlatformMeta(p.platform)
      items.push({
        id: p.id,
        kind: 'post',
        name: p.title,
        sub: `Post · ${pm.label} · ${getPostStatusMeta(p.status).label}`,
        iso: p.updatedAt,
        color: pm.color,
      })
    }
    return items
      .sort((a, b) => new Date(b.iso).getTime() - new Date(a.iso).getTime())
      .slice(0, 8)
  }, [projects, clients, campaigns, posts])

  // Upcoming: posts scheduled in the next 7 days, grouped by day
  const upcomingWeek = useMemo(() => {
    const campaignColor = new Map(campaigns.map((c) => [c.id, c.color]))
    const days: {
      date: Date
      key: string
      posts: { id: string; title: string; platformColor: string; platformLabel: string; time: string; campaignColor?: string }[]
    }[] = []
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      days.push({
        date: d,
        key: toCalendarDate(d.toISOString()),
        posts: [],
      })
    }
    const byKey = new Map(days.map((d) => [d.key, d]))
    for (const p of posts) {
      if (!p.scheduledDate) continue
      const key = toCalendarDate(p.scheduledDate)
      const day = byKey.get(key)
      if (!day) continue
      const pm = getPlatformMeta(p.platform)
      day.posts.push({
        id: p.id,
        title: p.title,
        platformColor: pm.color,
        platformLabel: pm.label,
        time: new Date(p.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        campaignColor: p.campaignId ? campaignColor.get(p.campaignId) : undefined,
      })
    }
    return days
  }, [posts, campaigns])

  const upcomingCount = upcomingWeek.reduce((n, d) => n + d.posts.length, 0)

  if (!hasProjects && !hasMarketing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-3xl"
        >
          📊
        </motion.div>
        <div className="text-base font-medium text-white/80">No data yet</div>
        <div className="mt-1 text-sm text-white/50">
          Add projects and campaigns to see your dashboard
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={handleRestoreSamples}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40 active:scale-95"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Restore sample data
          </Button>
          <span className="text-[11px] text-white/30">
            or press <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">n</kbd> to create your first item
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent p-5 backdrop-blur sm:p-6"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {(() => {
                const hr = new Date().getHours()
                return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
              })()}, builder
            </h2>
            <p className="mt-0.5 text-sm text-white/60">
              You have{' '}
              <span className="font-semibold text-violet-300">{stats.total} projects</span>
              {', '}
              <span className="font-semibold text-fuchsia-300">{campaigns.length} campaigns</span>
              {', and '}
              <span className="font-semibold text-emerald-300">{mStats.scheduledPosts} scheduled posts</span>.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60">
            <Sparkles className="h-3 w-3 text-violet-300" />
            <span>{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {/* Project stat cards */}
      {hasProjects && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<FolderKanban className="h-5 w-5" />} label="Total projects" value={stats.total} accent="#8b5cf6" delay={0} />
          <StatCard icon={<Sparkles className="h-5 w-5" />} label="In portfolio" value={stats.inPortfolio} accent="#10b981" delay={0.06} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Delivered" value={stats.delivered} accent="#f59e0b" delay={0.12} />
          <StatCard icon={<Briefcase className="h-5 w-5" />} label="For clients" value={stats.forClients} accent="#06b6d4" delay={0.18} />
        </div>
      )}

      {/* Marketing stat cards */}
      {hasMarketing && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Megaphone className="h-5 w-5" />} label="Active campaigns" value={mStats.activeCampaigns} accent="#ec4899" delay={0.24} />
          <StatCard icon={<CalendarIcon className="h-5 w-5" />} label="Scheduled posts" value={mStats.scheduledPosts} accent="#6366f1" delay={0.3} />
          <StatCard icon={<Eye className="h-5 w-5" />} label="Total impressions" value={mStats.totalImpressions.toLocaleString()} accent="#06b6d4" delay={0.36} />
          <StatCard icon={<MousePointerClick className="h-5 w-5" />} label="Total clicks" value={mStats.totalClicks.toLocaleString()} accent="#f59e0b" delay={0.42} />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label={mStats.goalsTracked > 0 ? `Goals met (${mStats.goalsMet}/${mStats.goalsTracked})` : 'Goals met'}
            value={mStats.successRate !== null ? `${mStats.successRate}%` : '—'}
            accent="#10b981"
            delay={0.48}
          />
        </div>
      )}

      {/* Client / prospect stat cards */}
      {hasClients && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Active prospects" value={cStats.total - cStats.won - cStats.lost} accent="#8b5cf6" delay={0.3} />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Pipeline value" value={formatValue(cStats.pipelineValue)} accent="#06b6d4" delay={0.36} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Won" value={`${cStats.won}${cStats.winRate !== null ? ` · ${cStats.winRate}%` : ''}`} accent="#10b981" delay={0.42} />
          <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Follow-ups due" value={cStats.followUpsDue} accent="#f59e0b" delay={0.48} />
        </div>
      )}

      {/* Upcoming this week — scheduled posts agenda */}
      {hasMarketing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors duration-200 hover:border-white/20"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
              <span className="h-1 w-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              Upcoming this week
            </h3>
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
              {upcomingCount} scheduled
            </span>
          </div>
          {upcomingCount === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">
              Nothing scheduled in the next 7 days — plan something on the Calendar.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-7">
              {upcomingWeek.map((d, di) => {
                const isToday = di === 0
                const dayName = d.date.toLocaleDateString([], { weekday: 'short' })
                const dayNum = d.date.getDate()
                return (
                  <div
                    key={d.key}
                    className={`flex w-36 shrink-0 flex-col gap-1.5 rounded-xl border p-2 sm:w-auto ${
                      isToday
                        ? 'border-violet-400/30 bg-violet-500/10'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between px-0.5">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          isToday ? 'text-violet-300' : 'text-white/40'
                        }`}
                      >
                        {dayName}
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isToday ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>
                    {d.posts.length === 0 ? (
                      <div className="flex h-10 items-center justify-center text-[10px] text-white/20">
                        —
                      </div>
                    ) : (
                      d.posts.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-lg bg-black/25 px-1.5 py-1 transition hover:bg-black/40"
                          title={`${p.title} · ${p.platformLabel} · ${p.time}`}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: p.platformColor }}
                            />
                            <span className="truncate text-[10px] font-medium text-white/80">
                              {p.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 pl-2.5 text-[9px] text-white/35">
                            <span className="tabular-nums">{p.time}</span>
                            {p.campaignColor && (
                              <span
                                className="inline-block h-1 w-1 rounded-full"
                                style={{ background: p.campaignColor }}
                                title="Campaign"
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Charts row 1: Projects */}
      {hasProjects && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="AI tools used" delay={0.48}>
            {aiData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">No AI tools tracked yet</div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aiData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} width={90} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Storage locations" delay={0.54}>
            {storageData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">No storage data yet</div>
            ) : (
              <>
                <div className="flex h-56 items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={storageData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={3} stroke="none">
                        {storageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {storageData.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                      {s.name} · {s.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>
      )}

      {/* Charts row 2: Marketing */}
      {hasMarketing && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Posts by platform */}
          <ChartCard title="Posts by platform" delay={0.6}>
            {platformData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">No posts yet</div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={11} width={90} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                      {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* Campaign goal progress */}
          <ChartCard title="Campaign goal progress" delay={0.66}>
            {goalData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">No campaign goals set</div>
            ) : (
              <div className="space-y-4">
                {goalData.map((g, i) => {
                  const remaining = Math.max(0, g.target - g.current)
                  const over = g.current - g.target
                  const fmt = (n: number) => n.toLocaleString()
                  const nextMilestone = [25, 50, 75, 100].find((m) => g.rawPct < m)
                  return (
                    <div key={i} className="group/goal">
                      {/* Header: name + type pill · numbers + pct chip */}
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ background: g.color, boxShadow: `0 0 6px ${g.color}80` }}
                          />
                          <span className="truncate text-xs font-medium text-white/80">{g.name}</span>
                          <span className="hidden shrink-0 rounded-full bg-white/5 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-white/40 sm:inline">
                            {g.typeLabel}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums">
                          <span className="font-semibold text-white/80">{fmt(g.current)}</span>
                          <span className="text-white/30">/ {fmt(g.target)} {g.unit}</span>
                          <span
                            className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
                              g.met
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {g.rawPct.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Track with milestone ticks */}
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
                        {/* 25/50/75% milestone ticks */}
                        {[25, 50, 75].map((m) => (
                          <div
                            key={m}
                            className="absolute inset-y-0 z-10 w-px bg-black/40"
                            style={{ left: `${m}%` }}
                            aria-hidden
                          />
                        ))}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${g.pct}%` }}
                          transition={{ duration: 0.7, delay: 0.7 + i * 0.06, ease: 'easeOut' }}
                          className="relative h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${g.color}cc, ${g.color})`,
                            boxShadow: g.met ? `0 0 10px ${g.color}70` : undefined,
                          }}
                        />
                      </div>

                      {/* Footer: met badge / remaining / overachievement */}
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        {g.met ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                            <Trophy className="h-3 w-3" />
                            Goal met
                            {over > 0 && (
                              <span className="font-normal text-emerald-300/60">
                                · +{fmt(over)} {g.unit} over target
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-white/40">
                            <Flag className="h-3 w-3" />
                            {fmt(remaining)} {g.unit} to go
                          </span>
                        )}
                        <span className="text-white/25 transition-opacity group-hover/goal:opacity-100 sm:opacity-0">
                          {nextMilestone
                            ? `next milestone ${nextMilestone}% · ${fmt(Math.ceil((g.target * nextMilestone) / 100))} ${g.unit}`
                            : 'all milestones cleared'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* Row 3: project status breakdown + client pipeline funnel + recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {hasProjects && (
          <ChartCard title="Project status breakdown" delay={0.72}>
            <div className="space-y-3">
              {statusData.map((s) => {
                const pct = stats.total > 0 ? (s.value / stats.total) * 100 : 0
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-xs font-medium text-white/70">{s.name}</div>
                    <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ background: s.color, opacity: 0.85 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white">
                        <span />
                        <span className={pct > 10 ? '' : 'text-white/60'}>
                          {s.value} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        )}

        {hasClients && (
          <ChartCard title="Client pipeline funnel" delay={0.74}>
            <div className="space-y-2.5">
              {clientPipeline.map((s) => {
                const max = Math.max(1, ...clientPipeline.map((x) => x.value))
                const pct = max > 0 ? (s.value / max) * 100 : 0
                const sharePct = cStats.total > 0 ? (s.value / cStats.total) * 100 : 0
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="w-20 shrink-0 text-xs font-medium text-white/70">{s.name}</div>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`absolute inset-y-0 left-0 rounded-lg ${s.terminal ? '' : ''}`}
                        style={{ background: s.color, opacity: s.terminal ? 0.55 : 0.9 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-medium text-white">
                        <span />
                        <span className={pct > 12 ? '' : 'text-white/60'}>
                          {s.value}{cStats.total > 0 ? ` · ${sharePct.toFixed(0)}%` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-white/45">
                <span>{cStats.won} won · {cStats.lost} lost{cStats.winRate !== null ? ` · ${cStats.winRate}% win rate` : ''}</span>
                <span className="tabular-nums">{formatValue(cStats.wonValue)} won · {formatValue(cStats.pipelineValue)} open</span>
              </div>
            </div>
          </ChartCard>
        )}

        {recentActivity.length > 0 && (
          <ChartCard title="Recent activity" delay={0.78}>
            <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
              {recentActivity.map((a, i) => {
                const Icon =
                  a.kind === 'project' ? FolderKanban
                  : a.kind === 'client' ? Briefcase
                  : a.kind === 'campaign' ? Megaphone
                  : MessageSquare
                return (
                  <motion.div
                    key={`${a.kind}-${a.id}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.78 + Math.min(i, 8) * 0.05, duration: 0.25 }}
                    className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${a.color}1f`, color: a.color }}
                      title={a.sub}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-white/85">{a.name}</div>
                      <div className="truncate text-[10px] text-white/40">{a.sub}</div>
                    </div>
                    <span className="shrink-0 text-[10px] tabular-nums text-white/35 transition group-hover:text-white/60">
                      {timeAgo(a.iso)}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
