import React, { useState } from 'react';
import { X, Coffee, Plus, LogIn, LogOut, Users, MessageCircle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

// Temas de conversación disponibles para abrir una mesa.
const TOPICS = [
  {
    id: 'cafe',
    icon: '☕',
    title: 'Café sin agenda',
    desc: 'Charla libre. No hay tema, solo ganas de hablar con alguien.',
    starters: [
      '¿Cómo va tu semana, sin hablar de entregables?',
      '¿Qué es lo mejor que te ha pasado hoy?',
      '¿Café, té o mate? Defiende tu respuesta.'
    ]
  },
  {
    id: 'aprendiendo',
    icon: '📚',
    title: 'Qué estoy aprendiendo',
    desc: 'Un curso, un artículo, un truco nuevo que descubriste.',
    starters: [
      '¿Qué aprendiste esta semana que no sabías el lunes?',
      '¿Algún recurso que le recomendarías a todo el equipo?',
      '¿Qué te gustaría aprender si tuvieras un viernes libre?'
    ]
  },
  {
    id: 'dudas',
    icon: '🧠',
    title: 'Dudas técnicas rápidas',
    desc: 'Trae ese bloqueo que llevas media hora peleando. Sin formalidad.',
    starters: [
      '¿En qué estás atascado ahora mismo?',
      '¿Alguien ha peleado antes con esto?',
      '¿Cómo lo resolverías tú en dos minutos?'
    ]
  },
  {
    id: 'remoto',
    icon: '🌍',
    title: 'Vida remota',
    desc: 'Rutinas, setup, ciudades y cómo no quemarse trabajando desde casa.',
    starters: [
      '¿Cómo separas el trabajo de la casa?',
      '¿Cuál es tu mejor inversión para el escritorio?',
      '¿Desde qué ciudad te gustaría trabajar un mes?'
    ]
  },
  {
    id: 'hobbies',
    icon: '🎮',
    title: 'Hobbies & gaming',
    desc: 'Lo que haces cuando cierras el portátil.',
    starters: [
      '¿Qué estás jugando, viendo o leyendo?',
      '¿Algún hobby que nadie del equipo se imagina que tienes?',
      '¿Plan ideal de un sábado?'
    ]
  },
  {
    id: 'onboarding',
    icon: '🌱',
    title: 'Primeros días en DK',
    desc: 'Para quien acaba de entrar y quiere preguntar sin sentirse el nuevo.',
    starters: [
      '¿Qué te habría gustado saber en tu primera semana?',
      '¿A quién le preguntas cuando no sabes a quién preguntarle?',
      '¿Qué costumbre de DK te sorprendió?'
    ]
  }
];

const MAX_SEATS = 4;

export const OpenTablesModal = ({ onClose, player, colleagues = [], onUpdateStatus }) => {
  // Mesas ya abiertas por compañeros (semilla con quien esté conectado)
  const [tables, setTables] = useState(() => {
    const seed = [];
    if (colleagues[0]) seed.push({ id: 't1', topicId: 'cafe', host: colleagues[0].name, seats: [colleagues[0].name] });
    if (colleagues[3]) seed.push({ id: 't2', topicId: 'dudas', host: colleagues[3].name, seats: [colleagues[3].name, colleagues[1]?.name].filter(Boolean) });
    if (colleagues[5]) seed.push({ id: 't3', topicId: 'hobbies', host: colleagues[5].name, seats: [colleagues[5].name] });
    return seed;
  });
  const [creating, setCreating] = useState(false);

  const me = player?.name || 'Tú';
  const myTable = tables.find((t) => t.seats.includes(me));
  const topicOf = (id) => TOPICS.find((t) => t.id === id) || TOPICS[0];

  const sitAt = (tableId) => {
    sounds.playBadge();
    setTables((prev) =>
      prev.map((t) => {
        const without = t.seats.filter((s) => s !== me);
        if (t.id === tableId) return { ...t, seats: [...without, me] };
        return { ...t, seats: without };
      })
    );
    if (onUpdateStatus) onUpdateStatus('coffee', 'En una mesa abierta ☕');
  };

  const standUp = () => {
    sounds.playClick();
    setTables((prev) =>
      prev
        .map((t) => ({ ...t, seats: t.seats.filter((s) => s !== me) }))
        // Si abriste tú la mesa y te levantas, la mesa se cierra
        .filter((t) => !(t.host === me && t.seats.length === 0))
    );
    if (onUpdateStatus) onUpdateStatus('available', 'Disponible 🟢');
  };

  const openTable = (topicId) => {
    sounds.playBadge();
    const id = 'mine_' + Date.now();
    setTables((prev) => [
      ...prev.map((t) => ({ ...t, seats: t.seats.filter((s) => s !== me) })),
      { id, topicId, host: me, seats: [me] }
    ]);
    setCreating(false);
    if (onUpdateStatus) onUpdateStatus('coffee', 'En una mesa abierta ☕');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 860, borderColor: '#f59e0b' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            color: '#f59e0b',
            padding: 12,
            borderRadius: 14
          }}>
            <Coffee size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Mesas Abiertas de Conversación</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Siéntate en una mesa y habla con quien esté ahí. Sin agenda, sin acta, sin cámara.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          background: '#fffbeb',
          border: '2px solid #fcd34d',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: '0.82rem',
          color: '#78350f',
          lineHeight: 1.5
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💬</span>
          <span>
            <strong>Esto no reemplaza a Teams.</strong> Las reuniones de trabajo siguen donde siempre.
            Esta zona existe porque somos 100% remotos: es el pasillo donde te encuentras a alguien
            y terminan hablando diez minutos de cualquier cosa.
          </span>
        </div>

        {/* Mesa en la que estoy sentado */}
        {myTable && (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 14,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#047857' }}>
                {topicOf(myTable.topicId).icon} Estás en: {topicOf(myTable.topicId).title}
              </span>
              <button className="glass-button" onClick={standUp}>
                <LogOut size={14} />
                <span>Levantarme</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {myTable.seats.map((s) => (
                <span key={s} style={{
                  background: s === me ? '#4017AA' : '#ffffff',
                  color: s === me ? '#ffffff' : '#0f172a',
                  border: '1.5px solid #10b981',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {s === me ? `${s} (tú)` : s}
                </span>
              ))}
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={12} /> Para romper el hielo
              </div>
              {topicOf(myTable.topicId).starters.map((s, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: '#334155', marginBottom: 3 }}>• {s}</div>
              ))}
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 8 }}>
                Usa el chat de <strong>Cercanía</strong> para hablar con quien esté en la mesa.
              </div>
            </div>
          </div>
        )}

        {/* Listado de mesas abiertas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} style={{ color: '#f59e0b' }} /> Mesas abiertas ahora ({tables.length})
          </h3>
          <button className="glass-button primary" onClick={() => { sounds.playClick(); setCreating((c) => !c); }}>
            <Plus size={14} />
            <span>Abrir una mesa</span>
          </button>
        </div>

        {/* Selector de tema para abrir mesa nueva */}
        {creating && (
          <div style={{
            background: '#f8fafc',
            border: '2px solid var(--border-glass)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 10 }}>
              ¿De qué quieres hablar? Elige un tema y tu mesa queda visible para el resto.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 8 }}>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  className="glass-button"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', height: '100%' }}
                  onClick={() => openTable(t.id)}
                >
                  <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.8rem' }}>{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tables.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '28px 16px',
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px dashed #cbd5e1',
            fontSize: '0.88rem'
          }}>
            No hay mesas abiertas todavía. <strong>Abre la primera</strong> y quien pase por aquí podrá sentarse.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            {tables.map((table) => {
              const topic = topicOf(table.topicId);
              const iAmHere = table.seats.includes(me);
              const full = table.seats.length >= MAX_SEATS;
              return (
                <div
                  key={table.id}
                  style={{
                    background: iAmHere ? '#f0fdf4' : '#ffffff',
                    border: `2px solid ${iAmHere ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                      {topic.icon} {topic.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{topic.desc}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {table.seats.map((s) => (
                      <span key={s} style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#0f172a'
                      }}>
                        {s === me ? `${s} (tú)` : s}
                      </span>
                    ))}
                    {Array.from({ length: MAX_SEATS - table.seats.length }).map((_, i) => (
                      <span key={'free' + i} style={{
                        border: '1px dashed #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        color: '#94a3b8'
                      }}>
                        silla libre
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {iAmHere ? (
                      <button className="glass-button" style={{ width: '100%', justifyContent: 'center' }} onClick={standUp}>
                        <LogOut size={14} />
                        <span>Levantarme</span>
                      </button>
                    ) : (
                      <button
                        className="glass-button primary"
                        style={{ width: '100%', justifyContent: 'center', opacity: full ? 0.6 : 1 }}
                        disabled={full}
                        onClick={() => sitAt(table.id)}
                      >
                        <LogIn size={14} />
                        <span>{full ? 'Mesa llena' : 'Sentarme'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} style={{ color: '#f59e0b' }} />
          ¿Prefieres uno a uno? En la <strong>Estación de Café</strong> puedes sortear un compañero al azar.
        </div>
      </div>
    </div>
  );
};
