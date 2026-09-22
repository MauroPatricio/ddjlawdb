import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';

export const UserFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'leitor',
    active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Vazio no modo de edição a menos que o admin queira redefinir
        role: initialData.role || 'leitor',
        active: initialData.active !== false,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'leitor',
        active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, initialData?._id);
      onClose();
    } catch (err) {
      alert(`Erro ao guardar utilizador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#0284c7" />
            {initialData ? 'Editar Utilizador' : 'Novo Utilizador (SIGINFO)'}
          </h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="ex: Lilia Tembe de Deus"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Endereço de Email *
            </label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="ex: utilizador@ddjlaw.co.mz"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              {initialData ? 'Nova Palavra-passe (deixe em branco para manter)' : 'Palavra-passe *'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="input-field"
                style={{ paddingRight: '2.5rem' }}
                placeholder={initialData ? '••••••••' : 'Padrão: password123'}
                value={formData.password}
                onChange={handleChange}
                required={false}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Nível de Acesso (Role) *
              </label>
              <select name="role" className="select-field" value={formData.role} onChange={handleChange}>
                <option value="leitor">👁️ Leitor (Consulta)</option>
                <option value="gestor">🛠️ Gestor (Criar/Editar)</option>
                <option value="admin">👑 Admin (Acesso Total)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Estado da Conta
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: formData.active ? '#10b981' : '#f43f5e', fontWeight: '600' }}>
                  {formData.active ? 'Ativa' : 'Inativa / Bloqueada'}
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'A guardar...' : 'Guardar Utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
