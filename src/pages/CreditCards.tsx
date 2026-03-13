import React, { useState, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, FileUp, Loader2, Upload, X } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// ... [keep all your translations] ...

export function CreditCards() {
  const { creditCards, addCreditCard, removeCreditCard, userStats, addExpense, expenses } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialFileInputRef = useRef<HTMLInputElement>(null);
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

  // Get expenses for a specific card
  const getCardExpenses = (cardId: string) => {
    return expenses?.filter((exp: any) => exp.cardId === cardId) || [];
  };

  // Calculate total expenses for a card
  const getCardTotalExpenses = (cardId: string) => {
    return getCardExpenses(cardId).reduce((sum: number, exp: any) => sum + (exp.value || 0), 0);
  };

  // Calculate progress percentage
  const getProgressPercentage = (cardId: string, limit: number) => {
    if (!limit || limit === 0) return 0;
    const total = getCardTotalExpenses(cardId);
    return Math.min((total / limit) * 100, 100);
  };

  // Get progress bar color based on usage
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'from-green-500 to-emerald-500';
    if (percentage < 80) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

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
                text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects, where each object has: "description" (string), "value" (number, the cost in BRL), "date" (string in YYYY-MM-DD format), and "installments" (number). Only return the JSON array, no other text.',
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
                text: 'Extract all the expenses from this credit card invoice image. Return a JSON array of objects, where each object has: "description" (string), "value" (number, the cost in BRL), "date" (string in YYYY-MM-DD format), and "installments" (number). Only return the JSON array, no other text.',
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
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]"
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
                  className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isExtractingInitial ? 'opacity-50' : ''}`}
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
        {creditCards.map(card => {
          const percentage = getProgressPercentage(card.id, card.limit);
          const totalExpenses = getCardTotalExpenses(card.id);
          const cardExpenses = getCardExpenses(card.id);
          const progressColor = getProgressColor(percentage);

          return (
            <div key={card.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all" onClick={() => setExpandedCardId(card.id)}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(card.id);
                  }}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title={t.confirmDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Uso do Limite</span>
                  <span className="text-sm font-bold text-zinc-200">R$ {totalExpenses.toFixed(2)} / R$ {card.limit.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full bg-gradient-to-r ${progressColor} shadow-lg`}
                  />
                </div>
                <p className="text-xs text-zinc-500">{percentage.toFixed(1)}% usado</p>
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
                  onClick={(e) => {
                    e.stopPropagation();
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
          );
        })}
      </div>

      {creditCards.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
          <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t.noCards}</p>
        </div>
      )}

      {/* Modal for Card Details */}
      {expandedCardId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setExpandedCardId(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-100">{creditCards.find(c => c.id === expandedCardId)?.name}</h2>
              <button
                onClick={() => setExpandedCardId(null)}
                className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Resumo</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-zinc-400 text-sm">Total Limite</p>
                    <p className="text-lg font-bold text-zinc-100">R$ {creditCards.find(c => c.id === expandedCardId)?.limit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Total Gasto</p>
                    <p className="text-lg font-bold text-zinc-100">R$ {getCardTotalExpenses(expandedCardId).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Disponível</p>
                    <p className="text-lg font-bold text-green-400">R$ {(creditCards.find(c => c.id === expandedCardId)?.limit - getCardTotalExpenses(expandedCardId)).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-200 mb-3">Despesas ({getCardExpenses(expandedCardId).length})</h3>
                {getCardExpenses(expandedCardId).length > 0 ? (
                  <div className="space-y-2">
                    {getCardExpenses(expandedCardId).map((expense: any, index: number) => (
                      <div key={index} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-100">{expense.description}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {expense.date} {expense.installments > 1 && `• ${expense.installments}x`}
                            </p>
                          </div>
                          <p className="font-bold text-zinc-100 ml-4">R$ {expense.value.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-8">Nenhuma despesa registrada para este cartão</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
