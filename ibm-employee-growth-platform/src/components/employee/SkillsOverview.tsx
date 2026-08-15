import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SkillCategory } from '../../types';
import './SkillsOverview.scss';

interface SkillsOverviewProps {
  categories: SkillCategory[];
  currentRole: string;
}

const SkillsOverview: React.FC<SkillsOverviewProps> = ({ categories, currentRole }) => {
  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: cat.percentage,
    color: cat.color,
  }));

  const renderCustomLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  return (
    <div className="skills-overview">
      <div className="skills-overview__header">
        <h3 className="skills-overview__title">Your Skills Portfolio</h3>
        <p className="skills-overview__subtitle">
          Current role: <strong>{currentRole}</strong>
        </p>
      </div>

      <div className="skills-overview__content">
        <div className="skills-overview__chart">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="skills-overview__legend">
          {categories.map((cat) => (
            <div key={cat.name} className="skills-overview__category">
              <div className="skills-overview__category-header">
                <span
                  className="skills-overview__color-dot"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="skills-overview__category-name">{cat.name}</span>
                <span className="skills-overview__category-percent">{cat.percentage}%</span>
              </div>
              <div className="skills-overview__skills">
                {cat.skills.map((skill, idx) => (
                  <span key={idx} className="skills-overview__skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-overview__note">
        <p>
          <strong>Core Skills:</strong> Deep dive into your primary discipline to build mastery
        </p>
        <p>
          <strong>Parallel Skills:</strong> Expand your T-shape with complementary capabilities
        </p>
      </div>
    </div>
  );
};

export default SkillsOverview;

// Made with Bob