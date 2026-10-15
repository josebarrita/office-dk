// Conversaciones de los compañeros bot: una anécdota de su día a día y una
// pregunta ligera. Cada bot tiene varias; se van desbloqueando en orden.
// La respuesta correcta se escribe primero, pero las opciones se mezclan al mostrarse.
const d = (greeting, question, options, feedbackCorrect, feedbackWrong) => ({
  greeting,
  question,
  options,
  correctIndex: 0,
  feedbackCorrect,
  feedbackWrong
});

export const NPC_DIALOGUES = {
  bot_sofia: [
    d('¡Hola! Soy Sofia, Data Engineer. Hoy estuve armando el pipeline de ingesta para Retail Nova, de esos que corren solos cada noche.',
      'Un pipeline falla a las 3am. ¿Qué reviso primero?',
      ['Los logs de la ejecución fallida', 'Reinicio el servidor sin mirar nada', 'Espero a que alguien más lo note'],
      '¡Exacto! Los logs cuentan casi toda la historia antes de tocar nada.',
      'Lo primero es revisar los logs de la ejecución: ahí está casi toda la respuesta antes de reiniciar algo a ciegas.'),
    d('Hoy el Científico de Datos me pidió un dataset para entrenar. Mi trabajo es que le llegue limpio y a tiempo.',
      '¿Qué le entrega principalmente un Data Engineer al Científico de Datos?',
      ['Datos limpios y confiables para entrenar modelos', 'El modelo de IA ya entrenado', 'Los dashboards para el cliente'],
      '¡Así es! Los datos limpios son la base de todo lo que hace el Científico.',
      'El Data Engineer entrega datos limpios y confiables; el modelo lo entrena el Científico y los dashboards los hace BI.'),
    d('Ayer tenía dudas de si mi pipeline seguía el estándar de arquitectura de DK.',
      '¿A quién le pregunté para validarlo?',
      ['Al Engineer Tech Lead', 'Al Agile Manager del proyecto', 'A nadie, lo publiqué igual'],
      '¡Correcto! El Tech Lead resuelve las dudas técnicas y vela por los estándares.',
      'Para dudas técnicas y de estándares se acude al Tech Lead. El AM coordina tiempos y entregables, no valida lo técnico.')
  ],
  bot_mateo: [
    d('Soy Mateo, Científico de Datos. Ando entrenando un modelo de fuga de clientes; hoy tocó pelear con el desbalance de clases.',
      'Mi modelo funciona perfecto en mi laptop. ¿Ya está listo para producción?',
      ['No, falta validar con datos reales y monitoreo de drift', 'Sí, si corre en mi máquina corre en cualquier lado', 'Sí, basta con subirlo a un servidor'],
      '¡Correcto! "Funciona en mi laptop" y "listo para producción" son cosas muy distintas en IA.',
      'Un modelo que funciona en tu laptop todavía necesita validación con datos reales y monitoreo de drift antes de llegar a producción.'),
    d('Cuando mi modelo está listo, no lo despliego yo solo en producción.',
      '¿Con quién trabajo el despliegue del modelo?',
      ['Con DevOps/MLOps, que automatiza el despliegue', 'Con el Analista BI', 'Con el cliente directamente'],
      '¡Exacto! DevOps/MLOps se encarga del despliegue y la operación del modelo.',
      'El despliegue lo hace el equipo de DevOps/MLOps: automatiza la infraestructura y el paso a producción.'),
    d('Antes de un experimento largo acuerdo con el AM cuánto tiempo le vamos a dar.',
      '¿Por qué fijar un tiempo límite (timebox) para los experimentos?',
      ['Para proteger el cronograma con un criterio claro de éxito o abandono', 'Porque los experimentos no sirven', 'Para no tener que documentar resultados'],
      '¡Así es! El timebox evita que un experimento se coma el sprint sin resultados.',
      'El timebox protege el cronograma: se acuerda de antemano cuándo el experimento se da por exitoso o se abandona.')
  ],
  bot_camila: [
    d('Soy Camila, Analista BI. Terminé los tableros para la junta directiva; lo difícil fue definir qué métrica importaba de verdad.',
      'El cliente pide "un dashboard con todo". ¿Qué hago primero?',
      ['Preguntar qué decisión va a tomar con esos datos', 'Meter todas las columnas de la base en una tabla', 'Empezar a diseñar gráficas de inmediato'],
      '¡Así es! Un buen dashboard nace de la decisión que debe soportar, no de las columnas disponibles.',
      'Mejor empezar preguntando qué decisión va a tomar el cliente con esos datos; si no, terminas con "todo" y nada útil.'),
    d('Los datos que uso llegan ya modelados desde Data Engineering.',
      '¿Qué recibe el Analista BI del Data Engineer?',
      ['Datos modelados listos para analizar', 'Modelos de ML entrenados', 'Pruebas automatizadas'],
      '¡Correcto! Data Engineering me entrega datos modelados y yo los convierto en información para decidir.',
      'Del Data Engineer recibo datos modelados. Los modelos de ML vienen del Científico y las pruebas de QA.'),
    d('Un KPI mal definido puede llevar al cliente a una mala decisión.',
      'Antes de construir un indicador, ¿qué conviene acordar?',
      ['Su definición y su fórmula con el negocio', 'Solo el color del gráfico', 'Nada, se ajusta después'],
      '¡Exacto! Si el negocio y BI no definen igual el KPI, el tablero pierde credibilidad.',
      'Primero se acuerda con el negocio qué significa el indicador y cómo se calcula; lo visual viene después.')
  ],
  bot_lucas: [
    d('Soy Lucas, DevOps/MLOps. Hoy configuré el pipeline de CI/CD para que el modelo solo se despliegue si pasa las pruebas.',
      'Un despliegue puede romper producción. ¿Qué práctica reduce ese riesgo?',
      ['Automatizar pruebas y desplegar de forma gradual, con rollback', 'Desplegar directo los viernes en la tarde', 'Avisar por chat y cruzar los dedos'],
      '¡Exacto! Pruebas automatizadas y despliegues graduales es justo lo que hace confiable a MLOps.',
      'La práctica real es automatizar pruebas y desplegar de forma gradual con posibilidad de rollback.'),
    d('Mi equipo prepara la infraestructura y el CI/CD que usan los Data Engineers.',
      '¿Qué le entrega DevOps al Data Engineer?',
      ['CI/CD e infraestructura', 'Dashboards ejecutivos', 'Casos de prueba manuales'],
      '¡Correcto! Sin infraestructura y CI/CD, los pipelines no llegan a producción de forma segura.',
      'DevOps le entrega CI/CD e infraestructura al Data Engineer; los dashboards son de BI y las pruebas de QA.'),
    d('Hoy un servicio se cayó de madrugada y la alerta nos llegó antes que la queja del cliente.',
      '¿Para qué sirve el monitoreo con alertas?',
      ['Para detectar fallas antes de que las note el cliente', 'Para reemplazar las pruebas', 'Para medir las horas trabajadas'],
      '¡Así es! Monitorear es enterarte primero y actuar antes de que el cliente sufra la falla.',
      'El monitoreo con alertas sirve para detectar las fallas antes que el cliente; no reemplaza las pruebas.')
  ],
  bot_valentina: [
    d('Soy Valentina, Ingeniera QA. Hoy encontré un caso raro: el agente de IA respondía bien... hasta que le preguntabas dos veces seguidas.',
      '¿Qué es "groundedness" cuando pruebo un asistente de IA?',
      ['Que la respuesta esté respaldada por la fuente o el documento real', 'Que la respuesta sea rápida', 'Que la respuesta suene segura de sí misma'],
      '¡Correcto! Groundedness es que la respuesta esté anclada a una fuente real, no que "suene bien".',
      'Groundedness es que la respuesta esté respaldada por una fuente real: puede sonar muy segura y aun así estar inventada.'),
    d('En el refinement siempre pregunto: ¿cómo vamos a saber que esto está terminado?',
      '¿Qué necesita QA desde el refinement?',
      ['Criterios de aceptación claros', 'Que el cliente pruebe todo él mismo', 'Nada, QA solo entra al final'],
      '¡Exacto! Con criterios de aceptación claros, todos comparten la misma definición de "terminado".',
      'QA necesita criterios de aceptación claros desde el refinement; entrar solo al final sale caro.'),
    d('Ayer arreglaron un bug y, sin querer, rompieron otra cosa que ya funcionaba.',
      '¿Qué tipo de prueba detecta ese problema?',
      ['Pruebas de regresión', 'Una demo con el cliente', 'Revisar el diseño gráfico'],
      '¡Así es! Las pruebas de regresión confirman que lo que ya funcionaba sigue funcionando.',
      'Eso lo detectan las pruebas de regresión: vuelven a probar lo que ya funcionaba después de cada cambio.')
  ],
  bot_carlos: [
    d('Soy Carlos, Agile Manager. Hoy facilité el daily de mis 5 proyectos y negocié el alcance de uno que se estaba saliendo de tiempo.',
      'Un cliente pide "una cosa más" a mitad de sprint. ¿Qué hago como AM?',
      ['Evaluar el impacto en tiempo y alcance, y negociarlo con el cliente', 'Meterlo igual, para no incomodar al cliente', 'Decir que no se puede y ya'],
      '¡Así es! El AM protege el cronograma negociando el impacto, no diciendo "sí" o "no" a todo.',
      'Lo correcto es evaluar el impacto en tiempo y alcance y negociarlo con el cliente.'),
    d('Cada mañana facilito la daily de mis equipos: 15 minutos, ni uno más.',
      '¿Qué se comparte en la daily?',
      ['Avances, plan del día y bloqueos', 'El detalle técnico de cada solución', 'Las horas trabajadas de cada uno'],
      '¡Correcto! La daily sincroniza al equipo y saca a la luz los bloqueos.',
      'En la daily se comparten avances, el plan del día y los bloqueos; lo técnico se resuelve después.'),
    d('Al final del sprint le mostramos al cliente lo que construimos y recogemos su retroalimentación.',
      '¿Cómo se llama esa ceremonia?',
      ['Sprint review', 'Retrospectiva', 'Refinement'],
      '¡Exacto! En la sprint review el cliente ve el avance real y da retroalimentación.',
      'Es la sprint review. La retrospectiva es para mejorar el proceso interno y el refinement para preparar historias.')
  ],
  bot_daniela: [
    d('Soy Daniela, Agile Manager de la cartera de IA y Modelos. Hoy le expliqué a un cliente por qué "demo" no es lo mismo que "producción".',
      'Tu equipo de Data Science pide más tiempo para "un experimento más". ¿Qué haces?',
      ['Pides un criterio claro de éxito o abandono y un timebox', 'Les das tiempo ilimitado, la ciencia toma su tiempo', 'Cancelas el experimento sin preguntar'],
      '¡Exacto! En proyectos de IA, el AM protege el tiempo con timeboxing y criterios claros.',
      'La clave es pedir un criterio de éxito o abandono y ponerle un timebox: ni tiempo infinito ni cancelar sin datos.'),
    d('En el refinement aterrizamos las historias de usuario antes de planificarlas.',
      '¿Qué se busca en el refinement?',
      ['Aclarar historias, criterios de aceptación y estimaciones', 'Mostrarle el producto al cliente', 'Evaluar el desempeño del equipo'],
      '¡Correcto! Un buen refinement hace que el sprint planning sea rápido y realista.',
      'El refinement sirve para aclarar historias, criterios de aceptación y estimaciones antes del planning.'),
    d('En la retro mi equipo propone cómo trabajar mejor el próximo sprint.',
      '¿Cuál es el objetivo de la retrospectiva?',
      ['Mejorar el proceso con acciones concretas', 'Encontrar al culpable de lo que salió mal', 'Revisar el avance con el cliente'],
      '¡Así es! La retro es para mejorar cómo trabajamos, sin buscar culpables.',
      'La retrospectiva busca mejorar el proceso con acciones concretas; la revisión con el cliente es la sprint review.')
  ],
  bot_andres: [
    d('Soy Andrés, Agile Manager de Plataforma y Conversacional. Hoy tocó pedir un QA prestado a otra célula para el chatbot de Seguros Delta.',
      'Tu equipo no tiene capacidad para una tarea urgente. ¿Qué es válido hacer?',
      ['Pedir prestado a alguien con tiempo libre en otra célula', 'Sumarle trabajo a quien ya está al 100%', 'Ignorar la urgencia hasta el próximo sprint'],
      '¡Correcto! Pedir prestado entre células es la excepción válida cuando el propio equipo no alcanza.',
      'Lo válido es pedir prestada a una persona con capacidad libre en otra célula, no sobrecargar a quien ya está al límite.'),
    d('En el sprint planning el equipo se compromete con lo que va a entregar.',
      '¿Quién facilita el sprint planning y cuida que el compromiso sea realista?',
      ['El Agile Manager', 'El Tech Lead', 'El cliente'],
      '¡Exacto! El AM facilita el planning y cuida que el compromiso quepa en el sprint.',
      'Lo facilita el Agile Manager, dueño del proyecto. El Tech Lead aporta criterio técnico, no gestiona el compromiso.'),
    d('Cuando alguien me avisa temprano de un bloqueo, casi siempre llegamos a tiempo.',
      'Si estás bloqueado, ¿cuándo deberías avisarle al AM?',
      ['Lo antes posible, idealmente en la daily', 'Solo si el bloqueo dura más de un sprint', 'Nunca, hay que resolverlo solo'],
      '¡Así es! Escalar temprano le da al AM margen para gestionar la dependencia.',
      'Hay que avisar lo antes posible, idealmente en la daily: esperar solo reduce el margen para resolverlo.')
  ]
};

// Siguiente conversación sin responder; si ya respondió todas, una al azar como repaso.
export const pickNpcDialogue = (botId, answeredIds = []) => {
  const list = NPC_DIALOGUES[botId] || [];
  if (list.length === 0) return null;
  const nextIndex = list.findIndex((_, i) => !answeredIds.includes(`${botId}:${i}`));
  const index = nextIndex >= 0 ? nextIndex : Math.floor(Math.random() * list.length);
  return { index, id: `${botId}:${index}`, dialogue: list[index], isNew: nextIndex >= 0, total: list.length };
};
