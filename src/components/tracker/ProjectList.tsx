'use client'

import { Search, ExternalLink, Github, Pencil, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getLocationMeta,
  getStatusMeta,
  STORAGE_LOCATIONS,
  CLIENT_STATUSES,
  type Project,
  type StorageLocation,
  type ClientStatus,
} from '@/lib/projects'

interface ProjectListProps {
  projects: Project[]
  search: string
  onSearchChange: (v: string) => void
  filterStorage: StorageLocation | 'all'
  onFilterStorageChange: (v: StorageLocation | 'all') => void
  filterStatus: ClientStatus | 'all'
  onFilterStatusChange: (v: ClientStatus | 'all') => void
  filterPortfolio: 'all' | 'in' | 'out'
  onFilterPortfolioChange: (v: 'all' | 'in' | 'out') => void
  onEdit: (p: Project) => void
  onTogglePortfolio: (id: string) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function ProjectList({
  projects,
  search,
  onSearchChange,
  filterStorage,
  onFilterStorageChange,
  filterStatus,
  onFilterStatusChange,
  filterPortfolio,
  onFilterPortfolioChange,
  onEdit,
  onTogglePortfolio,
}: ProjectListProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, tags, AI tools..."
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterStorage}
            onValueChange={(v) => onFilterStorageChange(v as StorageLocation | 'all')}
          >
            <SelectTrigger className="w-[140px] border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Storage" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="all">All storage</SelectItem>
              {STORAGE_LOCATIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(v) => onFilterStatusChange(v as ClientStatus | 'all')}
          >
            <SelectTrigger className="w-[150px] border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="all">All statuses</SelectItem>
              {CLIENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterPortfolio}
            onValueChange={(v) => onFilterPortfolioChange(v as 'all' | 'in' | 'out')}
          >
            <SelectTrigger className="w-[130px] border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Portfolio" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="all">All projects</SelectItem>
              <SelectItem value="in">In portfolio</SelectItem>
              <SelectItem value="out">Not in portfolio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      <div className="text-xs text-white/50">
        Showing {projects.length} project{projects.length === 1 ? '' : 's'}
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <div className="text-base font-medium text-white/80">No matches</div>
          <div className="mt-1 text-sm text-white/50">
            Try adjusting your filters or search
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => {
            const loc = getLocationMeta(p.storageLocation)
            const status = getStatusMeta(p.clientStatus)
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                {/* Header */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{p.name}</h3>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
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
                  <button
                    onClick={() => onTogglePortfolio(p.id)}
                    className={`rounded-lg p-1.5 transition ${
                      p.inPortfolio
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-white/30 hover:bg-white/10 hover:text-white/60'
                    }`}
                    aria-label={p.inPortfolio ? 'Remove from portfolio' : 'Add to portfolio'}
                    title={p.inPortfolio ? 'In portfolio' : 'Not in portfolio'}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={p.inPortfolio ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Description */}
                <p className="mb-3 line-clamp-2 text-xs text-white/60">
                  {p.description || 'No description'}
                </p>

                {/* AI tools */}
                {p.aiUsed.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {p.aiUsed.map((ai) => (
                      <Badge
                        key={ai}
                        variant="secondary"
                        className="bg-violet-500/15 text-violet-300"
                      >
                        {ai}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {p.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                      >
                        #{tag}
                      </span>
                    ))}
                    {p.tags.length > 4 && (
                      <span className="text-[10px] text-white/40">
                        +{p.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="text-[11px] text-white/40">
                    Updated {timeAgo(p.updatedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label="Repository"
                      >
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label="Live site"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
