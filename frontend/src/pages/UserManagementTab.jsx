import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Edit, Trash2, Shield, CheckCircle, XCircle, RotateCcw, Key } from 'lucide-react';
import { UserFormModal } from '../components/UserFormModal';

export const UserManagementTab = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleCreateOrUpdate = async (formData, id) => {
    if (id) {
      await api.put(`/users/${id}`, formData);
    } else {
      await api.post('/users', formData);
    }
    fetchUsers();
  };

  const handleResetPassword = async (id, userName) => {
    if (window.confirm(`Tem certeza que pretende redefinir a palavra-passe do utilizador '${userName}' para 'password123'?\nO utilizador será obrigado a definir uma nova senha no próximo acesso.`)) {
      try {
        const res = await api.put(`/users/${id}/reset-password`, { password: 'password123' });
        alert(res.message || `Palavra-passe de '${userName}' redefinida para 'password123'!`);
        fetchUsers();
      } catch (err) {
        alert(`Erro ao redefinir palavra-passe: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id, userName) => {
    if (id === currentUser._id) {
      alert('Não pode eliminar a sua própria conta ativa!');
      return;
    }
    if (window.confirm(`Tem certeza que deseja eliminar o utilizador '${userName}'?`)) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(`Erro ao eliminar utilizador: ${err.message}`);
      }
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge-tag" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde047' }}>👑 ADMIN</span>;
    if (role === 'gestor') return <span className="badge-tag" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>🛠️ GESTOR</span>;
    return <span className="badge-tag" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>👁️ LEITOR</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Gestão de Utilizadores & Contas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Administração de contas, alteração de níveis de acesso RBAC e estado de ativação
          </p>
        </div>

        <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="btn-primary">
          <UserPlus size={16} /> Novo Utilizador
        </button>
      </div>

      {/* Pesquisa */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.25rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Tabela de Utilizadores */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Utilizador</th>
                <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                <th style={{ padding: '0.85rem 1rem' }}>Papel RBAC</th>
                <th style={{ padding: '0.85rem 1rem' }}>Estado</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    A carregar utilizadores...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      {u.name} {u._id === currentUser._id && <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>(Você)</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {u.active !== false ? (
                        <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                          <CheckCircle size={14} /> Ativo
                        </span>
                      ) : (
                        <span style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                          <XCircle size={14} /> Inativo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Editar Utilizador"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u._id, u.name)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', background: '#d97706', color: '#ffffff', border: 'none' }}
                          title="Resetar Palavra-passe para 'password123' (Forçar troca no próximo acesso)"
                        >
                          <RotateCcw size={15} />
                        </button>
                        {u._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="btn-danger"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Eliminar Utilizador"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingUser}
      />
    </div>
  );
};
