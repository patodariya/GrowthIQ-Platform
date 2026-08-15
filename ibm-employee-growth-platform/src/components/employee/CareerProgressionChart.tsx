import React from 'react';
import * as Recharts from 'recharts';
import './CareerProgressionChart.scss';

// recharts 3 + React 19 type defs disagree on the JSX element type of several
// chart parts, so pull them in untyped to keep the build green (same approach
// as SkillRadar).
const {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} = Recharts as any;

// The four iX India Design Goals dimensions that gate a Band 7 -> Band 8
// promotion, tracked over the last seven quarters. Band 8 bar = 85.
const BAND8_THRESHOLD = 85;

interface Bucket {
  key: string;
  label: string;
  color: string;
}

const BUCKETS: Bucket[] = [
  { key: 'outcomes', label: 'Outcomes', color: '#4589ff' },
  { key: 'skills', label: 'Skills', color: '#8a3ffc' },
  { key: 'behaviors', label: 'Behaviors', color: '#007d79' },
  { key: 'leadership', label: 'Leadership', color: '#24a148' },
  { key: 'clientSuccess', label: 'Client Success', color: '#ff832b' },
];

const DATA = [
  { quarter: "Q1'25", outcomes: 72, skills: 74, behaviors: 66, leadership: 48, clientSuccess: 70 },
  { quarter: "Q2'25", outcomes: 75, skills: 77, behaviors: 69, leadership: 52, clientSuccess: 73 },
  { quarter: "Q3'25", outcomes: 78, skills: 80, behaviors: 72, leadership: 55, clientSuccess: 76 },
  { quarter: "Q4'25", outcomes: 80, skills: 82, behaviors: 75, leadership: 58, clientSuccess: 79 },
  { quarter: "Q1'26", outcomes: 83, skills: 85, behaviors: 78, leadership: 62, clientSuccess: 81 },
  { quarter: "Q2'26", outcomes: 85, skills: 87, behaviors: 80, leadership: 66, clientSuccess: 83 },
  { quarter: "Q3'26", outcomes: 86, skills: 88, behaviors: 82, leadership: 70, clientSuccess: 84 },
];

const CareerProgressionChart: React.FC = () => {
  return (
    <div className="career-trend">
      <div className="career-trend__head">
        <div>
          <h3>Career Progression Trend</h3>
          <p className="career-trend__subtitle">
            Your growth across the iX design dimensions — Band 8 readiness, review window Q1 2027
          </p>
        </div>
        <span className="career-trend__band">Band 7 → 8</span>
      </div>

      <div className="career-trend__chart">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={DATA} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#525252' }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: '#525252' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12 }}
            />
            <ReferenceLine
              y={BAND8_THRESHOLD}
              stroke="#da1e28"
              strokeDasharray="6 4"
              label={{ value: 'Band 8 bar (85)', position: 'insideTopRight', fill: '#da1e28', fontSize: 11 }}
            />
            {BUCKETS.map((b) => (
              <Line
                key={b.key}
                type="monotone"
                dataKey={b.key}
                name={b.label}
                stroke={b.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CareerProgressionChart;

// Made with Bob
