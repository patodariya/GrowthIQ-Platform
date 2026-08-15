// Thin client for the ICA proxy.
//
// The browser NEVER talks to ICA directly — the API key must stay server-side
// and ICA's origin is CORS-restricted (see ICA-NOTES.md §1). Everything here
// goes through the local proxy in ../proxy, which holds the key and adds CORS.
//
// If the proxy isn't running or the key/agent id aren't set, these functions
// reject and callers fall back to their built-in copy.

import { Contribution } from '../types';
import { RawMessage } from './connectors';

const PROXY_URL = (
  process.env.REACT_APP_ICA_PROXY_URL || 'http://localhost:3001'
).replace(/\/$/, '');

// Opt-in switch. Until you've set up the proxy (proxy/.env with a key + agent
// id) and set REACT_APP_ICA_ENABLED=true, the app makes NO network calls — so
// there are no failed fetches / console noise, and the built-in copy is used.
export const ICA_ENABLED = process.env.REACT_APP_ICA_ENABLED === 'true';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat request through the proxy and return the assistant's text.
 * Keep max_tokens small — ICA only honors max_tokens and caps output ~4096.
 */
export async function icaChat(
  messages: ChatMessage[],
  maxTokens = 500,
  // Route to a specific ICA agent server-side (e.g. 'coach' → the dedicated
  // contributions-analysis agent). The proxy maps this to the right model id.
  agent?: 'coach'
): Promise<string> {
  const res = await fetch(`${PROXY_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, max_tokens: maxTokens, agent }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`ICA proxy ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('ICA returned no content');
  }
  return content.trim();
}

export interface InsightContext {
  name: string;
  role: string;
  month: string;
  metrics: { title: string; value: string | number; subtitle: string }[];
  contributions: { title: string; category: string; impact: string }[];
  /** Friendly-labeled skill scores, e.g. { "Visual Design": 90, ... }. */
  skills: Record<string, number>;
}

const metricsLine = (ctx: InsightContext) =>
  ctx.metrics.map((m) => `${m.title}: ${m.value} (${m.subtitle})`).join('; ');

const contributionsLine = (ctx: InsightContext) =>
  ctx.contributions
    .map((c) => `${c.title} [${c.category}, ${c.impact}]`)
    .join('; ');

const skillsLine = (ctx: InsightContext) =>
  Object.entries(ctx.skills)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');

async function fetchMonthlySummary(ctx: InsightContext): Promise<string> {
  return icaChat(
    [
      {
        role: 'system',
        content:
          'You are IBM GrowthIQ, a performance-growth assistant. Write concise, ' +
          'specific, encouraging summaries in second person ("you"). Plain text ' +
          'only — no markdown, no bullet points, no preamble. 2-3 sentences. Frame growth ' +
          'as building readiness for the next band; never promise or imply a promotion is ' +
          'guaranteed (that decision rests with managers and IBM policy).',
      },
      {
        role: 'user',
        content:
          `Employee: ${ctx.name}, ${ctx.role}.\n` +
          `Month: ${ctx.month}.\n` +
          `Metrics: ${metricsLine(ctx)}.\n` +
          `Recent contributions: ${contributionsLine(ctx)}.\n` +
          `Skill scores (0-100): ${skillsLine(ctx)}.\n\n` +
          'Write a 2-3 sentence monthly summary that names their strongest wins ' +
          'and one growth focus that builds their readiness for the next band ' +
          '(do not promise a promotion).',
      },
    ],
    400
  );
}

async function fetchCareerNudge(ctx: InsightContext): Promise<string> {
  const lowest = Object.entries(ctx.skills).sort((a, b) => a[1] - b[1])[0];
  return icaChat(
    [
      {
        role: 'system',
        content:
          'You are IBM GrowthIQ, a career-growth coach. Write ONE short, ' +
          'actionable nudge (1-2 sentences) in second person. Plain text only ' +
          '— no markdown, no preamble. Frame it as building band readiness, not ' +
          'guaranteeing a promotion.',
      },
      {
        role: 'user',
        content:
          `Employee: ${ctx.name}, ${ctx.role}.\n` +
          `Skill scores (0-100): ${skillsLine(ctx)}.\n` +
          (lowest
            ? `Their weakest area is "${lowest[0]}" at ${lowest[1]}.\n\n`
            : '\n') +
          'Suggest one concrete action this month to raise that weakest area, ' +
          'and mention roughly how many points they are from "exceeding expectations".',
      },
    ],
    300
  );
}

