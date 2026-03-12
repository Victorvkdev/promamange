import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Briefcase, TrendingUp, Award, Globe, Plus, CheckCircle2, Star, ChevronRight } from 'lucide-react';

const translations = {
  pt: {
    title: 'Gestão de Carreira',
    subtitle: 'Acompanhe seus ganhos, compare com o mercado e conquiste emblemas.',
    earnings: 'Meus Ganhos',
    addEarning: 'Adicionar Ganho',
    marketComparison: 'Comparação com o Mercado',
    mySalary: 'Meu Salário',
    marketAverage: 'Média do Mercado',
    achievements: 'Conquistas e Marcos',
    addAchievement: 'Novo Marco',
    badges: 'Emblemas de Habilidade',
    languages: 'Idiomas',
    englishLevel: 'Nível de Inglês',
    levels: {
      A1: 'Iniciante (A1)',
      A2: 'Básico (A2)',
      B1: 'Intermediário (B1)',
      B2: 'Avançado (B2)',
      C1: 'Fluente (C1)',
      C2: 'Nativo/Proficiente (C2)'
    },
    save: 'Salvar',
    cancel: 'Cancelar'
  },
  en: {
    title: 'Career Management',
    subtitle: 'Track your earnings, compare with the market, and earn badges.',
    earnings: 'My Earnings',
    addEarning: 'Add Earning',
    marketComparison: 'Market Comparison',
    mySalary: 'My Salary',
    marketAverage: 'Market Average',
    achievements: 'Achievements & Milestones',
    addAchievement: 'New Milestone',
    badges: 'Skill Badges',
    languages: 'Languages',
    englishLevel: 'English Level',
    levels: {
      A1: 'Beginner (A1)',
      A2: 'Basic (A2)',
      B1: 'Intermediate (B1)',
      B2: 'Advanced (B2)',
      C1: 'Fluent (C1)',
      C2: 'Native/Proficient (C2)'
    },
    save: 'Save',
    cancel: 'Cancel'
  },
  es: {
    title: 'Gestión de Carrera',
    subtitle: 'Haz un seguimiento de tus ganancias, compara con el mercado y gana insignias.',
    earnings: 'Mis Ganancias',
    addEarning: 'Añadir Ganancia',
    marketComparison: 'Comparación de Mercado',
    mySalary: 'Mi Salario',
    marketAverage: 'Promedio del Mercado',
    achievements: 'Logros e Hitos',
    addAchievement: 'Nuevo Hito',
    badges: 'Insignias de Habilidad',
    languages: 'Idiomas',
    englishLevel: 'Nivel de Inglés',
    levels: {
      A1: 'Principiante (A1)',
      A2: 'Básico (A2)',
      B1: 'Intermedio (B1)',
      B2: 'Avanzado (B2)',
      C1: 'Fluido (C1)',
      C2: 'Nativo/Proficiente (C2)'
    },
    save: 'Guardar',
    cancel: 'Cancelar'
  }
};

export function Career() {
  const { userStats } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const [salary, setSalary] = useState(5000);
  const [marketAverage, setMarketAverage] = useState(6500);
  const [englishLevel, setEnglishLevel] = useState('B1');
  
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Promoção para Pleno', date: '2023-08-15', type: 'promotion' },
    { id: 2, title: 'Aumento de 15%', date: '2024-01-10', type: 'salary' }
  ]);

  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState({ title: '', date: new Date().toISOString().split('T')[0], type: 'promotion' });

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title) return;
    setAchievements([{ ...newAchievement, id: Date.now() }, ...achievements]);
    setIsAddingAchievement(false);
    setNewAchievement({ title: '', date: new Date().toISOString().split('T')[0], type: 'promotion' });
  };

  const getEnglishBadgeColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-zinc-700 text-zinc-300';
      case 'A2': return 'bg-blue-900 text-blue-300';
      case 'B1': return 'bg-blue-700 text-blue-200';
      case 'B2': return 'bg-violet-700 text-violet-200';
      case 'C1': return 'bg-violet-500 text-white';
      case 'C2': return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white';
      default: return 'bg-zinc-700 text-zinc-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">{t.title}</h1>
        <p className="text-sm md:text-base text-zinc-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Comparison */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            {t.marketComparison}
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">{t.mySalary}</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 font-bold w-32 text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((salary / Math.max(salary, marketAverage || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">{t.marketAverage}</span>
                <input
                  type="number"
                  value={marketAverage}
                  onChange={(e) => setMarketAverage(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 font-bold w-32 text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((marketAverage / Math.max(salary, marketAverage || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400">
                {salary >= marketAverage 
                  ? "Você está acima da média do mercado! Excelente trabalho." 
                  : "Você está abaixo da média do mercado. Considere buscar novas qualificações ou negociar seu salário."}
              </p>
            </div>
          </div>
        </div>

        {/* Skill Badges */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-500" />
            {t.badges}
          </h3>
          
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-zinc-100">{t.englishLevel}</h4>
                    <p className="text-xs text-zinc-500">Evolua para ganhar novos emblemas</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getEnglishBadgeColor(englishLevel)}`}>
                  {englishLevel}
                </div>
              </div>
              
              <select
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              >
                {Object.entries(t.levels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-500" />
              {t.achievements}
            </h3>
            <button
              onClick={() => setIsAddingAchievement(!isAddingAchievement)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t.addAchievement}
            </button>
          </div>

          {isAddingAchievement && (
            <form onSubmit={handleAddAchievement} className="mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Título do Marco"
                  value={newAchievement.title}
                  onChange={e => setNewAchievement({...newAchievement, title: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
                <input
                  type="date"
                  value={newAchievement.date}
                  onChange={e => setNewAchievement({...newAchievement, date: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
                <select
                  value={newAchievement.type}
                  onChange={e => setNewAchievement({...newAchievement, type: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none"
                >
                  <option value="promotion">Promoção</option>
                  <option value="salary">Aumento de Salário</option>
                  <option value="course">Curso Concluído</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingAchievement(false)} className="px-4 py-2 text-zinc-400 hover:text-zinc-100">
                  {t.cancel}
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl">
                  {t.save}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  ach.type === 'promotion' ? 'bg-orange-500/20 text-orange-400' :
                  ach.type === 'salary' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {ach.type === 'promotion' ? <Briefcase className="w-5 h-5" /> :
                   ach.type === 'salary' ? <TrendingUp className="w-5 h-5" /> :
                   <Star className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-200">{ach.title}</h4>
                  <p className="text-xs text-zinc-500">{ach.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
