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
import { FolderKanban, Sparkles, Trophy, Briefcase, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjectsStore, selectStats } from '@/store/projects-store'
import { STORAGE_LOCATIONS, CLIENT_STATUSES, getLocationMeta, getStatusMeta } from '@/lib/projects'

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
  const stats = useMemo(() => selectStats(projects), [projects])

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

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
        <div className="mb-3 text-4xl">📊</div>
        <div className="text-base font-medium text-white/80">No projects yet</div>
        <div className="mt-1 text-sm text-white/50">
          Click "New project" to add your first one
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<FolderKanban className="h-5 w-5" />}
          label="Total projects"
          value={stats.total}
          accent="#8b5cf6"
          delay={0}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="In portfolio"
          value={stats.inPortfolio}
          accent="#10b981"
          delay={0.06}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Delivered"
          value={stats.delivered}
          accent="#f59e0b"
          delay={0.12}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="For clients"
          value={stats.forClients}
          accent="#06b6d4"
          delay={0.18}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI breakdown */}
        <ChartCard title="AI tools used" delay={0.24}>
          {aiData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-white/40">
              No AI tools tracked yet
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'white',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Storage breakdown */}
        <ChartCard title="Storage locations" delay={0.3}>
          {storageData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-white/40">
              No storage data yet
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {storageData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'white',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {storageData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name} · {s.value}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Status breakdown - horizontal bars */}
      <ChartCard title="Project status breakdown" delay={0.36}>
        <div className="space-y-3">
          {statusData.map((s) => {
            const pct = stats.total > 0 ? (s.value / stats.total) * 100 : 0
            return (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-xs font-medium text-white/70">
                  {s.name}
                </div>
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

      {/* Recent activity */}
      <ChartCard title="Recently updated" delay={0.42}>
        <div className="space-y-2">
          {[...projects]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )
            .slice(0, 5)
            .map((p) => {
              const loc = getLocationMeta(p.storageLocation)
              const status = getStatusMeta(p.clientStatus)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-white/70">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{p.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-white/40">
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: loc.color }}
                      >
                        ● {loc.label}
                      </span>
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: status.color }}
                      >
                        ● {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
        </div>
      </ChartCard>
    </div>
  )
}
