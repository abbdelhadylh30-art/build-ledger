'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client, Communication, CommMethod, ClientStage } from '@/lib/clients'

interface ClientsState {
  clients: Client[]
  addClient: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void
  deleteClient: (id: string) => void
  addCommunication: (clientId: string, data: Omit<Communication, 'id'>) => void
  deleteCommunication: (clientId: string, commId: string) => void
  linkProject: (clientId: string, projectId?: string) => void
  seedIfEmpty: (samples: Client[]) => void
  importData: (items: Client[], mode: 'merge' | 'replace') => { added: number; skipped: number }
  clearAll: () => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set) => ({
      clients: [],

      addClient: (data) => {
        const id = uid()
        const ts = now()
        const client: Client = { ...data, id, createdAt: ts, updatedAt: ts }
        set((state) => ({ clients: [client, ...state.clients] }))
        return id
      },

      updateClient: (id, data) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: now() } : c,
          ),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
      },

      addCommunication: (clientId, data) => {
        const comm: Communication = { ...data, id: uid() }
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  // Newest communication first
                  communications: [comm, ...c.communications],
                  lastContactDate: comm.date,
                  updatedAt: now(),
                }
              : c,
          ),
        }))
      },

      deleteCommunication: (clientId, commId) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  communications: c.communications.filter((m) => m.id !== commId),
                  updatedAt: now(),
                }
              : c,
          ),
        }))
      },

      linkProject: (clientId, projectId) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? { ...c, projectId, updatedAt: now() }
              : c,
          ),
        }))
      },

      seedIfEmpty: (samples) => {
        set((state) => {
          if (state.clients.length > 0) return state
          return { clients: samples }
        })
      },

      importData: (items, mode) => {
        if (mode === 'replace') {
          set({ clients: items })
          return { added: items.length, skipped: 0 }
        }
        const existingIds = new Set(getClientsSnapshot().map((c) => c.id))
        const fresh = items.filter((c) => !existingIds.has(c.id))
        const skipped = items.length - fresh.length
        set((state) => ({ clients: [...fresh, ...state.clients] }))
        return { added: fresh.length, skipped }
      },

      clearAll: () => set({ clients: [] }),
    }),
    {
      name: 'build-ledger-clients-v1',
      partialize: (state) => ({ clients: state.clients }),
    },
  ),
)

// zustand persist is async-hydrated; we read directly from the store getter
// for the merge-mode dedupe to avoid a race with hydration. Reading through
// the created store is safe here because importData is only ever called from
// a user action (well after hydration).
function getClientsSnapshot(): Client[] {
  return useClientsStore.getState().clients
}

// Selector helpers for client pipeline stats
export function selectClientStats(clients: Client[]) {
  const total = clients.length
  const byStage: Record<ClientStage, number> = {
    prospect: 0,
    contacted: 0,
    meeting: 0,
    proposal: 0,
    won: 0,
    lost: 0,
  }
  for (const c of clients) byStage[c.stage]++

  const won = byStage.won
  const lost = byStage.lost
  const closed = won + lost
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : null

  // Pipeline value = sum of value for clients still in flight (non-terminal)
  const pipelineValue = clients
    .filter((c) => c.stage !== 'won' && c.stage !== 'lost')
    .reduce((sum, c) => sum + (c.value ?? 0), 0)

  const wonValue = clients
    .filter((c) => c.stage === 'won')
    .reduce((sum, c) => sum + (c.value ?? 0), 0)

  // Follow-ups due: nextFollowUp date is today or earlier (and not terminal-won)
  const todayMs = new Date().setHours(0, 0, 0, 0)
  const followUpsDue = clients.filter((c) => {
    if (!c.nextFollowUp || c.stage === 'won' || c.stage === 'lost') return false
    const due = new Date(c.nextFollowUp).setHours(0, 0, 0, 0)
    return due <= todayMs
  }).length

  const totalCommunications = clients.reduce((sum, c) => sum + c.communications.length, 0)

  return {
    total,
    byStage,
    won,
    lost,
    closed,
    winRate,
    pipelineValue,
    wonValue,
    followUpsDue,
    totalCommunications,
  }
}
