import React, { useRef, useEffect, useState } from 'react';
import { OFFICE_WIDTH, OFFICE_HEIGHT, ROOMS, INTERACTIVE_OBJECTS } from '../utils/officeData';
import { sounds } from '../utils/audio';
import {
  buildStaticLayer,
  drawBackdrop,
  drawVignette,
  drawInteractiveObject,
  drawClickTarget,
  drawPetal,
  drawAvatar
} from '../utils/officeRenderer';

// Movimiento independiente del framerate (px por segundo)
const MOVE_SPEED = 300;
// Cada cuánto se reporta la posición a React / BroadcastChannel (segundos)
const SYNC_INTERVAL = 0.12;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.8;
// Distancia mínima para considerar que el cambio de posición vino de afuera (teleport)
const TELEPORT_THRESHOLD = 150;

const STATIC_SCALE = 2;

export const OfficeCanvas2D = ({
  player,
  otherUsers,
  onUpdatePlayerPosition,
  onInteractObject,
  activePrompt,
  setActivePrompt,
  onRoomEnter
}) => {
  const canvasRef = useRef(null);

  // Los props más recientes viven en un ref: el game loop se monta UNA sola vez
  // y nunca se recrea por re-renders de React (ese era el bug de lentitud).
  const propsRef = useRef({});
  propsRef.current = { player, otherUsers, onUpdatePlayerPosition, onInteractObject, setActivePrompt, onRoomEnter };

  const keysRef = useRef({});
  const clickTargetRef = useRef(null);
  const playerPosRef = useRef({ x: 1390, y: 460, direction: 'down' });
  const lastSentRef = useRef({ x: 1390, y: 460 });
  const cameraRef = useRef({ x: 1390, y: 460, zoom: 1, userZoom: 1 });
  const overviewRef = useRef(false);
  const nearObjRef = useRef(null);
  const lastRoomIdRef = useRef(null);
  const smoothUsersRef = useRef({});
  const staticLayerRef = useRef(null);
  const [isOverview, setIsOverview] = useState(false);

  // Particles for Sakura Cherry Blossom petals
  const petalsRef = useRef(
    Array.from({ length: 45 }, () => ({
      x: 640 + Math.random() * 1500,
      y: 80 + Math.random() * 520,
      size: 4 + Math.random() * 5,
      speedX: -0.5 + Math.random() * 1,
      speedY: 0.8 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      opacity: 0.4 + Math.random() * 0.5
    }))
  );

  const toggleOverview = () => {
    setIsOverview((prev) => {
      overviewRef.current = !prev;
      return !prev;
    });
  };

  // Adoptar posición externa (login / teleport del directorio).
  // Los ecos de nuestras propias actualizaciones se ignoran por umbral de distancia.
  useEffect(() => {
    if (!player || player.x === undefined || player.y === undefined) return;
    const pos = playerPosRef.current;
    const dist = Math.hypot(player.x - pos.x, player.y - pos.y);
    if (dist > TELEPORT_THRESHOLD) {
      pos.x = player.x;
      pos.y = player.y;
      pos.direction = player.direction || 'down';
      lastSentRef.current = { x: player.x, y: player.y };
      clickTargetRef.current = null;
    }
  }, [player]);

  // Teclado — registrado una sola vez
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      const key = e.key.toLowerCase();

      // Evitar que las flechas hagan scroll de la página
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      keysRef.current[key] = true;

      if ((key === 'e' || key === 'enter') && nearObjRef.current) {
        propsRef.current.onInteractObject(nearObjRef.current);
      }

      if (key === 'm') {
        toggleOverview();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Zoom con rueda del mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const cam = cameraRef.current;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      cam.userZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.userZoom * factor));
      if (overviewRef.current) {
        overviewRef.current = false;
        setIsOverview(false);
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

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

  const handleCanvasClick = (e) => {
    const { x: clickX, y: clickY } = screenToWorld(e.clientX, e.clientY);

    // Check if clicked directly on an interactive object
    for (const obj of INTERACTIVE_OBJECTS) {
      if (
        clickX >= obj.x - 20 &&
        clickX <= obj.x + obj.width + 20 &&
        clickY >= obj.y - 20 &&
        clickY <= obj.y + obj.height + 20
      ) {
        const dist = Math.hypot(
          playerPosRef.current.x - (obj.x + obj.width / 2),
          playerPosRef.current.y - (obj.y + obj.height / 2)
        );
        if (dist < 180) {
          propsRef.current.onInteractObject(obj);
          return;
        }
      }
    }

    clickTargetRef.current = {
      x: Math.max(50, Math.min(OFFICE_WIDTH - 50, clickX)),
      y: Math.max(50, Math.min(OFFICE_HEIGHT - 50, clickY))
    };
    sounds.playClick();
  };

  // ==========================================
  // GAME LOOP — se monta UNA vez, todo el estado caliente vive en refs
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!staticLayerRef.current) {
      staticLayerRef.current = buildStaticLayer(STATIC_SCALE);
    }
    // Los letreros de la capa estática usan la fuente web: se re-dibuja al cargarla.
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (!disposed) staticLayerRef.current = buildStaticLayer(STATIC_SCALE);
    });

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    let animTime = 0;
    let stepTimer = 0;
    let syncTimer = 0;
    let wasMoving = false;
    let lastFrame = performance.now();
    let rafId;

    const sendPosition = () => {
      const pos = playerPosRef.current;
      lastSentRef.current = { x: pos.x, y: pos.y };
      propsRef.current.onUpdatePlayerPosition(pos.x, pos.y, pos.direction);
    };

    const gameLoop = (now) => {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      animTime += dt * 3; // misma velocidad visual que el 0.05/frame original

      const keys = keysRef.current;
      const pos = playerPosRef.current;
      const speed = MOVE_SPEED * dt;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) {
        dy -= speed;
        pos.direction = 'up';
        clickTargetRef.current = null;
      }
      if (keys['s'] || keys['arrowdown']) {
        dy += speed;
        pos.direction = 'down';
        clickTargetRef.current = null;
      }
      if (keys['a'] || keys['arrowleft']) {
        dx -= speed;
        pos.direction = 'left';
        clickTargetRef.current = null;
      }
      if (keys['d'] || keys['arrowright']) {
        dx += speed;
        pos.direction = 'right';
        clickTargetRef.current = null;
      }

      // Normalizar diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      // Handle Mouse Click Movement
      if (clickTargetRef.current && dx === 0 && dy === 0) {
        const target = clickTargetRef.current;
        const distDx = target.x - pos.x;
        const distDy = target.y - pos.y;
        const dist = Math.hypot(distDx, distDy);

        if (dist > 6) {
          const step = Math.min(speed, dist);
          dx = (distDx / dist) * step;
          dy = (distDy / dist) * step;
          if (Math.abs(distDx) > Math.abs(distDy)) {
            pos.direction = distDx > 0 ? 'right' : 'left';
          } else {
            pos.direction = distDy > 0 ? 'down' : 'up';
          }
        } else {
          clickTargetRef.current = null;
        }
      }

      const isMoving = dx !== 0 || dy !== 0;

      if (isMoving) {
        pos.x = Math.max(50, Math.min(OFFICE_WIDTH - 50, pos.x + dx));
        pos.y = Math.max(50, Math.min(OFFICE_HEIGHT - 50, pos.y + dy));

        stepTimer += dt;
        if (stepTimer > 0.28) {
          stepTimer = 0;
          sounds.playStep();
        }

        syncTimer += dt;
        if (syncTimer > SYNC_INTERVAL) {
          syncTimer = 0;
          sendPosition();
        }
      } else if (wasMoving) {
        // Se detuvo: reportar posición final exacta
        sendPosition();
        syncTimer = 0;
      }
      wasMoving = isMoving;

      // Check proximity to interactive objects
      let currentNearObject = null;
      for (const obj of INTERACTIVE_OBJECTS) {
        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;
        const dist = Math.hypot(pos.x - centerX, pos.y - centerY);

        const triggerRadius = obj.type === 'fountain' ? 140 : 120;
        if (dist < triggerRadius) {
          currentNearObject = obj;
          break;
        }
      }

      // Si no hay ningún objeto cerca, revisa si hay un compañero (bot) cerca
      // para conversar — reutiliza el mismo mecanismo de prompt "[E]" que los objetos.
      if (!currentNearObject) {
        const others = propsRef.current.otherUsers || [];
        let nearestBot = null;
        let nearestDist = 90;
        for (const u of others) {
          if (!u.isBot || u.x === undefined || u.y === undefined) continue;
          const dist = Math.hypot(pos.x - u.x, pos.y - u.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestBot = u;
          }
        }
        if (nearestBot) {
          currentNearObject = {
            id: `npc:${nearestBot.id}`,
            type: 'npc_dialogue',
            title: nearestBot.name,
            botId: nearestBot.id,
            prompt: `Presiona [E] para hablar con ${nearestBot.name}`
          };
        }
      }

      if (currentNearObject?.id !== nearObjRef.current?.id) {
        nearObjRef.current = currentNearObject;
        propsRef.current.setActivePrompt(currentNearObject);
      }

      // Detección de sala actual, para la misión "Recorre la oficina".
      const currentRoom = ROOMS.find(
        (r) => pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height
      );
      const currentRoomId = currentRoom?.id || null;
      if (currentRoomId && currentRoomId !== lastRoomIdRef.current) {
        lastRoomIdRef.current = currentRoomId;
        propsRef.current.onRoomEnter?.(currentRoomId);
      }

      // ==========================================
      // CÁMARA — sigue al jugador, zoom suave, límites del mapa
      // ==========================================
      const cam = cameraRef.current;
      const vw = canvas.width / dpr;
      const vh = canvas.height / dpr;
      const fitZoom = Math.min(vw / OFFICE_WIDTH, vh / OFFICE_HEIGHT);
      const targetZoom = overviewRef.current ? fitZoom : cam.userZoom;
      cam.zoom += (targetZoom - cam.zoom) * Math.min(1, dt * 8);

      let targetX = overviewRef.current ? OFFICE_WIDTH / 2 : pos.x;
      let targetY = overviewRef.current ? OFFICE_HEIGHT / 2 : pos.y;

      const halfW = vw / 2 / cam.zoom;
      const halfH = vh / 2 / cam.zoom;
      // Límites = borde del "diorama" (24px dentro del mapa), para no mostrar el fondo al jugar
      const EDGE = 24;
      const spanW = OFFICE_WIDTH - EDGE * 2;
      const spanH = OFFICE_HEIGHT - EDGE * 2;
      targetX = spanW < halfW * 2 ? OFFICE_WIDTH / 2 : Math.max(EDGE + halfW, Math.min(OFFICE_WIDTH - EDGE - halfW, targetX));
      targetY = spanH < halfH * 2 ? OFFICE_HEIGHT / 2 : Math.max(EDGE + halfH, Math.min(OFFICE_HEIGHT - EDGE - halfH, targetY));

      cam.x += (targetX - cam.x) * Math.min(1, dt * 6);
      cam.y += (targetY - cam.y) * Math.min(1, dt * 6);

      // ==========================================
      // RENDER
      // ==========================================
      // Fondo fuera del mapa
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBackdrop(ctx, vw, vh);

      // Transform de cámara: mundo → pantalla
      ctx.setTransform(
        dpr * cam.zoom, 0, 0, dpr * cam.zoom,
        dpr * (vw / 2 - cam.x * cam.zoom),
        dpr * (vh / 2 - cam.y * cam.zoom)
      );

      // Capa estática (pisos + muros + plantas + letreros) en un solo drawImage
      ctx.drawImage(staticLayerRef.current, 0, 0, OFFICE_WIDTH, OFFICE_HEIGHT);

      INTERACTIVE_OBJECTS.forEach((obj) => {
        drawInteractiveObject(ctx, obj, animTime, currentNearObject?.id === obj.id);
      });

      if (clickTargetRef.current) {
        drawClickTarget(ctx, clickTargetRef.current, animTime);
      }

      // Avatares: bots con interpolación suave, ordenados por profundidad (y)
      const others = propsRef.current.otherUsers || [];
      const smooth = smoothUsersRef.current;
      const drawList = [];
      others.forEach((u) => {
        if (u.x === undefined || u.y === undefined) return;
        let s = smooth[u.id];
        if (!s) {
          s = { x: u.x, y: u.y, dir: 'down' };
          smooth[u.id] = s;
        }
        const ddx = u.x - s.x;
        const ddy = u.y - s.y;
        // Si el salto es enorme (teleport), snap directo
        if (Math.hypot(ddx, ddy) > 300) {
          s.x = u.x;
          s.y = u.y;
        } else {
          s.x += ddx * Math.min(1, dt * 12);
          s.y += ddy * Math.min(1, dt * 12);
        }
        const botMoving = Math.hypot(ddx, ddy) > 1.5;
        if (botMoving) {
          s.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : (ddy > 0 ? 'down' : 'up');
        }
        drawList.push({
          user: { ...u, x: s.x, y: s.y, direction: u.direction || s.dir },
          opts: { t: animTime, isMoving: botMoving, isNear: currentNearObject?.id === `npc:${u.id}` }
        });
      });

      const currentPlayer = propsRef.current.player;
      if (currentPlayer) {
        drawList.push({
          user: { ...currentPlayer, x: pos.x, y: pos.y, direction: pos.direction },
          opts: { isSelf: true, t: animTime, isMoving }
        });
      }
      drawList.sort((a, b) => a.user.y - b.user.y).forEach(({ user, opts }) => drawAvatar(ctx, user, opts));

      // Pétalos de cerezo cayendo por encima de todo en el patio
      const petalSpeed = dt * 60;
      petalsRef.current.forEach((petal) => {
        petal.x += (petal.speedX + Math.sin(animTime + petal.y * 0.01) * 0.3) * petalSpeed;
        petal.y += petal.speedY * petalSpeed;
        petal.rotation += petal.rotSpeed * petalSpeed;
        if (petal.y > 600) {
          petal.y = 80;
          petal.x = 640 + Math.random() * 1500;
        }
        drawPetal(ctx, petal);
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawVignette(ctx, vw, vh);

      rafId = requestAnimationFrame(gameLoop);
    };

    rafId = requestAnimationFrame(gameLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#0e0b29' }}>
      <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ display: 'block', cursor: 'pointer' }} />

      <button className="map-toggle" onClick={toggleOverview} title="Atajo: tecla M · Zoom: rueda del mouse">
        <span>{isOverview ? '🔍' : '🗺️'}</span>
        <span>{isOverview ? 'Seguir jugador' : 'Ver mapa'}</span>
        <kbd>M</kbd>
      </button>
    </div>
  );
};
