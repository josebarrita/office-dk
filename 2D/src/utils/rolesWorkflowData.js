import rawData from './rolesWorkflowData.json';

export const ROLES_DATA = rawData.Roles || [];
export const NIVELES_DATA = rawData.Niveles || [];
export const PROGRESION_DATA = rawData.Progresion || [];
export const FLUJOS_DATA = rawData.Flujos || [];
export const LATERALES_DATA = rawData.Laterales || [];
export const AGILE_DATA = rawData.Agile || [];
export const AGILE_SENIORITY_DATA = rawData.AgileSeniority || [];
export const RACI_DATA = rawData.RACI || [];
export const TIPOS_PROYECTO_DATA = rawData.TiposProyecto || [];
export const PERSONAS_DATA = rawData.Personas || [];
export const PROYECTOS_DATA = rawData.Proyectos || [];
export const ASIGNACIONES_DATA = rawData.Asignaciones || [];
export const NOMBRES_LIDERES_DATA = rawData.NombresLideres || [];

export const getLeaderTitlesForRole = (roleKey) => {
  return NOMBRES_LIDERES_DATA.find((l) => l.rol === roleKey) || null;
};

export const getRoleInfo = (roleKey) => {
  return ROLES_DATA.find((r) => r.clave === roleKey) || ROLES_DATA[0];
};

export const getLevelsForRole = (roleKey) => {
  return NIVELES_DATA.filter((n) => n.rol === roleKey);
};

export const getFlowsForProjectType = (typeKey) => {
  if (!typeKey || typeKey === 'all') {
    return FLUJOS_DATA;
  }
  const projType = TIPOS_PROYECTO_DATA.find((t) => t.clave === typeKey);
  if (!projType || !projType.flujos_activos) return FLUJOS_DATA;

  const activeIds = projType.flujos_activos.split(',').map((s) => s.trim());
  return FLUJOS_DATA.filter((f) => activeIds.includes(f.id));
};

export const getLateralsForRole = (roleKey) => {
  return LATERALES_DATA.filter((l) => l.desde === roleKey || l.hacia === roleKey);
};

export const getAgileForRole = (roleKey) => {
  return AGILE_DATA.find((a) => a.rol === roleKey) || null;
};

// El nivel de seniority lo asigna DataKnow: se toma del directorio de personas
// por correo corporativo. null = la persona aún no está registrada.
export const getCompanySeniority = (email) => {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return null;
  return PERSONAS_DATA.find((p) => (p.email || '').toLowerCase() === normalized)?.nivel || null;
};
