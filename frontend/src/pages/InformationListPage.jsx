import React, { useState, useEffect } from 'react';
import { api, getFileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, Edit, Trash2, FileSpreadsheet, Plus, FileText, Search, Filter, X } from 'lucide-react';
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

  // Filtros interativos ao clicar em Proprietário, Marca ou Nacionalidade
  const [filterType, setFilterType] = useState(null); // 'owner' | 'brand' | 'country'
  const [filterValue, setFilterValue] = useState('');

  // Estados de Modais e Navegação
  const [selectedInfoId, setSelectedInfoId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchInformations = async () => {
    setLoading(true);
    try {
      let queryUrl = `/informations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (filterType && filterValue) {
        queryUrl += `&${filterType}=${encodeURIComponent(filterValue)}`;
      }
      const res = await api.get(queryUrl);
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
  }, [page, limit, search, filterType, filterValue]);

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
      const data = await api.get('/informations/export/excel', {
        responseType: 'blob',
      });

      const blob = data instanceof Blob ? data : new Blob([data], {
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

      {/* Banner de Filtro Interativo Ativo */}
      {filterType && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e0f2fe', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #7dd3fc', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={18} color="#0284c7" />
            <span style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: '600' }}>
              Filtro Ativo: {filterType === 'owner' ? 'Proprietário' : filterType === 'brand' ? 'Marca / Trademark' : 'Nacionalidade / País'} =
            </span>
            <span className="badge-tag" style={{ background: '#ffffff', color: '#0284c7', border: '1px solid #38bdf8', fontSize: '0.85rem', fontWeight: '700' }}>
              "{filterValue}"
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              ({total} {total === 1 ? 'registo encontrado' : 'registos encontrados'})
            </span>
          </div>

          <button
            onClick={() => { setFilterType(null); setFilterValue(''); setPage(1); }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', color: '#0369a1', border: '1px solid #7dd3fc', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            title="Remover filtro e mostrar todas as informações"
          >
            <X size={14} /> Limpar Filtro
          </button>
        </div>
      )}

      {/* Tabela Principal */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              {/* Linha 1 do Header: Inglês (em cima) */}
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.8rem', fontWeight: '700' }}>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Application Number</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Trademark</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Class</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Application Date</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Publication date</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Concession Date</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Renewal date</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>DIU</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Owner</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Country</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Certificate</th>
                <th style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>Modification /</th>
                <th style={{ padding: '0.65rem 0.6rem', textAlign: 'center', position: 'sticky', right: 0, background: '#f1f5f9', zIndex: 10, boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.06)' }}>Action</th>
              </tr>
              {/* Linha 2 do Header: Português (em baixo) */}
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)', color: '#64748b', fontSize: '0.74rem', fontWeight: '600' }}>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Numero de Registo</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Marca</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Classe</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Estado</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Data de aplicação</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Data de publicacao</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Data de Concessão</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>DAta da renovacao</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>DIU</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Proprietário</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Nacionalidade</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Certificado</th>
                <th style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}>Alteração</th>
                <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center', position: 'sticky', right: 0, background: '#f8fafc', zIndex: 10, boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.06)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    A carregar informações...
                  </td>
                </tr>
              ) : informations.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                informations.map((info) => {
                  const appDateStr = info.applicationDate
                    ? new Date(info.applicationDate).toISOString().split('T')[0]
                    : '-';

                  const pubDateStr = info.publicationDate
                    ? new Date(info.publicationDate).toISOString().split('T')[0]
                    : info.date
                    ? new Date(info.date).toISOString().split('T')[0]
                    : '-';

                  const concDateStr = info.concessionDate
                    ? new Date(info.concessionDate).toISOString().split('T')[0]
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
                      {/* 1. Application Number / Numero de Registo (Clicável para abrir a linha) */}
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setSelectedInfoId(info._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            fontWeight: '700',
                            color: '#0284c7',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Clique para abrir e visualizar todos os detalhes deste registo"
                        >
                          {info.infoRef}
                        </button>
                      </td>

                      {/* 2. Trademark / Marca (Interativo) */}
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {info.logoUrl ? (
                            <img
                              src={getFileUrl(info.logoUrl)}
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
                              title="Sem logótipo carregado"
                            >
                              {info.brand ? info.brand.charAt(0) : 'M'}
                            </div>
                          )}
                          <span
                            onClick={() => {
                              setFilterType('brand');
                              setFilterValue(info.brand);
                              setPage(1);
                            }}
                            style={{
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              color: '#0284c7',
                              textDecoration: 'underline',
                              textUnderlineOffset: '2px',
                            }}
                            title="Clique para filtrar e puxar todos os registos desta marca"
                          >
                            {info.brand}
                          </span>
                        </div>
                      </td>

                      {/* 3. Class / Classe */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#0284c7', fontWeight: '600' }}>
                        {info.clazz}
                      </td>

                      {/* 4. Status / Estado */}
                      <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                        <span className={`status-chip ${info.status === 'Concedido' ? 'concluido' : info.status === 'Publicado' ? 'em_progresso' : 'pendente'}`}>
                          {info.status}
                        </span>
                      </td>

                      {/* 5. Application Date / Data de aplicação */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        {appDateStr}
                      </td>

                      {/* 6. Publication date / Data de publicacao */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        {pubDateStr}
                      </td>

                      {/* 7. Concession Date / Data de Concessão */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#10b981', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {concDateStr}
                      </td>

                      {/* 8. Renewal date / DAta da renovacao */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#d97706', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {renDateStr}
                      </td>

                      {/* 9. DIU / DIU */}
                      <td style={{ padding: '0.75rem 0.6rem', color: '#2563eb', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {diuDateStr}
                      </td>

                      {/* 10. Owner / Proprietário (Interativo) */}
                      <td style={{ padding: '0.75rem 0.6rem' }}>
                        <span
                          onClick={() => {
                            setFilterType('owner');
                            setFilterValue(info.owner);
                            setPage(1);
                          }}
                          style={{
                            cursor: 'pointer',
                            color: '#0369a1',
                            fontWeight: '600',
                            textDecoration: 'underline',
                            textUnderlineOffset: '2px',
                          }}
                          title="Clique para puxar todas as marcas deste proprietário"
                        >
                          {info.owner}
                        </span>
                      </td>

                      {/* 11. Country / Nacionalidade (Interativo) */}
                      <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                        {info.country ? (
                          <span
                            onClick={() => {
                              setFilterType('country');
                              setFilterValue(info.country);
                              setPage(1);
                            }}
                            style={{
                              cursor: 'pointer',
                              color: '#0284c7',
                              fontWeight: '600',
                              textDecoration: 'underline',
                              textUnderlineOffset: '2px',
                            }}
                            title="Clique para puxar todas as marcas desta nacionalidade/país"
                          >
                            {info.country}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* 12. Certificate / Certificado */}
                      <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {info.certified}
                      </td>

                      {/* 13. Modification / Alteração */}
                      <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                        {info.modification ? (
                          <span className="badge-tag" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde047', fontSize: '0.75rem' }}>
                            {info.modification}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* 14. Action / Ações */}
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
                              href={getFileUrl(info.documentUrl)}
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
