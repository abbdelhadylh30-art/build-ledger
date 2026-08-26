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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Phone,
  Building2,
  CalendarClock,
  StickyNote,
  ChevronDown,
  Pencil,
  X,
  Plus,
  FolderKanban,
  Trophy,
  Calendar,
  Trash2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Markdown } from './Markdown'
import { DeleteButton } from './DeleteButton'
import {
  getStageMeta,
  getSourceMeta,
  getCommMethodMeta,
  formatValue,
  isWon,
  isLost,
  COMM_METHODS,
  type Client,
  type CommMethod,
  type Communication,
} from '@/lib/clients'
import type { Project } from '@/lib/projects'
import { timeAgo } from '@/lib/time'

interface ClientDetailDrawerProps {
  client: Client | null
  projects: Project[]
  onClose: () => void
  onEdit: (c: Client) => void
  onAddCommunication: (clientId: string, data: Omit<Communication, 'id'>) => void
  onDeleteCommunication: (clientId: string, commId: string) => void
  onLinkProject: (clientId: string, projectId?: string) => void
  onCreateProjectFromClient: (c: Client) => void
  onOpenProject: (p: Project) => void
}

/**
 * Slide-over panel for a Client/prospect. Shows full contact details, the
 * linked project (or a one-click "create project" when won), the full
 * communications timeline with an inline "log communication" form, and
 * collapsible markdown notes. Matches the dark tracker theme.
 */
