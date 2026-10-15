import React, { useRef, useState } from 'react';
import { X, Target, Award, RefreshCw } from 'lucide-react';
import { RACI_DATA, ROLES_DATA } from '../utils/rolesWorkflowData';
import { RACI_OPTIONS, raciBucket } from '../utils/questData';
import { sounds } from '../utils/audio';

const QUESTIONS_PER_ROUND = 5;
const PASS_THRESHOLD = 3;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const roleLabelFor = (roleKey) => {
  if (roleKey === 'agile') return 'Agile Manager';
  return ROLES_DATA.find((r) => r.clave === roleKey)?.nombre || roleKey;
};

export const RaciChallengeModal = ({ onClose, playerRole, onFinish }) => {
  const roleKey = playerRole || 'de';
  const roleLabel = roleLabelFor(roleKey);
  const [questions] = useState(() => shuffle(RACI_DATA).slice(0, QUESTIONS_PER_ROUND));
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const finishedRef = useRef(false);

  const finished = step >= questions.length;
  const current = !finished ? questions[step] : null;
  const correctKey = current ? raciBucket(current[roleKey]) : null;

  if (finished && !finishedRef.current) {
    finishedRef.current = true;
    onFinish?.(score, questions.length);
  }

  const handlePick = (key) => {
    if (selected !== null) return;
    setSelected(key);
    sounds.playClick();
    if (key === correctKey) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    setSelected(null);
    setStep((s) => s + 1);
  };

  const passed = score >= PASS_THRESHOLD;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 560, borderColor: '#3b82f6' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid #3b82f6',
            color: '#3b82f6',
            padding: 12,
            borderRadius: 14
          }}>
            <Target size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Reto RACI · {roleLabel}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {finished ? 'Resultado final' : `Pregunta ${step + 1} de ${questions.length}`}
            </p>
          </div>
        </div>

        {!finished && current && (
          <>
            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Actividad del proyecto
              </div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>{current.actividad}</p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: 8 }}>
                ¿Cuál es tu responsabilidad como <strong>{roleLabel}</strong> en esta actividad?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: selected !== null ? 14 : 0 }}>
              {RACI_OPTIONS.map((opt) => {
                const isCorrect = opt.key === correctKey;
                const isPicked = opt.key === selected;
                let borderColor;
                if (selected !== null) borderColor = isCorrect ? '#10b981' : (isPicked ? '#ef4444' : undefined);
                return (
                  <button
                    key={opt.key}
                    className="glass-button"
                    disabled={selected !== null}
                    onClick={() => handlePick(opt.key)}
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderColor,
                      background: selected !== null && isCorrect ? 'rgba(16, 185, 129, 0.1)' : undefined
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{opt.label}</span>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: 6 }}>— {opt.hint}</span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div style={{
                background: selected === correctKey ? '#f0fdf4' : '#fff7ed',
                border: `2px solid ${selected === correctKey ? '#10b981' : '#f97316'}`,
                borderRadius: 12,
                padding: 14,
                fontSize: '0.85rem',
                color: 'var(--text-dark)',
                marginBottom: 16
              }}>
                {selected === correctKey ? (
                  <><strong>¡Correcto!</strong> +25 XP</>
                ) : (
                  <>La respuesta correcta era <strong>{RACI_OPTIONS.find((o) => o.key === correctKey)?.label}</strong>.</>
                )}
              </div>
            )}

            <button
              className="glass-button primary"
              style={{ width: '100%', justifyContent: 'center', opacity: selected === null ? 0.5 : 1 }}
              disabled={selected === null}
              onClick={handleNext}
            >
              <span>{step + 1 === questions.length ? 'Ver resultado' : 'Siguiente pregunta ➔'}</span>
            </button>
          </>
        )}

        {finished && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              margin: '0 auto 14px',
              borderRadius: '50%',
              background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)',
              border: `3px solid ${passed ? '#10b981' : '#f97316'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={32} style={{ color: passed ? '#10b981' : '#f97316' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>
              {score} / {questions.length} correctas
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 18 }}>
              {passed
                ? '¡Aprobaste el reto de tu rol! Misión "Tu Primer Día en DK" completada.'
                : `Necesitas al menos ${PASS_THRESHOLD} correctas para aprobar. Vuelve a intentarlo.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {!passed && (
                <button className="glass-button primary" onClick={() => { sounds.playClick(); onClose(); }}>
                  <RefreshCw size={14} />
                  <span>Reintentar más tarde</span>
                </button>
              )}
              {passed && (
                <button className="glass-button primary" onClick={onClose}>
                  <span>¡Genial!</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
