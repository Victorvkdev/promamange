import React from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Swords, ShieldAlert, Zap, Trophy } from 'lucide-react';

const translations = {
  pt: {
    title: 'Grandes Metas',
    subtitle: 'Alcance suas grandes metas completando etapas para ganhar XP massivo.',
    achieved: 'Meta Alcançada!',
    due: 'Vencimento:',
    remaining: 'Restante:',
    progressBar: 'Barra de Progresso',
    stepsRemaining: 'etapas restantes',
    totalValue: 'Valor Total',
    stepValue: 'Valor da Etapa',
    achievedBtn: 'Alcançado',
    completeStep: 'Completar Etapa'
  },
  en: {
    title: 'Major Goals',
    subtitle: 'Achieve your major goals by completing steps to earn massive XP.',
    achieved: 'Goal Achieved!',
    due: 'Due:',
    remaining: 'Remaining:',
    progressBar: 'Progress Bar',
    stepsRemaining: 'steps remaining',
    totalValue: 'Total Value',
    stepValue: 'Step Value',
    achievedBtn: 'Achieved',
    completeStep: 'Complete Step'
  },
  es: {
    title: 'Metas Principales',
    subtitle: 'Alcanza tus metas principales completando pasos para ganar XP masivo.',
    achieved: '¡Meta Alcanzada!',
    due: 'Vencimiento:',
    remaining: 'Restante:',
    progressBar: 'Barra de Progreso',
    stepsRemaining: 'pasos restantes',
    totalValue: 'Valor Total',
    stepValue: 'Valor del Paso',
    achievedBtn: 'Alcanzado',
    completeStep: 'Completar Paso'
  }
};

export function MajorGoals() {
  const { majorGoals, payGoalStep, userStats } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Swords className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {majorGoals.map((goal) => {
          const isDefeated = goal.completedSteps >= goal.totalSteps;
          const hpPercent = isDefeated ? 0 : 100 - ((goal.completedSteps / goal.totalSteps) * 100);
          
          return (
            <motion.div
              key={goal.id}
              layout
              className={`relative overflow-hidden rounded-2xl border p-4 md:p-6 ${userStats.optimizationMode ? '' : 'transition-all duration-300'} ${
                isDefeated 
                  ? `bg-zinc-900 border-violet-500/30 ${userStats.optimizationMode ? '' : 'shadow-[0_0_30px_rgba(139,92,246,0.1)]'}` 
                  : `bg-zinc-900 border-orange-500/30 ${userStats.optimizationMode ? '' : 'shadow-[0_0_30px_rgba(249,115,22,0.1)]'}`
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                {isDefeated ? <Trophy className="w-24 h-24 md:w-32 md:h-32 text-violet-500" /> : <ShieldAlert className="w-24 h-24 md:w-32 md:h-32 text-orange-500" />}
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    {goal.title}
                    {isDefeated && <Trophy className={`w-5 h-5 md:w-6 md:h-6 text-yellow-400 ${userStats.optimizationMode ? '' : 'drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]'}`} />}
                  </h3>
                  <p className="text-zinc-400 font-medium mt-1 text-sm md:text-base">
                    {isDefeated ? t.achieved : `${t.due} ${goal.dueDate}`}
                  </p>
                </div>
                <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-mono font-bold text-sm md:text-lg border w-fit ${
                  isDefeated 
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' 
                    : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                }`}>
                  {t.remaining} {hpPercent.toFixed(0)}%
                </div>
              </div>

              <div className="relative z-10 mb-6">
                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  <span>{t.progressBar}</span>
                  <span className="font-mono">{goal.totalSteps - goal.completedSteps} {t.stepsRemaining}</span>
                </div>
                <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className={`h-full rounded-full ${userStats.optimizationMode ? '' : 'transition-all duration-1000 ease-out'} ${
                      isDefeated ? `bg-violet-500 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.5)]'}` : `bg-orange-500 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`
                    }`}
                    style={{ width: `${100 - hpPercent}%` }}
                  />
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{t.totalValue}</p>
                  <p className="font-mono font-bold text-zinc-200">R$ {goal.totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{t.stepValue}</p>
                  <p className="font-mono font-bold text-zinc-200">R$ {goal.stepValue.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={() => payGoalStep(goal.id)}
                disabled={isDefeated}
                className={`relative z-10 w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 ${userStats.optimizationMode ? '' : 'transition-all'} ${
                  isDefeated
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : `bg-orange-500 hover:bg-orange-400 text-zinc-950 ${userStats.optimizationMode ? '' : 'shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-[1.02] active:scale-[0.98]'}`
                }`}
              >
                {isDefeated ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    {t.achievedBtn}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {t.completeStep} (R$ {goal.stepValue.toFixed(2)})
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
