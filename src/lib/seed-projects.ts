import type { Project } from '@/lib/projects'

// Sample projects to seed the tracker on first launch.
// All timestamps are static ISO strings so SSR/CSR match.
const T = (daysAgo: number) => {
  const d = new Date('2026-08-22T10:00:00.000Z')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export const SEED_PROJECTS: Project[] = [
  {
    id: 'seed-1',
    name: 'Pulse Chat',
    description:
      'Real-time messaging PWA with typing indicators, emoji reactions, and presence. Built to test how far AI-assisted dev can go on a "hard" feature.',
    aiUsed: ['Claude', 'Cursor'],
    storageLocation: 'sandbox',
    inPortfolio: true,
    clientStatus: 'personal',
    tags: ['nextjs', 'socketio', 'realtime', 'pwa'],
    repoUrl: 'https://github.com/you/pulse-chat',
    liveUrl: 'https://pulse-chat.example.com',
    notes: [
      '## Architecture',
      '- WebSocket server runs **in-process** via the instrumentation hook',
      '- Presence tracked with a Redis-less heartbeat every `15s`',
      '',
      '### Lessons',
      '> AI-assisted realtime code needs careful review — race conditions hide well.',
      '',
      '- [x] Ship typing indicators',
      '- [x] Ship emoji reactions',
      '- [ ] Add message search',
    ].join('\n'),
    createdAt: T(2),
    updatedAt: T(0),
  },
  {
    id: 'seed-2',
    name: 'Acme Landing Page',
    description:
      'Single-page marketing site for a SaaS startup. Animated hero, pricing table, and lead capture form.',
    aiUsed: ['v0', 'Claude'],
    storageLocation: 'github',
    inPortfolio: true,
    clientStatus: 'delivered',
    clientName: 'Acme Inc.',
    tags: ['landing', 'marketing', 'tailwind'],
    repoUrl: 'https://github.com/acme/landing',
    liveUrl: 'https://acme.example.com',
    createdAt: T(14),
    updatedAt: T(10),
  },
  {
    id: 'seed-3',
    name: 'Recipe Finder',
    description:
      'Search-only recipe app using a public API. Built in an afternoon to test Bolt.',
    aiUsed: ['Bolt'],
    storageLocation: 'local',
    inPortfolio: false,
    clientStatus: 'personal',
    tags: ['api', 'react', 'experiment'],
    createdAt: T(21),
    updatedAt: T(21),
  },
  {
    id: 'seed-4',
    name: 'Internal Onboarding Portal',
    description:
      'Multi-step onboarding wizard for new hires at a logistics company. Includes role-based content.',
    aiUsed: ['Cursor', 'GPT-5'],
    storageLocation: 'cloud',
    inPortfolio: false,
    clientStatus: 'in-progress',
    clientName: 'LogiCo',
    tags: ['internal', 'wizard', 'nextjs'],
    createdAt: T(7),
    updatedAt: T(1),
  },
  {
    id: 'seed-5',
    name: 'Portfolio Site v3',
    description:
      'Personal portfolio with case studies, blog, and contact form. Deployed on Vercel.',
    aiUsed: ['Lovable', 'Claude'],
    storageLocation: 'github',
    inPortfolio: true,
    clientStatus: 'delivered',
    tags: ['portfolio', 'blog', 'mdx'],
    repoUrl: 'https://github.com/you/portfolio-v3',
    liveUrl: 'https://you.example.com',
    createdAt: T(35),
    updatedAt: T(20),
  },
  {
    id: 'seed-6',
    name: 'Crypto Price Tracker',
    description:
      'Live crypto prices with watchlist. Abandoned because the API rate limits were brutal.',
    aiUsed: ['Replit Agent'],
    storageLocation: 'local',
    inPortfolio: false,
    clientStatus: 'personal',
    tags: ['api', 'abandoned', 'crypto'],
    notes: [
      'Rate limits killed it — 5 req/min on the free tier.',
      '',
      'Could revisit with a paid API key or a websocket feed.',
      '',
      '- [ ] Compare CoinGecko vs CoinPricing APIs',
      '- [ ] Cache prices server-side for 60s',
    ].join('\n'),
    createdAt: T(45),
    updatedAt: T(40),
  },
]
