# GrowthIQ Platform - Project Overview

## Executive Summary

GrowthIQ is a comprehensive **IBM Employee Growth and Development Platform** designed to empower employees and managers with intelligent tools to track career progression, identify growth opportunities, and facilitate skill development in alignment with organizational goals.

---

## Project Name
**IBM Employee Growth Platform** (codename: GrowthIQ)

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: IBM Carbon Design System (@carbon/react)
- **Data Visualization**: 
  - Recharts for interactive charts
  - IBM Carbon Charts for enterprise-grade visualizations
- **Styling**: SASS/SCSS
- **Routing**: React Router v7
- **Testing**: Jest with React Testing Library

### Backend
- **Node.js/Express** proxy server (located in `/proxy`)
- **Authentication**: IBM credentials support
- **API Integration**: ICA (IBM Competency API) through proxy

---

## Key Features

### 1. **Employee Dashboard**
- Comprehensive view of personal growth metrics
- Career roadmap tracking
- Learning recommendations
- Performance insights
- Recognition inbox for peer feedback

### 2. **Career Roadmap**
- Visual pathway for career progression
- Skills gap analysis
- Development recommendations
- Milestone tracking

### 3. **Manager Dashboard**
- Team performance overview
- Employee development tracking
- Team approvals workflow
- Growth opportunities identification
- Analytics and reporting

### 4. **AI Coach**
- Intelligent chatbot for career guidance
- Personalized recommendations
- Learning suggestions based on role and goals

### 5. **Growth Metrics & Analytics**
- **Your Learning Score**: Tracks learning activities and progress
- **Impact Score**: Measures contribution and business impact
- **My Score**: Aggregate performance indicator
- **System Contributions**: Recognition and contributions tracking

### 6. **Recognition & Feedback System**
- Peer-to-peer recognition inbox
- Feedback aggregation
- Team contributions tracking

---

## Core Components & Services

### Page Components
- **EmployeeDashboard**: Main employee view with KPIs and recommendations
- **CareerRoadmap**: Interactive career development pathway
- **ManagerDashboard**: Comprehensive manager view for team insights

### UI Components
- **TopNav**: Navigation header with user profile and role switching
- **AiCoach**: Floating AI assistant component
- **Dashboard Tabs**: Modular dashboard sections

### Services
- **yourLearning.ts**: Learning tracking and recommendations
- **myScore.ts**: Personal performance scoring
- **impactScore.ts**: Business impact calculation
- **systemContributions.ts**: Contribution tracking
- **connectors.ts**: External data integration (ICA API, Teams, etc.)

### Context Providers
- **TeamApprovalsProvider**: Manages team approval workflows
- **GrowthOpportunitiesProvider**: Handles growth opportunities data

---

## Data Models

### User Type
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  initials: string;
}
```

### Key Features
- Multi-role support (Employee/Manager/Admin views)
- Role-based navigation and data access
- Persistent state management with localStorage
- Reset functionality for demo/testing purposes

---

## Application Architecture

### UI Flow
```
App (Root)
├── Theme (IBM Carbon)
├── TopNav (Navigation & User Control)
├── Main Content Area
│   ├── Employee View
│   │   ├── EmployeeDashboard (default)
│   │   └── CareerRoadmap
│   └── Manager View
│       └── ManagerDashboard
├── AiCoach (Floating Sidebar)
└── Context Providers
    ├── TeamApprovalsProvider
    └── GrowthOpportunitiesProvider
```

---

## Key User Stories

### Employee
- "I want to see my current growth metrics and compare them to my goals"
- "I want to understand my career path and what skills I need to develop"
- "I want to receive personalized learning recommendations"
- "I want to receive and give recognition to my peers"
- "I want to get AI-powered career coaching"

### Manager
- "I want to see my team's development progress"
- "I want to approve/reject growth opportunities for my team"
- "I want to identify skill gaps in my team"
- "I want to make data-driven decisions about team assignments"

---

## Integration Points

### External APIs & Connectors
1. **IBM ICA API** - Competency and skill data
2. **Microsoft Teams Calendar** - Meeting scheduling and availability
3. **IBM Employee Directory** - User information and organizational structure
4. **Learning Management Systems** - Course and training data

### Proxy Server
The `/proxy` directory contains a Node.js server that:
- Acts as a CORS proxy for the ICA API
- Holds API credentials securely
- Manages authentication tokens
- Routes requests to external services

---

## State Management

### Local Storage
- Recognition inbox data
- User preferences
- Dashboard state
- Demo/test data

### Context API
- Team approvals workflow
- Growth opportunities
- UI state and navigation

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install frontend dependencies
npm install

# Install proxy server dependencies
cd proxy
npm install

# Start both frontend and proxy (from root)
npm start
```

### Environment Configuration
Create `.env` file in `/proxy` directory for:
- ICA API credentials
- Microsoft Teams integration
- Authentication tokens

---

## Key Metrics & KPIs

1. **Learning Score**: Quantifies learning engagement
2. **Impact Score**: Measures professional contribution
3. **Skill Proficiency**: Current vs. Target skills
4. **Recognition Count**: Peer feedback and recognition
5. **Development Progress**: Roadmap milestone completion

---

## Future Enhancements

### Planned Features
- [ ] Integration with Microsoft Teams calendar for meeting scheduling
- [ ] Advanced analytics and reporting
- [ ] Skill marketplace for internal mobility
- [ ] Real-time collaboration features
- [ ] Mobile app support
- [ ] Enhanced AI recommendations with ML models
- [ ] Integration with learning platforms
- [ ] Custom competency frameworks

### Current Implementation (In Progress)
- **Teams Calendar Integration**: Automatic meeting creation with suggested attendees within business hours

---

## Project Structure

```
ibm-employee-growth-platform/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── shared/         # Shared UI components
│   │   └── [feature]/      # Feature-specific components
│   ├── pages/              # Page-level components
│   │   ├── employee/       # Employee views
│   │   └── manager/        # Manager views
│   ├── services/           # Business logic & API calls
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx             # Main app component
│   └── App.scss            # Global styles
├── proxy/                  # Node.js backend proxy server
├── package.json
└── tsconfig.json
```

---

## IBM Design & Standards

- **UI Framework**: IBM Carbon Design System
- **Design Language**: Enterprise-grade, accessibility-first
- **Accessibility**: WCAG 2.1 AA compliant components
- **Responsive**: Desktop-first, mobile-optimized

---

## Current Status

✅ **Complete**
- Core employee dashboard
- Career roadmap visualization
- Manager dashboard with team views
- Recognition inbox system
- AI coach integration
- Multiple scoring algorithms

🔄 **In Progress**
- Microsoft Teams calendar integration
- Enhanced analytics

❌ **Planned**
- Mobile application
- Advanced skill marketplace
- Real-time collaboration
- Machine learning recommendations

---

## Contact & Support

- **Project Owner**: Priyanka B. Atodariya
- **Team Email**: priyankaben.atodariya@ibm.com
- **Repository**: GrowthIQ-Platform-Final

