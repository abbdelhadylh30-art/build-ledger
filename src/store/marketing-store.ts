'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign, Post } from '@/lib/marketing'

interface MarketingState {
  campaigns: Campaign[]
  posts: Post[]
  addCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCampaign: (id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt'>>) => void
  deleteCampaign: (id: string) => void
  addPost: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => string
  updatePost: (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => void
  deletePost: (id: string) => void
  movePost: (postId: string, newDate: string) => void  // for drag-and-drop calendar
  seedIfEmpty: (campaigns: Campaign[], posts: Post[]) => void
  clearAll: () => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set) => ({
      campaigns: [],
      posts: [],

      addCampaign: (data) => {
        const id = uid()
        const ts = now()
        const campaign: Campaign = { ...data, id, createdAt: ts, updatedAt: ts }
        set((state) => ({ campaigns: [campaign, ...state.campaigns] }))
        return id
      },

      updateCampaign: (id, data) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: now() } : c,
          ),
        }))
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          // Unlink posts from this campaign (don't delete posts)
          posts: state.posts.map((p) =>
            p.campaignId === id ? { ...p, campaignId: undefined } : p,
          ),
        }))
      },

      addPost: (data) => {
        const id = uid()
        const ts = now()
        const post: Post = { ...data, id, createdAt: ts, updatedAt: ts }
        set((state) => ({ posts: [post, ...state.posts] }))
        return id
      },

      updatePost: (id, data) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p,
          ),
        }))
      },

      deletePost: (id) => {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }))
      },

      movePost: (postId, newDate) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, scheduledDate: newDate, updatedAt: now() }
              : p,
          ),
        }))
      },

      seedIfEmpty: (campaigns, posts) => {
        set((state) => {
          if (state.campaigns.length > 0 || state.posts.length > 0) return state
          return { campaigns, posts }
        })
      },

      clearAll: () => set({ campaigns: [], posts: [] }),
    }),
    {
      name: 'build-ledger-marketing-v1',
      partialize: (state) => ({ campaigns: state.campaigns, posts: state.posts }),
    },
  ),
)

// Selector helpers for marketing stats
export function selectMarketingStats(campaigns: Campaign[], posts: Post[]) {
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length
  const postedToday = posts.filter((p) => {
    if (p.status !== 'posted' || !p.postedDate) return false
    const today = new Date().toDateString()
    return new Date(p.postedDate).toDateString() === today
  }).length

  const totalImpressions = posts.reduce((sum, p) => sum + (p.metrics?.impressions ?? 0), 0)
  const totalClicks = posts.reduce((sum, p) => sum + (p.metrics?.clicks ?? 0), 0)
  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0) + (p.metrics?.shares ?? 0),
    0,
  )

  // By platform
  const byPlatform: Record<string, number> = {}
  for (const p of posts) {
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
  }

  // Goal progress across all campaigns
  const goalProgress = campaigns.map((c) => ({
    name: c.name,
    current: c.goalCurrent,
    target: c.goalTarget,
    pct: c.goalTarget > 0 ? Math.min(100, (c.goalCurrent / c.goalTarget) * 100) : 0,
    color: c.color,
  }))

  return {
    activeCampaigns,
    scheduledPosts,
    postedToday,
    totalImpressions,
    totalClicks,
    totalEngagement,
    byPlatform,
    goalProgress,
  }
}
