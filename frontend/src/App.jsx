import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { InformationListPage } from './pages/InformationListPage';
import { DashboardTab } from './pages/DashboardTab';
import { SettingsTab } from './pages/SettingsTab';

import { MustChangePasswordModal } from './components/MustChangePasswordModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('informations');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#0284c7', fontWeight: '600' }}>
        A carregar sistema SIGINFO...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Modal Compulsório de Redefinição de Senha no 1º Acesso */}
      <MustChangePasswordModal />

      {/* Barra Lateral do Layout réplica da Foto 2 */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área de Conteúdo Principal */}
      <main style={{ flexGrow: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'informations' && <InformationListPage />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
