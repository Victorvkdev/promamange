import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, AlertCircle, Briefcase, FileText, Coins, Star, Plus } from 'lucide-react';

const translations = {
  pt: {
    title: 'Planejadores e Missões',
    subtitle: 'Gerencie seus projetos, impostos e metas. Complete-os para subir de nível.',
    all: 'Todos',
    favorites: 'Favoritos',
    newPlanner: 'Novo Planejador',
    createPlanner: 'Criar Novo Planejador',
    formTitle: 'Título',
    formDesc: 'Descrição',
    formType: 'Tipo',
    formPriority: 'Prioridade',
    formTargetValue: 'Valor Total (Opcional)',
    cancel: 'Cancelar',
    createBtn: 'Criar Planejador',
    activePlanners: 'Planejadores Ativos',
    priority: 'Prioridade',
    progress: 'Progresso',
    complete: 'Completar',
    addProgress: 'Adicionar Progresso',
    amountToAdd: 'Valor a adicionar',
    noActive: 'Nenhum planejador ativo. Peça uma nova missão ao Navi!',
    completedPlanners: 'Planejadores Concluídos',
    earned: 'Ganhou',
    noCompleted: 'Seus planejadores concluídos aparecerão aqui.',
    types: {
      planner: 'Planejador',
      project: 'Projeto',
      tax: 'Imposto',
      goal: 'Meta'
    },
    priorities: {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    }
  },
  en: {
    title: 'Planners & Quests',
    subtitle: 'Manage your projects, taxes, and goals. Complete them to level up.',
    all: 'All',
    favorites: 'Favorites',
    newPlanner: 'New Planner',
    createPlanner: 'Create New Planner',
    formTitle: 'Title',
    formDesc: 'Description',
    formType: 'Type',
    formPriority: 'Priority',
    formTargetValue: 'Total Value (Optional)',
    cancel: 'Cancel',
    createBtn: 'Create Planner',
    activePlanners: 'Active Planners',
    priority: 'Priority',
    progress: 'Progress',
    complete: 'Complete',
    addProgress: 'Add Progress',
    amountToAdd: 'Amount to add',
    noActive: 'No active planners. Ask Navi for a new mission!',
    completedPlanners: 'Completed Planners',
    earned: 'Earned',
    noCompleted: 'Your completed planners will appear here.',
    types: {
      planner: 'Planner',
      project: 'Project',
      tax: 'Tax',
      goal: 'Goal'
    },
    priorities: {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  },
  es: {
    title: 'Planificadores y Misiones',
    subtitle: 'Gestiona tus proyectos, impuestos y metas. Complétalos para subir de nivel.',
    all: 'Todos',
    favorites: 'Favoritos',
    newPlanner: 'Nuevo Planificador',
    createPlanner: 'Crear Nuevo Planificador',
    formTitle: 'Título',
    formDesc: 'Descripción',
    formType: 'Tipo',
    formPriority: 'Prioridad',
    formTargetValue: 'Valor Total (Opcional)',
    cancel: 'Cancelar',
    createBtn: 'Crear Planificador',
    activePlanners: 'Planificadores Activos',
    priority: 'Prioridad',
    progress: 'Progreso',
    complete: 'Completar',
    addProgress: 'Añadir Progreso',
    amountToAdd: 'Cantidad a añadir',
    noActive: 'No hay planificadores activos. ¡Pídele a Navi una nueva misión!',
    completedPlanners: 'Planificadores Completados',
    earned: 'Ganó',
    noCompleted: 'Tus planificadores completados aparecerán aquí.',
    types: {
      planner: 'Planificador',
      project: 'Proyecto',
      tax: 'Impuesto',
      goal: 'Meta'
    },
    priorities: {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    }
  }
};

export function Planners() {
  const { quests, completeQuest, toggleQuestFavorite, addQuest, updateQuest, userStats } = useStore();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];

  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'planner' as const,
    priority: 'medium' as const,
    targetValue: '',
    rewardXp: 100,
    rewardCoins: 10
  });

  const activeQuests = quests.filter(q => q.status === 'active' && (filter === 'all' || q.favorite));
  const completedQuests = quests.filter(q => q.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuest.title || !newQuest.description) return;

    addQuest({
      ...newQuest,
      targetValue: newQuest.targetValue ? parseFloat(newQuest.targetValue) : undefined,
      currentValue: newQuest.targetValue ? 0 : undefined,
      status: 'active',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
      favorite: false
    });

    setIsAdding(false);
    setNewQuest({
      title: '',
      description: '',
      type: 'planner',
      priority: 'medium',
      targetValue: '',
      rewardXp: 100,
      rewardCoins: 10
    });
  };

  const handlePaymentChange = (questId: string, value: string) => {
    setPaymentAmounts(prev => ({ ...prev, [questId]: value }));
  };

  const handleAddProgress = (quest: any) => {
    const amountStr = paymentAmounts[quest.id];
    const amount = amountStr ? parseFloat(amountStr) : 0;
    if (isNaN(amount) || amount <= 0) return;
    
    const newCurrent = (quest.currentValue || 0) + amount;
    const newHistory = [...(quest.history || []), { date: new Date().toISOString(), value: amount }];
    
    updateQuest(quest.id, { currentValue: newCurrent, history: newHistory });
    setPaymentAmounts(prev => ({ ...prev, [quest.id]: '' }));
    
    if (quest.targetValue && newCurrent >= quest.targetValue) {
      completeQuest(quest.id);
    }
  };

  const calculateEstimatedMonths = (quest: any) => {
    if (!quest.history || quest.history.length === 0) return null;
    
    // Group history by month
    const monthlyTotals: Record<string, number> = {};
    quest.history.forEach((entry: any) => {
      const monthYear = entry.date.substring(0, 7); // YYYY-MM
      monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + entry.value;
    });

    const months = Object.keys(monthlyTotals);
    if (months.length === 0) return null;

    const totalPaidInHistory = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
    const averagePerMonth = totalPaidInHistory / months.length;

    if (averagePerMonth <= 0) return null;

    const remainingValue = quest.targetValue - (quest.currentValue || 0);
    if (remainingValue <= 0) return 0;

    return Math.ceil(remainingValue / averagePerMonth);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-sm font-bold transition-colors flex-1 sm:flex-none text-center ${filter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}
          >
            {t.all}
          </button>
          <button 
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none ${filter === 'favorites' ? 'bg-zinc-800 text-yellow-400' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}
          >
            <Star className="w-4 h-4" /> {t.favorites}
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto sm:ml-2 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
          >
            <Plus className="w-5 h-5" />
            {t.newPlanner}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddQuest}
            className={`bg-zinc-900 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden ${userStats.optimizationMode ? '' : 'shadow-[0_0_30px_rgba(59,130,246,0.1)]'}`}
          >
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t.createPlanner}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.formTitle}</label>
                <input
                  type="text"
                  value={newQuest.title}
                  onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Q3 Marketing Plan"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.formDesc}</label>
                <input
                  type="text"
                  value={newQuest.description}
                  onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Brief description of the planner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.formType}</label>
                <select
                  value={newQuest.type}
                  onChange={e => setNewQuest({...newQuest, type: e.target.value as any})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="planner">{t.types.planner}</option>
                  <option value="project">{t.types.project}</option>
                  <option value="tax">{t.types.tax}</option>
                  <option value="goal">{t.types.goal}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.formPriority}</label>
                <select
                  value={newQuest.priority}
                  onChange={e => setNewQuest({...newQuest, priority: e.target.value as any})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="high">{t.priorities.high}</option>
                  <option value="medium">{t.priorities.medium}</option>
                  <option value="low">{t.priorities.low}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.formTargetValue}</label>
                <input
                  type="number"
                  value={newQuest.targetValue}
                  onChange={e => setNewQuest({...newQuest, targetValue: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4 relative z-10">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className={`px-6 py-3 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {t.createBtn}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            {t.activePlanners}
          </h2>
          
          {activeQuests.map((quest) => (
            <motion.div
              key={quest.id}
              layout={!userStats.optimizationMode}
              className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-500/30 transition-colors relative overflow-hidden group ${userStats.optimizationMode ? '' : 'shadow-lg'}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {quest.type === 'project' && <Briefcase className="w-24 h-24 text-blue-500" />}
                {quest.type === 'tax' && <FileText className="w-24 h-24 text-red-500" />}
                {quest.type === 'goal' && <Target className="w-24 h-24 text-violet-500" />}
                {quest.type === 'planner' && <Target className="w-24 h-24 text-purple-500" />}
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-zinc-100 truncate">{quest.title}</h3>
                    <button onClick={() => toggleQuestFavorite(quest.id)} className="focus:outline-none shrink-0">
                      <Star className={`w-5 h-5 transition-colors ${quest.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`} />
                    </button>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{quest.description}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    quest.type === 'project' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    quest.type === 'tax' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    quest.type === 'planner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  }`}>
                    {t.types[quest.type]}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(quest.priority)}`}>
                    {t.priorities[quest.priority]} {t.priority}
                  </span>
                </div>
              </div>

              {quest.targetValue !== undefined && (
                <div className="relative z-10 mb-6">
                  <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    <span>{t.progress}</span>
                    <span className="font-mono">R$ {(quest.currentValue || 0).toFixed(2)} / R$ {quest.targetValue.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-2">
                    <div 
                      className={`h-full bg-blue-500 rounded-full ${userStats.optimizationMode ? '' : 'transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                      style={{ width: `${((quest.currentValue || 0) / quest.targetValue) * 100}%` }}
                    />
                  </div>
                  
                  {calculateEstimatedMonths(quest) !== null && (
                    <div className="text-xs text-zinc-500 mb-4 text-right">
                      Tempo estimado: {calculateEstimatedMonths(quest)} meses
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      value={paymentAmounts[quest.id] !== undefined ? paymentAmounts[quest.id] : ''}
                      onChange={(e) => handlePaymentChange(quest.id, e.target.value)}
                      placeholder={t.amountToAdd}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                    />
                    <button
                      onClick={() => handleAddProgress(quest)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl transition-all text-sm"
                    >
                      {t.addProgress}
                    </button>
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-6 border-t border-zinc-800/50 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20">
                    <span className="text-violet-400 font-bold text-sm">+{quest.rewardXp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">+{quest.rewardCoins}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => completeQuest(quest.id)}
                  className={`w-full sm:w-auto justify-center px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t.complete}
                </button>
              </div>
            </motion.div>
          ))}
          
          {activeQuests.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">{t.noActive}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-violet-500" />
            {t.completedPlanners}
          </h2>
          
          <div className="space-y-4">
            {completedQuests.map((quest) => (
              <motion.div
                key={quest.id}
                layout={!userStats.optimizationMode}
                className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <CheckCircle2 className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-300 line-through decoration-zinc-600">{quest.title}</h3>
                    <p className="text-xs text-zinc-500">{t.types[quest.type]} • {t.earned} {quest.rewardXp} XP</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {completedQuests.length === 0 && (
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-8 text-center">
                <p className="text-zinc-500 text-sm">{t.noCompleted}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
