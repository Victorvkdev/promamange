import React, { useState, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, FileUp, Loader2, Upload } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const translations = {
  pt: {
    title: 'Meus Cartões',
    subtitle: 'Gerencie seus cartões de crédito, faturas e parcelamentos.',
    addCard: 'Adicionar Cartão',
    cardName: 'Nome do Cartão (ex: Nubank)',
    limit: 'Limite Total',
    usedLimit: 'Limite Utilizado',
    closingDay: 'Dia de Fechamento',
    dueDay: 'Dia de Vencimento',
    cancel: 'Cancelar',
    save: 'Salvar',
    noCards: 'Nenhum cartão cadastrado ainda.',
    uploadInvoice: 'Importar Fatura (PDF/CSV)',
    uploadInitialInvoice: 'Importar Fatura Atual (Opcional)',
    extractedExpenses: 'Gastos Identificados',
    disclaimer: 'A identificação por imagem pode ter inconsistências. Por favor, confira se os valores e parcelamentos estão de acordo com os dados reais do cartão.',
    description: 'Descrição',
    value: 'Valor',
    installments: 'Parcelas',
    date: 'Data',
    remove: 'Remover',
    uploadComingSoon: 'Importação automática em breve!',
    confirmDelete: 'Tem certeza que deseja remover este cartão?',
    uploading: 'Analisando fatura...',
    uploadSuccess: 'Fatura analisada com sucesso! Gastos adicionados.',
    uploadError: 'Erro ao analisar fatura. Tente novamente.'
  },
  en: {
    title: 'My Cards',
    subtitle: 'Manage your credit cards, invoices, and installments.',
    addCard: 'Add Card',
    cardName: 'Card Name (e.g., Chase)',
    limit: 'Total Limit',
    usedLimit: 'Used Limit',
    closingDay: 'Closing Day',
    dueDay: 'Due Day',
    cancel: 'Cancel',
    save: 'Save',
    noCards: 'No cards registered yet.',
    uploadInvoice: 'Import Invoice (Image)',
    uploadInitialInvoice: 'Import Current Invoice (Optional)',
    extractedExpenses: 'Identified Expenses',
    disclaimer: 'Image identification may have inconsistencies. Please verify if values and installments match the real card data.',
    description: 'Description',
    value: 'Value',
    installments: 'Installments',
    date: 'Date',
    remove: 'Remove',
    uploadComingSoon: 'Automatic import coming soon!',
    confirmDelete: 'Are you sure you want to remove this card?',
    uploading: 'Analyzing invoice...',
    uploadSuccess: 'Invoice analyzed successfully! Expenses added.',
    uploadError: 'Error analyzing invoice. Please try again.'
  },
  es: {
    title: 'Mis Tarjetas',
    subtitle: 'Gestiona tus tarjetas de crédito, facturas y cuotas.',
    addCard: 'Añadir Tarjeta',
    cardName: 'Nombre de la Tarjeta (ej: Santander)',
    limit: 'Límite Total',
    usedLimit: 'Límite Utilizado',
    closingDay: 'Día de Cierre',
    dueDay: 'Día de Vencimiento',
    cancel: 'Cancelar',
    save: 'Guardar',
    noCards: 'Aún no hay tarjetas registradas.',
    uploadInvoice: 'Importar Factura (Imagen)',
    uploadInitialInvoice: 'Importar Factura Actual (Opcional)',
    extractedExpenses: 'Gastos Identificados',
    disclaimer: 'La identificación por imagen puede tener inconsistencias. Por favor, verifique si los valores y cuotas coinciden con los datos reales de la tarjeta.',
    description: 'Descripción',
    value: 'Valor',
    installments: 'Cuotas',
    date: 'Fecha',
    remove: 'Eliminar',
    uploadComingSoon: '¡Importación automática próximamente!',
    confirmDelete: '¿Estás seguro de que deseas eliminar esta tarjeta?',
    uploading: 'Analizando factura...',
    uploadSuccess: '¡Factura analizada con éxito! Gastos añadidos.',
    uploadError: 'Error al analizar la factura. Inténtalo de nuevo.'
  }
};

