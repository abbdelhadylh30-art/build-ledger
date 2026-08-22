'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, LayoutDashboard, FolderKanban, Trash2, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dashboard } from './Dashboard'
import { ProjectList } from './ProjectList'
import { ProjectForm } from './ProjectForm'
import { useProjectsStore } from '@/store/projects-store'
import { SEED_PROJECTS } from '@/lib/seed-projects'
import type { Project, StorageLocation, ClientStatus } from '@/lib/projects'

type Tab = 'dashboard' | 'projects'
type PortfolioFilter = 'all' | 'in' | 'out'

export function TrackerApp() {
  const projects = useProjectsStore((s) => s.projects)
  const addProject = useProjectsStore((s) => s.addProject)
  const updateProject = useProjectsStore((s) => s.updateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const togglePortfolio = useProjectsStore((s) => s.togglePortfolio)
  const seedIfEmpty = useProjectsStore((s) => s.seedIfEmpty)
  const clearAll = useProjectsStore((s) => s.clearAll)

  const [tab, setTab] = useState<Tab>('dashboard')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterStorage, setFilterStorage] = useState<StorageLocation | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [filterPortfolio, setFilterPortfolio] = useState<PortfolioFilter>('all')

  // Seed sample data on first mount if empty
  useEffect(() => {
    seedIfEmpty(SEED_PROJECTS)
  }, [seedIfEmpty])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filterStorage !== 'all' && p.storageLocation !== filterStorage) return false
      if (filterStatus !== 'all' && p.clientStatus !== filterStatus) return false
      if (filterPortfolio === 'in' && !p.inPortfolio) return false
      if (filterPortfolio === 'out' && p.inPortfolio) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = [
          p.name,
          p.description,
          p.notes ?? '',
          p.clientName ?? '',
          ...p.aiUsed,
          ...p.tags,
        ].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [projects, search, filterStorage, filterStatus, filterPortfolio])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (p: Project) => {
    setEditing(p)
    setFormOpen(true)
  }

  const handleSubmit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      updateProject(editing.id, data)
    } else {
      addProject(data)
    }
  }

  const handleDelete = () => {
    if (editing) {
      deleteProject(editing.id)
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const imported = JSON.parse(text) as Project[]
        if (!Array.isArray(imported)) throw new Error('Invalid format')
        // Replace all with imported (preserves IDs and timestamps)
        clearAll()
        for (const p of imported) {
          addProject({
            name: p.name,
            description: p.description,
            aiUsed: p.aiUsed,
            storageLocation: p.storageLocation,
            inPortfolio: p.inPortfolio,
            clientStatus: p.clientStatus,
            clientName: p.clientName,
            tags: p.tags,
            repoUrl: p.repoUrl,
            liveUrl: p.liveUrl,
            notes: p.notes,
          })
        }
      } catch (err) {
        alert('Import failed: ' + (err as Error).message)
      }
    }
    input.click()
  }

  const handleClearAll = () => {
    if (confirm('Delete ALL projects? This cannot be undone.')) {
      clearAll()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/40">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Build Ledger</h1>
              <p className="hidden text-[11px] text-white/50 sm:block">
                Track what you build, what AI you used, and where it lives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              className="hidden text-white/60 hover:bg-white/10 hover:text-white sm:flex"
              title="Import JSON"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="hidden text-white/60 hover:bg-white/10 hover:text-white sm:flex"
              title="Export JSON"
            >
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
              onClick={handleNew}
              size="sm"
              className="ml-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40"
            >
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 px-4 pb-2 sm:px-6">
          <button
            onClick={() => setTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'dashboard'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setTab('projects')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'projects'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
              {projects.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {tab === 'dashboard' ? (
          <Dashboard />
        ) : (
          <ProjectList
            projects={filtered}
            search={search}
            onSearchChange={setSearch}
            filterStorage={filterStorage}
            onFilterStorageChange={setFilterStorage}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterPortfolio={filterPortfolio}
            onFilterPortfolioChange={setFilterPortfolio}
            onEdit={handleEdit}
            onTogglePortfolio={togglePortfolio}
          />
        )}
      </main>

      <footer className="border-t border-white/5 px-4 py-4 text-center text-[11px] text-white/30 sm:px-6">
        Local-first PWA · Data stored in your browser · {projects.length} projects tracked
      </footer>

      <AnimatePresence>
        {formOpen && (
          <ProjectForm
            key={editing?.id ?? 'new'}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
            onDelete={editing ? handleDelete : undefined}
            initial={editing}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
