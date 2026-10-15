// Arte del mundo 2D: estilo "diorama" con pisos por material, muros con
// profundidad 3/4, mobiliario detallado y avatares chibi.
import { OFFICE_WIDTH, OFFICE_HEIGHT, ROOMS, PLANTS } from './officeData';

const FONT = 'Outfit, "Plus Jakarta Sans", sans-serif';
const INK = '#1e1b4b';

export const ROLE_COLORS = {
  de: '#48C1C1',
  ds: '#4017AA',
  bi: '#FF7E1D',
  do: '#4690B9',
  qa: '#FF453C',
  agile: '#f59e0b'
};
const ROLE_CODES = { de: 'DE', ds: 'DS', bi: 'BI', do: 'DO', qa: 'QA', agile: 'AM' };

const ROOM_STYLE = {
  workflow_hub: { floor: '#f1edfd', line: 'rgba(64,23,170,0.07)', pattern: 'tiles', face: '#d9cff8' },
  central_plaza: { floor: '#fcf1f5', line: 'rgba(219,39,119,0.08)', pattern: 'pavers', face: '#f5d0e1' },
  coffee_lounge: { floor: '#f7ead8', line: 'rgba(146,94,48,0.14)', pattern: 'planks', face: '#eed3ae' },
  workstation_zone: { floor: '#ecf7f2', line: 'rgba(16,185,129,0.09)', pattern: 'tiles', face: '#c9eadb' }
};

// Aberturas en los muros donde los pasillos entran a cada sala.
const DOORS = [
  { x: 570, y: 300, w: 22, h: 80 },
  { x: 280, y: 588, w: 80, h: 24 },
  { x: 628, y: 300, w: 22, h: 80 },
  { x: 1350, y: 588, w: 80, h: 24 },
  { x: 280, y: 648, w: 80, h: 52 },
  { x: 570, y: 950, w: 22, h: 80 },
  { x: 1350, y: 648, w: 80, h: 52 },
  { x: 628, y: 950, w: 22, h: 80 }
];

// ---------- helpers ----------
const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const ellipse = (ctx, x, y, rx, ry) => {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2);
};

export const shade = (hex, amt) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const target = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  r = Math.round(r + (target - r) * k);
  g = Math.round(g + (target - g) * k);
  b = Math.round(b + (target - b) * k);
  return `rgb(${r},${g},${b})`;
};

const alpha = (hex, a) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const hashStr = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// Pastilla de texto centrada en (cx, cy). Devuelve su ancho.
const drawPill = (ctx, text, cx, cy, opts = {}) => {
  const {
    bg = 'rgba(255,255,255,0.96)',
    color = INK,
    font = `700 12px ${FONT}`,
    h = 24,
    padX = 11,
    shadow = true,
    dot = null
  } = opts;
  ctx.save();
  ctx.font = font;
  const tw = ctx.measureText(text).width;
  const dotW = dot ? 12 : 0;
  const w = tw + padX * 2 + dotW;
  if (shadow) {
    ctx.shadowColor = 'rgba(30,27,75,0.18)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
  }
  ctx.fillStyle = bg;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (dot) {
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(cx - w / 2 + padX + 3, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx - w / 2 + padX + dotW, cy + 0.5);
  ctx.restore();
  return w;
};

// ==========================================
// CAPA ESTÁTICA
// ==========================================
const drawSlab = (ctx) => {
  ctx.save();
  // Grosor del "diorama"
  ctx.fillStyle = '#c9c4e6';
  rr(ctx, 24, 40, OFFICE_WIDTH - 48, OFFICE_HEIGHT - 52, 40);
  ctx.shadowColor = 'rgba(8,6,30,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fill();
  ctx.restore();

  const floor = ctx.createLinearGradient(0, 0, OFFICE_WIDTH, OFFICE_HEIGHT);
  floor.addColorStop(0, '#f6f5fb');
  floor.addColorStop(1, '#e9e8f2');
  ctx.fillStyle = floor;
  rr(ctx, 24, 24, OFFICE_WIDTH - 48, OFFICE_HEIGHT - 52, 40);
  ctx.fill();

  // Retícula de puntos muy sutil
  ctx.fillStyle = 'rgba(64,23,170,0.07)';
  for (let x = 44; x < OFFICE_WIDTH - 30; x += 28) {
    for (let y = 44; y < OFFICE_HEIGHT - 34; y += 28) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
};

const drawHallways = (ctx) => {
  ctx.save();
  ctx.fillStyle = '#e4e3ef';
  rr(ctx, 592, 56, 36, OFFICE_HEIGHT - 116, 18);
  ctx.fill();
  rr(ctx, 40, 612, OFFICE_WIDTH - 80, 36, 18);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(610, 70);
  ctx.lineTo(610, OFFICE_HEIGHT - 74);
  ctx.moveTo(56, 630);
  ctx.lineTo(OFFICE_WIDTH - 56, 630);
  ctx.stroke();
  ctx.restore();
};

const drawRoomFloor = (ctx, room) => {
  const st = ROOM_STYLE[room.id];
  const { x, y, width: w, height: h } = room;
  ctx.save();
  rr(ctx, x, y, w, h, 20);
  ctx.clip();
  ctx.fillStyle = st.floor;
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = st.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (st.pattern === 'tiles') {
    for (let gx = x; gx < x + w; gx += 48) {
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
    }
    for (let gy = y; gy < y + h; gy += 48) {
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
    }
    ctx.stroke();
  } else if (st.pattern === 'pavers') {
    let row = 0;
    for (let gy = y; gy < y + h; gy += 36, row++) {
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      const off = row % 2 ? 36 : 0;
      for (let gx = x - off; gx < x + w; gx += 72) {
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + 36);
      }
    }
    ctx.stroke();
  } else if (st.pattern === 'planks') {
    let row = 0;
    for (let gy = y; gy < y + h; gy += 24, row++) {
      let gx = x - ((row * 97) % 180);
      let i = 0;
      while (gx < x + w) {
        const len = 140 + ((row * 53 + i * 71) % 130);
        ctx.fillStyle = (row + i) % 3 === 0 ? 'rgba(146,94,48,0.05)' : 'rgba(255,255,255,0.12)';
        ctx.fillRect(gx, gy, len, 24);
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + 24);
        gx += len;
        i++;
      }
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
    }
    ctx.stroke();
  }

  // Luz ambiental: más clara arriba a la izquierda
  const light = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
  light.addColorStop(0, 'rgba(255,255,255,0.45)');
  light.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = light;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
};

