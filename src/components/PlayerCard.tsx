import React from 'react';
import { useStore } from '../store/StoreContext';
import { Shield, Flame, Coins, Trophy } from 'lucide-react';

const translations = {
  pt: {
    level: 'Nível',
    dayStreak: 'Dias Seguidos',
    budgetShield: 'Escudo de Orçamento',
    coins: 'Moedas'
  },
  en: {
    level: 'Level',
    dayStreak: 'Day Streak',
    budgetShield: 'Budget Shield',
    coins: 'Coins'
  },
  es: {
    level: 'Nivel',
    dayStreak: 'Días Seguidos',
    budgetShield: 'Escudo de Presupuesto',
    coins: 'Monedas'
  }
};

export function PlayerCard() {
  const { userStats } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang];
  
  const xpNeeded = userStats.level * 100;
  const xpProgress = (userStats.xp / xpNeeded) * 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-lg mb-6 md:mb-8 gap-4 md:gap-0">
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="relative shrink-0">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-zinc-950 font-black text-2xl md:text-3xl border-4 border-zinc-900 ${userStats.optimizationMode ? '' : 'shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}>
            {userStats.level}
          </div>
          <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-zinc-800 rounded-full p-1 md:p-1.5 border-2 border-zinc-900">
            <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight truncate">{userStats.rank}</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <span className="text-zinc-400 font-medium text-xs md:text-sm whitespace-nowrap">{t.level} {userStats.level}</span>
            <div className="w-full sm:w-48 h-2 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div 
                className={`h-full bg-violet-500 rounded-full ${userStats.optimizationMode ? '' : 'transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]'}`}
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[10px] md:text-xs font-mono text-violet-400 whitespace-nowrap">{userStats.xp}/{xpNeeded} XP</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-around md:justify-end gap-2 md:gap-6 w-full md:w-auto border-t border-zinc-800/50 md:border-t-0 pt-4 md:pt-0">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
            <Flame className={`w-5 h-5 md:w-6 md:h-6 ${userStats.streakDays > 0 ? `text-orange-500 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'}` : 'text-zinc-600'}`} />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">{userStats.streakDays} {t.dayStreak}</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
            <Shield className={`w-5 h-5 md:w-6 md:h-6 ${userStats.shieldActive ? `text-blue-400 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]'}` : 'text-zinc-600'}`} />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">{t.budgetShield}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
            <Coins className={`w-5 h-5 md:w-6 md:h-6 text-yellow-400 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'}`} />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">{userStats.proCoins} {t.coins}</span>
        </div>
      </div>
    </div>
  );
}
