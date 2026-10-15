import React, { useEffect, useRef, useState } from 'react';
import { X, Share2, RefreshCw, Crown, Briefcase, User, Shuffle } from 'lucide-react';
import { PROYECTOS_DATA, PERSONAS_DATA, ASIGNACIONES_DATA, ROLES_DATA } from '../utils/rolesWorkflowData';

const PROJECT_COLOR = '#00C6BD';
const SHARED_COLOR = '#f97316';
// Un color propio por Agile Manager: así cada célula se reconoce de un vistazo
// (anillo del mismo color en su gente + arista "pertenece a" del mismo color).
const AM_PALETTE = ['#f59e0b', '#ec4899', '#3b82f6', '#22c55e', '#a855f7'];

// Construye nodos (personas, Agile Managers y proyectos) y aristas a partir de
// los mismos datos reales que usa el Simulador de Proyectos. Cada persona tiene
// un equipo fijo (PERSONAS_DATA[].equipo); si trabaja en un proyecto de OTRO AM,
// esa arista se marca 'shared' — es la excepción, no la norma.
const buildGraph = () => {
  const nodes = [];
  const edges = [];

  const amNames = [...new Set(PROYECTOS_DATA.map((p) => p.am_nombre).filter(Boolean))];
  const amColor = {};
  amNames.forEach((name, i) => { amColor[name] = AM_PALETTE[i % AM_PALETTE.length]; });

  amNames.forEach((name) => {
    const cartera = PROYECTOS_DATA.filter((p) => p.am_nombre === name).length;
    const equipo = PERSONAS_DATA.filter((p) => p.equipo === name).length;
    nodes.push({
      id: `am:${name}`,
      label: name,
      type: 'am',
      color: amColor[name],
      roleLabel: `Agile Manager · dueño de ${cartera} proyecto${cartera === 1 ? '' : 's'} · equipo fijo de ${equipo}`
    });
  });

  PERSONAS_DATA.forEach((p) => {
    const role = ROLES_DATA.find((r) => r.clave === p.rol);
    nodes.push({
      id: `u:${p.email}`,
      label: p.nombre,
      type: 'person',
      color: role?.color || '#4017AA',
      homeAM: p.equipo,
      homeColor: amColor[p.equipo] || '#94a3b8',
      roleLabel: `${role?.nombre || p.rol} · ${p.nivel}`
    });
  });

  PROYECTOS_DATA.forEach((proj) => {
    nodes.push({ id: `p:${proj.id}`, label: proj.nombre, type: 'project', data: proj, amColor: amColor[proj.am_nombre] });
    if (proj.am_nombre) {
      edges.push({ source: `am:${proj.am_nombre}`, target: `p:${proj.id}`, kind: 'owns', len: 140, k: 0.018 });
    }
  });

  // Arista de pertenencia: une a cada persona con el AM de su equipo fijo.
  // Es lo que hace que cada célula se agrupe visualmente sin necesidad de pasar el mouse.
  PERSONAS_DATA.forEach((p) => {
    if (p.equipo) edges.push({ source: `u:${p.email}`, target: `am:${p.equipo}`, kind: 'home', len: 60, k: 0.05 });
  });

  const personaByEmail = Object.fromEntries(PERSONAS_DATA.map((p) => [p.email, p]));
  const projById = Object.fromEntries(PROYECTOS_DATA.map((p) => [p.id, p]));

  ASIGNACIONES_DATA.forEach((a) => {
    const persona = personaByEmail[a.email];
    const proj = projById[a.proyecto_id];
    const isShared = persona && proj && persona.equipo !== proj.am_nombre;
    edges.push({
      source: `u:${a.email}`,
      target: `p:${a.proyecto_id}`,
      weight: Number(a.porcentaje) || 50,
      kind: isShared ? 'shared' : 'work',
      len: isShared ? 230 : 115,
      k: isShared ? 0.01 : 0.022
    });
  });

  return { nodes, edges };
};