export function ClientDetailDrawer({
  client,
  projects,
  onClose,
  onEdit,
  onAddCommunication,
  onDeleteCommunication,
  onLinkProject,
  onCreateProjectFromClient,
  onOpenProject,
}: ClientDetailDrawerProps) {
  return (
    <Sheet open={!!client} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 border-white/10 bg-slate-950 p-0 sm:max-w-xl"
      >
        {client && (
          <DrawerBody
            key={client.id}
            client={client}
            projects={projects}
            onClose={onClose}
            onEdit={onEdit}
            onAddCommunication={onAddCommunication}
            onDeleteCommunication={onDeleteCommunication}
            onLinkProject={onLinkProject}
            onCreateProjectFromClient={onCreateProjectFromClient}
            onOpenProject={onOpenProject}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface DrawerBodyProps {
  client: Client
  projects: Project[]
  onClose: () => void
  onEdit: (c: Client) => void
  onAddCommunication: (clientId: string, data: Omit<Communication, 'id'>) => void
  onDeleteCommunication: (clientId: string, commId: string) => void
  onLinkProject: (clientId: string, projectId?: string) => void
  onCreateProjectFromClient: (c: Client) => void
  onOpenProject: (p: Project) => void
}

function DrawerBody({
  client,
  projects,
  onClose,
  onEdit,
  onAddCommunication,
  onDeleteCommunication,
  onLinkProject,
  onCreateProjectFromClient,
  onOpenProject,
}: DrawerBodyProps) {
  const [notesOpen, setNotesOpen] = useState(true)
  const [logOpen, setLogOpen] = useState(false)
  const [commMethod, setCommMethod] = useState<CommMethod>('email')
  const [commDate, setCommDate] = useState(() =>
    new Date().toISOString().split('T')[0],
  )
  const [commOutcome, setCommOutcome] = useState('')
  const [commNotes, setCommNotes] = useState('')

  const stage = getStageMeta(client.stage)
  const source = getSourceMeta(client.source)
  const hasNotes = !!client.notes?.trim()
  const linkedProject = useMemo<Project | undefined>(
    () => projects.find((p) => p.id === client.projectId),
    [projects, client.projectId],
  )
  const won = isWon(client)
  const lost = isLost(client)

  const handleLog = () => {
    if (!commOutcome.trim()) return
    const iso = new Date(commDate + 'T10:00:00.000Z').toISOString()
    onAddCommunication(client.id, {
      method: commMethod,
      date: iso,
      outcome: commOutcome.trim(),
      notes: commNotes.trim() || undefined,
    })
    setCommOutcome('')
    setCommNotes('')
    setLogOpen(false)
  }

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
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md"
            style={{ background: client.color, boxShadow: `0 6px 18px ${client.color}44` }}
            aria-hidden
          >
            {client.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-xl font-semibold leading-tight text-white">
              {client.name}
            </SheetTitle>
            {client.company && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                <Building2 className="h-3 w-3" />
                {client.company}
              </p>
            )}
          </div>
          {won && (
            <span
              className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
              title="Deal won"
            >
              <Trophy className="h-3 w-3" />
              Won
            </span>
          )}
          {lost && (
            <span
              className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400"
              title="Lost"
            >
              <X className="h-3 w-3" />
              Lost
            </span>
          )}
        </div>

        <SheetDescription className="sr-only">
          Client details, contact info, linked project, and the full communications
          timeline for {client.name}.
        </SheetDescription>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ background: `${stage.color}22`, color: stage.color }}
            title="Pipeline stage"
          >
            ● {stage.label}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ background: `${source.color}22`, color: source.color }}
            title="Lead source"
          >
            ● {source.label}
          </span>
          {client.value != null && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 font-medium tabular-nums text-white/70">
              {formatValue(client.value, client.currency)}
            </span>
          )}
          <span className="ml-auto text-white/40">
            Updated {timeAgo(client.updatedAt)}
          </span>
        </div>
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Contact meta grid */}
        <section>
          <SectionLabel>Contact</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetaCell label="Email" icon={<Mail className="h-3 w-3" />}>
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="break-all text-sm text-white/80 transition hover:text-violet-300"
                >
                  {client.email}
                </a>
              ) : (
                <EmptyValue>—</EmptyValue>
              )}
            </MetaCell>
            <MetaCell label="Phone" icon={<Phone className="h-3 w-3" />}>
              {client.phone ? (
                <a
                  href={`tel:${client.phone.replace(/\s+/g, '')}`}
                  className="text-sm text-white/80 transition hover:text-violet-300"
                >
                  {client.phone}
                </a>
              ) : (
                <EmptyValue>—</EmptyValue>
              )}
            </MetaCell>
            <MetaCell label="Next follow-up" icon={<CalendarClock className="h-3 w-3" />}>
              {client.nextFollowUp ? (
                <FollowUpBadge iso={client.nextFollowUp} />
              ) : (
                <EmptyValue>not set</EmptyValue>
              )}
            </MetaCell>
            <MetaCell label="Last contact">
              {client.lastContactDate ? (
                <span className="text-sm text-white/80">
                  {timeAgo(client.lastContactDate)}
                </span>
              ) : (
                <EmptyValue>never</EmptyValue>
              )}
            </MetaCell>
          </div>
        </section>

        {/* Linked project / convert-to-project */}
        <section>
          <SectionLabel>
            <FolderKanban className="h-3 w-3" />
            Project
          </SectionLabel>
          {linkedProject ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpenProject(linkedProject)}
              onKeyDown={handleRowKey(() => onOpenProject(linkedProject))}
              aria-label={`Open project: ${linkedProject.name}`}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {linkedProject.name}
                </div>
                <div className="text-[11px] text-white/40">
                  {linkedProject.clientName ? `Client: ${linkedProject.clientName}` : 'No client name set'}
                  {' · '}updated {timeAgo(linkedProject.updatedAt)}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white/60" />
            </div>
          ) : won ? (
            <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Trophy className="h-4 w-4" />
                Deal won — turn it into a project
              </div>
              <p className="text-[11px] text-white/50">
                Create a new Build Ledger project with this client&apos;s name pre-filled,
                and link it back to {client.name}.
              </p>
              <Button
                onClick={() => onCreateProjectFromClient(client)}
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30 hover:shadow-lg"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Create project from this client
              </Button>
            </div>
          ) : client.stage === 'proposal' || client.stage === 'meeting' ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-white/50">
                No project yet. Win the deal to convert it into a project, or link an
                existing one via Edit.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-xs text-white/40">
              No project linked yet
            </div>
          )}
        </section>

        {/* Communications timeline */}
        <section>
          <SectionLabel>
            <MessageCircle className="h-3 w-3" />
            Communications
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/60">
              {client.communications.length}
            </span>
            <button
              type="button"
              onClick={() => setLogOpen((o) => !o)}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
              <Plus className="h-3 w-3" />
              {logOpen ? 'Cancel' : 'Log'}
            </button>
          </SectionLabel>

          {/* Inline log form */}
          <AnimatePresence initial={false}>
            {logOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mb-3 space-y-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-3">
                  <div className="grid gap-2 sm:grid-cols-[160px_140px]">
                    <Select value={commMethod} onValueChange={(v) => setCommMethod(v as CommMethod)}>
                      <SelectTrigger className="border-white/10 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-900">
                        {COMM_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            <span
                              className="mr-2 inline-block h-2 w-2 rounded-full"
                              style={{ background: m.color }}
                            />
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={commDate}
                      onChange={(e) => setCommDate(e.target.value)}
                      className="border-white/10 bg-white/5 text-white"
                    />
                  </div>
                  <Input
                    value={commOutcome}
                    onChange={(e) => setCommOutcome(e.target.value)}
                    placeholder="Outcome — e.g. Sent pricing one-pager"
                    className="border-white/10 bg-white/5 text-white"
                  />
                  <Textarea
                    value={commNotes}
                    onChange={(e) => setCommNotes(e.target.value)}
                    placeholder="Optional detail…"
                    rows={2}
                    className="resize-none border-white/10 bg-white/5 text-white"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleLog}
                      disabled={!commOutcome.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Log communication
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {client.communications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center text-xs text-white/40">
              No communications logged yet
            </div>
          ) : (
            <div className="relative space-y-0 pl-5">
              {/* vertical timeline line */}
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
              {client.communications.map((c, i) => {
                const meta = getCommMethodMeta(c.method)
                const delay = Math.min(i * 0.04, 0.3)
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay, duration: 0.25 }}
                    className="relative py-2"
                  >
                    {/* dot */}
                    <span
                      className="absolute -left-5 top-3.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-950"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                    <div className="group rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition hover:border-white/15 hover:bg-white/[0.06]">
                      <div className="flex items-center gap-2 text-[11px] text-white/50">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: `${meta.color}22`, color: meta.color }}
                          title={meta.label}
                        >
                          <span aria-hidden>{meta.icon}</span>
                          {meta.label}
                        </span>
                        <span className="tabular-nums">
                          {new Date(c.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteCommunication(client.id, c.id)}
                          className="ml-auto rounded p-1 text-white/30 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                          title="Delete this communication"
                          aria-label="Delete communication"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-white/85">{c.outcome}</p>
                      {c.notes?.trim() && (
                        <p className="mt-1 text-xs leading-relaxed text-white/50">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Notes */}
        {hasNotes && (
          <section>
            <button
              type="button"
              onClick={() => setNotesOpen((o) => !o)}
              aria-expanded={notesOpen}
              className="flex w-full items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/60 transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <StickyNote className="h-3 w-3 shrink-0" style={{ color: client.color }} />
              Notes
              <ChevronDown
                className={`ml-auto h-3 w-3 shrink-0 transition-transform duration-200 ${
                  notesOpen ? 'rotate-180' : ''
                }`}
                style={{ color: client.color }}
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
                    className="mt-2 max-h-72 overflow-y-auto rounded-lg border-l-2 bg-black/25 px-3 py-2.5"
                    style={{ borderColor: `${client.color}66` }}
                  >
                    <Markdown>{client.notes ?? ''}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>

      {/* Footer */}
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
          onClick={() => onEdit(client)}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit client
        </Button>
      </div>
    </>
  )
}

function FollowUpBadge({ iso }: { iso: string }) {
  const due = new Date(iso).setHours(0, 0, 0, 0)
  const today = new Date().setHours(0, 0, 0, 0)
  const overdue = due < today
  const todayDue = due === today
  const cls = overdue
    ? 'bg-rose-500/15 text-rose-300'
    : todayDue
      ? 'bg-amber-500/15 text-amber-300'
      : 'bg-white/5 text-white/80'
  const label = new Date(iso).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {overdue ? 'Overdue · ' : todayDue ? 'Today · ' : ''}
      {label}
    </span>
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
  icon,
  children,
}: {
  label: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}

function EmptyValue({ children }: { children: ReactNode }) {
  return <span className="text-xs italic text-white/30">{children}</span>
}
