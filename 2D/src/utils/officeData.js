import { ROLES_DATA, TIPOS_PROYECTO_DATA, PROYECTOS_DATA } from './rolesWorkflowData';

export const OFFICE_WIDTH = 2200;
export const OFFICE_HEIGHT = 1400;

export const ROLES = ROLES_DATA.map((r) => ({
  id: r.clave,
  label: r.nombre,
  corto: r.corto,
  color: r.color,
  colorSuave: r.color_suave,
  icon: r.icono,
  nube: r.nube_corto,
  mision: r.mision
}));

export const ROBLOX_ACCESSORIES = [
  { id: 'none', label: 'Ninguno' },
  { id: 'headphones', label: 'Audífonos Gamer 🎧' },
  { id: 'cap', label: 'Gorra DataKnow 🧢' },
  { id: 'engineer_helmet', label: 'Casco Data Engineer 👷' },
  { id: 'wizard_hat', label: 'Sombrero Mago IA 🧙‍♂️' },
  { id: 'crown', label: 'Corona de Líder 👑' },
  { id: 'sunglasses', label: 'Gafas de Sol 🕶️' }
];

export const AVATAR_STYLES = {
  skinTones: ['#f8d5c2', '#e0ac69', '#8d5524', '#c68642', '#ffdbac', '#ffd700'],
  hairColors: ['#2c1609', '#4a3728', '#b55200', '#d6c4c2', '#1a202c', '#6366f1', '#00C6BD'],
  shirtColors: ['#4017AA', '#00C6BD', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'],
  pantColors: ['#1e293b', '#334155', '#475569', '#27272a', '#3b82f6']
};

export const STATUS_OPTIONS = [
  { id: 'available', label: 'Disponible 🟢', color: '#22c55e' },
  { id: 'focus', label: 'En Concentración 🎧', color: '#a855f7' },
  { id: 'coffee', label: 'Break de Café ☕', color: '#eab308' },
  { id: 'meeting', label: 'En Reunión 👥', color: '#ef4444' },
  { id: 'remote', label: 'Remoto 🌐', color: '#3b82f6' }
];

// 2D Office Rooms Definition — grilla 2x2 alineada: columna 520px + columna 1500px,
// fila 520px + fila 660px, con márgenes y pasillos de 60px consistentes en todo el mapa.
export const ROOMS = [
  {
    id: 'workflow_hub',
    name: 'Metodología DataKnow',
    subtitle: 'Flujos de Trabajo & Matriz RACI',
    x: 60,
    y: 80,
    width: 520,
    height: 520,
    borderColor: '#4017AA',
    bgColor: '#ffffff',
    tagColor: '#4017AA',
    icon: '📋'
  },
  {
    id: 'central_plaza',
    name: 'Patio Central del Cerezo',
    subtitle: 'Punto de Encuentro y Conexión DK',
    x: 640,
    y: 80,
    width: 1500,
    height: 520,
    borderColor: '#ec4899',
    bgColor: '#fdf2f8',
    tagColor: '#ec4899',
    icon: '🌸'
  },
  {
    id: 'coffee_lounge',
    name: 'Zona de Integración & Café',
    subtitle: 'Estación Espresso & Espacio Relax',
    x: 60,
    y: 660,
    width: 520,
    height: 660,
    borderColor: '#f59e0b',
    bgColor: '#ffffff',
    tagColor: '#f59e0b',
    icon: '☕'
  },
  {
    id: 'workstation_zone',
    name: 'Células de Proyecto Reales',
    subtitle: 'Escritorios & Proyectos en Curso por Especialidad',
    x: 640,
    y: 660,
    width: 1500,
    height: 660,
    borderColor: '#10b981',
    bgColor: '#ffffff',
    tagColor: '#10b981',
    icon: '💼'
  }
];

// Interactive 2D Objects
export const INTERACTIVE_OBJECTS = [
  // Patio Central del Cerezo: fuente, infografía y los kioscos abiertos de Analítica y Servidores
  {
    id: 'obj_fountain',
    type: 'fountain',
    title: 'Cerezo Sagrado Sakura DataKnow 🌸',
    x: 1330,
    y: 280,
    width: 120,
    height: 120,
    prompt: '¡Bienvenido al Gran Patio del Cerezo Sagrado de DK! 🌸'
  },
  // Metodología DK Room Objects
  {
    id: 'obj_project_workflows',
    type: 'project_workflows',
    title: 'Diagrama de Flujos & RACI',
    x: 120,
    y: 150,
    width: 400,
    height: 120,
    prompt: 'Presiona [E] para ver el Flujo entre Roles & Matriz RACI'
  },
  {
    id: 'obj_career_hub',
    type: 'career_guide',
    title: 'Manual de Seniority & Carrera',
    x: 120,
    y: 300,
    width: 400,
    height: 120,
    prompt: 'Presiona [E] para ver la Guía de Roles (Junior ➔ Specialist Lead)'
  },
  {
    id: 'obj_role_infographic',
    type: 'role_understanding',
    title: 'Infografía de Roles DK',
    x: 120,
    y: 450,
    width: 400,
    height: 120,
    prompt: 'Presiona [E] para entender tu Rol en DK'
  },
  // Coffee Lounge Objects
  {
    id: 'obj_coffee_bar',
    type: 'coffee_machine',
    title: 'Estación de Café Espresso DK ☕',
    x: 140,
    y: 840,
    width: 360,
    height: 120,
    prompt: 'Presiona [E] para preparar un café'
  },
  // Mesas abiertas de conversación (encuentro casual, no reuniones de trabajo)
  {
    id: 'obj_meeting_table',
    type: 'open_tables',
    title: 'Mesas Abiertas de Conversación 🗣️',
    x: 140,
    y: 1020,
    width: 360,
    height: 160,
    prompt: 'Presiona [E] para sentarte a charlar con alguien'
  },
  // Workstation Desks — al interactuar muestran los proyectos reales en curso de esa especialidad
  {
    id: 'obj_desk_de',
    type: 'desk',
    role: 'de',
    title: 'Escritorio Data Engineering (DE)',
    x: 890,
    y: 840,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso de Data Engineering'
  },
  {
    id: 'obj_desk_ds',
    type: 'desk',
    role: 'ds',
    title: 'Escritorio Científico de Datos (DS)',
    x: 1290,
    y: 840,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso de Ciencia de Datos'
  },
  {
    id: 'obj_desk_bi',
    type: 'desk',
    role: 'bi',
    title: 'Escritorio Analista BI (BI)',
    x: 1690,
    y: 840,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso de Analítica BI'
  },
  {
    id: 'obj_desk_mloops',
    type: 'desk',
    role: 'do',
    title: 'Escritorio MLOps / DevOps (DO)',
    x: 890,
    y: 1080,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso de DevOps/MLOps'
  },
  {
    id: 'obj_desk_qa',
    type: 'desk',
    role: 'qa',
    title: 'Escritorio Ingeniero QA (QA)',
    x: 1290,
    y: 1080,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso de QA'
  },
  {
    id: 'obj_desk_agile',
    type: 'desk',
    role: 'agile',
    title: 'Escritorio Agile Manager (AM)',
    x: 1690,
    y: 1080,
    width: 190,
    height: 110,
    prompt: 'Presiona [E] para ver los proyectos en curso que coordina el Agile Manager'
  }
];

// 2D Plant Decor Locations
// Regla: siempre en los márgenes de cada sala (nunca sobre una tarjeta) y con la copa
// dentro del borde. La copa se dibuja hasta 1.4*size por encima de `y`, así que
// y >= sala.y + 1.4*size + margen.
export const PLANTS = [
  // Metodología DataKnow — márgenes laterales, fuera de las 3 tarjetas apiladas
  { x: 90, y: 300, size: 28, type: 'block_tree' },
  { x: 550, y: 300, size: 28, type: 'block_plant' },
  // Esquinas del Patio Central
  { x: 720, y: 180, size: 30, type: 'block_tree' },
  { x: 2060, y: 180, size: 30, type: 'big_block_tree' },
  { x: 720, y: 560, size: 30, type: 'block_tree' },
  { x: 2060, y: 560, size: 30, type: 'big_block_tree' },
  // Sakuras alrededor de la fuente
  { x: 1230, y: 240, size: 32, type: 'sakura_tree' },
  { x: 1550, y: 240, size: 32, type: 'sakura_tree' },
  { x: 1230, y: 460, size: 32, type: 'sakura_tree' },
  { x: 1550, y: 460, size: 32, type: 'sakura_tree' },
  // Zona de Integración & Café — márgenes laterales
  { x: 100, y: 950, size: 28, type: 'block_plant' },
  { x: 540, y: 950, size: 28, type: 'block_tree' },
  // Células de Proyecto Reales — esquinas inferiores
  { x: 720, y: 1260, size: 30, type: 'big_block_tree' },
  { x: 2060, y: 1260, size: 30, type: 'big_block_tree' }
];

// JUGADORES SIMULADOS (BOTS AI DATAKNOW EN 2D)
export const INITIAL_BOTS = [
  {
    id: 'bot_sofia',
    name: 'Sofia Alarcón',
    role: 'de',
    roleLabel: 'Data Engineer (DE)',
    isBot: true,
    status: 'focus',
    statusLabel: 'Pipelines en Proceso 🛠️',
    avatar: { skin: '#f8d5c2', shirt: '#4017AA', pants: '#1e293b', accessory: 'engineer_helmet' },
    x: 985,
    y: 895,
    waypoints: [
      { x: 985, y: 895 },
      { x: 1200, y: 500 },
      { x: 1390, y: 340 },
      { x: 320, y: 840 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_mateo',
    name: 'Mateo Mendoza',
    role: 'ds',
    roleLabel: 'Científico de Datos (DS)',
    isBot: true,
    status: 'focus',
    statusLabel: 'Entrenando Modelo IA 🧪',
    avatar: { skin: '#e0ac69', shirt: '#00C6BD', pants: '#334155', accessory: 'wizard_hat' },
    x: 1385,
    y: 895,
    waypoints: [
      { x: 1385, y: 895 },
      { x: 1320, y: 160 },
      { x: 890, y: 250 },
      { x: 1390, y: 340 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_camila',
    name: 'Camila Torres',
    role: 'bi',
    roleLabel: 'Analista BI (BI)',
    isBot: true,
    status: 'available',
    statusLabel: 'Dashboards Listos 📊',
    avatar: { skin: '#c68642', shirt: '#10b981', pants: '#475569', accessory: 'headphones' },
    x: 1785,
    y: 895,
    waypoints: [
      { x: 1785, y: 895 },
      { x: 890, y: 250 },
      { x: 320, y: 240 },
      { x: 1390, y: 340 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_lucas',
    name: 'Lucas Morales',
    role: 'do',
    roleLabel: 'DevOps / MLOps (DO)',
    isBot: true,
    status: 'meeting',
    statusLabel: 'Monitoreando Clusters 🚀',
    avatar: { skin: '#8d5524', shirt: '#ef4444', pants: '#1e293b', accessory: 'cap' },
    x: 985,
    y: 1135,
    waypoints: [
      { x: 985, y: 1135 },
      { x: 1950, y: 180 },
      { x: 320, y: 1060 },
      { x: 1390, y: 340 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_valentina',
    name: 'Valentina Ramos',
    role: 'qa',
    roleLabel: 'Ingeniera QA (QA)',
    isBot: true,
    status: 'available',
    statusLabel: 'Pruebas Exitosas 🔍',
    avatar: { skin: '#ffdbac', shirt: '#f59e0b', pants: '#334155', accessory: 'sunglasses' },
    x: 1385,
    y: 1135,
    waypoints: [
      { x: 1385, y: 1135 },
      { x: 1450, y: 160 },
      { x: 320, y: 410 },
      { x: 1390, y: 340 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_carlos',
    name: 'Carlos Silva',
    role: 'agile',
    roleLabel: 'Agile Manager (AM)',
    isBot: true,
    status: 'coffee',
    statusLabel: 'Facilitando Daily 🏃',
    avatar: { skin: '#f8d5c2', shirt: '#ec4899', pants: '#1e293b', accessory: 'crown' },
    x: 1785,
    y: 1135,
    waypoints: [
      { x: 1785, y: 1135 },
      { x: 1390, y: 340 },
      { x: 320, y: 840 },
      { x: 320, y: 1060 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_daniela',
    name: 'Daniela Vargas',
    role: 'agile',
    roleLabel: 'Agile Manager (AM)',
    isBot: true,
    status: 'meeting',
    statusLabel: 'En Planning con Cliente 🗓️',
    avatar: { skin: '#e0ac69', shirt: '#8b5cf6', pants: '#334155', accessory: 'crown' },
    x: 1700,
    y: 1250,
    waypoints: [
      { x: 1700, y: 1250 },
      { x: 1390, y: 340 },
      { x: 985, y: 895 },
      { x: 320, y: 1060 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  },
  {
    id: 'bot_andres',
    name: 'Andrés Beltrán',
    role: 'agile',
    roleLabel: 'Agile Manager (AM)',
    isBot: true,
    status: 'available',
    statusLabel: 'Refinando Backlog 📋',
    avatar: { skin: '#8d5524', shirt: '#0284c7', pants: '#1e293b', accessory: 'crown' },
    x: 1880,
    y: 1250,
    waypoints: [
      { x: 1880, y: 1250 },
      { x: 1385, y: 1135 },
      { x: 1390, y: 340 },
      { x: 320, y: 840 }
    ],
    waypointIndex: 0,
    waitTimer: 0
  }
];

export const INITIAL_ANALYTICS_DATA = {
  activePipelines: 24,
  recordsProcessedToday: 48592041,
  activeQueries: 142,
  clusterLoad: 38,
  topDatasets: [
    { name: 'Fact_Ventas_Empresariales', rows: '12.4M', speed: '45ms' },
    { name: 'Dim_Clientes_DK', rows: '2.1M', speed: '12ms' },
    { name: 'Stream_Logs_Telemetria', rows: '89.3M', speed: '8ms' },
    { name: 'Predictions_Churn_Model', rows: '540K', speed: '24ms' }
  ]
};
