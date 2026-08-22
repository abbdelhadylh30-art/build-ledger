'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AI_OPTIONS,
  STORAGE_LOCATIONS,
  CLIENT_STATUSES,
  type Project,
  type StorageLocation,
  type ClientStatus,
} from '@/lib/projects'

interface ProjectFormProps {
  onClose: () => void
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  initial?: Project | null
}

function buildInitial(initial?: Project | null) {
  if (!initial) return {
    name: '',
    description: '',
    aiUsed: [] as string[],
    storageLocation: 'local' as StorageLocation,
    inPortfolio: false,
    clientStatus: 'personal' as ClientStatus,
    clientName: '',
    tags: [] as string[],
    repoUrl: '',
    liveUrl: '',
    notes: '',
  }
  return {
    name: initial.name,
    description: initial.description,
    aiUsed: initial.aiUsed,
    storageLocation: initial.storageLocation,
    inPortfolio: initial.inPortfolio,
    clientStatus: initial.clientStatus,
    clientName: initial.clientName ?? '',
    tags: initial.tags,
    repoUrl: initial.repoUrl ?? '',
    liveUrl: initial.liveUrl ?? '',
    notes: initial.notes ?? '',
  }
}

export function ProjectForm({ onClose, onSubmit, onDelete, initial }: ProjectFormProps) {
  // Lazy init from `initial` prop — parent remounts via `key` when switching
  const [form, setForm] = useState(() => buildInitial(initial))
  const [tagInput, setTagInput] = useState('')
  const [customAi, setCustomAi] = useState('')

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleAi = (ai: string) => {
    setForm((f) => ({
      ...f,
      aiUsed: f.aiUsed.includes(ai)
        ? f.aiUsed.filter((a) => a !== ai)
        : [...f.aiUsed, ai],
    }))
  }

  const addCustomAi = () => {
    const v = customAi.trim()
    if (v && !form.aiUsed.includes(v)) {
      update('aiUsed', [...form.aiUsed, v])
    }
    setCustomAi('')
  }

  const addTag = () => {
    const v = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (v && !form.tags.includes(v)) {
      update('tags', [...form.tags, v])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    update('tags', form.tags.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      aiUsed: form.aiUsed,
      storageLocation: form.storageLocation,
      inPortfolio: form.inPortfolio,
      clientStatus: form.clientStatus,
      clientName: form.clientName.trim() || undefined,
      tags: form.tags,
      repoUrl: form.repoUrl.trim() || undefined,
      liveUrl: form.liveUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  // Parent conditionally renders this component, so no need to check `open`

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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit project' : 'New project'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Project name <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Pulse Chat"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">
              Description
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What does it do? What was the goal?"
              rows={3}
              className="resize-none border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* AI used */}
          <div className="space-y-2">
            <Label className="text-white/80">AI tools used</Label>
            <div className="flex flex-wrap gap-1.5">
              {AI_OPTIONS.map((ai) => {
                const active = form.aiUsed.includes(ai)
                return (
                  <button
                    key={ai}
                    type="button"
                    onClick={() => toggleAi(ai)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      active
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                        : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {ai}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={customAi}
                onChange={(e) => setCustomAi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomAi()
                  }
                }}
                placeholder="Add custom AI tool..."
                className="border-white/10 bg-white/5 text-white"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomAi}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Storage + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Storage location</Label>
              <Select
                value={form.storageLocation}
                onValueChange={(v) => update('storageLocation', v as StorageLocation)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {STORAGE_LOCATIONS.map((s) => (
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
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Client status</Label>
              <Select
                value={form.clientStatus}
                onValueChange={(v) => update('clientStatus', v as ClientStatus)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {CLIENT_STATUSES.map((s) => (
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
            </div>
          </div>

          {/* Client name (conditional) */}
          {(form.clientStatus === 'client' || form.clientStatus === 'delivered') && (
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-white/80">
                Client name
              </Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => update('clientName', e.target.value)}
                placeholder="e.g. Acme Inc."
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          )}

          {/* URLs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repoUrl" className="text-white/80">
                Repo URL
              </Label>
              <Input
                id="repoUrl"
                value={form.repoUrl}
                onChange={(e) => update('repoUrl', e.target.value)}
                placeholder="https://github.com/..."
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="text-white/80">
                Live URL
              </Label>
              <Input
                id="liveUrl"
                value={form.liveUrl}
                onChange={(e) => update('liveUrl', e.target.value)}
                placeholder="https://..."
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-white/80">Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 bg-white/10 text-white/80"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 text-white/50 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {form.tags.length === 0 && (
                <span className="text-xs text-white/40">No tags yet</span>
              )}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Type a tag and press Enter..."
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white/80">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Anything to remember — gotchas, lessons, follow-ups..."
              rows={2}
              className="resize-none border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Portfolio toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">In portfolio</div>
              <div className="text-xs text-white/50">
                Show this on your public portfolio site
              </div>
            </div>
            <Switch
              checked={form.inPortfolio}
              onCheckedChange={(v) => update('inPortfolio', v)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          {isEdit && onDelete ? (
            <Button
              variant="ghost"
              onClick={() => {
                onDelete()
                onClose()
              }}
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
              disabled={!form.name.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40"
            >
              <Save className="mr-1 h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