// Single-flight cache: the dashboard renders one employee, so each insight is
// fetched at most once per page load. React StrictMode double-mounts and repeat
// renders reuse the in-flight promise instead of firing duplicate requests. On
// failure the cache is cleared so a later mount can retry.
let summaryPromise: Promise<string> | null = null;
let nudgePromise: Promise<string> | null = null;

/** Generate the dark "AI Monthly Summary" banner copy (deduped per session). */
export function generateMonthlySummary(ctx: InsightContext): Promise<string> {
  if (!summaryPromise) {
    summaryPromise = fetchMonthlySummary(ctx).catch((err) => {
      summaryPromise = null;
      throw err;
    });
  }
  return summaryPromise;
}

/** Generate the blue "AI Career Nudge" recommendation copy (deduped per session). */
export function generateCareerNudge(ctx: InsightContext): Promise<string> {
  if (!nudgePromise) {
    nudgePromise = fetchCareerNudge(ctx).catch((err) => {
      nudgePromise = null;
      throw err;
    });
  }
  return nudgePromise;
}

// --- AI Career Coach: a conversational assistant grounded in the employee's
// GrowthIQ profile so answers are personalized to their gaps and wins. ---

const COACH_SYSTEM =
  'You are the IBM GrowthIQ AI Career Coach for Aarav, a Designer at IBM iX India, ' +
  'currently Band 7 and working toward Band 8 (target Q1 2027). Your guidance follows ' +
  'the iX India Design Goals 2025 framework, which measures performance across four ' +
  'dimensions (Band 8 bar = 85):\n' +
  '- Outcomes: client engagements/workshops, chargeable utilization, trusted client ' +
  'relationships, quality-first delivery, influencing and leading design.\n' +
  '- Skills: a T-shape skillset — mastery in a core discipline, JRS proficiency, ' +
  'credentials, contributing to your Community of Practice with assets/POVs, and ' +
  'emerging practices (Design for AI, Sustainability, IBM Garage).\n' +
  '- Behaviors: the IBM Growth Behaviors, collaboration, joining studio & CoP ' +
  'initiatives, and representing the studio at IBM initiatives.\n' +
  '- Leadership: leading initiatives that drive strategic client & IBM outcomes, ' +
  'motivating teams, and crafting career paths for direct reports.\n' +
  '- Client Success: client satisfaction, trusted relationships, repeat engagements and ' +
  'measurable client outcomes.\n' +
  'IMPORTANT: You help build READINESS for the next band. The promotion decision itself ' +
  'rests with managers and IBM policy — never imply a promotion is guaranteed or promise a band. ' +
  'Frame suggestions as strengthening a dimension / improving readiness.\n' +
  'Ground answers in the profile below; be concise, warm, and action-oriented. Plain ' +
  'text, short paragraphs; a few dash bullets are fine. Never invent facts beyond it.\n\n' +
  'PROFILE (0-100, Band 8 bar = 85):\n' +
  '- Outcomes 86, Skills 88, Behaviors 82, Leadership 70, Client Success 84 — Leadership is the key readiness gap.\n' +
  '- Recent wins: led the retail checkout redesign (+28% conversion, Outcomes); shipped 40+ ' +
  'design-system components and a reusable CoP POV (Skills); led C-suite co-creation ' +
  'workshops (Leadership); represented the India iX studio at IBM Design Week (Behaviors).\n' +
  '- Peer ranking: top 12% of designers. Impact Score 762 (weighted 0-1000 index). Band 8 readiness 74%.';

