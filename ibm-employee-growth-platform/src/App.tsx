import React, { useState } from 'react';
import { Theme } from '@carbon/react';
import TopNav, { DashboardTab, UserView } from './components/shared/TopNav';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CareerRoadmap from './pages/employee/CareerRoadmap';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AiCoach from './components/shared/AiCoach';
import { TeamApprovalsProvider } from './context/TeamApprovals';
import { GrowthOpportunitiesProvider } from './context/GrowthOpportunities';
import { User } from './types';
import './App.scss';

function App() {
  const user: User = {
    id: '1',
    name: 'Aarav Patel',
    email: 'aarav.patel@ibm.com',
    role: 'employee',
    initials: 'AP',
  };

  const [view, setView] = useState<UserView>('employee');
  const [tab, setTab] = useState<DashboardTab>('dashboard');

  // When a nav item is clicked, update the tab and keep the view consistent.
  const handleNavigate = (next: DashboardTab) => {
    setTab(next);
    // Manager's Dashboard nav item stays in manager view; employee tabs return to employee view.
    if (next === 'manager-dashboard') {
      setView('manager');
    } else {
      setView('employee');
    }
    window.scrollTo(0, 0);
  };

  const handleViewChange = (next: UserView) => {
    setView(next);
    // Sync the active tab to the view's default when switching views.
    setTab(next === 'manager' ? 'manager-dashboard' : 'dashboard');
    window.scrollTo(0, 0);
  };

  // Reset function for prototype demonstrations
  const handleReset = () => {
    // Clear all localStorage data
    try {
      // Clear Recognition Inbox state
      localStorage.removeItem('growthiq.recognitionInbox.v2');
      // Clear any other app-specific localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('growthiq.')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Reload the page to reset all state
    window.location.reload();
  };

  const renderContent = () => {
    if (view === 'manager') return <ManagerDashboard />;
    if (tab === 'roadmap') return <CareerRoadmap />;
    return <EmployeeDashboard />;
  };

  return (
    <Theme theme="white">
      <TeamApprovalsProvider>
        <GrowthOpportunitiesProvider>
        <div className="app">
          <TopNav
            user={user}
            activeTab={tab}
            onNavigate={handleNavigate}
            view={view}
            onViewChange={handleViewChange}
            onReset={handleReset}
          />
          <main className="app__content">{renderContent()}</main>
          <AiCoach />
        </div>
        </GrowthOpportunitiesProvider>
      </TeamApprovalsProvider>
    </Theme>
  );
}

export default App;

// Made with Bob
