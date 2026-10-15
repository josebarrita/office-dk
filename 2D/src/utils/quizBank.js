// Banco de mini-cuestionarios sobre las responsabilidades del rol del jugador.
// Se genera desde rolesWorkflowData.json, así que cambia solo cuando cambian los manuales.
// Cada pregunta tiene un id estable: el XP se paga una sola vez por pregunta acertada.
import {
  ROLES_DATA,
  NIVELES_DATA,
  RACI_DATA,
  AGILE_DATA,
  FLUJOS_DATA,
  NOMBRES_LIDERES_DATA,
  PROGRESION_DATA
} from './rolesWorkflowData';
import { raciBucket, SENIORITY_LEVELS } from './questData';

export const QUIZ_QUESTIONS_PER_ROUND = 3;

// Frases que comparten todos los roles: no sirven para distinguir responsabilidades.
const GENERIC = /reportes de tiempo|funciones asignadas|preventas|transferir conocimiento|evaluación de desempeño|innovaci/i;

const LEARN = {
  rol: { modal: 'role_understanding' },
  raci: { modal: 'project_workflows', tab: 'raci' },
  flujos: { modal: 'project_workflows', tab: 'flows' },
  agile: { modal: 'project_workflows', tab: 'agile' },
  carrera: (level) => ({ modal: 'career_guide', level })
};

// Situaciones del día a día, iguales para todas las especialidades: aplican las
// reglas de gobierno de DK (AM dueño del proyecto, Tech Lead estándares, células fijas).
const SITUATIONS = [
  {
    id: 'sit-cambio-cliente',
    prompt: 'A mitad del sprint, el cliente te escribe directamente pidiendo una funcionalidad nueva «pequeña». ¿Qué haces?',
    correct: 'Se lo llevo al Agile Manager para que evalúe el impacto y lo negocie',
    distractors: ['La hago de inmediato para quedar bien con el cliente', 'Le digo al cliente que no se puede y cierro el tema'],
    explain: 'El AM es el dueño del proyecto: evalúa el impacto en tiempo y alcance y lo negocia con el cliente. Comprometerte por tu cuenta pone en riesgo el sprint.'
  },
  {
    id: 'sit-bloqueo',
    prompt: 'Llevas un día bloqueado esperando un acceso que depende de otro equipo. ¿Qué haces?',
    correct: 'Lo escalo temprano en la daily y aviso al Agile Manager',
    distractors: ['Espero en silencio a que llegue el acceso', 'Cambio de tarea sin decirle a nadie'],
    explain: 'Escalar los bloqueos temprano es algo que el AM espera de todos: así gestiona la dependencia antes de que afecte la entrega.'
  },
  {
    id: 'sit-desacuerdo-tecnico',
    prompt: 'Dos compañeros de tu célula proponen enfoques técnicos distintos y no se ponen de acuerdo. ¿Quién ayuda a definir el estándar?',
    correct: 'El Tech Lead de la especialidad',
    distractors: ['El Agile Manager, porque es el dueño del proyecto', 'El cliente, porque es quien paga'],
    explain: 'Las decisiones técnicas y de estándares son del Tech Lead. El AM solo se asegura de que la decisión no afecte tiempos ni entregables.'
  },
  {
    id: 'sit-estimacion',
    prompt: 'Te das cuenta de que tu estimación fue optimista y no vas a terminar a tiempo. ¿Qué haces?',
    correct: 'Aviso al Agile Manager cuanto antes con una estimación nueva y honesta',
    distractors: ['Trabajo de noche sin decirle nada a nadie', 'Entrego incompleto y lo marco como terminado'],
    explain: 'El AM necesita estimaciones honestas y avisos tempranos para replanificar con el cliente a tiempo.'
  },
  {
    id: 'sit-capacidad',
    prompt: 'Terminaste tus tareas del sprint antes de lo previsto. ¿Qué es lo más útil?',
    correct: 'Avisarle al Agile Manager: puede asignarme trabajo o prestarme a otra célula',
    distractors: ['Quedarme sin avisar hasta el próximo sprint', 'Empezar por mi cuenta funcionalidades que nadie pidió'],
    explain: 'Las células son fijas, pero si alguien tiene capacidad libre el AM puede prestarlo a otra célula que lo necesite. Es la excepción válida.'
  },
  {
    id: 'sit-daily',
    prompt: '¿Para qué sirve la daily de 15 minutos?',
    correct: 'Para sincronizar avances, el plan del día y los bloqueos',
    distractors: ['Para reportar cuántas horas trabajó cada uno', 'Para resolver en detalle los problemas técnicos'],
    explain: 'La daily sincroniza al equipo y saca a la luz los bloqueos. Los detalles técnicos se resuelven después, con quien corresponda.'
  },
  {
    id: 'sit-retro',
    prompt: 'En la retrospectiva el equipo nota que los requerimientos siempre llegan incompletos. ¿Cuál es la mejor reacción?',
    correct: 'Proponer una acción concreta, como acordar criterios de aceptación en el refinement',
    distractors: ['Buscar quién tuvo la culpa', 'No decir nada para evitar conflictos'],
    explain: 'La retro sirve para mejorar el proceso con acciones concretas, no para buscar culpables.'
  },
  {
    id: 'sit-criterios',
    prompt: 'Vas a empezar una historia de usuario y no está claro cuándo se considera terminada. ¿Qué haces?',
    correct: 'Pido aclarar los criterios de aceptación en el refinement con el AM y el equipo',
    distractors: ['Asumo lo que me parezca y lo resuelvo al final', 'Le pregunto al cliente por mi cuenta, sin avisar al AM'],
    explain: 'Los criterios de aceptación se acuerdan en el refinement: así QA, el AM y tú comparten la misma definición de «terminado».'
  }
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const sentences = (text = '') =>
  text.split(/\.\s+/).map((s) => s.trim().replace(/\.$/, '')).filter(Boolean);

const cleanMission = (m = '') => m.replace(/\s*\(Borrador[^)]*\)\.?/i, '').trim();
// Todas las opciones con el mismo recorte, para que la longitud no delate la correcta.
const missionCore = (m) => {
  const core = cleanMission(m).split(/,?\s+para\s/i)[0];
  if (core.length <= 105) return core;
  return `${core.slice(0, 105).replace(/\s+\S*$/, '')}…`;
};

