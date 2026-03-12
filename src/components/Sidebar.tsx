import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Swords, Target, Settings, LogOut, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

import { useStore } from '../store/StoreContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const translations = {
  pt: {
    dashboard: 'Hub Financeiro',
    expenses: 'Gastos Diários',
    goals: 'Grandes Metas',
    planners: 'Planejadores e Missões',
    career: 'Gestão de Carreira',
    settings: 'Configurações',
    logout: 'Sair'
  },
  en: {
    dashboard: 'Financial Hub',
    expenses: 'Daily Expenses',
    goals: 'Major Goals',
    planners: 'Planners & Quests',
    career: 'Career Management',
    settings: 'Settings',
    logout: 'Logout'
  },
  es: {
    dashboard: 'Centro Financiero',
    expenses: 'Gastos Diarios',
    goals: 'Metas Principales',
    planners: 'Planificadores y Misiones',
    career: 'Gestión de Carrera',
    settings: 'Configuraciones',
    logout: 'Cerrar Sesión'
  }
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { userStats } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: '/' },
    { icon: Receipt, label: t.expenses, path: '/expenses' },
    { icon: Swords, label: t.goals, path: '/debts' },
    { icon: Target, label: t.planners, path: '/planners' },
    { icon: Briefcase, label: t.career, path: '/career' },
  ];

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className={cn(
      "bg-zinc-950 border-r border-zinc-800 flex flex-col h-full text-zinc-300 transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64"
    )}>
      {onToggle && (
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-8 bg-zinc-800 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-zinc-100 z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <div className={cn("p-6 flex items-center gap-3", collapsed ? "justify-center px-0" : "")}>
        <div className={`w-8 h-8 shrink-0 rounded bg-violet-500 flex items-center justify-center text-zinc-950 font-bold text-xl ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.5)]'}`}>
          P
        </div>
        {!collapsed && <span className="font-bold text-xl tracking-wider text-zinc-100 truncate">PROMANAGE</span>}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group',
                collapsed ? 'justify-center px-0' : 'px-4',
                isActive
                  ? 'bg-zinc-800 text-violet-400 shadow-[inset_4px_0_0_0_#8b5cf6]'
                  : 'hover:bg-zinc-900 hover:text-zinc-100'
              )
            }
          >
            <item.icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110')} />
            {!collapsed && <span className="font-medium truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 space-y-2">
        <NavLink
          to="/settings"
          title={collapsed ? t.settings : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 py-3 rounded-xl w-full transition-colors font-medium',
              collapsed ? 'justify-center px-0' : 'px-4',
              isActive
                ? 'bg-zinc-800 text-violet-400 shadow-[inset_4px_0_0_0_#8b5cf6]'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
            )
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">{t.settings}</span>}
        </NavLink>
        
        <button 
          onClick={handleLogout} 
          title={collapsed ? t.logout : undefined} 
          className={cn("flex items-center gap-3 py-3 rounded-xl w-full hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-100", collapsed ? "justify-center px-0" : "px-4")}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium truncate">{t.logout}</span>}
        </button>
      </div>
    </div>
  );
}
