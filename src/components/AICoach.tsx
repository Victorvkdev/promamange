import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const translations = {
  pt: {
    placeholder: 'Peça orientação ao Navi...',
    error: 'Conexão com a Rede da Guilda perdida. Verifique sua conexão ou chave da API.',
    logged: 'Registrei R$',
    for: 'para',
    keepTracking: 'Continue registrando para ganhar mais XP!'
  },
  en: {
    placeholder: 'Ask Navi for guidance...',
    error: 'Connection to the Guild Network lost. Please check your connection or API key.',
    logged: "I've logged R$",
    for: 'for',
    keepTracking: 'Keep tracking to earn more XP!'
  },
  es: {
    placeholder: 'Pide orientación a Navi...',
    error: 'Conexión con la Red del Gremio perdida. Verifica tu conexión o clave de API.',
    logged: 'He registrado R$',
    for: 'para',
    keepTracking: '¡Sigue registrando para ganar más XP!'
  }
};

export function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { chatHistory, addChatMessage, userStats, expenses, majorGoals, quests, addExpense, payGoalStep } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key missing');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `You are "Navi", an AI financial coach and guildmaster for a gamified app called ProManage. 
      The user is a freelancer. Tone: Engaging, game-aware, highly motivating, and analytical.
      Use gaming terminology (XP, HP, Major Goals, Planners, Debuffs, Critical Hits, Leveling up).
      
      Current User Stats:
      Level: ${userStats.level} (${userStats.rank})
      XP: ${userStats.xp}
      ProCoins: ${userStats.proCoins}
      Streak: ${userStats.streakDays} days
      
      Active Major Goals:
      ${majorGoals.filter(d => d.completedSteps < d.totalSteps).map(d => `- ID: ${d.id} | ${d.title}: ${d.completedSteps}/${d.totalSteps} completed, R$${d.stepValue}/step`).join('\n')}
      
      Active Planners:
      ${quests.filter(q => q.status === 'active').map(q => `- ${q.title}: ${q.description}`).join('\n')}
      
      Respond concisely and stay in character. If the user asks to log an expense or pay a goal step, use the provided tools.`;

      const addExpenseTool: FunctionDeclaration = {
        name: 'addExpense',
        description: 'Log a new expense for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: 'Description of the expense (e.g., Coffee, Uber)' },
            value: { type: Type.NUMBER, description: 'The cost of the expense in BRL (e.g., 15.50)' },
            category: { type: Type.STRING, description: 'Category (Food, Transport, Utilities, Leisure, Health, Other)' },
          },
          required: ['description', 'value', 'category'],
        },
      };

      const payGoalStepTool: FunctionDeclaration = {
        name: 'payGoalStep',
        description: 'Pay a step/installment for a Major Goal.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            goalId: { type: Type.STRING, description: 'The ID of the Major Goal to pay' },
          },
          required: ['goalId'],
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: [addExpenseTool, payGoalStepTool] }],
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'addExpense') {
            const args = call.args as any;
            addExpense({
              date: new Date().toISOString().split('T')[0],
              description: args.description,
              value: args.value,
              category: args.category || 'Other',
              account: 'Cash',
              status: 'paid'
            });
            addChatMessage({ role: 'ai', content: `${t.logged}${args.value} ${t.for} ${args.description}. ${t.keepTracking}` });
          } else if (call.name === 'payGoalStep') {
            const args = call.args as any;
            payGoalStep(args.goalId);
            // The payGoalStep function already adds an AI message, so we don't need to add another one here unless we want to.
          }
        }
      } else if (response.text) {
        addChatMessage({ role: 'ai', content: response.text });
      }
    } catch (error) {
      console.error('AI Error:', error);
      addChatMessage({ role: 'ai', content: t.error });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 h-[400px] md:h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/50">
                  <Bot className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100">Navi</h3>
                  <p className="text-xs text-violet-400 font-mono">Guildmaster AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-br-sm' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700/50'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-zinc-400 p-3 rounded-2xl rounded-bl-sm border border-zinc-700/50 text-sm flex items-center gap-1">
                    <span className={userStats.optimizationMode ? '' : 'animate-bounce'}>.</span>
                    <span className={userStats.optimizationMode ? '' : 'animate-bounce delay-100'}>.</span>
                    <span className={userStats.optimizationMode ? '' : 'animate-bounce delay-200'}>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 text-violet-500 hover:text-violet-400 disabled:opacity-50 disabled:hover:text-violet-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-violet-500 hover:bg-violet-400 text-zinc-950 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${userStats.optimizationMode ? '' : 'shadow-[0_0_20px_rgba(139,92,246,0.4)]'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
