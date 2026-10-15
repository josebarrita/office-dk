import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Users, LogOut, GitPullRequest, Award, Play, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { STATUS_OPTIONS } from '../utils/officeData';
import { getLevelInfo } from '../utils/questData';
import { sounds } from '../utils/audio';

export const UserBar = ({
  player,
  onOpenDirectory,
  onOpenWorkflows,
  onOpenCareerGuide,
  onOpenProjectSimulator,
  onOpenNetwork,
  onUpdateStatus,
  onLogout
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMinimize = () => {
    sounds.playClick();
    setShowStatusMenu(false);
    setIsMinimized((prev) => !prev);
  };

  const { level, progressPct } = getLevelInfo(player.progress?.xp);

  // El dock cambia de alto según cuántas filas ocupa; el chat y el aviso de
  // interacción leen --dock-h para ubicarse siempre justo encima.
  const barRef = useRef(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      root.style.setProperty('--dock-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--dock-h');
    };
  }, []);

  return (
    <div ref={barRef} className={`user-bar ${isMinimized ? 'minimized' : ''}`}>
      {/* Player Avatar Block — al hacer clic también expande/colapsa la barra */}
      <div
        className="bar-avatar"
        style={{
          background: `linear-gradient(135deg, ${player.avatar?.shirt || '#4017AA'}, #1e1b4b)`,
          cursor: 'pointer'
        }}
        onClick={handleToggleMinimize}
        title={isMinimized ? 'Mostrar menú' : 'Minimizar menú'}
      >
        {player.name ? player.name.substring(0, 2).toUpperCase() : 'DK'}
      </div>

      {/* User Info */}
      <div className="user-info" onClick={handleToggleMinimize} style={{ cursor: 'pointer' }}>
        <span className="user-name">{player.name}</span>
        <span className="user-role">{player.roleLabel}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4017AA', whiteSpace: 'nowrap' }}>
            Nv.{level}
          </span>
          <div style={{ width: 54, height: 5, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#00C6BD' }} />
          </div>
        </div>
      </div>

      {/* Toggle Minimizar / Expandir */}
      <button
        className="roblox-button bar-toggle"
        onClick={handleToggleMinimize}
        title={isMinimized ? 'Mostrar menú' : 'Minimizar menú'}
      >
        {isMinimized ? <ChevronUp size={16} style={{ color: '#4017AA' }} /> : <ChevronDown size={16} style={{ color: '#4017AA' }} />}
      </button>

      {isMinimized ? null : (
        <>
      <div className="divider-vert" />

      {/* Status Picker Pill */}
      <div style={{ position: 'relative' }}>
        <button
          className="roblox-button"
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          onClick={() => setShowStatusMenu(!showStatusMenu)}
        >
          <span>{player.statusLabel || 'Disponible 🟢'}</span>
        </button>

        {showStatusMenu && (
          <div style={{
            position: 'absolute',
            bottom: 55,
            left: 0,
            background: '#ffffff',
            border: '3px solid #cbd5e1',
            borderRadius: 14,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            width: 170,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 800
          }}>
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st.id}
                className="roblox-button"
                style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '6px 10px', boxShadow: 'none' }}
                onClick={() => {
                  sounds.playClick();
                  onUpdateStatus(st.id, st.label);
                  setShowStatusMenu(false);
                }}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="divider-vert" />

      {/* Workflow & RACI quick access */}
      <button className="roblox-button" onClick={() => { sounds.playClick(); onOpenWorkflows(); }} title="Ver Flujos de Proyectos & RACI">
        <GitPullRequest size={16} style={{ color: '#0284c7' }} />
        <span>Flujos & RACI</span>
      </button>

      {/* Career & Seniority guide */}
      <button className="roblox-button" onClick={() => { sounds.playClick(); onOpenCareerGuide(); }} title="Ver Manual de Seniority">
        <Award size={16} style={{ color: '#f59e0b' }} />
        <span>Seniority</span>
      </button>

      {/* Project Simulator */}
      <button className="roblox-button" onClick={() => { sounds.playClick(); onOpenProjectSimulator(); }} title="Simular Proyectos Reales DK">
        <Play size={16} style={{ color: '#10b981' }} />
        <span>Simulador</span>
      </button>

      {/* Network / Connections Graph */}
      <button className="roblox-button" onClick={() => { sounds.playClick(); onOpenNetwork(); }} title="Ver Red de Proyectos y Personas">
        <Share2 size={16} style={{ color: '#00C6BD' }} />
        <span>Red DK</span>
      </button>

      {/* Online Coworkers Directory */}
      <button className="roblox-button" onClick={() => { sounds.playClick(); onOpenDirectory(); }}>
        <Users size={16} style={{ color: '#4017AA' }} />
        <span>Equipo</span>
      </button>

      {/* Mute Audio Toggle */}
      <button className="roblox-button" onClick={handleToggleMute} title={isMuted ? 'Desactivar Silencio' : 'Silenciar Sonidos'}>
        {isMuted ? <VolumeX size={16} style={{ color: '#ef4444' }} /> : <Volume2 size={16} style={{ color: '#10b981' }} />}
      </button>

      {/* Exit/Logout Button */}
      <button className="roblox-button" onClick={onLogout} title="Salir de la Oficina">
        <LogOut size={16} style={{ color: '#ef4444' }} />
      </button>
        </>
      )}
    </div>
  );
};