export function CreditCards() {
  const { creditCards, addCreditCard, removeCreditCard, userStats, addExpense } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const lang = userStats.language || 'pt';
  const t = translations[lang as keyof typeof translations];

  const [newCard, setNewCard] = useState({
    name: '',
    limit: 0,
    usedLimit: 0,
    closingDay: 1,
    dueDay: 10
  });

  const [extractedExpenses, setExtractedExpenses] = useState<any[]>([]);
  const [isExtractingInitial, setIsExtractingInitial] = useState(false);
  const initialFileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name) return;
    
    const cardId = addCreditCard(newCard);
    
    // Add extracted expenses
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
    setNewCard({ name: '', limit: 0, usedLimit: 0, closingDay: 1, dueDay: 10 });
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
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects, where each object has: "description" (string), "value" (number, the cost in BRL), "date" (string, YYYY-MM-DD), "installments" (number, if it says e.g. 1/12, then 12, otherwise 1).',
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  date: { type: Type.STRING },
                  installments: { type: Type.NUMBER }
                },
                required: ['description', 'value', 'date']
              }
            }
          }
        });

        if (response.text) {
          const expenses = JSON.parse(response.text);
          setExtractedExpenses(prev => [...prev, ...expenses]);
          
          // Calculate total from extracted expenses to suggest usedLimit
          const totalExtracted = expenses.reduce((sum: number, exp: any) => sum + (exp.value || 0), 0);
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

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      removeCreditCard(id);
    }
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
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects, where each object has: "description" (string), "value" (number, the cost in BRL), "date" (string, YYYY-MM-DD), "installments" (number, if it says e.g. 1/12, then 12, otherwise 1).',
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  date: { type: Type.STRING },
                  installments: { type: Type.NUMBER }
                },
                required: ['description', 'value', 'date']
              }
            }
          }
        });

        if (response.text) {
          const expenses = JSON.parse(response.text);
          expenses.forEach((exp: any) => {
            addExpense({
              date: exp.date || new Date().toISOString().split('T')[0],
              description: exp.description,
              value: exp.value,
              category: 'Other',
              account: creditCards.find(c => c.id === selectedCardId)?.name || 'Credit Card',
              paymentMethod: 'credit',
              installments: exp.installments || 1,
              status: 'pending'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">{t.title}</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
        >
          <Plus className="w-5 h-5" />
          {t.addCard}
        </button>
      </div>

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.cardName}</label>
              <input
                type="text"
                value={newCard.name}
                onChange={e => setNewCard({...newCard, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.limit}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newCard.limit || ''}
                onChange={e => setNewCard({...newCard, limit: parseFloat(e.target.value) || 0})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.usedLimit}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newCard.usedLimit || ''}
                onChange={e => setNewCard({...newCard, usedLimit: parseFloat(e.target.value) || 0})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.closingDay}</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newCard.closingDay}
                onChange={e => setNewCard({...newCard, closingDay: parseInt(e.target.value) || 1})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.dueDay}</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newCard.dueDay}
                onChange={e => setNewCard({...newCard, dueDay: parseInt(e.target.value) || 1})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-200">{t.uploadInitialInvoice}</h3>
                <p className="text-xs text-zinc-500 mt-1">{t.disclaimer}</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInitialFileUpload}
                  ref={initialFileInputRef}
                  className="hidden"
                  id="initial-invoice-upload"
                  disabled={isExtractingInitial}
                />
                <label
                  htmlFor="initial-invoice-upload"
                  className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isExtractingInitial ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isExtractingInitial ? (
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isExtractingInitial ? t.uploading : t.uploadInvoice}
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
                        <input
                          type="text"
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...extractedExpenses];
                            newExp[index].description = e.target.value;
                            setExtractedExpenses(newExp);
                          }}
                          className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200"
                          placeholder={t.description}
                        />
                        <input
                          type="number"
                          value={exp.value}
                          onChange={(e) => {
                            const newExp = [...extractedExpenses];
                            newExp[index].value = parseFloat(e.target.value) || 0;
                            setExtractedExpenses(newExp);
                          }}
                          className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200"
                          placeholder={t.value}
                        />
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={exp.date}
                            onChange={(e) => {
                              const newExp = [...extractedExpenses];
                              newExp[index].date = e.target.value;
                              setExtractedExpenses(newExp);
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 w-full"
                          />
                          <input
                            type="number"
                            min="1"
                            value={exp.installments || 1}
                            onChange={(e) => {
                              const newExp = [...extractedExpenses];
                              newExp[index].installments = parseInt(e.target.value) || 1;
                              setExtractedExpenses(newExp);
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 w-16"
                            title={t.installments}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newExp = [...extractedExpenses];
                          newExp.splice(index, 1);
                          setExtractedExpenses(newExp);
                        }}
                        className="ml-2 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title={t.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setExtractedExpenses([]);
              }}
              className="px-6 py-3 text-zinc-400 hover:text-zinc-100 font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              {t.save}
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => (
          <div key={card.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{card.name}</h3>
                  <p className="text-sm text-zinc-500">Limite: R$ {card.limit.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(card.id)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title={t.confirmDelete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Fechamento</span>
                </div>
                <p className="text-lg font-bold text-zinc-200">Dia {card.closingDay}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Vencimento</span>
                </div>
                <p className="text-lg font-bold text-zinc-200">Dia {card.dueDay}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors text-sm font-medium group/btn disabled:opacity-50"
                onClick={() => {
                  setSelectedCardId(card.id);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading === card.id}
              >
                {isUploading === card.id ? (
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                ) : (
                  <FileUp className="w-4 h-4 text-zinc-400 group-hover/btn:text-zinc-200" />
                )}
                {isUploading === card.id ? t.uploading : t.uploadInvoice}
              </button>
            </div>
          </div>
        ))}
      </div>

      {creditCards.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
          <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t.noCards}</p>
        </div>
      )}
    </motion.div>
  );
}