const drawWalls = (scale) => {
  const wall = document.createElement('canvas');
  wall.width = OFFICE_WIDTH * scale;
  wall.height = OFFICE_HEIGHT * scale;
  const ctx = wall.getContext('2d');
  ctx.scale(scale, scale);

  ROOMS.forEach((room) => {
    const st = ROOM_STYLE[room.id];
    const { x, y, width: w, height: h } = room;

    // Sombra que proyecta el muro superior sobre el piso
    ctx.save();
    rr(ctx, x, y, w, h, 20);
    ctx.clip();
    const sh = ctx.createLinearGradient(0, y + 22, 0, y + 42);
    sh.addColorStop(0, 'rgba(30,27,75,0.13)');
    sh.addColorStop(1, 'rgba(30,27,75,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(x, y + 22, w, 20);

    // Cara frontal del muro superior (vista 3/4)
    const face = ctx.createLinearGradient(0, y, 0, y + 24);
    face.addColorStop(0, shade(st.face, 0.25));
    face.addColorStop(1, shade(st.face, -0.06));
    ctx.fillStyle = face;
    ctx.fillRect(x, y, w, 24);
    ctx.restore();

    ctx.strokeStyle = 'rgba(30,27,75,0.16)';
    ctx.lineWidth = 15;
    rr(ctx, x, y, w, h, 20);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 11;
    ctx.stroke();
  });

  ctx.globalCompositeOperation = 'destination-out';
  DOORS.forEach((d) => {
    ctx.fillRect(d.x, d.y, d.w, d.h);
  });
  return wall;
};

const drawDoorThresholds = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(30,27,75,0.06)';
  DOORS.forEach((d) => {
    rr(ctx, d.x, d.y, d.w, d.h, 6);
    ctx.fill();
  });
  ctx.restore();
};

