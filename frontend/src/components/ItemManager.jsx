import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

export const ItemManager = ({ items, onCreate, onDelete, loading, dataSource }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [status, setStatus] = useState('pendente');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, description, category, status });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Gestão de Módulos & Tarefas</h2>
        <span className="badge-tag">Origem: {dataSource === 'database' ? 'MongoDB Atlas' : 'Memória Local'}</span>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Título do módulo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Descrição opcional..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-field">
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
          <option value="DevOps">DevOps</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field">
          <option value="pendente">Pendente</option>
          <option value="em_progresso">Em Progresso</option>
          <option value="concluido">Concluído</option>
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Plus size={18} /> Adicionar
        </button>
      </form>

      <div className="items-list">
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Nenhum item registado. Adicione o seu primeiro módulo acima!
          </p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="item-row">
              <div className="item-info">
                <div className="item-title">{item.title}</div>
                {item.description && <div className="item-desc">{item.description}</div>}
              </div>
              <div className="item-meta">
                <span className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} /> {item.category}
                </span>
                <span className={`status-chip ${item.status}`}>{item.status.replace('_', ' ')}</span>
                <button
                  onClick={() => onDelete(item._id)}
                  className="btn-danger"
                  title="Eliminar Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