const NODE_RADIUS = { am: 16, project: 14, person: 10 };
// Calibrado para ~35 nodos (3 AM + 15 personas + 15 proyectos): más repulsión y
// resortes algo más cortos para que la maraña se abra sin dispersarse.
const REPULSION = 26000;
const CENTER_K = 0.0016;
const DAMPING = 0.82;

export const NetworkGraphModal = ({ onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.72 });
  const hoverIdRef = useRef(null);
  const dragRef = useRef(null); // { id, moved }
  const panRef = useRef(null); // { lastX, lastY }
  const [selectedNode, setSelectedNode] = useState(null);
  const [, forceTick] = useState(0);

  const resetLayout = () => {
    const w = containerRef.current?.clientWidth || 800;
    const h = containerRef.current?.clientHeight || 500;
    graphRef.current.nodes.forEach((n) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 60 + Math.random() * Math.min(w, h) * 0.55;
      n.x = Math.cos(angle) * r;
      n.y = Math.sin(angle) * r;
      n.vx = 0;
      n.vy = 0;
      n.fixed = false;
    });
    cameraRef.current = { x: 0, y: 0, zoom: 0.72 };
    forceTick((t) => t + 1);
  };

  useEffect(() => {
    if (!graphRef.current) {
      const { nodes, edges } = buildGraph();
      graphRef.current = { nodes, edges };
      resetLayout();
    }
  }, []);

  const findNodeAt = (worldX, worldY) => {
    const nodes = graphRef.current?.nodes || [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const r = NODE_RADIUS[n.type] + 4;
      if (Math.hypot(worldX - n.x, worldY - n.y) <= r) return n;
    }
    return null;
  };

  const screenToWorld = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cam = cameraRef.current;
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: cam.x + (sx - rect.width / 2) / cam.zoom,
      y: cam.y + (sy - rect.height / 2) / cam.zoom
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const node = findNodeAt(x, y);
    if (node) {
      dragRef.current = { id: node.id, moved: false };
      node.fixed = true;
    } else {
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (dragRef.current) {
      const node = graphRef.current.nodes.find((n) => n.id === dragRef.current.id);
      if (node) {
        const { x, y } = screenToWorld(e.clientX, e.clientY);
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        dragRef.current.moved = true;
      }
      return;
    }
    if (panRef.current) {
      const dx = (e.clientX - panRef.current.lastX) / cameraRef.current.zoom;
      const dy = (e.clientY - panRef.current.lastY) / cameraRef.current.zoom;
      cameraRef.current.x -= dx;
      cameraRef.current.y -= dy;
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
      return;
    }
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const node = findNodeAt(x, y);
    hoverIdRef.current = node?.id || null;
  };

  const handleMouseUp = () => {
    if (dragRef.current) {
      const node = graphRef.current.nodes.find((n) => n.id === dragRef.current.id);
      if (node) {
        if (!dragRef.current.moved) {
          setSelectedNode(node);
        }
        node.fixed = false;
      }
      dragRef.current = null;
    }
    panRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    cam.zoom = Math.max(0.3, Math.min(2.5, cam.zoom * factor));
  };

  // Simulación de fuerzas + render, en un único rAF loop (mismo patrón que OfficeCanvas2D).
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      // container.clientWidth/Height puede ser 0 justo cuando el modal recién
      // monta y el layout flex todavía no asignó espacio; en ese caso no tocamos
      // el canvas (se re-mide en cuanto ResizeObserver detecte el tamaño real).
      if (container.clientWidth === 0 || container.clientHeight === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
    };
    resize();
    // ResizeObserver (no solo el resize de window): así el canvas también se
    // reajusta cuando el CONTENEDOR cambia de tamaño por el layout flex del
    // modal (al abrirlo, o en una ventana muy angosta), no solo al redimensionar
    // la ventana del navegador.
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize);

    let rafId;

    const tick = () => {
      const graph = graphRef.current;
      if (graph) {
        const { nodes, edges } = graph;

        // Repulsión entre todos los pares (grafo pequeño, O(n^2) es gratis)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < 1) distSq = 1;
            const dist = Math.sqrt(distSq);
            const force = REPULSION / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (!a.fixed) { a.vx -= fx; a.vy -= fy; }
            if (!b.fixed) { b.vx += fx; b.vy += fy; }
          }
        }

        // Resortes a lo largo de las aristas — cada tipo tiene su propia
        // longitud/rigidez (ver buildGraph): 'home' es corto y firme para que
        // cada célula de AM se agrupe; 'shared' es largo y débil para que el
        // préstamo entre células se vea como un puente entre dos grupos.
        edges.forEach((edge) => {
          const a = nodes.find((n) => n.id === edge.source);
          const b = nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const len = edge.len ?? 125;
          const k = edge.k ?? 0.02;
          const force = (dist - len) * k;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!a.fixed) { a.vx += fx; a.vy += fy; }
          if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
        });

        // Gravedad suave hacia el centro para que no se disperse al infinito
        nodes.forEach((n) => {
          if (n.fixed) return;
          n.vx -= n.x * CENTER_K;
          n.vy -= n.y * CENTER_K;
          n.vx *= DAMPING;
          n.vy *= DAMPING;
          n.x += n.vx;
          n.y += n.vy;
        });

        // ==========================================
        // RENDER
        // ==========================================
        const vw = canvas.width / dpr;
        const vh = canvas.height / dpr;
        const cam = cameraRef.current;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, vw, vh);

        ctx.setTransform(
          dpr * cam.zoom, 0, 0, dpr * cam.zoom,
          dpr * (vw / 2 - cam.x * cam.zoom),
          dpr * (vh / 2 - cam.y * cam.zoom)
        );

        const activeId = hoverIdRef.current || selectedNode?.id || null;
        const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;
        // Al activar un Agile Manager solo se resaltan SUS PROYECTOS ('owns');
        // el equipo fijo no se ilumina aquí (ya se lista aparte en el panel).
        const activeEdgeKinds = activeNode?.type === 'am' ? new Set(['owns']) : null;
        const isRelevantEdge = (e) => !activeEdgeKinds || activeEdgeKinds.has(e.kind);
        const connectedIds = new Set();
        if (activeId) {
          edges.forEach((e) => {
            if (!isRelevantEdge(e)) return;
            if (e.source === activeId) connectedIds.add(e.target);
            if (e.target === activeId) connectedIds.add(e.source);
          });
        }

        // Edges — las de 'home' se dibujan siempre tenues (delimitan la célula
        // aunque no se toque nada); las 'shared' siempre resaltadas en naranja
        // punteado, porque son la excepción que se quiere hacer notar.
        edges.forEach((edge) => {
          const a = nodes.find((n) => n.id === edge.source);
          const b = nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          const isActive = activeId && isRelevantEdge(edge) && (edge.source === activeId || edge.target === activeId);

          ctx.setLineDash([]);
          if (edge.kind === 'shared') {
            ctx.strokeStyle = isActive ? SHARED_COLOR : 'rgba(249, 115, 22, 0.75)';
            ctx.lineWidth = isActive ? 3 : 2.2;
            ctx.setLineDash([6, 5]);
          } else if (edge.kind === 'home') {
            const c = a.homeColor || b.color || '#94a3b8';
            ctx.strokeStyle = isActive ? c : hexToRgba(c, 0.28);
            ctx.lineWidth = isActive ? 2 : 1.2;
          } else if (edge.kind === 'owns') {
            const c = a.color || b.amColor || PROJECT_COLOR;
            ctx.strokeStyle = isActive ? c : hexToRgba(c, 0.3);
            ctx.lineWidth = isActive ? 2.2 : 1.3;
          } else {
            ctx.strokeStyle = isActive ? 'rgba(0, 198, 189, 0.85)' : 'rgba(148, 163, 184, 0.22)';
            ctx.lineWidth = isActive ? 2 : 1;
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Nodes
        const sharedPersonIds = new Set(
          edges.filter((e) => e.kind === 'shared').flatMap((e) => [e.source, e.target])
        );

        nodes.forEach((n) => {
          const r = NODE_RADIUS[n.type];
          const isActive = n.id === activeId;
          const isConnected = connectedIds.has(n.id);
          const dimmed = activeId && !isActive && !isConnected;

          ctx.save();
          ctx.globalAlpha = dimmed ? 0.28 : 1;

          // Anillo de equipo: identifica de un vistazo a qué célula de AM pertenece
          if (n.type === 'person' && n.homeColor) {
            ctx.strokeStyle = n.homeColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (n.type === 'project') {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = n.amColor || PROJECT_COLOR;
            ctx.lineWidth = isActive ? 3 : 2;
          } else if (n.type === 'am') {
            ctx.fillStyle = n.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isActive ? 3 : 2;
          } else {
            ctx.fillStyle = n.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isActive ? 3 : 1.5;
          }

          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Marca de "compartido entre células": anillo punteado extra en naranja
          if (n.type === 'person' && sharedPersonIds.has(n.id)) {
            ctx.strokeStyle = SHARED_COLOR;
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          if (isActive) {
            ctx.strokeStyle = 'rgba(0, 198, 189, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + (sharedPersonIds.has(n.id) ? 13 : 5), 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = dimmed ? 'rgba(226, 232, 240, 0.35)' : '#e2e8f0';
          ctx.font = n.type === 'person' ? '600 11px Outfit, sans-serif' : '800 12px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + r + 18);

          ctx.restore();
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [selectedNode]);

  const infoFor = (node) => {
    if (!node) return null;

    if (node.type === 'project') {
      const proj = node.data;
      const team = (graphRef.current?.edges || [])
        .filter((e) => e.target === node.id && (e.kind === 'work' || e.kind === 'shared'))
        .map((e) => ({ person: graphRef.current.nodes.find((n) => n.id === e.source), shared: e.kind === 'shared' }))
        .filter((x) => x.person);
      return (
        <>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{proj.nombre}</h4>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8 }}>Cliente: {proj.cliente}</p>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 10 }}>{proj.descripcion}</p>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>
            👑 AM: {proj.am_nombre}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Equipo conectado
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {team.map(({ person, shared }) => (
              <span key={person.id} style={{ fontSize: '0.8rem', color: shared ? SHARED_COLOR : '#e2e8f0' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: person.color, marginRight: 6 }} />
                {person.label} · {person.roleLabel}
                {shared && <strong> · prestado</strong>}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (node.type === 'am') {
      const equipo = PERSONAS_DATA.filter((p) => p.equipo === node.label);
      const projects = (graphRef.current?.edges || [])
        .filter((e) => e.kind === 'owns' && e.source === node.id)
        .map((e) => graphRef.current.nodes.find((n) => n.id === e.target))
        .filter(Boolean);
      return (
        <>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{node.label}</h4>
          <p style={{ fontSize: '0.8rem', color: node.color, fontWeight: 700, marginBottom: 10 }}>{node.roleLabel}</p>

          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Equipo fijo ({equipo.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {equipo.map((p) => {
              const role = ROLES_DATA.find((r) => r.clave === p.rol);
              return (
                <span key={p.email} style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: role?.color || '#94a3b8', marginRight: 6 }} />
                  {p.nombre} · {role?.corto || p.rol}
                </span>
              );
            })}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Proyectos que coordina
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {projects.map((p) => (
              <span key={p.id} style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: PROJECT_COLOR, marginRight: 6 }} />
                {p.label}
              </span>
            ))}
          </div>
        </>
      );
    }

    // persona
    const assigned = (graphRef.current?.edges || [])
      .filter((e) => (e.source === node.id || e.target === node.id) && (e.kind === 'work' || e.kind === 'shared'))
      .map((e) => ({
        project: graphRef.current.nodes.find((n) => n.id === (e.source === node.id ? e.target : e.source)),
        shared: e.kind === 'shared'
      }))
      .filter((x) => x.project);

    return (
      <>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{node.label}</h4>
        <p style={{ fontSize: '0.8rem', color: node.color, fontWeight: 700, marginBottom: 4 }}>{node.roleLabel}</p>
        <p style={{ fontSize: '0.76rem', color: node.homeColor, fontWeight: 700, marginBottom: 10 }}>
          🏠 Equipo de {node.homeAM}
        </p>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
          Proyectos asignados
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {assigned.map(({ project, shared }) => (
            <span key={project.id} style={{ fontSize: '0.8rem', color: shared ? SHARED_COLOR : '#e2e8f0' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: shared ? SHARED_COLOR : PROJECT_COLOR, marginRight: 6 }} />
              {project.label}
              {shared && <strong> · prestado a otra célula</strong>}
            </span>
          ))}
        </div>
      </>
    );
  };

  // Agile Managers, para pintar la leyenda con su color real
  const amList = [...new Set(PROYECTOS_DATA.map((p) => p.am_nombre).filter(Boolean))]
    .map((name, i) => ({ name, color: AM_PALETTE[i % AM_PALETTE.length] }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 1100, width: '95vw', height: '82vh', minHeight: 320, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* flexWrap: en una ventana angosta los botones bajan a su propia línea
            en vez de exprimir el título hasta partirlo en 3+ líneas y desbordar
            la altura fija del header (flexShrink:0 evita que la fila de abajo se lo coma). */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '14px 20px 12px', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(0, 198, 189, 0.15)',
            border: '1px solid #00C6BD',
            color: '#00C6BD',
            padding: 10,
            borderRadius: 12,
            flexShrink: 0
          }}>
            <Share2 size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.25 }}>Red DK · Proyectos & Personas</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Cada Agile Manager tiene su propio equipo fijo. Arrastra, haz scroll para zoom y haz clic en un nodo.
            </p>
          </div>
          <button className="glass-button" onClick={resetLayout} title="Reordenar el grafo">
            <RefreshCw size={14} />
            <span>Reordenar</span>
          </button>
          <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0, borderTop: '2px solid #e2e8f0' }}>
          <div
            ref={containerRef}
            style={{ flex: 1, minWidth: 0, position: 'relative', background: '#0b1120', cursor: 'grab' }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ display: 'block' }}
            />

            {/* Leyenda */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid #334155',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.72rem',
              color: '#cbd5e1',
              maxWidth: 240
            }}>
              <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Equipos (anillo = célula)
              </span>
              {amList.map((am) => (
                <span key={am.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={12} style={{ color: am.color }} /> {am.name}
                </span>
              ))}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={12} style={{ color: PROJECT_COLOR }} /> Proyecto
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} style={{ color: '#a78bfa' }} /> Persona (relleno = especialidad)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shuffle size={12} style={{ color: SHARED_COLOR }} /> Compartido entre células (excepción)
              </span>
            </div>
          </div>

          {/* Panel lateral de información */}
          <div style={{
            width: 260,
            minWidth: 220,
            maxWidth: '38vw',
            flexShrink: 1,
            boxSizing: 'border-box',
            background: '#0f172a',
            borderLeft: '2px solid #1e293b',
            padding: 18,
            overflowY: 'auto',
            overflowX: 'hidden',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word'
          }}>
            {selectedNode ? (
              infoFor(selectedNode)
            ) : (
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Haz clic en un nodo (persona, Agile Manager o proyecto) para ver con quién está conectado. El anillo de color
                muestra a qué equipo pertenece cada persona; el anillo punteado naranja marca a quien está prestado a otra célula.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
