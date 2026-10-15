import React, { useEffect, useState } from 'react';
import { Sparkles, User, Mail, ShieldCheck, Lock } from 'lucide-react';
import { ROLES, AVATAR_STYLES } from '../utils/officeData';
import { sounds } from '../utils/audio';

export const AuthModal = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0].id);
  // Si el juego está publicado tras el login de Entra ID (Azure Static Web Apps),
  // /.auth/me trae la identidad corporativa: se usa y el correo queda fijo.
  const [corporateEmail, setCorporateEmail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/.auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const principal = data?.clientPrincipal;
        if (cancelled || !principal?.userDetails) return;
        const fullName = principal.claims?.find((c) => c.typ === 'name')?.val;
        setCorporateEmail(principal.userDetails);
        setEmail(principal.userDetails);
        if (fullName) setName(fullName);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const [skin, setSkin] = useState(AVATAR_STYLES.skinTones[0]);
  const [hair, setHair] = useState(AVATAR_STYLES.hairColors[0]);
  const [shirt, setShirt] = useState(AVATAR_STYLES.shirtColors[0]);
  const [pants, setPants] = useState(AVATAR_STYLES.pantColors[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playBadge();

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa tu correo institucional de DataKnow (ej. usuario@dataknow.co)');
      return;
    }

    const selectedRole = ROLES.find((r) => r.id === role);

    const userProfile = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: selectedRole.id,
      roleLabel: selectedRole.label,
      status: 'available',
      statusLabel: 'Disponible 🟢',
      avatar: {
        skin,
        hair,
        shirt,
        pants,
        accessory: null
      }
    };

    onLogin(userProfile);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div className="roblox-logo-container">
            <div className="roblox-logo-badge">
              <svg width="28" height="28" viewBox="0 0 100 100">
                <rect x="5" y="5" width="90" height="90" rx="20" fill="#ffffff" />
                <path d="M 30 75 A 35 35 0 0 1 75 30" stroke="#4017AA" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M 30 58 A 20 20 0 0 1 58 30" stroke="#00C6BD" strokeWidth="8" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="roblox-title">The Office DK</span>
          </div>
          <p className="auth-subtitle" style={{ marginTop: 8 }}>
            Crea tu avatar y entra a la oficina virtual de DataKnow.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tu nombre</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#4017AA' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="ej. Francisco Barrita"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Corporativo DataKnow</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#4017AA' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="colaborador@dataknow.co"
                value={email}
                readOnly={!!corporateEmail}
                title={corporateEmail ? 'Tomado de tu cuenta corporativa de DataKnow' : undefined}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-role">Rol en DataKnow</label>
            <select
              id="auth-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Accesorio de cabeza</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f7f7fb',
              border: '1px dashed rgba(30, 27, 75, 0.2)',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#5b6178',
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <Lock size={16} />
              <span>Se desbloquea al completar la misión "Tu Primer Día en DK" con tu rol.</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Personaliza tu avatar</label>
            <div className="avatar-customizer">
              <div className="avatar-preview-box">
                {/* Vista previa con el mismo estilo chibi del mapa */}
                <svg width="76" height="100" viewBox="0 0 76 100">
                  <ellipse cx="38" cy="94" rx="18" ry="4.5" fill="rgba(30,27,75,0.18)" />
                  <rect x="27" y="70" width="9" height="20" rx="4" fill={pants} />
                  <rect x="40" y="70" width="9" height="20" rx="4" fill={pants} />
                  <rect x="26" y="86" width="11" height="6" rx="3" fill="#1f2937" />
                  <rect x="39" y="86" width="11" height="6" rx="3" fill="#1f2937" />
                  <rect x="14" y="50" width="9" height="20" rx="4.5" fill={shirt} />
                  <rect x="53" y="50" width="9" height="20" rx="4.5" fill={shirt} />
                  <circle cx="18.5" cy="72" r="4" fill={skin} />
                  <circle cx="57.5" cy="72" r="4" fill={skin} />
                  <rect x="22" y="46" width="32" height="28" rx="11" fill={shirt} />
                  <circle cx="38" cy="28" r="20" fill={skin} />
                  <path d={`M 18 28 A 20 20 0 0 1 58 28 L 58 32 Q 48 14 40 21 Q 30 13 18 32 Z`} fill={hair} />
                  <ellipse cx="31" cy="31" rx="2.5" ry="3.2" fill="#1e1b4b" />
                  <ellipse cx="45" cy="31" rx="2.5" ry="3.2" fill="#1e1b4b" />
                  <circle cx="32" cy="30" r="1" fill="#ffffff" />
                  <circle cx="46" cy="30" r="1" fill="#ffffff" />
                  <ellipse cx="26" cy="37" rx="3.2" ry="2" fill="rgba(244,114,182,0.4)" />
                  <ellipse cx="50" cy="37" rx="3.2" ry="2" fill="rgba(244,114,182,0.4)" />
                  <path d="M 34.5 38 Q 38 41.5 41.5 38" stroke="#7c2d12" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#5b6178', fontWeight: 600 }}>Piel</span>
                  <div className="swatch-group">
                    {AVATAR_STYLES.skinTones.map((color) => (
                      <div
                        key={color}
                        className={`swatch ${skin === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSkin(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#5b6178', fontWeight: 600 }}>Cabello</span>
                  <div className="swatch-group">
                    {AVATAR_STYLES.hairColors.map((color) => (
                      <div
                        key={color}
                        className={`swatch ${hair === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setHair(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#5b6178', fontWeight: 600 }}>Camiseta</span>
                  <div className="swatch-group">
                    {AVATAR_STYLES.shirtColors.map((color) => (
                      <div
                        key={color}
                        className={`swatch ${shirt === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setShirt(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="roblox-button primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: 14, fontSize: '0.95rem', borderRadius: 14 }}
          >
            <Sparkles size={18} />
            <span>Entrar a la oficina</span>
          </button>
        </form>
      </div>
    </div>
  );
};
