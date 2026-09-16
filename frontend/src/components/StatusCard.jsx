import React from 'react';

export const StatusCard = ({ title, value, status, icon: Icon, detail }) => {
  const getIndicatorClass = () => {
    if (status === 'online' || status === true) return 'online';
    if (status === 'offline' || status === false) return 'offline';
    return 'warning';
  };

  return (
    <div className="card">
      <div className="card-title">
        {Icon && <Icon size={18} />}
        <span>{title}</span>
      </div>
      <div className="card-value">
        <span className={`indicator ${getIndicatorClass()}`}></span>
        <span>{value}</span>
      </div>
      {detail && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{detail}</div>}
    </div>
  );
};
