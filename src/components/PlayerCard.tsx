import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Flame, Coins, Trophy, X, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const translations = {
  pt: {
    level: 'Nível',
    dayStreak: 'Dias Seguidos',
    coins: 'Moedas',
    welcome: 'Bem-vindo(a),',
    streakTitle: 'Sua Ofensiva',
    streakDesc: 'Mantenha a disciplina de administrar seus gastos todos os dias para aumentar sua ofensiva!',
    levelTitle: 'Níveis e Ranks',
    levelDesc: 'Ganhe XP registrando gastos, rendas e completando missões para subir de nível.',
    avatarTitle: 'Escolha seu Avatar',
    ranks: ['Novato Financeiro', 'Poupador Aprendiz', 'Ninja do Orçamento', 'Esmagador de Metas', 'Cavaleiro do Investimento', 'Arquiteto da Riqueza']
  },
  en: {
    level: 'Level',
    dayStreak: 'Day Streak',
    coins: 'Coins',
    welcome: 'Welcome,',
    streakTitle: 'Your Streak',
    streakDesc: 'Maintain the discipline of managing your expenses every day to increase your streak!',
    levelTitle: 'Levels & Ranks',
    levelDesc: 'Earn XP by logging expenses, incomes, and completing quests to level up.',
    avatarTitle: 'Choose your Avatar',
    ranks: ['Financial Rookie', 'Apprentice Saver', 'Budget Ninja', 'Goal Crusher', 'Investment Knight', 'Wealth Architect']
  },
  es: {
    level: 'Nivel',
    dayStreak: 'Días Seguidos',
    coins: 'Monedas',
    welcome: 'Bienvenido(a),',
    streakTitle: 'Tu Racha',
    streakDesc: '¡Mantén la disciplina de administrar tus gastos todos los días para aumentar tu racha!',
    levelTitle: 'Niveles y Rangos',
    levelDesc: 'Gana XP registrando gastos, ingresos y completando misiones para subir de nivel.',
    avatarTitle: 'Elige tu Avatar',
    ranks: ['Novato Financiero', 'Ahorrador Aprendiz', 'Ninja del Presupuesto', 'Aplastador de Metas', 'Caballero de Inversión', 'Arquitecto de Riqueza']
  }
};

const AVATARS = [
  '👨‍💼', '👩‍💼', '🧑‍💻', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🥷', '🕵️‍♂️', '👨‍🚀', '🦁', '🦊', '🐼', '🤖', '👽', '👻'
];

export function PlayerCard() {
  const { userStats, updateAvatar } = useStore();
  const [activeModal, setActiveModal] = useState<'streak' | 'level' | 'avatar' | null>(null);
  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];
  
  const xpNeeded = userStats.level * 100;
  const xpProgress = (userStats.xp / xpNeeded) * 100;

  const renderModal = () => {
    if (!activeModal) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'streak' && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                  <Flame className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">{t.streakTitle}</h3>
                <p className="text-zinc-400 mb-6">{t.streakDesc}</p>
                <div className="text-5xl font-black text-orange-500 mb-2">{userStats.streakDays}</div>
                <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{t.dayStreak}</div>
              </div>
            )}

            {activeModal === 'level' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-violet-500/10 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-2">{t.levelTitle}</h3>
                  <p className="text-zinc-400">{t.levelDesc}</p>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {t.ranks.map((rank, index) => {
                    const requiredLevel = index === 0 ? 1 : index === 1 ? 5 : index === 2 ? 10 : index === 3 ? 20 : index === 4 ? 30 : 40;
                    const isUnlocked = userStats.level >= requiredLevel;
                    return (
                      <div key={index} className={`p-4 rounded-xl border flex items-center justify-between ${isUnlocked ? 'bg-violet-500/10 border-violet-500/30' : 'bg-zinc-950 border-zinc-800/50 opacity-50'}`}>
                        <div>
                          <div className={`font-bold ${isUnlocked ? 'text-violet-400' : 'text-zinc-500'}`}>{rank}</div>
                          <div className="text-xs text-zinc-500">Nível {requiredLevel}+</div>
                        </div>
                        {!isUnlocked && <Lock className="w-4 h-4 text-zinc-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeModal === 'avatar' && (
              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 text-center">{t.avatarTitle}</h3>
                <div className="grid grid-cols-5 gap-3">
                  {AVATARS.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateAvatar(avatar);
                        setActiveModal(null);
                      }}
                      className={`text-3xl p-2 rounded-xl transition-all ${userStats.avatar === avatar ? 'bg-violet-500/20 border-2 border-violet-500 scale-110' : 'bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:scale-105'}`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
          <span className="text-zinc-500 font-medium">{t.welcome}</span> {userStats.name}
        </h1>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-lg mb-6 md:mb-8 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <button 
            onClick={() => setActiveModal('avatar')}
            className="relative shrink-0 group transition-transform hover:scale-105"
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-zinc-950 font-black text-3xl md:text-4xl border-4 border-zinc-900 ${userStats.optimizationMode ? '' : 'shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}>
              {userStats.avatar ? userStats.avatar : <User className="w-8 h-8 md:w-10 md:h-10" />}
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-zinc-800 rounded-full p-1 md:p-1.5 border-2 border-zinc-900 group-hover:bg-violet-500 transition-colors">
              <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 group-hover:text-zinc-950" />
            </div>
          </button>
          
          <div className="flex-1 min-w-0">
            <button onClick={() => setActiveModal('level')} className="text-left hover:opacity-80 transition-opacity">
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
            </button>
          </div>
        </div>

        <div className="flex items-center justify-around md:justify-end gap-4 md:gap-6 w-full md:w-auto border-t border-zinc-800/50 md:border-t-0 pt-4 md:pt-0">
          <button onClick={() => setActiveModal('streak')} className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 group-hover:border-orange-500/50 transition-colors">
              <Flame className={`w-6 h-6 md:w-7 md:h-7 ${userStats.streakDays > 0 ? `text-orange-500 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'}` : 'text-zinc-600'}`} />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center group-hover:text-zinc-300">{userStats.streakDays} {t.dayStreak}</span>
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
              <Coins className={`w-6 h-6 md:w-7 md:h-7 text-yellow-400 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'}`} />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">{userStats.proCoins} {t.coins}</span>
          </div>
        </div>
      </div>
      {renderModal()}
    </>
  );
}
