import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, FileUp, Loader2, Upload, X, CheckCircle2, Star } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const translations = {
  pt: { title: 'Meus Cartões', subtitle: 'Gerencie seus cartões de crédito, faturas e parcelamentos.', addCard: 'Adicionar Cartão', cardName: 'Nome do Cartão', lastFour: '4 Últimos Dígitos (Opcional)', limit: 'Limite Total', usedLimit: 'Limite Utilizado', availableLimit: 'Disponível', closingDay: 'Fechamento', dueDay: 'Vencimento', cancel: 'Cancelar', save: 'Salvar', noCards: 'Nenhum cartão cadastrado ainda.', uploadInvoice: 'Importar Fatura', uploadInitialInvoice: 'Importar Fatura Atual (Opcional)', extractedExpenses: 'Gastos Identificados', disclaimer: 'A identificação por imagem pode ter inconsistências.', description: 'Descrição', value: 'Valor', installments: 'Parcelas', date: 'Data', remove: 'Remover', confirmDelete: 'Tem certeza que deseja remover este cartão?', uploading: 'Analisando...', uploadSuccess: 'Fatura analisada com sucesso!', uploadError: 'Erro ao analisar fatura. Tente novamente.', invoiceDetails: 'Detalhes da Fatura', close: 'Fechar', noExpenses: 'Nenhum gasto pendente neste cartão.', undeterminedValue: 'Gastos Não Listados', undeterminedDesc: 'Valor já utilizado no limite, mas não detalhado abaixo.', invoiceQuestion: 'Qual o valor da sua fatura desse mês?', amountToPay: 'Valor da Fatura Atual', payButton: 'Efetuar Pagamento', favorite: 'Favorito', makeFavorite: 'Tornar Favorito' },
  en: { title: 'My Cards', subtitle: 'Manage your credit cards, invoices, and installments.', addCard: 'Add Card', cardName: 'Card Name', lastFour: 'Last 4 Digits (Optional)', limit: 'Total Limit', usedLimit: 'Used Limit', availableLimit: 'Available', closingDay: 'Closing', dueDay: 'Due', cancel: 'Cancel', save: 'Save', noCards: 'No cards registered yet.', uploadInvoice: 'Import Invoice', uploadInitialInvoice: 'Import Current Invoice (Optional)', extractedExpenses: 'Identified Expenses', disclaimer: 'Image identification may have inconsistencies.', description: 'Description', value: 'Value', installments: 'Installments', date: 'Date', remove: 'Remove', confirmDelete: 'Are you sure you want to remove this card?', uploading: 'Analyzing...', uploadSuccess: 'Invoice analyzed successfully!', uploadError: 'Error analyzing invoice.', invoiceDetails: 'Invoice Details', close: 'Close', noExpenses: 'No pending expenses on this card.', undeterminedValue: 'Unlisted Expenses', undeterminedDesc: 'Value already used in the limit, but not detailed below.', invoiceQuestion: 'What is your invoice amount this month?', amountToPay: 'Current Invoice Amount', payButton: 'Make Payment', favorite: 'Favorite', makeFavorite: 'Make Favorite' },
  es: { title: 'Mis Tarjetas', subtitle: 'Gestiona tus tarjetas de crédito, facturas y cuotas.', addCard: 'Añadir Tarjeta', cardName: 'Nombre de la Tarjeta', lastFour: 'Últimos 4 Dígitos (Opcional)', limit: 'Límite Total', usedLimit: 'Límite Utilizado', availableLimit: 'Disponible', closingDay: 'Cierre', dueDay: 'Vencimiento', cancel: 'Cancelar', save: 'Guardar', noCards: 'Aún no hay tarjetas registradas.', uploadInvoice: 'Importar Factura', uploadInitialInvoice: 'Importar Factura Actual (Opcional)', extractedExpenses: 'Gastos Identificados', disclaimer: 'La identificación por imagen puede tener inconsistencias.', description: 'Descripción', value: 'Valor', installments: 'Cuotas', date: 'Fecha', remove: 'Eliminar', confirmDelete: '¿Deseas eliminar esta tarjeta?', uploading: 'Analizando...', uploadSuccess: '¡Factura analizada con éxito!', uploadError: 'Error al analizar la factura.', invoiceDetails: 'Detalles de la Factura', close: 'Cerrar', noExpenses: 'No hay gastos pendientes en esta tarjeta.', undeterminedValue: 'Gastos No Listados', undeterminedDesc: 'Valor ya utilizado en el límite, pero no detallado a continuación.', invoiceQuestion: '¿Cuál es el monto de su factura este mes?', amountToPay: 'Monto de Factura Actual', payButton: 'Efectuar Pago', favorite: 'Favorito', makeFavorite: 'Hacer Favorito' }
};

