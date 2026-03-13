import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Plus, Receipt, Calendar, Tag, CreditCard, CheckCircle2, FileDown, FileSpreadsheet, Trash2, Edit2, Copy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    value: 'Valor Total (R$)',
    description: 'Descrição',
    descPlaceholder: 'ex., Supermercado',
    category: 'Categoria',
    account: 'Conta',
    paymentMethod: 'Forma de Pagamento',
    installments: 'Parcelas',
    cancel: 'Cancelar',
    save: 'Salvar e Ganhar XP',
    exportPDF: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    confirmDelete: 'Tem certeza que deseja remover este gasto?',
    methods: {
      credit: 'Crédito',
      debit: 'Débito',
      cash: 'À Vista / Pix'
    },
    creditCard: 'Cartão de Crédito',
    selectCard: 'Selecione um cartão',
    createCard: 'Criar cartão',
    editEntry: 'Editar Gasto',
    saveChanges: 'Salvar Alterações',
    all: 'Todos',
    favorites: 'Favoritos',
    categories: {
      food: 'Alimentação',
      transport: 'Transporte',
      utilities: 'Contas',
      leisure: 'Lazer',
      health: 'Saúde',
      other: 'Outros'
    },
    accounts: {
      bradesco: 'Bradesco',
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
      val: 'Valor',
      actions: 'Ações'
    },
    empty: 'Nenhum gasto registrado ainda. Comece sua rotina diária!'
  },
  en: {
    title: 'Daily Expenses',
    subtitle: 'Log expenses to maintain your streak and earn XP.',
    logExpense: 'Log Expense',
    newEntry: 'New Expense Entry',
    date: 'Date',
    value: 'Total Value (R$)',
    description: 'Description',
    descPlaceholder: 'e.g., Groceries',
    category: 'Category',
    account: 'Account',
    paymentMethod: 'Payment Method',
    installments: 'Installments',
    cancel: 'Cancel',
    save: 'Save & Earn XP',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    confirmDelete: 'Are you sure you want to remove this expense?',
    methods: {
      credit: 'Credit',
      debit: 'Debit',
      cash: 'Cash / Pix'
    },
    creditCard: 'Credit Card',
    selectCard: 'Select a card',
    createCard: 'Create card',
    editEntry: 'Edit Expense',
    saveChanges: 'Save Changes',
    all: 'All',
    favorites: 'Favorites',
    categories: {
      food: 'Food',
      transport: 'Transport',
      utilities: 'Utilities',
      leisure: 'Leisure',
      health: 'Health',
      other: 'Other'
    },
    accounts: {
      bradesco: 'Bradesco',
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
      val: 'Value',
      actions: 'Actions'
    },
    empty: 'No expenses logged yet. Start your daily grind!'
  },
  es: {
    title: 'Gastos Diarios',
    subtitle: 'Registra gastos para mantener tu racha y ganar XP.',
    logExpense: 'Registrar Gasto',
    newEntry: 'Nueva Entrada de Gasto',
    date: 'Fecha',
    value: 'Valor Total (R$)',
    description: 'Descripción',
    descPlaceholder: 'ej., Supermercado',
    category: 'Categoría',
    account: 'Cuenta',
    paymentMethod: 'Método de Pago',
    installments: 'Cuotas',
    cancel: 'Cancelar',
    save: 'Guardar y Ganar XP',
    exportPDF: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    confirmDelete: '¿Estás seguro de que deseas eliminar este gasto?',
    methods: {
      credit: 'Crédito',
      debit: 'Débito',
      cash: 'Efectivo / Pix'
    },
    creditCard: 'Tarjeta de Crédito',
    selectCard: 'Seleccione una tarjeta',
    createCard: 'Crear tarjeta',
    editEntry: 'Editar Gasto',
    saveChanges: 'Guardar Cambios',
    all: 'Todos',
    favorites: 'Favoritos',
    categories: {
      food: 'Alimentación',
      transport: 'Transporte',
      utilities: 'Servicios',
      leisure: 'Ocio',
      health: 'Salud',
      other: 'Otros'
    },
    accounts: {
      bradesco: 'Bradesco',
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
      val: 'Valor',
      actions: 'Acciones'
    },
    empty: 'Aún no hay gastos registrados. ¡Empieza tu rutina diaria!'
  }
};

