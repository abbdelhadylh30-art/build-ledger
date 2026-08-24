'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, ExternalLink, Target, Calendar as CalendarIcon, MessageSquare, CheckCircle2 } from 'lucide-react'
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
  isGoalMet,
  type Campaign,
  type Post,
  type CampaignStatus,
} from '@/lib/marketing'

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
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns..."
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mb-3 text-4xl">📣</div>
          <div className="text-base font-medium text-white/80">No campaigns yet</div>
          <div className="mt-1 text-sm text-white/50">
            Create your first campaign to start tracking marketing efforts
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign, i) => {
            const status = getCampaignStatusMeta(campaign.status)
            const goal = getGoalTypeMeta(campaign.goalType)
            const campaignPosts = getPostsForCampaign(campaign.id)
            const pct = campaign.goalTarget > 0 ? Math.min(100, (campaign.goalCurrent / campaign.goalTarget) * 100) : 0
            const goalMet = isGoalMet(campaign)

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
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
                        {campaignPosts.length} post{campaignPosts.length === 1 ? '' : 's'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {campaign.goalCurrent} / {campaign.goalTarget} {goal.unit}
                      </span>
                    </div>

                    {/* Goal progress bar */}
                    {campaign.goalTarget > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: goalMet ? '#10b981' : campaign.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Posts in this campaign */}
                {campaignPosts.length > 0 && (
                  <div className="border-t border-white/5 bg-white/[0.02] p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Posts in this campaign
                    </div>
                    <div className="space-y-1">
                      {campaignPosts.map((post) => (
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

                {campaignPosts.length === 0 && (
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
          })}
        </div>
      )}

      {/* Standalone posts */}
      {standalonePosts.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              Standalone posts <span className="text-white/30">({standalonePosts.length})</span>
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
          <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-3">
            {standalonePosts.map((post) => (
              <PostRow key={post.id} post={post} onEdit={() => onEditPost(post)} />
            ))}
          </div>
        </div>
      )}

      {campaigns.length === 0 && standalonePosts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <Button
            onClick={() => onNewPost()}
            variant="ghost"
            className="text-white/60 hover:bg-white/5 hover:text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            Or add a standalone post (no campaign)
          </Button>
        </div>
      )}
    </div>
  )
}

function PostRow({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const platform = getPlatformMeta(post.platform)
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
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
          {post.scheduledDate && <span>· {formatDate(post.scheduledDate)}</span>}
          {post.metrics?.impressions !== undefined && (
            <span>· {post.metrics.impressions} views</span>
          )}
        </div>
      </div>
      {post.postUrl && (
        <a
          href={post.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="Open post"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <button
        onClick={onEdit}
        className="rounded p-1 text-white/40 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label="Edit post"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}
