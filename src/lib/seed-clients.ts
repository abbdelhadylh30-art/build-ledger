import type { Client } from '@/lib/clients'

// Sample clients / prospects to seed the CRM tracker on first launch.
// All timestamps are static ISO strings so SSR/CSR match (mirrors seed-projects).
const T = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date('2026-08-22T10:00:00.000Z')
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString()
}

// A follow-up date N days from the seed anchor (2026-08-22).
const F = (daysAhead: number) => {
  const d = new Date('2026-08-22T10:00:00.000Z')
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString()
}

export const SEED_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Sarah Chen',
    company: 'Northwind Labs',
    email: 'sarah@northwindlabs.io',
    phone: '+1 415 555 0182',
    source: 'cold-outreach',
    stage: 'meeting',
    value: 8500,
    currency: 'USD',
    color: '#8b5cf6',
    lastContactDate: T(2),
    nextFollowUp: F(2),
    notes: [
      '## Discovery so far',
      '- Series B startup, **24 engineers**, shipping weekly',
      '- Pain: PR review queue is a 2-day bottleneck',
      '',
      '### Fit',
      '> Our GitHub-integrated review bot is a textbook fit.',
      '',
      '- [x] Booked discovery call',
      '- [ ] Send pricing one-pager',
      '- [ ] Loop in engineering lead (Dana)',
    ].join('\n'),
    communications: [
      {
        id: 'c1-1',
        method: 'email',
        date: T(9),
        outcome: 'Cold intro email — referenced their Series B raise',
        notes: 'Opened but no reply yet. Will follow up on LinkedIn.',
      },
      {
        id: 'c1-2',
        method: 'linkedin',
        date: T(7),
        outcome: 'Connected on LinkedIn, short note attached',
      },
      {
        id: 'c1-3',
        method: 'dm',
        date: T(5),
        outcome: 'Replied — booked a 30-min discovery call',
        notes: 'Mentioned they tried a competitor and bounced off rate limits.',
      },
      {
        id: 'c1-4',
        method: 'call',
        date: T(2),
        outcome: 'Discovery call — strong fit, pain is real',
        notes: 'PR queue 2-day backlog. Dana (eng lead) wants to pilot. Send pricing.',
      },
    ],
    createdAt: T(9),
    updatedAt: T(2),
  },
  {
    id: 'client-2',
    name: 'Marcus Webb',
    company: 'Helios Studio',
    email: 'marcus@helios.studio',
    source: 'referral',
    stage: 'proposal',
    value: 12000,
    currency: 'USD',
    color: '#06b6d4',
    lastContactDate: T(1),
    nextFollowUp: F(1),
    notes: [
      '## Where we are',
      '- Referred by **Priya** (old client) — warm intro',
      '- Agency, 8 designers, overwhelmed with client portals',
      '',
      '### Proposal sent',
      '> Sent a fixed-scope quote for a branded client portal.',
      '',
      '- [x] Scope call',
      '- [x] Quote sent',
      '- [ ] Verbal confirmation (expected ~Aug 23)',
    ].join('\n'),
    communications: [
      {
        id: 'c2-1',
        method: 'in-person',
        date: T(12),
        outcome: 'Met at Priya’s launch party — great fit',
      },
      {
        id: 'c2-2',
        method: 'call',
        date: T(6),
        outcome: 'Scope call — they want portals + onboarding',
      },
      {
        id: 'c2-3',
        method: 'email',
        date: T(1),
        outcome: 'Sent fixed-scope quote ($12k, 4 weeks)',
        notes: 'Marcus: "Looks clean, let me circle with the partners."',
      },
    ],
    createdAt: T(12),
    updatedAt: T(1),
  },
  {
    id: 'client-3',
    name: 'Aisha Karim',
    company: 'Beacon Health',
    email: 'a.karim@beaconhealth.com',
    source: 'inbound',
    stage: 'contacted',
    value: 22000,
    currency: 'USD',
    color: '#10b981',
    lastContactDate: T(4),
    nextFollowUp: F(3),
    notes: [
      '## Inbound lead',
      '- Filled the contact form after reading the case study',
      '- Series C healthtech — compliance-sensitive',
      '',
      '> Slower cycle expected (~6-8 weeks). Worth it.',
    ].join('\n'),
    communications: [
      {
        id: 'c3-1',
        method: 'email',
        date: T(6),
        outcome: 'Inbound form fill — replied within 2h',
        notes: 'Asked about HIPAA-aware hosting. Sent the one-pager.',
      },
      {
        id: 'c3-2',
        method: 'email',
        date: T(4),
        outcome: 'Replied with security FAQ — awaiting legal review on their side',
      },
    ],
    createdAt: T(6),
    updatedAt: T(4),
  },
  {
    id: 'client-4',
    name: 'Diego Ramos',
    company: 'Loop Logistics',
    source: 'event',
    stage: 'prospect',
    value: 6000,
    currency: 'USD',
    color: '#f59e0b',
    lastContactDate: T(7),
    nextFollowUp: F(0),
    notes: [
      'Met at **SaaS Expo**. Asked me to reach out in a week.',
      '',
      '- [ ] Send first outreach email',
    ].join('\n'),
    communications: [
      {
        id: 'c4-1',
        method: 'in-person',
        date: T(7),
        outcome: 'Met at SaaS Expo booth — took his card',
        notes: 'Mentioned their ops dashboard is "a mess".',
      },
    ],
    createdAt: T(7),
    updatedAt: T(7),
  },
  {
    id: 'client-5',
    name: 'Elena Voss',
    company: 'Voss & Co. Law',
    email: 'elena@vossco.legal',
    source: 'social',
    stage: 'won',
    value: 4500,
    currency: 'USD',
    projectId: 'seed-2',
    color: '#ec4899',
    lastContactDate: T(10),
    notes: [
      '## ✅ Won',
      '- Closed a flat-fee intake-form project ($4.5k)',
      '- Built as the **Acme Landing Page** (renamed scope)',
      '',
      '> Potential upsell: a client portal later this quarter.',
    ].join('\n'),
    communications: [
      {
        id: 'c5-1',
        method: 'dm',
        date: T(20),
        outcome: 'DM’d on LinkedIn after she posted about intake pain',
      },
      {
        id: 'c5-2',
        method: 'call',
        date: T(15),
        outcome: 'Scope call — small fixed project',
      },
      {
        id: 'c5-3',
        method: 'email',
        date: T(10),
        outcome: 'Signed off — invoice sent, project created',
      },
    ],
    createdAt: T(20),
    updatedAt: T(10),
  },
  {
    id: 'client-6',
    name: 'Tom Becker',
    company: 'Bolt Retail',
    source: 'cold-outreach',
    stage: 'lost',
    value: 9000,
    currency: 'USD',
    color: '#ef4444',
    lastContactDate: T(18),
    notes: [
      '## ❌ Lost',
      '- Went with an in-house build after the proposal stage',
      '- Reason cited: "we have bandwidth this quarter"',
      '',
      '> Revisit in Q1 — they usually circle back.',
    ].join('\n'),
    communications: [
      {
        id: 'c6-1',
        method: 'email',
        date: T(30),
        outcome: 'Cold intro — replied, curious',
      },
      {
        id: 'c6-2',
        method: 'call',
        date: T(22),
        outcome: 'Demo call — went well',
      },
      {
        id: 'c6-3',
        method: 'email',
        date: T(18),
        outcome: 'Sent proposal',
      },
      {
        id: 'c6-4',
        method: 'email',
        date: T(14),
        outcome: 'Passed — going in-house',
        notes: 'Polite no. Added to the "revisit in Q1" list.',
      },
    ],
    createdAt: T(30),
    updatedAt: T(14),
  },
]
