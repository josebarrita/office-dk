import React, { useState, useEffect, useRef } from 'react';
import { AuthModal } from './components/AuthModal';
import { OfficeCanvas2D } from './components/OfficeCanvas2D';
import { ProgressPanel } from './components/ProgressPanel';
import { XpToasts } from './components/XpToasts';
import { TutorialCoach } from './components/TutorialCoach';
import { OpenTablesModal } from './components/OpenTablesModal';
import { CoffeeCornerModal } from './components/CoffeeCornerModal';
import { ProjectWorkflowModal } from './components/ProjectWorkflowModal';
import { RoleCareerGuideModal } from './components/RoleCareerGuideModal';
import { ProjectSimulatorModal } from './components/ProjectSimulatorModal';
import { RoleUnderstandingModal } from './components/RoleUnderstandingModal';
import { CherryTreeModal } from './components/CherryTreeModal';
import { DeskProjectsModal } from './components/DeskProjectsModal';
import { NetworkGraphModal } from './components/NetworkGraphModal';
import { NpcDialogueModal } from './components/NpcDialogueModal';
import { RaciChallengeModal } from './components/RaciChallengeModal';
import { MiniQuizModal } from './components/MiniQuizModal';
import { QuestTrackerHUD } from './components/QuestTrackerHUD';
import { ChatOverlay } from './components/ChatOverlay';
import { UserBar } from './components/UserBar';
import { DirectoryModal } from './components/DirectoryModal';
import { INITIAL_BOTS } from './utils/officeData';
import { getCompanySeniority } from './utils/rolesWorkflowData';
import { createDefaultProgress, migrateProgress, XP_VALUES } from './utils/questData';
import { applyProgressRules } from './utils/progressRules';
import { pickNpcDialogue } from './utils/npcDialogues';
import { sounds } from './utils/audio';

