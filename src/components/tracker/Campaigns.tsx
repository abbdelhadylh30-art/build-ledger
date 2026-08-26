'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Pencil, ExternalLink, Target, Calendar as CalendarIcon, Megaphone, MessageSquare, CheckCircle2, StickyNote, ChevronDown, Eye, ThumbsUp, MessageCircle, Share2, MousePointerClick } from 'lucide-react'
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
  PLATFORMS,
  CAMPAIGN_STATUSES,
  getCampaignStatusMeta,
  getPlatformMeta,
  getGoalTypeMeta,
  formatDate,
  getPostStatusMeta,
  isGoalMet,
  type Campaign,
  type Post,
  type CampaignStatus,
} from '@/lib/marketing'
import { Markdown } from './Markdown'
import { EmptyState } from './EmptyState'

interface CampaignsViewProps {
  campaigns: Campaign[]
  posts: Post[]
  search: string
  onSearchChange: (v: string) => void
  filterStatus: CampaignStatus | 'all'
  onFilterStatusChange: (v: CampaignStatus | 'all') => void
  onNewCampaign: () => void
  onEditCampaign: (c: Campaign) => void
  onNewPost: (campaignId?: string) => void
  onEditPost: (p: Post) => void
}

export function CampaignsView({
  campaigns,
  posts,
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onNewCampaign,
  onEditCampaign,
  onNewPost,
  onEditPost,
}: CampaignsViewProps) {
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = [c.name, c.description, c.notes ?? ''].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [campaigns, search, filterStatus])

  const standalonePosts = useMemo(() => {
    return posts.filter((p) => !p.campaignId)
  }, [posts])

  const getPostsForCampaign = (campaignId: string) =>
    posts.filter((p) => p.campaignId === campaignId)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="campaign-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns...  ( / )"
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) => onFilterStatusChange(v as CampaignStatus | 'all')}
        >
          <SelectTrigger className="w-[160px] border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            <SelectItem value="all">All statuses</SelectItem>
            {CAMPAIGN_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={onNewCampaign}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
        >
          <Plus className="mr-1 h-4 w-4" />
          New campaign
        </Button>
      </div>

      {/* Campaigns list */}
      {filteredCampaigns.length === 0 ? (
        campaigns.length === 0 ? (
          <EmptyState
            variant="dashed"
            icon={<Megaphone className="h-6 w-6" />}
            title="No campaigns yet"
            description="Create your first campaign to start tracking marketing efforts across platforms."
            action={{ label: 'New campaign', onClick: onNewCampaign }}
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No matches"
            description="No campaigns match your current search or status filter. Try adjusting them."
          />
        )
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign, i) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              posts={getPostsForCampaign(campaign.id)}
              index={i}
              onEditCampaign={onEditCampaign}
              onNewPost={onNewPost}
              onEditPost={onEditPost}
            />
          ))}
        </div>
      )}

      {/* Standalone posts */}
      {standalonePosts.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
              Standalone posts
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                {standalonePosts.length}
              </span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNewPost()}
              className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            >
              <Plus className="mr-1 h-3 w-3" />
              New post
            </Button>
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-3">
            {standalonePosts.map((post) => (
              <PostRow key={post.id} post={post} onEdit={() => onEditPost(post)} />
            ))}
          </div>
        </div>
      )}

      {campaigns.length === 0 && standalonePosts.length === 0 && (
        <EmptyState
          variant="dashed"
          icon={<Plus className="h-6 w-6" />}
          title="Or add a standalone post"
          description="No campaign needed — track one-off posts like engagement comments or random thoughts."
          action={{ label: 'Add standalone post', onClick: () => onNewPost() }}
        />
      )}
    </div>
  )
}

interface CampaignCardProps {
  campaign: Campaign
  posts: Post[]
  index: number
  onEditCampaign: (c: Campaign) => void
  onNewPost: (campaignId?: string) => void
  onEditPost: (p: Post) => void
}

