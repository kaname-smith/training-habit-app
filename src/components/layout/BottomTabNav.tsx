import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: '今日', icon: 'today' },
  { to: '/body', label: 'Body', icon: 'body' },
  { to: '/study', label: 'Study', icon: 'study' },
  { to: '/records', label: '記録', icon: 'records' },
  { to: '/settings', label: '設定', icon: 'settings' },
];

export function BottomTabNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-10 border-t border-[var(--border-color)] bg-[var(--surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="主要ナビゲーション"
    >
      <ul className="flex justify-around">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                }`
              }
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