export function Expenses() {
  const { expenses, addExpense, updateExpense, removeExpense, copyExpense, toggleExpenseFavorite, userStats, creditCards } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const lang = userStats.language || 'pt';
  const t = translations[lang];
  const navigate = useNavigate();

  // Pega o ID do cartão favorito para preencher automaticamente
  const favoriteCardId = creditCards.find(c => c.favorite)?.id || '';

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: '',
    category: t.categories.food,
    account: t.accounts.bradesco,
    paymentMethod: 'credit' as 'credit' | 'debit' | 'cash',
    installments: 1,
    status: 'paid' as const,
    cardId: favoriteCardId // Inicializa com o favorito
  });

  // Atualiza o estado caso o usuário mude o favorito depois de abrir a tela
  useEffect(() => {
    if (!editingId && newExpense.paymentMethod === 'credit' && !newExpense.cardId) {
      setNewExpense(prev => ({ ...prev, cardId: favoriteCardId }));
    }
  }, [favoriteCardId, newExpense.paymentMethod, editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.value || !newExpense.description) return;

    if (newExpense.paymentMethod === 'credit') {
      if (creditCards.length === 0) {
        alert('Você precisa criar um cartão de crédito primeiro.');
        return;
      }
      if (!newExpense.cardId) {
        alert(t.selectCard);
        return;
      }
    }

    const expenseData = {
      ...newExpense,
      value: parseFloat(newExpense.value),
      cardId: newExpense.paymentMethod === 'credit' ? newExpense.cardId : undefined,
      // Se for crédito, entra como pendente até a fatura ser paga
      status: newExpense.paymentMethod === 'credit' ? 'pending' : 'paid'
    };

    if (editingId) {
      updateExpense(editingId, expenseData as any);
    } else {
      addExpense(expenseData as any);
    }
    
    handleCancel();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      value: '',
      description: '',
      category: t.categories.food,
      account: t.accounts.bradesco,
      paymentMethod: 'credit',
      installments: 1,
      status: 'paid',
      cardId: favoriteCardId // Reseta com o favorito
    });
  };

  const handleEdit = (expense: any) => {
    setNewExpense({
      date: expense.date,
      value: expense.value.toString(),
      description: expense.description,
      category: expense.category,
      account: expense.account,
      paymentMethod: expense.paymentMethod || 'cash',
      installments: expense.installments || 1,
      status: expense.status || 'paid',
      cardId: expense.cardId || ''
    });
    setEditingId(expense.id);
    setIsAdding(true);
  };

  const handleCopy = (id: string) => {
    copyExpense(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      removeExpense(id);
    }
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

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'favorites') return expense.favorite;
    return true;
  });

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
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                filter === 'favorites' 
                  ? 'bg-zinc-800 text-yellow-400' 
                  : 'text-zinc-400 hover:text-yellow-400/70'
              }`}
            >
              <Star className="w-4 h-4" fill={filter === 'favorites' ? "currentColor" : "none"} />
              {t.favorites}
            </button>
          </div>
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
            onClick={() => {
              setIsAdding(!isAdding);
              if (!isAdding) {
                setEditingId(null);
                setNewExpense({
                  date: new Date().toISOString().split('T')[0],
                  value: '',
                  description: '',
                  category: t.categories.food,
                  account: t.accounts.bradesco,
                  paymentMethod: 'credit',
                  installments: 1,
                  status: 'paid',
                  cardId: favoriteCardId
                });
              }
            }}
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
            {editingId ? t.editEntry : t.newEntry}
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
                <CreditCard className="w-4 h-4" /> {t.paymentMethod}
              </label>
              <select
                value={newExpense.paymentMethod}
                onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value as any})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              >
                <option value="credit">{t.methods.credit}</option>
                <option value="debit">{t.methods.debit}</option>
                <option value="cash">{t.methods.cash}</option>
              </select>
            </div>

            {newExpense.paymentMethod === 'credit' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> {t.creditCard}
                  </label>
                  {creditCards.length > 0 ? (
                    <select
                      value={newExpense.cardId}
                      onChange={e => setNewExpense({...newExpense, cardId: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>{t.selectCard}</option>
                      {creditCards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name} {card.lastFourDigits ? `(Final ${card.lastFourDigits})` : ''} {card.favorite ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/cards')}
                      className="w-full bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {t.createCard}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {t.installments}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={newExpense.installments}
                    onChange={e => setNewExpense({...newExpense, installments: parseInt(e.target.value) || 1})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    required
                  />
                  {newExpense.installments > 1 && newExpense.value && (
                    <p className="text-xs text-violet-400 font-medium mt-1">
                      {newExpense.installments}x de R$ {(parseFloat(newExpense.value) / newExpense.installments).toFixed(2)}
                    </p>
                  )}
                </div>
              </>
            )}

            {newExpense.paymentMethod !== 'credit' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> {t.account}
                </label>
                <select
                  value={newExpense.account}
                  onChange={e => setNewExpense({...newExpense, account: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
                >
                  <option value={t.accounts.bradesco}>{t.accounts.bradesco}</option>
                  <option value={t.accounts.nubank}>{t.accounts.nubank}</option>
                  <option value={t.accounts.inter}>{t.accounts.inter}</option>
                  <option value={t.accounts.picpay}>{t.accounts.picpay}</option>
                  <option value={t.accounts.cash}>{t.accounts.cash}</option>
                </select>
              </div>
            )}

          </div>

          <div className="mt-6 flex justify-end gap-4 relative z-10">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`px-6 py-3 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${userStats.optimizationMode ? '' : 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {editingId ? t.saveChanges : t.save}
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
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredExpenses.map((expense) => {
                // Cálculo visual da parcela na tabela
                const isInstallment = expense.paymentMethod === 'credit' && expense.installments && expense.installments > 1;
                const displayValue = isInstallment ? (expense.value / expense.installments!) : expense.value;

                return (
                  <tr key={expense.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4 text-zinc-300 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpenseFavorite(expense.id)}
                          className={`p-1 rounded-md transition-colors ${expense.favorite ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-zinc-600 hover:text-yellow-400/70 hover:bg-zinc-800'}`}
                        >
                          <Star className="w-4 h-4" fill={expense.favorite ? "currentColor" : "none"} />
                        </button>
                        {expense.date}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-zinc-100">
                      {expense.description}
                      {expense.status === 'pending' && expense.paymentMethod === 'credit' && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">Fatura Pendente</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">
                      {expense.paymentMethod === 'credit' ? (
                        <>
                          {(t.methods as any)[expense.paymentMethod]}
                          {expense.cardId && (
                            <span className="block text-xs text-zinc-500 mt-0.5">
                              {creditCards.find(c => c.id === expense.cardId)?.name || 'Cartão'}
                            </span>
                          )}
                        </>
                      ) : (
                        expense.account
                      )}
                    </td>
                    <td className="p-4 text-right font-mono">
                      <div className="text-red-400 font-bold">
                        -R$ {displayValue.toFixed(2)}
                      </div>
                      {isInstallment && (
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {expense.installments}x (Total: R$ {expense.value.toFixed(2)})
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(expense.id)}
                          className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-violet-400/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title={t.confirmDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    {filter === 'favorites' ? 'Nenhum gasto favorito encontrado.' : t.empty}
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