function CampaignCard({ campaign, posts, index, onEditCampaign, onNewPost, onEditPost }: CampaignCardProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const status = getCampaignStatusMeta(campaign.status)
  const goal = getGoalTypeMeta(campaign.goalType)
  const pct = campaign.goalTarget > 0 ? Math.min(100, (campaign.goalCurrent / campaign.goalTarget) * 100) : 0
  const goalMet = isGoalMet(campaign)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07]"
    >
      {/* Campaign header */}
      <div className="flex items-start gap-3 p-4">
        {/* Color stripe */}
        <div
          className="mt-1 h-12 w-1 shrink-0 rounded-full"
          style={{ background: campaign.color }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">{campaign.name}</h3>
              {campaign.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{campaign.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {goalMet && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
                  title="Goal target reached"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Goal met
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: `${status.color}22`, color: status.color }}
              >
                {status.label}
              </span>
              <button
                onClick={() => onEditCampaign(campaign)}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Edit campaign"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDate(campaign.startDate)}
              {campaign.endDate && ` → ${formatDate(campaign.endDate)}`}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {posts.length} post{posts.length === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {campaign.goalCurrent.toLocaleString()} / {campaign.goalTarget.toLocaleString()} {goal.unit}
            </span>
          </div>

          {/* Goal progress bar */}
          {campaign.goalTarget > 0 && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: goalMet
                      ? 'linear-gradient(to right, #10b981, #34d399)'
                      : `linear-gradient(to right, ${campaign.color}, ${campaign.color}cc)`,
                    boxShadow: `0 0 12px ${goalMet ? '#10b98166' : `${campaign.color}55`}`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Notes — collapsible markdown */}
          {campaign.notes?.trim() && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setNotesOpen((o) => !o)}
                aria-expanded={notesOpen}
                className="flex w-full items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/50 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80"
              >
                <StickyNote className="h-3 w-3 shrink-0" style={{ color: campaign.color }} />
                Notes
                <ChevronDown
                  className={`ml-auto h-3 w-3 shrink-0 transition-transform duration-200 ${
                    notesOpen ? 'rotate-180' : ''
                  }`}
                  style={notesOpen ? { color: campaign.color } : undefined}
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
                    <div
                      className="mt-2 max-h-64 overflow-y-auto rounded-lg border-l-2 bg-black/25 px-3 py-2.5"
                      style={{ borderColor: `${campaign.color}66` }}
                    >
                      <Markdown>{campaign.notes}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Posts in this campaign */}
      {posts.length > 0 && (
        <div className="border-t border-white/5 bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Posts in this campaign
            </span>
            {posts.length > 5 && (
              <span className="text-[10px] text-white/30">
                {posts.length} total
              </span>
            )}
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} onEdit={() => onEditPost(post)} />
            ))}
          </div>
          <button
            onClick={() => onNewPost(campaign.id)}
            className="mt-2 w-full rounded-lg border border-dashed border-white/10 py-1.5 text-[11px] text-white/40 transition hover:border-white/20 hover:text-white/60"
          >
            + Add post to this campaign
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => onNewPost(campaign.id)}
            className="w-full rounded-lg border border-dashed border-white/10 py-1.5 text-[11px] text-white/40 transition hover:border-white/20 hover:text-white/60"
          >
            + Add first post to this campaign
          </button>
        </div>
      )}
    </motion.div>
  )
}

function PostRow({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const platform = getPlatformMeta(post.platform)
  const status = getPostStatusMeta(post.status)

  const metricItems = useMemo(() => {
    const m = post.metrics
    if (!m) return []
    const items: { icon: typeof Eye; label: string; value: number; color: string }[] = []
    if (m.impressions !== undefined) items.push({ icon: Eye, label: 'Impressions', value: m.impressions, color: '#06b6d4' })
    if (m.likes !== undefined) items.push({ icon: ThumbsUp, label: 'Likes', value: m.likes, color: '#ec4899' })
    if (m.comments !== undefined) items.push({ icon: MessageCircle, label: 'Comments', value: m.comments, color: '#8b5cf6' })
    if (m.shares !== undefined) items.push({ icon: Share2, label: 'Shares', value: m.shares, color: '#10b981' })
    if (m.clicks !== undefined) items.push({ icon: MousePointerClick, label: 'Clicks', value: m.clicks, color: '#f59e0b' })
    return items
  }, [post.metrics])

  const hasDetails = !!(post.content?.trim() || post.notes?.trim() || metricItems.length > 0)

  return (
    <div className="rounded-lg transition hover:bg-white/5">
      <div
        className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
        onClick={() => hasDetails && setExpanded((e) => !e)}
        role={hasDetails ? 'button' : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
        title={hasDetails ? (expanded ? 'Collapse' : 'Click to preview content') : undefined}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
          style={{ background: platform.color }}
        >
          {platform.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-white/90">{post.title}</div>
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span>{platform.label}</span>
            {post.scheduledDate && (
              <span className="rounded-full bg-white/5 px-1.5 py-px text-white/45">
                {formatDate(post.scheduledDate)}
              </span>
            )}
            {post.metrics?.impressions !== undefined && (
              <span className="rounded-full bg-white/5 px-1.5 py-px text-white/45">
                {post.metrics.impressions.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
        {hasDetails && (
          <ChevronDown
            className={`h-3 w-3 shrink-0 text-white/30 transition-transform duration-200 ${
              expanded ? 'rotate-180 text-violet-300' : ''
            }`}
          />
        )}
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
          style={{ background: `${status.color}22`, color: status.color }}
          title={`Status: ${status.label}`}
        >
          {status.label}
        </span>
        {post.postUrl && (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Open post"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="rounded p-1 text-white/40 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
          aria-label="Edit post"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>

      {/* Expandable preview: content + metrics + notes */}
      <AnimatePresence initial={false}>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mx-2 mb-1.5 space-y-2.5 rounded-lg border-l-2 border-violet-400/40 bg-black/25 px-3 py-2.5">
              {post.content?.trim() && (
                <div className="max-h-48 overflow-y-auto text-xs">
                  <Markdown>{post.content}</Markdown>
                </div>
              )}
              {metricItems.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {metricItems.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5"
                      title={m.label}
                    >
                      <m.icon className="h-3 w-3 shrink-0" style={{ color: m.color }} />
                      <span className="text-[11px] font-semibold tabular-nums text-white/85">
                        {m.value.toLocaleString()}
                      </span>
                      <span className="truncate text-[9px] text-white/35">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {post.notes?.trim() && (
                <div className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2">
                  <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-white/30">
                    <StickyNote className="h-2.5 w-2.5" />
                    Notes
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs">
                    <Markdown>{post.notes}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
