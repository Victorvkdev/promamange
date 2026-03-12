import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStats, Expense, MajorGoal, Quest, ChatMessage, Income } from '../types';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  userStats: UserStats;
  expenses: Expense[];
  incomes: Income[];
  majorGoals: MajorGoal[];
  quests: Quest[];
  chatHistory: ChatMessage[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  payGoalStep: (goalId: string) => void;
  completeQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  toggleQuestFavorite: (questId: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addXp: (amount: number, reason: string) => void;
  toggleOptimizationMode: () => void;
  changeLanguage: (lang: 'pt' | 'en' | 'es') => void;
  updateName: (name: string) => void;
  clearData: () => void;
  signOut: () => void;
  session: any;
}

const defaultStats: UserStats = {
  name: 'User',
  xp: 0,
  level: 1,
  rank: 'Novato Financeiro',
  proCoins: 0,
  streakDays: 0,
  lastLoginDate: null,
  shieldActive: true,
  optimizationMode: false,
  language: 'pt',
};

const initialExpenses: Expense[] = [];

const initialIncomes: Income[] = [];

const initialGoals: MajorGoal[] = [];

const initialQuests: Quest[] = [];

const initialChat: ChatMessage[] = [
  { id: '1', role: 'ai', content: 'Bem-vindo ao seu Hub Financeiro! Comece adicionando sua primeira despesa, meta ou planejador.', timestamp: new Date().toISOString() }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const translations = {
  pt: {
    welcome: 'Bem-vindo ao seu Hub Financeiro! Comece adicionando sua primeira despesa, meta ou planejador.',
    levelUp: '🎉 Subiu de Nível! Você agora é Nível',
    keepUp: 'Continue com o ótimo trabalho!',
    loggedExp: 'Despesa registrada:',
    comboExp: 'Multiplicador de Combo! Despesa registrada no dia exato.',
    loggedInc: 'Incrível! Você registrou uma renda de R$',
    from: 'de',
    keepGrowing: 'Continue aumentando sua riqueza!',
    greatJob: 'Ótimo trabalho! 🎯 Isso é R$',
    towards: 'para a sua meta',
    goalAchieved: 'Meta Principal Alcançada! 🎉 Você ganhou o emblema Esmagador de Metas!',
    plannerCompleted: 'Planejador Concluído:',
    earned: 'Ganhou',
    and: 'e',
    newPlanner: 'Novo Planejador Adicionado:',
    letsWork: 'Vamos ao trabalho!',
    ranks: ['Novato Financeiro', 'Poupador Aprendiz', 'Ninja do Orçamento', 'Esmagador de Metas', 'Cavaleiro do Investimento', 'Arquiteto da Riqueza']
  },
  en: {
    welcome: 'Welcome to your Financial Hub! Start by adding your first expense, goal, or planner.',
    levelUp: '🎉 Level Up! You are now Level',
    keepUp: 'Keep up the great work!',
    loggedExp: 'Logged expense:',
    comboExp: 'Combo Multiplier! Logged expense on the exact day.',
    loggedInc: 'Awesome! You logged an income of R$',
    from: 'from',
    keepGrowing: 'Keep growing your wealth!',
    greatJob: "Great job! 🎯 That's R$",
    towards: 'towards your',
    goalAchieved: 'Major Goal Achieved! 🎉 You earned the Goal Crusher badge!',
    plannerCompleted: 'Planner Completed:',
    earned: 'Earned',
    and: 'and',
    newPlanner: 'New Planner Added:',
    letsWork: "Let's get to work!",
    ranks: ['Financial Rookie', 'Apprentice Saver', 'Budget Ninja', 'Goal Crusher', 'Investment Knight', 'Wealth Architect']
  },
  es: {
    welcome: '¡Bienvenido a tu Centro Financiero! Comienza agregando tu primer gasto, meta o planificador.',
    levelUp: '🎉 ¡Subiste de Nivel! Ahora eres Nivel',
    keepUp: '¡Sigue con el gran trabajo!',
    loggedExp: 'Gasto registrado:',
    comboExp: '¡Multiplicador de Combo! Gasto registrado en el día exacto.',
    loggedInc: '¡Increíble! Registraste un ingreso de R$',
    from: 'de',
    keepGrowing: '¡Sigue aumentando tu riqueza!',
    greatJob: '¡Gran trabajo! 🎯 Eso es R$',
    towards: 'para tu meta',
    goalAchieved: '¡Meta Principal Alcanzada! 🎉 ¡Ganaste la insignia Aplastador de Metas!',
    plannerCompleted: 'Planificador Completado:',
    earned: 'Ganó',
    and: 'y',
    newPlanner: 'Nuevo Planificador Agregado:',
    letsWork: '¡Manos a la obra!',
    ranks: ['Novato Financiero', 'Ahorrador Aprendiz', 'Ninja del Presupuesto', 'Aplastador de Metas', 'Caballero de Inversión', 'Arquitecto de Riqueza']
  }
};

export const StoreProvider = ({ children, session }: { children: ReactNode, session?: any }) => {
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [majorGoals, setMajorGoals] = useState<MajorGoal[]>(initialGoals);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialChat);

  const [isLoaded, setIsLoaded] = useState(false);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    if (!session?.user?.id) {
      // Fallback to local storage if no session
      const savedStats = localStorage.getItem('promanage_v2_stats');
      if (savedStats) setUserStats(JSON.parse(savedStats));
      
      const savedExpenses = localStorage.getItem('promanage_v2_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedIncomes = localStorage.getItem('promanage_v2_incomes');
      if (savedIncomes) setIncomes(JSON.parse(savedIncomes));

      const savedGoals = localStorage.getItem('promanage_v2_goals');
      if (savedGoals) setMajorGoals(JSON.parse(savedGoals));

      const savedQuests = localStorage.getItem('promanage_v2_quests');
      if (savedQuests) setQuests(JSON.parse(savedQuests));
      
      const savedChat = localStorage.getItem('promanage_v2_chat');
      if (savedChat) setChatHistory(JSON.parse(savedChat));

      checkStreak(savedStats ? JSON.parse(savedStats) : defaultStats);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      try {
        const { data: stats } = await supabase.from('user_stats').select('*').eq('id', session.user.id).single();
        if (stats) {
          const loadedStats = {
            name: stats.name,
            xp: stats.xp,
            level: stats.level,
            rank: stats.rank,
            proCoins: stats.pro_coins,
            streakDays: stats.streak_days,
            lastLoginDate: stats.last_login_date,
            shieldActive: stats.shield_active,
            optimizationMode: stats.optimization_mode,
            language: stats.language
          };
          setUserStats(loadedStats);
          checkStreak(loadedStats);
        }

        const { data: exp } = await supabase.from('expenses').select('*').eq('user_id', session.user.id);
        if (exp && exp.length > 0) setExpenses(exp);

        const { data: inc } = await supabase.from('incomes').select('*').eq('user_id', session.user.id);
        if (inc && inc.length > 0) setIncomes(inc);

        const { data: goals } = await supabase.from('major_goals').select('*').eq('user_id', session.user.id);
        if (goals && goals.length > 0) {
          setMajorGoals(goals.map(g => ({
            id: g.id,
            title: g.title,
            totalSteps: g.total_steps,
            completedSteps: g.completed_steps,
            dueDate: g.due_date,
            stepValue: g.step_value,
            totalValue: g.total_value,
            paidValue: g.paid_value
          })));
        }

        const { data: qst } = await supabase.from('quests').select('*').eq('user_id', session.user.id);
        if (qst && qst.length > 0) {
          setQuests(qst.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            type: q.type,
            status: q.status,
            dueDate: q.due_date,
            rewardXp: q.reward_xp,
            rewardCoins: q.reward_coins,
            progress: q.progress,
            target: q.target,
            priority: q.priority,
            favorite: q.favorite
          })));
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [session]);

  // Save to Supabase (or local storage) on change
  useEffect(() => {
    if (!isLoaded) return; // Don't save before initial load

    if (!session?.user?.id) {
      localStorage.setItem('promanage_v2_stats', JSON.stringify(userStats));
      localStorage.setItem('promanage_v2_expenses', JSON.stringify(expenses));
      localStorage.setItem('promanage_v2_incomes', JSON.stringify(incomes));
      localStorage.setItem('promanage_v2_goals', JSON.stringify(majorGoals));
      localStorage.setItem('promanage_v2_quests', JSON.stringify(quests));
      localStorage.setItem('promanage_v2_chat', JSON.stringify(chatHistory));
      return;
    }

    const saveToSupabase = async () => {
      try {
        await supabase.from('user_stats').upsert({ 
          id: session.user.id, 
          name: userStats.name,
          xp: userStats.xp,
          level: userStats.level,
          rank: userStats.rank,
          pro_coins: userStats.proCoins,
          streak_days: userStats.streakDays,
          last_login_date: userStats.lastLoginDate,
          shield_active: userStats.shieldActive,
          optimization_mode: userStats.optimizationMode,
          language: userStats.language
        });

        const mappedExpenses = expenses.map(e => ({ ...e, user_id: session.user.id }));
        if (mappedExpenses.length > 0) await supabase.from('expenses').upsert(mappedExpenses);

        const mappedIncomes = incomes.map(i => ({ ...i, user_id: session.user.id }));
        if (mappedIncomes.length > 0) await supabase.from('incomes').upsert(mappedIncomes);

        const mappedGoals = majorGoals.map(g => ({
          id: g.id,
          user_id: session.user.id,
          title: g.title,
          total_steps: g.totalSteps,
          completed_steps: g.completedSteps,
          due_date: g.dueDate,
          step_value: g.stepValue,
          total_value: g.totalValue,
          paid_value: g.paidValue
        }));
        if (mappedGoals.length > 0) await supabase.from('major_goals').upsert(mappedGoals);

        const mappedQuests = quests.map(q => ({
          id: q.id,
          user_id: session.user.id,
          title: q.title,
          description: q.description,
          type: q.type,
          status: q.status,
          due_date: q.dueDate,
          reward_xp: q.rewardXp,
          reward_coins: q.rewardCoins,
          progress: q.progress,
          target: q.target,
          priority: q.priority,
          favorite: q.favorite
        }));
        if (mappedQuests.length > 0) await supabase.from('quests').upsert(mappedQuests);
      } catch (error) {
        console.error('Error saving data to Supabase:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      saveToSupabase();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [userStats, expenses, incomes, majorGoals, quests, session, isLoaded]);

  const checkStreak = (stats: UserStats) => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate !== today) {
      let newStreak = stats.streakDays;
      if (stats.lastLoginDate) {
        const lastLogin = new Date(stats.lastLoginDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastLogin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // reset streak
        }
      } else {
        newStreak = 1;
      }
      setUserStats(prev => ({ ...prev, streakDays: newStreak, lastLoginDate: today }));
    }
  };

  const getRank = (level: number, lang: string) => {
    const r = (translations as any)[lang]?.ranks || translations.pt.ranks;
    if (level < 5) return r[0];
    if (level < 10) return r[1];
    if (level < 20) return r[2];
    if (level < 30) return r[3];
    if (level < 40) return r[4];
    return r[5];
  };

  const addXp = (amount: number, reason: string) => {
    setUserStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newCoins = prev.proCoins + Math.floor(amount / 10);
      const lang = prev.language || 'pt';
      const t = (translations as any)[lang] || translations.pt;
      
      const xpNeeded = newLevel * 100;
      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp -= xpNeeded;
        // Level up bonus
        setTimeout(() => {
          addChatMessage({ role: 'ai', content: `${t.levelUp} ${newLevel} (${getRank(newLevel, lang)}). ${t.keepUp}` });
        }, 0);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        rank: getRank(newLevel, lang),
        proCoins: newCoins
      };
    });
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses(prev => [newExpense, ...prev]);
    
    // Gamification hook: Logging expense
    const today = new Date().toISOString().split('T')[0];
    let xpReward = 10;
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    let message = `${t.loggedExp} ${expense.description}. +10 XP.`;
    
    if (expense.date === today) {
      xpReward *= 2; // Combo multiplier
      message = `${t.comboExp} +20 XP.`;
    }
    
    addXp(xpReward, 'Logged Expense');
    addChatMessage({ role: 'ai', content: message });
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: Date.now().toString() };
    setIncomes(prev => [newIncome, ...prev]);
    
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    addXp(20, 'Logged Income');
    addChatMessage({ role: 'ai', content: `${t.loggedInc} ${income.value.toFixed(2)} ${t.from} ${income.source}. ${t.keepGrowing} +20 XP.` });
  };

  const payGoalStep = (goalId: string) => {
    let xpReward = 0;
    let message = '';
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;

    setMajorGoals(prev => prev.map(goal => {
      if (goal.id === goalId && goal.completedSteps < goal.totalSteps) {
        const newPaid = goal.completedSteps + 1;
        const newPaidValue = goal.paidValue + goal.stepValue;
        
        // Gamification hook: Critical hit / Goal progress
        const isDefeated = newPaid === goal.totalSteps;
        xpReward = 100;
        message = `${t.greatJob} ${goal.stepValue.toFixed(2)} ${t.towards} ${goal.title}.`;
        
        if (isDefeated) {
          xpReward += 500;
          message += ` ${t.goalAchieved} +600 XP.`;
        } else {
          message += ` +100 XP.`;
        }
        
        return { ...goal, completedSteps: newPaid, paidValue: newPaidValue };
      }
      return goal;
    }));

    if (xpReward > 0) {
      addXp(xpReward, 'Progressed Major Goal');
      addChatMessage({ role: 'ai', content: message });
    }
  };

  const completeQuest = (questId: string) => {
    let xpReward = 0;
    let coinsReward = 0;
    let message = '';
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;

    setQuests(prev => prev.map(quest => {
      if (quest.id === questId && quest.status === 'active') {
        xpReward = quest.rewardXp;
        coinsReward = quest.rewardCoins;
        message = `${t.plannerCompleted} ${quest.title}! ${t.earned} +${quest.rewardXp} XP ${t.and} +${quest.rewardCoins} ProCoins. 🛡️`;
        return { ...quest, status: 'completed' };
      }
      return quest;
    }));

    if (xpReward > 0) {
      addXp(xpReward, 'Completed Planner');
      setUserStats(s => ({ ...s, proCoins: s.proCoins + coinsReward }));
      addChatMessage({ role: 'ai', content: message });
    }
  };

  const addQuest = (quest: Omit<Quest, 'id'>) => {
    const newQuest = { ...quest, id: Date.now().toString() };
    setQuests(prev => [newQuest, ...prev]);
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    addChatMessage({ role: 'ai', content: `${t.newPlanner} ${quest.title}. ${t.letsWork}` });
  };

  const toggleQuestFavorite = (questId: string) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, favorite: !q.favorite } : q));
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const toggleOptimizationMode = () => {
    setUserStats(prev => ({ ...prev, optimizationMode: !prev.optimizationMode }));
  };

  const changeLanguage = (lang: 'pt' | 'en' | 'es') => {
    setUserStats(prev => ({ ...prev, language: lang, rank: getRank(prev.level, lang) }));
  };

  const updateName = (name: string) => {
    setUserStats(prev => ({ ...prev, name }));
  };

  const clearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Isso não pode ser desfeito.')) {
      localStorage.clear();
      setUserStats(defaultStats);
      setExpenses(initialExpenses);
      setIncomes(initialIncomes);
      setMajorGoals(initialGoals);
      setQuests(initialQuests);
      setChatHistory(initialChat);
    }
  };

  return (
    <StoreContext.Provider value={{
      userStats, expenses, incomes, majorGoals, quests, chatHistory,
      addExpense, addIncome, payGoalStep, completeQuest, addQuest, toggleQuestFavorite, addChatMessage, addXp, toggleOptimizationMode, changeLanguage, updateName, clearData, signOut, session
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};


