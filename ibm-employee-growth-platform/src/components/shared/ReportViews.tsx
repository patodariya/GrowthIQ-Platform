import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { Download, CheckmarkFilled, WarningAltFilled, View, Edit, Save, TrashCan, Add, Ai } from '@carbon/icons-react';
import { computeImpactScore } from '../../services/impactScore';
import * as Recharts from 'recharts';
import { MyScoreData } from '../../services/myScore';
import { BiWActivity } from '../../services/biw';
import { Contribution } from '../../types';
import './ReportViews.scss';

// recharts 3 + React 19 emits spurious JSX-component type errors; pull the
// components off the namespace as `any` (same pattern used across the app).
const {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} = Recharts as any;

const DIMENSIONS = ['Outcomes', 'Skills', 'Behaviors', 'Leadership', 'Client Success'] as const;
const DIM_COLOR: Record<string, string> = {
  Outcomes:         '#3b7ef8',
  Skills:           '#7c3aed',
  Behaviors:        '#2d6e6e',
  Leadership:       '#e85555',
  'Client Success': '#f5923e',
};
const IMPACT_COLORS: Record<string, string> = {
  'Critical Impact': '#da1e28',
  'High Impact':     '#ff832b',
  'Medium Impact':   '#f1c21b',
  'Low Impact':      '#42be65',
};
const BAND8_BAR = 85;

// Triggers the browser's print dialog → "Save as PDF". A print stylesheet
// (App.scss) isolates the open modal so only the report is captured.
export const downloadReport = () => window.print();

const ReportActions: React.FC<{ note?: string; onViewEvidence?: () => void; hideDownload?: boolean }> = ({ note, onViewEvidence, hideDownload }) => (
  <div className="report__actions no-print">
    {note && <span className="report__actions-note">{note}</span>}
    <div className="report__actions-btns">
      {onViewEvidence && (
        <Button kind="tertiary" size="sm" renderIcon={View} onClick={onViewEvidence}>
          View Evidence
        </Button>
      )}
      {!hideDownload && (
        <Button kind="primary" size="sm" renderIcon={Download} onClick={downloadReport}>
          Download PDF
        </Button>
      )}
    </div>
  </div>
);

const Stat: React.FC<{ value: React.ReactNode; label: string; accent?: string }> = ({
  value,
  label,
  accent,
}) => (
  <div className="report-stat">
    <span className="report-stat__value" style={accent ? { color: accent } : undefined}>
      {value}
    </span>
    <span className="report-stat__label">{label}</span>
  </div>
);

const SectionH: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="report__h">{children}</p>
);

// A thin horizontal divider between major report sections
const Divider: React.FC = () => <hr className="report__divider" />;

// -------------------------------------------------------- Employee monthly --

interface EmployeeReportProps {
  name: string;
  month: string;
  summary: string;
  contribCount: number;
  impactScore: number;
  peer: string;
  readiness: string;
  chartData: { month: string; contributions: number }[];
  skills: {
    outcomes: number;
    skills: number;
    behaviors: number;
    leadership: number;
    clientSuccess: number;
  };
  contributions: Contribution[];
  myScore: MyScoreData;
  recognitions: BiWActivity[];
}

