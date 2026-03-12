import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Settings as SettingsIcon, Zap, Shield, User, Bell, Globe, Download, Trash2, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

const translations = {
  pt: {
    settings: 'Configurações',
    manage: 'Gerencie sua conta e preferências do aplicativo',
    language: 'Idioma',
    appLanguage: 'Idioma do Aplicativo',
    chooseLanguage: 'Escolha o idioma de sua preferência para a interface do aplicativo.',
    performance: 'Desempenho',
    optimizationMode: 'Modo de Otimização',
    optimizationDesc: 'Desative incrementos visuais, animações e efeitos pesados para uma versão mais leve e rápida do aplicativo. Ideal para dispositivos mais antigos ou quando você apenas quer velocidade.',
    account: 'Conta',
    profileInfo: 'Informações do Perfil',
    updateProfile: 'Atualize seu nome',
    edit: 'Editar',
    save: 'Salvar',
    cancel: 'Cancelar',
    dataExport: 'Exportação de Dados',
    downloadData: 'Baixe seus dados financeiros como JSON',
    export: 'Exportar Dados',
    dangerZone: 'Zona de Perigo',
    clearData: 'Apagar Todos os Dados',
    clearDataDesc: 'Isso apagará permanentemente todos os seus dados locais.',
    signOut: 'Sair da Conta',
    signOutDesc: 'Desconectar do Supabase.',
    notifications: 'Notificações',
    dailyReminders: 'Lembretes Diários',
    getReminded: 'Seja lembrado de registrar suas despesas',
  },
  en: {
    settings: 'Settings',
    manage: 'Manage your account and app preferences',
    language: 'Language',
    appLanguage: 'App Language',
    chooseLanguage: 'Choose your preferred language for the application interface.',
    performance: 'Performance',
    optimizationMode: 'Optimization Mode',
    optimizationDesc: 'Turn off visual increments, animations, and heavy effects for a lighter and quicker version of the app. Ideal for older devices or when you just want speed.',
    account: 'Account',
    profileInfo: 'Profile Information',
    updateProfile: 'Update your name',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    dataExport: 'Data Export',
    downloadData: 'Download your financial data as JSON',
    export: 'Export Data',
    dangerZone: 'Danger Zone',
    clearData: 'Clear All Data',
    clearDataDesc: 'This will permanently delete all your local data.',
    signOut: 'Sign Out',
    signOutDesc: 'Disconnect from Supabase.',
    notifications: 'Notifications',
    dailyReminders: 'Daily Reminders',
    getReminded: 'Get reminded to log your expenses',
  },
  es: {
    settings: 'Configuraciones',
    manage: 'Administra tu cuenta y preferencias de la aplicación',
    language: 'Idioma',
    appLanguage: 'Idioma de la Aplicación',
    chooseLanguage: 'Elige tu idioma preferido para la interfaz de la aplicación.',
    performance: 'Rendimiento',
    optimizationMode: 'Modo de Optimización',
    optimizationDesc: 'Desactiva incrementos visuales, animaciones y efectos pesados para una versión más ligera y rápida de la aplicación. Ideal para dispositivos más antiguos o cuando solo quieres velocidad.',
    account: 'Cuenta',
    profileInfo: 'Información del Perfil',
    updateProfile: 'Actualiza tu nombre',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    dataExport: 'Exportación de Datos',
    downloadData: 'Descarga tus datos financieros como JSON',
    export: 'Exportar Datos',
    dangerZone: 'Zona de Peligro',
    clearData: 'Borrar Todos los Datos',
    clearDataDesc: 'Esto eliminará permanentemente todos tus datos locales.',
    signOut: 'Cerrar Sesión',
    signOutDesc: 'Desconectar de Supabase.',
    notifications: 'Notificaciones',
    dailyReminders: 'Recordatorios Diarios',
    getReminded: 'Recibe recordatorios para registrar tus gastos',
  }
};

export function Settings() {
  const { userStats, toggleOptimizationMode, changeLanguage, updateName, clearData, expenses, incomes, majorGoals, quests, session, signOut } = useStore();
  const lang = userStats.language || 'pt';
  const t = translations[lang];

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userStats.name || 'User');

  const handleSaveName = () => {
    if (editNameValue.trim()) {
      updateName(editNameValue.trim());
    }
    setIsEditingName(false);
  };

  const handleExportData = () => {
    const data = {
      userStats,
      expenses,
      incomes,
      majorGoals,
      quests,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promanage_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="p-3 bg-zinc-800 rounded-2xl shrink-0">
          <SettingsIcon className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t.settings}</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-1">{t.manage}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Language Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{t.language}</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{t.appLanguage}</h3>
                <p className="text-zinc-400 text-sm mt-1 max-w-md">
                  {t.chooseLanguage}
                </p>
              </div>
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value as 'pt' | 'en' | 'es')}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 w-full sm:w-auto"
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Performance & Optimization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">{t.performance}</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{t.optimizationMode}</h3>
                <p className="text-zinc-400 text-sm mt-1 max-w-md">
                  {t.optimizationDesc}
                </p>
              </div>
              <button
                onClick={toggleOptimizationMode}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  userStats.optimizationMode ? 'bg-violet-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    userStats.optimizationMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{t.account}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-zinc-800/50 gap-4">
              <div>
                <h3 className="text-white font-medium">{t.profileInfo}</h3>
                <p className="text-zinc-400 text-sm">{t.updateProfile}</p>
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2 w-full sm:w-48"
                  />
                  <button onClick={handleSaveName} className="p-2 bg-violet-500 hover:bg-violet-400 text-zinc-950 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setEditNameValue(userStats.name); }} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-zinc-300 font-medium">{userStats.name}</span>
                  <button onClick={() => setIsEditingName(true)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                    {t.edit}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-zinc-800/50 gap-4">
              <div>
                <h3 className="text-white font-medium">{t.dataExport}</h3>
                <p className="text-zinc-400 text-sm">{t.downloadData}</p>
              </div>
              <button onClick={handleExportData} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {t.export}
              </button>
            </div>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4 ${session ? 'border-b border-zinc-800/50' : ''}`}>
              <div>
                <h3 className="text-red-400 font-medium">{t.dangerZone}</h3>
                <p className="text-zinc-400 text-sm">{t.clearDataDesc}</p>
              </div>
              <button onClick={clearData} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t.clearData}
              </button>
            </div>
            {session && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
                <div>
                  <h3 className="text-red-400 font-medium">{t.signOut}</h3>
                  <p className="text-zinc-400 text-sm">{t.signOutDesc}</p>
                </div>
                <button onClick={signOut} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto flex items-center justify-center gap-2">
                  {t.signOut}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">{t.notifications}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium">{t.dailyReminders}</h3>
                <p className="text-zinc-400 text-sm">{t.getReminded}</p>
              </div>
              <button className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full bg-violet-500 transition-colors focus:outline-none">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* App Version */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center py-4"
        >
          <span className="text-zinc-600 text-sm font-medium tracking-widest uppercase">
            ProManage v1.1.0
          </span>
        </motion.div>
      </div>
    </div>
  );
}
