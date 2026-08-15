import React from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherItem,
  Theme,
} from '@carbon/react';
import {
  Notification,
  ChevronDown,
  CheckmarkFilled,
  DocumentAdd,
  Badge as BadgeIcon,
  Calendar,
} from '@carbon/icons-react';
import { User } from '../../types';
import SettingsModal from './SettingsModal';
import growthIqLogo from '../../assets/growthiq-logo.png';
import './TopNav.scss';

export type DashboardTab = 'dashboard' | 'roadmap' | 'manager-dashboard';
export type UserView = 'employee' | 'manager';

type NotifKind = 'approval' | 'contribution' | 'badge' | 'oneonone';

interface NotifItem {
  id: string;
  kind: NotifKind;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

const NOTIF_META: Record<NotifKind, { icon: React.ReactNode; className: string }> = {
  approval: { icon: <CheckmarkFilled size={16} />, className: 'notif--approval' },
  contribution: { icon: <DocumentAdd size={16} />, className: 'notif--contribution' },
  badge: { icon: <BadgeIcon size={16} />, className: 'notif--badge' },
  oneonone: { icon: <Calendar size={16} />, className: 'notif--oneonone' },
};

// View-specific notifications.
const EMPLOYEE_NOTIFS: NotifItem[] = [
  {
    id: 'e1',
    kind: 'approval',
    title: 'Contribution approved',
    detail: 'James approved “Led end-to-end redesign of retail client checkout”.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 'e2',
    kind: 'badge',
    title: 'New badge earned',
    detail: 'You earned the “Enterprise Design Thinking — Practitioner” badge on YourLearning.',
    time: '5h ago',
    unread: true,
  },
  {
    id: 'e3',
    kind: 'oneonone',
    title: '1:1 with James scheduled',
    detail: 'Career check-in on Thu, Jul 10 · 3:00 PM. Agenda: Band 8 readiness.',
    time: '1d ago',
    unread: true,
  },
  {
    id: 'e4',
    kind: 'contribution',
    title: '2 contributions synced',
    detail: 'Your MyScore utilization and Think40 learning were added to this quarter.',
    time: '1d ago',
    unread: false,
  },
  {
    id: 'e5',
    kind: 'contribution',
    title: 'New recognition detected',
    detail: 'Sarah K. praised your checkout redesign in #design-kudos — review it in your inbox.',
    time: '2d ago',
    unread: false,
  },
];

const MANAGER_NOTIFS: NotifItem[] = [
  {
    id: 'm1',
    kind: 'approval',
    title: '2 contributions awaiting approval',
    detail: 'Kavya Reddy and Vikram Nair sent contributions for your sign-off.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'm2',
    kind: 'oneonone',
    title: '1:1 overdue',
    detail: 'Your check-in with Arjun Mehta is overdue — his pace has slipped this quarter.',
    time: '3h ago',
    unread: true,
  },
  {
    id: 'm3',
    kind: 'badge',
    title: 'Team badge earned',
    detail: 'Rohan Gupta earned the “Design System Contributor” badge.',
    time: '6h ago',
    unread: true,
  },
  {
    id: 'm4',
    kind: 'contribution',
    title: 'New team contribution',
    detail: 'Priya Sharma logged “Redesigned onboarding flow — 22% activation lift”.',
    time: '1d ago',
    unread: false,
  },
];

interface TopNavProps {
  user: User;
  activeTab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  view: UserView;
  onViewChange: (view: UserView) => void;
  onReset?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  user,
  activeTab,
  onNavigate,
  view,
  onViewChange,
  onReset,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Notifications reflect the active view; reset read-state as the view changes.
  const [notifs, setNotifs] = React.useState<NotifItem[]>(EMPLOYEE_NOTIFS);
  React.useEffect(() => {
    setNotifs(view === 'manager' ? MANAGER_NOTIFS : EMPLOYEE_NOTIFS);
    setIsNotifOpen(false);
  }, [view]);

  const unreadCount = notifs.filter((n) => n.unread).length;