export function CreditCards() {
  const { creditCards, addCreditCard, removeCreditCard, toggleCreditCardFavorite, userStats, addExpense, expenses = [], payCreditCardInvoice } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [cardForModal, setCardForModal] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];

  const [newCard, setNewCard] = useState({
    name: '',
    lastFourDigits: '',
    limit: 0,
    usedLimit: 0,
    closingDay: 1,
    dueDay: 10
  });

  const [extractedExpenses, setExtractedExpenses] = useState<any[]>([]);
  const [isExtractingInitial, setIsExtractingInitial] = useState(false);
  const initialFileInputRef = useRef<HTMLInputElement>(null);

  // === A MÁGICA DA FATURA (PARCELAS) ===
  const cardExpenses = cardForModal ? expenses.filter((exp: any) => exp.cardId === cardForModal.id && exp.status === 'pending') : [];
  
  // Soma o TOTAL das dívidas ativas para abater do "Não Listado"
  const totalDetailedExpenses = cardExpenses.reduce((sum: number, exp: any) => sum + exp.value, 0);
  const undeterminedValue = cardForModal ? Math.max(0, cardForModal.usedLimit - totalDetailedExpenses) : 0;

  // Calcula apenas a PARCELA do mês atual para sugerir o valor da fatura
  const currentInvoiceAmount = cardExpenses.reduce((sum: number, exp: any) => {
    const installmentValue = exp.value / (exp.installments || 1);
    return sum + installmentValue;
  }, 0) + undeterminedValue; // Soma com os não listados para garantir cobrança total
  // =====================================

  useEffect(() => {
    if (cardForModal) {
      setPaymentAmount(currentInvoiceAmount || 0);
    }
  }, [cardForModal, currentInvoiceAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name) return;
    
    const cardId = addCreditCard(newCard);
    
    extractedExpenses.forEach(exp => {
      addExpense({
        date: exp.date || new Date().toISOString().split('T')[0],
        description: exp.description,
        value: exp.value,
        category: 'Outros',
        account: newCard.name,
        paymentMethod: 'credit',
        installments: exp.installments || 1,
        status: 'pending',
        cardId: cardId
      });
    });

    setIsAdding(false);
    setNewCard({ name: '', lastFourDigits: '', limit: 0, usedLimit: 0, closingDay: 1, dueDay: 10 });
    setExtractedExpenses([]);
  };

  const handleInitialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingInitial(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key missing');
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: { parts: [{ inlineData: { data: base64Data, mimeType: file.type } }, { text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects: "description", "value" (number, BRL), "date" (YYYY-MM-DD), "installments".' }] },
          config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, value: { type: Type.NUMBER }, date: { type: Type.STRING }, installments: { type: Type.NUMBER } }, required: ['description', 'value', 'date'] } } }
        });

        if (response.text) {
          const extractedData = JSON.parse(response.text);
          setExtractedExpenses(prev => [...prev, ...extractedData]);
          const totalExtracted = extractedData.reduce((sum: number, exp: any) => sum + (exp.value || 0), 0);
          setNewCard(prev => ({ ...prev, usedLimit: prev.usedLimit + totalExtracted }));
          alert(t.uploadSuccess);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error parsing invoice:', error);
      alert(t.uploadError);
    } finally {
      setIsExtractingInitial(false);
      if (initialFileInputRef.current) initialFileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm(t.confirmDelete)) {
      removeCreditCard(id);
    }
  };

  const handleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCreditCardFavorite(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCardId) return;

    setIsUploading(selectedCardId);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key missing');
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: { parts: [{ inlineData: { data: base64Data, mimeType: file.type } }, { text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects: "description", "value", "date", "installments".' }] },
          config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, value: { type: Type.NUMBER }, date: { type: Type.STRING }, installments: { type: Type.NUMBER } }, required: ['description', 'value', 'date'] } } }
        });

        if (response.text) {
          const extractedData = JSON.parse(response.text);
          extractedData.forEach((exp: any) => {
            addExpense({
              date: exp.date || new Date().toISOString().split('T')[0],
              description: exp.description,
              value: exp.value,
              category: 'Outros',
              account: creditCards.find(c => c.id === selectedCardId)?.name || 'Credit Card',
              paymentMethod: 'credit',
              installments: exp.installments || 1,
              status: 'pending',
              cardId: selectedCardId 
            });
          });
          alert(t.uploadSuccess);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error parsing invoice:', error);
      alert(t.uploadError);
    } finally {
      setIsUploading(null);
      setSelectedCardId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForModal || paymentAmount <= 0) return;

    if (payCreditCardInvoice) {
      payCreditCardInvoice(cardForModal.id, paymentAmount);
      alert('Pagamento efetuado com sucesso! A IA já creditou seu XP.');
      setCardForModal(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">{t.title}</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
          <Plus className="w-5 h-5" /> {t.addCard}
        </button>
      </div>

      {isAdding && (
         <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
           {/* Nome do Cartão */}
           <div className="space-y-2 lg:col-span-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.cardName}</label>
             <input type="text" placeholder="Ex: Nubank" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" required />
           </div>
           
           {/* 4 Últimos Dígitos */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.lastFour}</label>
             <input type="text" maxLength={4} placeholder="Ex: 1234" value={newCard.lastFourDigits} onChange={e => setNewCard({...newCard, lastFourDigits: e.target.value.replace(/\D/g, '')})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
           </div>
           
           {/* Limite Total */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.limit}</label>
             <input type="number" min="0" step="0.01" value={newCard.limit || ''} onChange={e => setNewCard({...newCard, limit: parseFloat(e.target.value) || 0})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" required />
           </div>
           
           {/* Limite Utilizado (RESTAURADO!) */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.usedLimit}</label>
             <input type="number" min="0" step="0.01" value={newCard.usedLimit || ''} onChange={e => setNewCard({...newCard, usedLimit: parseFloat(e.target.value) || 0})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
           </div>

           {/* Fechamento */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.closingDay}</label>
             <input type="number" min="1" max="31" value={newCard.closingDay} onChange={e => setNewCard({...newCard, closingDay: parseInt(e.target.value) || 1})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" required />
           </div>
           
           {/* Vencimento */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.dueDay}</label>
             <input type="number" min="1" max="31" value={newCard.dueDay} onChange={e => setNewCard({...newCard, dueDay: parseInt(e.target.value) || 1})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" required />
           </div>
         </div>

         <div className="mt-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 space-y-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div><h3 className="text-sm font-bold text-zinc-200">{t.uploadInitialInvoice}</h3><p className="text-xs text-zinc-500 mt-1">{t.disclaimer}</p></div>
             <div className="relative">
               <input type="file" accept="image/*" onChange={handleInitialFileUpload} ref={initialFileInputRef} className="hidden" id="initial-invoice-upload" disabled={isExtractingInitial} />
               <label htmlFor="initial-invoice-upload" className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isExtractingInitial ? 'opacity-50 pointer-events-none' : ''}`}>
                 {isExtractingInitial ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" /> : <Upload className="w-4 h-4" />} {isExtractingInitial ? t.uploading : t.uploadInvoice}
               </label>
             </div>
           </div>

           {extractedExpenses.length > 0 && (
             <div className="mt-4 space-y-2">
               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.extractedExpenses}</h4>
               <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {extractedExpenses.map((exp, index) => (
                   <div key={index} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                     <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                       <input type="text" value={exp.description} onChange={(e) => { const newExp = [...extractedExpenses]; newExp[index].description = e.target.value; setExtractedExpenses(newExp); }} className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200" placeholder={t.description} />
                       <input type="number" value={exp.value} onChange={(e) => { const newExp = [...extractedExpenses]; newExp[index].value = parseFloat(e.target.value) || 0; setExtractedExpenses(newExp); }} className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200" placeholder={t.value} />
                       <div className="flex gap-2">
                         <input type="date" value={exp.date} onChange={(e) => { const newExp = [...extractedExpenses]; newExp[index].date = e.target.value; setExtractedExpenses(newExp); }} className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 w-full" />
                         <input type="number" min="1" value={exp.installments || 1} onChange={(e) => { const newExp = [...extractedExpenses]; newExp[index].installments = parseInt(e.target.value) || 1; setExtractedExpenses(newExp); }} className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 w-16" title={t.installments} />
                       </div>
                     </div>
                     <button type="button" onClick={() => { const newExp = [...extractedExpenses]; newExp.splice(index, 1); setExtractedExpenses(newExp); }} className="ml-2 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title={t.remove}><Trash2 className="w-4 h-4" /></button>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>

         <div className="mt-6 flex justify-end gap-4">
           <button type="button" onClick={() => { setIsAdding(false); setExtractedExpenses([]); }} className="px-6 py-3 text-zinc-400 hover:text-zinc-100 font-bold transition-colors">{t.cancel}</button>
           <button type="submit" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">{t.save}</button>
         </div>
       </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const usedLimitValue = card.usedLimit || 0;
          const limitValue = card.limit || 1; 
          const usedPercentage = Math.min((usedLimitValue / limitValue) * 100, 100);
          const availableLimit = Math.max(limitValue - usedLimitValue, 0);
          const isNearLimit = usedPercentage > 85;

          return (
            <div key={card.id} className={`bg-zinc-900 border ${card.favorite ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-zinc-800 hover:border-violet-500/30'} rounded-2xl p-6 relative group overflow-hidden cursor-pointer transition-colors`} onClick={() => setCardForModal(card)}>
              <div className={`absolute top-0 left-0 w-1 h-full ${card.favorite ? 'bg-yellow-500' : 'bg-violet-500'}`} />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${card.favorite ? 'bg-yellow-500/10 text-yellow-400' : 'bg-violet-500/10 text-violet-400'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                      {card.name} 
                    </h3>
                    {card.lastFourDigits && <p className="text-xs text-zinc-500">Final {card.lastFourDigits}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => handleFavorite(card.id, e)} className={`p-2 rounded-lg transition-colors ${card.favorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:text-yellow-400 hover:bg-zinc-800'}`} title={card.favorite ? t.favorite : t.makeFavorite}>
                    <Star className="w-4 h-4" fill={card.favorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => handleDelete(card.id, e)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title={t.confirmDelete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-400">{t.usedLimit}: <strong className="text-zinc-200">R$ {usedLimitValue.toFixed(2)}</strong></span>
                  <span className="text-zinc-400">{t.availableLimit}: <strong className="text-zinc-200">R$ {availableLimit.toFixed(2)}</strong></span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2.5 border border-zinc-800">
                  <div className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : card.favorite ? 'bg-yellow-500' : 'bg-violet-500'}`} style={{ width: `${usedPercentage}%` }}></div>
                </div>
                <div className="text-right mt-1"><span className="text-xs text-zinc-500">{t.limit}: R$ {limitValue.toFixed(2)}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1"><Calendar className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">{t.closingDay}</span></div>
                  <p className="text-lg font-bold text-zinc-200">Dia {card.closingDay}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1"><DollarSign className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">{t.dueDay}</span></div>
                  <p className="text-lg font-bold text-zinc-200">Dia {card.dueDay}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors text-sm font-medium group/btn disabled:opacity-50" onClick={(e) => { e.stopPropagation(); setSelectedCardId(card.id); fileInputRef.current?.click(); }} disabled={isUploading === card.id}>
                  {isUploading === card.id ? <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" /> : <FileUp className="w-4 h-4 text-zinc-400 group-hover/btn:text-zinc-200" />} {isUploading === card.id ? t.uploading : t.uploadInvoice}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {creditCards.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
          <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t.noCards}</p>
        </div>
      )}

      {cardForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCardForModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cardForModal.favorite ? 'bg-yellow-500/10 text-yellow-400' : 'bg-violet-500/10 text-violet-400'}`}><CreditCard className="w-5 h-5" /></div>
                <div><h2 className="text-xl font-bold text-zinc-100">{t.invoiceDetails}</h2><p className="text-sm text-zinc-400">{cardForModal.name} {cardForModal.lastFourDigits && `- Final ${cardForModal.lastFourDigits}`}</p></div>
              </div>
              <button onClick={() => setCardForModal(null)} className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors" title={t.close}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-zinc-950/50 space-y-6">
              {undeterminedValue > 0 && (
                <div className="p-4 bg-zinc-900 border border-dashed border-zinc-700 rounded-xl flex justify-between items-center">
                  <div><h3 className="text-zinc-200 font-bold">{t.undeterminedValue}</h3><p className="text-xs text-zinc-500 mt-1">{t.undeterminedDesc}</p></div>
                  <div className="text-right"><p className="text-zinc-300 font-bold">R$ {undeterminedValue.toFixed(2)}</p></div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Gastos Listados</h3>
                {cardExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {cardExpenses.map((exp: any, index: number) => {
                      const isInstallment = exp.installments && exp.installments > 1;
                      const installmentValue = exp.value / (exp.installments || 1);
                      return (
                        <div key={index} className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors">
                          <div>
                            <p className="text-zinc-200 font-medium">{exp.description}</p>
                            <p className="text-xs text-zinc-500 mt-1">{new Date(exp.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-violet-400 font-bold">R$ {installmentValue.toFixed(2)}</p>
                            {isInstallment && (
                              <p className="text-xs text-zinc-500 mt-1">Parcela de {exp.installments}x (Total R$ {exp.value.toFixed(2)})</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-zinc-800/50 rounded-xl bg-zinc-900/30"><p className="text-zinc-500">{t.noExpenses}</p></div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 space-y-4">
               <div className="flex justify-between items-center text-sm mb-2">
                 <span className="text-zinc-400 font-medium">{t.usedLimit}:</span>
                 <span className="text-xl font-bold text-zinc-100">R$ {cardForModal.usedLimit?.toFixed(2) || '0.00'}</span>
               </div>

               <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                 <h3 className="text-sm font-bold text-zinc-200 mb-4">{t.invoiceQuestion}</h3>
                 <form onSubmit={handlePayInvoice} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                   <div className="flex-1 w-full space-y-1">
                     <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.amountToPay}</label>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">R$</span>
                       <input type="number" step="0.01" min="0.01" max={cardForModal.usedLimit} value={paymentAmount || ''} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-lg font-medium" required placeholder="0.00" />
                     </div>
                   </div>
                   <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold transition-all h-[52px]">
                     <CheckCircle2 className="w-5 h-5" /> {t.payButton}
                   </button>
                 </form>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}