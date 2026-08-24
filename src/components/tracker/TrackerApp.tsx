'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, LayoutDashboard, FolderKanban, Megaphone, Calendar as CalendarIcon, Trash2, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dashboard } from './Dashboard'
import { ProjectList } from './ProjectList'
import { ProjectForm } from './ProjectForm'
import { CampaignsView } from './Campaigns'
import { CampaignForm } from './CampaignForm'
import { PostForm } from './PostForm'
import { CalendarView } from './Calendar'
import { useProjectsStore } from '@/store/projects-store'
import { useMarketingStore } from '@/store/marketing-store'
import { SEED_PROJECTS } from '@/lib/seed-projects'
import { SEED_CAMPAIGNS, SEED_POSTS } from '@/lib/seed-marketing'
import type { Project, StorageLocation, ClientStatus } from '@/lib/projects'
import type { Campaign, Post, CampaignStatus } from '@/lib/marketing'

type Tab = 'dashboard' | 'projects' | 'campaigns' | 'calendar'
type PortfolioFilter = 'all' | 'in' | 'out'

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
  const clearMarketing = useMarketingStore((s) => s.clearAll)

  const [tab, setTab] = useState<Tab>('dashboard')
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [campaignFormOpen, setCampaignFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [postFormOpen, setPostFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [defaultCampaignId, setDefaultCampaignId] = useState<string | undefined>(undefined)
  const [defaultPostDate, setDefaultPostDate] = useState<string | undefined>(undefined)

  // Project filters
  const [search, setSearch] = useState('')
  const [filterStorage, setFilterStorage] = useState<StorageLocation | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [filterPortfolio, setFilterPortfolio] = useState<PortfolioFilter>('all')

  // Campaign filters
  const [campaignSearch, setCampaignSearch] = useState('')
  const [campaignFilterStatus, setCampaignFilterStatus] = useState<CampaignStatus | 'all'>('all')

  // Seed sample data on first mount if empty
  useEffect(() => {
    seedIfEmpty(SEED_PROJECTS)
    seedMarketingIfEmpty(SEED_CAMPAIGNS, SEED_POSTS)
  }, [seedIfEmpty, seedMarketingIfEmpty])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
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
  }, [projects, search, filterStorage, filterStatus, filterPortfolio])

  // Project handlers
  const handleNewProject = () => { setEditingProject(null); setProjectFormOpen(true) }
  const handleEditProject = (p: Project) => { setEditingProject(p); setProjectFormOpen(true) }
  const handleProjectSubmit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) updateProject(editingProject.id, data)
    else addProject(data)
  }

  // Campaign handlers
  const handleNewCampaign = () => { setEditingCampaign(null); setCampaignFormOpen(true) }
  const handleEditCampaign = (c: Campaign) => { setEditingCampaign(c); setCampaignFormOpen(true) }
  const handleCampaignSubmit = (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCampaign) updateCampaign(editingCampaign.id, data)
    else addCampaign(data)
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
    if (editingPost) updatePost(editingPost.id, data)
    else addPost(data)
  }

  const handleClearAll = () => {
    if (confirm('Delete ALL projects and campaigns? This cannot be undone.')) {
      clearAll()
      clearMarketing()
    }
  }

  const handleExport = () => {
    const data = { projects, campaigns, posts, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `build-ledger-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const linkedProjectOptions = projects.map((p) => ({ id: p.id, name: p.name }))
  const campaignOptions = campaigns.map((c) => ({ id: c.id, name: c.name, color: c.color }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/40">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Build Ledger</h1>
              <p className="hidden text-[11px] text-white/50 sm:block">
                Projects + campaigns + calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleExport} className="hidden text-white/60 hover:bg-white/10 hover:text-white sm:flex" title="Export JSON">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-300"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                if (tab === 'projects') handleNewProject()
                else if (tab === 'campaigns') handleNewCampaign()
                else if (tab === 'calendar') handleNewPost()
                else handleNewProject()
              }}
              size="sm"
              className="ml-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40"
            >
              <Plus className="mr-1 h-4 w-4" />
              {tab === 'campaigns' ? 'New campaign' : tab === 'calendar' ? 'New post' : 'New'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" />
          <TabButton active={tab === 'projects'} onClick={() => setTab('projects')} icon={<FolderKanban className="h-3.5 w-3.5" />} label="Projects" count={projects.length} />
          <TabButton active={tab === 'campaigns'} onClick={() => setTab('campaigns')} icon={<Megaphone className="h-3.5 w-3.5" />} label="Campaigns" count={campaigns.length} />
          <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Calendar" count={posts.length} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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
            onEdit={handleEditProject}
            onTogglePortfolio={togglePortfolio}
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
        {tab === 'calendar' && (
          <CalendarView
            posts={posts}
            campaigns={campaigns}
            onNewPost={(date) => handleNewPost(undefined, date)}
            onEditPost={handleEditPost}
            onMovePost={movePost}
          />
        )}
      </main>

      <footer className="border-t border-white/5 px-4 py-4 text-center text-[11px] text-white/30 sm:px-6">
        Local-first PWA · {projects.length} projects · {campaigns.length} campaigns · {posts.length} posts
      </footer>

      <AnimatePresence>
        {projectFormOpen && (
          <ProjectForm
            key={editingProject?.id ?? 'new-project'}
            onClose={() => setProjectFormOpen(false)}
            onSubmit={handleProjectSubmit}
            onDelete={editingProject ? () => deleteProject(editingProject.id) : undefined}
            initial={editingProject}
          />
        )}
        {campaignFormOpen && (
          <CampaignForm
            key={editingCampaign?.id ?? 'new-campaign'}
            onClose={() => setCampaignFormOpen(false)}
            onSubmit={handleCampaignSubmit}
            onDelete={editingCampaign ? () => deleteCampaign(editingCampaign.id) : undefined}
            initial={editingCampaign}
            linkedProjectOptions={linkedProjectOptions}
          />
        )}
        {postFormOpen && (
          <PostForm
            key={editingPost?.id ?? 'new-post'}
            onClose={() => setPostFormOpen(false)}
            onSubmit={handlePostSubmit}
            onDelete={editingPost ? () => deletePost(editingPost.id) : undefined}
            initial={editingPost}
            campaignOptions={campaignOptions}
            defaultCampaignId={defaultCampaignId}
            defaultDate={defaultPostDate}
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
      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
          {count}
        </span>
      )}
    </button>
  )
}
