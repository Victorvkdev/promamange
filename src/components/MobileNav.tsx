import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Swords, Target, Settings, Briefcase, CreditCard } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const translations = {
  pt: {
    dashboard: 'Hub',
    expenses: 'Gastos',
    goals: 'Metas',
    planners: 'Missões',
    career: 'Carreira',
    cards: 'Cartões',
    settings: 'Ajustes',
  },
  en: {
    dashboard: 'Hub',
    expenses: 'Expenses',
    goals: 'Goals',
    planners: 'Quests',
    career: 'Career',
    cards: 'Cards',
    settings: 'Settings',
  },
  es: {
    dashboard: 'Hub',
    expenses: 'Gastos',
    goals: 'Metas',
    planners: 'Misiones',
    career: 'Carrera',
    cards: 'Tarjetas',
    settings: 'Ajustes',
  }
};

export function MobileNav() {
  const { userStats } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: '/' },
    { icon: Receipt, label: t.expenses, path: '/expenses' },
    { icon: Swords, label: t.goals, path: '/debts' },
    { icon: Target, label: t.planners, path: '/planners' },
    { icon: Briefcase, label: t.career, path: '/career' },
    { icon: CreditCard, label: t.cards, path: '/cards' },
    { icon: Settings, label: t.settings, path: '/settings' },
  ];

  return (
    <nav className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)] overflow-x-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px]',
              isActive
                ? 'text-violet-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )
          }
        >
          <item.icon className={cn('w-6 h-6')} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