const roleName = (key) => ROLES_DATA.find((r) => r.clave === key)?.nombre || key;

// Arma la pregunta mezclando las opciones y recordando cuál es la correcta.
const makeQuestion = (id, prompt, correct, distractors, explain, learnMore, kind = 'rol') => {
  const unique = [...new Set(distractors.filter((d) => d && d !== correct))].slice(0, 2);
  if (unique.length < 2) return null;
  const options = shuffle([correct, ...unique]);
  return { id, prompt, options, correctIndex: options.indexOf(correct), explain, learnMore, kind };
};

const distinctiveSentence = (roleKey, nivel) => {
  const own = NIVELES_DATA.find((n) => n.rol === roleKey && n.nivel === nivel);
  if (!own) return null;
  const others = NIVELES_DATA.filter((n) => n.rol !== roleKey && n.nivel === nivel)
    .map((n) => n.responsabilidades.toLowerCase())
    .join(' ');
  return sentences(own.responsabilidades).find(
    (s) => !GENERIC.test(s) && s.length > 18 && s.length < 150 && !others.includes(s.toLowerCase())
  ) || null;
};

export const buildRoleQuizBank = (roleKey, seniority = null) => {
  const role = ROLES_DATA.find((r) => r.clave === roleKey);
  if (!role) return [];
  const others = ROLES_DATA.filter((r) => r.clave !== roleKey);
  const bank = [];

  // 1. Misión del rol
  bank.push(makeQuestion(
    'mision',
    `¿Cuál es la misión de tu rol como ${role.nombre}?`,
    missionCore(role.mision),
    shuffle(others).map((r) => missionCore(r.mision)),
    `Tu misión: ${cleanMission(role.mision)}`,
    LEARN.rol
  ));

  // 2. Responsabilidades por nivel. Tu nivel y los anteriores se preguntan en
  // segunda persona; los líderes que no eres, en tercera.
  const leaders = NOMBRES_LIDERES_DATA.find((l) => l.rol === roleKey) || {};
  const leaderTitles = { 'Tech Lead': leaders.tech_lead, 'Specialist Lead': leaders.specialist_lead };
  [...new Set(NIVELES_DATA.filter((n) => n.rol === roleKey).map((n) => n.nivel))].forEach((nivel) => {
    const correct = distinctiveSentence(roleKey, nivel);
    if (!correct) return;
    const distractors = shuffle(others).map((r) => distinctiveSentence(r.clave, nivel));
    const full = NIVELES_DATA.find((n) => n.rol === roleKey && n.nivel === nivel);
    const summary = sentences(full.responsabilidades).slice(0, 3).join('; ');
    const isOwn = nivel === seniority;
    const leaderTitle = leaderTitles[nivel];
    let prompt;
    let explain;
    if (leaderTitle && !isOwn) {
      prompt = `El ${leaderTitle} es uno de los líderes de tu especialidad. ¿Cuál de estas es una de sus responsabilidades?`;
      explain = `El ${leaderTitle} se encarga de: ${summary}.`;
    } else {
      const who = leaderTitle || `${role.corto} ${nivel}`;
      prompt = `Como ${who}${isOwn ? ' (tu nivel actual)' : ''}, ¿cuál de estas es una de tus responsabilidades?`;
      explain = `Un ${who} se encarga de: ${summary}.`;
    }
    bank.push(makeQuestion(`nivel-${slug(nivel)}`, prompt, correct, distractors, explain, LEARN.carrera(nivel)));
  });

  // 3. Próximo nivel: qué cambio se espera para ascender. Si DataKnow aún no
  // registró el nivel de la persona, se pregunta en tercera persona desde Junior.
  const knownLevel = SENIORITY_LEVELS.includes(seniority);
  const fromLevel = knownLevel ? seniority : 'Junior';
  const nextLevel = SENIORITY_LEVELS[SENIORITY_LEVELS.indexOf(fromLevel) + 1];
  const progression = PROGRESION_DATA.find((p) => p.rol === roleKey && p.hacia === nextLevel);
  if (progression) {
    bank.push(makeQuestion(
      `progresion-${slug(nextLevel)}`,
      knownLevel
        ? `Para pasar de ${fromLevel} a ${nextLevel}, ¿qué cambio se espera de ti?`
        : `Para que un ${role.corto} pase de ${fromLevel} a ${nextLevel}, ¿qué cambio se espera?`,
      progression.cambio,
      shuffle(PROGRESION_DATA.filter((p) => p.rol !== roleKey && p.hacia === nextLevel)).map((p) => p.cambio),
      `Para llegar a ${nextLevel} (tiempo típico ${progression.tiempo}): ${progression.criterios}`,
      LEARN.carrera(nextLevel)
    ));
  }

  // 4. Matriz RACI: actividades donde haces el trabajo (R). Se toman siempre las
  // mismas filas para que los ids no cambien entre rondas.
  const responsible = RACI_DATA.filter((row) => raciBucket(row[roleKey]) === 'R');
  const notResponsible = RACI_DATA.filter((row) => ['I', 'C'].includes(raciBucket(row[roleKey])));
  responsible.slice(0, 2).forEach((row) => {
    const picks = shuffle(notResponsible).slice(0, 2);
    const detail = picks.map((p) => `«${p.actividad}» (${raciBucket(p[roleKey]) === 'C' ? 'Consultado' : 'Informado'})`).join(' y ');
    bank.push(makeQuestion(
      `raci-r-${slug(row.actividad)}`,
      '¿En cuál de estas actividades eres Responsable (R), es decir, haces el trabajo?',
      row.actividad,
      picks.map((p) => p.actividad),
      `En «${row.actividad}» eres Responsable. En ${detail} no ejecutas el trabajo.`,
      LEARN.raci
    ));
  });

  // 5. Gobierno del proyecto: AM dueño, Tech Lead soporte técnico
  const techLead = leaders.tech_lead || 'Tech Lead de tu especialidad';
  bank.push(makeQuestion(
    'gobierno-dueno',
    '¿Quién es el dueño del proyecto y responde por tiempos y entregables ante el cliente?',
    'El Agile Manager (AM)',
    [`El ${techLead}`, 'Cada desarrollador por su cuenta'],
    'El Agile Manager es el dueño del proyecto: coordina tiempos, entregables y ceremonias Scrum.',
    LEARN.rol
  ));
  bank.push(makeQuestion(
    'gobierno-techlead',
    'Tienes una duda técnica o quieres validar que cumples los estándares. ¿A quién acudes?',
    `Al ${techLead}`,
    ['Al Agile Manager', 'Directamente al cliente'],
    `El ${techLead} resuelve dudas técnicas y vela por los estándares. No gestiona el cronograma: eso es del AM.`,
    LEARN.rol
  ));

  // 6. Qué espera el Agile Manager de ti
  const firstExpect = (key) => sentences(AGILE_DATA.find((a) => a.rol === key)?.espera)[0];
  const expect = firstExpect(roleKey);
  if (expect) {
    bank.push(makeQuestion(
      'agile-espera',
      `¿Qué espera de ti el Agile Manager como ${role.corto}?`,
      expect,
      shuffle(others).map((r) => firstExpect(r.clave)),
      `El AM espera de ti: ${AGILE_DATA.find((a) => a.rol === roleKey).espera}`,
      LEARN.agile
    ));
  }

  // 7. Flujo de trabajo: qué le entregas a otro rol
  FLUJOS_DATA.filter((f) => f.desde === roleKey).forEach((f) => {
    bank.push(makeQuestion(
      `flujo-${f.id}`,
      `En el flujo de un proyecto, ¿qué le entregas al ${roleName(f.hacia)}?`,
      f.etiqueta,
      shuffle(FLUJOS_DATA.filter((o) => o.etiqueta !== f.etiqueta)).map((o) => o.etiqueta),
      `Tú le entregas «${f.etiqueta}» al ${roleName(f.hacia)}.`,
      LEARN.flujos
    ));
  });

  // 8. Situaciones del día a día
  SITUATIONS.forEach((s) => {
    bank.push(makeQuestion(s.id, s.prompt, s.correct, s.distractors, s.explain, LEARN.agile, 'situacion'));
  });

  return bank.filter(Boolean);
};

export const getQuizBankSize = (roleKey, seniority) => buildRoleQuizBank(roleKey, seniority).length;

// Orden de prioridad: primero las que falló y aún no domina, luego las nuevas
// y, si ya domina todas, repaso.
export const pickQuizRound = (roleKey, { mastered = [], missed = [], seniority = null } = {}) => {
  const bank = buildRoleQuizBank(roleKey, seniority);
  const retry = shuffle(bank.filter((q) => missed.includes(q.id) && !mastered.includes(q.id)));
  const fresh = shuffle(bank.filter((q) => !missed.includes(q.id) && !mastered.includes(q.id)));
  const review = shuffle(bank.filter((q) => mastered.includes(q.id)));
  return [...retry, ...fresh, ...review].slice(0, QUIZ_QUESTIONS_PER_ROUND);
};
