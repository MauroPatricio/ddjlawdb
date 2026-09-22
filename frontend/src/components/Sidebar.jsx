import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Settings, LogOut, Search, UserCheck } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: '260px',
      background: '#0f172a',
      borderRight: '1px solid var(--border-color)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: '1px'
        }}>
          DDJ
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', lineHeight: '1.2' }}>DDJ LAW</h2>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', letterSpacing: '0.05em' }}>SIGINFO</span>
        </div>
      </div>

      {/* User Info Card (Idêntico ao da Foto 2) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#38bdf8',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'Lilia Tembe de Deus'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4ade80' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
            <span>Activo ({user?.role?.toUpperCase()})</span>
          </div>
        </div>
      </div>

      {/* Input de Procura Lateral */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Procurar..."
          className="input-field"
          style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: '#1e293b', color: '#ffffff', border: '1px solid #334155' }}
        />
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      </div>

      {/* Menu de Navegação */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`btn-secondary ${activeTab === 'dashboard' ? 'active-nav' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'flex-start',
            padding: '0.75rem 1rem',
            border: 'none',
            background: activeTab === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'dashboard' ? '#38bdf8' : 'var(--text-muted)',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
            textAlign: 'left'
          }}
        >
          <LayoutDashboard size={18} /> Painel Principal
        </button>

        <button
          onClick={() => setActiveTab('informations')}
          className={`btn-secondary ${activeTab === 'informations' ? 'active-nav' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'flex-start',
            padding: '0.75rem 1rem',
            border: 'none',
            background: activeTab === 'informations' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'informations' ? '#38bdf8' : 'var(--text-muted)',
            fontWeight: activeTab === 'informations' ? '600' : '400',
            textAlign: 'left'
          }}
        >
          <FileText size={18} /> Informações
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`btn-secondary ${activeTab === 'settings' ? 'active-nav' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'flex-start',
            padding: '0.75rem 1rem',
            border: 'none',
            background: activeTab === 'settings' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'settings' ? '#38bdf8' : 'var(--text-muted)',
            fontWeight: activeTab === 'settings' ? '600' : '400',
            textAlign: 'left'
          }}
        >
          <Settings size={18} /> Configurações
        </button>
      </nav>

      {/* Botão de Terminar Sessão */}
      <button
        onClick={logout}
        className="btn-danger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
          marginTop: 'auto',
          padding: '0.65rem'
        }}
      >
        <LogOut size={16} /> Sair do Sistema
      </button>
    </aside>
  );
};
