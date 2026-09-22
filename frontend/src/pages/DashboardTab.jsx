import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const DashboardTab = () => {
  const [stats, setStats] = useState({ total: 0, concedidos: 0, publicados: 0, pendentes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/informations?limit=100');
        const data = res.data || [];
        setStats({
          total: res.total || data.length,
          concedidos: data.filter((i) => i.status === 'Concedido').length,
          publicados: data.filter((i) => i.status === 'Publicado').length,
          pendentes: data.filter((i) => i.status === 'Pendente' || i.status === 'Recusado').length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Painel Principal (Dashboard)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        Resumo estatístico do sistema SIGINFO - DDJ LAW
      </p>

      <div className="status-grid">
        <div className="card">
          <div className="card-title"><FileText size={18} /> Total de Registo</div>
          <div className="card-value" style={{ color: '#38bdf8', fontSize: '2rem' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Marcas & Ficheiros no sistema</div>
        </div>

        <div className="card">
          <div className="card-title"><CheckCircle2 size={18} color="#4ade80" /> Marcadas como Concedido</div>
          <div className="card-value" style={{ color: '#4ade80', fontSize: '2rem' }}>{stats.concedidos}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Registos aprovados</div>
        </div>

        <div className="card">
          <div className="card-title"><Clock size={18} color="#fde68a" /> Publicados em Diário</div>
          <div className="card-value" style={{ color: '#fde68a', fontSize: '2rem' }}>{stats.publicados}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>A aguardar concessão</div>
        </div>

        <div className="card">
          <div className="card-title"><AlertCircle size={18} color="#fda4af" /> Pendentes / Outros</div>
          <div className="card-value" style={{ color: '#fda4af', fontSize: '2rem' }}>{stats.pendentes}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Em análise</div>
        </div>
      </div>
    </div>
  );
};
