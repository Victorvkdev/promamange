import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, CalendarClock, ShieldAlert, Target, Receipt, Plus, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const translations = {
  pt: {
    hub: 'Hub Financeiro',
    quickAddPlaceholder: 'Adição Rápida: "Café 5" ou "+Salário 5000"',
    formatError: 'Formato: [Descrição] [Valor], ex: "Café 5.50" ou "+Salário 5000"',
    balance: 'Saldo Estimado',
    updated: 'Atualizado',
    expenses: 'Total de Gastos',
    upcomingGoals: 'Próximas Metas',
    activeGoals: 'metas ativas',
    activePlanners: 'Planejadores Ativos',
    completed: 'concluídos',
    recentExpenses: 'Gastos Recentes',
    noExpenses: 'Nenhum gasto recente. Comece a registrar para ganhar XP!',
    majorGoals: 'Grandes Metas Ativas',
    remaining: 'Restante',
    completedSteps: 'Concluído',
    next: 'Próximo',
    expensesByCategory: 'Gastos por Categoria'
  },
  en: {
    hub: 'Financial Hub',
    quickAddPlaceholder: 'Quick Add: "Coffee 5" or "+Salary 5000"',
    formatError: 'Format: [Description] [Amount], e.g., "Coffee 5.50" or "+Salary 5000"',
    balance: 'Estimated Balance',
    updated: 'Updated',
    expenses: 'Total Expenses',
    upcomingGoals: 'Upcoming Goals',
    activeGoals: 'active goals',
    activePlanners: 'Active Planners',
    completed: 'completed',
    recentExpenses: 'Recent Expenses',
    noExpenses: 'No recent expenses. Start logging to earn XP!',
    majorGoals: 'Active Major Goals',
    remaining: 'Remaining',
    completedSteps: 'Completed',
    next: 'Next',
    expensesByCategory: 'Expenses by Category'
  },
  es: {
    hub: 'Centro Financiero',
    quickAddPlaceholder: 'Adición Rápida: "Café 5" o "+Salario 5000"',
    formatError: 'Formato: [Descripción] [Monto], ej: "Café 5.50" o "+Salario 5000"',
    balance: 'Saldo Estimado',
    updated: 'Actualizado',
    expenses: 'Gastos Totales',
    upcomingGoals: 'Próximas Metas',
    activeGoals: 'metas activas',
    activePlanners: 'Planificadores Activos',
    completed: 'completados',
    recentExpenses: 'Gastos Recientes',
    noExpenses: 'No hay gastos recientes. ¡Empieza a registrar para ganar XP!',
    majorGoals: 'Metas Principales Activas',
    remaining: 'Restante',
    completedSteps: 'Completado',
    next: 'Próximo',
    expensesByCategory: 'Gastos por Categoría'
  }
};

const COLORS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#3b82f6'];

export function Dashboard() {
  const { expenses, incomes, majorGoals, quests, userStats, addExpense, addIncome } = useStore();
  const [quickExpense, setQuickExpense] = useState('');
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.value, 0);
  const upcomingBills = majorGoals.filter(d => d.completedSteps < d.totalSteps).reduce((acc, curr) => acc + curr.stepValue, 0);
  const activeQuests = quests.filter(q => q.status === 'active').length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpense) return;
    
    // Simple parser: "+Salary 5000" -> Income, "Coffee 5" -> Expense
    const isIncome = quickExpense.startsWith('+');
    const parseString = isIncome ? quickExpense.substring(1).trim() : quickExpense;
    
    const match = parseString.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
    if (match) {
      if (isIncome) {
        addIncome({
          date: new Date().toISOString().split('T')[0],
          description: match[1].trim(),
          value: parseFloat(match[2]),
          source: 'Other'
        });
      } else {
        addExpense({
          date: new Date().toISOString().split('T')[0],
          description: match[1].trim(),
          value: parseFloat(match[2]),
          category: 'Other',
          account: 'Cash',
          status: 'paid'
        });
      }
      setQuickExpense('');
    } else {
      // If parsing fails, just open the full form or show an error
      alert(t.formatError);
    }
  };

  // Prepare data for the pie chart
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.value;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-zinc-100">{t.hub}</h1>
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={quickExpense}
            onChange={(e) => setQuickExpense(e.target.value)}
            placeholder={t.quickAddPlaceholder}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all flex-1 md:w-64"
          />
          <button type="submit" className={`p-2 shrink-0 bg-violet-500 hover:bg-violet-400 text-zinc-950 rounded-xl transition-all ${userStats.optimizationMode ? '' : 'shadow-[0_0_10px_rgba(139,92,246,0.3)]'}`}>
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-violet-500" />
          </div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.balance}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {(totalIncomes - totalExpenses - upcomingBills).toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-violet-400 bg-violet-500/10 w-fit px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>{t.updated}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.expenses}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {totalExpenses.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 w-fit px-2 py-1 rounded-full">
            <TrendingDown className="w-3 h-3" />
            <span>{t.updated}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarClock className="w-16 h-16 text-orange-500" />
          </div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.upcomingGoals}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {upcomingBills.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-orange-400 bg-orange-500/10 w-fit px-2 py-1 rounded-full">
            <ShieldAlert className="w-3 h-3" />
            <span>{majorGoals.filter(d => d.completedSteps < d.totalSteps).length} {t.activeGoals}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-blue-500" />
          </div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.activePlanners}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">{activeQuests}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-full">
            <Target className="w-3 h-3" />
            <span>{quests.filter(q => q.status === 'completed').length} {t.completed}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-violet-500" />
            {t.expensesByCategory}
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                {t.noExpenses}
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-violet-500" />
            {t.recentExpenses}
          </h3>
          <div className="space-y-4">
            {expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{expense.description}</p>
                    <p className="text-xs text-zinc-500">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-red-400">-R$ {expense.value.toFixed(2)}</span>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-zinc-500 text-center py-4">{t.noExpenses}</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            {t.majorGoals}
          </h3>
          <div className="space-y-4">
            {majorGoals.filter(d => d.completedSteps < d.totalSteps).slice(0, 5).map(goal => {
              const hpPercent = 100 - ((goal.completedSteps / goal.totalSteps) * 100);
              return (
                <div key={goal.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-zinc-200">{goal.title}</p>
                    <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                      {t.remaining}: {hpPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full bg-orange-500 rounded-full ${userStats.optimizationMode ? '' : 'transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{goal.completedSteps}/{goal.totalSteps} {t.completedSteps}</span>
                    <span>{t.next}: R$ {goal.stepValue.toFixed(2)} on {goal.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
