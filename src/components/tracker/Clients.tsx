'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Trophy,
  TrendingUp,
  CalendarClock,
  Inbox,
  Briefcase,
  ChevronRight,
} from 'lucide-react'
import {
  CLIENT_STAGES,
  LEAD_SOURCES,
  PIPELINE_STAGES,
  getStageMeta,
  getSourceMeta,
  formatValue,
  isWon,
  isLost,
  type Client,
  type LeadSource,
  type ClientStage,
} from '@/lib/clients'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { timeAgo } from '@/lib/time'

interface ClientsViewProps {
  clients: Client[]
  search: string
  onSearchChange: (v: string) => void
  filterSource: LeadSource | 'all'
  onFilterSourceChange: (v: LeadSource | 'all') => void
  onOpenClient: (c: Client) => void
  onNewClient: () => void
}

type SortKey = 'recent' | 'value-desc' | 'followup' | 'name'

export function ClientsView({
  clients,
  search,
  onSearchChange,
  filterSource,
  onFilterSourceChange,
  onOpenClient,
  onNewClient,
}: ClientsViewProps) {
  const [sort, setSort] = useState<SortKey>('recent')

  const filtered = useMemo(() => {
    const list = clients.filter((c) => {
      if (filterSource !== 'all' && c.source !== filterSource) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = [c.name, c.company ?? '', c.email ?? '', c.notes ?? '', ...c.communications.map((m) => m.outcome)]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorted = [...list]
    if (sort === 'recent') sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    else if (sort === 'value-desc') {
      sorted.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    } else if (sort === 'followup') {
      // soonest follow-up first; clients without a follow-up go last
      sorted.sort((a, b) => {
        const av = a.nextFollowUp ? new Date(a.nextFollowUp).getTime() : Infinity
        const bv = b.nextFollowUp ? new Date(b.nextFollowUp).getTime() : Infinity
        return av - bv
      })
    } else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [clients, search, filterSource, sort])

  // Bucket clients into pipeline columns + a Won/Lost pair
  const byStage = useMemo(() => {
    const map = new Map<ClientStage, Client[]>()
    for (const s of CLIENT_STAGES) map.set(s.value, [])
    for (const c of filtered) {
      map.get(c.stage)?.push(c)
    }
    return map
  }, [filtered])

  // Stat strip
  const stats = useMemo(() => {
    const inFlight = filtered.filter((c) => !isWon(c) && !isLost(c))
    const won = filtered.filter(isWon)
    const lost = filtered.filter(isLost)
    const closed = won.length + lost.length
    const winRate = closed > 0 ? Math.round((won.length / closed) * 100) : null
    const pipelineValue = inFlight.reduce((s, c) => s + (c.value ?? 0), 0)
    const wonValue = won.reduce((s, c) => s + (c.value ?? 0), 0)
    const todayMs = new Date().setHours(0, 0, 0, 0)
    const followUpsDue = inFlight.filter((c) => {
      if (!c.nextFollowUp) return false
      return new Date(c.nextFollowUp).setHours(0, 0, 0, 0) <= todayMs
    }).length
    return { total: filtered.length, inFlight: inFlight.length, won: won.length, lost: lost.length, winRate, pipelineValue, wonValue, followUpsDue }
  }, [filtered])

  return (
    <div className="space-y-4">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<Users className="h-4 w-4" />}
          label="Active prospects"
          value={stats.inFlight}
          accent="#8b5cf6"
          delay={0}
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Pipeline value"
          value={formatValue(stats.pipelineValue)}
          accent="#06b6d4"
          delay={0.05}
        />
        <StatTile
          icon={<Trophy className="h-4 w-4" />}
          label={stats.winRate == null ? 'No deals yet' : `Win rate · ${stats.won} won`}
          value={stats.winRate == null ? '—' : `${stats.winRate}%`}
          accent="#10b981"
          delay={0.1}
        />
        <StatTile
          icon={<CalendarClock className="h-4 w-4" />}
          label="Follow-ups due"
          value={stats.followUpsDue}
          accent="#f59e0b"
          delay={0.15}
          highlight={stats.followUpsDue > 0}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            id="client-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients, companies, outcomes… (/)"
            className="border-white/10 bg-white/5 pl-9 text-white"
          />
        </div>
        <Select
          value={filterSource}
          onValueChange={(v) => onFilterSourceChange(v as LeadSource | 'all')}
        >
          <SelectTrigger className="w-[150px] border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            <SelectItem value="all">All sources</SelectItem>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[150px] border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="value-desc">Value (high → low)</SelectItem>
            <SelectItem value="followup">Follow-up soonest</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Inbox className="h-5 w-5 text-white/40" />
          </div>
          <p className="text-sm font-medium text-white/70">
            {clients.length === 0 ? 'No clients tracked yet' : 'No clients match your filters'}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {clients.length === 0
              ? 'Add a prospect to start tracking from first contact to landed deal.'
              : 'Try clearing the search or source filter.'}
          </p>
          {clients.length === 0 && (
            <button
              onClick={onNewClient}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-violet-500/30 transition hover:shadow-lg"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Add your first prospect
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Pipeline board — horizontal columns */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stageVal) => (
              <PipelineColumn
                key={stageVal}
                stage={stageVal}
                clients={byStage.get(stageVal) ?? []}
                onOpenClient={onOpenClient}
              />
            ))}
          </div>

          {/* Won + Lost rows */}
          {(byStage.get('won')?.length || byStage.get('lost')?.length) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {byStage.get('won') && byStage.get('won')!.length > 0 && (
                <OutcomeColumn
                  stage="won"
                  clients={byStage.get('won')!}
                  onOpenClient={onOpenClient}
                />
              )}
              {byStage.get('lost') && byStage.get('lost')!.length > 0 && (
                <OutcomeColumn
                  stage="lost"
                  clients={byStage.get('lost')!}
                  onOpenClient={onOpenClient}
                />
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  accent,
  delay,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  accent: string
  delay: number
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-xl border bg-white/[0.03] p-3 transition-colors ${
        highlight ? 'border-amber-500/40' : 'border-white/10'
      }`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-1.5 text-xl font-bold tabular-nums text-white">
        {value}
      </div>
    </motion.div>
  )
}

function PipelineColumn({
  stage,
  clients,
  onOpenClient,
}: {
  stage: ClientStage
  clients: Client[]
  onOpenClient: (c: Client) => void
}) {
  const meta = getStageMeta(stage)
  const totalValue = clients.reduce((s, c) => s + (c.value ?? 0), 0)
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: meta.color }}
        />
        <span className="text-xs font-semibold text-white/80">{meta.label}</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums text-white/60">
          {clients.length}
        </span>
        {totalValue > 0 && (
          <span className="ml-auto text-[10px] tabular-nums text-white/40">
            {formatValue(totalValue)}
          </span>
        )}
      </div>
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-2">
        {clients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-white/30">
            Empty
          </div>
        ) : (
          clients.map((c, i) => (
            <ClientCard
              key={c.id}
              client={c}
              index={i}
              onOpen={onOpenClient}
            />
          ))
        )}
      </div>
    </div>
  )
}

function OutcomeColumn({
  stage,
  clients,
  onOpenClient,
}: {
  stage: 'won' | 'lost'
  clients: Client[]
  onOpenClient: (c: Client) => void
}) {
  const meta = getStageMeta(stage)
  const totalValue = clients.reduce((s, c) => s + (c.value ?? 0), 0)
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
        {stage === 'won' ? (
          <Trophy className="h-3.5 w-3.5" style={{ color: meta.color }} />
        ) : null}
        <span className="text-xs font-semibold text-white/80">{meta.label}</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums text-white/60">
          {clients.length}
        </span>
        {totalValue > 0 && (
          <span className="ml-auto text-[10px] tabular-nums text-white/40">
            {formatValue(totalValue)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 p-2 sm:flex-nowrap sm:overflow-x-auto">
        {clients.map((c, i) => (
          <ClientCard
            key={c.id}
            client={c}
            index={i}
            onOpen={onOpenClient}
            compact
          />
        ))}
      </div>
    </div>
  )
}

function ClientCard({
  client,
  index,
  onOpen,
  compact,
}: {
  client: Client
  index: number
  onOpen: (c: Client) => void
  compact?: boolean
}) {
  const source = getSourceMeta(client.source)
  const todayMs = new Date().setHours(0, 0, 0, 0)
  const followUpOverdue =
    client.nextFollowUp &&
    !isWon(client) &&
    !isLost(client) &&
    new Date(client.nextFollowUp).setHours(0, 0, 0, 0) <= todayMs
  const delay = Math.min(index * 0.04, 0.3)

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(client)}
      className={`group relative flex w-full flex-col gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-left transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 ${
        compact ? 'min-w-[200px] flex-shrink-0' : ''
      }`}
      style={{ borderLeftColor: client.color, borderLeftWidth: 3 }}
    >
      {/* accent glow */}
      <div
        className="pointer-events-none absolute -left-1 -top-1 h-10 w-10 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: client.color }}
      />
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
          style={{ background: client.color }}
          aria-hidden
        >
          {client.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white/90">
            {client.name}
          </div>
          {client.company && (
            <div className="truncate text-[11px] text-white/40">
              {client.company}
            </div>
          )}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
      </div>

      {/* meta row */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-white/45">
        <span
          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px font-medium"
          style={{ background: `${source.color}1f`, color: source.color }}
          title={`Source: ${source.label}`}
        >
          {source.label}
        </span>
        {client.value != null && (
          <span className="rounded-full bg-white/5 px-1.5 py-px font-medium tabular-nums text-white/60">
            {formatValue(client.value, client.currency)}
          </span>
        )}
        {client.communications.length > 0 && (
          <span className="rounded-full bg-white/5 px-1.5 py-px tabular-nums text-white/50">
            {client.communications.length} touch{client.communications.length === 1 ? '' : 'es'}
          </span>
        )}
        {followUpOverdue && (
          <span className="rounded-full bg-rose-500/15 px-1.5 py-px font-medium text-rose-300">
            follow-up due
          </span>
        )}
        {isWon(client) && client.projectId && (
          <span className="rounded-full bg-violet-500/15 px-1.5 py-px font-medium text-violet-300">
            project linked
          </span>
        )}
      </div>

      {!compact && client.lastContactDate && (
        <div className="text-[10px] text-white/30">
          Last contact {timeAgo(client.lastContactDate)}
        </div>
      )}
    </motion.button>
  )
}
