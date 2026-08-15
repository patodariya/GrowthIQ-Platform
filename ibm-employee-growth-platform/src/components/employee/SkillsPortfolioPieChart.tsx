import React from 'react';
import { SkillProficiency } from '../../types';
import './SkillsPortfolioPieChart.scss';

interface SkillsPortfolioPieChartProps {
  skills: SkillProficiency[];
  currentRole?: string;
}

interface SkillCategoryData {
  name: string;
  percentage: number;
  color: string;
}

const SkillsPortfolioPieChart: React.FC<SkillsPortfolioPieChartProps> = ({
  skills,
  currentRole = 'UX Designer',
}) => {
  // Calculate skill distribution percentages
  const calculateSkillDistribution = (): SkillCategoryData[] => {
    if (skills.length === 0) return [];

    // Calculate total proficiency points
    const totalPoints = skills.reduce((sum, skill) => sum + skill.proficiencyLevel, 0);
    
    if (totalPoints === 0) return [];

    // Group skills and calculate percentages
    const categoryMap = new Map<string, number>();
    
    skills.forEach(skill => {
      const current = categoryMap.get(skill.skillName) || 0;
      categoryMap.set(skill.skillName, current + skill.proficiencyLevel);
    });

    // Convert to percentage array
    const categories: SkillCategoryData[] = [];
    const colors = ['#0f62fe', '#8a3ffc', '#33b1ff', '#fa4d56', '#198038'];
    let colorIndex = 0;

    categoryMap.forEach((points, name) => {
      const percentage = Math.round((points / totalPoints) * 100);
      if (percentage > 0) {
        categories.push({
          name,
          percentage,
          color: colors[colorIndex % colors.length],
        });
        colorIndex++;
      }
    });

    // Sort by percentage descending
    return categories.sort((a, b) => b.percentage - a.percentage);
  };

  const skillCategories = calculateSkillDistribution();

  // Calculate cumulative percentages for pie chart segments
  const calculatePieSegments = () => {
    let cumulativePercentage = 0;
    return skillCategories.map(category => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += category.percentage;
      return {
        ...category,
        startPercentage,
        endPercentage: cumulativePercentage,
      };
    });
  };

  const pieSegments = calculatePieSegments();

  // Convert percentage to degrees for SVG path
  const percentageToDegrees = (percentage: number) => (percentage / 100) * 360;

  // Create SVG path for pie slice
  const createPieSlice = (startPercentage: number, endPercentage: number) => {
    const startAngle = percentageToDegrees(startPercentage) - 90;
    const endAngle = percentageToDegrees(endPercentage) - 90;
    
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    
    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);
    
    const largeArcFlag = endPercentage - startPercentage > 50 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate label position
  const calculateLabelPosition = (startPercentage: number, endPercentage: number) => {
    const midPercentage = (startPercentage + endPercentage) / 2;
    const angle = percentageToDegrees(midPercentage) - 90;
    const radians = (angle * Math.PI) / 180;
    
    const radius = 130;
    const centerX = 150;
    const centerY = 150;
    
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  if (skillCategories.length === 0) {
    return (
      <div className="skills-portfolio-chart">
        <h3 className="skills-portfolio-chart__title">Your Skills Portfolio</h3>
        <p className="skills-portfolio-chart__role">Current role: {currentRole}</p>
        <p className="skills-portfolio-chart__empty">No skill data available</p>
      </div>
    );
  }

  return (
    <div className="skills-portfolio-chart">
      <div className="skills-portfolio-chart__container">
        <svg viewBox="0 0 300 300" className="skills-portfolio-chart__pie">
          {pieSegments.map((segment, index) => (
            <g key={index}>
              <path
                d={createPieSlice(segment.startPercentage, segment.endPercentage)}
                fill={segment.color}
                className="skills-portfolio-chart__slice"
              />
              {segment.percentage >= 5 && (
                <text
                  x={calculateLabelPosition(segment.startPercentage, segment.endPercentage).x}
                  y={calculateLabelPosition(segment.startPercentage, segment.endPercentage).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="skills-portfolio-chart__label"
                  fill={segment.color}
                >
                  {segment.percentage}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="skills-portfolio-chart__legend">
        {skillCategories.map((category, index) => (
          <div key={index} className="skills-portfolio-chart__legend-item">
            <div className="skills-portfolio-chart__legend-color" style={{ backgroundColor: category.color }}></div>
            <div className="skills-portfolio-chart__legend-content">
              <span className="skills-portfolio-chart__legend-name">{category.name}</span>
              <span className="skills-portfolio-chart__legend-percentage">{category.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default SkillsPortfolioPieChart;

// Made with Bob
