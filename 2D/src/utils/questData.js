// Misiones guiadas, progresión (XP, nivel), insignias y accesorios.
// Las reglas que combinan esto con el banco de preguntas viven en progressRules.js.

export const XP_VALUES = {
  readRole: 10,
  npcTalk: 15,
  quizCorrect: 25,
  simDecision: 25,
  miniQuiz: 15,
  questStep: 50
};

// Un compañero por especialidad + un Agile Manager.
export const CORE_NPC_IDS = ['bot_sofia', 'bot_mateo', 'bot_camila', 'bot_lucas', 'bot_valentina', 'bot_carlos'];
export const AM_NPC_IDS = ['bot_carlos', 'bot_daniela', 'bot_andres'];

export const ROOM_IDS = ['workflow_hub', 'central_plaza', 'coffee_lounge', 'workstation_zone'];

export const SENIORITY_LEVELS = ['Junior', 'Semisenior', 'Senior', 'Tech Lead', 'Specialist Lead'];

export const ACCESSORIES = {
  engineer_helmet: 'Casco de ingeniería',
  wizard_hat: 'Sombrero de mago IA',
  headphones: 'Audífonos',
  cap: 'Gorra DataKnow',
  sunglasses: 'Gafas de sol',
  crown: 'Corona de líder'
};

// El accesorio de tu propio rol es el premio del primer día.
export const ACCESSORY_BY_ROLE = {
  de: 'engineer_helmet',
  ds: 'wizard_hat',
  bi: 'headphones',
  do: 'cap',
  qa: 'sunglasses',
  agile: 'crown'
};

// Orden en que las demás insignias regalan accesorios de otros roles.
export const ACCESSORY_UNLOCK_ORDER = ['headphones', 'cap', 'sunglasses', 'engineer_helmet', 'wizard_hat', 'crown'];

export const BADGES = [
  { id: 'onboarding_completo', icon: '🎒', title: 'Primer día', desc: 'Completaste la misión "Tu Primer Día en DK".' },
  { id: 'primera_semana', icon: '📅', title: 'Primera semana', desc: 'Completaste la misión "Tu Primera Semana".' },
  { id: 'explorador_roles', icon: '🧭', title: 'Conoces a todos', desc: 'Conversaste con un compañero de cada especialidad y con un Agile Manager.' },
  { id: 'simulador_perfecto', icon: '🎯', title: 'Simulación perfecta', desc: 'Completaste un proyecto del Simulador sin errores.' },
  { id: 'maestro_rol', icon: '🧠', title: 'Maestro de tu rol', desc: 'Dominaste todas las preguntas del mini-quiz de tu rol.' }
];

const step = (id, title, desc) => ({ id, title, desc, xp: XP_VALUES.questStep });

export const QUESTS = [
  {
    id: 'primer_dia',
    title: 'Tu Primer Día en DK',
    badge: 'onboarding_completo',
    steps: [
      step('desk', 'Conoce tu escritorio', 'Ve a Células de Proyecto Reales y visita el escritorio de tu especialidad.'),
      step('rooms', 'Recorre la oficina', 'Visita las 4 salas: Metodología DK, Patio Central, Café e Integración, y Células de Proyecto.'),
      step('npcs', 'Conoce a tu equipo', 'Acércate y presiona [E] junto a un compañero para conversar con él.'),
      step('raci', 'Aprueba tu reto de rol', 'Responde al menos 3 de 5 preguntas en el Reto RACI de tu especialidad.')
    ]
  },
  {
    id: 'primera_semana',
    title: 'Tu Primera Semana',
    badge: 'primera_semana',
    steps: [
      step('w_ceremonias', 'Aprende las ceremonias Scrum', 'Ten 2 conversaciones con Agile Managers (Carlos, Daniela o Andrés) sobre cómo funciona el sprint.'),
      step('w_simulador', 'Completa un proyecto', 'En el Simulador, decide qué rol actúa en los 6 hitos de un proyecto.'),
      step('w_quiz', 'Domina 6 preguntas de tu rol', 'Acierta 6 preguntas distintas sobre tus responsabilidades en el mini-quiz.'),
      step('w_situaciones', 'Resuelve 3 situaciones', 'En el mini-quiz, acierta 3 preguntas de "¿Qué haces si…?".'),
      step('w_carrera', 'Revisa tu próximo nivel', 'Abre el Manual de Seniority y mira qué necesitas para ascender.')
    ]
  }
];

