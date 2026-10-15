import React, { useRef, useState } from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { XP_VALUES } from '../utils/questData';
import { sounds } from '../utils/audio';

const shuffledOrder = (n) => {
  const order = [...Array(n).keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

// `entry` viene de pickNpcDialogue: { dialogue, index, total, isNew }.
export const NpcDialogueModal = ({ onClose, bot, entry, isColleague, onAnswered }) => {
  const dialogue = entry?.dialogue;
  // Mezcla fija durante la conversación: la respuesta correcta no siempre va primero.
  const [order] = useState(() => shuffledOrder(dialogue?.options.length || 0));
  const [selected, setSelected] = useState(null);
  const answeredRef = useRef(false);

  if (!dialogue) return null;

  const handleAnswer = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const correct = optionIndex === dialogue.correctIndex;
    if (correct) sounds.playBadge(); else sounds.playClick();
    if (!answeredRef.current) {
      answeredRef.current = true;
      onAnswered?.(correct);
    }
  };

  const shirtColor = bot?.avatar?.shirt || '#4017AA';
  const isCorrect = selected === dialogue.correctIndex;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${shirtColor}, #1e1b4b)`,
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            flexShrink: 0
          }}>
            {bot?.name ? bot.name.substring(0, 2).toUpperCase() : 'DK'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{bot?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {bot?.roleLabel} · Conversación {entry.index + 1} de {entry.total}
            </p>
          </div>
        </div>

        <div style={{
          background: '#f7f7fb',
          border: '1px solid var(--stroke)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          gap: 10
        }}>
          <MessageCircle size={18} style={{ color: shirtColor, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
            {isColleague && <strong>¡Somos de la misma especialidad! </strong>}
            {dialogue.greeting}
          </p>
        </div>

        <p style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 10 }}>{dialogue.question}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {order.map((optionIndex) => {
            const answered = selected !== null;
            const correct = optionIndex === dialogue.correctIndex;
            const picked = optionIndex === selected;
            let border = 'rgba(30,27,75,0.12)';
            let bg = '#ffffff';
            if (answered && correct) { border = '#10b981'; bg = 'rgba(16,185,129,0.08)'; }
            else if (answered && picked) { border = '#ef4444'; bg = 'rgba(239,68,68,0.06)'; }
            return (
              <button
                key={optionIndex}
                onClick={() => handleAnswer(optionIndex)}
                disabled={answered}
                style={{
                  textAlign: 'left',
                  padding: '11px 14px',
                  borderRadius: 14,
                  border: `1px solid ${border}`,
                  background: bg,
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  lineHeight: 1.4,
                  color: 'var(--ink)',
                  cursor: answered ? 'default' : 'pointer'
                }}
              >
                {dialogue.options[optionIndex]}
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
            fontSize: '0.85rem',
            lineHeight: 1.5,
            marginBottom: 16
          }}>
            {isCorrect ? dialogue.feedbackCorrect : dialogue.feedbackWrong}
            <div style={{ marginTop: 6, fontWeight: 700, color: entry.isNew ? '#047857' : 'var(--text-muted)' }}>
              {entry.isNew
                ? `+${XP_VALUES.npcTalk} XP por la conversación`
                : `Ya conversaron sobre esto · ${bot?.name?.split(' ')[0]} no tiene temas nuevos por ahora`}
            </div>
          </div>
        )}

        <button className="glass-button primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          <Sparkles size={14} />
          <span>Seguir explorando</span>
        </button>
      </div>
    </div>
  );
};
