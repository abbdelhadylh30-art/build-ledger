'use client'

import { useMemo, useState, type ReactNode, type KeyboardEvent } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Github,
  ExternalLink,
  Star,
  StickyNote,
  ChevronDown,
  Megaphone,
  Pencil,
  Target,
  Calendar,
  X,
} from 'lucide-react'
import { Markdown } from './Markdown'
import { getLocationMeta, getStatusMeta, type Project } from '@/lib/projects'
import {
  getCampaignStatusMeta,
  getPlatformMeta,
  getPostStatusMeta,
  isGoalMet,
  type Campaign,
  type Post,
} from '@/lib/marketing'
import { timeAgo } from '@/lib/time'

interface ProjectDetailDrawerProps {
  project: Project | null
  campaigns: Campaign[]
  posts: Post[]
  onClose: () => void
  onEdit: (p: Project) => void
  onEditCampaign: (c: Campaign) => void
  onEditPost: (p: Post) => void
}

/**
 * Slide-over panel that opens when a project is selected in the Projects tab.
 * Shows full project details + linked campaigns + recent posts from those
 * campaigns. Matches the dark tracker theme (bg-slate-950, violet accents).
 */
export function ProjectDetailDrawer({
  project,
  campaigns,
  posts,
  onClose,
  onEdit,
  onEditCampaign,
  onEditPost,
}: ProjectDetailDrawerProps) {
  const linkedCampaigns = useMemo<Campaign[]>(() => {
    if (!project) return []
    return campaigns.filter((c) => c.linkedProjectIds.includes(project.id))
  }, [campaigns, project])

  const recentPosts = useMemo<Post[]>(() => {
    if (linkedCampaigns.length === 0) return []
    const linkedIds = new Set(linkedCampaigns.map((c) => c.id))
    return posts
      .filter((p) => p.campaignId != null && linkedIds.has(p.campaignId))
      .sort((a, b) => {
        const aT = a.postedDate || a.scheduledDate || a.updatedAt
        const bT = b.postedDate || b.scheduledDate || b.updatedAt
        return new Date(bT).getTime() - new Date(aT).getTime()
      })
      .slice(0, 5)
  }, [posts, linkedCampaigns])

  return (
    <Sheet open={!!project} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 border-white/10 bg-slate-950 p-0 sm:max-w-xl"
      >
        {project && (
          <DrawerBody
            key={project.id}
            project={project}
            posts={posts}
            linkedCampaigns={linkedCampaigns}
            recentPosts={recentPosts}
            onClose={onClose}
            onEdit={onEdit}
            onEditCampaign={onEditCampaign}
            onEditPost={onEditPost}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface DrawerBodyProps {
  project: Project
  posts: Post[]
  linkedCampaigns: Campaign[]
  recentPosts: Post[]
  onClose: () => void
  onEdit: (p: Project) => void
  onEditCampaign: (c: Campaign) => void
  onEditPost: (p: Post) => void
}

function DrawerBody({
  project,
  posts,
  linkedCampaigns,
  recentPosts,
  onClose,
  onEdit,
  onEditCampaign,
  onEditPost,
}: DrawerBodyProps) {
  // Notes default-open when notes exist (the section only renders when notes
  // are non-empty, so a starting value of true matches "default-open").
  const [notesOpen, setNotesOpen] = useState(true)

  const loc = getLocationMeta(project.storageLocation)
  const status = getStatusMeta(project.clientStatus)
  const hasNotes = project.notes != null && project.notes.trim().length > 0
  const hasLinks = !!project.repoUrl || !!project.liveUrl

  const handleRowKey =
    (fn: () => void) =>
    (e: KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        fn()
      }
    }

  return (
    <>
      {/* Header */}
      <SheetHeader className="gap-3 border-b border-white/10 p-5 pr-14">
        <div className="flex items-start gap-2">
          <SheetTitle className="flex-1 text-xl font-semibold leading-tight text-white">
            {project.name}
          </SheetTitle>
          {project.inPortfolio && (
            <span
              className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400"
              title="In portfolio"
            >
              <Star className="h-3 w-3" fill="currentColor" />
              Portfolio
            </span>
          )}
        </div>

        <SheetDescription className="sr-only">
          Project details, metadata, linked campaigns, and recent posts for{' '}
          {project.name}.
        </SheetDescription>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ background: `${status.color}22`, color: status.color }}
            title="Client status"
          >
            ● {status.label}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ background: `${loc.color}22`, color: loc.color }}
            title="Storage location"
          >
            ● {loc.label}
          </span>
          <span className="ml-auto text-white/40">
            Updated {timeAgo(project.updatedAt)}
          </span>
        </div>
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Description (full text, not clamped) */}
        {project.description.trim().length > 0 && (
          <section>
            <SectionLabel>Description</SectionLabel>
            <p className="text-sm leading-relaxed text-white/75">
              {project.description}
            </p>
          </section>
        )}

        {/* Meta grid (2 cols) */}
        <section>
          <SectionLabel>Details</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetaCell label="AI tools used">
              {project.aiUsed.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {project.aiUsed.map((ai) => (
                    <Badge
                      key={ai}
                      variant="secondary"
                      className="bg-violet-500/15 text-violet-300"
                    >
                      {ai}
                    </Badge>
                  ))}
                </div>
              ) : (
                <EmptyValue>None</EmptyValue>
              )}
            </MetaCell>

            <MetaCell label="Tags">
              {project.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-white/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyValue>No tags</EmptyValue>
              )}
            </MetaCell>

            <MetaCell label="Client">
              {project.clientName ? (
                <span className="text-sm text-white/80">{project.clientName}</span>
              ) : (
                <EmptyValue>—</EmptyValue>
              )}
            </MetaCell>

            <MetaCell label="Links">
              {hasLinks ? (
                <div className="flex flex-wrap items-center gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Repo
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live
                    </a>
                  )}
                </div>
              ) : (
                <EmptyValue>No links</EmptyValue>
              )}
            </MetaCell>
          </div>
        </section>

        {/* Notes — collapsible markdown, default-open */}
        {hasNotes && (
          <section>
            <button
              type="button"
              onClick={() => setNotesOpen((o) => !o)}
              aria-expanded={notesOpen}
              className="flex w-full items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/60 transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <StickyNote className="h-3 w-3 shrink-0 text-violet-400/80" />
              Notes
              <ChevronDown
                className={`ml-auto h-3 w-3 shrink-0 transition-transform duration-200 ${
                  notesOpen ? 'rotate-180 text-violet-300' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border-l-2 border-violet-400/40 bg-black/25 px-3 py-2.5">
                    <Markdown>{project.notes ?? ''}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Linked campaigns */}
        <section>
          <SectionLabel>
            <Megaphone className="h-3 w-3" />
            Linked campaigns
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/60">
              {linkedCampaigns.length}
            </span>
          </SectionLabel>

          {linkedCampaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center text-xs text-white/40">
              No campaigns linked to this project yet
            </div>
          ) : (
            <div className="space-y-2">
              {linkedCampaigns.map((c, i) => {
                const cs = getCampaignStatusMeta(c.status)
                const cPosts = posts.filter((p) => p.campaignId === c.id)
                const goalMet = isGoalMet(c)
                const pct =
                  c.goalTarget > 0
                    ? Math.min(100, (c.goalCurrent / c.goalTarget) * 100)
                    : 0
                const delay = Math.min(i * 0.04, 0.3)
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay, duration: 0.25 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onEditCampaign(c)}
                      onKeyDown={handleRowKey(() => onEditCampaign(c))}
                      aria-label={`Edit campaign: ${c.name}`}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:border-violet-400/40 focus-visible:bg-white/10 focus-visible:outline-none"
                    >
                      <div
                        className="h-10 w-1 shrink-0 rounded-full"
                        style={{ background: c.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">
                          {c.name}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-white/50">
                          <span className="flex items-center gap-1">
                            <Megaphone className="h-3 w-3" />
                            {cPosts.length} post{cPosts.length === 1 ? '' : 's'}
                          </span>
                          {c.goalTarget > 0 && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {c.goalCurrent.toLocaleString()} /{' '}
                              {c.goalTarget.toLocaleString()}
                              {goalMet && (
                                <span className="ml-0.5 text-emerald-400">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                        {c.goalTarget > 0 && (
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: goalMet ? '#10b981' : c.color,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: `${cs.color}22`, color: cs.color }}
                      >
                        {cs.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent posts from those campaigns */}
        {recentPosts.length > 0 && (
          <section>
            <SectionLabel>
              <Calendar className="h-3 w-3" />
              Recent posts
            </SectionLabel>
            <div className="space-y-1.5">
              {recentPosts.map((p, i) => {
                const platform = getPlatformMeta(p.platform)
                const ps = getPostStatusMeta(p.status)
                const dateRef = p.postedDate || p.scheduledDate || p.updatedAt
                const delay = Math.min(i * 0.04, 0.3)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay, duration: 0.25 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onEditPost(p)}
                      onKeyDown={handleRowKey(() => onEditPost(p))}
                      aria-label={`Edit post: ${p.title}`}
                      className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:border-violet-400/40 focus-visible:bg-white/10 focus-visible:outline-none"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ background: platform.color }}
                        aria-hidden
                      >
                        {platform.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-white/90">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {platform.label} · {timeAgo(dateRef)}
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: `${ps.color}22`, color: ps.color }}
                        title={`Status: ${ps.label}`}
                      >
                        {ps.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex items-center justify-end gap-2 border-t border-white/10 bg-slate-950 p-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="mr-1 h-4 w-4" />
          Close
        </Button>
        <Button
          onClick={() => onEdit(project)}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit project
        </Button>
      </div>
    </>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
      {children}
    </h4>
  )
}

function MetaCell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      {children}
    </div>
  )
}

function EmptyValue({ children }: { children: ReactNode }) {
  return <span className="text-xs italic text-white/30">{children}</span>
}
