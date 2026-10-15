import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Target, ChevronDown, ChevronUp, Navigation, CheckCircle2, Circle, PartyPopper, Brain, Play, Award } from 'lucide-react';
import { ROOMS, INTERACTIVE_OBJECTS } from '../utils/officeData';
import { ROOM_IDS, CORE_NPC_IDS, AM_NPC_IDS, getQuestStatus, XP_VALUES } from '../utils/questData';
import { buildRoleQuizBank } from '../utils/quizBank';
import { sounds } from '../utils/audio';

const nearestBot = (player, users, ids, exclude = []) =>
  (users || [])
    .filter((u) => ids.includes(u.id) && !exclude.includes(u.id) && u.x !== undefined)
    .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];

export const QuestTrackerHUD = ({ player, otherUsers, onOpenRaci, onOpenQuiz, onOpenSimulator, onOpenCareer }) => {
  const [collapsed, setCollapsed] = useState(false);
  // El chat se ubica debajo de este panel: publica dónde termina en --hud-b.
  const hudRef = useRef(null);
  useEffect(() => {
    const el = hudRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      root.style.setProperty('--hud-b', `${Math.round(el.getBoundingClientRect().bottom)}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--hud-b');
    };
  }, []);
  const bankIds = useMemo(
    () => buildRoleQuizBank(player?.role, player?.seniority).map((q) => q.id),
    [player?.role, player?.seniority]
  );
  if (!player) return null;

  const progress = player.progress;
  const { quest, steps, doneCount, total, currentStep, allDone } = getQuestStatus(progress);
  const mastered = progress?.quizCorrectIds || [];
  const quizTotal = bankIds.length;
  const quizDone = bankIds.filter((id) => mastered.includes(id)).length;

  // Objetivo del paso actual: una flecha si vive en el mapa, o un botón directo si no.
  let target = null;
  let targetLabel = '';
  let action = null;
  switch (currentStep?.id) {
    case 'desk': {
      const desk = INTERACTIVE_OBJECTS.find((o) => o.type === 'desk' && o.role === player.role);
      if (desk) { target = { x: desk.x + desk.width / 2, y: desk.y + desk.height / 2 }; targetLabel = desk.title; }
      break;
    }
    case 'rooms': {
      const visited = progress?.visitedRooms || [];
      const room = ROOMS.find((r) => r.id === ROOM_IDS.find((id) => !visited.includes(id)));
      if (room) { target = { x: room.x + room.width / 2, y: room.y + room.height / 2 }; targetLabel = room.name; }
      break;
    }
    case 'npcs': {
      const bot = nearestBot(player, otherUsers, CORE_NPC_IDS, progress?.talkedToNpcs || []);
      if (bot) { target = { x: bot.x, y: bot.y }; targetLabel = bot.name; }
      break;
    }
    case 'w_ceremonias': {
      const bot = nearestBot(player, otherUsers, AM_NPC_IDS);
      if (bot) { target = { x: bot.x, y: bot.y }; targetLabel = `${bot.name} (Agile Manager)`; }
      break;
    }
    case 'raci':
      action = { label: 'Abrir Reto RACI', icon: Target, onClick: onOpenRaci };
      break;
    case 'w_simulador':
      action = { label: 'Abrir el Simulador', icon: Play, onClick: onOpenSimulator };
      break;
    case 'w_quiz':
    case 'w_situaciones':
      action = { label: 'Abrir el mini-quiz', icon: Brain, onClick: onOpenQuiz };
      break;
    case 'w_carrera':
      action = { label: 'Abrir Manual de Seniority', icon: Award, onClick: () => onOpenCareer?.() };
      break;
    default:
      break;
  }

  let angleDeg = null;
  if (target && player.x !== undefined) {
    angleDeg = (Math.atan2(target.y - player.y, target.x - player.x) * 180) / Math.PI + 90;
  }

  const toggle = () => {
    sounds.playClick();
    setCollapsed((c) => !c);
  };

  return (
    <div ref={hudRef} className="quest-hud">
      <div className="quest-hud-header" onClick={toggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {allDone ? <PartyPopper size={16} style={{ color: '#f59e0b' }} /> : <Target size={16} style={{ color: '#4017AA' }} />}
          <span>{allDone ? '¡Misiones completadas!' : quest.title}</span>
          <span className="quest-hud-count">{doneCount}/{total}</span>
        </div>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {!collapsed && (
        <div className="quest-hud-body">
          {steps.map((step) => (
            <div key={step.id} className={`quest-step ${step.done ? 'done' : ''} ${currentStep?.id === step.id ? 'active' : ''}`}>
              {step.done ? <CheckCircle2 size={16} className="quest-step-icon done" /> : <Circle size={16} className="quest-step-icon" />}
              <div>
                <div className="quest-step-title">{step.title}</div>
                {currentStep?.id === step.id && <div className="quest-step-desc">{step.desc}</div>}
              </div>
            </div>
          ))}

          {currentStep && (action || target) && (
            <div className="quest-hud-objective">
              {action ? (
                <button
                  className="glass-button primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                  onClick={() => { sounds.playClick(); action.onClick?.(); }}
                >
                  <action.icon size={14} />
                  <span>{action.label}</span>
                </button>
              ) : (
                <div className="quest-compass">
                  <Navigation size={20} style={{ color: '#00C6BD', transform: `rotate(${angleDeg}deg)`, flexShrink: 0 }} />
                  <span>Ve a: <strong>{targetLabel}</strong></span>
                </div>
              )}
            </div>
          )}

          {allDone && (
            <div className="quest-hud-objective" style={{ color: '#b45309', fontWeight: 600 }}>
              🏅 Completaste tu onboarding. Sigue sumando insignias y dominando tu rol en "Mi progreso".
            </div>
          )}

          {onOpenQuiz && quizTotal > 0 && (
            <button className="quest-quiz" onClick={() => { sounds.playClick(); onOpenQuiz(); }}>
              <Brain size={18} className="quest-quiz-icon" />
              <span className="quest-quiz-text">
                <strong>Mini-quiz de tu rol</strong>
                <span>{quizDone}/{quizTotal} dominadas · +{XP_VALUES.miniQuiz} XP c/u</span>
              </span>
              <span className="quest-quiz-bar">
                <span style={{ width: `${Math.round((quizDone / quizTotal) * 100)}%` }} />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
