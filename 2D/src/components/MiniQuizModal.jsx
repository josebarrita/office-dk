import React, { useState } from 'react';
import { X, Brain, CheckCircle2, XCircle, RefreshCw, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { ROLES_DATA } from '../utils/rolesWorkflowData';
import { pickQuizRound, getQuizBankSize } from '../utils/quizBank';
import { XP_VALUES } from '../utils/questData';
import { sounds } from '../utils/audio';

export const MiniQuizModal = ({
  onClose,
  playerRole,
  seniority,
  masteredIds = [],
  missedIds = [],
  onCorrect,
  onWrong,
  onLearnMore
}) => {
  const role = ROLES_DATA.find((r) => r.clave === playerRole);
  const bankSize = getQuizBankSize(playerRole, seniority);
  const newRound = () => pickQuizRound(playerRole, { mastered: masteredIds, missed: missedIds, seniority });
  // Foto de lo que ya dominaba al empezar la ronda: decide si una respuesta paga XP.
  const [masteredAtStart, setMasteredAtStart] = useState(() => new Set(masteredIds));
  const [questions, setQuestions] = useState(newRound);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newlyMastered, setNewlyMastered] = useState(0);

  const finished = step >= questions.length;
  const current = questions[step];
  const isCorrect = selected !== null && current && selected === current.correctIndex;
  const paysXp = current && !masteredAtStart.has(current.id);

  const handlePick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correctIndex) {
      sounds.playBadge();
      setScore((s) => s + 1);
      if (paysXp) {
        onCorrect?.(current.id);
        setXpEarned((x) => x + XP_VALUES.miniQuiz);
        setNewlyMastered((n) => n + 1);
      }
    } else {
      sounds.playClick();
      onWrong?.(current.id);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    setSelected(null);
    setStep((s) => s + 1);
  };

  const handleNewRound = () => {
    sounds.playClick();
    setMasteredAtStart(new Set(masteredIds));
    setQuestions(newRound());
    setStep(0);
    setSelected(null);
    setScore(0);
    setXpEarned(0);
    setNewlyMastered(0);
  };

  const masteredTotal = Math.min(bankSize, masteredAtStart.size + newlyMastered);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            background: 'linear-gradient(135deg, #00C6BD, #4017AA)',
            color: '#ffffff',
            padding: 11,
            borderRadius: 14,
            display: 'flex',
            boxShadow: '0 10px 24px -8px rgba(64, 23, 170, 0.6)'
          }}>
            <Brain size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Mini-quiz · {role?.nombre || 'Tu rol'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {finished
                ? 'Resultado de la ronda'
                : `Pregunta ${step + 1} de ${questions.length} · +${XP_VALUES.miniQuiz} XP por cada acierto nuevo`}
            </p>
          </div>
        </div>

        {!finished && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {questions.map((q, i) => (
              <div
                key={q.id}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  background: i < step ? '#00C6BD' : i === step ? 'rgba(0,198,189,0.45)' : 'rgba(30,27,75,0.1)'
                }}
              />
            ))}
          </div>
        )}

        {!finished && current && (
          <>
            {current.kind === 'situacion' && (
              <span className="quiz-kind-chip">¿Qué haces si…?</span>
            )}
            <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.45, marginBottom: 14 }}>
              {current.prompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {current.options.map((opt, idx) => {
                const answered = selected !== null;
                const correct = idx === current.correctIndex;
                const picked = idx === selected;
                let border = 'rgba(30,27,75,0.12)';
                let bg = '#ffffff';
                if (answered && correct) { border = '#10b981'; bg = 'rgba(16,185,129,0.08)'; }
                else if (answered && picked) { border = '#ef4444'; bg = 'rgba(239,68,68,0.06)'; }
                return (
                  <button
                    key={idx}
                    onClick={() => handlePick(idx)}
                    disabled={answered}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      textAlign: 'left',
                      padding: '11px 14px',
                      borderRadius: 14,
                      border: `1px solid ${border}`,
                      background: bg,
                      fontFamily: 'inherit',
                      fontSize: '0.88rem',
                      lineHeight: 1.4,
                      color: 'var(--ink)',
                      cursor: answered ? 'default' : 'pointer',
                      transition: 'border-color 0.15s ease, background 0.15s ease'
                    }}
                  >
                    {answered && correct && <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />}
                    {answered && picked && !correct && <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div style={{
                background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(249,115,22,0.35)'}`,
                borderRadius: 14,
                padding: '11px 14px',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                marginBottom: 16
              }}>
                <strong>{isCorrect ? '¡Correcto! ' : 'Casi. '}</strong>
                {current.explain}
                {isCorrect && (
                  <div style={{ marginTop: 6, fontWeight: 700, color: paysXp ? '#047857' : 'var(--text-muted)' }}>
                    {paysXp ? `+${XP_VALUES.miniQuiz} XP` : 'Ya la dominabas · repaso sin XP'}
                  </div>
                )}
                {!isCorrect && (
                  <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                    Esta pregunta volverá en tu próxima ronda para que la repases.
                  </div>
                )}
                {!isCorrect && current.learnMore && onLearnMore && (
                  <button
                    className="glass-button"
                    style={{ marginTop: 10, fontSize: '0.8rem' }}
                    onClick={() => { sounds.playClick(); onLearnMore(current.learnMore); }}
                  >
                    <BookOpen size={14} />
                    <span>Aprende más en el manual</span>
                  </button>
                )}
              </div>
            )}

            <button
              className="glass-button primary"
              style={{ width: '100%', justifyContent: 'center', opacity: selected === null ? 0.5 : 1 }}
              disabled={selected === null}
              onClick={handleNext}
            >
              {step + 1 === questions.length ? 'Ver resultado' : 'Siguiente pregunta'}
            </button>
          </>
        )}

        {finished && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {score} / {questions.length}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>respuestas correctas</p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', borderRadius: 999, padding: '6px 14px', fontWeight: 700, fontSize: '0.85rem' }}>
                +{xpEarned} XP en esta ronda
              </div>
              <div style={{ background: 'rgba(64,23,170,0.08)', color: '#4017AA', borderRadius: 999, padding: '6px 14px', fontWeight: 700, fontSize: '0.85rem' }}>
                Dominas {masteredTotal} de {bankSize} preguntas de tu rol
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="glass-button" onClick={onClose}>Cerrar</button>
              <button className="glass-button primary" onClick={handleNewRound}>
                {masteredTotal >= bankSize ? <Sparkles size={15} /> : <RefreshCw size={15} />}
                <span>{masteredTotal >= bankSize ? 'Repasar' : 'Otra ronda'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Llamado para abrir el mini-quiz desde los modales donde se aprende sobre el rol.
export const QuizCallout = ({ onOpenQuiz, text = 'Pon a prueba lo que aprendiste sobre tus responsabilidades' }) => (
  <button
    className="quiz-callout"
    onClick={(e) => {
      e.stopPropagation();
      sounds.playClick();
      onOpenQuiz();
    }}
  >
    <span className="quiz-callout-icon"><Brain size={18} /></span>
    <span className="quiz-callout-text">
      <strong>{text}</strong>
      <span>Mini-quiz de 3 preguntas · +{XP_VALUES.miniQuiz} XP por cada acierto nuevo</span>
    </span>
    <ChevronRight size={18} />
  </button>
);
