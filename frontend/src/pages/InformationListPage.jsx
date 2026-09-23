import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, Edit, Trash2, FileSpreadsheet, Plus, FileText, Search } from 'lucide-react';
import { InformationFormModal } from './InformationFormModal';
import { InformationDetailPage } from './InformationDetailPage';

export const InformationListPage = () => {
  const { role } = useAuth();
  const [informations, setInformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Estados de Modais e Navegação
  const [selectedInfoId, setSelectedInfoId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchInformations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/informations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setInformations(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Erro ao carregar informações:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInformations();
  }, [page, limit, search]);

  const handleCreateOrUpdate = async (formDataPayload, id) => {
    if (id) {
      await api.put(`/informations/${id}`, formDataPayload);
    } else {
      await api.post('/informations', formDataPayload);
    }
    fetchInformations();
  };

  const handleDelete = async (id, brandName) => {
    if (window.confirm(`Tem certeza que deseja eliminar a marca/registo '${brandName}'?`)) {
      try {
        await api.delete(`/informations/${id}`);
        fetchInformations();
      } catch (err) {
        alert(`Erro ao eliminar: ${err.message}`);
      }
    }
  };

  // Download do Ficheiro Excel (.xlsx) funcional e seguro via Blob
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('ddjlaw_token');
      const response = await axios.get('http://localhost:5000/api/v1/informations/export/excel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_siginfo_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Erro ao descarregar o ficheiro Excel: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (selectedInfoId) {
    return (
      <InformationDetailPage
        infoId={selectedInfoId}
        onBack={() => setSelectedInfoId(null)}
        onDelete={async (id, brandName) => {
          await handleDelete(id, brandName);
          setSelectedInfoId(null);
        }}
      />
    );
  }

  const canEdit = role === 'admin' || role === 'gestor';
  const canDelete = role === 'admin';

  return (
    <div>
      {/* Título da Página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Nossas Informações</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Base de dados de marcas, patentes e ficheiros comerciais
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="btn-secondary"
            style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
          >
            <FileSpreadsheet size={16} /> {exporting ? 'A gerar Excel...' : 'Exportar para Excel (.xlsx)'}
          </button>

          {canEdit && (
            <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="btn-primary">
              <Plus size={16} /> Nova
            </button>
          )}
        </div>
      </div>

      {/* Controlos e Filtros */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span>Show</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="select-field" style={{ width: 'auto', padding: '0.4rem 0.75rem' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field"
              style={{ paddingLeft: '2.25rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Tabela Principal */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)', color: '#475569' }}>
                <th style={{ padding: '0.75rem 0.6rem' }}>Informação Ref.</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Tipo Ficheiro</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Data Publicação</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Data Renovação</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Data DIU</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Marca</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Classe</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Proprietário</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Estado</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Certificado</th>
                <th style={{ padding: '0.75rem 0.6rem', textAlign: 'center', position: 'sticky', right: 0, background: '#f8fafc', zIndex: 10, boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.06)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    A carregar informações...
                  </td>
                </tr>
              ) : informations.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                informations.map((info) => {
                  const pubDateStr = info.publicationDate
                    ? new Date(info.publicationDate).toISOString().split('T')[0]
                    : info.date
                    ? new Date(info.date).toISOString().split('T')[0]
                    : '-';

                  const renDateStr = info.renewalDate
                    ? new Date(info.renewalDate).toISOString().split('T')[0]
                    : info.expirationDate
                    ? new Date(info.expirationDate).toISOString().split('T')[0]
                    : pubDateStr !== '-'
                    ? (() => {
                        const d = new Date(pubDateStr);
                        d.setFullYear(d.getFullYear() + 10);
                        return d.toISOString().split('T')[0];
                      })()
                    : '-';

                  const diuDateStr = info.diuDate
                    ? new Date(info.diuDate).toISOString().split('T')[0]
                    : pubDateStr !== '-'
                    ? (() => {
                        const d = new Date(pubDateStr);
                        d.setFullYear(d.getFullYear() + 5);
                        return d.toISOString().split('T')[0];
                      })()
                    : '-';

                  return (
                    <tr key={info._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{info.infoRef}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{info.fileType}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: '#475569', whiteSpace: 'nowrap' }}>{pubDateStr}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: '#d97706', fontWeight: '600', whiteSpace: 'nowrap' }}>{renDateStr}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: '#2563eb', fontWeight: '600', whiteSpace: 'nowrap' }}>{diuDateStr}</td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {info.logoUrl ? (
                            <img
                              src={`http://localhost:5000${info.logoUrl}`}
                              alt={info.brand}
                              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', padding: '2px', border: '1px solid var(--border-color)' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                border: '1px solid #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: '#0284c7',
                                textTransform: 'uppercase',
                                flexShrink: 0
                              }}
                              title="Sem logótipo carregado (Clique em editar para adicionar)"
                            >
                              {info.brand ? info.brand.charAt(0) : 'M'}
                            </div>
                          )}
                          <span style={{ whiteSpace: 'nowrap' }}>{info.brand}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', color: '#0284c7', fontWeight: '600' }}>{info.clazz}</td>
                      <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)' }}>{info.owner}</td>
                      <td style={{ padding: '0.75rem 0.6rem' }}>
                        <span className={`status-chip ${info.status === 'Concedido' ? 'concluido' : info.status === 'Publicado' ? 'em_progresso' : 'pendente'}`}>
                          {info.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)' }}>{info.certified}</td>
                      <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center', position: 'sticky', right: 0, background: '#ffffff', zIndex: 5, boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => setSelectedInfoId(info._id)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Visualizar Informação"
                          >
                            <Eye size={15} />
                          </button>

                          {info.documentUrl && (
                            <a
                              href={`http://localhost:5000${info.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.5rem', color: '#0284c7' }}
                              title="Ver Documento PDF"
                            >
                              <FileText size={15} />
                            </a>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => { setEditingData(info); setIsFormOpen(true); }}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.5rem' }}
                              title="Editar"
                            >
                              <Edit size={15} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(info._id, info.brand)}
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.5rem' }}
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div>
            Showing {informations.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={page === p ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minWidth: '32px' }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <InformationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingData}
      />
    </div>
  );
};
