import React, { useState } from 'react';
import { X, GitPullRequest, Grid, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Sparkles, Filter, Target } from 'lucide-react';
import {
  ROLES_DATA,
  TIPOS_PROYECTO_DATA,
  FLUJOS_DATA,
  RACI_DATA,
  AGILE_DATA,
  getFlowsForProjectType
} from '../utils/rolesWorkflowData';
import { sounds } from '../utils/audio';

export const ProjectWorkflowModal = ({ onClose, onOpenRaciChallenge, initialTab = 'flows' }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab); // 'flows' | 'raci' | 'agile'
  const [selectedProjectType, setSelectedProjectType] = useState('all');
  const [activeFlowId, setActiveFlowId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const flows = getFlowsForProjectType(selectedProjectType);
  const activeProjectType = TIPOS_PROYECTO_DATA.find((t) => t.clave === selectedProjectType) || TIPOS_PROYECTO_DATA[0];

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: 1000, borderColor: '#3b82f6' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid #3b82f6',
            color: '#3b82f6',
            padding: 12,
            borderRadius: 14
          }}>
            <GitPullRequest size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hub de Metodología, Flujos & Matriz RACI DK</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Entiende cómo se relacionan los roles de DataKnow en los distintos tipos de proyectos de datos e IA
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border-glass)', pb: 10 }}>
          <button
            className={`glass-button ${selectedTab === 'flows' ? 'primary' : ''}`}
            onClick={() => { sounds.playClick(); setSelectedTab('flows'); }}
          >
            <GitPullRequest size={16} />
            <span>Flujos entre Roles</span>
          </button>

          <button
            className={`glass-button ${selectedTab === 'raci' ? 'primary' : ''}`}
            onClick={() => { sounds.playClick(); setSelectedTab('raci'); }}
          >
            <Grid size={16} />
            <span>Matriz RACI Corporativa</span>
          </button>

          <button
            className={`glass-button ${selectedTab === 'agile' ? 'primary' : ''}`}
            onClick={() => { sounds.playClick(); setSelectedTab('agile'); }}
          >
            <Sparkles size={16} />
            <span>Interacción Ágil & Cadencias</span>
          </button>
        </div>

        {/* TAB 1: FLUJOS DE TRABAJO ENTRE ROLES */}
        {selectedTab === 'flows' && (
          <div>
            {/* Project Type Filter Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              background: '#f8fafc',
              padding: 12,
              borderRadius: 12,
              border: '2px solid var(--border-glass)'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} /> TIPO DE PROYECTO:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TIPOS_PROYECTO_DATA.map((type) => (
                  <button
                    key={type.clave}
                    className="glass-button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      background: selectedProjectType === type.clave ? 'rgba(59, 130, 246, 0.12)' : undefined,
                      borderColor: selectedProjectType === type.clave ? '#3b82f6' : undefined
                    }}
                    onClick={() => { sounds.playClick(); setSelectedProjectType(type.clave); }}
                  >
                    <span>{type.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Roles Interactive Map Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              {ROLES_DATA.map((role) => {
                const isSelectedRole = roleFilter === role.clave;
                return (
                  <div
                    key={role.clave}
                    className="glass-panel"
                    style={{
                      padding: 16,
                      borderLeft: `4px solid ${role.color}`,
                      cursor: 'pointer',
                      background: isSelectedRole ? 'rgba(0, 198, 189, 0.08)' : undefined
                    }}
                    onClick={() => { sounds.playClick(); setRoleFilter(roleFilter === role.clave ? 'all' : role.clave); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: role.color }}>
                        {role.nombre} ({role.corto})
                      </span>
                      <span style={{
                        background: role.color_suave || 'rgba(255,255,255,0.1)',
                        color: role.color,
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {role.nube_corto}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                      {role.mision}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Active Flow Connections List */}
            <div style={{
              background: '#f8fafc',
              border: '2px solid var(--border-glass)',
              borderRadius: 14,
              padding: 20
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitPullRequest size={18} style={{ color: '#0284c7' }} />
                Flujos de Entregables entre Roles en "{activeProjectType.nombre}"
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {flows.map((flow) => {
                  const roleFrom = ROLES_DATA.find((r) => r.clave === flow.desde);
                  const roleTo = ROLES_DATA.find((r) => r.clave === flow.hacia);
                  const isHighlighted = activeFlowId === flow.id;

                  return (
                    <div
                      key={flow.id}
                      style={{
                        background: isHighlighted ? 'rgba(59, 130, 246, 0.10)' : '#ffffff',
                        border: isHighlighted ? '2px solid #3b82f6' : '1px solid var(--border-glass)',
                        borderRadius: 10,
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => { sounds.playClick(); setActiveFlowId(isHighlighted ? null : flow.id); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: roleFrom?.color,
                          background: '#f1f5f9',
                          padding: '4px 10px',
                          borderRadius: 6
                        }}>
                          {roleFrom?.nombre}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                          <ArrowRight size={16} />
                          <span style={{
                            background: '#38bdf8',
                            color: '#0f172a',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}>
                            {flow.etiqueta}
                          </span>
                          <ArrowRight size={16} />
                        </div>

                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: roleTo?.color,
                          background: '#f1f5f9',
                          padding: '4px 10px',
                          borderRadius: 6
                        }}>
                          {roleTo?.nombre}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Haz clic para ver detalles del entregable ➔
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATRIZ RACI CORPORATIVA */}
        {selectedTab === 'raci' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
              fontSize: '0.85rem',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <span><strong style={{ color: '#10b981' }}>R</strong> = Responsable (Hace el trabajo)</span>
                <span><strong style={{ color: '#3b82f6' }}>A</strong> = Aprobador / Accountable (Responde por el resultado)</span>
                <span><strong style={{ color: '#f59e0b' }}>C</strong> = Consultado (Aporta criterio)</span>
                <span><strong style={{ color: '#64748b' }}>I</strong> = Informado (Recibe reportes)</span>
              </div>
              {onOpenRaciChallenge && (
                <button className="glass-button primary" style={{ fontSize: '0.8rem', flexShrink: 0 }} onClick={onOpenRaciChallenge}>
                  <Target size={14} />
                  <span>Ponte a prueba: Reto RACI</span>
                </button>
              )}
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Actividad de Proyecto</th>
                  <th style={{ color: '#00C6BD' }}>DE</th>
                  <th style={{ color: '#4017AA' }}>DS</th>
                  <th style={{ color: '#FF7E1D' }}>BI</th>
                  <th style={{ color: '#059669' }}>DevOps</th>
                  <th style={{ color: '#FF453C' }}>QA</th>
                  <th style={{ color: '#EC4899' }}>Agile</th>
                  <th style={{ color: '#F59E0B' }}>Líder</th>
                </tr>
              </thead>
              <tbody>
                {RACI_DATA.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.actividad}</td>
                    <td style={{ fontWeight: 800, color: row.de?.includes('A') ? '#3b82f6' : row.de === 'R' ? '#10b981' : '#64748b' }}>{row.de}</td>
                    <td style={{ fontWeight: 800, color: row.ds?.includes('A') ? '#3b82f6' : row.ds === 'R' ? '#10b981' : '#64748b' }}>{row.ds}</td>
                    <td style={{ fontWeight: 800, color: row.bi?.includes('A') ? '#3b82f6' : row.bi === 'R' ? '#10b981' : '#64748b' }}>{row.bi}</td>
                    <td style={{ fontWeight: 800, color: row.do?.includes('A') ? '#3b82f6' : row.do === 'R' ? '#10b981' : '#64748b' }}>{row.do}</td>
                    <td style={{ fontWeight: 800, color: row.qa?.includes('A') ? '#3b82f6' : row.qa === 'R' ? '#10b981' : '#64748b' }}>{row.qa}</td>
                    <td style={{ fontWeight: 800, color: row.agile?.includes('A') ? '#3b82f6' : row.agile === 'R' ? '#10b981' : '#64748b' }}>{row.agile}</td>
                    <td style={{ fontWeight: 800, color: row.lider?.includes('A') ? '#3b82f6' : row.lider === 'R' ? '#10b981' : '#64748b' }}>{row.lider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: INTERACCIÓN ÁGIL */}
        {selectedTab === 'agile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {AGILE_DATA.map((agile, idx) => {
              const role = ROLES_DATA.find((r) => r.clave === agile.rol);
              return (
                <div key={idx} className="glass-panel" style={{ padding: 18, borderLeft: `4px solid ${role?.color || '#3b82f6'}` }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: role?.color, marginBottom: 8 }}>
                    Rol: {role?.nombre}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <strong style={{ color: '#0284c7' }}>¿Qué facilita el Agile Manager?:</strong>
                      <p>{agile.facilita}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#10b981' }}>¿Qué se espera del rol?:</strong>
                      <p>{agile.espera}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#f59e0b' }}>Cadencia Ágil:</strong>
                      <p style={{ fontFamily: 'Fira Code', fontSize: '0.75rem' }}>{agile.cadencia}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
