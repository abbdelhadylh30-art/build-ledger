import type { Campaign, Post } from './marketing'

// Seed data for marketing campaigns + posts
// All timestamps are static ISO strings so SSR/CSR match

const T = (daysAgo: number) => {
  const d = new Date('2026-08-24T10:00:00.000Z')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

const FUTURE = (daysAhead: number) => {
  const d = new Date('2026-08-24T10:00:00.000Z')
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString()
}

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Stackmint Studio Launch',
    description:
      'Multi-platform launch campaign for the Stackmint Suite. Coordinated posts across Twitter, LinkedIn, Reddit, HN, and Discord to drive traffic to the hub.',
    status: 'active',
    startDate: T(0),
    endDate: FUTURE(9),
    goalType: 'clicks',
    goalTarget: 5000,
    goalCurrent: 1240,
    linkedProjectIds: ['seed-1', 'seed-2'],  // Pulse Chat + Build Ledger
    notes: 'Core launch. 14-hour sprint today, then daily follow-up content for 9 days.',
    color: '#8b5cf6',
    createdAt: T(2),
    updatedAt: T(0),
  },
  {
    id: 'camp-2',
    name: 'Build Ledger Product Hunt',
    description:
      'Prepare Build Ledger for a Product Hunt launch. Need a 60-sec demo video, gallery images, and a comment-response plan.',
    status: 'planning',
    startDate: FUTURE(7),
    endDate: FUTURE(14),
    goalType: 'signups',
    goalTarget: 200,
    goalCurrent: 0,
    linkedProjectIds: ['seed-1'],
    notes: 'Coordinate with Hunter. Pre-build email list first.',
    color: '#06b6d4',
    createdAt: T(5),
    updatedAt: T(1),
  },
  {
    id: 'camp-3',
    name: 'Pulse Chat Twitter Series',
    description:
      'Weekly technical deep-dive thread on how Pulse Chat handles real-time media. 4-part series.',
    status: 'planning',
    startDate: FUTURE(3),
    endDate: FUTURE(24),
    goalType: 'impressions',
    goalTarget: 20000,
    goalCurrent: 0,
    linkedProjectIds: ['seed-2'],
    notes: 'Threads: (1) WS protocol design, (2) Tauri .exe pipeline, (3) Media handling, (4) Cross-machine deploy.',
    color: '#10b981',
    createdAt: T(3),
    updatedAt: T(2),
  },
  {
    id: 'camp-4',
    name: 'Indie Hackers Outreach',
    description:
      'Direct DM campaign to 50 indie hackers. Goal: get 10 honest feedback conversations + 3 testimonials.',
    status: 'completed',
    startDate: T(14),
    endDate: T(7),
    goalType: 'calls',
    goalTarget: 10,
    goalCurrent: 8,
    linkedProjectIds: [],
    notes: 'Got 8 conversations, 2 testimonials. 3 people became early users.',
    color: '#f59e0b',
    createdAt: T(15),
    updatedAt: T(7),
  },
]

