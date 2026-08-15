import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../../types';
import './ContributionChart.scss';

interface ContributionChartProps {
  data: ChartDataPoint[];
}

const ContributionChart: React.FC<ContributionChartProps> = ({ data }) => {
  return (
    <div className="contribution-chart">
      <div className="contribution-chart__header">
        <div>
          <h3>Contribution Trend</h3>
          <p className="contribution-chart__subtitle">Last 7 months</p>
        </div>
      </div>

      <div className="contribution-chart__graph">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0f62fe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#525252' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#525252' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="#0f62fe"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorContributions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContributionChart;

// Made with Bob
