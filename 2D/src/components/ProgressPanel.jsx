import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, Users, Lock, ArrowUpRight } from 'lucide-react';
import { PROGRESION_DATA } from '../utils/rolesWorkflowData';
import { getLevelInfo, BADGES, ACCESSORIES, SENIORITY_LEVELS } from '../utils/questData';
import { sounds } from '../utils/audio';

const Avatar = ({ user, size = 26 }) => (
  <div
    className="pp-avatar"
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg, ${user.avatar?.shirt || '#4017AA'}, #1e1b4b)`
    }}
  >
    {user.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
  </div>
);

export const ProgressPanel = ({ player, users, onEquipAccessory, onOpenCareer }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('progreso');
  const progress = player.progress || {};
  const { level, xp, nextCeil, progressPct } = getLevelInfo(progress.xp);
  const badges = progress.badges || [];
  const unlocked = progress.unlockedAccessories || [];
  const equipped = player.avatar?.accessory || null;

  const seniority = player.seniority || '';
  const nextLevel = seniority ? SENIORITY_LEVELS[SENIORITY_LEVELS.indexOf(seniority) + 1] : null;
  const progression = nextLevel && PROGRESION_DATA.find((p) => p.rol === player.role && p.hacia === nextLevel);

  const people = [player, ...users.filter((u) => u.id !== player.id)];

  const toggle = () => {
    sounds.playClick();
    setCollapsed((c) => !c);
  };

  return (
    <div className="roblox-leaderboard progress-panel">
      <div className="leaderboard-header" onClick={toggle} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} />
          <span>Nv. {level} · {xp} XP</span>
        </div>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {!collapsed && (
        <>
          <div className="pp-tabs">
            <button className={tab === 'progreso' ? 'active' : ''} onClick={() => setTab('progreso')}>
              <Trophy size={13} /> Mi progreso
            </button>
            <button className={tab === 'oficina' ? 'active' : ''} onClick={() => setTab('oficina')}>
              <Users size={13} /> En la oficina ({people.length})
            </button>
          </div>

          {tab === 'progreso' && (
            <div className="pp-body">
              <div className="pp-xp">
                <div className="pp-xp-bar"><span style={{ width: `${progressPct}%` }} /></div>
                <span>Faltan {Math.max(0, nextCeil - xp)} XP para el nivel {level + 1}</span>
              </div>

              <div className="pp-label">Tu nivel de seniority</div>
              <div className="pp-seniority">
                {seniority ? (
                  <>
                    <strong>{seniority}</strong>
                    <span>Asignado por DataKnow</span>
                  </>
                ) : (
                  <span>Pendiente: DataKnow aún no tiene registrado tu nivel.</span>
                )}
              </div>

              {progression && (
                <button className="pp-next" onClick={() => { sounds.playClick(); onOpenCareer(nextLevel); }}>
                  <span className="pp-next-title">
                    Próximo nivel: <strong>{nextLevel}</strong> · {progression.tiempo}
                    <ArrowUpRight size={14} />
                  </span>
                  <span className="pp-next-text">{progression.cambio}</span>
                </button>
              )}
              {seniority && !progression && (
                <p className="pp-hint">Estás en el nivel más alto de tu especialidad.</p>
              )}

              <div className="pp-label">Insignias ({badges.length}/{BADGES.length})</div>
              <div className="pp-badges">
                {BADGES.map((b) => {
                  const has = badges.includes(b.id);
                  return (
                    <div key={b.id} className={`pp-badge ${has ? '' : 'locked'}`} title={`${b.title}: ${b.desc}`}>
                      <span className="pp-badge-icon">{has ? b.icon : <Lock size={14} />}</span>
                      <span className="pp-badge-title">{b.title}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pp-label">Armario de accesorios</div>
              {unlocked.length === 0 ? (
                <p className="pp-hint">Gana insignias para desbloquear accesorios para tu avatar.</p>
              ) : (
                <div className="pp-wardrobe">
                  <button className={!equipped ? 'active' : ''} onClick={() => onEquipAccessory(null)}>Ninguno</button>
                  {unlocked.map((a) => (
                    <button key={a} className={equipped === a ? 'active' : ''} onClick={() => onEquipAccessory(a)}>
                      {ACCESSORIES[a] || a}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'oficina' && (
            <div className="leaderboard-list">
              {people.map((u) => {
                const isSelf = u.id === player.id;
                return (
                  <div key={u.id} className={`leaderboard-item ${isSelf ? 'self' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <Avatar user={u} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span className="pp-person-name">{u.name} {isSelf && '(Tú)'}</span>
                        <span className="pp-person-role">{u.roleLabel}</span>
                      </div>
                    </div>
                    <span className="pp-person-status">{u.statusLabel || 'Disponible 🟢'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
