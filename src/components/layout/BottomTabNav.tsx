import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: '今日', icon: 'today' },
  { to: '/workout', label: '実行', icon: 'workout' },
  { to: '/records', label: '記録', icon: 'records' },
  { to: '/nutrition', label: '栄養', icon: 'nutrition' },
  { to: '/settings', label: '設定', icon: 'settings' },
];

export function BottomTabNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-10 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
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
                  isActive
                    ? 'text-brand-600 dark:text-brand-300'
                    : 'text-neutral-500 dark:text-neutral-400'
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
