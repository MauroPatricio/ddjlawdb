import React, { useState, useEffect } from 'react';
import { X, Upload, Save, FileCheck, Image as ImageIcon, Calendar } from 'lucide-react';
import { getFileUrl } from '../services/api';

const formatYMD = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const InformationFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    infoRef: '',
    fileType: 'Marca Comercial',
    applicationDate: '',
    publicationDate: formatYMD(new Date()),
    concessionDate: '',
    renewalDate: '',
    diuDate: '',
    brand: '',
    clazz: '30',
    owner: '',
    country: '',
    status: 'Concedido',
    certified: 'Não',
    modification: '',
    address: '',
    observation: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const pubStr = formatYMD(initialData.publicationDate || initialData.date) || formatYMD(new Date());

      let renStr = formatYMD(initialData.renewalDate || initialData.expirationDate);
      if (!renStr) {
        const renObj = new Date(pubStr);
        renObj.setFullYear(renObj.getFullYear() + 10);
        renStr = formatYMD(renObj);
      }

      let diuStr = formatYMD(initialData.diuDate);
      if (!diuStr) {
        const diuObj = new Date(pubStr);
        diuObj.setFullYear(diuObj.getFullYear() + 5);
        diuStr = formatYMD(diuObj);
      }

      setFormData({
        infoRef: initialData.infoRef || '',
        fileType: initialData.fileType || 'Marca Comercial',
        applicationDate: formatYMD(initialData.applicationDate),
        publicationDate: pubStr,
        concessionDate: formatYMD(initialData.concessionDate),
        renewalDate: renStr,
        diuDate: diuStr,
        brand: initialData.brand || '',
        clazz: initialData.clazz !== undefined && initialData.clazz !== null ? String(initialData.clazz) : '30',
        owner: initialData.owner || '',
        country: initialData.country || '',
        status: initialData.status || 'Concedido',
        certified: initialData.certified || 'Não',
        modification: initialData.modification || '',
        address: initialData.address || '',
        observation: initialData.observation || '',
      });
      setSelectedFile(null);
      setSelectedLogo(null);
      setLogoPreview(initialData.logoUrl ? getFileUrl(initialData.logoUrl) : '');
    } else {
      const defaultPub = new Date();
      const defaultRen = new Date(defaultPub);
      defaultRen.setFullYear(defaultRen.getFullYear() + 10);
      const defaultDiu = new Date(defaultPub);
      defaultDiu.setFullYear(defaultDiu.getFullYear() + 5);

      setFormData({
        infoRef: '',
        fileType: 'Marca Comercial',
        applicationDate: '',
        publicationDate: formatYMD(defaultPub),
        concessionDate: '',
        renewalDate: formatYMD(defaultRen),
        diuDate: formatYMD(defaultDiu),
        brand: '',
        clazz: '30',
        owner: '',
        country: '',
        status: 'Concedido',
        certified: 'Não',
        modification: '',
        address: '',
        observation: '',
      });
      setSelectedFile(null);
      setSelectedLogo(null);
      setLogoPreview('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });

    // Alias retrocompatíveis para o backend
    payload.append('date', formData.publicationDate);
    payload.append('expirationDate', formData.renewalDate);

    if (selectedFile) {
      payload.append('document', selectedFile);
    }
    if (selectedLogo) {
      payload.append('logo', selectedLogo);
    }

    try {
      await onSave(payload, initialData?._id);
      onClose();
    } catch (err) {
      alert(`Erro ao guardar informação: ${err.message}`);
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
      <div className="card" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {initialData ? 'Editar Registo de Informação' : 'Nova Informação (SIGINFO)'}
          </h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Secção de Upload de Ficheiro Logotipo (Imagem) */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px dashed #0284c7' }}>
            <label style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <ImageIcon size={16} /> Carregar Logotipo da Marca (Imagem PNG, JPG, WEBP)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '100%' }}
            />
            {logoPreview && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={logoPreview}
                  alt="Pré-visualização do Logotipo"
                  style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#ffffff', borderRadius: '6px', padding: '4px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '600' }}>✓ Logotipo pronto para guardar</span>
              </div>
            )}
          </div>

          {/* Dados Principais: Application Number, Trademark, Class */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 0.8fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Application Number / N.º Registo *
              </label>
              <input
                type="text"
                name="infoRef"
                className="input-field"
                placeholder="ex: 9953/2006"
                value={formData.infoRef}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Trademark / Marca *
              </label>
              <input
                type="text"
                name="brand"
                className="input-field"
                placeholder="ex: CHOLESTRO"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Class / Classe (NICE) *
              </label>
              <input
                type="number"
                name="clazz"
                className="input-field"
                placeholder="ex: 30"
                value={formData.clazz}
                onChange={handleChange}
                required
                min="1"
                max="45"
              />
            </div>
          </div>

          {/* Status, Certificado, Nacionalidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Status / Estado *
              </label>
              <select name="status" className="select-field" value={formData.status} onChange={handleChange}>
                <option value="Concedido">Concedido</option>
                <option value="Publicado">Publicado</option>
                <option value="Pendente">Pendente</option>
                <option value="Recusado">Recusado</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Certificate / Certificado
              </label>
              <select name="certified" className="select-field" value={formData.certified} onChange={handleChange}>
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Country / Nacionalidade
              </label>
              <input
                type="text"
                name="country"
                className="input-field"
                placeholder="ex: Moçambique, África do Sul, EUA"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Secção de Datas Legais & Prazos */}
          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '0.75rem' }}>
              📅 Controlo de Datas de Registo & Prazos Legais (Application, Publication, Concession, Renewal, DIU)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#64748b" /> Application Date / Aplicação
                </label>
                <input
                  type="date"
                  name="applicationDate"
                  className="input-field"
                  value={formData.applicationDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#0284c7" /> Publication Date / Publicação *
                </label>
                <input
                  type="date"
                  name="publicationDate"
                  className="input-field"
                  value={formData.publicationDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#10b981" /> Concession Date / Concessão
                </label>
                <input
                  type="date"
                  name="concessionDate"
                  className="input-field"
                  value={formData.concessionDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#d97706" /> Renewal Date / Renovação *
                </label>
                <input
                  type="date"
                  name="renewalDate"
                  className="input-field"
                  value={formData.renewalDate}
                  onChange={handleChange}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>Padrão: +10 anos da publicação</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#2563eb" /> DIU Date / Data para DIU *
                </label>
                <input
                  type="date"
                  name="diuDate"
                  className="input-field"
                  value={formData.diuDate}
                  onChange={handleChange}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>Padrão: +5 anos da publicação</span>
              </div>
            </div>
          </div>

          {/* Proprietário e Modificações */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Owner / Proprietário *
              </label>
              <input
                type="text"
                name="owner"
                className="input-field"
                placeholder="ex: FOODCORP (PROPRIETARY) LIMITED"
                value={formData.owner}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Modification / Alteração
              </label>
              <select
                name="modification"
                className="select-field"
                value={formData.modification}
                onChange={handleChange}
              >
                <option value="">(Nenhuma / None)</option>
                <option value="Assigned to">Assigned to</option>
                <option value="Change of name of proprietary">Change of name of proprietary</option>
                <option value="Change of address of the proprietary">Change of address of the proprietary</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Address / Endereço Completo do Proprietário
            </label>
            <input
              type="text"
              name="address"
              className="input-field"
              placeholder="ex: Parc Nicol, Building No. 1, 3001 William Nicol Drive, Bryanston, 2021"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Observação / Notas Adicionais
            </label>
            <textarea
              name="observation"
              className="input-field"
              rows={2}
              placeholder="Observações adicionais sobre o processo..."
              value={formData.observation}
              onChange={handleChange}
            />
          </div>

          {/* Secção de Upload de Documento PDF */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
            <label style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <Upload size={16} /> Anexar Ficheiro Documento (Formato PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '100%' }}
            />
            {selectedFile && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileCheck size={14} /> Selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            {initialData?.documentUrl && !selectedFile && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                📄 Ficheiro PDF actual: {initialData.documentOriginalName || 'Documento.pdf'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'A guardar...' : 'Guardar Informação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
