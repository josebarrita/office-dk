# The Office DK

Oficina virtual de DataKnow en 2D para el **onboarding**: que cada colaborador conozca su rol, sus responsabilidades y cómo se trabaja en DK, jugando.

Dos reglas de gobierno atraviesan todo el contenido del juego:

- **El Agile Manager (AM) es el dueño del proyecto:** coordina tiempos, entregables y ceremonias Scrum ante el cliente.
- **El Tech Lead de cada especialidad** resuelve dudas técnicas y vela por los estándares. No gestiona el cronograma ni responde por la entrega.

---

## Puesta en marcha

El proyecto usa *npm workspaces*: los comandos se ejecutan desde la **raíz** (`The Office DK CL/`).

```bash
npm install
```

```bash
npm run dev:2d
```

Abre `http://localhost:3001`. Para generar la versión de producción en `2D/dist/`:

```bash
npm run build:2d
```

Para publicarlo en Azure, ver [`DESPLIEGUE_AZURE.md`](../DESPLIEGUE_AZURE.md).

---

## Controles

| Acción | Tecla |
|---|---|
| Moverse | `W` `A` `S` `D` o flechas; también clic en el piso |
| Interactuar con objetos y compañeros | `E` (o `Enter`) cuando aparece la tecla flotante |
| Ver todo el mapa / seguir al jugador | `M` |
| Acercar o alejar | Rueda del mouse |
| Cerrar una ventana | `Esc` |

La primera vez que entras, un tutorial de 4 pasos explica estos controles.

---

## El mapa

| Sala | Qué hay | Para qué sirve |
|---|---|---|
| **Metodología DataKnow** | 3 pizarras: Flujos & RACI, Manual de Seniority, Infografía de Roles | Aprender quién hace qué y cómo se crece en cada rol |
| **Patio Central del Cerezo** | Cerezo DK, bancas | Punto de encuentro y de aparición |
| **Zona de Integración & Café** | Estación de café, Mesas Abiertas | Encuentros casuales (no reemplaza a Teams) |
| **Células de Proyecto Reales** | 6 escritorios, uno por rol (DE, DS, BI, DO, QA, AM) | Ver los proyectos en curso de cada especialidad |

En el mapa caminan 8 compañeros (bots): uno por especialidad y tres Agile Managers.

---

## Cómo enseña el juego

### Misiones guiadas

El panel de arriba a la izquierda muestra la misión en curso, con una brújula hacia el siguiente objetivo o un botón directo cuando el paso no está en el mapa.

| Misión | Pasos | Premio |
|---|---|---|
| **Tu Primer Día en DK** | Visitar tu escritorio · recorrer las 4 salas · conversar con un compañero · aprobar el Reto RACI | Insignia + accesorio de tu rol (se equipa solo) |
| **Tu Primera Semana** | 2 conversaciones con Agile Managers · completar un proyecto en el Simulador · dominar 6 preguntas del mini-quiz · resolver 3 situaciones · revisar tu próximo nivel en el Manual | Insignia + accesorio |

### Mini-quiz de tu rol

Rondas de 3 preguntas generadas desde los manuales (19 a 22 por rol):

- misión del rol;
- responsabilidades por nivel (tu nivel y los anteriores en segunda persona; los niveles de líder, en tercera);
- qué se espera para tu próximo nivel;
- actividades donde eres Responsable en la matriz RACI;
- gobierno del proyecto (AM dueño, Tech Lead estándares);
- qué espera el AM de tu rol;
- qué le entregas a otros roles;
- 8 situaciones del día a día ("¿Qué haces si…?").

Cada pregunta paga XP **una sola vez**. Las que fallas vuelven primero en la siguiente ronda, y el botón **"Aprende más"** abre la sección exacta del manual.

Se abre desde el panel de misión, la Infografía de Roles, el Manual de Seniority y tu propio escritorio.

### Otras actividades

| Actividad | Dónde | Qué enseña |
|---|---|---|
| **Reto RACI** | Flujos & RACI, o la misión | Tu papel (R, A, C o I) en 5 actividades del proyecto. Se aprueba con 3 de 5 |
| **Simulador de proyectos** | Barra inferior | En cada uno de los 6 hitos de un proyecto, eliges qué rol actúa |
| **Conversaciones con compañeros** | `E` junto a un bot | 3 conversaciones por compañero; los AM explican las ceremonias Scrum |
| **Red DK** | Barra inferior | Grafo de Agile Managers, sus células de personas y proyectos |
| **Escritorios** | Células de Proyecto | Proyectos en curso de cada especialidad y su equipo |

---

## Progresión

### XP

| Acción | XP | Regla |
|---|---|---|
| Leer la Infografía de Roles | 10 | Una vez |
| Conversación nueva con un compañero | 15 | Una vez por conversación |
| Pregunta del mini-quiz acertada | 15 | Una vez por pregunta |
| Acierto en el Reto RACI | 25 c/u | Solo en el intento que aprueba por primera vez |
| Hito correcto en el Simulador | 25 | Una vez por proyecto y hito |
| Paso de misión completado | 50 | Una vez |

Los niveles van de 1 a 12 (umbrales: 0, 40, 90, 160, 250, 360, 500, 660, 850, 1060, 1300, 1600 XP). Al ganar XP, subir de nivel u obtener una insignia aparece un aviso flotante.

### Insignias y accesorios

| Insignia | Cómo se gana |
|---|---|
| 🎒 Primer día | Completar "Tu Primer Día en DK" |
| 📅 Primera semana | Completar "Tu Primera Semana" |
| 🧭 Conoces a todos | Conversar con un compañero de cada especialidad y con un AM |
| 🎯 Simulación perfecta | Completar un proyecto del Simulador sin errores |
| 🧠 Maestro de tu rol | Dominar todas las preguntas del mini-quiz de tu rol |