export const SEED_POSTS: Post[] = [
  // Camp-1: Stackmint Launch
  {
    id: 'post-1',
    campaignId: 'camp-1',
    platform: 'twitter',
    title: 'Launch thread — "3 apps in 4 days"',
    content: 'I built 3 production apps in 4 days. Not demos. Real apps with .exe installers and payment integrations. Here\'s exactly what I did 🧵',
    status: 'posted',
    scheduledDate: T(0),
    postedDate: T(0),
    postUrl: 'https://twitter.com/your-handle/status/123',
    metrics: { impressions: 3200, likes: 47, comments: 12, shares: 23, clicks: 340 },
    createdAt: T(1),
    updatedAt: T(0),
  },
  {
    id: 'post-2',
    campaignId: 'camp-1',
    platform: 'hackernews',
    title: 'Show HN: 3 production apps in 4 days',
    content: 'Show HN: I built 3 production apps in 4 days with AI-assisted dev. Build Ledger (project tracker), Pulse Chat (real-time chat with media), Stackmint Hub (portfolio).',
    status: 'posted',
    scheduledDate: T(0),
    postedDate: T(0),
    postUrl: 'https://news.ycombinator.com/item?id=123',
    metrics: { impressions: 1800, likes: 34, comments: 28, shares: 5, clicks: 220 },
    createdAt: T(1),
    updatedAt: T(0),
  },
  {
    id: 'post-3',
    campaignId: 'camp-1',
    platform: 'linkedin',
    title: 'Personal story post',
    content: 'Last week, I set out to answer one question: can a solo developer build a real business in 4 days using AI?',
    status: 'posted',
    scheduledDate: T(0),
    postedDate: T(0),
    metrics: { impressions: 2100, likes: 89, comments: 14, shares: 7, clicks: 180 },
    createdAt: T(1),
    updatedAt: T(0),
  },
  {
    id: 'post-4',
    campaignId: 'camp-1',
    platform: 'reddit',
    title: 'r/SideProject post',
    content: 'I built 3 production apps in 4 days with AI. Here\'s everything I learned.',
    status: 'posted',
    scheduledDate: T(0),
    postedDate: T(0),
    postUrl: 'https://reddit.com/r/SideProject/comments/123',
    metrics: { impressions: 950, likes: 42, comments: 18, shares: 3, clicks: 95 },
    createdAt: T(1),
    updatedAt: T(0),
  },
  {
    id: 'post-5',
    campaignId: 'camp-1',
    platform: 'discord',
    title: 'Indie Hackers Discord announcement',
    content: 'Hey all — just shipped 3 apps in 4 days. Built a portfolio site + two real products. Would love feedback.',
    status: 'posted',
    scheduledDate: T(0),
    postedDate: T(0),
    metrics: { impressions: 120, likes: 8, comments: 4, shares: 0, clicks: 22 },
    createdAt: T(0),
    updatedAt: T(0),
  },
  // Scheduled for later today / tomorrow
  {
    id: 'post-6',
    campaignId: 'camp-1',
    platform: 'twitter',
    title: 'Day 1 update thread',
    content: 'Launch day update: [X] views, [Y] signups, [Z] sales. What worked, what didn\'t.',
    status: 'scheduled',
    scheduledDate: FUTURE(1),
    createdAt: T(0),
    updatedAt: T(0),
  },
  {
    id: 'post-7',
    campaignId: 'camp-1',
    platform: 'newsletter',
    title: 'Launch announcement email',
    content: 'Subject: 3 apps. 4 days. Here\'s what I built.',
    status: 'scheduled',
    scheduledDate: FUTURE(0),
    createdAt: T(0),
    updatedAt: T(0),
  },
  {
    id: 'post-8',
    campaignId: 'camp-1',
    platform: 'youtube',
    title: '3-min Loom walkthrough',
    content: 'Quick 3-min demo of all 3 apps.',
    status: 'drafting',
    scheduledDate: FUTURE(0),
    createdAt: T(0),
    updatedAt: T(0),
  },

  // Camp-2: Product Hunt prep
  {
    id: 'post-9',
    campaignId: 'camp-2',
    platform: 'other',
    title: '60-sec demo video script',
    content: 'Draft script for the Product Hunt demo video.',
    status: 'idea',
    createdAt: T(2),
    updatedAt: T(2),
  },
  {
    id: 'post-10',
    campaignId: 'camp-2',
    platform: 'twitter',
    title: 'PH launch day tweet',
    content: 'We\'re live on Product Hunt! 🚀 Would love your support.',
    status: 'idea',
    scheduledDate: FUTURE(7),
    createdAt: T(2),
    updatedAt: T(2),
  },

  // Camp-3: Pulse Chat Twitter Series
  {
    id: 'post-11',
    campaignId: 'camp-3',
    platform: 'twitter',
    title: 'Thread #1: WebSocket protocol design',
    content: 'Why I chose raw WebSocket over Socket.io for Pulse Chat, and the JSON protocol I designed.',
    status: 'drafting',
    scheduledDate: FUTURE(3),
    createdAt: T(1),
    updatedAt: T(1),
  },
  {
    id: 'post-12',
    campaignId: 'camp-3',
    platform: 'twitter',
    title: 'Thread #2: Tauri .exe pipeline',
    content: 'How I set up cloud-built Windows .exe installers from a Next.js + Tauri project.',
    status: 'idea',
    scheduledDate: FUTURE(10),
    createdAt: T(1),
    updatedAt: T(1),
  },
  {
    id: 'post-13',
    campaignId: 'camp-3',
    platform: 'twitter',
    title: 'Thread #3: Real-time media handling',
    content: 'Sending 50MB videos over WebSocket — the architecture that makes it work.',
    status: 'idea',
    scheduledDate: FUTURE(17),
    createdAt: T(1),
    updatedAt: T(1),
  },

  // Camp-4: Indie Hackers (completed)
  {
    id: 'post-14',
    campaignId: 'camp-4',
    platform: 'other',
    title: '50 DMs sent',
    content: 'Direct outreach to 50 indie hackers. 8 conversations, 2 testimonials.',
    status: 'posted',
    postedDate: T(7),
    metrics: { impressions: 50, likes: 0, comments: 8, shares: 0, clicks: 0 },
    createdAt: T(14),
    updatedAt: T(7),
  },

  // Standalone posts (no campaign)
  {
    id: 'post-15',
    platform: 'twitter',
    title: 'Random thought on AI dev',
    content: 'Hot take: AI doesn\'t replace developers. It makes one experienced dev as productive as a 5-person junior team was 5 years ago.',
    status: 'posted',
    postedDate: T(3),
    metrics: { impressions: 1800, likes: 124, comments: 18, shares: 31, clicks: 0 },
    createdAt: T(3),
    updatedAt: T(3),
  },
  {
    id: 'post-16',
    platform: 'linkedin',
    title: 'Comment on friend\'s post',
    content: 'Engagement comment on a connection\'s post about solo consulting.',
    status: 'posted',
    postedDate: T(2),
    metrics: { impressions: 240, likes: 12, comments: 2, shares: 0, clicks: 0 },
    createdAt: T(2),
    updatedAt: T(2),
  },
]