const drawRoomSign = (ctx, room) => {
  const { x, y, width: w } = room;
  ctx.save();
  const nameFont = `800 15px ${FONT}`;
  const subFont = `500 12px ${FONT}`;
  ctx.font = nameFont;
  const nameW = ctx.measureText(room.name).width;
  ctx.font = subFont;
  const sub = `  ·  ${room.subtitle}`;
  let subW = ctx.measureText(sub).width;
  const chip = 26;
  let pillW = 10 + chip + 10 + nameW + subW + 16;
  const showSub = pillW <= w - 48;
  if (!showSub) {
    pillW -= subW;
    subW = 0;
  }
  const px = x + 26;
  const py = y - 19;
  const ph = 38;

  ctx.shadowColor = 'rgba(30,27,75,0.20)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#ffffff';
  rr(ctx, px, py, pillW, ph, 19);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = alpha(room.borderColor, 0.14);
  rr(ctx, px + 6, py + 6, chip, chip, 13);
  ctx.fill();
  // Los emoji a color heredan la opacidad del fillStyle: usar uno opaco.
  ctx.fillStyle = '#000000';
  ctx.font = `14px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(room.icon || '•', px + 6 + chip / 2, py + ph / 2 + 1);

  ctx.textAlign = 'left';
  ctx.font = nameFont;
  ctx.fillStyle = INK;
  ctx.fillText(room.name, px + 6 + chip + 10, py + ph / 2 + 1);
  if (showSub) {
    ctx.font = subFont;
    ctx.fillStyle = '#6b7090';
    ctx.fillText(sub, px + 6 + chip + 10 + nameW, py + ph / 2 + 1);
  }
  ctx.restore();
};

const drawPlazaGarden = (ctx) => {
  ctx.save();
  const lawn = ctx.createRadialGradient(1390, 345, 40, 1390, 345, 230);
  lawn.addColorStop(0, '#d6f1df');
  lawn.addColorStop(0.85, '#c9ebd4');
  lawn.addColorStop(1, 'rgba(201,235,212,0)');
  ctx.fillStyle = lawn;
  ellipse(ctx, 1390, 345, 250, 175);
  ctx.fill();

  // Flores sueltas en el césped
  const flowers = ['#f9a8d4', '#fde68a', '#ffffff', '#c4b5fd'];
  for (let i = 0; i < 70; i++) {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 95 + ((i * 53) % 120);
    const fx = 1390 + Math.cos(a) * r * 1.35;
    const fy = 345 + Math.sin(a) * r * 0.9;
    ctx.fillStyle = flowers[i % flowers.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawBench = (ctx, x, y) => {
  ctx.save();
  ctx.fillStyle = 'rgba(30,27,75,0.12)';
  rr(ctx, x - 44, y + 6, 92, 22, 8);
  ctx.fill();
  const wood = ctx.createLinearGradient(0, y - 12, 0, y + 14);
  wood.addColorStop(0, '#e2b07e');
  wood.addColorStop(1, '#b97f4c');
  ctx.fillStyle = wood;
  rr(ctx, x - 46, y - 12, 92, 26, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,30,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    ctx.moveTo(x - 44, y - 12 + i * 6.5);
    ctx.lineTo(x + 44, y - 12 + i * 6.5);
  }
  ctx.stroke();
  ctx.restore();
};

const PLANT_PALETTES = {
  green: ['#a7f3d0', '#34d399', '#047857'],
  deep: ['#86efac', '#22c55e', '#166534'],
  sakura: ['#fdf2f8', '#f9a8d4', '#db2777']
};

const drawCanopy = (ctx, cx, cy, R, pal) => {
  const blobs = [
    [-0.5, 0.15, 0.62],
    [0.5, 0.12, 0.64],
    [0, 0.28, 0.7],
    [-0.22, -0.32, 0.66],
    [0.3, -0.28, 0.6]
  ];
  blobs.forEach(([ox, oy, rs]) => {
    const bx = cx + ox * R;
    const by = cy + oy * R;
    const br = rs * R;
    const g = ctx.createRadialGradient(bx - br * 0.4, by - br * 0.45, br * 0.1, bx, by, br);
    g.addColorStop(0, pal[0]);
    g.addColorStop(0.45, pal[1]);
    g.addColorStop(1, pal[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  });
};

const drawPlant = (ctx, x, y, size, type) => {
  const s = size;
  ctx.save();
  ctx.fillStyle = 'rgba(30,27,75,0.16)';
  ellipse(ctx, x + 4, y + s * 0.52, s * 0.72, s * 0.22);
  ctx.fill();

  const isTree = type === 'sakura_tree' || type === 'big_block_tree';
  if (isTree) {
    ctx.fillStyle = '#8b5e3c';
    rr(ctx, x - 3.5, y - s * 0.3, 7, s * 0.75, 3);
    ctx.fill();
  } else {
    const pot = ctx.createLinearGradient(x - s * 0.4, 0, x + s * 0.4, 0);
    pot.addColorStop(0, '#ffffff');
    pot.addColorStop(1, '#d9dbe8');
    ctx.fillStyle = pot;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.4, y);
    ctx.lineTo(x + s * 0.4, y);
    ctx.lineTo(x + s * 0.3, y + s * 0.5);
    ctx.lineTo(x - s * 0.3, y + s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c3c6d8';
    rr(ctx, x - s * 0.44, y - 3, s * 0.88, 6, 3);
    ctx.fill();
  }

  if (type === 'block_plant') {
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.42;
      ctx.save();
      ctx.translate(x, y - 2);
      ctx.rotate(a + Math.PI / 2);
      const g = ctx.createLinearGradient(0, 0, 0, -s * 0.95);
      g.addColorStop(0, '#047857');
      g.addColorStop(1, '#6ee7b7');
      ctx.fillStyle = g;
      ellipse(ctx, 0, -s * 0.5, s * 0.17, s * 0.5);
      ctx.fill();
      ctx.restore();
    }
  } else {
    const pal = type === 'sakura_tree' ? PLANT_PALETTES.sakura : type === 'big_block_tree' ? PLANT_PALETTES.deep : PLANT_PALETTES.green;
    const R = type === 'big_block_tree' ? s * 0.78 : s * 0.62;
    drawCanopy(ctx, x, y - s * 0.62, R, pal);
    if (type === 'sakura_tree') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 8; i++) {
        const a = i * 2.4;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * R * 0.55, y - s * 0.62 + Math.sin(a) * R * 0.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
};

export const buildStaticLayer = (scale = 2) => {
  const layer = document.createElement('canvas');
  layer.width = OFFICE_WIDTH * scale;
  layer.height = OFFICE_HEIGHT * scale;
  const ctx = layer.getContext('2d');
  ctx.scale(scale, scale);

  drawSlab(ctx);
  drawHallways(ctx);
  ROOMS.forEach((room) => drawRoomFloor(ctx, room));
  drawDoorThresholds(ctx);
  drawPlazaGarden(ctx);
  ctx.drawImage(drawWalls(scale), 0, 0, OFFICE_WIDTH, OFFICE_HEIGHT);

  drawBench(ctx, 930, 430);
  drawBench(ctx, 1850, 430);

  [...PLANTS].sort((a, b) => a.y - b.y).forEach((p) => drawPlant(ctx, p.x, p.y, p.size, p.type));
  ROOMS.forEach((room) => drawRoomSign(ctx, room));
  return layer;
};

// ==========================================
// FONDO Y POST-PROCESO (espacio de pantalla)
// ==========================================
export const drawBackdrop = (ctx, vw, vh) => {
  const bg = ctx.createLinearGradient(0, 0, vw, vh);
  bg.addColorStop(0, '#221b57');
  bg.addColorStop(1, '#0e0b29');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, vw, vh);
  const glow = ctx.createRadialGradient(vw * 0.85, vh * 0.1, 0, vw * 0.85, vh * 0.1, vw * 0.6);
  glow.addColorStop(0, 'rgba(0,198,189,0.22)');
  glow.addColorStop(1, 'rgba(0,198,189,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, vw, vh);
};

export const drawVignette = (ctx, vw, vh) => {
  const v = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.42, vw / 2, vh / 2, Math.max(vw, vh) * 0.78);
  v.addColorStop(0, 'rgba(20,16,60,0)');
  v.addColorStop(1, 'rgba(20,16,60,0.20)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, vw, vh);
};

// ==========================================
// OBJETOS INTERACTIVOS (animados)
// ==========================================
const BOARD_STYLE = {
  project_workflows: { accent: '#00C6BD', icon: '🗺️' },
  career_guide: { accent: '#6366f1', icon: '🎓' },
  role_understanding: { accent: '#a855f7', icon: '🧩' }
};

const drawBoard = (ctx, obj, t) => {
  const { x, y, width: w, height: h } = obj;
  const { accent, icon } = BOARD_STYLE[obj.type];

  ctx.save();
  ctx.shadowColor = alpha(accent, 0.45);
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#16123a';
  rr(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.restore();

  ctx.save();
  rr(ctx, x + 5, y + 5, w - 10, h - 10, 14);
  ctx.clip();
  const screen = ctx.createLinearGradient(x, y, x + w, y + h);
  screen.addColorStop(0, accent);
  screen.addColorStop(1, '#2a0f78');
  ctx.fillStyle = screen;
  ctx.fillRect(x, y, w, h);
  // Reflejo de vidrio
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.55, y);
  ctx.lineTo(x + w * 0.35, y + h);
  ctx.lineTo(x + w * 0.15, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const cy = y + h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.arc(x + 42, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `20px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x + 42, cy + 1);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 15px ${FONT}`;
  ctx.fillText(obj.title, x + 76, cy - 9);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = `500 11.5px ${FONT}`;
  ctx.fillText('Acércate y presiona E para abrir', x + 76, cy + 12);

  // Mini gráfico animado
  const bx = x + w - 96;
  for (let i = 0; i < 6; i++) {
    const bh = 14 + (Math.sin(t * 1.6 + i * 0.9) + 1) * 13;
    const g = ctx.createLinearGradient(0, y + h - 22 - bh, 0, y + h - 22);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(255,255,255,0.35)');
    ctx.fillStyle = g;
    rr(ctx, bx + i * 13, y + h - 22 - bh, 8, bh, 4);
    ctx.fill();
  }
  ctx.restore();
};

const drawFountain = (ctx, obj, t) => {
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  ctx.save();

  ctx.shadowColor = 'rgba(30,27,75,0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  const rim = ctx.createLinearGradient(cx, cy - 70, cx, cy + 70);
  rim.addColorStop(0, '#ffffff');
  rim.addColorStop(1, '#cfd3e3');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const water = ctx.createRadialGradient(cx - 18, cy - 20, 6, cx, cy, 60);
  water.addColorStop(0, '#bae6fd');
  water.addColorStop(0.55, '#38bdf8');
  water.addColorStop(1, '#0369a1');
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  for (let k = 0; k < 2; k++) {
    const p = ((t * 0.35 + k * 0.5) % 1);
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - p)})`;
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 42 + p * 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 4; i++) {
    const a = t * 0.4 + i * 1.6;
    ellipse(ctx, cx + Math.cos(a) * 44, cy + Math.sin(a) * 30 + 8, 4, 1.4);
    ctx.fill();
  }

  // Árbol en la isla central
  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ellipse(ctx, cx + 6, cy + 18, 34, 12);
  ctx.fill();
  ctx.fillStyle = '#7c4a2d';
  rr(ctx, cx - 5, cy - 10, 10, 30, 4);
  ctx.fill();
  const sway = Math.sin(t * 0.6) * 1.5;
  drawCanopy(ctx, cx + sway, cy - 22, 46, PLANT_PALETTES.sakura);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 10; i++) {
    const a = i * 2.2;
    ctx.beginPath();
    ctx.arc(cx + sway + Math.cos(a) * 26, cy - 22 + Math.sin(a) * 22, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawPill(ctx, 'Cerezo DK', cx, cy - 92, { dot: '#ec4899' });
};

const drawCoffeeBar = (ctx, obj, t) => {
  const { x, y, width: w, height: h } = obj;
  ctx.save();

  // Luz cálida de lámparas colgantes
  [0.2, 0.5, 0.8].forEach((f) => {
    const lx = x + w * f;
    const g = ctx.createRadialGradient(lx, y + 40, 0, lx, y + 40, 90);
    g.addColorStop(0, 'rgba(251,191,36,0.22)');
    g.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 90, y - 50, 180, 180);
  });

  ctx.shadowColor = 'rgba(80,45,10,0.30)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  const front = ctx.createLinearGradient(0, y + h - 34, 0, y + h);
  front.addColorStop(0, '#b57c4b');
  front.addColorStop(1, '#8a5a32');
  ctx.fillStyle = front;
  rr(ctx, x, y + 14, w, h - 14, 16);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const top = ctx.createLinearGradient(0, y, 0, y + h - 30);
  top.addColorStop(0, '#fbf3e6');
  top.addColorStop(1, '#ecdcc2');
  ctx.fillStyle = top;
  rr(ctx, x, y, w, h - 30, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(70,40,15,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let sx = x + 30; sx < x + w - 10; sx += 30) {
    ctx.moveTo(sx, y + h - 24);
    ctx.lineTo(sx, y + h - 8);
  }
  ctx.stroke();

  // Máquina de espresso
  const mx = x + 22;
  const my = y + 14;
  const metal = ctx.createLinearGradient(mx, 0, mx + 70, 0);
  metal.addColorStop(0, '#f3f4f6');
  metal.addColorStop(0.5, '#cbd5e1');
  metal.addColorStop(1, '#94a3b8');
  ctx.fillStyle = metal;
  rr(ctx, mx, my, 70, 50, 10);
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  rr(ctx, mx + 8, my + 8, 54, 12, 5);
  ctx.fill();
  ctx.fillStyle = (Math.sin(t * 2) > 0) ? '#22c55e' : '#16a34a';
  ctx.beginPath();
  ctx.arc(mx + 56, my + 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  [mx + 22, mx + 46].forEach((cxp) => {
    ctx.beginPath();
    ctx.arc(cxp, my + 36, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b3a1a';
    ctx.beginPath();
    ctx.arc(cxp, my + 36, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
  });

  // Vapor ondulado
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  [mx + 22, mx + 46].forEach((sx, i) => {
    const p = (t * 0.5 + i * 0.5) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * (1 - p)})`;
    ctx.beginPath();
    const base = my + 26 - p * 22;
    ctx.moveTo(sx, base);
    ctx.bezierCurveTo(sx - 5, base - 5, sx + 5, base - 10, sx, base - 15);
    ctx.stroke();
  });

  // Tazas de colores y bandeja de postres
  const mugs = ['#00C6BD', '#4017AA', '#f59e0b', '#ec4899'];
  mugs.forEach((c, i) => {
    const ux = x + 128 + i * 30;
    const uy = y + 46;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(ux, uy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ux + 10, uy, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(ux, uy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + w - 52, y + 44, 22, 0, Math.PI * 2);
  ctx.fill();
  ['#c2803f', '#9a5a2a', '#e0a96d'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + w - 60 + i * 9, y + 40 + (i % 2) * 8, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  drawPill(ctx, 'Estación de Café', x + w / 2, y - 16, { dot: '#f59e0b' });
};

const drawOpenTables = (ctx, obj, t) => {
  const { x, y, width: w, height: h } = obj;
  ctx.save();

  ctx.fillStyle = 'rgba(252,211,77,0.20)';
  rr(ctx, x, y + 14, w, h - 14, 44);
  ctx.fill();
  ctx.strokeStyle = 'rgba(217,119,6,0.30)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  rr(ctx, x + 8, y + 22, w - 16, h - 30, 38);
  ctx.stroke();
  ctx.setLineDash([]);

  [x + w * 0.27, x + w * 0.73].forEach((tx, ti) => {
    const ty = y + h / 2 + 8;
    [0, 1, 2, 3].forEach((k) => {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const chx = tx + Math.cos(a) * 44;
      const chy = ty + Math.sin(a) * 40;
      ctx.fillStyle = 'rgba(30,27,75,0.12)';
      ellipse(ctx, chx + 2, chy + 4, 13, 9);
      ctx.fill();
      const cg = ctx.createRadialGradient(chx - 4, chy - 4, 1, chx, chy, 13);
      cg.addColorStop(0, '#fde68a');
      cg.addColorStop(1, '#f59e0b');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(chx, chy, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowColor = 'rgba(30,27,75,0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    const tg = ctx.createRadialGradient(tx - 10, ty - 12, 4, tx, ty, 32);
    tg.addColorStop(0, '#ffffff');
    tg.addColorStop(1, '#ece7dc');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(tx, ty, 31, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    [[-13, -6], [12, 8]].forEach(([ox, oy], i) => {
      const ux = tx + ox;
      const uy = ty + oy;
      ctx.fillStyle = '#7c3f12';
      ctx.beginPath();
      ctx.arc(ux, uy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      const p = (t * 0.45 + ti * 0.3 + i * 0.5) % 1;
      ctx.strokeStyle = `rgba(180,83,9,${0.5 * (1 - p)})`;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      const base = uy - 9 - p * 12;
      ctx.beginPath();
      ctx.moveTo(ux, base);
      ctx.bezierCurveTo(ux - 3, base - 3, ux + 3, base - 6, ux, base - 9);
      ctx.stroke();
    });
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(tx + 2, ty - 14, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  drawPill(ctx, 'Mesas Abiertas', x + w / 2, y + 2, { dot: '#f59e0b' });
};

const drawDesk = (ctx, obj, t) => {
  const { x, y, width: w, height: h } = obj;
  const c = ROLE_COLORS[obj.role] || '#4017AA';
  ctx.save();

  // Silla (detrás del escritorio, del lado del jugador)
  const chx = x + w / 2;
  const chy = y + h + 16;
  ctx.fillStyle = 'rgba(30,27,75,0.14)';
  ellipse(ctx, chx + 2, chy + 6, 22, 9);
  ctx.fill();
  ctx.fillStyle = shade(c, -0.25);
  rr(ctx, chx - 20, chy - 8, 40, 26, 11);
  ctx.fill();
  ctx.fillStyle = c;
  rr(ctx, chx - 17, chy - 12, 34, 20, 9);
  ctx.fill();

  ctx.shadowColor = 'rgba(30,27,75,0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#c5cad9';
  rr(ctx, x, y + 10, w, h - 10, 14);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const top = ctx.createLinearGradient(0, y, 0, y + h - 14);
  top.addColorStop(0, '#ffffff');
  top.addColorStop(1, '#eef0f6');
  ctx.fillStyle = top;
  rr(ctx, x, y, w, h - 14, 14);
  ctx.fill();

  // Monitores con brillo del color del rol
  [x + 16, x + w - 16 - 72].forEach((mx, i) => {
    const my = y + 10;
    ctx.fillStyle = '#111827';
    rr(ctx, mx, my, 72, 42, 7);
    ctx.fill();
    const sg = ctx.createLinearGradient(mx, my, mx + 72, my + 42);
    sg.addColorStop(0, i === 0 ? c : shade(c, -0.2));
    sg.addColorStop(1, shade(c, -0.55));
    ctx.fillStyle = sg;
    rr(ctx, mx + 3, my + 3, 66, 36, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const lines = i === 0 ? [34, 46, 22, 38] : [40, 28, 50, 30];
    lines.forEach((lw, li) => {
      rr(ctx, mx + 9 + (li % 2) * 6, my + 9 + li * 7, lw * 0.9, 3, 1.5);
      ctx.fill();
    });
    if (i === 0 && Math.sin(t * 3) > 0) {
      ctx.fillRect(mx + 9 + 38, my + 30, 4, 4);
    }
    ctx.fillStyle = '#374151';
    rr(ctx, mx + 31, my + 42, 10, 6, 2);
    ctx.fill();
  });

  ctx.fillStyle = '#e2e5ef';
  rr(ctx, x + w / 2 - 34, y + 62, 68, 14, 5);
  ctx.fill();
  ctx.fillStyle = '#c7ccdb';
  for (let k = 0; k < 8; k++) {
    rr(ctx, x + w / 2 - 30 + k * 8, y + 65, 6, 3, 1);
    ctx.fill();
    rr(ctx, x + w / 2 - 30 + k * 8, y + 70, 6, 3, 1);
    ctx.fill();
  }
  ctx.fillStyle = '#d6dae6';
  ellipse(ctx, x + w / 2 + 48, y + 69, 6, 8);
  ctx.fill();

  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x + 26, y + 72, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x + 26, y + 72, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const label = obj.title.replace(/^Escritorio\s+/, '');
  drawPill(ctx, label, x + w / 2, y - 16, { dot: c, font: `700 11.5px ${FONT}`, h: 24 });
};

// Halo + tecla flotante cuando el jugador está cerca de un objeto.
const drawProximity = (ctx, obj, t) => {
  const pulse = (Math.sin(t * 2.2) + 1) / 2;
  ctx.save();
  ctx.strokeStyle = `rgba(0,198,189,${0.55 + pulse * 0.35})`;
  ctx.shadowColor = '#00C6BD';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 2.5;
  if (obj.type === 'fountain') {
    ctx.beginPath();
    ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, 80 + pulse * 4, 0, Math.PI * 2);
  } else {
    rr(ctx, obj.x - 10, obj.y - 10, obj.width + 20, obj.height + 20 + (obj.type === 'desk' ? 34 : 0), 22);
  }
  ctx.stroke();
  ctx.restore();
};

export const drawKeyCap = (ctx, cx, cy, t) => {
  const yb = cy + Math.sin(t * 2.5) * 3;
  ctx.save();
  ctx.shadowColor = 'rgba(0,198,189,0.6)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  rr(ctx, cx - 14, yb - 14, 28, 28, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#00C6BD';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `800 14px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', cx, yb + 1);
  ctx.restore();
};

export const drawInteractiveObject = (ctx, obj, t, isNear) => {
  if (isNear) drawProximity(ctx, obj, t);
  if (obj.type === 'fountain') drawFountain(ctx, obj, t);
  else if (BOARD_STYLE[obj.type]) drawBoard(ctx, obj, t);
  else if (obj.type === 'coffee_machine') drawCoffeeBar(ctx, obj, t);
  else if (obj.type === 'open_tables') drawOpenTables(ctx, obj, t);
  else if (obj.type === 'desk') drawDesk(ctx, obj, t);

  if (isNear) {
    const cx = obj.x + obj.width / 2;
    const cy = obj.type === 'fountain' ? obj.y + obj.height / 2 - 128 : obj.y - 50;
    drawKeyCap(ctx, cx, cy, t);
  }
};

export const drawClickTarget = (ctx, target, t) => {
  const p = (t * 0.6) % 1;
  ctx.save();
  ctx.strokeStyle = `rgba(0,198,189,${0.9 * (1 - p)})`;
  ctx.lineWidth = 2.5;
  ellipse(ctx, target.x, target.y, 8 + p * 20, (8 + p * 20) * 0.45);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,198,189,0.55)';
  ellipse(ctx, target.x, target.y, 6, 2.8);
  ctx.fill();
  ctx.restore();
};

export const drawPetal = (ctx, petal) => {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.rotation);
  ctx.fillStyle = `rgba(249,168,212,${petal.opacity})`;
  ctx.beginPath();
  ctx.moveTo(0, -petal.size);
  ctx.quadraticCurveTo(petal.size * 0.9, 0, 0, petal.size);
  ctx.quadraticCurveTo(-petal.size * 0.9, 0, 0, -petal.size);
  ctx.fill();
  ctx.restore();
};

// ==========================================
// AVATAR CHIBI
// ==========================================
const HAIR_FALLBACK = ['#2c1609', '#4a3728', '#1a202c', '#6b3e26', '#3b2a20'];

const drawHair = (ctx, hx, hy, dir, hair) => {
  ctx.fillStyle = hair;
  ctx.beginPath();
  if (dir === 'up') {
    // De espaldas: el pelo cubre la nuca pero deja ver orejas y cuello.
    ctx.arc(hx, hy, 15.2, Math.PI * 0.82, Math.PI * 2.18);
    ctx.quadraticCurveTo(hx, hy + 5, hx + Math.cos(Math.PI * 0.82) * 15.2, hy + Math.sin(Math.PI * 0.82) * 15.2);
    ctx.fill();
  } else {
    const side = dir === 'left' ? 1 : dir === 'right' ? -1 : 0;
    ctx.arc(hx, hy - 1, 15.2, Math.PI * 0.98, Math.PI * 2.02);
    ctx.lineTo(hx + 15, hy + (side === 1 ? 8 : 1));
    ctx.quadraticCurveTo(hx + 8 + side * 3, hy - 9, hx + 1 + side * 4, hy - 5);
    ctx.quadraticCurveTo(hx - 6 + side * 4, hy - 10, hx - 15, hy + (side === -1 ? 8 : 1));
    ctx.closePath();
    ctx.fill();
  }
  // Brillo para dar volumen
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(hx, hy - 1, 11, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();
};

const drawAccessory = (ctx, acc, hx, hy, dir, t) => {
  const ex = dir === 'left' ? -4 : dir === 'right' ? 4 : 0;
  ctx.save();
  if (acc === 'engineer_helmet') {
    const g = ctx.createLinearGradient(0, hy - 18, 0, hy);
    g.addColorStop(0, '#fde047');
    g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy - 3, 16.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    rr(ctx, hx - 19, hy - 4, 38, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    rr(ctx, hx - 2, hy - 19, 4, 14, 2);
    ctx.fill();
  } else if (acc === 'wizard_hat') {
    ctx.fillStyle = '#3b1a8f';
    ellipse(ctx, hx, hy - 9, 19, 5.5);
    ctx.fill();
    const g = ctx.createLinearGradient(hx - 12, hy - 40, hx + 12, hy - 8);
    g.addColorStop(0, '#8b5cf6');
    g.addColorStop(1, '#4017AA');
    ctx.fillStyle = g;
    const tip = Math.sin(t * 1.2) * 2;
    ctx.beginPath();
    ctx.moveTo(hx - 13, hy - 10);
    ctx.quadraticCurveTo(hx - 2, hy - 30, hx + 6 + tip, hy - 40);
    ctx.quadraticCurveTo(hx + 4, hy - 24, hx + 13, hy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047';
    [[-3, -20], [4, -15], [3, -28]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.arc(hx + ox, hy + oy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (acc === 'headphones') {
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(hx, hy - 1, 17, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    rr(ctx, hx - 20, hy - 5, 7, 13, 3.5);
    ctx.fill();
    rr(ctx, hx + 13, hy - 5, 7, 13, 3.5);
    ctx.fill();
  } else if (acc === 'cap') {
    const g = ctx.createLinearGradient(0, hy - 18, 0, hy);
    g.addColorStop(0, '#6d3be0');
    g.addColorStop(1, '#4017AA');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy - 3, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#2b0d82';
    if (dir === 'down') ellipse(ctx, hx, hy - 3, 14, 4.5);
    else if (dir === 'left') ellipse(ctx, hx - 13, hy - 4, 10, 4);
    else if (dir === 'right') ellipse(ctx, hx + 13, hy - 4, 10, 4);
    if (dir !== 'up') ctx.fill();
    ctx.fillStyle = '#00C6BD';
    ctx.beginPath();
    ctx.arc(hx, hy - 18, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'crown') {
    const g = ctx.createLinearGradient(0, hy - 30, 0, hy - 12);
    g.addColorStop(0, '#fef08a');
    g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy - 12);
    ctx.lineTo(hx - 13, hy - 26);
    ctx.lineTo(hx - 6, hy - 19);
    ctx.lineTo(hx, hy - 29);
    ctx.lineTo(hx + 6, hy - 19);
    ctx.lineTo(hx + 13, hy - 26);
    ctx.lineTo(hx + 12, hy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(hx, hy - 16, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00C6BD';
    ctx.beginPath();
    ctx.arc(hx - 7, hy - 15, 1.6, 0, Math.PI * 2);
    ctx.arc(hx + 7, hy - 15, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'sunglasses' && dir !== 'up') {
    ctx.fillStyle = '#0f172a';
    rr(ctx, hx - 11 + ex, hy - 2, 9, 7, 3);
    ctx.fill();
    rr(ctx, hx + 2 + ex, hy - 2, 9, 7, 3);
    ctx.fill();
    ctx.fillRect(hx - 2 + ex, hy, 4, 1.6);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(hx - 9 + ex, hy - 1, 3, 1.4);
    ctx.fillRect(hx + 4 + ex, hy - 1, 3, 1.4);
  }
  ctx.restore();
};

const roleCodeOf = (user) => {
  const m = /\(([^)]+)\)/.exec(user.roleLabel || '');
  return m ? m[1] : ROLE_CODES[user.role] || '';
};

export const drawAvatar = (ctx, user, { isSelf = false, t = 0, isMoving = false, isNear = false } = {}) => {
  const { x, y, name, chatMessage } = user;
  const avatar = user.avatar || {};
  const dir = user.direction || 'down';
  const seed = hashStr(user.id || name || '');
  const skin = avatar.skin || '#f8d5c2';
  const shirt = avatar.shirt || '#4017AA';
  const pants = avatar.pants || '#1e293b';
  const hair = avatar.hair || HAIR_FALLBACK[seed % HAIR_FALLBACK.length];
  const acc = avatar.accessory || 'none';

  const walk = isMoving ? Math.sin(t * 4.5) : 0;
  const bob = isMoving ? Math.abs(Math.sin(t * 4.5)) * 2.2 : Math.sin(t * 0.9 + seed) * 0.6;
  const by = y - bob;

  ctx.save();

  if (isSelf) {
    const p = (Math.sin(t * 2) + 1) / 2;
    ctx.fillStyle = 'rgba(0,198,189,0.14)';
    ellipse(ctx, x, y + 22, 24 + p * 3, 9 + p);
    ctx.fill();
    ctx.strokeStyle = `rgba(0,198,189,${0.6 + p * 0.3})`;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ellipse(ctx, x, y + 22, 13 - bob * 0.6, 4.2);
  ctx.fill();

  // Piernas y zapatos
  [-1, 1].forEach((sideSign, i) => {
    const off = (i === 0 ? walk : -walk) * 2.5;
    const lx = x + sideSign * 5 - 4;
    ctx.fillStyle = pants;
    rr(ctx, lx, by + 5 + off, 8, 13, 3.5);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    rr(ctx, lx - 0.5, by + 15 + off, 9, 5, 2.5);
    ctx.fill();
  });

  // Brazos (detrás del torso)
  [-1, 1].forEach((sideSign, i) => {
    ctx.save();
    ctx.translate(x + sideSign * 12.5, by - 9);
    ctx.rotate((i === 0 ? walk : -walk) * 0.38 + sideSign * 0.12);
    ctx.fillStyle = shade(shirt, -0.12);
    rr(ctx, -3.5, 0, 7, 15, 3.5);
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, 15.5, 3.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Torso
  const body = ctx.createLinearGradient(0, by - 13, 0, by + 9);
  body.addColorStop(0, shade(shirt, 0.14));
  body.addColorStop(1, shade(shirt, -0.12));
  ctx.fillStyle = body;
  rr(ctx, x - 12, by - 13, 24, 22, 9);
  ctx.fill();
  if (dir !== 'up') {
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(x, by - 13, 4, 0, Math.PI);
    ctx.fill();
  }

  // Cabeza
  const hx = x;
  const hy = by - 27;
  const hg = ctx.createRadialGradient(hx - 4, hy - 5, 2, hx, hy, 15);
  hg.addColorStop(0, shade(skin, 0.12));
  hg.addColorStop(1, shade(skin, -0.06));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(hx, hy, 14.5, 0, Math.PI * 2);
  ctx.fill();

  drawHair(ctx, hx, hy, dir, hair);

  if (dir !== 'up') {
    const ex = dir === 'left' ? -4 : dir === 'right' ? 4 : 0;
    const blink = ((t * 0.45 + (seed % 9)) % 4) < 0.06;
    if (acc !== 'sunglasses') {
      ctx.fillStyle = '#1e1b4b';
      [-5, 5].forEach((dx) => {
        if (blink) {
          ctx.fillRect(hx + dx + ex - 2, hy + 1.5, 4, 1.3);
        } else {
          ellipse(ctx, hx + dx + ex, hy + 2, 1.9, 2.5);
          ctx.fill();
        }
      });
      if (!blink) {
        ctx.fillStyle = '#ffffff';
        [-5, 5].forEach((dx) => {
          ctx.beginPath();
          ctx.arc(hx + dx + ex + 0.7, hy + 1, 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    ctx.fillStyle = 'rgba(244,114,182,0.38)';
    [-8, 8].forEach((dx) => {
      ellipse(ctx, hx + dx + ex, hy + 6, 2.6, 1.6);
      ctx.fill();
    });
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(hx + ex, hy + 6, 2.4, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }

  drawAccessory(ctx, acc, hx, hy, dir, t);
  ctx.restore();

  // Etiqueta: nombre + código de rol
  const tagY = by - 60 - (acc === 'wizard_hat' ? 10 : acc === 'crown' ? 4 : 0);
  const code = roleCodeOf(user);
  const roleColor = ROLE_COLORS[user.role] || '#94a3b8';
  ctx.save();
  ctx.font = `700 11px ${FONT}`;
  const label = name || 'Jugador DK';
  const nameW = ctx.measureText(label).width;
  ctx.font = `800 9px ${FONT}`;
  const codeW = code ? ctx.measureText(code).width + 10 : 0;
  const tagW = nameW + 18 + (code ? codeW + 6 : 0);
  const tagH = 20;
  const tx = x - tagW / 2;
  if (isSelf) {
    const g = ctx.createLinearGradient(tx, 0, tx + tagW, 0);
    g.addColorStop(0, '#00C6BD');
    g.addColorStop(1, '#4017AA');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = 'rgba(20,17,46,0.74)';
  }
  ctx.shadowColor = 'rgba(15,23,42,0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  rr(ctx, tx, tagY - tagH / 2, tagW, tagH, 10);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 11px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, tx + 9, tagY + 0.5);
  if (code) {
    const cx0 = tx + 9 + nameW + 6;
    ctx.fillStyle = isSelf ? 'rgba(255,255,255,0.25)' : roleColor;
    rr(ctx, cx0, tagY - 6.5, codeW, 13, 6.5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 9px ${FONT}`;
    ctx.fillText(code, cx0 + 5, tagY + 0.5);
  }
  ctx.restore();

  let topY = tagY - tagH / 2;
  if (isNear) {
    drawKeyCap(ctx, x, topY - 22, t);
    topY -= 40;
  }

  if (chatMessage) {
    const text = chatMessage.length > 34 ? `${chatMessage.slice(0, 32)}…` : chatMessage;
    ctx.save();
    ctx.font = `600 11.5px ${FONT}`;
    const bw = Math.min(240, ctx.measureText(text).width + 24);
    const bh = 28;
    const bx = x - bw / 2;
    const byb = topY - 10 - bh;
    ctx.shadowColor = 'rgba(15,23,42,0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    rr(ctx, bx, byb, bw, bh, 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 6, byb + bh - 1);
    ctx.lineTo(x, byb + bh + 7);
    ctx.lineTo(x + 6, byb + bh - 1);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, byb + bh / 2 + 0.5);
    ctx.restore();
  }
};
