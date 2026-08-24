'use client'

import { useMemo } from 'react'
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
import { FolderKanban, Sparkles, Trophy, Briefcase, Megaphone, Eye, MousePointerClick, Calendar as CalendarIcon, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjectsStore, selectStats } from '@/store/projects-store'
import { useMarketingStore, selectMarketingStats } from '@/store/marketing-store'
import { STORAGE_LOCATIONS, CLIENT_STATUSES, getLocationMeta, getStatusMeta } from '@/lib/projects'
import { PLATFORMS, getCampaignStatusMeta, getPlatformMeta } from '@/lib/marketing'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  accent: string
  delay: number
}

function StatCard({ icon, label, value, accent, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
        <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
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
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
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

  const stats = useMemo(() => selectStats(projects), [projects])
  const mStats = useMemo(() => selectMarketingStats(campaigns, posts), [campaigns, posts])

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
        name: g.name.length > 20 ? g.name.slice(0, 17) + '...' : g.name,
        current: g.current,
        target: g.target,
        pct: g.pct,
        color: g.color,
      }))
  }, [mStats])

  const hasProjects = projects.length > 0
  const hasMarketing = campaigns.length > 0 || posts.length > 0

  if (!hasProjects && !hasMarketing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
        <div className="mb-3 text-4xl">📊</div>
        <div className="text-base font-medium text-white/80">No data yet</div>
        <div className="mt-1 text-sm text-white/50">
          Add projects and campaigns to see your dashboard
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
              <div className="space-y-3">
                {goalData.map((g, i) => (
                  <div key={i}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/70">{g.name}</span>
                      <span className="text-white/50">{g.current} / {g.target} ({g.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.7 + i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: g.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* Project status breakdown */}
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
    </div>
  )
}
