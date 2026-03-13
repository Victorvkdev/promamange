import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStats, Expense, MajorGoal, Quest, ChatMessage, Income, CreditCard } from '../types';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  userStats: UserStats;
  expenses: Expense[];
  incomes: Income[];
  majorGoals: MajorGoal[];
  quests: Quest[];
  chatHistory: ChatMessage[];
  creditCards: CreditCard[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  copyExpense: (id: string) => void;
  toggleExpenseFavorite: (id: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  payGoalStep: (goalId: string, amount?: number) => void;
  updateMajorGoal: (id: string, goal: Partial<MajorGoal>) => void;
  removeMajorGoal: (id: string) => void;
  addMajorGoal: (goal: Omit<MajorGoal, 'id'>) => void;
  completeQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  updateQuest: (id: string, quest: Partial<Quest>) => void;
  removeQuest: (id: string) => void;
  toggleQuestFavorite: (questId: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => string;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  removeCreditCard: (id: string) => void;
  payCreditCardInvoice: (id: string, amount: number) => void;
  addXp: (amount: number, reason: string) => void;
  toggleOptimizationMode: () => void;
  changeLanguage: (lang: 'pt' | 'en' | 'es') => void;
  updateName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
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
  deviceId: '',
};

const initialExpenses: Expense[] = [];
const initialIncomes: Income[] = [];
const initialGoals: MajorGoal[] = [];
const initialQuests: Quest[] = [];
const initialCreditCards: CreditCard[] = [];

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
  const [creditCards, setCreditCards] = useState<CreditCard[]>(initialCreditCards);

  const [isLoaded, setIsLoaded] = useState(false);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
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
      
      const savedCards = localStorage.getItem('promanage_v2_cards');
      if (savedCards) setCreditCards(JSON.parse(savedCards));
      
      const savedChat = localStorage.getItem('promanage_v2_chat');
      if (savedChat) setChatHistory(JSON.parse(savedChat));

      checkStreak(savedStats ? JSON.parse(savedStats) : defaultStats);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      try {
        let currentDeviceId = localStorage.getItem('promanage_v2_device_id');
        if (!currentDeviceId) {
          currentDeviceId = crypto.randomUUID();
          localStorage.setItem('promanage_v2_device_id', currentDeviceId);
        }

        const { data: stats } = await supabase.from('user_stats').select('*').eq('id', session.user.id).single();
        if (stats) {
          if (stats.device_id !== currentDeviceId) {
             await supabase.from('user_stats').update({ device_id: currentDeviceId }).eq('id', session.user.id);
          }

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
            language: stats.language,
            deviceId: currentDeviceId,
            avatar: stats.avatar
          };
          setUserStats(loadedStats);
          checkStreak(loadedStats);
        } else {
          setUserStats(prev => ({ ...prev, deviceId: currentDeviceId as string }));
        }

        const channel = supabase.channel('user_stats_changes')
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'user_stats', filter: `id=eq.${session.user.id}` },
            (payload) => {
              if (payload.new.device_id && payload.new.device_id !== currentDeviceId) {
                alert('Sua conta foi acessada por outro dispositivo. Você será desconectado.');
                signOut();
              }
            }
          )
          .subscribe();

        const { data: exp } = await supabase.from('expenses').select('*').eq('user_id', session.user.id);
        if (exp && exp.length > 0) {
          setExpenses(exp.map(e => ({
            id: e.id,
            date: e.date,
            value: e.value,
            description: e.description,
            category: e.category,
            account: e.account,
            status: e.status,
            paymentMethod: e.payment_method,
            installments: e.installments,
            cardId: e.card_id,
            favorite: e.favorite
          })));
        }

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
            paidValue: g.paid_value,
            history: g.history || []
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
            targetValue: q.target_value,
            currentValue: q.current_value,
            history: q.history || [],
            priority: q.priority,
            favorite: q.favorite
          })));
        }

        const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', session.user.id);
        if (cards && cards.length > 0) {
          setCreditCards(cards.map(c => ({
            id: c.id,
            name: c.name,
            limit: c.limit_value,
            usedLimit: c.used_limit,
            closingDay: c.closing_day,
            dueDay: c.due_day
          })));
        }
      } catch (error) {
        console.error('Error loading data from Supabase, falling back to local storage:', error);
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
        
        const savedCards = localStorage.getItem('promanage_v2_cards');
        if (savedCards) setCreditCards(JSON.parse(savedCards));
        
        const savedChat = localStorage.getItem('promanage_v2_chat');
        if (savedChat) setChatHistory(JSON.parse(savedChat));
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();

    return () => {
      supabase.removeAllChannels();
    };
  }, [session]);

  useEffect(() => {
    if (!isLoaded) return; 

    const saveToSupabase = async () => {
      localStorage.setItem('promanage_v2_stats', JSON.stringify(userStats));
      localStorage.setItem('promanage_v2_expenses', JSON.stringify(expenses));
      localStorage.setItem('promanage_v2_incomes', JSON.stringify(incomes));
      localStorage.setItem('promanage_v2_goals', JSON.stringify(majorGoals));
      localStorage.setItem('promanage_v2_quests', JSON.stringify(quests));
      localStorage.setItem('promanage_v2_cards', JSON.stringify(creditCards));
      localStorage.setItem('promanage_v2_chat', JSON.stringify(chatHistory));

      if (!session?.user?.id) return;

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
          language: userStats.language,
          device_id: userStats.deviceId,
          avatar: userStats.avatar
        });

        const mappedExpenses = expenses.map(e => ({ 
          id: e.id,
          user_id: session.user.id,
          date: e.date,
          value: e.value,
          description: e.description,
          category: e.category,
          account: e.account,
          status: e.status,
          payment_method: e.paymentMethod,
          installments: e.installments,
          card_id: e.cardId,
          favorite: e.favorite || false
        }));
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
          paid_value: g.paidValue,
          history: g.history || []
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
          target_value: q.targetValue,
          current_value: q.currentValue,
          history: q.history || [],
          priority: q.priority,
          favorite: q.favorite
        }));
        if (mappedQuests.length > 0) await supabase.from('quests').upsert(mappedQuests);

        const mappedCards = creditCards.map(c => ({
          id: c.id,
          user_id: session.user.id,
          name: c.name,
          limit_value: c.limit,
          used_limit: c.usedLimit || 0,
          closing_day: c.closingDay,
          due_day: c.dueDay
        }));
        if (mappedCards.length > 0) await supabase.from('credit_cards').upsert(mappedCards);
      } catch (error) {
        console.error('Error saving data to Supabase:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      saveToSupabase();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [userStats, expenses, incomes, majorGoals, quests, creditCards, session, isLoaded]);

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
          newStreak = 1; 
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
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);
    
    if (expense.paymentMethod === 'credit' && expense.cardId) {
      setCreditCards(prev => prev.map(c => 
        c.id === expense.cardId ? { ...c, usedLimit: (c.usedLimit || 0) + expense.value } : c
      ));
    }
    
    const today = new Date().toISOString().split('T')[0];
    let xpReward = 10;
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    let message = `${t.loggedExp} ${expense.description}. +10 XP.`;
    
    if (expense.date === today) {
      xpReward *= 2; 
      message = `${t.comboExp} +20 XP.`;
    }
    
    addXp(xpReward, 'Logged Expense');
    addChatMessage({ role: 'ai', content: message });
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    const oldExpense = expenses.find(e => e.id === id);
    if (!oldExpense) return;

    if (oldExpense.paymentMethod === 'credit' && oldExpense.cardId) {
      setCreditCards(prev => prev.map(c => 
        c.id === oldExpense.cardId ? { ...c, usedLimit: Math.max(0, (c.usedLimit || 0) - oldExpense.value) } : c
      ));
    }

    const newExpense = { ...oldExpense, ...updatedExpense };

    if (newExpense.paymentMethod === 'credit' && newExpense.cardId) {
      setCreditCards(prev => prev.map(c => 
        c.id === newExpense.cardId ? { ...c, usedLimit: (c.usedLimit || 0) + newExpense.value } : c
      ));
    }

    setExpenses(prev => prev.map(e => e.id === id ? newExpense : e));
  };

  const copyExpense = (id: string) => {
    const expenseToCopy = expenses.find(e => e.id === id);
    if (expenseToCopy) {
      const { id: _, favorite, ...expenseData } = expenseToCopy;
      addExpense({ ...expenseData, date: new Date().toISOString().split('T')[0] });
    }
  };

  const toggleExpenseFavorite = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, favorite: !e.favorite } : e));
  };

  const removeExpense = async (id: string) => {
    const expenseToRemove = expenses.find(e => e.id === id);
    if (expenseToRemove && expenseToRemove.paymentMethod === 'credit' && expenseToRemove.cardId) {
      setCreditCards(prev => prev.map(c => 
        c.id === expenseToRemove.cardId ? { ...c, usedLimit: Math.max(0, (c.usedLimit || 0) - expenseToRemove.value) } : c
      ));
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
    if (session?.user?.id) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: crypto.randomUUID() };
    setIncomes(prev => [newIncome, ...prev]);
    
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    addXp(20, 'Logged Income');
    addChatMessage({ role: 'ai', content: `${t.loggedInc} ${income.value.toFixed(2)} ${t.from} ${income.source}. ${t.keepGrowing} +20 XP.` });
  };

  const payGoalStep = (goalId: string, amount?: number) => {
    let xpReward = 0;
    let message = '';
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;

    setMajorGoals(prev => prev.map(goal => {
      if (goal.id === goalId && goal.completedSteps < goal.totalSteps) {
        const newPaid = goal.completedSteps + 1;
        const newPaidValue = goal.paidValue + (amount || goal.stepValue);
        
        const historyEntry = { date: new Date().toISOString().split('T')[0], value: amount || goal.stepValue };
        const newHistory = [...(goal.history || []), historyEntry];
        
        const isDefeated = newPaid === goal.totalSteps || newPaidValue >= goal.totalValue;
        xpReward = 100;
        message = `${t.greatJob} ${(amount || goal.stepValue).toFixed(2)} ${t.towards} ${goal.title}.`;
        
        if (isDefeated) {
          xpReward += 500;
          message += ` ${t.goalAchieved} +600 XP.`;
        } else {
          message += ` +100 XP.`;
        }
        
        return { ...goal, completedSteps: newPaid, paidValue: newPaidValue, history: newHistory };
      }
      return goal;
    }));

    if (xpReward > 0) {
      addXp(xpReward, 'Progressed Major Goal');
      addChatMessage({ role: 'ai', content: message });
    }
  };

  const addMajorGoal = (goal: Omit<MajorGoal, 'id'>) => {
    const newGoal = { ...goal, id: crypto.randomUUID(), history: [] };
    setMajorGoals(prev => [newGoal, ...prev]);
  };

  const updateMajorGoal = (id: string, goal: Partial<MajorGoal>) => {
    setMajorGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g));
  };

  const removeMajorGoal = async (id: string) => {
    setMajorGoals(prev => prev.filter(g => g.id !== id));
    if (session?.user?.id) {
      await supabase.from('major_goals').delete().eq('id', id);
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
    const newQuest = { ...quest, id: crypto.randomUUID(), history: [] };
    setQuests(prev => [newQuest, ...prev]);
    const lang = userStats.language || 'pt';
    const t = (translations as any)[lang] || translations.pt;
    addChatMessage({ role: 'ai', content: `${t.newPlanner} ${quest.title}. ${t.letsWork}` });
  };

  const updateQuest = (id: string, quest: Partial<Quest>) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, ...quest } : q));
  };

  const removeQuest = async (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    if (session?.user?.id) {
      await supabase.from('quests').delete().eq('id', id);
    }
  };

  const toggleQuestFavorite = (questId: string) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, favorite: !q.favorite } : q));
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const addCreditCard = (card: Omit<CreditCard, 'id'>) => {
    const newCard = { ...card, id: crypto.randomUUID() };
    setCreditCards(prev => [...prev, newCard]);
    return newCard.id;
  };

  const updateCreditCard = (id: string, card: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...card } : c));
  };

  const removeCreditCard = async (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
    if (session?.user?.id) {
      await supabase.from('credit_cards').delete().eq('id', id);
    }
  };

  // ========== FUNÇÃO ATUALIZADA AQUI ==========
  const payCreditCardInvoice = (id: string, amount: number) => {
    const card = creditCards.find(c => c.id === id);
    if (!card) return;

    // 1. Reduz o limite utilizado (usado) do cartão
    setCreditCards(prev => prev.map(c => {
      if (c.id === id) {
        const currentUsed = c.usedLimit || 0;
        const newUsed = Math.max(0, currentUsed - amount);
        return { ...c, usedLimit: newUsed };
      }
      return c;
    }));

    // 2. Muda o status das despesas desse cartão que estavam pendentes para pagas
    setExpenses(prev => prev.map(exp => {
      if (exp.cardId === id && exp.status === 'pending') {
        return { ...exp, status: 'paid' as const };
      }
      return exp;
    }));

    // 3. Recompensa Gamificada: Pagar a fatura gera XP!
    const lang = userStats.language || 'pt';
    addXp(50, 'Paid Credit Card Invoice');
    addChatMessage({ 
      role: 'ai', 
      content: lang === 'pt' 
        ? `Pagamento de fatura do cartão ${card.name} no valor de R$ ${amount.toFixed(2)} registrado! Limite liberado. +50 XP 💳` 
        : `Invoice payment for ${card.name} of R$ ${amount.toFixed(2)} logged! Limit restored. +50 XP 💳` 
    });
  };
  // ============================================

  const toggleOptimizationMode = () => {
    setUserStats(prev => ({ ...prev, optimizationMode: !prev.optimizationMode }));
  };

  const changeLanguage = (lang: 'pt' | 'en' | 'es') => {
    setUserStats(prev => ({ ...prev, language: lang, rank: getRank(prev.level, lang) }));
  };

  const updateName = (name: string) => {
    setUserStats(prev => ({ ...prev, name }));
  };

  const updateAvatar = (avatar: string) => {
    setUserStats(prev => ({ ...prev, avatar }));
  };

  const clearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Isso não pode ser desfeito.')) {
      localStorage.clear();
      setUserStats(defaultStats);
      setExpenses(initialExpenses);
      setIncomes(initialIncomes);
      setMajorGoals(initialGoals);
      setQuests(initialQuests);
      setCreditCards(initialCreditCards);
      setChatHistory(initialChat);
    }
  };

  return (
    <StoreContext.Provider value={{
      userStats, expenses, incomes, majorGoals, quests, chatHistory, creditCards,
      addExpense, updateExpense, removeExpense, copyExpense, toggleExpenseFavorite, addIncome, payGoalStep, updateMajorGoal, removeMajorGoal, addMajorGoal, completeQuest, addQuest, updateQuest, removeQuest, toggleQuestFavorite, addChatMessage, addCreditCard, updateCreditCard, removeCreditCard, payCreditCardInvoice, addXp, toggleOptimizationMode, changeLanguage, updateName, updateAvatar, clearData, signOut, session
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