import React, { useState } from 'react';
import { X, Coffee, Sparkles, Smile, Check, Zap, Shuffle, Users } from 'lucide-react';
import { STATUS_OPTIONS } from '../utils/officeData';
import { sounds } from '../utils/audio';

const ICEBREAKERS = [
  '¿Qué proyecto de DK te ha hecho aprender más este año?',
  '¿Café, té o mate para arrancar el día?',
  '¿Cuál es tu herramienta o atajo favorito para trabajar más rápido?',
  '¿Qué serie o podcast estás viendo/escuchando ahora?',
  '¿Oficina en casa, café o coworking — dónde trabajas mejor?',
  '¿Cuál fue el bug más raro que has resuelto?',
  '¿Qué te motivó a trabajar en datos o IA?',
  '¿Cuál es tu ciudad favorita para trabajar remoto una semana?'
];

export const CoffeeCornerModal = ({ onClose, currentStatus, onUpdateStatus, colleagues = [] }) => {
  const [brewing, setBrewing] = useState(false);
  const [brewedCount, setBrewedCount] = useState(1);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [match, setMatch] = useState(null);

  const handleShuffleCoffee = () => {
    sounds.playBadge();
    if (!colleagues.length) {
      setMatch({ empty: true });
      return;
    }
    const person = colleagues[Math.floor(Math.random() * colleagues.length)];
    const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    setMatch({ person, icebreaker });
  };

  const trivia = [
    {
      q: '¿Qué lenguaje es el estándar para consultas en bases de datos relacionales?',
      options: ['Python', 'SQL', 'Scala', 'C++'],
      correct: 1
    },
    {
      q: '¿Qué formato de archivo de columnas optimiza almacenamiento en Big Data?',
      options: ['CSV', 'Parquet', 'TXT', 'JSON'],
      correct: 1
    },
    {
      q: '¿Qué principio garantiza transacciones confiables en SQL?',
      options: ['REST', 'ACID', 'BASE', 'SOLID'],
      correct: 1
    }
  ];

  const handleBrewCoffee = () => {
    setBrewing(true);
    sounds.playCoffee();
    setTimeout(() => {
      setBrewing(false);
      setBrewedCount((prev) => prev + 1);
      onUpdateStatus('coffee', 'Break de Café ☕');
    }, 1200);
  };

  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    sounds.playClick();
    if (idx === trivia[triviaIndex].correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setTriviaIndex((prev) => (prev + 1) % trivia.length);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ borderColor: '#f59e0b', maxWidth: 650 }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            color: '#f59e0b',
            padding: 10,
            borderRadius: 12
          }}>
            <Coffee size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Estación de Café & Break DK</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Relájate, prepara una bebida y actualiza tu estado con el equipo
            </p>
          </div>
        </div>

        <div style={{
          background: '#fffbeb',
          border: '2px solid #fcd34d',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
          marginBottom: 20
        }}>
          <Coffee size={40} style={{ color: '#f59e0b', marginBottom: 10 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>Cafetera Expreso DK</h3>
          <p style={{ color: '#92400e', fontSize: '0.85rem', marginBottom: 16 }}>
            Has servido {brewedCount} taza(s) de café el día de hoy ☕
          </p>

          <button
            className={`glass-button ${brewing ? '' : 'primary'}`}
            disabled={brewing}
            onClick={handleBrewCoffee}
            style={{ padding: '12px 24px', background: brewing ? '#78350f' : undefined, color: brewing ? '#ffffff' : undefined }}
          >
            <Sparkles size={18} className={brewing ? 'spin' : ''} />
            <span>{brewing ? 'Preparando Espreso Recién Hecho...' : 'PREPARAR CAFÉ & CAMBIAR ESTADO'}</span>
          </button>
        </div>

        {/* Café Aleatorio: conectar con un compañero al azar (somos 100% remotos) */}
        <div style={{
          background: '#f0fdfa',
          border: '2px solid #5eead4',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} /> Café Aleatorio con un Compañero
            </span>
            <button className="glass-button primary" onClick={handleShuffleCoffee} style={{ fontSize: '0.8rem' }}>
              <Shuffle size={14} />
              <span>Sortear Compañero</span>
            </button>
          </div>

          {!match && (
            <p style={{ fontSize: '0.85rem', color: '#0f766e' }}>
              Somos ~200 personas 100% remotas — casi nadie conoce a todos. Sortea un café virtual de 15 min con alguien del equipo.
            </p>
          )}

          {match?.empty && (
            <p style={{ fontSize: '0.85rem', color: '#0f766e' }}>
              No hay compañeros conectados ahora mismo para emparejar. Intenta de nuevo más tarde.
            </p>
          )}

          {match?.person && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', border: '1px solid #99f6e4', borderRadius: 10, padding: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: match.person.avatar?.shirt || '#0f766e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {match.person.name ? match.person.name.substring(0, 2).toUpperCase() : 'DK'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                  {match.person.name} · <span style={{ fontWeight: 600, color: '#0f766e' }}>{match.person.roleLabel}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: 4 }}>
                  💬 Rompehielos: {match.icebreaker}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Selector */}
        <div style={{ marginBottom: 24 }}>
          <label className="form-label" style={{ marginBottom: 10 }}>Cambiar mi Estado Actual</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st.id}
                className="glass-button"
                style={{
                  borderLeft: `4px solid ${st.color}`,
                  justifyContent: 'center',
                  background: currentStatus === st.id ? 'rgba(0, 198, 189, 0.12)' : undefined
                }}
                onClick={() => {
                  sounds.playClick();
                  onUpdateStatus(st.id, st.label);
                }}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Trivia Game */}
        <div style={{
          background: '#f8fafc',
          border: '2px solid var(--border-glass)',
          borderRadius: 12,
          padding: 18
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> TRIVIA RÁPIDA DE DATOS
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Puntos: {score}</span>
          </div>

          <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
            {trivia[triviaIndex].q}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {trivia[triviaIndex].options.map((opt, idx) => (
              <button
                key={idx}
                className="glass-button"
                style={{
                  fontSize: '0.85rem',
                  justifyContent: 'flex-start',
                  borderColor: selectedAnswer !== null
                    ? idx === trivia[triviaIndex].correct ? '#10b981' : idx === selectedAnswer ? '#ef4444' : undefined
                    : undefined
                }}
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswer(idx)}
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="glass-button primary" onClick={handleNextQuestion} style={{ fontSize: '0.85rem' }}>
                Siguiente Pregunta ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
