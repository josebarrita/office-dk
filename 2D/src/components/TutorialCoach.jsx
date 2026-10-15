import React, { useState } from 'react';
import { Footprints, MousePointerClick, Map, Target } from 'lucide-react';
import { sounds } from '../utils/audio';

const STEPS = [
  {
    icon: Footprints,
    title: 'Muévete por la oficina',
    text: 'Usa las teclas WASD o las flechas. También puedes hacer clic en el piso para caminar hasta ahí.',
    keys: ['W', 'A', 'S', 'D']
  },
  {
    icon: MousePointerClick,
    title: 'Interactúa con todo',
    text: 'Cuando estés cerca de una pizarra, un escritorio o un compañero, aparecerá una tecla E. Presiónala para abrirlo o conversar.',
    keys: ['E']
  },
  {
    icon: Map,
    title: 'Mira el mapa completo',
    text: 'Presiona M para ver toda la oficina y la rueda del mouse para acercar o alejar.',
    keys: ['M']
  },
  {
    icon: Target,
    title: 'Sigue tu misión',
    text: 'Arriba a la izquierda tienes tu misión y una brújula hacia el siguiente objetivo. Arriba a la derecha, tu progreso e insignias.',
    keys: []
  }
];

export const TutorialCoach = ({ playerName, onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const current = STEPS[stepIndex];
  const Icon = current.icon;
  const isLast = stepIndex === STEPS.length - 1;

  const next = () => {
    sounds.playClick();
    if (isLast) onFinish();
    else setStepIndex((i) => i + 1);
  };

  return (
    <div className="tutorial-coach" role="dialog" aria-label="Tutorial de controles">
      <div className="tutorial-head">
        <span className="tutorial-icon"><Icon size={20} /></span>
        <div>
          {stepIndex === 0 && <div className="tutorial-welcome">¡Bienvenido, {playerName?.split(' ')[0] || 'colaborador'}!</div>}
          <div className="tutorial-title">{current.title}</div>
        </div>
      </div>
      <p className="tutorial-text">{current.text}</p>
      {current.keys.length > 0 && (
        <div className="tutorial-keys">
          {current.keys.map((k) => <kbd key={k}>{k}</kbd>)}
        </div>
      )}
      <div className="tutorial-foot">
        <div className="tutorial-dots">
          {STEPS.map((_, i) => <span key={i} className={i === stepIndex ? 'active' : ''} />)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isLast && (
            <button className="glass-button" onClick={() => { sounds.playClick(); onFinish(); }}>Saltar</button>
          )}
          <button className="glass-button primary" onClick={next}>{isLast ? '¡A jugar!' : 'Siguiente'}</button>
        </div>
      </div>
    </div>
  );
};
