import React from 'react';
import { Tile, Tooltip } from '@carbon/react';
import {
  ChartColumn,
  Growth,
  Flash,
  CenterCircle,
  UserMultiple,
  Time,
  TaskComplete,
  Gift,
  Information,
} from '@carbon/icons-react';
import { MetricCard as MetricCardType } from '../../types';
import './MetricCard.scss';

interface MetricCardProps {
  metric: MetricCardType;
}

const ICON_MAP: Record<string, { Icon: React.ElementType; color: string }> = {
  chart: { Icon: ChartColumn, color: '#0f62fe' },
  rank: { Icon: Growth, color: '#007d79' },
  star: { Icon: Flash, color: '#f1c21b' },
  trophy: { Icon: CenterCircle, color: '#24a148' },
  team: { Icon: UserMultiple, color: '#0f62fe' },
  pending: { Icon: Time, color: '#ff832b' },
  ready: { Icon: TaskComplete, color: '#24a148' },
  recognition: { Icon: Gift, color: '#8a3ffc' },
};

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const { Icon, color } = ICON_MAP[metric.icon] ?? ICON_MAP.chart;

  return (
    <Tile className="metric-card">
      <div className="metric-card__icon" style={{ color }}>
        <Icon size={20} />
      </div>
      <div className="metric-card__value">{metric.value}</div>
      <div className="metric-card__title">
        {metric.title}
        {metric.info && (
          <Tooltip label={metric.info} align="bottom" className="metric-card__tooltip">
            <button type="button" className="metric-card__info" aria-label={`How ${metric.title} is calculated`}>
              <Information size={16} />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="metric-card__subtitle">{metric.subtitle}</div>
    </Tile>
  );
};

export default MetricCard;

// Made with Bob
