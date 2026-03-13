import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Briefcase, TrendingUp, Award, Globe, Plus, CheckCircle2, Star, ChevronRight, Trash2, MapPin, Edit2 } from 'lucide-react';

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
    countries: {
      BR: 'Brasil',
      US: 'Estados Unidos',
      PT: 'Portugal',
      UK: 'Reino Unido',
      CA: 'Canadá'
    },
    addSkill: 'Adicionar Habilidade',
    skillName: 'Nome da Habilidade',
    skillLevel: 'Nível',
    skillType: 'Tipo',
    types: {
      language: 'Idioma',
      skill: 'Habilidade Técnica',
      course: 'Curso'
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
    countries: {
      BR: 'Brazil',
      US: 'United States',
      PT: 'Portugal',
      UK: 'United Kingdom',
      CA: 'Canada'
    },
    addSkill: 'Add Skill',
    skillName: 'Skill Name',
    skillLevel: 'Level',
    skillType: 'Type',
    types: {
      language: 'Language',
      skill: 'Technical Skill',
      course: 'Course'
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
    countries: {
      BR: 'Brasil',
      US: 'Estados Unidos',
      PT: 'Portugal',
      UK: 'Reino Unido',
      CA: 'Canadá'
    },
    addSkill: 'Añadir Habilidad',
    skillName: 'Nombre de la Habilidad',
    skillLevel: 'Nivel',
    skillType: 'Tipo',
    types: {
      language: 'Idioma',
      skill: 'Habilidad Técnica',
      course: 'Curso'
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
  const [selectedCountry, setSelectedCountry] = useState('BR');
  
  const marketAverages: Record<string, number> = {
    'BR': 6500,
    'US': 35000,
    'PT': 12000,
    'UK': 28000,
    'CA': 30000,
  };

  const marketAverage = marketAverages[selectedCountry] || 6500;

  const [skills, setSkills] = useState([
    { id: '1', name: 'Inglês', level: 'B1', type: 'language' },
    { id: '2', name: 'React', level: 'Avançado', type: 'skill' }
  ]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: '', type: 'skill' });
  
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Promoção para Pleno', date: '2023-08-15', type: 'promotion' },
    { id: 2, title: 'Aumento de 15%', date: '2024-01-10', type: 'salary' }
  ]);

  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);
  const [newAchievement, setNewAchievement] = useState({ title: '', date: new Date().toISOString().split('T')[0], type: 'promotion' });

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title) return;
    
    if (editingAchievementId !== null) {
      setAchievements(achievements.map(ach => ach.id === editingAchievementId ? { ...newAchievement, id: editingAchievementId } : ach));
      setEditingAchievementId(null);
    } else {
      setAchievements([{ ...newAchievement, id: Date.now() }, ...achievements]);
    }
    
    setIsAddingAchievement(false);
    setNewAchievement({ title: '', date: new Date().toISOString().split('T')[0], type: 'promotion' });
  };

  const handleEditAchievement = (ach: any) => {
    setNewAchievement({ title: ach.title, date: ach.date, type: ach.type });
    setEditingAchievementId(ach.id);
    setIsAddingAchievement(true);
  };

  const handleRemoveAchievement = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover esta conquista?')) {
      setAchievements(achievements.filter(ach => ach.id !== id));
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name) return;
    setSkills([...skills, { ...newSkill, id: Date.now().toString() }]);
    setIsAddingSkill(false);
    setNewSkill({ name: '', level: '', type: 'skill' });
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const getSkillBadgeColor = (type: string, level: string) => {
    if (type === 'language') {
      switch (level) {
        case 'A1': return 'bg-zinc-700 text-zinc-300 border-zinc-600';
        case 'A2': return 'bg-blue-900/50 text-blue-300 border-blue-800';
        case 'B1': return 'bg-blue-700/50 text-blue-200 border-blue-600';
        case 'B2': return 'bg-violet-700/50 text-violet-200 border-violet-600';
        case 'C1': return 'bg-violet-500/50 text-white border-violet-400';
        case 'C2': return 'bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 text-white border-fuchsia-400';
        default: return 'bg-zinc-700 text-zinc-300 border-zinc-600';
      }
    }
    if (type === 'course') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
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
              <div className="flex justify-between mb-2 items-center">
                <span className="text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {t.marketAverage}
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none"
                  >
                    {Object.entries(t.countries).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  <span className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-100 font-bold w-32 text-right">
                    {marketAverage}
                  </span>
                </div>
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-500" />
              {t.badges}
            </h3>
            <button
              onClick={() => setIsAddingSkill(!isAddingSkill)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t.addSkill}
            </button>
          </div>

          {isAddingSkill && (
            <form onSubmit={handleAddSkill} className="mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder={t.skillName}
                  value={newSkill.name}
                  onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newSkill.type}
                    onChange={e => setNewSkill({...newSkill, type: e.target.value})}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none"
                  >
                    {Object.entries(t.types).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {newSkill.type === 'language' ? (
                    <select
                      value={newSkill.level}
                      onChange={e => setNewSkill({...newSkill, level: e.target.value})}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none"
                      required
                    >
                      <option value="" disabled>{t.skillLevel}</option>
                      {Object.entries(t.levels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={t.skillLevel}
                      value={newSkill.level}
                      onChange={e => setNewSkill({...newSkill, level: e.target.value})}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      required
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingSkill(false)} className="px-4 py-2 text-zinc-400 hover:text-zinc-100">
                  {t.cancel}
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-bold rounded-xl">
                  {t.save}
                </button>
              </div>
            </form>
          )}
          
          <div className="space-y-3">
            {skills.map(skill => (
              <div key={skill.id} className="group flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  {skill.type === 'language' ? <Globe className="w-5 h-5 text-blue-400" /> : 
                   skill.type === 'course' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                   <Award className="w-5 h-5 text-orange-400" />}
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm">{skill.name}</h4>
                    <p className="text-xs text-zinc-500">{(t.types as any)[skill.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSkillBadgeColor(skill.type, skill.level)}`}>
                    {skill.level}
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <div className="text-center p-6 text-zinc-500 text-sm">
                Nenhuma habilidade adicionada ainda.
              </div>
            )}
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
              onClick={() => {
                setIsAddingAchievement(!isAddingAchievement);
                if (!isAddingAchievement) {
                  setEditingAchievementId(null);
                  setNewAchievement({ title: '', date: new Date().toISOString().split('T')[0], type: 'promotion' });
                }
              }}
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
              <div key={ach.id} className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
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
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditAchievement(ach)}
                    className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-violet-400/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveAchievement(ach.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
