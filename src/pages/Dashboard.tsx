import React, { useState, useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, CalendarClock, ShieldAlert, Target, Receipt, Plus, PieChart as PieChartIcon, ChevronLeft, ChevronRight, CreditCard, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const translations = {
  pt: {
    hub: 'Hub Financeiro',
    quickAddPlaceholder: 'Adição Rápida: "Café 5" ou "+Salário 5000"',
    formatError: 'Formato: [Descrição] [Valor], ex: "Café 5.50" ou "+Salário 5000"',
    balance: 'Saldo do Mês',
    updated: 'Atualizado',
    expenses: 'Gastos do Mês',
    upcomingGoals: 'Próximas Metas',
    activeGoals: 'metas ativas',
    activePlanners: 'Planejadores Ativos',
    completed: 'concluídos',
    recentExpenses: 'Gastos Recentes',
    noExpenses: 'Nenhum gasto neste mês. Comece a registrar!',
    majorGoals: 'Grandes Metas Ativas',
    remaining: 'Restante',
    completedSteps: 'Concluído',
    next: 'Próximo',
    expensesByCategory: 'Gastos por Categoria',
    pendingInvoices: 'Faturas Pendentes',
    noInvoices: 'Nenhuma fatura pendente neste mês.',
    payNow: 'Pagar Fatura',
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  },
  en: {
    hub: 'Financial Hub',
    quickAddPlaceholder: 'Quick Add: "Coffee 5" or "+Salary 5000"',
    formatError: 'Format: [Description] [Amount], e.g., "Coffee 5.50" or "+Salary 5000"',
    balance: 'Monthly Balance',
    updated: 'Updated',
    expenses: 'Monthly Expenses',
    upcomingGoals: 'Upcoming Goals',
    activeGoals: 'active goals',
    activePlanners: 'Active Planners',
    completed: 'completed',
    recentExpenses: 'Recent Expenses',
    noExpenses: 'No expenses this month. Start logging!',
    majorGoals: 'Active Major Goals',
    remaining: 'Remaining',
    completedSteps: 'Completed',
    next: 'Next',
    expensesByCategory: 'Expenses by Category',
    pendingInvoices: 'Pending Invoices',
    noInvoices: 'No pending invoices this month.',
    payNow: 'Pay Invoice',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  es: {
    hub: 'Centro Financiero',
    quickAddPlaceholder: 'Adición Rápida: "Café 5" o "+Salario 5000"',
    formatError: 'Formato: [Descripción] [Monto], ej: "Café 5.50" o "+Salario 5000"',
    balance: 'Saldo del Mes',
    updated: 'Actualizado',
    expenses: 'Gastos del Mes',
    upcomingGoals: 'Próximas Metas',
    activeGoals: 'metas activas',
    activePlanners: 'Planificadores Activos',
    completed: 'completados',
    recentExpenses: 'Gastos Recientes',
    noExpenses: 'No hay gastos este mes. ¡Empieza a registrar!',
    majorGoals: 'Metas Principales Activas',
    remaining: 'Restante',
    completedSteps: 'Completado',
    next: 'Próximo',
    expensesByCategory: 'Gastos por Categoría',
    pendingInvoices: 'Facturas Pendientes',
    noInvoices: 'No hay facturas pendientes este mes.',
    payNow: 'Pagar Factura',
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  }
};

const COLORS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#3b82f6'];

export function Dashboard() {
  const { expenses, incomes, majorGoals, quests, creditCards, userStats, addExpense, addIncome } = useStore();
  const [quickExpense, setQuickExpense] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];

  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  // Função para navegar entre os meses
  const handlePrevMonth = () => setCurrentDate(new Date(selectedYear, selectedMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(selectedYear, selectedMonth + 1, 1));

  // ===== LÓGICA DE FILTRO MENSAL (INCLUI PARCELAS) =====
  const { monthlyExpenses, monthlyIncomes, pendingInvoices } = useMemo(() => {
    let mExpenses = [];
    let mIncomes = incomes.filter(inc => {
      const d = new Date(inc.date + 'T12:00:00');
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Mapeamento de faturas pendentes por cartão
    let invoicesMap: Record<string, { card: any, amount: number }> = {};

    expenses.forEach(exp => {
      const expDate = new Date(exp.date + 'T12:00:00');
      const expMonthAbs = expDate.getFullYear() * 12 + expDate.getMonth();
      const targetMonthAbs = selectedYear * 12 + selectedMonth;

      if (exp.paymentMethod === 'credit') {
        const installments = exp.installments || 1;
        // Verifica se o mês atual está dentro do range de parcelas
        if (targetMonthAbs >= expMonthAbs && targetMonthAbs < expMonthAbs + installments) {
          const installmentValue = exp.value / installments;
          mExpenses.push({ ...exp, displayValue: installmentValue });

          // Se a despesa estiver pendente, soma na fatura daquele cartão
          if (exp.status === 'pending' && exp.cardId) {
            if (!invoicesMap[exp.cardId]) {
              const card = creditCards.find(c => c.id === exp.cardId);
              if (card) invoicesMap[exp.cardId] = { card, amount: 0 };
            }
            if (invoicesMap[exp.cardId]) {
              invoicesMap[exp.cardId].amount += installmentValue;
            }
          }
        }
      } else {
        // Se for débito/dinheiro, apenas confere o mês e ano exatos
        if (targetMonthAbs === expMonthAbs) {
          mExpenses.push({ ...exp, displayValue: exp.value });
        }
      }
    });

    return { 
      monthlyExpenses: mExpenses, 
      monthlyIncomes: mIncomes,
      pendingInvoices: Object.values(invoicesMap).filter(inv => inv.amount > 0)
    };
  }, [expenses, incomes, selectedMonth, selectedYear, creditCards]);
  // ====================================================

  const totalMonthlyExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr.displayValue, 0);
  const totalMonthlyIncomes = monthlyIncomes.reduce((acc, curr) => acc + curr.value, 0);
  const upcomingBills = majorGoals.filter(d => d.completedSteps < d.totalSteps).reduce((acc, curr) => acc + curr.stepValue, 0);
  const activeQuests = quests.filter(q => q.status === 'active').length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpense) return;
    
    const isIncome = quickExpense.startsWith('+');
    const parseString = isIncome ? quickExpense.substring(1).trim() : quickExpense;
    const match = parseString.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
    
    if (match) {
      if (isIncome) {
        addIncome({ date: new Date().toISOString().split('T')[0], description: match[1].trim(), value: parseFloat(match[2]), source: 'Outros' });
      } else {
        addExpense({ date: new Date().toISOString().split('T')[0], description: match[1].trim(), value: parseFloat(match[2]), category: 'Outros', account: 'Dinheiro', status: 'paid', paymentMethod: 'cash', installments: 1 });
      }
      setQuickExpense('');
    } else {
      alert(t.formatError);
    }
  };

  const expensesByCategory = monthlyExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.displayValue;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* HEADER E FILTRO DE MÊS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-violet-500" />
          {t.hub}
        </h1>
        
        <div className="flex items-center gap-4 w-full xl:w-auto flex-col sm:flex-row">
          {/* Seletor de Mês */}
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 w-full sm:w-auto min-w-[200px]">
            <button onClick={handlePrevMonth} className="p-2 text-zinc-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-900"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-medium text-zinc-100 w-24 text-center">
              {t.months[selectedMonth]} {selectedYear}
            </span>
            <button onClick={handleNextMonth} className="p-2 text-zinc-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-900"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Quick Add */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2 w-full sm:w-auto">
            <input type="text" value={quickExpense} onChange={(e) => setQuickExpense(e.target.value)} placeholder={t.quickAddPlaceholder} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all flex-1 sm:w-64" />
            <button type="submit" className={`p-2.5 shrink-0 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}><Plus className="w-5 h-5" /></button>
          </form>
        </div>
      </div>

      {/* QUADROS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet className="w-16 h-16 text-violet-500" /></div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.balance}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {(totalMonthlyIncomes - totalMonthlyExpenses).toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingDown className="w-16 h-16 text-red-500" /></div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.expenses}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {totalMonthlyExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CalendarClock className="w-16 h-16 text-orange-500" /></div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.upcomingGoals}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">R$ {upcomingBills.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target className="w-16 h-16 text-blue-500" /></div>
          <h3 className="text-zinc-400 font-medium text-sm mb-2">{t.activePlanners}</h3>
          <p className="text-3xl font-bold text-zinc-100 font-mono">{activeQuests}</p>
        </div>
      </div>

      {/* GRIDS INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO DE PIZZA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-violet-500" />
            {t.expensesByCategory}
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '0.5rem' }} itemStyle={{ color: '#f4f4f5' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">{t.noExpenses}</div>
            )}
          </div>
        </div>

        {/* FATURAS PENDENTES DO MÊS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            {t.pendingInvoices}
          </h3>
          <div className="space-y-4">
            {pendingInvoices.map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-orange-500/20 hover:border-orange-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{inv.card.name}</p>
                    <p className="text-xs text-zinc-500">Vence dia {inv.card.dueDay}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-red-400">-R$ {inv.amount.toFixed(2)}</p>
                  <span className="text-[10px] uppercase font-bold text-orange-400 mt-1 block">Aguardando Pagamento</span>
                </div>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
                <p>{t.noInvoices}</p>
              </div>
            )}
          </div>
        </div>

        {/* GASTOS RECENTES DO MÊS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            {t.recentExpenses}
          </h3>
          <div className="space-y-4">
            {monthlyExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((expense: any) => (
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
                <div className="text-right">
                  <span className="font-mono font-bold text-red-400">-R$ {expense.displayValue.toFixed(2)}</span>
                  {expense.installments > 1 && (
                     <p className="text-[10px] text-zinc-500 mt-0.5">Parcela de {expense.installments}x</p>
                  )}
                </div>
              </div>
            ))}
            {monthlyExpenses.length === 0 && (
              <p className="text-zinc-500 text-center py-4">{t.noExpenses}</p>
            )}
          </div>
        </div>

        {/* METAS ATIVAS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-500" />
            {t.majorGoals}
          </h3>
          <div className="space-y-4">
            {majorGoals.filter(d => d.completedSteps < d.totalSteps).slice(0, 5).map(goal => {
              const hpPercent = 100 - ((goal.completedSteps / goal.totalSteps) * 100);
              return (
                <div key={goal.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-zinc-200">{goal.title}</p>
                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                      {t.remaining}: {hpPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div className={`h-full bg-blue-500 rounded-full ${userStats.optimizationMode ? '' : 'transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} style={{ width: `${hpPercent}%` }} />
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