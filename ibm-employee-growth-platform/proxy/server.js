#!/usr/bin/env node
'use strict';

/**
 * ICA proxy — zero-dependency Node (18+, built-in fetch) HTTP server that sits
 * between the browser dashboard and the ICA Developer API.
 *
 * Why this exists (see ICA-NOTES.md §1 & §6):
 *   - The ICA API key MUST stay server-side; it can never ship to the browser.
 *   - The browser has a CORS-restricted origin and cannot call ICA directly.
 * So the React app talks only to this proxy, and the proxy holds the key and
 * adds permissive CORS headers.
 *
 * Config comes from proxy/.env (copy proxy/.env.example). Nothing secret is
 * committed — .env is gitignored.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// --- tiny .env loader (zero-dep, so we don't depend on a Node flag/version) ---
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = raw.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m || raw.trim().startsWith('#')) continue;
    const key = m[1];
    let val = (m[2] || '').trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const {
  ICA_API_KEY = '',
  ICA_BASE_URL = 'https://api.nextgen-beta.ica.ibm.com/ica/v1',
  ICA_NAMESPACE = 'assistants',
  ICA_MODEL_ID = '',
  // Optional dedicated agent for Ask Coach (your contributions-analysis agent).
  // When set, requests with { agent: 'coach' } route here; otherwise they fall
  // back to ICA_MODEL_ID. Must live under the same account as ICA_API_KEY.
  ICA_COACH_MODEL_ID = '',
  ICA_COACH_NAMESPACE = '',
  YL_BASE_URL = 'https://yourlearning.ibm.com',
  YL_TOKEN = '',  // Set in proxy/.env — never hardcode tokens here
  YC_BASE_URL = 'https://api.yourlearning.ibm.com',
  YC_TOKEN = '',
  YC_EMPLOYEE_ID = '',
  MYSCORE_URL = '',
  MYSCORE_COOKIE = '',
  // BIW / ThanksBIW activity-feed token (personal JWT, ~1 h TTL).
  // Get it from your browser's Network tab while on recognition-now.io.
  BIW_TOKEN = '',
  BIW_BASE_URL = 'https://api.biw.cloud/v1/activity-feed/activity-feed',
  PORT = '3001',
} = process.env;

const BASE = ICA_BASE_URL.replace(/\/$/, '');
const YL_BASE = YL_BASE_URL.replace(/\/$/, '');
const YC_BASE = YC_BASE_URL.replace(/\/$/, '');

// MyScore renders its data into the HTML page (no JSON API). Parse the pieces
// we need out of that HTML into a compact object for the dashboard.
function parseMyScore(html) {
  const historical = [];
  const block = html.match(/const historicalData\s*=\s*\[([\s\S]*?)\];/);
  if (block) {
    const re = /\{\s*group:\s*'([^']*)',\s*date:\s*'([^']*)',\s*value:\s*'([^']*)'\s*\}/g;
    let m;
    while ((m = re.exec(block[1])) !== null) {
      historical.push({ group: m[1], date: m[2], value: parseFloat(m[3]) });
    }
  }

  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const statusOf = (label, window = 90) => {
    const mm = text.match(
      new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + `.{0,${window}}?(Met|Not Met|Not Applicable)`)
    );
    return mm ? mm[1] : null;
  };

  const pick = (group, date) => {
    const row = historical.find((r) => r.group === group && r.date === date);
    return row ? row.value : null;
  };
  const bandMatch = text.match(/Foundation Band (\d+)/);

  return {
    historical,
    band: bandMatch ? `Band ${bandMatch[1]}` : null,
    chargeableRolling: pick('Chargeable', 'Current Rolling 4 Quarters'),
    chargeablePrior: pick('Chargeable', 'Prior 4 Quarters'),
    chargeableGoal: pick('Goal', '2Q 2026') || pick('Goal', '1Q 2026'),
    attainmentRolling: pick('Attainment', 'Current Rolling 4 Quarters'),
    attainmentPrior: pick('Attainment', 'Prior 4 Quarters'),
    expectations: [
      { name: 'JRS Proficiency', status: statusOf('JRS Status') },
      { name: 'Skills Proficiency', status: statusOf('Skills Status') },
      { name: 'Annual IBM Core Training', status: statusOf('Annual IBM Core Training', 140) },
    ].filter((e) => e.status),
  };
}

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const json = (res, status, obj) => {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 5e6) req.destroy(); // 5MB guard
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }

  // Health check — safe to call without a key; reports config state.
  if (url.pathname === '/api/health') {
    return json(res, 200, {
      ok: true,
      hasKey: Boolean(ICA_API_KEY),
      base: BASE,
      namespace: ICA_NAMESPACE,
      model: ICA_MODEL_ID || null,
      hasYlToken: Boolean(YL_TOKEN),
    });
  }

  // --- YourLearning transcript summary (independent of ICA) ---
  // Holds the personal Bearer token server-side and forwards the GET so the
  // browser never sees the token and isn't blocked by CORS.
  if (url.pathname === '/api/learning/summary' && req.method === 'GET') {
    if (!YL_TOKEN) {
      return json(res, 503, {
        error: 'YL_TOKEN is not set. Add your YourLearning Bearer token to proxy/.env.',
      });
    }
    try {
      const r = await fetch(`${YL_BASE}/api/v3/ibm/transcript/summary`, {
        headers: { Authorization: `Bearer ${YL_TOKEN}`, Accept: 'application/json' },
      });
      const text = await r.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        // Non-JSON (e.g. an expired-token HTML login page) — surface a clear error.
        return json(res, r.status === 200 ? 502 : r.status, {
          error: 'YourLearning did not return JSON (token may be expired).',
        });
      }
      return json(res, r.status, payload);
    } catch (err) {
      return json(res, 502, {
        error: 'YourLearning proxy error',
        detail: String((err && err.message) || err),
      });
    }
  }

  // --- YourCareer@IBM skill recommendations (independent of ICA) ---
  // Holds the personal Bearer token server-side and forwards the GET so the
  // browser never sees the token and isn't blocked by CORS.
  if (url.pathname.startsWith('/api/yourcareer/skills/') && req.method === 'GET') {
    if (!YC_TOKEN) {
      return json(res, 503, {
        error: 'YC_TOKEN is not set. Add your YourCareer Bearer token to proxy/.env.',
      });
    }
    
    const employeeId = url.pathname.split('/').pop() || YC_EMPLOYEE_ID;
    if (!employeeId) {
      return json(res, 400, {
        error: 'Employee ID is required. Provide it in the URL or set YC_EMPLOYEE_ID in proxy/.env.',
      });
    }
    
    try {
      const apiUrl = `${YC_BASE}/yc-v3/ibm/employees/${employeeId}/skillIHaveRecommendations`;
      const r = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${YC_TOKEN}`,
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; GrowthIQ/1.0)',
        },
      });
      
      const text = await r.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. expired token HTML page)
        return json(res, r.status === 200 ? 502 : r.status, {
          error: 'YourCareer did not return JSON (token may be expired).',
        });
      }
      
      return json(res, r.status, payload);
    } catch (err) {
      return json(res, 502, {
        error: 'YourCareer proxy error',
        detail: String((err && err.message) || err),
      });
    }
  }
  // --- YourCareer@IBM My Skills (skill proficiency levels) ---
  if (url.pathname.startsWith('/api/yourcareer/myskills/') && req.method === 'GET') {
    if (!YC_TOKEN) {
      return json(res, 503, {
        error: 'YC_TOKEN is not set. Add your YourCareer Bearer token to proxy/.env.',
      });
    }
    
    const employeeId = url.pathname.split('/').pop() || YC_EMPLOYEE_ID;
    if (!employeeId) {
      return json(res, 400, {
        error: 'Employee ID is required. Provide it in the URL or set YC_EMPLOYEE_ID in proxy/.env.',
      });
    }
    
    try {
      // The actual YourCareer API endpoint for discrete skills data
      const apiUrl = `${YC_BASE}/yc-v3/ibm/employees/${employeeId}/discreteSkills`;
      const r = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${YC_TOKEN}`,
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; GrowthIQ/1.0)',
        },
      });
      
      const text = await r.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. expired token HTML page)
        return json(res, r.status === 200 ? 502 : r.status, {
          error: 'YourCareer did not return JSON (token may be expired).',
        });
      }
      
      return json(res, r.status, payload);
    } catch (err) {
      return json(res, 502, {
        error: 'YourCareer My Skills proxy error',
        detail: String((err && err.message) || err),
      });
    }
  }


  // --- BIW / ThanksBIW activity-feed (Recognition Received + Points Deposited) ---
  // Holds the personal JWT server-side. The browser calls GET /api/biw/activities
  // and this proxy adds the Authorization header and forwards to the BIW API.
  //
  // API quirk: POST /search exists but its body-parser is broken server-side
  // (body is always undefined). The correct call is POST /search with
  // startDate + endDate as QUERY PARAMS plus an empty JSON body.
  if (url.pathname === '/api/biw/activities' && req.method === 'GET') {
    if (!BIW_TOKEN) {
      return json(res, 503, {
        error: 'BIW_TOKEN is not set in proxy/.env. Add your ThanksBIW Bearer token.',
      });
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      // startDate + endDate must be query params (body parser broken on their server)
      const biwUrl = `${BIW_BASE_URL}/search?startDate=${oneYearAgo}&endDate=${today}&limit=50&page=1`;
      const r = await fetch(biwUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BIW_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      const text = await r.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        return json(res, r.status === 200 ? 502 : r.status, {
          error: 'BIW API did not return JSON (token may be expired).',
        });
      }
      // Unwrap the BIW envelope — any error/expired-token response → empty items
      // so the React client gracefully falls back to sample data.
      if (!payload || payload.success === false || payload.exp || payload.errors) {
        console.warn('[BIW] API error/expired:', JSON.stringify(payload).slice(0, 120));
        return json(res, 200, { items: [] });
      }
      return json(res, r.status, payload);
    } catch (err) {
      return json(res, 502, {
        error: 'BIW proxy error',
        detail: String((err && err.message) || err),
      });
    }
  }

  // --- IBM MyScore business scorecard (independent of ICA) ---
  // Holds the session cookie server-side, fetches the HTML page, and returns the
  // parsed metrics as JSON so the browser never sees the cookie.
  if (url.pathname === '/api/myscore/metrics' && req.method === 'GET') {
    if (!MYSCORE_URL || !MYSCORE_COOKIE) {
      return json(res, 503, {
        error: 'MYSCORE_URL / MYSCORE_COOKIE are not set in proxy/.env.',
      });
    }
    try {
      const r = await fetch(MYSCORE_URL, {
        headers: { Cookie: MYSCORE_COOKIE, Accept: 'text/html' },
      });
      const html = await r.text();
      // A login/redirect page won't contain the data block.
      if (!/const historicalData\s*=/.test(html)) {
        return json(res, 502, {
          error: 'MyScore returned no data (cookie may be expired).',
        });
      }
      return json(res, 200, parseMyScore(html));
    } catch (err) {
      return json(res, 502, {
        error: 'MyScore proxy error',
        detail: String((err && err.message) || err),
      });
    }
  }

  if (!ICA_API_KEY) {
    return json(res, 503, {
      error:
        'ICA_API_KEY is not set. Copy proxy/.env.example to proxy/.env and fill in your key.',
    });
  }

  try {
    // List assistants/agents/models for a namespace (handy for finding the id).
    if (url.pathname === '/api/list' && req.method === 'GET') {
      const ns = url.searchParams.get('ns') || ICA_NAMESPACE;
      const r = await fetch(`${BASE}/${ns}`, {
        headers: { Authorization: `Bearer ${ICA_API_KEY}` },
      });
      return json(res, r.status, await r.json().catch(() => ({})));
    }

    // Chat completion — the main route the dashboard uses.
    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      // Ask Coach routes to a dedicated agent when one is configured; everything
      // else uses the default agent. An explicit body.model still wins.
      const isCoach = body.agent === 'coach';
      const namespace =
        body.namespace ||
        (isCoach && ICA_COACH_NAMESPACE) ||
        ICA_NAMESPACE;
      const model =
        body.model ||
        (isCoach && ICA_COACH_MODEL_ID) ||
        ICA_MODEL_ID;

      if (!model) {
        return json(res, 400, {
          error:
            'No model/agent id. Set ICA_MODEL_ID in proxy/.env (or pass "model" in the request).',
        });
      }

      // Accept either a ready-made messages array (multi-turn / multimodal) or
      // a single message string (forward messages unchanged for image blocks).
      const messages = Array.isArray(body.messages)
        ? body.messages
        : [{ role: 'user', content: String(body.message || '') }];

      // Per ICA-NOTES.md §1a: max_tokens is the ONLY honored knob. Do not send
      // temperature / top_p / reasoning_effort — the Bedrock route 400s on them.
      const payload = {
        model,
        messages,
        stream: false,
        max_tokens: Number(body.max_tokens) || 800,
      };

      const r = await fetch(`${BASE}/${namespace}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ICA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return json(res, r.status, await r.json().catch(() => ({})));
    }

    return json(res, 404, { error: 'Not found' });
  } catch (err) {
    return json(res, 502, {
      error: 'Proxy error',
      detail: String((err && err.message) || err),
    });
  }
});

server.listen(Number(PORT), () => {
  console.log(`[ica-proxy] listening on http://localhost:${PORT}`);
  console.log(
    `[ica-proxy] base=${BASE} ns=${ICA_NAMESPACE} model=${
      ICA_MODEL_ID || '(unset)'
    } key=${ICA_API_KEY ? 'set' : 'MISSING'}`
  );
});
