// Reglas que se aplican cada vez que cambia el progreso: XP por pasos de misión,
// insignias y los accesorios que desbloquea cada insignia.
import {
  ALL_QUEST_STEPS,
  QUESTS,
  CORE_NPC_IDS,
  ACCESSORY_BY_ROLE,
  ACCESSORY_UNLOCK_ORDER,
  isStepComplete
} from './questData';
import { buildRoleQuizBank } from './quizBank';

const earnedBadges = (player, progress) => {
  const completed = new Set(progress.completedSteps);
  const earned = QUESTS.filter((q) => q.steps.every((s) => completed.has(s.id))).map((q) => q.badge);

  if (CORE_NPC_IDS.every((id) => progress.talkedToNpcs.includes(id))) earned.push('explorador_roles');
  if (progress.simPerfect) earned.push('simulador_perfecto');

  const bank = buildRoleQuizBank(player.role, player.seniority);
  if (bank.length > 0 && bank.every((q) => progress.quizCorrectIds.includes(q.id))) earned.push('maestro_rol');
  return earned;
};

export const applyProgressRules = (player, progress) => {
  const next = { ...progress };

  const completed = new Set(next.completedSteps);
  let stepXp = 0;
  ALL_QUEST_STEPS.forEach((s) => {
    if (!completed.has(s.id) && isStepComplete(s.id, next)) {
      completed.add(s.id);
      stepXp += s.xp;
    }
  });
  next.completedSteps = [...completed];
  next.xp = (next.xp || 0) + stepXp;

  let avatar = player.avatar;
  const newBadges = earnedBadges(player, next).filter((b) => !next.badges.includes(b));
  newBadges.forEach((badge) => {
    next.badges = [...next.badges, badge];
    if (badge === 'onboarding_completo') {
      // El primer día regala el accesorio de tu rol y te lo pone de inmediato.
      const own = ACCESSORY_BY_ROLE[player.role];
      if (own) {
        if (!next.unlockedAccessories.includes(own)) next.unlockedAccessories = [...next.unlockedAccessories, own];
        avatar = { ...avatar, accessory: own };
      }
    } else {
      const gift = ACCESSORY_UNLOCK_ORDER.find((a) => !next.unlockedAccessories.includes(a));
      if (gift) next.unlockedAccessories = [...next.unlockedAccessories, gift];
    }
  });

  return { progress: next, avatar, newBadges };
};
