import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Mail, Clock, Calendar, AlertTriangle, Send, Save, CheckCircle, Bell } from 'lucide-react';

export const NotificationSettingsTab = () => {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [sendHour, setSendHour] = useState('09:00');
  const [period, setPeriod] = useState('Diário');
  const [daysBeforeExpiration, setDaysBeforeExpiration] = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setNotificationEmail(res.data.notificationEmail || '');
        setSendHour(res.data.sendHour || '09:00');
        setPeriod(res.data.period || 'Diário');
        setDaysBeforeExpiration(res.data.daysBeforeExpiration || 30);
        setNotificationsEnabled(res.data.notificationsEnabled !== false);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.put('/settings', {
        notificationEmail,
        sendHour,
        period,
        daysBeforeExpiration: Number(daysBeforeExpiration),
        notificationsEnabled,
      });

      setMsg({ type: 'success', text: res.message || 'Configurações de notificação guardadas com sucesso!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Erro ao guardar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.post('/settings/test-email', { email: notificationEmail });
      setMsg({
        type: 'success',
        text: res.message || `Email de teste enviado para ${notificationEmail || 'email configurado'}!`,
      });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Erro ao enviar email de teste' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>A carregar definições de notificação...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={22} color="#38bdf8" /> Configurações de Notificações de Expiração
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Defina o email de destino, a hora de envio, o período e a antecedência em dias para notificar registos a expirar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestEmail}
          disabled={testing || !notificationEmail}
          className="btn-secondary"
          style={{ background: '#0284c7', color: '#ffffff', border: 'none' }}
          title="Disparar um envio de teste para verificar a receção do email"
        >
          <Send size={16} /> {testing ? 'A Enviar Teste...' : 'Enviar Email de Teste'}
        </button>
      </div>

      {msg.text && (
        <div
          style={{
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: msg.type === 'success' ? '#a7f3d0' : '#fda4af',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Email de Notificação */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
              <Mail size={15} color="#38bdf8" /> Email de Destino para Notificações
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="ex: nhiquelaservicos@gmail.com"
              className="input-field"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Este email receberá relatórios periódicos de marcas e patentes prestes a expirar.
            </span>
          </div>

          {/* Hora de Envio */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
              <Clock size={15} color="#f59e0b" /> Hora do Envio
            </label>
            <select
              value={sendHour}
              onChange={(e) => setSendHour(e.target.value)}
              className="select-field"
            >
              <option value="06:00">06:00 (Manhã Cedo)</option>
              <option value="08:00">08:00 (Abertura do Expediente)</option>
              <option value="09:00">09:00 (Horário Padrão)</option>
              <option value="12:00">12:00 (Meio-Dia)</option>
              <option value="14:00">14:00 (Tarde)</option>
              <option value="18:00">18:00 (Fim de Expediente)</option>
            </select>
          </div>

          {/* Período / Frequência */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
              <Calendar size={15} color="#10b981" /> Período / Frequência
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select-field"
            >
              <option value="Diário">Diário (Todos os dias)</option>
              <option value="Semanal">Semanal (Uma vez por semana)</option>
              <option value="Mensal">Mensal (Uma vez por mês)</option>
            </select>
          </div>

          {/* Antecedência em Dias */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
              <AlertTriangle size={15} color="#ec4899" /> Antecedência de Alerta (Dias)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={daysBeforeExpiration}
              onChange={(e) => setDaysBeforeExpiration(e.target.value)}
              className="input-field"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Ex: 30 dias notifica registos com expiração até um mês antes.
            </span>
          </div>
        </div>

        {/* Checkbox de Ativar / Desativar */}
        <div style={{ background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="checkbox"
            id="notificationsEnabled"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="notificationsEnabled" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'white', fontWeight: '500' }}>
            Ativar envio automático de alertas por email para registos prestes a expirar
          </label>
        </div>

        {/* Botão de Gravar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.6rem 1.5rem' }}>
            <Save size={16} /> {saving ? 'A Guardar...' : 'Guardar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};
