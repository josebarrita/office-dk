import React, { useEffect, useRef, useState } from 'react';
import { getLevelInfo, BADGES, ACCESSORIES } from '../utils/questData';

const TOAST_MS = 2800;

// Muestra lo que el jugador acaba de ganar comparando el progreso con el anterior.
export const XpToasts = ({ progress }) => {
  const [toasts, setToasts] = useState([]);
  const prevRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!progress) return;
    const snapshot = {
      xp: progress.xp || 0,
      badges: progress.badges || [],
      accessories: progress.unlockedAccessories || []
    };
    const prev = prevRef.current;
    prevRef.current = snapshot;
    if (!prev) return;

    const fresh = [];
    const push = (kind, text, sub) => fresh.push({ id: ++idRef.current, kind, text, sub });
    const gained = snapshot.xp - prev.xp;
    if (gained > 0) push('xp', `+${gained} XP`);

    const before = getLevelInfo(prev.xp).level;
    const after = getLevelInfo(snapshot.xp).level;
    if (after > before) push('level', `¡Subiste al nivel ${after}!`);

    snapshot.badges.filter((b) => !prev.badges.includes(b)).forEach((b) => {
      const badge = BADGES.find((x) => x.id === b);
      if (badge) push('badge', `${badge.icon} Insignia: ${badge.title}`, badge.desc);
    });
    snapshot.accessories.filter((a) => !prev.accessories.includes(a)).forEach((a) => {
      push('badge', '🎁 Nuevo accesorio', `${ACCESSORIES[a] || a} · equípalo en "Mi progreso"`);
    });

    if (fresh.length === 0) return;
    setToasts((t) => [...t, ...fresh]);
    fresh.forEach((toast) => {
      const ms = toast.kind === 'xp' ? TOAST_MS : TOAST_MS + 1600;
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), ms);
    });
  }, [progress?.xp, progress?.badges?.length, progress?.unlockedAccessories?.length]);

  return (
    <div className="xp-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`xp-toast ${t.kind}`}>
          <strong>{t.text}</strong>
          {t.sub && <span>{t.sub}</span>}
        </div>
      ))}
    </div>
  );
};
