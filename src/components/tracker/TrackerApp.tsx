'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, LayoutDashboard, FolderKanban, Megaphone, Calendar as CalendarIcon, Activity as ActivityIcon, Trash2, Download, Upload, Search, Keyboard, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Dashboard } from './Dashboard'
import { ProjectList } from './ProjectList'
import { ProjectForm } from './ProjectForm'
import { CampaignsView } from './Campaigns'
import { CampaignForm } from './CampaignForm'
import { PostForm } from './PostForm'
import { CalendarView } from './Calendar'
import { ClientsView } from './Clients'
import { ClientForm, type ProjectOption } from './ClientForm'
import { ClientDetailDrawer } from './ClientDetailDrawer'
import { ImportDialog } from './ImportDialog'
import { CommandPalette, type PaletteTab } from './CommandPalette'
import { ShortcutsDialog } from './ShortcutsDialog'
import { ActivityTimeline } from './ActivityTimeline'
import { ProjectDetailDrawer } from './ProjectDetailDrawer'
import { OnboardingDialog } from './OnboardingDialog'
import { useProjectsStore } from '@/store/projects-store'
import { useMarketingStore } from '@/store/marketing-store'
import { useClientsStore } from '@/store/clients-store'
import { SEED_PROJECTS } from '@/lib/seed-projects'
import { SEED_CAMPAIGNS, SEED_POSTS } from '@/lib/seed-marketing'
import { SEED_CLIENTS } from '@/lib/seed-clients'
import { parseImportPayload, type ImportPayload } from '@/lib/import'
import type { Project, StorageLocation, ClientStatus } from '@/lib/projects'
import type { Campaign, Post, CampaignStatus } from '@/lib/marketing'
import type { Client, LeadSource, Communication } from '@/lib/clients'

type Tab = 'dashboard' | 'projects' | 'clients' | 'campaigns' | 'calendar' | 'activity'
type PortfolioFilter = 'all' | 'in' | 'out'
export type ProjectSort = 'recent' | 'oldest' | 'newest' | 'name'

