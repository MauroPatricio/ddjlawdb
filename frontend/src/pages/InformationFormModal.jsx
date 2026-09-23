import React, { useState, useEffect } from 'react';
import { X, Upload, Save, FileCheck, Image as ImageIcon, Calendar } from 'lucide-react';

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
    publicationDate: formatYMD(new Date()),
    renewalDate: '',
    diuDate: '',
    brand: '',
    clazz: '30',
    owner: '',
    status: 'Concedido',
    certified: 'Não',
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
        publicationDate: pubStr,
        renewalDate: renStr,
        diuDate: diuStr,
        brand: initialData.brand || '',
        clazz: initialData.clazz || '30',
        owner: initialData.owner || '',
        status: initialData.status || 'Concedido',
        certified: initialData.certified || 'Não',
        address: initialData.address || '',
        observation: initialData.observation || '',
      });
      setSelectedFile(null);
      setSelectedLogo(null);
      setLogoPreview(initialData.logoUrl ? `http://localhost:5000${initialData.logoUrl}` : '');
    } else {
      const defaultPub = new Date();
      const defaultRen = new Date(defaultPub);
      defaultRen.setFullYear(defaultRen.getFullYear() + 10);
      const defaultDiu = new Date(defaultPub);
      defaultDiu.setFullYear(defaultDiu.getFullYear() + 5);

      setFormData({
        infoRef: '',
        fileType: 'Marca Comercial',
        publicationDate: formatYMD(defaultPub),
        renewalDate: formatYMD(defaultRen),
        diuDate: formatYMD(defaultDiu),
        brand: '',
        clazz: '30',
        owner: '',
        status: 'Concedido',
        certified: 'Não',
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
      <div className="card" style={{ maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Informação Ref. *
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
                Tipo de Ficheiro *
              </label>
              <select name="fileType" className="select-field" value={formData.fileType} onChange={handleChange}>
                <option value="Marca Comercial">Marca Comercial</option>
                <option value="Patente de Invenção">Patente de Invenção</option>
                <option value="Desenho Industrial">Desenho Industrial</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Marca / Nome *
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
          </div>

          {/* As 3 Datas Obrigatórias do Sistema */}
          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '0.75rem' }}>
              📅 Controlo de Datas de Registo & Prazos Legais (DIU / Renovação)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem', fontWeight: '600' }}>
                  <Calendar size={14} color="#0284c7" /> Data de Publicação *
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
                  <Calendar size={14} color="#d97706" /> Data de Renovação *
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
                  <Calendar size={14} color="#2563eb" /> Data para DIU *
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Proprietário *
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
                Estado
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
                Certificado
              </label>
              <select name="certified" className="select-field" value={formData.certified} onChange={handleChange}>
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Endereço
            </label>
            <input
              type="text"
              name="address"
              className="input-field"
              placeholder="Endereço completo..."
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Observação
            </label>
            <textarea
              name="observation"
              className="input-field"
              rows={2}
              placeholder="Observações adicionais, datas de renovação, etc."
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