export const ALL_QUEST_STEPS = QUESTS.flatMap((q) => q.steps);

export const createDefaultProgress = () => ({
  xp: 0,
  visitedRooms: [],
  talkedToNpcs: [],
  npcAnswered: [],
  deskVisited: false,
  raciPassed: false,
  raciBestScore: 0,
  readRoleInfographic: false,
  careerViewed: false,
  tutorialDone: false,
  completedSteps: [],
  badges: [],
  quizCorrectIds: [],
  quizMissedIds: [],
  simRewarded: [],
  simCompletedProjects: [],
  simPerfect: false,
  unlockedAccessories: []
});

// Completa campos que no existían en partidas guardadas con versiones anteriores.
export const migrateProgress = (player) => {
  const progress = { ...createDefaultProgress(), ...(player.progress || {}) };
  if (progress.badges.includes('onboarding_completo') && progress.unlockedAccessories.length === 0) {
    const own = ACCESSORY_BY_ROLE[player.role];
    if (own) progress.unlockedAccessories = [own];
  }
  return { ...player, progress };
};

const quizCount = (progress, situational) =>
  (progress.quizCorrectIds || []).filter((id) => id.startsWith('sit-') === situational).length;

export const isStepComplete = (stepId, progress) => {
  if (!progress) return false;
  switch (stepId) {
    case 'desk': return !!progress.deskVisited;
    case 'rooms': return (progress.visitedRooms || []).length >= ROOM_IDS.length;
    case 'npcs': return (progress.talkedToNpcs || []).length >= 1;
    case 'raci': return !!progress.raciPassed;
    case 'w_ceremonias':
      return (progress.npcAnswered || []).filter((id) => AM_NPC_IDS.some((am) => id.startsWith(`${am}:`))).length >= 2;
    case 'w_simulador': return (progress.simCompletedProjects || []).length >= 1;
    case 'w_quiz': return quizCount(progress, false) >= 6;
    case 'w_situaciones': return quizCount(progress, true) >= 3;
    case 'w_carrera': return !!progress.careerViewed;
    default: return false;
  }
};

// Devuelve la misión en curso (la primera sin terminar) o la última si ya terminó todas.
export const getQuestStatus = (progress) => {
  const quests = QUESTS.map((quest) => {
    const steps = quest.steps.map((s) => ({ ...s, done: isStepComplete(s.id, progress) }));
    const doneCount = steps.filter((s) => s.done).length;
    return { ...quest, steps, doneCount, total: steps.length, allDone: doneCount === steps.length };
  });
  const current = quests.find((q) => !q.allDone) || quests[quests.length - 1];
  return {
    quest: current,
    questIndex: quests.indexOf(current),
    steps: current.steps,
    doneCount: current.doneCount,
    total: current.total,
    currentStep: current.steps.find((s) => !s.done) || null,
    allDone: quests.every((q) => q.allDone)
  };
};

// Niveles: curva ligeramente creciente, suficiente para ~10-12 niveles con el
// ritmo de XP de esta oficina (leer +10, hablar +15, acertar +25, misión +50).
const LEVEL_THRESHOLDS = [0, 40, 90, 160, 250, 360, 500, 660, 850, 1060, 1300, 1600];

export const getLevelInfo = (xp) => {
  const total = xp || 0;
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (total >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const currentFloor = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextCeil = LEVEL_THRESHOLDS[level] ?? currentFloor + 400;
  const progressPct = Math.min(100, Math.round(((total - currentFloor) / (nextCeil - currentFloor)) * 100));
  return { level, xp: total, currentFloor, nextCeil, progressPct };
};

// Convierte un valor RACI (incluye compuestos como "A/R") en una de las 4
// categorías puras para el Reto RACI — evita ambigüedad en las opciones.
export const raciBucket = (value) => {
  if (!value) return 'I';
  if (value.includes('R')) return 'R';
  if (value.includes('A')) return 'A';
  if (value.includes('C')) return 'C';
  return 'I';
};

export const RACI_OPTIONS = [
  { key: 'R', label: 'Responsable (R)', hint: 'Hace el trabajo' },
  { key: 'A', label: 'Aprobador (A)', hint: 'Responde por el resultado' },
  { key: 'C', label: 'Consultado (C)', hint: 'Aporta criterio antes de decidir' },
  { key: 'I', label: 'Informado (I)', hint: 'Recibe el reporte, no participa' }
];
