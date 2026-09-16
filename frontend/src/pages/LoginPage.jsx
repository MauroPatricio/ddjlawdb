import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Key, Mail, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('mauro.patricio1@gmail.com');
  const [password, setPassword] = useState('Teste1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Falha ao iniciar sessão. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem auto', width: '56px', height: '56px' }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h2 className="brand-title" style={{ fontSize: '2rem' }}>DDJ LAW</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sistema de Gestão de Propriedade Industrial (SIGINFO)
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Endereço de Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@ddjlaw.co.mz"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Palavra-passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}>
            <LogIn size={20} /> {loading ? 'A autenticar...' : 'Iniciar Sessão'}
          </button>
        </form>

        {/* Seleção Rápida de Papéis RBAC para Demonstração */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Contas de Teste Rápidas (Níveis de Acesso RBAC):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
            <button type="button" onClick={() => handleQuickLogin('mauro.patricio1@gmail.com', 'Teste1')} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}>
              👤 Mauro
            </button>
            <button type="button" onClick={() => handleQuickLogin('admin@ddjlaw.co.mz', 'Admin123!')} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}>
              👑 Admin
            </button>
            <button type="button" onClick={() => handleQuickLogin('gestor@ddjlaw.co.mz', 'Gestor123!')} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}>
              🛠️ Gestor
            </button>
            <button type="button" onClick={() => handleQuickLogin('leitor@ddjlaw.co.mz', 'Leitor123!')} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}>
              👁️ Leitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
