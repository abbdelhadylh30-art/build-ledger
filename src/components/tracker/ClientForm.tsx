'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Briefcase, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from './DeleteButton'
import { MarkdownNotesEditor } from './MarkdownNotesEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CLIENT_STAGES,
  LEAD_SOURCES,
  CURRENCIES,
  CLIENT_COLORS,
  getStageMeta,
  getSourceMeta,
  type Client,
  type ClientStage,
  type LeadSource,
} from '@/lib/clients'

export interface ProjectOption {
  id: string
  name: string
  clientName?: string
}

interface ClientFormProps {
  onClose: () => void
  onSubmit: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  initial?: Client | null
  projectOptions: ProjectOption[]
}

function buildInitial(initial?: Client | null) {
  if (!initial) {
    return {
      name: '',
      company: '',
      email: '',
      phone: '',
      source: 'cold-outreach' as LeadSource,
      stage: 'prospect' as ClientStage,
      value: '' as string,
      currency: 'USD',
      projectId: undefined as string | undefined,
      lastContactDate: undefined as string | undefined,
      nextFollowUp: '',
      communications: [] as Client['communications'],
      notes: '',
      color: CLIENT_COLORS[0],
    }
  }
  return {
    name: initial.name,
    company: initial.company ?? '',
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    source: initial.source,
    stage: initial.stage,
    value: initial.value != null ? String(initial.value) : '',
    currency: initial.currency,
    projectId: initial.projectId,
    lastContactDate: initial.lastContactDate,
    nextFollowUp: initial.nextFollowUp ? initial.nextFollowUp.split('T')[0] : '',
    communications: initial.communications,
    notes: initial.notes ?? '',
    color: initial.color,
  }
}

export function ClientForm({ onClose, onSubmit, onDelete, initial, projectOptions }: ClientFormProps) {
  // Lazy init from `initial` prop — parent remounts via `key` when switching
  const [form, setForm] = useState(() => buildInitial(initial))
  const [colorIdx, setColorIdx] = useState(() => {
    if (initial) {
      const idx = CLIENT_COLORS.indexOf(initial.color)
      return idx >= 0 ? idx : 0
    }
    return 0
  })

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const cycleColor = () => {
    const next = (colorIdx + 1) % CLIENT_COLORS.length
    setColorIdx(next)
    update('color', CLIENT_COLORS[next])
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const valueNum = form.value.trim() === '' ? undefined : Number(form.value)
    onSubmit({
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      source: form.source,
      stage: form.stage,
      value: valueNum != null && !Number.isNaN(valueNum) ? valueNum : undefined,
      currency: form.currency,
      projectId: form.projectId,
      lastContactDate: form.lastContactDate,
      nextFollowUp: form.nextFollowUp
        ? new Date(form.nextFollowUp + 'T10:00:00.000Z').toISOString()
        : undefined,
      communications: form.communications,
      notes: form.notes.trim() || undefined,
      color: form.color,
    })
    onClose()
  }

  const isEdit = !!initial
  const stage = getStageMeta(form.stage)
  const source = getSourceMeta(form.source)
  const linkedProject = form.projectId
    ? projectOptions.find((p) => p.id === form.projectId)
    : undefined

  // When stage = 'won', surface the project-link field prominently
  const showProjectLink = form.stage === 'won' || form.stage === 'proposal'

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
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={cycleColor}
              title="Click to change accent color"
              className="flex h-7 w-7 items-center justify-center rounded-lg shadow-md transition-transform hover:scale-110"
              style={{ background: form.color, boxShadow: `0 4px 14px ${form.color}55` }}
            >
              <Briefcase className="h-3.5 w-3.5 text-white" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {isEdit ? 'Edit client' : 'New client'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Name + Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Contact name <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/80">
                Company
              </Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                placeholder="e.g. Northwind Labs"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="sarah@company.com"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 555 0100"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Source + Stage */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Lead source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => update('source', v as LeadSource)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
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
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Pipeline stage</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => update('stage', v as ClientStage)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {CLIENT_STAGES.map((s) => (
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

          {/* Value + Currency */}
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-white/80">
                Potential deal value
              </Label>
              <Input
                id="value"
                inputMode="decimal"
                value={form.value}
                onChange={(e) => update('value', e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 8500"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => update('currency', v)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Next follow-up */}
          <div className="space-y-2">
            <Label htmlFor="nextFollowUp" className="text-white/80">
              Next follow-up
            </Label>
            <Input
              id="nextFollowUp"
              type="date"
              value={form.nextFollowUp}
              onChange={(e) => update('nextFollowUp', e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          {/* Project link — surfaced when stage is proposal/won */}
          {showProjectLink && (
            <div className="space-y-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
              <Label htmlFor="projectId" className="flex items-center gap-1.5 text-white/80">
                <Link2 className="h-3.5 w-3.5 text-violet-300" />
                Linked project
                <span className="text-[11px] font-normal text-white/40">
                  {form.stage === 'won' ? '(won — link the Build Ledger project)' : '(optional)'}
                </span>
              </Label>
              <Select
                value={form.projectId ?? '__none__'}
                onValueChange={(v) => update('projectId', v === '__none__' ? undefined : v)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="No project linked" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  <SelectItem value="__none__">No project linked</SelectItem>
                  {projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.clientName ? ` · ${p.clientName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {linkedProject && (
                <p className="text-[11px] text-white/50">
                  Project “{linkedProject.name}” will show this client in its detail drawer.
                </p>
              )}
            </div>
          )}

          {/* Notes — markdown editor */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1.5 text-white/80">
              Notes
              <span className="rounded-full bg-violet-500/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-violet-300">
                Markdown
              </span>
            </Label>
            <MarkdownNotesEditor
              value={form.notes}
              onChange={(v) => update('notes', v)}
            />
          </div>

          {/* Preview chips */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-[11px] uppercase tracking-wider text-white/40">Preview</span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: `${stage.color}22`, color: stage.color }}
            >
              ● {stage.label}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: `${source.color}22`, color: source.color }}
            >
              ● {source.label}
            </span>
            {form.company && (
              <Badge variant="secondary" className="bg-white/10 text-white/80">
                {form.company}
              </Badge>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          {isEdit && onDelete ? (
            <DeleteButton
              entityLabel="client"
              description={`“${form.name || 'This client'}” and their full communication log will be permanently removed from your ledger.`}
              onConfirm={() => {
                onDelete()
                onClose()
              }}
            />
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
              {isEdit ? 'Save changes' : 'Create client'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