export const EmployeeReport: React.FC<EmployeeReportProps> = ({
  name,
  month,
  summary,
  contribCount,
  impactScore,
  peer,
  readiness,
  chartData,
  skills,
  contributions,
  myScore,
  recognitions,
}) => {
  // ── derived data ────────────────────────────────────────────────────────────
  const dimData = [
    { dim: 'Outcomes',      score: skills.outcomes },
    { dim: 'Skills',        score: skills.skills },
    { dim: 'Behaviors',     score: skills.behaviors },
    { dim: 'Leadership',    score: skills.leadership },
    { dim: 'Client Success', score: skills.clientSuccess },
  ];
  const lowest = [...dimData].sort((a, b) => a.score - b.score)[0];

  // Contribution breakdown by category (pie)
  const catMap: Record<string, number> = {};
  contributions.forEach((c) => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
  const catPie = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Contribution breakdown by impact level (horizontal bar)
  const impactOrder = ['Critical Impact', 'High Impact', 'Medium Impact', 'Low Impact'];
  const impactMap: Record<string, number> = {};
  contributions.forEach((c) => { impactMap[c.impact] = (impactMap[c.impact] || 0) + 1; });
  const impactBar = impactOrder
    .filter((k) => impactMap[k])
    .map((k) => ({ impact: k.replace(' Impact', ''), count: impactMap[k], fill: IMPACT_COLORS[k] }));

  // Verified vs pending
  const verifiedCount = contributions.filter((c) => c.verified).length;
  const pendingCount  = contributions.length - verifiedCount;

  // MyScore quarterly trend (chargeable vs goal)
  const msChargeable = myScore.historical.filter((p) => p.group === 'Chargeable');
  const msGoal       = myScore.historical.filter((p) => p.group === 'Goal');
  const msQuarters   = myScore.historical.reduce<string[]>((acc, p) => acc.includes(p.date) ? acc : [...acc, p.date], []);
  const msTrend = msQuarters.map((q) => ({
    quarter:    q,
    Chargeable: msChargeable.find((p) => p.date === q)?.value ?? null,
    Goal:       msGoal.find((p) => p.date === q)?.value ?? null,
  }));

  return (
    <div className="report">
      <ReportActions note={`Monthly Growth Report · ${name} · ${month}`} />

      {/* ── Cover ────────────────────────────────────────────────────────── */}
      <div className="report__cover">
        <div className="report__cover-title">Employee Monthly Growth Report</div>
        <div className="report__cover-sub">{name} · {month} · IBM iX India</div>
      </div>

      <div className="report__stats report__stats--6">
        <Stat value={contribCount}  label="Total Contributions" />
        <Stat value={verifiedCount} label="Verified" accent="#24a148" />
        <Stat value={pendingCount}  label="Pending" accent="#f1c21b" />
        <Stat value={impactScore}   label="Impact Score" accent="#8a3ffc" />
        <Stat value={peer}          label="Peer Ranking" accent="#0f62fe" />
        <Stat value={readiness}     label="Band 8 Readiness" accent="#24a148" />
      </div>

      <Divider />

      {/* ── 1. Overview ──────────────────────────────────────────────────── */}
      <SectionH>1 · Overview</SectionH>

      <div className="report__two-col">
        <div>
          <p className="report__chart-label">Contribution Trend (Monthly)</p>
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="repArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0f62fe" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f62fe" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="contributions" stroke="#0f62fe" strokeWidth={2} fill="url(#repArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="report__chart-label">Contributions by Category</p>
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {catPie.map((entry, i) => (
                    <Cell key={i} fill={Object.values(DIM_COLOR)[i % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report__two-col" style={{ marginTop: '0.75rem' }}>
        <div>
          <p className="report__chart-label">Contributions by Impact Level</p>
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={impactBar} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="impact" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} width={72} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {impactBar.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="report__chart-label">Dimension Scores vs Band 8 Bar</p>
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dimData} margin={{ top: 4, right: 24, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="dim" tick={{ fontSize: 9, fill: '#6f6f6f' }} tickLine={false} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <ReferenceLine y={BAND8_BAR} stroke="#da1e28" strokeDasharray="4 4" label={{ value: 'Band 8', position: 'right', fontSize: 9, fill: '#da1e28' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {dimData.map((d) => <Cell key={d.dim} fill={DIM_COLOR[d.dim]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Divider />

      {/* ── 2. Contribution Tracker ──────────────────────────────────────── */}
      <SectionH>2 · Contribution Tracker</SectionH>
      <p className="report__chart-label" style={{ marginBottom: '0.5rem' }}>
        {verifiedCount} verified · {pendingCount} pending · {contributions.length} total
      </p>
      <table className="report__table">
        <thead>
          <tr>
            <th>Contribution</th>
            <th>Category</th>
            <th>Impact</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td><span className="report__tag" style={{ background: DIM_COLOR[c.category] + '22', color: DIM_COLOR[c.category] }}>{c.category}</span></td>
              <td><span className="report__tag report__tag--impact" style={{ color: IMPACT_COLORS[c.impact] }}>{c.impact}</span></td>
              <td className="report__td-muted">{c.date}</td>
              <td>{c.verified
                ? <span className="report__badge report__badge--ok">Verified</span>
                : <span className="report__badge report__badge--warn">Pending</span>
              }</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider />

      {/* ── 3. MyScore ───────────────────────────────────────────────────── */}
      <SectionH>3 · MyScore</SectionH>
      <div className="report__stats report__stats--3">
        <Stat value={myScore.attainmentRolling !== null ? `${myScore.attainmentRolling}%` : '—'} label="Attainment (Rolling)" accent="#0f62fe" />
        <Stat value={myScore.attainmentPrior   !== null ? `${myScore.attainmentPrior}%`   : '—'} label="Attainment (Prior)" />
        <Stat value={myScore.band ?? '—'} label="Band" />
      </div>
      {msTrend.length > 0 && (
        <>
          <p className="report__chart-label" style={{ marginTop: '0.75rem' }}>Chargeable Utilization vs Goal (Quarterly)</p>
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={msTrend} margin={{ top: 8, right: 20, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Chargeable" stroke="#0f62fe" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Goal"       stroke="#da1e28" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <Divider />

      {/* ── 4. Recognition ───────────────────────────────────────────────── */}
      <SectionH>4 · Recognition</SectionH>
      {recognitions.length === 0 ? (
        <p className="report__muted">No recognitions recorded this period.</p>
      ) : (
        <ul className="report__recognition-list">
          {recognitions.map((r) => (
            <li key={r.id} className="report__recognition-item">
              <div className="report__recognition-avatar" style={{ background: r.isManager ? '#0f62fe' : r.type === 'Points Deposited' ? '#ff832b' : '#8a3ffc' }}>
                {r.fromInitials}
              </div>
              <div className="report__recognition-body">
                <div className="report__recognition-from">
                  <strong>{r.from}</strong>
                  {r.isManager && <span className="report__badge report__badge--ok" style={{ marginLeft: '0.5rem' }}>Manager</span>}
                  <span className="report__badge" style={{ marginLeft: '0.375rem', background: r.type === 'Points Deposited' ? '#edf5ff' : '#d9fbde', color: r.type === 'Points Deposited' ? '#0043ce' : '#0e6027' }}>{r.type}</span>
                  {r.points !== undefined && r.points > 0 && (
                    <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f62fe' }}>+{r.points.toLocaleString()} pts</span>
                  )}
                  <span className="report__td-muted" style={{ marginLeft: 'auto' }}>{r.date}</span>
                </div>
                <p className="report__recognition-msg">"{r.message}"</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Divider />

      {/* ── 5. Feedback & Summary ────────────────────────────────────────── */}
      <SectionH>5 · Feedback &amp; Summary</SectionH>
      <p className="report__body">{summary}</p>
      <div className="report__callout" style={{ marginTop: '0.875rem' }}>
        <strong>Focus area:</strong> {lowest.dim} ({lowest.score}) is your biggest gap to the Band 8
        bar — strengthening it would most improve your readiness. The promotion decision itself rests
        with your manager and IBM policy.
      </div>
      <div className="report__callout report__callout--neutral" style={{ marginTop: '0.625rem' }}>
        <strong>Manager feedback:</strong> Exceptional craft and leadership on the design system
        rollout. Keep building the {lowest.dim} dimension to close the gap for Band 8.
      </div>
    </div>
  );
};

// ------------------------------------------------------------ Manager kits --

interface MatrixRow {
  name: string;
  band: string;
  scores: Record<string, number>;
  overall: number;
  ready: boolean;
}

interface ReviewKitProps {
  contribByMember: Array<Record<string, any>>;
  dimSeries: { key: string; color: string }[];
  matrix: MatrixRow[];
}

export const ReviewKitReport: React.FC<ReviewKitProps> = ({
  contribByMember,
  dimSeries,
  matrix,
}) => {
  const totalContribs = contribByMember.reduce(
    (sum, m) => sum + dimSeries.reduce((s, d) => s + (m[d.key] || 0), 0),
    0
  );
  const ready = matrix.filter((m) => m.ready);
  const avgReadiness = Math.round(matrix.reduce((s, m) => s + m.overall, 0) / matrix.length);

  // Average readiness per dimension across the team.
  const avgByDim = DIMENSIONS.map((d) => ({
    dim: d,
    score: Math.round(matrix.reduce((s, m) => s + (m.scores[d] || 0), 0) / matrix.length),
  }));

  return (
    <div className="report">
      <ReportActions note="Team Review Kit · Q3 2026" />

      <div className="report__stats">
        <Stat value={totalContribs} label="Verified contributions" />
        <Stat value={`${ready.length} / ${matrix.length}`} label="Promotion-ready" accent="#24a148" />
        <Stat value={`${avgReadiness}%`} label="Avg readiness" accent="#0f62fe" />
        <Stat value={matrix.length} label="Direct Reportee (DR)" />
      </div>

      <SectionH>Contributions by member &amp; dimension</SectionH>
      <div className="report__chart">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={contribByMember} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} width={64} />
            <Tooltip />
            {dimSeries.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="c" fill={s.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="report__legend">
          {dimSeries.map((s) => (
            <span key={s.key} className="report__legend-item">
              <i style={{ background: s.color }} /> {s.key}
            </span>
          ))}
        </div>
      </div>

      <SectionH>Average team readiness by dimension</SectionH>
      <div className="report__chart">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={avgByDim} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
            <XAxis dataKey="dim" tick={{ fontSize: 10.5, fill: '#6f6f6f' }} tickLine={false} interval={0} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
            <Tooltip />
            <ReferenceLine y={BAND8_BAR} stroke="#da1e28" strokeDasharray="4 4" label={{ value: 'Bar 85', position: 'right', fontSize: 10, fill: '#da1e28' }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {avgByDim.map((d) => (
                <Cell key={d.dim} fill={DIM_COLOR[d.dim]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionH>Promotion-ready ({ready.length})</SectionH>
      <ul className="report__list">
        {ready.map((m) => (
          <li key={m.name}>
            <CheckmarkFilled size={16} className="ic-ok" />
            <span>
              <strong>{m.name}</strong> — {m.band} · {m.overall}% overall readiness
            </span>
          </li>
        ))}
      </ul>

      <SectionH>Needs attention ({matrix.length - ready.length})</SectionH>
      <ul className="report__list">
        {matrix
          .filter((m) => !m.ready)
          .map((m) => (
            <li key={m.name}>
              <WarningAltFilled size={16} className="ic-warn" />
              <span>
                <strong>{m.name}</strong> — {m.band} · {m.overall}% · lift{' '}
                {
                  DIMENSIONS.reduce(
                    (lo, d) => (m.scores[d] < m.scores[lo] ? d : lo),
                    DIMENSIONS[0] as string
                  )
                }
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

interface PrepKitProps {
  name: string;
  band: string;
  overall: number;
  scores: Record<string, number>;
  text: string;
  // evidence data — merged directly into the prep kit
  impactScore: number;
  contribs: EvidenceContrib[];
  onViewEvidence?: () => void;
}

export const PrepKitReport: React.FC<PrepKitProps> = ({ name, band, overall, scores, text, impactScore, contribs, onViewEvidence }) => {
  const nextBand = `Band ${parseInt(band.replace(/\D/g, ''), 10) + 1}`;

  // ── Evidence-derived data (same as EvidenceReport) ──
  const total      = contribs.length;
  const verifiedCt = contribs.filter((c) => c.verified).length;
  const dimData    = DIMENSIONS.map((d) => ({
    dim: d, score: scores[d] ?? 0,
    count: contribs.filter((c) => c.category === d).length,
  }));
  const pieData    = dimData.filter((d) => d.count > 0).map((d) => ({ name: d.dim, value: d.count }));
  const impactData = ['Critical Impact', 'High Impact', 'Medium Impact', 'Low Impact'].map((imp) => ({
    impact: imp.replace(' Impact', ''),
    count: contribs.filter((c) => c.impact === imp).length,
  }));
  const strengths     = dimData.filter((d) => d.score >= 85);
  const improvements  = dimData.filter((d) => d.score < 75).sort((a, b) => a.score - b.score);
  const topDim        = [...dimData].sort((a, b) => b.score - a.score)[0];
  const lowDim        = [...dimData].sort((a, b) => a.score - b.score)[0];

  // ── Editable manager assessment ──
  const [assessmentText, setAssessmentText] = useState(text);
  const [editingAssessment, setEditingAssessment] = useState(false);

  // ── Editable recommended next steps ──
  // aiGenerated=true → show AI icon; once edited/deleted it flips to false
  interface Step { id: number; text: string; aiGenerated: boolean }
  const defaultSteps: Step[] = [
    { id: 1, text: 'Attach the verified evidence trail to the calibration deck', aiGenerated: true },
    { id: 2, text: `Address ${lowDim.dim} explicitly with a stretch initiative`, aiGenerated: true },
    { id: 3, text: 'Schedule the peer-feedback round', aiGenerated: true },
  ];
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [stepDraft, setStepDraft] = useState('');

  const addStep = () => {
    const id = Date.now();
    setSteps((s) => [...s, { id, text: '', aiGenerated: false }]);
    setEditingStepId(id);
    setStepDraft('');
  };
  const saveStep = (id: number) => {
    if (stepDraft.trim()) setSteps((s) => s.map((x) => x.id === id ? { ...x, text: stepDraft.trim(), aiGenerated: false } : x));
    else setSteps((s) => s.filter((x) => x.id !== id));
    setEditingStepId(null);
    setStepDraft('');
  };
  const editStep = (step: Step) => { setEditingStepId(step.id); setStepDraft(step.text); };
  const deleteStep = (id: number) => { setSteps((s) => s.filter((x) => x.id !== id)); if (editingStepId === id) setEditingStepId(null); };

  // ── Editable manager notes ──
  interface Note { id: number; text: string }
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const addNote = () => {
    const id = Date.now();
    setNotes((n) => [...n, { id, text: '' }]);
    setEditingNoteId(id);
    setNoteDraft('');
  };
  const saveNote = (id: number) => {
    if (noteDraft.trim()) setNotes((n) => n.map((x) => x.id === id ? { ...x, text: noteDraft.trim() } : x));
    else setNotes((n) => n.filter((x) => x.id !== id));
    setEditingNoteId(null);
    setNoteDraft('');
  };
  const editNote = (note: Note) => { setEditingNoteId(note.id); setNoteDraft(note.text); };
  const deleteNote = (id: number) => { setNotes((n) => n.filter((x) => x.id !== id)); if (editingNoteId === id) setEditingNoteId(null); };

  return (
    <div className="report">
      <ReportActions note={`Promotion prep kit · ${name}`} hideDownload />

      {/* Stats — 4 tiles matching EvidenceReport */}
      <div className="report__stats report__stats--4 ev-stats-row">
        <Stat value={`${overall}%`}               label="Overall readiness"     accent="#24a148" />
        <Stat value={total}                        label="Total contributions" />
        <Stat value={`${verifiedCt} / ${total}`}  label="Verified"              accent="#24a148" />
        <Stat value={impactScore}                  label="Impact score (0–1000)" accent="#0f62fe" />
      </div>

      <div className="report__divider" />

      {/* ── Charts ── */}
      <SectionH>Readiness across the iX dimensions</SectionH>
      <div className="report__two-col">
        {/* Pie: contributions by dimension */}
        <div className="report__chart">
          <p className="report__chart-label">Contributions by dimension</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={72}
                label={({ name: n, percent }: any) => `${n} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={DIM_PIE_COLOR[entry.name] ?? '#8d8d8d'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar: readiness score per dimension */}
        <div className="report__chart">
          <p className="report__chart-label">Readiness score (Band 8 bar = 85)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dimData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dim" tick={{ fontSize: 10.5, fill: '#393939' }} tickLine={false} axisLine={false} width={88} />
              <ReferenceLine x={85} stroke="#da1e28" strokeDasharray="4 3" label={{ value: '85', fill: '#da1e28', fontSize: 10 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#393939' }}>
                {dimData.map((d) => (
                  <Cell key={d.dim} fill={d.score >= 85 ? '#24a148' : d.score >= 70 ? '#0f62fe' : '#da1e28'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact distribution */}
      <SectionH>Impact distribution</SectionH>
      <div className="report__chart">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={impactData} margin={{ top: 4, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
            <XAxis dataKey="impact" tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {impactData.map((d) => {
                const col = d.impact === 'Critical' ? '#da1e28' : d.impact === 'High' ? '#0f62fe' : d.impact === 'Medium' ? '#6929c4' : '#8d8d8d';
                return <Cell key={d.impact} fill={col} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="report__divider" />

      {/* Contribution summary by dimension */}
      <SectionH>Contribution summary by dimension</SectionH>
      {DIMENSIONS.map((dim) => {
        const dimContribs = contribs.filter((c) => c.category === dim);
        return (
          <div key={dim} className="ev-dim-section">
            <div className="ev-dim-section__head">
              <span className="ev-dim-section__badge" style={{ background: `${DIM_PIE_COLOR[dim]}18`, color: DIM_PIE_COLOR[dim] }}>{dim}</span>
              <span className="ev-dim-section__score">{scores[dim] ?? 0} / 100</span>
              <span className="ev-dim-section__count">{dimContribs.length} contribution{dimContribs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="ev-dim-section__bar-wrap">
              <div className="ev-dim-section__bar" style={{ width: `${scores[dim] ?? 0}%`, background: DIM_PIE_COLOR[dim] }} />
              <div className="ev-dim-section__bar-marker" />
            </div>
            {dimContribs.length === 0 ? (
              <p className="report__muted" style={{ margin: '0.5rem 0 0' }}>No contributions logged in this dimension yet.</p>
            ) : (
              <table className="report__table ev-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Contribution</th>
                    <th>Impact</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dimContribs.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>
                        <span className={`ev-impact ev-impact--${c.impact.split(' ')[0].toLowerCase()}`}>
                          {c.impact.replace(' Impact', '')}
                        </span>
                      </td>
                      <td className="report__td-muted">{c.date}</td>
                      <td>
                        {c.verified
                          ? <span className="ev-status ev-status--ok"><CheckmarkFilled size={13} /> Verified</span>
                          : <span className="ev-status ev-status--pending"><WarningAltFilled size={13} /> Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <div className="report__divider" />

      {/* Strengths */}
      <SectionH>Strengths</SectionH>
      {strengths.length > 0 ? (
        <ul className="report__list">
          {strengths.map((d) => (
            <li key={d.dim}>
              <CheckmarkFilled size={14} className="ic-ok" />
              <span><strong style={{ color: DIM_PIE_COLOR[d.dim] }}>{d.dim}</strong> — {d.score}/100, above the Band 8 bar. {contribs.filter((c) => c.category === d.dim && c.verified).length} verified contributions.</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="report__muted">No dimensions currently above the Band 8 bar (85).</p>
      )}

      {/* Areas for improvement */}
      <SectionH>Areas for improvement</SectionH>
      {improvements.length > 0 ? (
        <ul className="report__list">
          {improvements.map((d) => (
            <li key={d.dim}>
              <WarningAltFilled size={14} className="ic-warn" />
              <span><strong style={{ color: DIM_PIE_COLOR[d.dim] }}>{d.dim}</strong> — {d.score}/100 ({85 - d.score} pts below Band 8 bar).</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="report__muted">All dimensions are at or above the Band 8 bar.</p>
      )}

      <div className="report__divider" />

      {/* Promotion discussion points */}
      <SectionH>Promotion discussion points</SectionH>
      <div className="ev-discussion">
        <div className="ev-discussion__item ev-discussion__item--green">
          <span className="ev-discussion__label">✓ Make the case</span>
          <ul>
            <li><strong>{topDim.dim}</strong> is the strongest dimension at {topDim.score}/100 — lead with this in the calibration deck.</li>
            <li>{verifiedCt} of {total} contributions are manager-verified, providing a strong evidence base.</li>
            {strengths.map((d) => (
              <li key={d.dim}><strong>{d.dim}</strong> ({d.score}/100) is above the Band 8 bar — include as a confirmed strength.</li>
            ))}
          </ul>
        </div>
        <div className="ev-discussion__item ev-discussion__item--amber">
          <span className="ev-discussion__label">⚠ Address the gap</span>
          <ul>
            <li><strong>{lowDim.dim}</strong> at {lowDim.score}/100 is the key readiness gap ({85 - lowDim.score} pts from bar).</li>
            <li>Propose a concrete stretch initiative in <strong>{lowDim.dim}</strong> before the calibration.</li>
            {improvements.filter((d) => d.dim !== lowDim.dim).map((d) => (
              <li key={d.dim}><strong>{d.dim}</strong> at {d.score}/100 also needs attention.</li>
            ))}
          </ul>
        </div>
        <div className="ev-discussion__item ev-discussion__item--blue">
          <span className="ev-discussion__label">→ Recommended actions</span>
          <ul>
            <li>Attach verified evidence trail to the calibration deck for all dimensions above 80.</li>
            <li>Assign a stretch initiative targeting <strong>{lowDim.dim}</strong> before the next review cycle.</li>
            <li>Schedule peer feedback round to cover dimensions not yet corroborated by third-party recognition.</li>
          </ul>
        </div>
      </div>
      <p className="report__muted" style={{ marginTop: '1rem' }}>Impact score: {Math.round(impactScore)} (weighted index). All contributions auto-classified via GrowthIQ.</p>

      <div className="report__divider" />

      {/* Manager assessment — editable */}
      <div className="pk-section">
        <div className="pk-section__header">
          <SectionH>Manager assessment</SectionH>
          {!editingAssessment && (
            <button className="pk-edit-btn no-print" onClick={() => setEditingAssessment(true)} aria-label="Edit assessment">
              <Edit size={14} />
            </button>
          )}
        </div>
        {editingAssessment ? (
          <div className="pk-edit-block no-print">
            <textarea
              className="pk-note__textarea"
              value={assessmentText}
              autoFocus
              onChange={(e) => setAssessmentText(e.target.value)}
              rows={4}
            />
            <div className="pk-note__edit-actions">
              <Button kind="primary" size="sm" renderIcon={Save} onClick={() => setEditingAssessment(false)}>Save</Button>
              <Button kind="ghost" size="sm" onClick={() => { setAssessmentText(text); setEditingAssessment(false); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="report__body">{assessmentText}</p>
        )}
      </div>

      {/* Recommended next steps — editable list */}
      <div className="pk-section">
        <div className="pk-section__header">
          <SectionH>Recommended next steps</SectionH>
          <button className="pk-notes__add no-print" onClick={addStep}>
            <Add size={14} /> Add step
          </button>
        </div>
        <ul className="report__list report__list--plain pk-steps">
          {steps.map((step) => (
            <li key={step.id} className="pk-step">
              {editingStepId === step.id ? (
                <div className="pk-step__edit no-print">
                  <input
                    type="text"
                    className="pk-step__input"
                    value={stepDraft}
                    autoFocus
                    placeholder="Type the step here…"
                    onChange={(e) => setStepDraft(e.target.value)}
                  />
                  <div className="pk-step__edit-actions">
                    <Button kind="primary" size="sm" renderIcon={Save} onClick={() => saveStep(step.id)}>Save</Button>
                    <Button kind="ghost" size="sm" onClick={() => { setEditingStepId(null); if (!step.text) setSteps((s) => s.filter((x) => x.id !== step.id)); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="pk-step__view">
                  {step.aiGenerated && (
                    <Ai size={16} className="pk-step__ai-icon" fill="#0f62fe" aria-label="AI suggested" />
                  )}
                  <span className="pk-step__text">{step.text}</span>
                  <div className="pk-step__actions no-print">
                    <button className="pk-note__btn" onClick={() => editStep(step)} aria-label="Edit step"><Edit size={14} /></button>
                    <button className="pk-note__btn pk-note__btn--del" onClick={() => deleteStep(step.id)} aria-label="Delete step"><TrashCan size={14} /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="report__divider" />

      {/* Manager notes — editable, print-safe */}
      <div className="pk-notes">
        <div className="pk-notes__header">
          <SectionH>Additional notes</SectionH>
          <button className="pk-notes__add no-print" onClick={addNote}>
            <Add size={14} /> Add note
          </button>
        </div>
        {notes.length === 0 && editingNoteId === null && (
          <p className="report__muted">No notes yet. Click "Add note" to add observations for the calibration.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="pk-note">
            {editingNoteId === note.id ? (
              <div className="pk-note__edit no-print">
                <textarea
                  className="pk-note__textarea"
                  value={noteDraft}
                  autoFocus
                  placeholder="Type your note here…"
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                />
                <div className="pk-note__edit-actions">
                  <Button kind="primary" size="sm" renderIcon={Save} onClick={() => saveNote(note.id)}>Save</Button>
                  <Button kind="ghost" size="sm" onClick={() => { setEditingNoteId(null); if (!note.text) setNotes((n) => n.filter((x) => x.id !== note.id)); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="pk-note__view">
                <p className="pk-note__text">{note.text}</p>
                <div className="pk-note__actions no-print">
                  <button className="pk-note__btn" onClick={() => editNote(note)} aria-label="Edit note"><Edit size={14} /></button>
                  <button className="pk-note__btn pk-note__btn--del" onClick={() => deleteNote(note.id)} aria-label="Delete note"><TrashCan size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Download PDF — anchored at bottom after notes */}
      <div className="pk-notes__footer no-print">
        <Button kind="primary" size="sm" renderIcon={Download} onClick={downloadReport}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export interface EvidenceContrib {
  id: string;
  title: string;
  category: string;
  impact: string;
  date: string;
  verified: boolean;
  description?: string;
}

interface EvidenceProps {
  name: string;
  band: string;
  overall: number;
  impactScore: number;
  scores: Record<string, number>;
  items: { dim: string; text: string }[];
  contribs: EvidenceContrib[];
}

const DIM_PIE_COLOR: Record<string, string> = {
  Outcomes:         '#3b7ef8',
  Skills:           '#7c3aed',
  Behaviors:        '#2d6e6e',
  Leadership:       '#e85555',
  'Client Success': '#f5923e',
};

export const EvidenceReport: React.FC<EvidenceProps> = ({ name, band, overall, impactScore, scores, items, contribs }) => {
  const verified   = contribs.filter((c) => c.verified);
  const total      = contribs.length;
  const verifiedCt = verified.length;

  // Dimension breakdown
  const dimData = DIMENSIONS.map((d) => ({
    dim: d,
    score: scores[d] ?? 0,
    count: contribs.filter((c) => c.category === d).length,
  }));

  // Pie data — contribution count by dimension
  const pieData = dimData.filter((d) => d.count > 0).map((d) => ({ name: d.dim, value: d.count }));

  // Impact distribution bar
  const impactData = ['Critical Impact', 'High Impact', 'Medium Impact', 'Low Impact'].map((imp) => ({
    impact: imp.replace(' Impact', ''),
    count: contribs.filter((c) => c.impact === imp).length,
  }));

  // Strengths = dimensions >= 85
  const strengths = dimData.filter((d) => d.score >= 85);
  // Improvements = dimensions < 75
  const improvements = dimData.filter((d) => d.score < 75).sort((a, b) => a.score - b.score);
  // Promotion discussion points — derived heuristics
  const topDim   = [...dimData].sort((a, b) => b.score - a.score)[0];
  const lowDim   = [...dimData].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="report">
      <ReportActions note={`Evidence trail · ${name}`} />

      {/* ── 1. Overview stats — single row of 4 */}
      <div className="report__stats report__stats--4 ev-stats-row">
        <Stat value={`${overall}%`}               label="Overall readiness"     accent="#24a148" />
        <Stat value={total}                        label="Total contributions" />
        <Stat value={`${verifiedCt} / ${total}`}  label="Verified"              accent="#24a148" />
        <Stat value={impactScore}                  label="Impact score (0–1000)" accent="#0f62fe" />
      </div>

      <div className="report__divider" />

      {/* ── 2. Contribution by Dimension ── */}
      <SectionH>Contributions by dimension</SectionH>
      <div className="report__two-col">
        {/* Pie chart */}
        <div className="report__chart">
          <p className="report__chart-label">Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={72}
                label={({ name: n, percent }: any) => `${n} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={DIM_PIE_COLOR[entry.name] ?? '#8d8d8d'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Dimension score bar */}
        <div className="report__chart">
          <p className="report__chart-label">Readiness score (Band 8 bar = 85)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dimData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dim" tick={{ fontSize: 10.5, fill: '#393939' }} tickLine={false} axisLine={false} width={88} />
              <ReferenceLine x={85} stroke="#da1e28" strokeDasharray="4 3" label={{ value: '85', fill: '#da1e28', fontSize: 10 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#393939' }}>
                {dimData.map((d) => (
                  <Cell key={d.dim} fill={d.score >= 85 ? '#24a148' : d.score >= 70 ? '#0f62fe' : '#da1e28'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact distribution */}
      <SectionH>Impact distribution</SectionH>
      <div className="report__chart">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={impactData} margin={{ top: 4, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
            <XAxis dataKey="impact" tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6f6f6f' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {impactData.map((d) => {
                const col = d.impact === 'Critical' ? '#da1e28' : d.impact === 'High' ? '#0f62fe' : d.impact === 'Medium' ? '#6929c4' : '#8d8d8d';
                return <Cell key={d.impact} fill={col} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="report__divider" />

      {/* ── 3. Section-wise contribution summary ── */}
      <SectionH>Contribution summary by dimension</SectionH>
      {DIMENSIONS.map((dim) => {
        const dimContribs = contribs.filter((c) => c.category === dim);
        return (
          <div key={dim} className="ev-dim-section">
            <div className="ev-dim-section__head">
              <span className="ev-dim-section__badge" style={{ background: `${DIM_PIE_COLOR[dim]}18`, color: DIM_PIE_COLOR[dim] }}>{dim}</span>
              <span className="ev-dim-section__score">{scores[dim] ?? 0} / 100</span>
              <span className="ev-dim-section__count">{dimContribs.length} contribution{dimContribs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="ev-dim-section__bar-wrap">
              <div className="ev-dim-section__bar" style={{ width: `${scores[dim] ?? 0}%`, background: DIM_PIE_COLOR[dim] }} />
              <div className="ev-dim-section__bar-marker" />
            </div>
            {dimContribs.length === 0 ? (
              <p className="report__muted" style={{ margin: '0.5rem 0 0' }}>No contributions logged in this dimension yet.</p>
            ) : (
              <table className="report__table ev-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Contribution</th>
                    <th>Impact</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dimContribs.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>
                        <span className={`ev-impact ev-impact--${c.impact.split(' ')[0].toLowerCase()}`}>
                          {c.impact.replace(' Impact', '')}
                        </span>
                      </td>
                      <td className="report__td-muted">{c.date}</td>
                      <td>
                        {c.verified
                          ? <span className="ev-status ev-status--ok"><CheckmarkFilled size={13} /> Verified</span>
                          : <span className="ev-status ev-status--pending"><WarningAltFilled size={13} /> Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <div className="report__divider" />

      {/* ── 4. Strengths ── */}
      <SectionH>Strengths</SectionH>
      {strengths.length > 0 ? (
        <ul className="report__list">
          {strengths.map((d) => (
            <li key={d.dim}>
              <CheckmarkFilled size={14} className="ic-ok" />
              <span><strong style={{ color: DIM_PIE_COLOR[d.dim] }}>{d.dim}</strong> — {d.score}/100, above the Band 8 bar. {contribs.filter((c) => c.category === d.dim && c.verified).length} verified contributions this year.</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="report__muted">No dimensions currently above the Band 8 bar (85). See improvements below.</p>
      )}

      {/* ── 5. Improvements ── */}
      <SectionH>Areas for improvement</SectionH>
      {improvements.length > 0 ? (
        <ul className="report__list">
          {improvements.map((d) => (
            <li key={d.dim}>
              <WarningAltFilled size={14} className="ic-warn" />
              <span><strong style={{ color: DIM_PIE_COLOR[d.dim] }}>{d.dim}</strong> — {d.score}/100 ({85 - d.score} points below Band 8 bar). Focus on increasing verified contributions in this dimension.</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="report__muted">All dimensions are at or above the Band 8 bar.</p>
      )}

      <div className="report__divider" />

      {/* ── 6. Promotion Discussion Points ── */}
      <SectionH>Promotion discussion points</SectionH>
      <div className="ev-discussion">
        <div className="ev-discussion__item ev-discussion__item--green">
          <span className="ev-discussion__label">✓ Make the case</span>
          <ul>
            <li><strong>{topDim.dim}</strong> is the strongest dimension at {topDim.score}/100 — lead with this in the calibration deck.</li>
            <li>{verifiedCt} of {total} contributions are manager-verified, providing a strong evidence base.</li>
            {strengths.map((d) => (
              <li key={d.dim}><strong>{d.dim}</strong> ({d.score}/100) is above the Band 8 bar — include as a confirmed strength in the promotion submission.</li>
            ))}
          </ul>
        </div>
        <div className="ev-discussion__item ev-discussion__item--amber">
          <span className="ev-discussion__label">⚠ Address the gap</span>
          <ul>
            <li><strong>{lowDim.dim}</strong> at {lowDim.score}/100 is the key readiness gap ({85 - lowDim.score} pts from the bar).</li>
            <li>Propose a concrete stretch initiative in <strong>{lowDim.dim}</strong> before the calibration to demonstrate trajectory.</li>
            {improvements.filter((d) => d.dim !== lowDim.dim).map((d) => (
              <li key={d.dim}><strong>{d.dim}</strong> at {d.score}/100 also needs attention ({85 - d.score} pts below bar).</li>
            ))}
          </ul>
        </div>
        <div className="ev-discussion__item ev-discussion__item--blue">
          <span className="ev-discussion__label">→ Recommended actions</span>
          <ul>
            <li>Attach verified evidence trail to the calibration deck for all dimensions above 80.</li>
            <li>Assign a stretch initiative targeting <strong>{lowDim.dim}</strong> before the next review cycle.</li>
            <li>Schedule peer feedback round to cover dimensions not yet corroborated by third-party recognition.</li>
            <li>Confirm promotion slot with the studio lead once <strong>{lowDim.dim}</strong> trajectory is documented.</li>
          </ul>
        </div>
      </div>

      <p className="report__muted" style={{ marginTop: '1rem' }}>Impact score: {Math.round(impactScore)} (weighted index). All contributions auto-classified via GrowthIQ.</p>
    </div>
  );
};
