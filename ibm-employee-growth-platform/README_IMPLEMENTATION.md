# IBM Employee Growth & Performance Management Platform

## Project Overview

This is an AI-powered employee growth ecosystem built for IBM internal employees using React, TypeScript, and IBM Carbon Design System. The platform addresses the problem of fragmented professional contributions across disconnected systems.

### Problem Statement
"Employees at IBM struggle to build a continuous, comprehensive narrative of their professional contributions and growth because their work evidence is fragmented across disconnected systems — leading to invisible impact, inequitable recognition, and reactive (rather than proactive) career development."

### Solution Intent
Create a unified, AI-powered employee growth ecosystem that continuously captures contributions, curates achievements, and delivers personalized career insights, enabling employees and managers to make more informed decisions around development, recognition, and advancement.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: IBM Carbon Design System (@carbon/react)
- **Charts**: Recharts for data visualization
- **Styling**: SCSS with Carbon Design tokens
- **Build Tool**: Create React App

## Project Structure

```
ibm-employee-growth-platform/
├── src/
│   ├── components/
│   │   ├── employee/          # Employee-specific components
│   │   │   ├── ContributionChart.tsx
│   │   │   ├── ContributionList.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   └── RecognitionCard.tsx
│   │   ├── manager/           # Manager-specific components (pending)
│   │   └── shared/            # Shared components
│   │       ├── TopNav.tsx
│   │       └── MetricCard.tsx
│   ├── pages/
│   │   ├── employee/
│   │   │   └── EmployeeDashboard.tsx
│   │   └── manager/           # Manager views (pending)
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── styles/
│   │   └── _variables.scss    # Design system variables
│   └── utils/                 # Utility functions
├── public/
└── package.json
```

## Implemented Features

### Employee Dashboard
1. **Welcome Section**
   - Personalized greeting
   - Current streak display
   - Progress summary

2. **AI Monthly Summary**
   - AI-generated performance insights
   - Key achievements highlight
   - Actionable recommendations

3. **Key Metrics Cards**
   - Contributions This Quarter
   - Current Streak
   - AI Impact Score
   - Promotion Readiness

4. **Contribution Trend Chart**
   - 7-month contribution visualization
   - Interactive area chart
   - Quick contribution logging

5. **Recent Contributions List**
   - AI-verified contributions
   - Category and impact tags
   - Timestamp tracking

6. **Skill Profile Radar**
   - AI-analyzed skill assessment
   - 6 key dimensions:
     - Technical
     - Leadership
     - Delivery
     - Innovation
     - Collaboration
     - Communication

7. **AI Career Nudge**
   - Personalized career guidance
   - Skill improvement suggestions
   - Promotion readiness tips

8. **Recent Recognition**
   - Peer and manager recognition
   - Timestamped feedback
   - Recognition quotes

### Navigation
- **Top Navigation Bar**
  - IBM GrowthIQ branding
  - Main navigation links
  - Employee/Manager view switcher
  - Notifications
  - User profile menu

## Component Details

### Core Components

#### TopNav
- Responsive header with IBM Carbon styling
- View switcher (Employee/Manager)
- Navigation menu
- User avatar and profile access

#### MetricCard
- Reusable metric display component
- Supports various data types
- Trend indicators
- Icon support

#### ContributionChart
- Area chart visualization
- 7-month historical data
- Interactive tooltips
- Contribution logging action

#### ContributionList
- Filterable contribution display
- AI verification badges
- Category and impact tags
- Date tracking

#### SkillRadar
- Radar chart for skill visualization
- 6-dimensional skill assessment
- AI-analyzed data display

#### RecognitionCard
- Recognition feed display
- Peer and manager feedback
- Avatar and timestamp display

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  initials: string;
}
```

### Contribution
```typescript
interface Contribution {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Leadership' | 'Delivery' | 'Innovation' | 'Collaboration';
  impact: 'Low Impact' | 'Medium Impact' | 'High Impact' | 'Critical Impact';
  date: string;
  verified: boolean;
  verifiedBy?: string;
}
```

### SkillProfile
```typescript
interface SkillProfile {
  technical: number;
  leadership: number;
  delivery: number;
  innovation: number;
  collaboration: number;
  communication: number;
}
```

## Current Status

### ✅ Completed
- Project setup with React + TypeScript
- IBM Carbon Design System integration
- Employee Dashboard UI implementation
- Core component library
- Type definitions
- Mock data structure
- Responsive layout foundation

### 🚧 In Progress
- SCSS compilation fixes
- Chart library type compatibility
- Carbon Design System variable integration

### 📋 Pending
- Manager Dashboard implementation
- Routing setup (React Router)
- ICA (IBM watsonx Code Assistant) integration
- API integration layer
- Authentication system
- Real-time data updates
- Mobile responsiveness optimization
- Accessibility improvements
- Unit and integration tests

## Next Steps

1. **Fix Build Issues**
   - Resolve SCSS variable imports
   - Fix Recharts TypeScript compatibility
   - Complete Carbon Design System integration

2. **Complete Employee View**
   - Add contribution logging modal
   - Implement filtering and sorting
   - Add export functionality

3. **Build Manager Dashboard**
   - Team overview
   - Individual employee insights
   - Recognition management
   - Performance tracking

4. **Integration**
   - Connect to ICA for AI features
   - Implement real API calls
   - Add authentication
   - Set up state management (Redux/Context)

5. **Testing & Optimization**
   - Unit tests for components
   - Integration tests
   - Performance optimization
   - Accessibility audit

## Design System

The application uses IBM Carbon Design System with the following key elements:

- **Colors**: IBM Carbon white theme
- **Typography**: IBM Plex Sans
- **Spacing**: Carbon spacing scale
- **Components**: Carbon React components
- **Icons**: Carbon icons library

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

```env
REACT_APP_API_URL=<API_ENDPOINT>
REACT_APP_ICA_KEY=<ICA_API_KEY>
```

## Future Enhancements

1. **AI Features**
   - Natural language contribution logging
   - Automated skill assessment
   - Predictive career pathing
   - Smart recognition suggestions

2. **Collaboration**
   - Team contribution views
   - Peer comparison (anonymized)
   - Mentorship matching
   - Knowledge sharing

3. **Analytics**
   - Advanced reporting
   - Export capabilities
   - Custom dashboards
   - Trend analysis

4. **Integrations**
   - GitHub contributions
   - Jira tickets
   - Slack recognition
   - Calendar events

## Contributing

This project follows IBM's development standards and practices. For contributions:

1. Follow TypeScript best practices
2. Use IBM Carbon components
3. Write comprehensive tests
4. Document new features
5. Follow accessibility guidelines

## License

Internal IBM Project - Proprietary

## Contact

For questions or support, contact the IBM Employee Experience team.

---

**Built with ❤️ for IBM Employees**