  // Close the notification panel on outside click / Escape.
  React.useEffect(() => {
    if (!isNotifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsNotifOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isNotifOpen]);

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const navigate = (tab: DashboardTab) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(tab);
  };

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
    setIsSettingsOpen(true);
  };

  const handleReset = () => {
    setIsSettingsOpen(false);
    if (onReset) {
      onReset();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  return (
    <Theme theme="g100">
      <Header aria-label="IBM GrowthIQ">
        <HeaderName href="#" prefix="" onClick={navigate('dashboard')}>
          <img className="brand__logo" src={growthIqLogo} alt="Growth IQ" />
        </HeaderName>

        <HeaderNavigation aria-label="Main Navigation">
          {view === 'manager' ? (
            <HeaderMenuItem
              href="#"
              isActive={activeTab === 'manager-dashboard'}
              onClick={navigate('manager-dashboard')}
            >
              Manager's Dashboard
            </HeaderMenuItem>
          ) : (
            <>
              <HeaderMenuItem
                href="#"
                isActive={activeTab === 'dashboard'}
                onClick={navigate('dashboard')}
              >
                My Dashboard
              </HeaderMenuItem>
              <HeaderMenuItem
                href="#"
                isActive={activeTab === 'roadmap'}
                onClick={navigate('roadmap')}
              >
                Career Roadmap
              </HeaderMenuItem>
            </>
          )}
        </HeaderNavigation>

        <HeaderGlobalBar>
          <div className="view-switcher" role="group" aria-label="Switch view">
            <button
              type="button"
              className={`view-button ${view === 'employee' ? 'active' : ''}`}
              onClick={() => onViewChange('employee')}
            >
              Employee
            </button>
            <button
              type="button"
              className={`view-button ${view === 'manager' ? 'active' : ''}`}
              onClick={() => onViewChange('manager')}
            >
              Manager
            </button>
          </div>

          <div className="notif-wrap" ref={notifRef}>
            <HeaderGlobalAction
              aria-label="Notifications"
              tooltipAlignment="end"
              isActive={isNotifOpen}
              onClick={() => setIsNotifOpen((o) => !o)}
            >
              <span className="notif-icon-wrap">
                <Notification size={20} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </span>
            </HeaderGlobalAction>

            {isNotifOpen && (
              <div className="notif-panel" role="dialog" aria-label="Notifications">
                <div className="notif-panel__head">
                  <span className="notif-panel__title">Notifications</span>
                  {unreadCount > 0 && (
                    <button type="button" className="notif-panel__markall" onClick={markAllRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <ul className="notif-panel__list">
                  {notifs.map((n) => (
                    <li
                      key={n.id}
                      className={`notif${n.unread ? ' notif--unread' : ''}`}
                      onClick={() => markRead(n.id)}
                    >
                      <span className={`notif__icon ${NOTIF_META[n.kind].className}`}>
                        {NOTIF_META[n.kind].icon}
                      </span>
                      <div className="notif__body">
                        <p className="notif__title">{n.title}</p>
                        <p className="notif__detail">{n.detail}</p>
                        <span className="notif__time">{n.time}</span>
                      </div>
                      {n.unread && <span className="notif__dot" aria-hidden="true" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <HeaderGlobalAction
            aria-label=""
            tooltipAlignment="end"
            className="account-action"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="account">
              <div className="account__avatar">{user.initials}</div>
              <span className="account__name">{user.name}</span>
              <ChevronDown size={16} className="account__chevron" />
            </div>
          </HeaderGlobalAction>
        </HeaderGlobalBar>

        {isUserMenuOpen && (
          <HeaderPanel aria-label="User Menu" expanded={isUserMenuOpen}>
            <Switcher aria-label="User Menu Items">
              <SwitcherItem aria-label="Settings" onClick={handleSettingsClick}>
                Settings
              </SwitcherItem>
              <SwitcherItem aria-label="Logout">Logout</SwitcherItem>
            </Switcher>
          </HeaderPanel>
        )}
      </Header>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReset={handleReset}
      />
    </Theme>
  );
};

export default TopNav;

// Made with Bob