/** Send the coach conversation (user/assistant turns) and return the reply. */
export async function chatWithCoach(
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  // Routes to the dedicated coach agent when one is configured in proxy/.env
  // (ICA_COACH_MODEL_ID); otherwise falls back to the default GrowthIQ agent.
  return icaChat([{ role: 'system', content: COACH_SYSTEM }, ...history], 1200, 'coach');
}

// --- Recognition ingestion: turn a raw Slack/Outlook message into a structured
// contribution the employee can review. ---

export interface ExtractedContribution {
  isContribution: boolean;
  title: string;
  category: Contribution['category'];
  impact: Contribution['impact'];
  summary: string;
  aiExtracted: boolean;
}

const CATEGORIES: Contribution['category'][] = [
  'Outcomes',
  'Skills',
  'Behaviors',
  'Leadership',
];
const IMPACTS: Contribution['impact'][] = [
  'Low Impact',
  'Medium Impact',
  'High Impact',
  'Critical Impact',
];

// Keyword-based fallback used when ICA is disabled or returns unusable output.
// Maps to the four iX India Design Goals dimensions.
function heuristicExtract(raw: RawMessage): ExtractedContribution {
  const firstSentence = raw.text.split(/(?<=[.!?])\s/)[0].slice(0, 120);
  const t = raw.text.toLowerCase();
  let category: Contribution['category'] = 'Outcomes';
  if (
    t.includes('lead') ||
    t.includes('initiative') ||
    t.includes('mentor') ||
    t.includes('workshop') ||
    t.includes('stakeholder')
  )
    category = 'Leadership';
  else if (
    t.includes('studio') ||
    t.includes('community') ||
    t.includes('cop') ||
    t.includes('collaborat') ||
    t.includes('present') ||
    t.includes('represent') ||
    t.includes('team')
  )
    category = 'Behaviors';
  else if (
    t.includes('component') ||
    t.includes('design system') ||
    t.includes('craft') ||
    t.includes('asset') ||
    t.includes('research') ||
    t.includes('prototype') ||
    t.includes('accessib')
  )
    category = 'Skills';
  return {
    isContribution: true,
    title: firstSentence,
    category,
    impact: 'Medium Impact',
    summary: raw.text.slice(0, 140),
    aiExtracted: false,
  };
}

/**
 * Extract a structured contribution from a recognition/feedback message using
 * the ICA agent. One bounded call per message (ICA-NOTES §1b). Falls back to a
 * keyword heuristic if ICA is off, unreachable, or returns unparseable output.
 */
export async function extractContribution(
  raw: RawMessage
): Promise<ExtractedContribution> {
  if (!ICA_ENABLED) return heuristicExtract(raw);

  try {
    const text = await icaChat(
      [
        {
          role: 'system',
          content:
            'You extract a single structured work contribution from a recognition or feedback ' +
            'message. Respond with ONLY a compact JSON object — no markdown, no code fences, no prose.',
        },
        {
          role: 'user',
          content:
            `Message from ${raw.from} in ${raw.channel} (${raw.source}):\n` +
            `"""${raw.text}"""\n\n` +
            'Describe the contribution this recognition is about, from the recognized employee\'s ' +
            'perspective. Return a JSON object with exactly these keys:\n' +
            '- "isContribution": boolean (false if it is not about a real work achievement)\n' +
            '- "title": a crisp past-tense achievement title, <= 90 chars, no surrounding quotes\n' +
            `- "category": one of ${JSON.stringify(CATEGORIES)}\n` +
            `- "impact": one of ${JSON.stringify(IMPACTS)}\n` +
            '- "summary": one sentence on why it mattered\n' +
            'Output JSON only.',
        },
      ],
      250
    );

    const parsed = JSON.parse(text.replace(/```(?:json)?/gi, '').trim());
    const fallback = heuristicExtract(raw);
    return {
      isContribution: parsed.isContribution !== false,
      title: String(parsed.title || fallback.title).slice(0, 120),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : fallback.category,
      impact: IMPACTS.includes(parsed.impact) ? parsed.impact : 'High Impact',
      summary: String(parsed.summary || fallback.summary),
      aiExtracted: true,
    };
  } catch (err) {
    return heuristicExtract(raw);
  }
}
