'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PLATFORMS,
  POST_STATUSES,
  type Post,
  type Platform,
  type PostStatus,
} from '@/lib/marketing'

interface PostFormProps {
  onClose: () => void
  onSubmit: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  initial?: Post | null
  campaignOptions?: { id: string; name: string; color: string }[]
  defaultCampaignId?: string
  defaultDate?: string  // ISO — when adding from calendar
}

function buildInitial(initial?: Post | null, defaultCampaignId?: string, defaultDate?: string) {
  if (!initial) {
    return {
      campaignId: defaultCampaignId || '',
      platform: 'twitter' as Platform,
      title: '',
      content: '',
      status: 'idea' as PostStatus,
      scheduledDate: defaultDate || '',
      postedDate: '',
      postUrl: '',
      impressions: '',
      likes: '',
      comments: '',
      shares: '',
      clicks: '',
      notes: '',
    }
  }
  return {
    campaignId: initial.campaignId || '',
    platform: initial.platform,
    title: initial.title,
    content: initial.content,
    status: initial.status,
    scheduledDate: initial.scheduledDate ? initial.scheduledDate.split('T')[0] : '',
    postedDate: initial.postedDate ? initial.postedDate.split('T')[0] : '',
    postUrl: initial.postUrl || '',
    impressions: initial.metrics?.impressions?.toString() || '',
    likes: initial.metrics?.likes?.toString() || '',
    comments: initial.metrics?.comments?.toString() || '',
    shares: initial.metrics?.shares?.toString() || '',
    clicks: initial.metrics?.clicks?.toString() || '',
    notes: initial.notes || '',
  }
}

export function PostForm({
  onClose,
  onSubmit,
  onDelete,
  initial,
  campaignOptions = [],
  defaultCampaignId,
  defaultDate,
}: PostFormProps) {
  const [form, setForm] = useState(() => buildInitial(initial, defaultCampaignId, defaultDate))

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const metrics: Post['metrics'] = {}
    if (form.impressions) metrics.impressions = Number(form.impressions)
    if (form.likes) metrics.likes = Number(form.likes)
    if (form.comments) metrics.comments = Number(form.comments)
    if (form.shares) metrics.shares = Number(form.shares)
    if (form.clicks) metrics.clicks = Number(form.clicks)

    onSubmit({
      campaignId: form.campaignId || undefined,
      platform: form.platform,
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
      scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
      postedDate: form.postedDate ? new Date(form.postedDate).toISOString() : undefined,
      postUrl: form.postUrl.trim() || undefined,
      metrics: Object.keys(metrics).length > 0 ? metrics : undefined,
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  const isEdit = !!initial

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-slate-900 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit post' : 'New post'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-white/80">
              Title <span className="text-rose-400">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Launch thread — 3 apps in 4 days"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Platform + Status + Campaign */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-white/80">Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => update('platform', v as Platform)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update('status', v as PostStatus)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {POST_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Campaign</Label>
              <Select
                value={form.campaignId || 'none'}
                onValueChange={(v) => update('campaignId', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  <SelectItem value="none">Standalone (no campaign)</SelectItem>
                  {campaignOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label className="text-white/80">Content / summary</Label>
            <Textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="The actual post content or a summary..."
              rows={3}
              className="resize-none border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Dates + URL */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-white/80">Scheduled date</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => update('scheduledDate', e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Posted date</Label>
              <Input
                type="date"
                value={form.postedDate}
                onChange={(e) => update('postedDate', e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Post URL</Label>
              <Input
                value={form.postUrl}
                onChange={(e) => update('postUrl', e.target.value)}
                placeholder="https://..."
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Metrics (manual) */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <Label className="mb-3 block text-white/80">
              Engagement metrics <span className="text-white/40">(manual entry — leave blank if unknown)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div>
                <Input
                  type="number"
                  value={form.impressions}
                  onChange={(e) => update('impressions', e.target.value)}
                  placeholder="0"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Impressions</div>
              </div>
              <div>
                <Input
                  type="number"
                  value={form.likes}
                  onChange={(e) => update('likes', e.target.value)}
                  placeholder="0"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Likes</div>
              </div>
              <div>
                <Input
                  type="number"
                  value={form.comments}
                  onChange={(e) => update('comments', e.target.value)}
                  placeholder="0"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Comments</div>
              </div>
              <div>
                <Input
                  type="number"
                  value={form.shares}
                  onChange={(e) => update('shares', e.target.value)}
                  placeholder="0"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Shares</div>
              </div>
              <div>
                <Input
                  type="number"
                  value={form.clicks}
                  onChange={(e) => update('clicks', e.target.value)}
                  placeholder="0"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Clicks</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-white/80">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Reminders, follow-ups, what worked..."
              rows={2}
              className="resize-none border-white/10 bg-white/5 text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          {isEdit && onDelete ? (
            <Button
              variant="ghost"
              onClick={() => { onDelete(); onClose() }}
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
            >
              <Save className="mr-1 h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create post'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
