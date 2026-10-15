import React, { useState } from 'react';
import { X, Play, Users, Crown, ShieldCheck, HelpCircle } from 'lucide-react';
import {
  PROYECTOS_DATA,
  ASIGNACIONES_DATA,
  PERSONAS_DATA,
  ROLES_DATA,
  NOMBRES_LIDERES_DATA
} from '../utils/rolesWorkflowData';
import { sounds } from '../utils/audio';

const ROLE_CHOICES = [
  { key: 'agile', label: 'Agile Manager' },
  { key: 'de', label: 'Data Engineer' },
  { key: 'ds', label: 'Científico de Datos' },
  { key: 'bi', label: 'Analista BI' },
  { key: 'do', label: 'DevOps/MLOps' },
  { key: 'qa', label: 'Ingeniero QA' }
];

export const ProjectSimulatorModal = ({ onClose, rewardedKeys = [], onDecision, onProjectComplete }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(PROYECTOS_DATA[0].id);
  const [amFilter, setAmFilter] = useState('all');
  const [simStep, setSimStep] = useState(0);
  const [simAnswers, setSimAnswers] = useState({}); // { [stepIndex]: { picked, paid } }

  // Con varias carteras activas, se filtra por Agile Manager para no listar todo de golpe
  const amNames = [...new Set(PROYECTOS_DATA.map((p) => p.am_nombre).filter(Boolean))];
  const visibleProjects = amFilter === 'all'
    ? PROYECTOS_DATA
    : PROYECTOS_DATA.filter((p) => p.am_nombre === amFilter);

  const currentProject = PROYECTOS_DATA.find((p) => p.id === selectedProjectId) || PROYECTOS_DATA[0];
  const projectAssignments = ASIGNACIONES_DATA.filter((a) => a.proyecto_id === currentProject.id);

  // Especialidades presentes en el equipo asignado (para mostrar su Tech Lead de soporte)
  const rolesInProject = [
    ...new Set(
      projectAssignments
        .map((asg) => PERSONAS_DATA.find((p) => p.email === asg.email)?.rol)
        .filter(Boolean)
    )
  ];

  // Cada hito oculta el rol: el jugador decide quién actúa antes de que se revele
  // la respuesta. `task` no debe delatar el rol correcto.
  const milestones = [
    { title: '1. Requerimientos & Alineación Ágil', role: 'agile', task: 'Hay que levantar los requerimientos con el cliente y definir el cronograma del proyecto.', explain: `${currentProject.am_nombre} (Agile Manager, dueño del proyecto) levanta requerimientos, define el cronograma y alinea al cliente.` },
    { title: '2. Arquitectura de Plataforma & ETL', role: 'de', task: 'Toca construir los pipelines de ingesta y limpieza de los datos fuente.', explain: 'El Data Engineer construye los pipelines de ingesta y limpieza de datos.' },
    { title: '3. Desarrollo de Modelos ML / RAG', role: 'ds', task: 'Hay que entrenar y evaluar el modelo de IA o RAG del proyecto.', explain: 'El Científico de Datos entrena y evalúa los modelos de IA o RAG.' },
    { title: '4. Quality Gates & Pruebas QA', role: 'qa', task: 'Antes de salir a producción, alguien debe validar precisión, groundedness y latencia.', explain: 'El Ingeniero QA valida la precisión, groundedness y latencia.' },
    { title: '5. Despliegue en Producción & MLOps', role: 'do', task: 'Hay que automatizar la infraestructura y el despliegue en Kubernetes.', explain: 'El equipo MLOps automatiza la infraestructura CI/CD en Kubernetes.' },
    { title: '6. Dashboards BI & Presentación', role: 'bi', task: 'El cliente quiere ver resultados: hacen falta reportes interactivos.', explain: 'El Analista BI crea los reportes interactivos para la toma de decisiones.' }
  ];

  const currentMilestone = milestones[simStep];
  const currentEntry = simAnswers[simStep] ?? null;
  const currentAnswer = currentEntry?.picked ?? null;
  const answeredCount = Object.keys(simAnswers).length;
  const runFinished = answeredCount === milestones.length;
  const correctCount = Object.entries(simAnswers).filter(([i, a]) => a.picked === milestones[i].role).length;

  // Cada hito paga XP una sola vez por proyecto: reiniciar la simulación no vuelve a pagar.
  const handlePickRole = (roleKey) => {
    if (currentAnswer !== null) return;
    const correct = roleKey === currentMilestone.role;
    const key = `${currentProject.id}:${simStep}`;
    const paid = correct && !rewardedKeys.includes(key);
    if (correct) sounds.playBadge(); else sounds.playClick();
    const nextAnswers = { ...simAnswers, [simStep]: { picked: roleKey, paid } };
    setSimAnswers(nextAnswers);
    onDecision?.({ key, correct });
    if (Object.keys(nextAnswers).length === milestones.length) {
      const perfect = Object.entries(nextAnswers).every(([i, a]) => a.picked === milestones[i].role);
      onProjectComplete?.({ projectId: currentProject.id, perfect });
    }
  };

  const handleNextStep = () => {
    sounds.playClick();
    if (simStep + 1 === milestones.length) {
      setSimAnswers({});
      setSimStep(0);
    } else {
      setSimStep((prev) => prev + 1);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: 900, borderColor: '#10b981' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#10b981',
            padding: 12,
            borderRadius: 14
          }}>
            <Play size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Simulador de Proyectos Reales DK</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Experimenta el ciclo de vida de un proyecto real de DataKnow y las contribuciones por rol
            </p>
          </div>
        </div>

        {/* Aclaración de gobierno: quién manda y quién asesora */}
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          background: '#eff6ff',
          border: '2px solid #bfdbfe',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: '0.82rem',
          color: '#1e3a8a',
          lineHeight: 1.5
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🧭</span>
          <span>
            <strong>El Agile Manager es el dueño del proyecto:</strong> coordina tiempos, entregables y ceremonias Scrum ante el cliente.{' '}
            <strong>El Tech Lead de cada especialidad</strong> resuelve dudas técnicas y garantiza que se cumplan los estándares — no gestiona el cronograma ni responde por la entrega.
          </span>
        </div>

        {/* Filtro por Agile Manager */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Cartera de:
          </span>
          <button
            className="glass-button"
            style={{ fontSize: '0.78rem', background: amFilter === 'all' ? 'rgba(16, 185, 129, 0.12)' : undefined, borderColor: amFilter === 'all' ? '#10b981' : undefined }}
            onClick={() => { sounds.playClick(); setAmFilter('all'); }}
          >
            <span>Todos ({PROYECTOS_DATA.length})</span>
          </button>
          {amNames.map((am) => {
            const n = PROYECTOS_DATA.filter((p) => p.am_nombre === am).length;
            return (
              <button
                key={am}
                className="glass-button"
                style={{ fontSize: '0.78rem', background: amFilter === am ? 'rgba(251, 191, 36, 0.18)' : undefined, borderColor: amFilter === am ? '#fbbf24' : undefined }}
                onClick={() => { sounds.playClick(); setAmFilter(am); }}
              >
                <Crown size={12} style={{ color: '#b45309' }} />
                <span>{am} ({n})</span>
              </button>
            );
          })}
        </div>

        {/* Project Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
          {visibleProjects.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel"
              style={{
                padding: 14,
                cursor: 'pointer',
                borderColor: selectedProjectId === proj.id ? '#10b981' : undefined,
                background: selectedProjectId === proj.id ? 'rgba(16, 185, 129, 0.15)' : undefined
              }}
              onClick={() => {
                sounds.playClick();
                setSelectedProjectId(proj.id);
                setSimStep(0);
                setSimAnswers({});
              }}
            >
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: 4 }}>
                {proj.nombre}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Cliente: {proj.cliente}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Project Information */}
        <div style={{
          background: '#f8fafc',
          border: '2px solid var(--border-glass)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 20
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginBottom: 6 }}>
            {currentProject.nombre}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: 10 }}>
            {currentProject.descripcion}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', padding: 10, borderRadius: 8 }}>
            <strong>Alcance Técnico:</strong> {currentProject.alcance}
          </div>

          {/* Gobierno del proyecto: AM dueño + Tech Leads de soporte */}
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fffbeb',
              border: '2px solid #fbbf24',
              borderRadius: 12,
              padding: '10px 14px',
              flex: '1 1 260px'
            }}>
              <Crown size={22} style={{ color: '#b45309', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Agile Manager · Dueño del Proyecto
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                  {currentProject.am_nombre}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: 2 }}>
                  {currentProject.am_rol}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              flex: '1 1 260px',
              alignContent: 'flex-start'
            }}>
              {rolesInProject.map((roleKey) => {
                const role = ROLES_DATA.find((r) => r.clave === roleKey);
                const titles = NOMBRES_LIDERES_DATA.find((l) => l.rol === roleKey);
                if (!titles) return null;
                return (
                  <div
                    key={roleKey}
                    title="Resuelve dudas técnicas y vela por los estándares. No gestiona tiempos ni entregables."
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: role?.color_suave || '#f1f5f9',
                      border: `1.5px solid ${role?.color || '#94a3b8'}`,
                      borderRadius: 10,
                      padding: '6px 10px',
                      fontSize: '0.72rem'
                    }}
                  >
                    <ShieldCheck size={14} style={{ color: role?.color || '#475569', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{titles.tech_lead}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Team Members */}
          <div style={{ marginTop: 14 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} /> Equipo Asignado en DK:
            </h4>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {projectAssignments.map((asg, idx) => {
                const person = PERSONAS_DATA.find((p) => p.email === asg.email);
                const role = ROLES_DATA.find((r) => r.clave === person?.rol);
                const prestado = person?.equipo && person.equipo !== currentProject.am_nombre;
                return (
                  <span key={idx} style={{
                    background: prestado ? '#fff7ed' : (role?.color_suave || 'rgba(255,255,255,0.1)'),
                    border: `2px solid ${prestado ? '#f97316' : (role?.color || '#3b82f6')}`,
                    color: '#0f172a',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {person?.nombre} · {role?.corto || role?.nombre} {person?.nivel} · {asg.porcentaje}%
                    {prestado && <strong style={{ color: '#c2410c' }}> · prestado de {person.equipo}</strong>}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestone Simulation — decisión activa, no un "avanzar" pasivo */}
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: 14,
          padding: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>
              Hito {simStep + 1} de {milestones.length}: {currentMilestone.title}
            </h4>
            {currentAnswer !== null && (
              <button className="glass-button primary" onClick={handleNextStep}>
                <span>{simStep + 1 === milestones.length ? 'Reiniciar simulación ↺' : 'Siguiente hito ➔'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#ffffff', border: '1px solid #bbf7d0', padding: 16, borderRadius: 10, marginBottom: 14 }}>
            <HelpCircle size={24} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: 6 }}>
                {currentMilestone.task}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                ¿Qué rol se encarga de esto?
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: currentAnswer !== null ? 14 : 0 }}>
            {ROLE_CHOICES.map((choice) => {
              const isCorrect = choice.key === currentMilestone.role;
              const isPicked = choice.key === currentAnswer;
              let borderColor;
              if (currentAnswer !== null) borderColor = isCorrect ? '#10b981' : (isPicked ? '#ef4444' : undefined);
              return (
                <button
                  key={choice.key}
                  className="glass-button"
                  disabled={currentAnswer !== null}
                  onClick={() => handlePickRole(choice.key)}
                  style={{
                    justifyContent: 'center',
                    borderColor,
                    background: currentAnswer !== null && isCorrect ? 'rgba(16, 185, 129, 0.12)' : undefined
                  }}
                >
                  <span>{choice.label}</span>
                </button>
              );
            })}
          </div>

          {currentAnswer !== null && (
            <div style={{
              background: currentAnswer === currentMilestone.role ? '#ecfdf5' : '#fff7ed',
              border: `2px solid ${currentAnswer === currentMilestone.role ? '#10b981' : '#f97316'}`,
              borderRadius: 10,
              padding: 14,
              fontSize: '0.85rem',
              color: 'var(--text-dark)',
              lineHeight: 1.5
            }}>
              {currentAnswer === currentMilestone.role ? (
                <>
                  <strong>{currentEntry.paid ? '¡Correcto! +25 XP.' : '¡Correcto!'}</strong> {currentMilestone.explain}
                  {!currentEntry.paid && (
                    <div style={{ marginTop: 6, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Ya habías resuelto este hito en este proyecto · repaso sin XP
                    </div>
                  )}
                </>
              ) : (
                <>No — el rol correcto es <strong>{ROLE_CHOICES.find((c) => c.key === currentMilestone.role)?.label}</strong>. {currentMilestone.explain}</>
              )}
            </div>
          )}

          {runFinished && (
            <div style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: correctCount === milestones.length ? 'linear-gradient(90deg, rgba(0,198,189,0.14), rgba(64,23,170,0.1))' : '#ffffff',
              border: '1px solid rgba(64,23,170,0.18)',
              borderRadius: 14,
              padding: '12px 14px',
              fontSize: '0.88rem'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{correctCount === milestones.length ? '🎯' : '✅'}</span>
              <span>
                <strong>Proyecto completado: {correctCount} de {milestones.length} hitos correctos.</strong>{' '}
                {correctCount === milestones.length
                  ? '¡Simulación perfecta! Sabes exactamente quién hace qué.'
                  : 'Reinicia la simulación para intentar una ronda perfecta.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