export function TrackerApp() {
  const projects = useProjectsStore((s) => s.projects)
  const addProject = useProjectsStore((s) => s.addProject)
  const updateProject = useProjectsStore((s) => s.updateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const togglePortfolio = useProjectsStore((s) => s.togglePortfolio)
  const seedIfEmpty = useProjectsStore((s) => s.seedIfEmpty)
  const clearAll = useProjectsStore((s) => s.clearAll)

  const campaigns = useMarketingStore((s) => s.campaigns)
  const posts = useMarketingStore((s) => s.posts)
  const addCampaign = useMarketingStore((s) => s.addCampaign)
  const updateCampaign = useMarketingStore((s) => s.updateCampaign)
  const deleteCampaign = useMarketingStore((s) => s.deleteCampaign)
  const addPost = useMarketingStore((s) => s.addPost)
  const updatePost = useMarketingStore((s) => s.updatePost)
  const deletePost = useMarketingStore((s) => s.deletePost)
  const movePost = useMarketingStore((s) => s.movePost)
  const seedMarketingIfEmpty = useMarketingStore((s) => s.seedIfEmpty)
  const importProjects = useProjectsStore((s) => s.importData)
  const importMarketing = useMarketingStore((s) => s.importData)
  const clearMarketing = useMarketingStore((s) => s.clearAll)

  // Client / prospect tracker (CRM pipeline)
  const clients = useClientsStore((s) => s.clients)
  const addClient = useClientsStore((s) => s.addClient)
  const updateClient = useClientsStore((s) => s.updateClient)
  const deleteClient = useClientsStore((s) => s.deleteClient)
  const addCommunication = useClientsStore((s) => s.addCommunication)
  const deleteCommunication = useClientsStore((s) => s.deleteCommunication)
  const linkProjectToClient = useClientsStore((s) => s.linkProject)
  const seedClientsIfEmpty = useClientsStore((s) => s.seedIfEmpty)
  const importClients = useClientsStore((s) => s.importData)
  const clearClients = useClientsStore((s) => s.clearAll)

  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>('dashboard')
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [campaignFormOpen, setCampaignFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [postFormOpen, setPostFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [defaultCampaignId, setDefaultCampaignId] = useState<string | undefined>(undefined)
  const [defaultPostDate, setDefaultPostDate] = useState<string | undefined>(undefined)

  // Client form + detail drawer state
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [detailClient, setDetailClient] = useState<Client | null>(null)

  // Import state
  const [importOpen, setImportOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<ImportPayload | null>(null)
  const [pendingInvalid, setPendingInvalid] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Command palette state
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Shortcuts help dialog state
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Project detail drawer state (slide-over)
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  // First-visit onboarding dialog state
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  // Project filters
  const [search, setSearch] = useState('')
  const [filterStorage, setFilterStorage] = useState<StorageLocation | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [filterPortfolio, setFilterPortfolio] = useState<PortfolioFilter>('all')
  const [sortBy, setSortBy] = useState<ProjectSort>('recent')

  // Campaign filters
  const [campaignSearch, setCampaignSearch] = useState('')
  const [campaignFilterStatus, setCampaignFilterStatus] = useState<CampaignStatus | 'all'>('all')

  // Client filters
  const [clientSearch, setClientSearch] = useState('')
  const [clientFilterSource, setClientFilterSource] = useState<LeadSource | 'all'>('all')

  // Seed sample data ONLY on a true first visit (no persisted keys yet).
  // Checking localStorage key existence (not store length) means a user who
  // ran "Clear all" stays empty across reloads instead of seeds returning.
  // Also surface the first-visit onboarding dialog once per browser.
  useEffect(() => {
    const firstVisit =
      !localStorage.getItem('project-tracker-v1') &&
      !localStorage.getItem('build-ledger-marketing-v1') &&
      !localStorage.getItem('build-ledger-clients-v1')
    if (firstVisit) {
      seedIfEmpty(SEED_PROJECTS)
      seedMarketingIfEmpty(SEED_CAMPAIGNS, SEED_POSTS)
      seedClientsIfEmpty(SEED_CLIENTS)
    }
    // Defer to rAF so the setState is NOT called synchronously inside the
    // effect body (avoids the react-hooks/set-state-in-effect cascading
    // render lint). One-shot: rAF is cancelled on unmount.
    if (!localStorage.getItem('build-ledger-onboarded')) {
      const raf = requestAnimationFrame(() => setOnboardingOpen(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  const handleDismissOnboarding = () => {
    localStorage.setItem('build-ledger-onboarded', '1')
    setOnboardingOpen(false)
  }

  const handleOpenProject = (p: Project) => setDetailProject(p)

  const filteredProjects = useMemo(() => {
    const list = projects.filter((p) => {
      if (filterStorage !== 'all' && p.storageLocation !== filterStorage) return false
      if (filterStatus !== 'all' && p.clientStatus !== filterStatus) return false
      if (filterPortfolio === 'in' && !p.inPortfolio) return false
      if (filterPortfolio === 'out' && p.inPortfolio) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = [p.name, p.description, p.notes ?? '', p.clientName ?? '', ...p.aiUsed, ...p.tags].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    const sorted = [...list]
    if (sortBy === 'recent') sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    else if (sortBy === 'oldest') sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    else if (sortBy === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [projects, search, filterStorage, filterStatus, filterPortfolio, sortBy])

  // Project handlers
  const handleNewProject = () => { setEditingProject(null); setProjectFormOpen(true) }
  const handleEditProject = (p: Project) => { setEditingProject(p); setProjectFormOpen(true) }
  const handleProjectSubmit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
      toast({ title: 'Project updated', description: `“${data.name}” saved.` })
    } else {
      addProject(data)
      toast({ title: 'Project created', description: `“${data.name}” added to your ledger.` })
    }
  }
  const handleDeleteProject = () => {
    if (!editingProject) return
    deleteProject(editingProject.id)
    toast({
      title: 'Project deleted',
      description: `“${editingProject.name}” was removed.`,
      variant: 'destructive',
    })
  }

  // Campaign handlers
  const handleNewCampaign = () => { setEditingCampaign(null); setCampaignFormOpen(true) }
  const handleEditCampaign = (c: Campaign) => { setEditingCampaign(c); setCampaignFormOpen(true) }
  const handleCampaignSubmit = (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCampaign) {
      updateCampaign(editingCampaign.id, data)
      toast({ title: 'Campaign updated', description: `“${data.name}” saved.` })
    } else {
      addCampaign(data)
      toast({ title: 'Campaign created', description: `“${data.name}” added.` })
    }
  }
  const handleDeleteCampaign = () => {
    if (!editingCampaign) return
    deleteCampaign(editingCampaign.id)
    toast({
      title: 'Campaign deleted',
      description: `“${editingCampaign.name}” was removed. Its posts moved to Standalone.`,
      variant: 'destructive',
    })
  }

  // Post handlers
  const handleNewPost = (campaignId?: string, date?: string) => {
    setEditingPost(null)
    setDefaultCampaignId(campaignId)
    setDefaultPostDate(date)
    setPostFormOpen(true)
  }
  const handleEditPost = (p: Post) => {
    setEditingPost(p)
    setDefaultCampaignId(undefined)
    setDefaultPostDate(undefined)
    setPostFormOpen(true)
  }
  const handlePostSubmit = (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPost) {
      updatePost(editingPost.id, data)
      toast({ title: 'Post updated', description: `“${data.title}” saved.` })
    } else {
      addPost(data)
      toast({ title: 'Post created', description: `“${data.title}” added.` })
    }
  }
  const handleDeletePost = () => {
    if (!editingPost) return
    deletePost(editingPost.id)
    toast({
      title: 'Post deleted',
      description: `“${editingPost.title}” was removed.`,
      variant: 'destructive',
    })
  }

  // Client / prospect handlers --------------------------------------------
  const handleNewClient = () => { setEditingClient(null); setClientFormOpen(true) }
  const handleEditClient = (c: Client) => { setEditingClient(c); setClientFormOpen(true) }
  const handleOpenClient = (c: Client) => setDetailClient(c)
  const handleClientSubmit = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data)
      toast({ title: 'Client updated', description: `“${data.name}” saved.` })
      // Keep the detail drawer in sync if it was showing this client
      setDetailClient((cur) => (cur && cur.id === editingClient.id ? { ...cur, ...data, updatedAt: new Date().toISOString() } : cur))
    } else {
      const id = addClient(data)
      toast({ title: 'Client added', description: `“${data.name}” added to your pipeline.` })
      // Open the new client in the detail drawer for immediate follow-up logging
      const fresh: Client = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setDetailClient(fresh)
    }
  }
  const handleDeleteClient = () => {
    if (!editingClient) return
    const name = editingClient.name
    deleteClient(editingClient.id)
    toast({
      title: 'Client deleted',
      description: `“${name}” and their communication log were removed.`,
      variant: 'destructive',
    })
    setDetailClient(null)
  }
  const handleAddCommunication = (clientId: string, data: Omit<Communication, 'id'>) => {
    addCommunication(clientId, data)
    const methodLabel = data.method
    toast({ title: 'Communication logged', description: `${methodLabel} touch recorded.` })
    // Refresh the open detail drawer so the new touch + lastContactDate show
    setDetailClient((cur) =>
      cur && cur.id === clientId
        ? {
            ...cur,
            communications: [
              { ...data, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}` },
              ...cur.communications,
            ],
            lastContactDate: data.date,
            updatedAt: new Date().toISOString(),
          }
        : cur,
    )
  }
  const handleDeleteCommunication = (clientId: string, commId: string) => {
    deleteCommunication(clientId, commId)
    setDetailClient((cur) =>
      cur && cur.id === clientId
        ? {
            ...cur,
            communications: cur.communications.filter((m) => m.id !== commId),
            updatedAt: new Date().toISOString(),
          }
        : cur,
    )
  }
  const handleLinkProject = (clientId: string, projectId?: string) => {
    linkProjectToClient(clientId, projectId)
    setDetailClient((cur) =>
      cur && cur.id === clientId
        ? { ...cur, projectId, updatedAt: new Date().toISOString() }
        : cur,
    )
  }
  // Convert a won client into a Build Ledger project — pre-fills the
  // client name, marks the project as a client project, and links it
  // back to this client record. Then opens the project form for editing.
  const handleCreateProjectFromClient = (c: Client) => {
    const id = addProject({
      name: `${c.company || c.name} project`,
      description: `Project for ${c.name}${c.company ? ` at ${c.company}` : ''}.`,
      aiUsed: [],
      storageLocation: 'local',
      inPortfolio: false,
      clientStatus: 'client',
      clientName: c.company || c.name,
      tags: ['client'],
      notes: c.notes,
    })
    linkProjectToClient(c.id, id)
    setDetailClient((cur) =>
      cur && cur.id === c.id ? { ...cur, projectId: id, updatedAt: new Date().toISOString() } : cur,
    )
    toast({
      title: 'Project created from client',
      description: `“${c.company || c.name} project” added and linked to ${c.name}.`,
    })
    // Open the new project in its edit form so the user can flesh it out
    const fresh: Project = {
      id,
      name: `${c.company || c.name} project`,
      description: `Project for ${c.name}${c.company ? ` at ${c.company}` : ''}.`,
      aiUsed: [],
      storageLocation: 'local',
      inPortfolio: false,
      clientStatus: 'client',
      clientName: c.company || c.name,
      tags: ['client'],
      notes: c.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDetailClient(null)
    setEditingProject(fresh)
    setProjectFormOpen(true)
  }

  const handleClearAll = () => {
    if (confirm('Delete ALL projects, clients and campaigns? This cannot be undone.')) {
      clearAll()
      clearMarketing()
      clearClients()
      setDetailClient(null)
      toast({
        title: 'Ledger cleared',
        description: 'All projects, clients, campaigns and posts were removed.',
        variant: 'destructive',
      })
    }
  }

  // Keyboard shortcuts: Ctrl/Cmd+K = command palette, "n" = new item,
  // "/" = focus search, "?" = shortcut help, Escape = close topmost overlay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      // Any Radix/shadcn dialog currently open in the DOM (day detail,
      // import, shortcuts, …) — including ones owned by child components
      // whose state we can't see (e.g. Calendar's dayDetailDate). Guards
      // n / ? / / (and Ctrl+K) from stacking overlays on top of it.
      // Escape is deliberately NOT guarded — Radix closes its own dialogs
      // itself, and our chain below handles the custom forms.
      const anyDialogOpen = !!document.querySelector('[role="dialog"][data-state="open"]')

      // Ctrl/Cmd+K toggles the command palette (works even while typing,
      // but not when another modal form or dialog is open)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        const anyFormOpen = projectFormOpen || campaignFormOpen || postFormOpen || clientFormOpen || importOpen || anyDialogOpen
        if (!anyFormOpen) {
          e.preventDefault()
          setPaletteOpen((o) => !o)
        }
        return
      }

      // "?" opens the keyboard shortcuts reference (only when not typing
      // and no other overlay is open)
      if (e.key === '?') {
        const otherOverlayOpen =
          projectFormOpen || campaignFormOpen || postFormOpen || clientFormOpen || importOpen || paletteOpen || anyDialogOpen
        if (!typing && !otherOverlayOpen) {
          e.preventDefault()
          setShortcutsOpen(true)
        }
        return
      }

      // Escape closes the topmost overlay (palette first, then help dialog)
      if (e.key === 'Escape') {
        if (paletteOpen) setPaletteOpen(false)
        else if (shortcutsOpen) setShortcutsOpen(false)
        else if (onboardingOpen) handleDismissOnboarding()
        else if (detailProject) setDetailProject(null)
        else if (detailClient) setDetailClient(null)
        else if (projectFormOpen) setProjectFormOpen(false)
        else if (campaignFormOpen) setCampaignFormOpen(false)
        else if (postFormOpen) setPostFormOpen(false)
        else if (clientFormOpen) setClientFormOpen(false)
        else if (importOpen) setImportOpen(false)
        return
      }

      const anyOverlayOpen =
        projectFormOpen || campaignFormOpen || postFormOpen || clientFormOpen || importOpen ||
        paletteOpen || shortcutsOpen || onboardingOpen || !!detailProject || !!detailClient || anyDialogOpen
      if (anyOverlayOpen || typing || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === '/') {
        e.preventDefault()
        const id =
          tab === 'campaigns' ? 'campaign-search'
          : tab === 'projects' ? 'project-search'
          : tab === 'clients' ? 'client-search'
          : null
        if (id) (document.getElementById(id) as HTMLInputElement | null)?.focus()
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault()
        if (tab === 'campaigns') handleNewCampaign()
        else if (tab === 'calendar') handleNewPost()
        else if (tab === 'clients') handleNewClient()
        else handleNewProject()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // Palette action: navigate to a tab
  const handlePaletteNavigate = (t: PaletteTab) => setTab(t)

  const handleExport = () => {
    const data = { projects, campaigns, posts, clients, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `build-ledger-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'Export ready',
      description: `${projects.length} projects, ${clients.length} clients, ${campaigns.length} campaigns and ${posts.length} posts downloaded as JSON.`,
    })
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const { payload, invalid } = parseImportPayload(parsed)
      const total = payload.projects.length + payload.campaigns.length + payload.posts.length + payload.clients.length
      if (total === 0) {
        toast({
          title: 'Import failed',
          description: 'No valid projects, clients, campaigns or posts found in this file.',
          variant: 'destructive',
        })
        return
      }
      setPendingImport(payload)
      setPendingInvalid(invalid)
      setImportOpen(true)
    } catch {
      toast({
        title: 'Import failed',
        description: 'This file could not be read as JSON.',
        variant: 'destructive',
      })
    }
  }

  const runImport = (mode: 'merge' | 'replace') => {
    if (!pendingImport) return
    const pr = importProjects(pendingImport.projects, mode)
    const mr = importMarketing(pendingImport.campaigns, pendingImport.posts, mode)
    const cr = importClients(pendingImport.clients, mode)
    const added = pr.added + mr.added + cr.added
    const skipped = pr.skipped + mr.skipped + cr.skipped
    toast({
      title: mode === 'replace' ? 'Ledger replaced' : 'Import merged',
      description:
        `${added} item${added === 1 ? '' : 's'} imported` +
        (skipped > 0 ? ` · ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped` : '') +
        '.',
    })
    setImportOpen(false)
    setPendingImport(null)
    setPendingInvalid(0)
  }

  const linkedProjectOptions: ProjectOption[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
  }))
  const campaignOptions = campaigns.map((c) => ({ id: c.id, name: c.name, color: c.color }))

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/40">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-white">Build Ledger</h1>
              <p className="hidden text-[11px] text-white/50 sm:block">
                Projects + clients + campaigns + calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
              aria-label="Import backup JSON file"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              className="text-white/60 hover:bg-white/10 hover:text-white"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="gap-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              title="Command palette (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="ml-1 hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/40 lg:inline">
                ⌘K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-white/60 hover:bg-white/10 hover:text-white"
              title="Import backup JSON"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport} className="text-white/60 hover:bg-white/10 hover:text-white" title="Export JSON">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="hidden text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-300 sm:flex"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                if (tab === 'projects') handleNewProject()
                else if (tab === 'campaigns') handleNewCampaign()
                else if (tab === 'calendar') handleNewPost()
                else if (tab === 'clients') handleNewClient()
                else handleNewProject()
              }}
              size="sm"
              title="New (n)"
              className="ml-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40 active:scale-95"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">
                {tab === 'campaigns' ? 'New campaign' : tab === 'calendar' ? 'New post' : tab === 'clients' ? 'New client' : 'New'}
              </span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" />
          <TabButton active={tab === 'projects'} onClick={() => setTab('projects')} icon={<FolderKanban className="h-3.5 w-3.5" />} label="Projects" count={projects.length} />
          <TabButton active={tab === 'clients'} onClick={() => setTab('clients')} icon={<Briefcase className="h-3.5 w-3.5" />} label="Clients" count={clients.length} />
          <TabButton active={tab === 'campaigns'} onClick={() => setTab('campaigns')} icon={<Megaphone className="h-3.5 w-3.5" />} label="Campaigns" count={campaigns.length} />
          <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Calendar" count={posts.length} />
          <TabButton active={tab === 'activity'} onClick={() => setTab('activity')} icon={<ActivityIcon className="h-3.5 w-3.5" />} label="Activity" count={projects.length + clients.length + campaigns.length + posts.length} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'projects' && (
          <ProjectList
            projects={filteredProjects}
            search={search}
            onSearchChange={setSearch}
            filterStorage={filterStorage}
            onFilterStorageChange={setFilterStorage}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterPortfolio={filterPortfolio}
            onFilterPortfolioChange={setFilterPortfolio}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onEdit={handleEditProject}
            onTogglePortfolio={togglePortfolio}
            onOpenProject={handleOpenProject}
          />
        )}
        {tab === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            posts={posts}
            search={campaignSearch}
            onSearchChange={setCampaignSearch}
            filterStatus={campaignFilterStatus}
            onFilterStatusChange={setCampaignFilterStatus}
            onNewCampaign={handleNewCampaign}
            onEditCampaign={handleEditCampaign}
            onNewPost={(campaignId) => handleNewPost(campaignId)}
            onEditPost={handleEditPost}
          />
        )}
        {tab === 'clients' && (
          <ClientsView
            clients={clients}
            search={clientSearch}
            onSearchChange={setClientSearch}
            filterSource={clientFilterSource}
            onFilterSourceChange={setClientFilterSource}
            onOpenClient={handleOpenClient}
            onNewClient={handleNewClient}
          />
        )}
        {tab === 'calendar' && (
          <CalendarView
            posts={posts}
            campaigns={campaigns}
            onNewPost={(date) => handleNewPost(undefined, date)}
            onEditPost={handleEditPost}
            onMovePost={movePost}
          />
        )}
        {tab === 'activity' && (
          <ActivityTimeline
            onOpenProject={handleOpenProject}
            onOpenClient={handleOpenClient}
            onOpenCampaign={handleEditCampaign}
            onOpenPost={handleEditPost}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-white/5 px-4 py-4 text-center text-[11px] text-white/30 sm:px-6">
        <div className="flex flex-col items-center gap-1">
          <div>
            Local-first PWA · {projects.length} projects · {clients.length} clients · {campaigns.length} campaigns · {posts.length} posts
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">?</kbd>
              <span className="ml-1">help</span>
            </span>
            <span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">⌘K</kbd>
              <span className="ml-1">commands</span>
            </span>
            <span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">n</kbd>
              <span className="ml-1">new</span>
            </span>
            <span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">/</kbd>
              <span className="ml-1">search</span>
            </span>
            <span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/50">esc</kbd>
              <span className="ml-1">close</span>
            </span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {projectFormOpen && (
          <ProjectForm
            key={editingProject?.id ?? 'new-project'}
            onClose={() => setProjectFormOpen(false)}
            onSubmit={handleProjectSubmit}
            onDelete={editingProject ? handleDeleteProject : undefined}
            initial={editingProject}
          />
        )}
        {campaignFormOpen && (
          <CampaignForm
            key={editingCampaign?.id ?? 'new-campaign'}
            onClose={() => setCampaignFormOpen(false)}
            onSubmit={handleCampaignSubmit}
            onDelete={editingCampaign ? handleDeleteCampaign : undefined}
            initial={editingCampaign}
            linkedProjectOptions={linkedProjectOptions}
          />
        )}
        {postFormOpen && (
          <PostForm
            key={editingPost?.id ?? 'new-post'}
            onClose={() => setPostFormOpen(false)}
            onSubmit={handlePostSubmit}
            onDelete={editingPost ? handleDeletePost : undefined}
            initial={editingPost}
            campaignOptions={campaignOptions}
            defaultCampaignId={defaultCampaignId}
            defaultDate={defaultPostDate}
          />
        )}
        {clientFormOpen && (
          <ClientForm
            key={editingClient?.id ?? 'new-client'}
            onClose={() => setClientFormOpen(false)}
            onSubmit={handleClientSubmit}
            onDelete={editingClient ? handleDeleteClient : undefined}
            initial={editingClient}
            projectOptions={linkedProjectOptions}
          />
        )}
      </AnimatePresence>

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        payload={pendingImport}
        invalidCount={pendingInvalid}
        onImport={runImport}
      />

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <ProjectDetailDrawer
        project={detailProject}
        campaigns={campaigns}
        posts={posts}
        onClose={() => setDetailProject(null)}
        onEdit={(p) => { setDetailProject(null); handleEditProject(p) }}
        onEditCampaign={(c) => { setDetailProject(null); handleEditCampaign(c) }}
        onEditPost={(p) => { setDetailProject(null); handleEditPost(p) }}
      />

      <ClientDetailDrawer
        client={detailClient}
        projects={projects}
        onClose={() => setDetailClient(null)}
        onEdit={(c) => { setDetailClient(null); handleEditClient(c) }}
        onAddCommunication={handleAddCommunication}
        onDeleteCommunication={handleDeleteCommunication}
        onLinkProject={handleLinkProject}
        onCreateProjectFromClient={handleCreateProjectFromClient}
        onOpenProject={handleOpenProject}
      />

      <OnboardingDialog
        open={onboardingOpen}
        onDismiss={handleDismissOnboarding}
        onGoToDashboard={() => { setTab('dashboard') }}
        onNewProject={() => handleNewProject()}
        onNewCampaign={() => handleNewCampaign()}
        onOpenCalendar={() => { setTab('calendar') }}
      />

      <AnimatePresence>
        {paletteOpen && (
          <CommandPalette
            open
            onClose={() => setPaletteOpen(false)}
            projects={projects}
            campaigns={campaigns}
            posts={posts}
            clients={clients}
            onNavigate={handlePaletteNavigate}
            onEditProject={handleEditProject}
            onEditCampaign={handleEditCampaign}
            onEditPost={handleEditPost}
            onOpenClient={handleOpenClient}
            onNewProject={handleNewProject}
            onNewCampaign={handleNewCampaign}
            onNewPost={handleNewPost}
            onNewClient={handleNewClient}
            onExport={handleExport}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 ${
        active
          ? 'bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white shadow-md shadow-violet-500/20'
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      }`}
    >
      <span className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      {label}
      {count !== undefined && (
        <span
          className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums transition-colors ${
            active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
