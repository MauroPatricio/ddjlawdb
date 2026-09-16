import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserCheck, ShieldCheck, Save, Users, UserCog, Bell, Eye, EyeOff } from 'lucide-react';
import { UserManagementTab } from './UserManagementTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';

export const SettingsTab = () => {
  const { user, role, login } = useAuth();
  const [subTab, setSubTab] = useState('profile');

  // Formulário de Perfil Próprio
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.put('/users/profile/me', { name, password });
      setMsg({ type: 'success', text: res.message || 'Perfil atualizado com sucesso!' });
      setPassword('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const canManageNotifications = role === 'admin' || role === 'gestor';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white' }}>Configurações & Controlo de Acesso</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Atualização de perfil, notificações por email e administração de utilizadores (RBAC)
          </p>
        </div>

        {/* Abas Secundárias */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#1e293b', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setSubTab('profile')}
            className={subTab === 'profile' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <UserCog size={15} /> O Meu Perfil
          </button>

          {canManageNotifications && (
            <button
              onClick={() => setSubTab('notifications')}
              className={subTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <Bell size={15} /> Notificações de Expiração
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setSubTab('users')}
              className={subTab === 'users' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <Users size={15} /> Gestão de Utilizadores
            </button>
          )}
        </div>
      </div>

      {subTab === 'users' && role === 'admin' ? (
        <UserManagementTab />
      ) : subTab === 'notifications' && canManageNotifications ? (
        <NotificationSettingsTab />
      ) : (
        <div>
          {/* Cartão de Perfil do Utilizador Atual */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#0284c7" /> Atualizar o Seu Perfil
            </h3>

            {msg.text && (
              <div style={{
                background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: msg.type === 'success' ? '#a7f3d0' : '#fda4af',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  O seu Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Email (Leitura apenas)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field"
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Nova Palavra-passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Deixe em branco para não alterar"
                    className="input-field"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                    title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPassword ? <EyeOff size={18} color="#38bdf8" /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ height: '40px' }}>
                <Save size={16} /> {loading ? 'A guardar...' : 'Guardar Perfil'}
              </button>
            </form>
          </div>

          {/* Matriz de Permissões RBAC */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#10b981" /> Matriz de Permissões por Papel (RBAC)
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Nível / Função</th>
                  <th style={{ padding: '0.75rem' }}>Visualizar Dados</th>
                  <th style={{ padding: '0.75rem' }}>Criar / Editar</th>
                  <th style={{ padding: '0.75rem' }}>Eliminar Registos</th>
                  <th style={{ padding: '0.75rem' }}>Upload PDF</th>
                  <th style={{ padding: '0.75rem' }}>Gerir Utilizadores</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: '#f59e0b' }}>👑 Admin</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: '#0284c7' }}>🛠️ Gestor</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>👁️ Leitor</td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>Sim</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>Não</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
