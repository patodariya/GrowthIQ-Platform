import React from 'react';
import * as Recharts from 'recharts';
import { SkillProfile } from '../../types';
import './SkillRadar.scss';

// recharts 3 + React 19 type definitions disagree on the JSX element type of
// the polar chart parts, so pull them in untyped to keep the build green.
const { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } =
  Recharts as any;

interface SkillRadarProps {
  skills: SkillProfile;
}

const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  const skillData = [
    { skill: 'Outcomes', value: skills.outcomes },
    { skill: 'Skills', value: skills.skills },
    { skill: 'Behaviors', value: skills.behaviors },
    { skill: 'Leadership', value: skills.leadership },
    { skill: 'Client Success', value: skills.clientSuccess },
  ];

  return (
    <div className="skill-radar">
      <h3>Growth Profile</h3>
      <p className="skill-radar__subtitle">
        Analyzed across the IBM growth dimensions
      </p>

      <div className="skill-radar__chart">
        <ResponsiveContainer width="100%" height={216}>
          <RadarChart data={skillData} outerRadius="72%">
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 11, fill: '#525252' }}
            />
            <Radar
              dataKey="value"
              stroke="#0f62fe"
              strokeWidth={2}
              fill="#0f62fe"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillRadar;

// Made with Bob