export function App() {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('dk_office_player_2d');
    if (!saved) return null;
    const parsed = migrateProgress(JSON.parse(saved));
    // El nivel siempre se toma del directorio de la empresa, no de lo guardado.
    return { ...parsed, seniority: getCompanySeniority(parsed.email) };
  });

  const [otherUsers, setOtherUsers] = useState(INITIAL_BOTS);
  const [activeModal, setActiveModal] = useState(null);
  const [deskRoleFilter, setDeskRoleFilter] = useState(null);
  const [npcDialogueState, setNpcDialogueState] = useState(null); // { botId, entry }
  const [careerInitial, setCareerInitial] = useState(null); // { role, level }
  const [workflowTab, setWorkflowTab] = useState('flows');
  const [activePrompt, setActivePrompt] = useState(null);
  const [messages, setMessages] = useState([
    {
      senderName: 'Sistema DataKnow 2D',
      senderRole: 'Oficina Virtual 2D',
      text: '¡Bienvenido a la Oficina Virtual 2D de DataKnow! Usa WASD / Flechas o Click para explorar.',
      channel: 'global',
      timestamp: '11:00 AM'
    }
  ]);

  const channelRef = useRef(null);

  // Sync across tabs using BroadcastChannel for multiplayer
  useEffect(() => {
    if (!player) return;

    try {
      const bc = new BroadcastChannel('dk_virtual_office_2d');
      channelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'USER_MOVE') {
          setOtherUsers((prev) => {
            const exists = prev.some((u) => u.id === payload.id);
            if (exists) {
              return prev.map((u) => (u.id === payload.id ? { ...u, ...payload } : u));
            }
            return [...prev, payload];
          });
        } else if (type === 'CHAT_MESSAGE') {
          setMessages((prev) => [...prev, payload]);
        } else if (type === 'PING_USERS') {
          bc.postMessage({
            type: 'USER_MOVE',
            payload: { ...player, x: player.x || 1390, y: player.y || 460 }
          });
        }
      };

      // Broadcast self to existing tabs
      bc.postMessage({
        type: 'USER_MOVE',
        payload: { ...player, x: player.x || 1390, y: player.y || 460 }
      });
      bc.postMessage({ type: 'PING_USERS' });
    } catch (e) {
      console.warn('BroadcastChannel not supported or restricted');
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [player]);

  // Bot AI Movement & Autonomous Chat Loop (2D Coordinates)
  useEffect(() => {
    if (!player) return;

    const botPhrases = [
      { botId: 'bot_sofia', text: '¡Terminando de compilar el pipeline de telemetría en el servidor! 🛠️' },
      { botId: 'bot_mateo', text: 'El modelo de Inteligencia Artificial tiene 96% de precisión en pruebas 🧪' },
      { botId: 'bot_camila', text: 'Los tableros de PowerBI ya están listos para la revisión de junta 📊' },
      { botId: 'bot_lucas', text: 'Cluster Kubernetes funcionando sin latencia en MLOps 🚀' },
      { botId: 'bot_valentina', text: 'Pruebas automatizadas QA completadas sin errores 🔍' },
      { botId: 'bot_carlos', text: '¡Excelente avance de todos en el sprint de esta semana! 🏃' },
      { botId: 'bot_sofia', text: 'Un break para preparar un espresso en la estación ☕' },
      { botId: 'bot_mateo', text: '¿Alguien necesita apoyo con la matriz RACI del proyecto?' }
    ];

    // Move bots smoothly towards 2D waypoints
    const botMoveInterval = setInterval(() => {
      setOtherUsers((prevUsers) => {
        return prevUsers.map((u) => {
          if (!u.isBot) return u;

          const waypoints = u.waypoints || [{ x: 1390, y: 340 }];
          const currentIndex = u.waypointIndex || 0;
          const targetWp = waypoints[currentIndex];

          const dx = targetWp.x - u.x;
          const dy = targetWp.y - u.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 15) {
            // Reached waypoint: wait then cycle to next
            if (!u.waitTimer || u.waitTimer <= 0) {
              const nextIndex = (currentIndex + 1) % waypoints.length;
              return {
                ...u,
                waypointIndex: nextIndex,
                waitTimer: Math.floor(Math.random() * 35) + 20
              };
            } else {
              return { ...u, waitTimer: u.waitTimer - 1 };
            }
          }

          // Step towards target waypoint
          const speed = 4.8;
          const nextX = u.x + (dx / dist) * speed;
          const nextY = u.y + (dy / dist) * speed;

          return {
            ...u,
            x: nextX,
            y: nextY
          };
        });
      });
    }, 100);

    // Periodically post bot chat messages
    const botChatInterval = setInterval(() => {
      const phrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
      setOtherUsers((prevUsers) => {
        const bot = prevUsers.find((b) => b.id === phrase.botId);
        if (bot) {
          const newMsg = {
            senderId: bot.id,
            senderName: bot.name,
            senderRole: bot.roleLabel,
            text: phrase.text,
            channel: 'global',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((m) => [...m, newMsg]);
        }
        return prevUsers;
      });
    }, 18000);

    return () => {
      clearInterval(botMoveInterval);
      clearInterval(botChatInterval);
    };
  }, [player]);

  // Cerrar cualquier modal con Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogin = (userProfile) => {
    const initialUser = {
      ...userProfile,
      seniority: getCompanySeniority(userProfile.email),
      x: 1390,
      y: 460,
      direction: 'down',
      progress: createDefaultProgress()
    };
    setPlayer(initialUser);
    localStorage.setItem('dk_office_player_2d', JSON.stringify(initialUser));
    sounds.playBadge();
  };

  const handleLogout = () => {
    sounds.playClick();
    setPlayer(null);
    localStorage.removeItem('dk_office_player_2d');
  };

  const handleUpdatePlayerPosition = (x, y, direction) => {
    if (!player) return;
    const updated = { ...player, x, y, direction };
    setPlayer(updated);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'USER_MOVE',
        payload: updated
      });
    }
  };

  const handleUpdateStatus = (statusId, statusLabel) => {
    if (!player) return;
    const updated = { ...player, status: statusId, statusLabel };
    setPlayer(updated);
    localStorage.setItem('dk_office_player_2d', JSON.stringify(updated));

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'USER_MOVE',
        payload: updated
      });
    }
  };

  const handleSendMessage = (text, channel) => {
    if (!player) return;

    const newMsg = {
      senderId: player.id,
      senderName: player.name,
      senderRole: player.roleLabel,
      text,
      channel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderPos: { x: player.x, y: player.y }
    };

    setPlayer((prev) => ({ ...prev, chatMessage: text }));
    setTimeout(() => {
      setPlayer((prev) => (prev ? { ...prev, chatMessage: null } : prev));
    }, 5000);

    setMessages((prev) => [...prev, newMsg]);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'CHAT_MESSAGE',
        payload: newMsg
      });
    }
  };

  const handleInteractObject = (obj) => {
    sounds.playClick();
    if (obj.type === 'project_workflows') {
      openWorkflows('flows');
    } else if (obj.type === 'career_guide') {
      openCareer();
    } else if (obj.type === 'project_simulator') {
      setActiveModal('project_simulator');
    } else if (obj.type === 'open_tables') {
      setActiveModal('open_tables');
    } else if (obj.type === 'coffee_machine') {
      setActiveModal('coffee_machine');
    } else if (obj.type === 'desk') {
      setDeskRoleFilter(obj.role);
      setActiveModal('desk_projects');
      if (obj.role === player.role) {
        updateProgress((p) => { p.deskVisited = true; return p; });
      }
    } else if (obj.type === 'role_understanding') {
      setActiveModal('role_understanding');
    } else if (obj.type === 'fountain') {
      setActiveModal('cherry_tree');
    } else if (obj.type === 'npc_dialogue') {
      const entry = pickNpcDialogue(obj.botId, player.progress?.npcAnswered || []);
      if (!entry) return;
      setNpcDialogueState({ botId: obj.botId, entry });
      setActiveModal('npc_dialogue');
    }
  };


  // Guarda y difunde cualquier cambio del jugador que no sea su posición.
  const updatePlayer = (mutate) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = mutate(prev);
      localStorage.setItem('dk_office_player_2d', JSON.stringify(updated));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'USER_MOVE', payload: updated });
      }
      return updated;
    });
  };

  // Único punto donde se muta `progress`: aplica el cambio y luego las reglas
  // (XP de pasos de misión, insignias y accesorios desbloqueados).
  const updateProgress = (mutate) => {
    updatePlayer((prev) => {
      const changed = mutate({ ...createDefaultProgress(), ...prev.progress });
      const { progress, avatar, newBadges } = applyProgressRules(prev, changed);
      if (newBadges.length > 0) sounds.playBadge();
      return { ...prev, progress, avatar };
    });
  };

  const handleEquipAccessory = (accessory) => {
    updatePlayer((prev) => {
      if (accessory && !(prev.progress?.unlockedAccessories || []).includes(accessory)) return prev;
      return { ...prev, avatar: { ...prev.avatar, accessory } };
    });
  };

  // El simulador paga XP una vez por proyecto y hito.
  const handleSimDecision = ({ key, correct }) => {
    updateProgress((p) => {
      if (correct && !p.simRewarded.includes(key)) {
        p.simRewarded = [...p.simRewarded, key];
        p.xp += XP_VALUES.simDecision;
      }
      return p;
    });
  };

  const handleSimComplete = ({ projectId, perfect }) => {
    updateProgress((p) => {
      if (!p.simCompletedProjects.includes(projectId)) p.simCompletedProjects = [...p.simCompletedProjects, projectId];
      if (perfect) p.simPerfect = true;
      return p;
    });
  };

  const openCareer = (level) => {
    setCareerInitial({ role: player.role, level: level || player.seniority || 'Junior' });
    setActiveModal('career_guide');
  };

  const openWorkflows = (tab = 'flows') => {
    setWorkflowTab(tab);
    setActiveModal('project_workflows');
  };

  const handleCareerViewed = () => {
    updateProgress((p) => { p.careerViewed = true; return p; });
  };

  const handleLearnMore = (target) => {
    if (target.modal === 'career_guide') openCareer(target.level);
    else if (target.modal === 'project_workflows') openWorkflows(target.tab);
    else setActiveModal(target.modal);
  };

  const handleTutorialDone = () => {
    updateProgress((p) => { p.tutorialDone = true; return p; });
  };

  const handleRoomEnter = (roomId) => {
    updateProgress((p) => {
      if (!(p.visitedRooms || []).includes(roomId)) p.visitedRooms = [...(p.visitedRooms || []), roomId];
      return p;
    });
  };

  const handleFirstReadRole = () => {
    updateProgress((p) => {
      if (!p.readRoleInfographic) {
        p.readRoleInfographic = true;
        p.xp = (p.xp || 0) + XP_VALUES.readRole;
      }
      return p;
    });
  };

  // Cada conversación nueva con un compañero da XP una sola vez.
  const handleNpcTalk = (botId, entry) => {
    updateProgress((p) => {
      if (!p.talkedToNpcs.includes(botId)) p.talkedToNpcs = [...p.talkedToNpcs, botId];
      if (entry.isNew && !p.npcAnswered.includes(entry.id)) {
        p.npcAnswered = [...p.npcAnswered, entry.id];
        p.xp += XP_VALUES.npcTalk;
      }
      return p;
    });
  };

  // Mini-quiz de responsabilidades: cada pregunta paga XP solo la primera vez que se acierta.
  const handleMiniQuizCorrect = (questionId) => {
    updateProgress((p) => {
      if (!p.quizCorrectIds.includes(questionId)) {
        p.quizCorrectIds = [...p.quizCorrectIds, questionId];
        p.xp += XP_VALUES.miniQuiz;
      }
      p.quizMissedIds = p.quizMissedIds.filter((id) => id !== questionId);
      return p;
    });
  };

  // Las falladas vuelven primero en la siguiente ronda.
  const handleMiniQuizWrong = (questionId) => {
    updateProgress((p) => {
      if (!p.quizMissedIds.includes(questionId)) p.quizMissedIds = [...p.quizMissedIds, questionId];
      return p;
    });
  };

  const openMiniQuiz = () => setActiveModal('mini_quiz');

  const handleRaciResult = (score) => {
    updateProgress((p) => {
      const isFirstPass = !p.raciPassed && score >= 3;
      p.raciBestScore = Math.max(p.raciBestScore || 0, score);
      if (score >= 3) p.raciPassed = true;
      // El +25 XP por respuesta correcta que promete el modal solo se paga en el
      // intento que aprueba por primera vez, para no poder reintentar y farmear XP.
      if (isFirstPass) p.xp = (p.xp || 0) + score * XP_VALUES.quizCorrect;
      return p;
    });
  };

  const handleTeleportToUser = (x, y) => {
    if (!player) return;
    sounds.playBadge();
    handleUpdatePlayerPosition(x, y, 'down');
  };

  if (!player) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const allUsersList = [player, ...otherUsers];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 2D Canvas Engine */}
      <OfficeCanvas2D
        player={player}
        otherUsers={otherUsers}
        onUpdatePlayerPosition={handleUpdatePlayerPosition}
        onInteractObject={handleInteractObject}
        onRoomEnter={handleRoomEnter}
        activePrompt={activePrompt}
        setActivePrompt={setActivePrompt}
      />

      {/* Arriba a la derecha: progreso, insignias, armario y quién está en la oficina */}
      <ProgressPanel
        player={player}
        users={otherUsers}
        onEquipAccessory={handleEquipAccessory}
        onOpenCareer={openCareer}
      />

      <XpToasts progress={player.progress} />

      {!player.progress?.tutorialDone && (
        <TutorialCoach playerName={player.name} onFinish={handleTutorialDone} />
      )}

      {/* Quest Tracker: guía "Tu Primer Día en DK" */}
      <QuestTrackerHUD
        player={player}
        otherUsers={otherUsers}
        onOpenRaci={() => setActiveModal('raci_challenge')}
        onOpenQuiz={openMiniQuiz}
        onOpenSimulator={() => setActiveModal('project_simulator')}
        onOpenCareer={openCareer}
      />

      {/* Floating Prompt Banner */}
      {activePrompt && (
        <div
          className="interaction-prompt"
          onClick={() => handleInteractObject(activePrompt)}
          style={{ cursor: 'pointer' }}
        >
          <span className="key-badge">E</span>
          <span>{activePrompt.prompt || `Interactuar con ${activePrompt.title}`}</span>
        </div>
      )}

      {/* Bottom User Bar */}
      <UserBar
        player={player}
        onOpenDirectory={() => setActiveModal('directory')}
        onOpenWorkflows={() => openWorkflows('flows')}
        onOpenCareerGuide={() => openCareer()}
        onOpenProjectSimulator={() => setActiveModal('project_simulator')}
        onOpenNetwork={() => setActiveModal('network_graph')}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
      />

      {/* Roblox Chat Panel */}
      <ChatOverlay
        messages={messages}
        onSendMessage={handleSendMessage}
        player={player}
      />

      {/* Modals */}
      {activeModal === 'project_workflows' && (
        <ProjectWorkflowModal
          onClose={() => setActiveModal(null)}
          onOpenRaciChallenge={() => setActiveModal('raci_challenge')}
          initialTab={workflowTab}
        />
      )}

      {activeModal === 'career_guide' && (
        <RoleCareerGuideModal
          onClose={() => setActiveModal(null)}
          onOpenQuiz={openMiniQuiz}
          initialRole={careerInitial?.role || player.role}
          initialLevel={careerInitial?.level || player.seniority}
          onViewed={handleCareerViewed}
        />
      )}

      {activeModal === 'project_simulator' && (
        <ProjectSimulatorModal
          onClose={() => setActiveModal(null)}
          rewardedKeys={player.progress?.simRewarded || []}
          onDecision={handleSimDecision}
          onProjectComplete={handleSimComplete}
        />
      )}

      {activeModal === 'mini_quiz' && (
        <MiniQuizModal
          onClose={() => setActiveModal(null)}
          playerRole={player.role}
          seniority={player.seniority}
          masteredIds={player.progress?.quizCorrectIds || []}
          missedIds={player.progress?.quizMissedIds || []}
          onCorrect={handleMiniQuizCorrect}
          onWrong={handleMiniQuizWrong}
          onLearnMore={handleLearnMore}
        />
      )}

      {activeModal === 'raci_challenge' && (
        <RaciChallengeModal
          onClose={() => setActiveModal(null)}
          playerRole={player.role}
          onFinish={handleRaciResult}
        />
      )}

      {activeModal === 'npc_dialogue' && npcDialogueState && (
        <NpcDialogueModal
          onClose={() => setActiveModal(null)}
          key={npcDialogueState.entry.id}
          bot={otherUsers.find((u) => u.id === npcDialogueState.botId)}
          entry={npcDialogueState.entry}
          isColleague={otherUsers.find((u) => u.id === npcDialogueState.botId)?.role === player.role}
          onAnswered={() => handleNpcTalk(npcDialogueState.botId, npcDialogueState.entry)}
        />
      )}

      {activeModal === 'open_tables' && (
        <OpenTablesModal
          onClose={() => setActiveModal(null)}
          player={player}
          colleagues={otherUsers}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeModal === 'coffee_machine' && (
        <CoffeeCornerModal
          onClose={() => setActiveModal(null)}
          currentStatus={player.status}
          onUpdateStatus={handleUpdateStatus}
          colleagues={otherUsers}
        />
      )}

      {activeModal === 'role_understanding' && (
        <RoleUnderstandingModal onClose={() => setActiveModal(null)} onFirstRead={handleFirstReadRole} onOpenQuiz={openMiniQuiz} />
      )}

      {activeModal === 'desk_projects' && (
        <DeskProjectsModal
          onClose={() => setActiveModal(null)}
          roleKey={deskRoleFilter}
          onOpenQuiz={deskRoleFilter === player.role ? openMiniQuiz : undefined}
        />
      )}

      {activeModal === 'network_graph' && (
        <NetworkGraphModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'cherry_tree' && (
        <CherryTreeModal onClose={() => setActiveModal(null)} player={player} />
      )}

      {activeModal === 'directory' && (
        <DirectoryModal
          onClose={() => setActiveModal(null)}
          users={allUsersList}
          onTeleport={handleTeleportToUser}
        />
      )}
    </div>
  );
}
