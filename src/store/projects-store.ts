'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, StorageLocation, ClientStatus } from '@/lib/projects'

interface ProjectsState {
  projects: Project[]
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void
  deleteProject: (id: string) => void
  togglePortfolio: (id: string) => void
  seedIfEmpty: (samples: Project[]) => void
  clearAll: () => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],

      addProject: (data) => {
        const id = uid()
        const ts = now()
        const project: Project = {
          ...data,
          id,
          createdAt: ts,
          updatedAt: ts,
        }
        set((state) => ({
          projects: [project, ...state.projects],
        }))
        return id
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p,
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      togglePortfolio: (id) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, inPortfolio: !p.inPortfolio, updatedAt: now() }
              : p,
          ),
        }))
      },

      seedIfEmpty: (samples) => {
        set((state) => {
          if (state.projects.length > 0) return state
          return { projects: samples }
        })
      },

      clearAll: () => set({ projects: [] }),
    }),
    {
      name: 'project-tracker-v1',
      partialize: (state) => ({ projects: state.projects }),
    },
  ),
)

export function selectStats(projects: Project[]) {
  const total = projects.length
  const inPortfolio = projects.filter((p) => p.inPortfolio).length
  const delivered = projects.filter((p) => p.clientStatus === 'delivered').length
  const forClients = projects.filter(
    (p) => p.clientStatus === 'client' || p.clientStatus === 'delivered',
  ).length

  const byAi: Record<string, number> = {}
  for (const p of projects) {
    for (const ai of p.aiUsed) {
      byAi[ai] = (byAi[ai] || 0) + 1
    }
  }

  const byStorage: Record<StorageLocation, number> = {
    local: 0,
    sandbox: 0,
    cloud: 0,
    github: 0,
  }
  for (const p of projects) {
    byStorage[p.storageLocation]++
  }

  const byStatus: Record<ClientStatus, number> = {
    personal: 0,
    'in-progress': 0,
    client: 0,
    delivered: 0,
  }
  for (const p of projects) {
    byStatus[p.clientStatus]++
  }

  return {
    total,
    inPortfolio,
    delivered,
    forClients,
    byAi,
    byStorage,
    byStatus,
  }
}
