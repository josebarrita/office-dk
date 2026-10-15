import React from 'react';
import { X, Users, MapPin, Navigation } from 'lucide-react';
import { sounds } from '../utils/audio';

export const DirectoryModal = ({ onClose, users, onTeleport }) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: 600 }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid #3b82f6',
            color: '#3b82f6',
            padding: 10,
            borderRadius: 12
          }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Directorio de Colaboradores en Vivo</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Encuentra a tus compañeros presentes en la oficina virtual de DataKnow
            </p>
          </div>
        </div>

        <div className="directory-list">
          {users.map((u) => (
            <div key={u.id} className="directory-user-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: u.avatar?.shirt || '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#ffffff'
                }}>
                  {u.name.substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {u.name} {u.isBot ? '🤖' : '👤'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {u.roleLabel} • <span style={{ color: '#0284c7', fontWeight: 700 }}>{u.statusLabel}</span>
                  </div>
                </div>
              </div>

              <button
                className="glass-button"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => {
                  sounds.playClick();
                  onTeleport(u.x, u.y);
                  onClose();
                }}
              >
                <Navigation size={14} style={{ color: '#3b82f6' }} />
                <span>Ir hacia él/ella</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
