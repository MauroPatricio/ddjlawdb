import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, FileText, Download, Printer, Trash2 } from 'lucide-react';

export const InformationDetailPage = ({ infoId, onBack, onDelete }) => {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canDelete = role === 'admin' || role === 'gestor';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/informations/${infoId}`);
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Falha ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };
    if (infoId) {
      fetchDetail();
    }
  }, [infoId]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>A carregar detalhes da informação...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>⚠️ {error || 'Informação não encontrada'}</p>
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    );
  }

  const pubDateObj = data.publicationDate
    ? new Date(data.publicationDate)
    : data.date
    ? new Date(data.date)
    : null;

  const pubDateFormatted = pubDateObj ? pubDateObj.toLocaleDateString('pt-PT') : 'N/A';

  const renDateObj = data.renewalDate
    ? new Date(data.renewalDate)
    : data.expirationDate
    ? new Date(data.expirationDate)
    : pubDateObj
    ? (() => {
        const d = new Date(pubDateObj);
        d.setFullYear(d.getFullYear() + 10);
        return d;
      })()
    : null;

  const renDateFormatted = renDateObj ? renDateObj.toLocaleDateString('pt-PT') : 'N/A';

  const diuDateObj = data.diuDate
    ? new Date(data.diuDate)
    : pubDateObj
    ? (() => {
        const d = new Date(pubDateObj);
        d.setFullYear(d.getFullYear() + 5);
        return d;
      })()
    : null;

  const diuDateFormatted = diuDateObj ? diuDateObj.toLocaleDateString('pt-PT') : 'N/A';

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      {/* Título Principal */}
      <div style={{ paddingBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '400', color: '#1e293b' }}>Visualizando Informação</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canDelete && (
            <button
              onClick={() => {
                if (onDelete) onDelete(data._id, data.brand);
              }}
              className="btn-danger"
              style={{ background: '#ef4444', color: '#ffffff', border: 'none' }}
              title="Remover Registo"
            >
              <Trash2 size={16} /> Remover
            </button>
          )}
          <button onClick={() => window.print()} className="btn-secondary" style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}>
            <Printer size={16} /> Imprimir
          </button>
          <button onClick={onBack} className="btn-secondary" style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}>
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </div>

      {/* Grid de Campos Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem 1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Informação Ref.:</div>
          <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>{data.infoRef}</div>
        </div>

        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Tipo de Ficheiro:</div>
          <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>{data.fileType}</div>
        </div>

        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Marca:</div>
          <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', marginTop: '0.25rem' }}>{data.brand}</div>
        </div>

        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Classe:</div>
          <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>{data.clazz}</div>
        </div>

        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Estado:</div>
          <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>{data.status}</div>
        </div>

        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Certificado:</div>
          <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>{data.certified}</div>
        </div>
      </div>

      {/* Bloco Destaque com as 3 Datas Importantes */}
      <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginBottom: '2rem' }}>
        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0284c7', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📅 Datas Legais & Prazos do Registo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#475569' }}>Data de Publicação:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginTop: '0.25rem' }}>{pubDateFormatted}</div>
          </div>

          <div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#d97706' }}>Data de Renovação:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#b45309', marginTop: '0.25rem' }}>{renDateFormatted}</div>
          </div>

          <div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#2563eb' }}>Data para DIU:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1d4ed8', marginTop: '0.25rem' }}>{diuDateFormatted}</div>
          </div>
        </div>
      </div>

      {/* Logótipo Oficial da Marca */}
      {data.logoUrl && (
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={`http://localhost:5000${data.logoUrl}`}
            alt={data.brand}
            style={{ maxHeight: '90px', maxWidth: '160px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '4px', background: '#fff' }}
          />
          <div>
            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>Logótipo Oficial da Marca</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              Imagem carregada e associada ao registo da propriedade industrial #{data.infoRef}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>Observação:</div>
        <div style={{ fontSize: '1rem', color: '#475569', marginTop: '0.25rem' }}>
          {data.observation || 'Sem observações registadas.'}
        </div>
      </div>

      {/* Secção de Documentos Anexados (PDF) */}
      {data.documentUrl && (
        <div style={{ background: '#e2e8f0', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="#0284c7" />
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Documento PDF Anexado</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{data.documentOriginalName || 'Ficheiro.pdf'}</div>
            </div>
          </div>
          <a
            href={`http://localhost:5000${data.documentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ background: '#0284c7', textDecoration: 'none' }}
          >
            <Download size={16} /> Abrir / Descarregar PDF
          </a>
        </div>
      )}

      {/* Botão Voltar (Idêntico ao da Foto 3) */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={onBack}
          style={{
            background: '#e2e8f0',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '0.5rem 1.25rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🖨️ Voltar
        </button>
      </div>
    </div>
  );
};
