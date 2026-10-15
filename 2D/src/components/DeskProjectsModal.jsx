import React from 'react';
import { X, Briefcase, Crown, ShieldCheck, Users } from 'lucide-react';
import {
  ROLES_DATA,
  PROYECTOS_DATA,
  ASIGNACIONES_DATA,
  PERSONAS_DATA,
  NOMBRES_LIDERES_DATA
} from '../utils/rolesWorkflowData';
import { QuizCallout } from './MiniQuizModal';

export const DeskProjectsModal = ({ onClose, roleKey, onOpenQuiz }) => {
  const role = ROLES_DATA.find((r) => r.clave === roleKey);
  const isAgile = roleKey === 'agile';
  const leaderTitles = NOMBRES_LIDERES_DATA.find((l) => l.rol === roleKey);

  // Cada especialidad ve los proyectos donde tiene a alguien asignado.
  const projects = isAgile
    ? PROYECTOS_DATA.map((p) => ({ project: p, members: [] }))
    : PROYECTOS_DATA
        .map((p) => {
          const members = ASIGNACIONES_DATA
            .filter((a) => a.proyecto_id === p.id)
            .map((a) => ({ ...a, person: PERSONAS_DATA.find((pp) => pp.email === a.email) }))
            .filter((m) => m.person?.rol === roleKey);
          return { project: p, members };
        })
        .filter((x) => x.members.length > 0);

  // En el escritorio del AM se agrupa por dueño: cada Agile Manager tiene su
  // propia célula fija de personas (PERSONAS_DATA[].equipo), no un pool compartido.
  const amCarteras = [...new Set(PROYECTOS_DATA.map((p) => p.am_nombre).filter(Boolean))]
    .map((am) => ({
      am,
      proyectos: PROYECTOS_DATA.filter((p) => p.am_nombre === am),
      equipo: PERSONAS_DATA.filter((p) => p.equipo === am)
    }));

  // 'agile' no existe en ROLES_DATA (solo las 5 especialidades técnicas), así que
  // el escritorio del Agile Manager usa su propia etiqueta y color.
  const roleLabel = isAgile ? 'Agile Managers' : (role?.nombre || 'tu especialidad');
  const roleColor = isAgile ? '#f59e0b' : (role?.color || '#10b981');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 900, borderColor: roleColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            background: role?.color_suave || 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${roleColor}`,
            color: roleColor,
            padding: 12,
            borderRadius: 14
          }}>
            <Briefcase size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Proyectos en Curso · {roleLabel}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isAgile
                ? `${amCarteras.length} Agile Managers activos. Cada uno es dueño de su cartera: coordina tiempos, entregables y ceremonias Scrum ante el cliente.`
                : `Esto es lo que el equipo de ${roleLabel} está entregando ahora mismo en clientes reales (simulados).`}
            </p>
          </div>
        </div>

        {onOpenQuiz && <QuizCallout onOpenQuiz={onOpenQuiz} text="Este es tu escritorio: ¿conoces tus responsabilidades?" />}

        {!isAgile && leaderTitles && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '8px 14px',
            marginBottom: 18,
            fontSize: '0.8rem',
            color: '#475569'
          }}>
            <ShieldCheck size={14} style={{ color: roleColor, flexShrink: 0 }} />
            <span>
              <strong>{leaderTitles.tech_lead}</strong> resuelve dudas técnicas y garantiza estándares en estos proyectos — el cronograma y los entregables los coordina el Agile Manager.
            </span>
          </div>
        )}

        {isAgile ? (
          /* Escritorio del AM: una sección por Agile Manager con su cartera */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {amCarteras.map(({ am, proyectos, equipo }) => (
              <div key={am} style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <Crown size={18} style={{ color: '#b45309', flexShrink: 0 }} />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{am}</span>
                  <span style={{
                    background: '#ffffff',
                    border: '1.5px solid #fbbf24',
                    color: '#92400e',
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {proyectos.length} proyectos
                  </span>
                </div>

                {/* Equipo fijo de la célula: no rota entre AM salvo excepción puntual */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <Users size={13} style={{ color: '#92400e' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Equipo fijo:</span>
                  {equipo.map((p) => {
                    const r = ROLES_DATA.find((rr) => rr.clave === p.rol);
                    return (
                      <span key={p.email} style={{
                        background: '#ffffff',
                        border: `1.5px solid ${r?.color || '#cbd5e1'}`,
                        color: '#0f172a',
                        padding: '2px 9px',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {p.nombre} · {r?.corto || p.rol}
                      </span>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  {proyectos.map((proj) => {
                    const asignados = ASIGNACIONES_DATA
                      .filter((a) => a.proyecto_id === proj.id)
                      .map((a) => PERSONAS_DATA.find((p) => p.email === a.email))
                      .filter(Boolean);
                    const prestados = asignados.filter((p) => p.equipo !== am);
                    return (
                      <div key={proj.id} style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: 3 }}>
                          {proj.nombre}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {proj.cliente} · {asignados.length} personas
                        </div>
                        {prestados.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#c2410c', fontWeight: 700, marginTop: 4 }}>
                            🔀 {prestados.map((p) => p.nombre).join(', ')} prestado de {prestados[0].equipo}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px dashed #cbd5e1'
          }}>
            No hay proyectos activos asignados a esta especialidad en este momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {projects.map(({ project, members }) => (
              <div
                key={project.id}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {project.nombre}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Cliente: {project.cliente}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#fffbeb',
                    border: '1.5px solid #fbbf24',
                    color: '#92400e',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}>
                    <Crown size={12} /> AM: {project.am_nombre}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#334155', margin: '10px 0' }}>
                  {project.descripcion}
                </p>

                {members.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    <Users size={14} style={{ color: roleColor }} />
                    {members.map((m, idx) => {
                      const prestado = m.person?.equipo && m.person.equipo !== project.am_nombre;
                      return (
                        <span key={idx} style={{
                          background: prestado ? '#fff7ed' : (role?.color_suave || '#f1f5f9'),
                          border: `1.5px solid ${prestado ? '#f97316' : roleColor}`,
                          color: '#0f172a',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {m.person?.nombre} · {m.person?.nivel} · {m.porcentaje}%
                          {prestado && <strong style={{ color: '#c2410c' }}> · prestado de {m.person.equipo}</strong>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
