'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  LayoutDashboard,
  FolderKanban,
  Megaphone,
  Calendar as CalendarIcon,
  Activity as ActivityIcon,
  MessageSquare,
  Briefcase,
  Download,
  type LucideIcon,
} from 'lucide-react'
import { getPlatformMeta, type Campaign, type Post } from '@/lib/marketing'
import { getStageMeta, type Client } from '@/lib/clients'
import type { Project } from '@/lib/projects'

export type PaletteTab = 'dashboard' | 'projects' | 'clients' | 'campaigns' | 'calendar' | 'activity'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  projects: Project[]
  campaigns: Campaign[]
  posts: Post[]
  clients: Client[]
  onNavigate: (tab: PaletteTab) => void
  onEditProject: (p: Project) => void
  onEditCampaign: (c: Campaign) => void
  onEditPost: (p: Post) => void
  onOpenClient: (c: Client) => void
  onNewProject: () => void
  onNewCampaign: () => void
  onNewPost: () => void
  onNewClient: () => void
  onExport: () => void
}

type Item = {
  id: string
  icon: LucideIcon
  color: string
  title: string
  sub: string
  group: 'Go to' | 'Create' | 'Projects' | 'Clients' | 'Campaigns' | 'Posts' | 'Data'
  action: () => void
}

const GROUP_ORDER: Item['group'][] = ['Go to', 'Create', 'Projects', 'Clients', 'Campaigns', 'Posts', 'Data']

export function CommandPalette({
  open,
  onClose,
  projects,
  campaigns,
  posts,
  clients,
  onNavigate,
  onEditProject,
  onEditCampaign,
  onEditPost,
  onOpenClient,
  onNewProject,
  onNewCampaign,
  onNewPost,
  onNewClient,
  onExport,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset on open: component is conditionally mounted, so initial state is
  // fresh every open — we only need to focus the input after mount.
  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [])

  const campaignById = useMemo(() => {
    const m = new Map<string, Campaign>()
    for (const c of campaigns) m.set(c.id, c)
    return m
  }, [campaigns])

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: 'go-dashboard', icon: LayoutDashboard, color: '#8b5cf6', title: 'Dashboard', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('dashboard') },
      { id: 'go-projects', icon: FolderKanban, color: '#a78bfa', title: 'Projects', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('projects') },
      { id: 'go-clients', icon: Briefcase, color: '#06b6d4', title: 'Clients', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('clients') },
      { id: 'go-campaigns', icon: Megaphone, color: '#ec4899', title: 'Campaigns', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('campaigns') },
      { id: 'go-calendar', icon: CalendarIcon, color: '#6366f1', title: 'Calendar', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('calendar') },
      { id: 'go-activity', icon: ActivityIcon, color: '#14b8a6', title: 'Activity', sub: 'Go to tab', group: 'Go to', action: () => onNavigate('activity') },
      { id: 'new-project', icon: Plus, color: '#10b981', title: 'New project', sub: 'Create', group: 'Create', action: onNewProject },
      { id: 'new-client', icon: Plus, color: '#06b6d4', title: 'New client', sub: 'Create', group: 'Create', action: onNewClient },
      { id: 'new-campaign', icon: Plus, color: '#06b6d4', title: 'New campaign', sub: 'Create', group: 'Create', action: onNewCampaign },
      { id: 'new-post', icon: Plus, color: '#f59e0b', title: 'New post', sub: 'Create', group: 'Create', action: onNewPost },
      { id: 'export', icon: Download, color: '#94a3b8', title: 'Export JSON backup', sub: 'Download all data', group: 'Data', action: onExport },
    ]

    const projItems: Item[] = projects.map((p) => ({
      id: `proj-${p.id}`,
      icon: FolderKanban,
      color: '#8b5cf6',
      title: p.name,
      sub: `Project — ${p.description?.slice(0, 60) || 'no description'}`,
      group: 'Projects',
      action: () => onEditProject(p),
    }))

    const clientItems: Item[] = clients.map((c) => {
      const stage = getStageMeta(c.stage)
      const sub = `Client — ${stage.label}${c.company ? ' · ' + c.company : ''}`
      return {
        id: `client-${c.id}`,
        icon: Briefcase,
        color: c.color,
        title: c.name,
        sub,
        group: 'Clients',
        action: () => onOpenClient(c),
      }
    })

    const campItems: Item[] = campaigns.map((c) => ({
      id: `camp-${c.id}`,
      icon: Megaphone,
      color: c.color,
      title: c.name,
      sub: `Campaign — ${c.description?.slice(0, 60) || 'no description'}`,
      group: 'Campaigns',
      action: () => onEditCampaign(c),
    }))

    const postItems: Item[] = posts.map((p) => {
      const pm = getPlatformMeta(p.platform)
      const camp = p.campaignId ? campaignById.get(p.campaignId) : undefined
      return {
        id: `post-${p.id}`,
        icon: MessageSquare,
        color: pm.color,
        title: p.title,
        sub: `Post — ${pm.label}${camp ? ` · ${camp.name}` : ' · standalone'}`,
        group: 'Posts',
        action: () => onEditPost(p),
      }
    })

    const q = query.trim().toLowerCase()
    const all = [...nav, ...projItems, ...clientItems, ...campItems, ...postItems]
    if (!q) return nav // empty query → quick actions only
    return all.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.sub.toLowerCase().includes(q)
    )
  }, [query, projects, campaigns, posts, clients, campaignById, onNavigate, onNewProject, onNewCampaign, onNewPost, onNewClient, onExport, onEditProject, onEditCampaign, onEditPost, onOpenClient])

  // Safe active index (clamped when the result list shrinks)
  const safeIdx = items.length === 0 ? 0 : Math.min(activeIdx, items.length - 1)

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${safeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [safeIdx])

  if (!open) return null

  const run = (it: Item) => {
    onClose()
    it.action()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(items.length === 0 ? 0 : (safeIdx + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(items.length === 0 ? 0 : (safeIdx - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = items[safeIdx]
      if (it) run(it)
    }
  }

  // Group items for rendering
  let runningIdx = -1
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: items.filter((it) => it.group === g),
  })).filter((g) => g.items.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -12, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -12, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-violet-500/10"
        role="dialog"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIdx(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search projects, campaigns, posts… or jump anywhere"
            className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            aria-label="Command palette search"
          />
          <kbd className="hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/40 sm:block">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/40">
              No results for “{query.trim()}”
            </div>
          ) : (
            grouped.map(({ group, items: gItems }) => (
              <div key={group} className="mb-1">
                <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {group}
                </div>
                {gItems.map((it) => {
                  runningIdx += 1
                  const idx = runningIdx
                  const Icon = it.icon
                  const active = idx === safeIdx
                  return (
                    <button
                      key={it.id}
                      data-idx={idx}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => run(it)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        active ? 'bg-violet-600/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${it.color}1f`, color: it.color }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white/90">
                          {it.title}
                        </span>
                        <span className="block truncate text-[11px] text-white/40">
                          {it.sub}
                        </span>
                      </span>
                      {active && (
                        <span className="hidden shrink-0 items-center gap-1 text-[10px] text-white/35 sm:flex">
                          <CornerDownLeft className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] text-white/35">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" />
            navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            select
          </span>
          <span className="ml-auto hidden sm:block">
            {items.length} result{items.length === 1 ? '' : 's'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
