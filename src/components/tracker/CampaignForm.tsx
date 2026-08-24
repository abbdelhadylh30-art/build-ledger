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
  CAMPAIGN_STATUSES,
  GOAL_TYPES,
  CAMPAIGN_COLORS,
  type Campaign,
  type CampaignStatus,
  type GoalType,
} from '@/lib/marketing'

interface CampaignFormProps {
  onClose: () => void
  onSubmit: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  initial?: Campaign | null
  linkedProjectOptions?: { id: string; name: string }[]
}

function buildInitial(initial?: Campaign | null) {
  if (!initial) {
    return {
      name: '',
      description: '',
      status: 'idea' as CampaignStatus,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      goalType: 'clicks' as GoalType,
      goalTarget: 1000,
      goalCurrent: 0,
      linkedProjectIds: [] as string[],
      notes: '',
      color: CAMPAIGN_COLORS[0],
    }
  }
  return {
    name: initial.name,
    description: initial.description,
    status: initial.status,
    startDate: initial.startDate.split('T')[0],
    endDate: initial.endDate ? initial.endDate.split('T')[0] : '',
    goalType: initial.goalType,
    goalTarget: initial.goalTarget,
    goalCurrent: initial.goalCurrent,
    linkedProjectIds: initial.linkedProjectIds,
    notes: initial.notes ?? '',
    color: initial.color,
  }
}

export function CampaignForm({
  onClose,
  onSubmit,
  onDelete,
  initial,
  linkedProjectOptions = [],
}: CampaignFormProps) {
  const [form, setForm] = useState(() => buildInitial(initial))

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleProject = (id: string) => {
    setForm((f) => ({
      ...f,
      linkedProjectIds: f.linkedProjectIds.includes(id)
        ? f.linkedProjectIds.filter((p) => p !== id)
        : [...f.linkedProjectIds, id],
    }))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      goalType: form.goalType,
      goalTarget: Number(form.goalTarget) || 0,
      goalCurrent: Number(form.goalCurrent) || 0,
      linkedProjectIds: form.linkedProjectIds,
      notes: form.notes.trim() || undefined,
      color: form.color,
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
            {isEdit ? 'Edit campaign' : 'New campaign'}
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
          {/* Name + color */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-white/80">
                Campaign name <span className="text-rose-400">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Stackmint Launch Week"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Color</Label>
              <div className="flex h-10 flex-wrap gap-1">
                {CAMPAIGN_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('color', c)}
                    className={`h-8 w-8 rounded-full transition ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-white/80">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What's this campaign about?"
              rows={2}
              className="resize-none border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Status + dates */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-white/80">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update('status', v as CampaignStatus)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {CAMPAIGN_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">End date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Goal */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <Label className="mb-3 block text-white/80">Campaign goal</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                value={form.goalType}
                onValueChange={(v) => update('goalType', v as GoalType)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {GOAL_TYPES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Input
                  type="number"
                  value={form.goalTarget}
                  onChange={(e) => update('goalTarget', Number(e.target.value))}
                  placeholder="Target"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Target</div>
              </div>
              <div>
                <Input
                  type="number"
                  value={form.goalCurrent}
                  onChange={(e) => update('goalCurrent', Number(e.target.value))}
                  placeholder="Current"
                  className="border-white/10 bg-white/5 text-white"
                />
                <div className="mt-1 text-[10px] text-white/40">Current progress</div>
              </div>
            </div>
            {form.goalTarget > 0 && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-white/50">
                  <span>Progress</span>
                  <span>{form.goalCurrent} / {form.goalTarget} ({((form.goalCurrent / form.goalTarget) * 100).toFixed(0)}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (form.goalCurrent / form.goalTarget) * 100)}%`,
                      background: form.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Linked projects */}
          {linkedProjectOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white/80">Linked projects</Label>
              <div className="flex flex-wrap gap-1.5">
                {linkedProjectOptions.map((p) => {
                  const active = form.linkedProjectIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProject(p.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        active
                          ? 'bg-violet-600 text-white'
                          : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-white/80">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Strategy, reminders, follow-ups..."
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
              disabled={!form.name.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
            >
              <Save className="mr-1 h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create campaign'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
