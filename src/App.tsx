import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/modules/Dashboard';
import Benefits from './components/modules/Benefits';
import DirectorAgenda from './components/modules/DirectorAgenda';
import AdminPanel from './components/modules/AdminPanel';
import Community from './components/modules/Community';
import News from './components/modules/News';
import Denuncia from './components/modules/Denuncia';
import Profile from './components/modules/Profile';
import Calculators from './components/modules/Calculators';
import SocialHub from './components/modules/SocialHub';
import MembershipCard from './components/modules/MembershipCard';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return <Register />;
  }

  const isBootstrapAdmin = user.email === 'gustavo13470@gmail.com';

  if (profile.status === 'pending' && !isBootstrapAdmin) {


    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white">Conta em Análise</h2>
          <p className="text-white/60 mt-4 leading-relaxed">
            Olá, <span className="font-bold text-primary">{profile.name}</span>! Seus dados foram recebidos e estão sendo validados pela nossa equipe administrativa.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Você receberá uma notificação assim que sua conta for liberada.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors"
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'benefits': return <Benefits />;
      case 'diretoria': return <DirectorAgenda />;
      case 'admin': return <AdminPanel />;
      case 'news': return <News />;
      case 'denuncia': return <Denuncia />;
      case 'profile': return <Profile />;
      case 'calculators': return <Calculators />;
      case 'membership': return <MembershipCard />;
      case 'community': return <Community />;
      case 'social-hub': return <SocialHub />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
