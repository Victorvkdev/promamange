import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Plus, Receipt, Calendar, Tag, CreditCard, CheckCircle2, FileDown, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const translations = {
  pt: {
    title: 'Gastos Diários',
    subtitle: 'Registre gastos para manter sua ofensiva e ganhar XP.',
    logExpense: 'Registrar Gasto',
    newEntry: 'Nova Entrada de Gasto',
    date: 'Data',
    value: 'Valor (R$)',
    description: 'Descrição',
    descPlaceholder: 'ex., Supermercado',
    category: 'Categoria',
    account: 'Conta',
    cancel: 'Cancelar',
    save: 'Salvar e Ganhar XP',
    exportPDF: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    categories: {
      food: 'Alimentação',
      transport: 'Transporte',
      utilities: 'Contas',
      leisure: 'Lazer',
      health: 'Saúde',
      other: 'Outros'
    },
    accounts: {
      nubank: 'Nubank',
      inter: 'Banco Inter',
      picpay: 'PicPay',
      cash: 'Dinheiro'
    },
    table: {
      date: 'Data',
      desc: 'Descrição',
      cat: 'Categoria',
      acc: 'Conta',
      val: 'Valor'
    },
    empty: 'Nenhum gasto registrado ainda. Comece sua rotina diária!'
  },
  en: {
    title: 'Daily Expenses',
    subtitle: 'Log expenses to maintain your streak and earn XP.',
    logExpense: 'Log Expense',
    newEntry: 'New Expense Entry',
    date: 'Date',
    value: 'Value (R$)',
    description: 'Description',
    descPlaceholder: 'e.g., Groceries',
    category: 'Category',
    account: 'Account',
    cancel: 'Cancel',
    save: 'Save & Earn XP',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    categories: {
      food: 'Food',
      transport: 'Transport',
      utilities: 'Utilities',
      leisure: 'Leisure',
      health: 'Health',
      other: 'Other'
    },
    accounts: {
      nubank: 'Nubank',
      inter: 'Banco Inter',
      picpay: 'PicPay',
      cash: 'Cash'
    },
    table: {
      date: 'Date',
      desc: 'Description',
      cat: 'Category',
      acc: 'Account',
      val: 'Value'
    },
    empty: 'No expenses logged yet. Start your daily grind!'
  },
  es: {
    title: 'Gastos Diarios',
    subtitle: 'Registra gastos para mantener tu racha y ganar XP.',
    logExpense: 'Registrar Gasto',
    newEntry: 'Nueva Entrada de Gasto',
    date: 'Fecha',
    value: 'Valor (R$)',
    description: 'Descripción',
    descPlaceholder: 'ej., Supermercado',
    category: 'Categoría',
    account: 'Cuenta',
    cancel: 'Cancelar',
    save: 'Guardar y Ganar XP',
    exportPDF: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    categories: {
      food: 'Alimentación',
      transport: 'Transporte',
      utilities: 'Servicios',
      leisure: 'Ocio',
      health: 'Salud',
      other: 'Otros'
    },
    accounts: {
      nubank: 'Nubank',
      inter: 'Banco Inter',
      picpay: 'PicPay',
      cash: 'Efectivo'
    },
    table: {
      date: 'Fecha',
      desc: 'Descripción',
      cat: 'Categoría',
      acc: 'Cuenta',
      val: 'Valor'
    },
    empty: 'Aún no hay gastos registrados. ¡Empieza tu rutina diaria!'
  }
};

export function Expenses() {
  const { expenses, addExpense, userStats } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: '',
    category: t.categories.food,
    account: t.accounts.nubank,
    status: 'paid' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.value || !newExpense.description) return;

    addExpense({
      ...newExpense,
      value: parseFloat(newExpense.value)
    });
    
    setIsAdding(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      value: '',
      description: '',
      category: t.categories.food,
      account: t.accounts.nubank,
      status: 'paid'
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(t.title, 14, 15);
    
    const tableColumn = [t.table.date, t.table.desc, t.table.cat, t.table.acc, t.table.val];
    const tableRows = expenses.map(exp => [
      exp.date,
      exp.description,
      exp.category,
      exp.account,
      `R$ ${exp.value.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`expenses_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(expenses.map(exp => ({
      [t.table.date]: exp.date,
      [t.table.desc]: exp.description,
      [t.table.cat]: exp.category,
      [t.table.acc]: exp.account,
      [t.table.val]: exp.value
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">{t.title}</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToPDF}
            className={`flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl transition-all w-full sm:w-auto`}
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">{t.exportPDF}</span>
          </button>
          <button
            onClick={exportToExcel}
            className={`flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl transition-all w-full sm:w-auto`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">{t.exportExcel}</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
          >
            <Plus className="w-5 h-5" />
            {t.logExpense}
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className={`bg-zinc-900 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden ${userStats.optimizationMode ? '' : 'shadow-[0_0_30px_rgba(139,92,246,0.1)]'}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Receipt className="w-32 h-32 text-violet-500" />
          </div>
          
          <h3 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {t.newEntry}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {t.date}
              </label>
              <input
                type="date"
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4" /> {t.value}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExpense.value}
                onChange={e => setNewExpense({...newExpense, value: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" /> {t.description}
              </label>
              <input
                type="text"
                placeholder={t.descPlaceholder}
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" /> {t.category}
              </label>
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              >
                <option value={t.categories.food}>{t.categories.food}</option>
                <option value={t.categories.transport}>{t.categories.transport}</option>
                <option value={t.categories.utilities}>{t.categories.utilities}</option>
                <option value={t.categories.leisure}>{t.categories.leisure}</option>
                <option value={t.categories.health}>{t.categories.health}</option>
                <option value={t.categories.other}>{t.categories.other}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> {t.account}
              </label>
              <select
                value={newExpense.account}
                onChange={e => setNewExpense({...newExpense, account: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              >
                <option value={t.accounts.nubank}>{t.accounts.nubank}</option>
                <option value={t.accounts.inter}>{t.accounts.inter}</option>
                <option value={t.accounts.picpay}>{t.accounts.picpay}</option>
                <option value={t.accounts.cash}>{t.accounts.cash}</option>
              </select>
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
              className={`px-6 py-3 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {t.save}
            </button>
          </div>
        </motion.form>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800">
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.table.date}</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.table.desc}</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.table.cat}</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.table.acc}</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">{t.table.val}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-4 text-zinc-300 font-mono text-sm">{expense.date}</td>
                  <td className="p-4 font-medium text-zinc-100">{expense.description}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 text-sm">{expense.account}</td>
                  <td className="p-4 text-right font-mono font-bold text-red-400">
                    -R$ {expense.value.toFixed(2)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    {t.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
