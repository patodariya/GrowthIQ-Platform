import React from 'react';
import { Tile, Tag, ProgressBar, Button } from '@carbon/react';
import { Launch, Checkmark } from '@carbon/icons-react';
import { Course } from '../../types';
import './CourseCard.scss';

interface CourseCardProps {
  course: Course;
  onCourseClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onCourseClick }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'green';
      case 'Intermediate':
        return 'blue';
      case 'Advanced':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Tile className={`course-card ${course.completed ? 'course-card--completed' : ''}`}>
      <div className="course-card__header">
        <div className="course-card__title-row">
          {course.completed && <Checkmark size={20} className="course-card__check" />}
          <h4 className="course-card__title">{course.title}</h4>
        </div>
        <Tag type={getLevelColor(course.level)} size="sm">
          {course.level}
        </Tag>
      </div>

      <p className="course-card__description">{course.description}</p>

      <div className="course-card__meta">
        <span className="course-card__duration">⏱ {course.duration}</span>
        <span className="course-card__provider">{course.provider}</span>
      </div>

      {course.progress !== undefined && !course.completed && (
        <div className="course-card__progress">
          <div className="course-card__progress-header">
            <span className="course-card__progress-label">Progress</span>
            <span className="course-card__progress-value">{course.progress}%</span>
          </div>
          <ProgressBar
            value={course.progress}
            max={100}
            label="Course progress"
            hideLabel
            size="small"
          />
        </div>
      )}

      {course.completed && course.completedDate && (
        <div className="course-card__completed">
          <Checkmark size={16} />
          <span>Completed on {course.completedDate}</span>
        </div>
      )}

      <Button
        kind={course.completed ? 'tertiary' : 'primary'}
        size="sm"
        renderIcon={Launch}
        onClick={() => onCourseClick(course)}
        className="course-card__button"
      >
        {course.completed ? 'Review Course' : 'Start Learning'}
      </Button>
    </Tile>
  );
};

export default CourseCard;

// Made with Bob