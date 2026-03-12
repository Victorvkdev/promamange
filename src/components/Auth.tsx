import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Loader2, Target, User, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Email or Username for login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase não configurado. Verifique as variáveis de ambiente.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up logic
        if (!username || !email || !password) {
          throw new Error('Por favor, preencha todos os campos.');
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Conta criada! Verifique seu email para confirmar.' });
      } else {
        // Sign in logic
        let loginEmail = identifier;
        
        // If it doesn't look like an email, assume it's a username and try to resolve it
        if (!identifier.includes('@')) {
          // Note: This requires a custom RPC function 'get_email_by_username' in Supabase
          // If the RPC doesn't exist, this will fail gracefully and we'll show an error
          const { data, error } = await supabase.rpc('get_email_by_username', { p_username: identifier });
          if (data) {
            loginEmail = data;
          } else {
            // Fallback if RPC is not set up or username not found
            throw new Error('Nome de usuário não encontrado ou função de busca não configurada no banco.');
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro durante a autenticação.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (error) {
      console.error('OAuth error:', error);
      setMessage({ type: 'error', text: 'Falha ao iniciar login com Google. Tente novamente.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background atmospheric effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Target className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-sans">ProManage</h1>
          <p className="text-zinc-400 mt-2 text-sm">Seu HUB Financeiro Gamificado</p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {isSignUp ? 'Criar nova conta' : 'Acesse sua conta'}
          </h2>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                  message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nome de Usuário</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      placeholder="seu_usuario"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-1">
                {isSignUp ? 'Email' : 'Email ou Nome de Usuário'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={isSignUp ? "email" : "text"}
                  required
                  value={isSignUp ? email : identifier}
                  onChange={(e) => isSignUp ? setEmail(e.target.value) : setIdentifier(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  placeholder={isSignUp ? "seu@email.com" : "email@exemplo.com ou usuario"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl py-3.5 transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { 
                setIsSignUp(!isSignUp); 
                setMessage(null);
                if (isSignUp) {
                  setIdentifier(email); // Carry over email if switching to sign in
                } else {
                  setEmail(identifier.includes('@') ? identifier : '');
                }
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie uma agora'}
            </button>
          </div>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#131315] px-4 text-zinc-500 font-semibold tracking-wider rounded-full">OU</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-6 w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-2xl py-3.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Chrome className="w-5 h-5" />
            Entrar com Google
          </button>
        </div>

        {!supabase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm text-center backdrop-blur-sm"
          >
            <Shield className="w-5 h-5 mx-auto mb-2" />
            <p>O Supabase não está configurado. Para usar a autenticação, adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
