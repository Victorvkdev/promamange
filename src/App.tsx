/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StoreProvider } from './store/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { MajorGoals } from './pages/MajorGoals';
import { Planners } from './pages/Planners';
import { Career } from './pages/Career';
import { CreditCards } from './pages/CreditCards';
import { Settings } from './pages/Settings';
import { MotionWrapper } from './components/MotionWrapper';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se o Supabase estiver configurado e não houver sessão, mostra o Login
  if (supabase && !session) {
    return <Auth />;
  }

  return (
    <StoreProvider session={session}>
      <MotionWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="debts" element={<MajorGoals />} />
              <Route path="planners" element={<Planners />} />
              <Route path="career" element={<Career />} />
              <Route path="cards" element={<CreditCards />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionWrapper>
    </StoreProvider>
  );
}
