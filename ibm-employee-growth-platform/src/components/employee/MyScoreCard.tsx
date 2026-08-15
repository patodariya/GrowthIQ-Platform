import React from 'react';
import { Tag } from '@carbon/react';
import { ChartLineData, CheckmarkFilled } from '@carbon/icons-react';
import * as Recharts from 'recharts';
import { MyScoreData, quarterlyTrend } from '../../services/myScore';
import './MyScoreCard.scss';

// recharts 3 + React 19 emits spurious JSX-component type errors; the codebase
// sidesteps them by pulling the components off the namespace as `any`.
const {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} = Recharts as any;

interface MyScoreCardProps {
  data: MyScoreData;
  live: boolean;
}

const fmt = (n: number | null) => (n == null ? '—' : `${n}%`);

const MyScoreCard: React.FC<MyScoreCardProps> = ({ data, live }) => {
  const trend = quarterlyTrend(data);
  const aboveGoal =
    data.chargeableRolling != null &&
    data.chargeableGoal != null &&
    data.chargeableRolling >= data.chargeableGoal;

  return (
    <div className="myscore-card">
      <div className="myscore-card__header">
        <div>
          <h3 className="myscore-card__title">
            <ChartLineData size={18} /> IBM MyScore
          </h3>
          <p className="myscore-card__source">
            Business utilization{data.band ? ` · ${data.band}` : ''} ·{' '}
            {live ? 'synced live' : 'last synced'}
          </p>
        </div>
        <Tag type={live ? 'green' : 'gray'} size="sm">
          {live ? 'Live' : 'Cached'}
        </Tag>
      </div>

      {/* Headline utilization figures */}
      <div className="myscore-card__figures">
        <div className="myscore-figure">
          <span className="myscore-figure__value">
            {fmt(data.chargeableRolling)}
            {aboveGoal && <span className="myscore-figure__up"> ▲</span>}
          </span>
          <span className="myscore-figure__label">Chargeable (rolling 4Q)</span>
          <span className="myscore-figure__sub">
            Goal {fmt(data.chargeableGoal)}
            {aboveGoal && ' · above goal'}
          </span>
        </div>
        <div className="myscore-figure">
          <span className="myscore-figure__value">{fmt(data.attainmentRolling)}</span>
          <span className="myscore-figure__label">Attainment (rolling 4Q)</span>
          <span className="myscore-figure__sub">
            Prior {fmt(data.attainmentPrior)}
          </span>
        </div>
      </div>

      {/* Quarterly chargeable vs goal */}
      {trend.length > 0 && (
        <div className="myscore-card__chart">
          <p className="myscore-card__chart-title">Chargeable vs goal</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={trend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#6f6f6f' }} tickLine={false} />
              <YAxis
                domain={[85, 115]}
                tick={{ fontSize: 10, fill: '#6f6f6f' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="Goal"
                stroke="#8d8d8d"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Chargeable"
                stroke="#0f62fe"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0f62fe' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Core Performance Expectations */}
      {data.expectations.length > 0 && (
        <div className="myscore-card__expectations">
          <p className="myscore-card__exp-title">Core Performance Expectations</p>
          <ul>
            {data.expectations.map((e) => (
              <li key={e.name}>
                <span>{e.name}</span>
                <span
                  className={`myscore-exp__status${
                    e.status === 'Met' ? ' is-met' : ''
                  }`}
                >
                  {e.status === 'Met' && <CheckmarkFilled size={14} />}
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyScoreCard;

// Made with Bob