La primera insignia regala el accesorio de tu rol. Cada una de las demás regala el siguiente accesorio que aún no tengas. Se equipan desde el **armario** del panel "Mi progreso" (arriba a la derecha).

### Nivel de seniority

**Lo asigna DataKnow; el jugador no lo elige ni lo cambia.** El juego lo busca por el correo corporativo en el directorio de personas (`Personas` en `rolesWorkflowData.json`), y siempre manda el directorio sobre lo guardado en la partida.

- **Si la persona está en el directorio:** "Mi progreso" muestra su nivel y su próximo nivel, y el quiz se personaliza.
- **Si no está:** aparece como "Pendiente" y el quiz pregunta por los niveles en tercera persona.

> Para usarlo con colaboradores reales, sus correos y niveles deben estar en ese directorio. Hoy contiene 15 personas de ejemplo.

---

## Datos

Todo el contenido sale de [`src/utils/rolesWorkflowData.json`](src/utils/rolesWorkflowData.json), generado a partir de `base/datos.xlsx`:

| Hoja | Uso en el juego |
|---|---|
| `Roles` | Misión, color y ecosistema de cada rol |
| `Niveles`, `Progresion`, `NombresLideres` | Manual de Seniority, quiz y "Tu próximo nivel" |
| `RACI` | Reto RACI, quiz y tablero de Flujos |
| `Flujos`, `TiposProyecto`, `Laterales` | Flujos entre roles y cambios de carrera |
| `Agile`, `AgileSeniority` | Qué espera el AM de cada rol, ceremonias |
| `Personas`, `Proyectos`, `Asignaciones` | Directorio (incluye el nivel), células, Red DK, escritorios, simulador |

- Los clientes de los proyectos son **ficticios**.
- Se ajustaron los textos de los niveles Tech Lead que lo presentaban como gestor del proyecto, para que sean coherentes con la regla del AM.
- Las preguntas del quiz se regeneran solas si cambian los datos. Las 8 situaciones del día a día y las conversaciones de los compañeros están escritas a mano en `quizBank.js` y `npcDialogues.js`.

---

## Estructura del código

```
2D/src/
├── App.jsx                 Estado del jugador, progreso, modales y cableado general
├── components/
│   ├── OfficeCanvas2D.jsx  Bucle del juego (movimiento, cámara, proximidad, render)
│   ├── QuestTrackerHUD.jsx Panel de misión con brújula
│   ├── ProgressPanel.jsx   "Mi progreso": XP, nivel, insignias, armario, quién está
│   ├── XpToasts.jsx        Avisos de XP, nivel e insignias
│   ├── TutorialCoach.jsx   Tutorial de controles
│   ├── MiniQuizModal.jsx   Mini-quiz y el llamado "Pon a prueba lo que aprendiste"
│   ├── RaciChallengeModal.jsx, ProjectSimulatorModal.jsx, NpcDialogueModal.jsx
│   ├── RoleCareerGuideModal.jsx, RoleUnderstandingModal.jsx, ProjectWorkflowModal.jsx
│   ├── DeskProjectsModal.jsx, NetworkGraphModal.jsx, OpenTablesModal.jsx, ...
│   └── AuthModal.jsx       Registro y personalización del avatar
├── utils/
│   ├── officeRenderer.js   Arte del mapa: pisos, muros, mobiliario y avatares
│   ├── officeData.js       Salas, objetos, plantas y bots (coordenadas en px, mapa de 2200×1400)
│   ├── questData.js        Misiones, XP, niveles, insignias, accesorios
│   ├── progressRules.js    Reglas aplicadas a cada cambio de progreso
│   ├── quizBank.js         Generador del banco de preguntas
│   ├── npcDialogues.js     Conversaciones de los compañeros
│   └── rolesWorkflowData.* Datos de la empresa y ayudas para consultarlos
└── styles/index.css        Sistema visual (paneles de vidrio, botones, modales)
```

Puntos clave para quien modifique el código:

- **Bucle del juego:** se monta una sola vez y su estado vive en refs, no en estado de React. Los props más recientes llegan por `propsRef`.
- **Capa estática:** pisos, muros y plantas se dibujan una vez a un canvas fuera de pantalla (a 2× de resolución) y se vuelven a dibujar cuando cargan las fuentes.
- **Progreso:** todo cambio pasa por `updateProgress` en `App.jsx`, que aplica `applyProgressRules`. No hay otro lugar donde se otorgue XP de misión o insignias.
- **Partidas guardadas:** `migrateProgress` completa los campos nuevos al cargar, así que las partidas de versiones anteriores siguen funcionando.
- **Diseño adaptable:** la barra inferior y el panel de misión publican su altura (`--dock-h`, `--hud-b`) para que el chat y los avisos se ubiquen sin solaparse en cualquier tamaño de pantalla.

---

## Limitaciones actuales

- **Multijugador:** se sincroniza con `BroadcastChannel`, así que solo se ven las pestañas del mismo navegador. Los compañeros del mapa son bots.
- **Progreso:** se guarda en `localStorage` (clave `dk_office_player_2d`) del navegador de cada persona. RR.HH. no puede consultarlo y se pierde al cambiar de navegador. La solución está descrita en la Fase 2 de [`DESPLIEGUE_AZURE.md`](../DESPLIEGUE_AZURE.md).
- **Rol:** lo elige el jugador al registrarse, aunque el directorio también lo trae.
- **Inicio de sesión corporativo:** el registro toma nombre y correo de la cuenta corporativa solo cuando el juego está publicado con Entra ID (`/.auth/me`). En local se usa el formulario.
