// Parse & validate an exported Build Ledger JSON file.
// Tolerant by design: invalid entries are dropped, not fatal.

import type { Project } from './projects'
import type { Campaign, Post } from './marketing'
import type { Client } from './clients'

export interface ImportPayload {
  projects: Project[]
  campaigns: Campaign[]
  posts: Post[]
  clients: Client[]
}

export interface ImportSummary {
  payload: ImportPayload
  invalid: number
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isProject(x: unknown): x is Project {
  if (!isObject(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    Array.isArray(x.aiUsed) &&
    typeof x.storageLocation === 'string' &&
    typeof x.clientStatus === 'string'
  )
}

function isCampaign(x: unknown): x is Campaign {
  if (!isObject(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    typeof x.status === 'string' &&
    typeof x.startDate === 'string' &&
    typeof x.goalTarget === 'number' &&
    typeof x.goalCurrent === 'number'
  )
}

function isPost(x: unknown): x is Post {
  if (!isObject(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.platform === 'string' &&
    typeof x.title === 'string' &&
    typeof x.status === 'string'
  )
}

function isCommunication(x: unknown): boolean {
  // Tolerant: only require id + method + date + outcome; default the rest
  return (
    isObject(x) &&
    typeof x.id === 'string' &&
    typeof x.method === 'string' &&
    typeof x.date === 'string' &&
    typeof x.outcome === 'string'
  )
}

function isClient(x: unknown): x is Client {
  if (!isObject(x)) return false
  const commOk = Array.isArray(x.communications)
    ? x.communications.every((c) => isCommunication(c))
    : true
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    typeof x.source === 'string' &&
    typeof x.stage === 'string' &&
    typeof x.color === 'string' &&
    typeof x.currency === 'string' &&
    Array.isArray(x.communications) &&
    commOk
  )
}

/**
 * Accepts the raw parsed JSON of an export file and returns valid
 * projects/campaigns/posts/clients plus a count of entries that were
 * dropped because they didn't match the expected shape.
 */
export function parseImportPayload(raw: unknown): ImportSummary {
  const data = isObject(raw) ? raw : {}
  const allProjects = Array.isArray(data.projects) ? data.projects : []
  const allCampaigns = Array.isArray(data.campaigns) ? data.campaigns : []
  const allPosts = Array.isArray(data.posts) ? data.posts : []
  const allClients = Array.isArray(data.clients) ? data.clients : []

  const projects = allProjects.filter(isProject)
  const campaigns = allCampaigns.filter(isCampaign)
  const posts = allPosts.filter(isPost)
  const clients = allClients.filter(isClient)

  const invalid =
    (allProjects.length - projects.length) +
    (allCampaigns.length - campaigns.length) +
    (allPosts.length - posts.length) +
    (allClients.length - clients.length)

  return {
    payload: {
      projects: projects as Project[],
      campaigns: campaigns as Campaign[],
      posts: posts as Post[],
      clients: clients as Client[],
    },
    invalid,
  }
}
