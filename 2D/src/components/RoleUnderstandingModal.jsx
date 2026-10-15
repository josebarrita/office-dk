import React, { useEffect } from 'react';
import { X, Database, ServerCog, Brain, ShieldCheck, BarChart3, LifeBuoy } from 'lucide-react';
import { ROLES_DATA, NOMBRES_LIDERES_DATA } from '../utils/rolesWorkflowData';
import { QuizCallout } from './MiniQuizModal';

const iconMap = {
  Database: <Database size={32} />,
  ServerCog: <ServerCog size={32} />,
  Brain: <Brain size={32} />,
  ShieldCheck: <ShieldCheck size={32} />,
  BarChart3: <BarChart3 size={32} />
};

export const RoleUnderstandingModal = ({ onClose, onFirstRead, onOpenQuiz }) => {
  // App.jsx decide si ya se había leído antes y si toca sumar XP o no.
  useEffect(() => {
    onFirstRead?.();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ width: '90vw', maxWidth: '1400px', height: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
          <div>
            <h2>Sala de Entendimiento de Rol DK</h2>
            <p>Infografía interactiva sobre el día a día y misiones de los consultores de DataKnow.</p>
          </div>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {onOpenQuiz && <QuizCallout onOpenQuiz={onOpenQuiz} />}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            {ROLES_DATA.map((role) => (
              <div 
                key={role.clave}
                style={{
                  backgroundColor: role.color_suave,
                  borderTop: `6px solid ${role.color}`,
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    backgroundColor: role.color, 
                    color: 'white', 
                    padding: '12px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {iconMap[role.icono] || <Database size={32} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>{role.nombre}</h3>
                    <span style={{ 
                      color: role.color, 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {role.corto}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: `1px solid ${role.color}40`,
                  flex: 1
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: role.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎯 Misión del Rol
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#475569' }}>
                    {role.mision}
                  </p>
                </div>

                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: `1px solid ${role.color}40`
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: role.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ☁️ Ecosistema / Tecnologías
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', color: '#334155' }}>
                    {role.nube}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    ({role.nube_corto})
                  </p>
                </div>

                {(() => {
                  const titles = NOMBRES_LIDERES_DATA.find((l) => l.rol === role.clave);
                  if (!titles) return null;
                  return (
                    <div style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${role.color}40`
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: role.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LifeBuoy size={16} /> Tech Lead de la Especialidad
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                        {titles.tech_lead}
                      </p>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                        Resuelve dudas técnicas y garantiza que se cumplan los estándares. <strong>No gestiona tiempos ni entregables</strong> — eso lo hace el Agile Manager, dueño del proyecto.
                      </p>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
