import React, { useEffect, useState } from 'react';
import { X, Award, ChevronRight, BookOpen, Cpu, Shield, Zap, TrendingUp } from 'lucide-react';
import {
  ROLES_DATA,
  NIVELES_DATA,
  LATERALES_DATA,
  AGILE_SENIORITY_DATA,
  NOMBRES_LIDERES_DATA
} from '../utils/rolesWorkflowData';
import { sounds } from '../utils/audio';
import { QuizCallout } from './MiniQuizModal';

export const RoleCareerGuideModal = ({ onClose, onOpenQuiz, initialRole, initialLevel, onViewed }) => {
  const [selectedRole, setSelectedRole] = useState(
    ROLES_DATA.some((r) => r.clave === initialRole) ? initialRole : ROLES_DATA[0].clave
  );
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || 'Junior');

  useEffect(() => {
    onViewed?.();
  }, []);

  const currentRole = ROLES_DATA.find((r) => r.clave === selectedRole) || ROLES_DATA[0];
  const roleLevels = NIVELES_DATA.filter((n) => n.rol === selectedRole);
  const currentLevelData = roleLevels.find((l) => l.nivel.toLowerCase() === selectedLevel.toLowerCase()) || roleLevels[0];
  const lateralMoves = LATERALES_DATA.filter((l) => l.desde === selectedRole || l.hacia === selectedRole);
  const leaderTitles = NOMBRES_LIDERES_DATA.find((l) => l.rol === selectedRole);
  const officialTitle =
    selectedLevel === 'Tech Lead' ? leaderTitles?.tech_lead
    : selectedLevel === 'Specialist Lead' ? leaderTitles?.specialist_lead
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ width: '90vw', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: `3px solid ${currentRole.color}`, marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: currentRole.color_suave || 'rgba(59, 130, 246, 0.15)',
              color: currentRole.color,
              padding: '12px',
              borderRadius: '12px'
            }}>
              <Award size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#0f172a' }}>Manual de Roles & Seniority DataKnow</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
                Descubre las habilidades, misiones y escalafón (Junior ➔ Specialist Lead)
              </p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {onOpenQuiz && <QuizCallout onOpenQuiz={onOpenQuiz} text="¿Sabes qué te toca en cada nivel de seniority?" />}

          {/* Role Selector Tabs (Pill style) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {ROLES_DATA.map((role) => {
              const isSelected = selectedRole === role.clave;
              return (
                <button
                  key={role.clave}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedRole(role.clave);
                    setSelectedLevel('Junior');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: `1px solid ${isSelected ? role.color : '#cbd5e1'}`,
                    background: isSelected ? role.color : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {role.nombre}
                </button>
              );
            })}
          </div>

          {/* Role Overview */}
          <div style={{
            background: currentRole.color_suave,
            border: `1px solid ${currentRole.color}40`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: currentRole.color, margin: '0 0 10px 0' }}>
              {currentRole.nombre} ({currentRole.corto})
            </h3>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              <strong style={{ color: currentRole.color }}>Misión:</strong> {currentRole.mision}
            </p>
            <div style={{ display: 'inline-block', background: 'white', border: `1px solid ${currentRole.color}30`, color: currentRole.color, padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
              ☁️ Ecosistema: {currentRole.nube}
            </div>
          </div>

          {/* Seniority Escalafón Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '10px' }}>
              NIVEL DE SENIORITY:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
              {['Junior', 'Semisenior', 'Senior', 'Tech Lead', 'Specialist Lead'].map((lvl) => {
                const hasLevel = roleLevels.some((l) => l.nivel.toLowerCase() === lvl.toLowerCase());
                const isSelected = selectedLevel.toLowerCase() === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    disabled={!hasLevel}
                    style={{
                      opacity: hasLevel ? 1 : 0.4,
                      background: isSelected ? 'white' : 'transparent',
                      color: isSelected ? currentRole.color : '#64748b',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: hasLevel ? 'pointer' : 'not-allowed',
                      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      if(hasLevel) {
                        sounds.playClick();
                        setSelectedLevel(lvl);
                      }
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            {officialTitle && (
              <p style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                🧭 En <strong style={{ color: currentRole.color }}>{currentRole.nombre}</strong>, este nivel se llama oficialmente <strong>"{officialTitle}"</strong>.
                {selectedLevel === 'Tech Lead' && ' Resuelve dudas técnicas y garantiza estándares — no gestiona tiempos ni entregables (eso es del Agile Manager).'}
              </p>
            )}
          </div>

          {/* Level Details Card (Light Mode) */}
          {currentLevelData ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: currentRole.color, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={18} /> Responsabilidades
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {currentLevelData.responsabilidades}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: currentRole.color, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={18} /> Habilidades Técnicas
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {currentLevelData.habilidades}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: currentRole.color, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={18} /> Alcance & Autonomía
                  </h4>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      <strong style={{ color: '#0f172a' }}>Autonomía:</strong> {currentLevelData.autonomia}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                      <strong style={{ color: '#0f172a' }}>Alcance:</strong> {currentLevelData.alcance}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: currentRole.color, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={18} /> KPIs & Criterios de Éxito
                  </h4>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      {currentLevelData.kpis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
              No hay información específica registrada para este nivel en este rol.
            </div>
          )}

          {/* Lateral Career Paths */}
          {lateralMoves.length > 0 && (
            <div style={{ marginTop: '24px', background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} /> Rutas de Transición Lateral de Carrera
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lateralMoves.map((m, idx) => {
                  const rFrom = ROLES_DATA.find((r) => r.clave === m.desde);
                  const rTo = ROLES_DATA.find((r) => r.clave === m.hacia);
                  return (
                    <div key={idx} style={{ fontSize: '0.9rem', color: '#78350f', background: 'white', padding: '10px 14px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontWeight: 600 }}>De</span> <strong style={{ color: rFrom?.color }}>{rFrom?.nombre}</strong> <span style={{ fontWeight: 600 }}>hacia</span> <strong style={{ color: rTo?.color }}>{rTo?.nombre}</strong>: 
                      <span style={{ display: 'block', marginTop: '4px', color: '#92400e' }}>{m.nota}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
