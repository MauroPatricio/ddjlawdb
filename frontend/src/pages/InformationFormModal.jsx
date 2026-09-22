import React, { useState, useEffect } from 'react';
import { X, Upload, Save, FileCheck, Image as ImageIcon, Calendar } from 'lucide-react';

export const InformationFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    infoRef: '',
    fileType: 'Marca Comercial',
    date: new Date().toISOString().split('T')[0],
    expirationDate: '',
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
      setFormData({
        infoRef: initialData.infoRef || '',
        fileType: initialData.fileType || 'Marca Comercial',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expirationDate: initialData.expirationDate ? new Date(initialData.expirationDate).toISOString().split('T')[0] : '',
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
      const defaultDate = new Date();
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 10);

      setFormData({
        infoRef: '',
        fileType: 'Marca Comercial',
        date: defaultDate.toISOString().split('T')[0],
        expirationDate: defaultExp.toISOString().split('T')[0],
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
      <div className="card" style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {initialData ? 'Editar Registo de Informação' : 'Nova Informação (SIGINFO)'}
          </h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Secção de Upload de Ficheiro Logotipo (Imagem) - Primeiro Campo */}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem' }}>
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

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Classe *
              </label>
              <input
                type="number"
                name="clazz"
                className="input-field"
                placeholder="ex: 30"
                value={formData.clazz}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                <Calendar size={14} color="#0284c7" /> Data Registo
              </label>
              <input
                type="date"
                name="date"
                className="input-field"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                <Calendar size={14} color="#f59e0b" /> Data Expiração
              </label>
              <input
                type="date"
                name="expirationDate"
                className="input-field"
                value={formData.expirationDate}
                onChange={handleChange}
              />
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
