import React, { useState } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

// Fortunas del Cerezo: mezcla de cultura DK y micro-datos sobre los roles.
const FORTUNES = [
  { icon: '🌸', text: 'En DataKnow los datos correctos llegan al lugar correcto gracias al Data Engineer. Hoy, agradécele a uno.' },
  { icon: '🧪', text: 'Un modelo sin Quality Gates es solo una corazonada con GPU. El QA es quien lo vuelve confiable.' },
  { icon: '📊', text: 'Un dashboard que nadie entiende no es analítica, es arte abstracto. El Analista BI traduce datos en decisiones.' },
  { icon: '🚀', text: 'Si el modelo funciona en tu máquina pero no en producción, aún no funciona. Por eso existe MLOps.' },
  { icon: '🏃', text: 'El Agile Manager no corre más rápido que nadie: hace que todo el equipo corra en la misma dirección.' },
  { icon: '🧠', text: 'El Científico de Datos convierte preguntas de negocio en modelos. La mejor pregunta vale más que el mejor algoritmo.' },
  { icon: '🤝', text: 'La matriz RACI no es burocracia: es saber a quién preguntarle sin dar tres vueltas por Teams.' },
  { icon: '☕', text: 'Ningún pipeline se ha caído por tomarse un café. Los breaks también son parte de la metodología.' },
  { icon: '🌱', text: 'De Junior a Specialist Lead no se sube por antigüedad, se sube por impacto. Revisa tu ruta en el Manual de Seniority.' },
  { icon: '🔁', text: 'Todo entregable en DK tiene un origen y un destino entre roles. Si no sabes de quién recibes o a quién entregas, visita el Hub de Flujos.' }
];

export const CherryTreeModal = ({ onClose, player }) => {
  const [fortuneIndex, setFortuneIndex] = useState(() => Math.floor(Math.random() * FORTUNES.length));

  const handleShake = () => {
    sounds.playBadge();
    setFortuneIndex((prev) => {
      let next = Math.floor(Math.random() * FORTUNES.length);
      if (next === prev) next = (next + 1) % FORTUNES.length;
      return next;
    });
  };

  const fortune = FORTUNES[fortuneIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 520, borderColor: '#ec4899', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ fontSize: '3.4rem', lineHeight: 1, marginBottom: 8 }}>🌸</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899', marginBottom: 4 }}>
          El Cerezo Sagrado DK
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
          {player?.name ? `${player.name.split(' ')[0]}, el` : 'El'} cerezo deja caer un pétalo con un mensaje para ti…
        </p>

        <div
          style={{
            background: '#fdf2f8',
            border: '2px solid #f9a8d4',
            borderRadius: 16,
            padding: '22px 24px',
            marginBottom: 20
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{fortune.icon}</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.55 }}>
            {fortune.text}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="glass-button primary" onClick={handleShake}>
            <RefreshCw size={16} />
            <span>Sacudir el Cerezo</span>
          </button>
          <button className="glass-button" onClick={onClose}>
            <Sparkles size={16} style={{ color: '#ec4899' }} />
            <span>Seguir Explorando</span>
          </button>
        </div>
      </div>
    </div>
  );
};
