import React, { useEffect, useRef, useState } from 'react';

export default function GameSaveEarth() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ability1, setAbility1] = useState(0); // Big missile: clear all
  const [ability2, setAbility2] = useState(0); // Rapid small missiles 10s
  const [ability3, setAbility3] = useState(0); // Two super missiles clear all
  const [rapidModeUntil, setRapidModeUntil] = useState(0);

  const stateRef = useRef({ asteroids: [], missiles: [], lastSpawn: 0, player: { x: 200, w: 40, h: 8, vx: 0 } });
  const keysRef = useRef({ left: false, right: false, shooting: false });
  const lastShotRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    // Load high score once
    try {
      const saved = localStorage.getItem('earth_game_high_score');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {}

    const resize = () => {
      canvas.width = 375; // mobile width (iPhone standard)
      canvas.height = 667; // mobile height (iPhone standard)
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnAsteroid = () => {
      // Spawn asteroids away from borders (20% margin on each side)
      const margin = canvas.width * 0.2;
      const x = margin + Math.random() * (canvas.width - 2 * margin);
      const radius = 10 + Math.random() * 15;
      const speed = 0.5 + Math.random() * 0.8; // slower asteroid drop
      stateRef.current.asteroids.push({ x, y: -radius, r: radius, vy: speed });
    };

    const shootMissile = (x, y) => {
      stateRef.current.missiles.push({ x, y, vy: -6 });
    };

    const onClick = (e) => {
      if (!running || gameOver || paused) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Single shot per click (no continuous shooting)
      if (!keysRef.current.shotFired) {
        keysRef.current.shotFired = true;
        shootMissile(x, canvas.height - 20);
        // Reset shot flag after a short delay to allow next click
        setTimeout(() => {
          keysRef.current.shotFired = false;
        }, 100);
      }
    };
    canvas.addEventListener('click', onClick);
    const onKeyDown = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }
      if (!running || gameOver || paused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === ' ' || e.code === 'Space') keysRef.current.shooting = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === ' ' || e.code === 'Space') {
        keysRef.current.shooting = false;
        keysRef.current.shotFired = false; // Reset shot flag when spacebar is released
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const loop = (t) => {
      if (!running || paused) return;
      const { asteroids, missiles } = stateRef.current;
      if (!stateRef.current.player) {
        stateRef.current.player = { x: canvas.width / 2, w: 40, h: 8, vx: 0 };
      }
      const player = stateRef.current.player;

      // spawn
      if (t - stateRef.current.lastSpawn > 1000) {
        spawnAsteroid();
        stateRef.current.lastSpawn = t;
      }
      // rapid fire mode auto-shoot
      if (rapidModeUntil > performance.now()) {
        if (Math.random() < 0.2) shootMissile(Math.random() * canvas.width, canvas.height - 20);
      }

      // player movement & shooting
      const moveSpeed = 5;
      if (keysRef.current.left) player.vx = -moveSpeed; else if (keysRef.current.right) player.vx = moveSpeed; else player.vx = 0;
      player.x += player.vx;
      player.x = Math.max(player.w / 2, Math.min(canvas.width - player.w / 2, player.x));
      
      // Single shot per spacebar press (no continuous shooting)
      if (keysRef.current.shooting && !keysRef.current.shotFired) {
        keysRef.current.shotFired = true; // Prevent multiple shots from same press
        shootMissile(player.x, canvas.height - 24);
      }

      // update
      for (const a of asteroids) a.y += a.vy;
      for (const m of missiles) m.y += m.vy;

      // collisions
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        // earth hit
        if (a.y - a.r > canvas.height) {
          setRunning(false);
          setGameOver(true);
          break;
        }
        for (let j = missiles.length - 1; j >= 0; j--) {
          const m = missiles[j];
          const dx = a.x - m.x;
          const dy = a.y - m.y;
          if (dx * dx + dy * dy < (a.r + 3) * (a.r + 3)) {
            asteroids.splice(i, 1);
            missiles.splice(j, 1);
            setScore((s) => {
              const next = s + 1;
              if (next > highScore) {
                setHighScore(next);
                try { localStorage.setItem('earth_game_high_score', String(next)); } catch {}
              }
              return next;
            });
            setAbility1((v) => Math.min(100, v + 5));
            setAbility2((v) => Math.min(100, v + 3));
            setAbility3((v) => Math.min(100, v + 2));
            break;
          }
        }
      }
      // cleanup missiles
      for (let j = missiles.length - 1; j >= 0; j--) if (missiles[j].y < -10) missiles.splice(j, 1);

      // draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // EARTH (bottom layer)
      // big semicircle at the bottom to represent Earth horizon
      const earthRadius = Math.max(canvas.width, canvas.height);
      const earthCenterX = canvas.width / 2;
      const earthCenterY = canvas.height + earthRadius * 0.4; // push center below canvas
      const grad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius * 0.1,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      grad.addColorStop(0, '#1b5eaa');
      grad.addColorStop(1, '#0a2a4a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, Math.PI, 2 * Math.PI);
      ctx.fill();

      // subtle atmosphere glow
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#6ec8ff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius * 0.99, Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // player cannon
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(stateRef.current.player.x - player.w / 2, canvas.height - 18, player.w, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(stateRef.current.player.x - 3, canvas.height - 30, 6, 12);

      // asteroids
      ctx.fillStyle = '#8B7355';
      for (const a of asteroids) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // missiles
      ctx.fillStyle = '#ff5533';
      for (const m of missiles) {
        ctx.fillRect(m.x - 2, m.y - 6, 4, 12);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(raf);
    };
  }, [running, gameOver, rapidModeUntil, paused]);

  const clearAllAsteroids = () => {
    stateRef.current.asteroids = [];
  };

  const useAbility1 = () => {
    if (ability1 < 100) return;
    clearAllAsteroids();
    setAbility1(0);
  };

  const useAbility2 = () => {
    if (ability2 < 100) return;
    setRapidModeUntil(performance.now() + 10_000);
    setAbility2(0);
  };

  const useAbility3 = () => {
    if (ability3 < 100) return;
    // two waves
    clearAllAsteroids();
    setTimeout(clearAllAsteroids, 700);
    setAbility3(0);
  };

  const togglePause = () => {
    if (gameOver) return;
    setPaused(!paused);
  };

  const resetGame = () => {
    stateRef.current = { asteroids: [], missiles: [], lastSpawn: 0, player: { x: 200, w: 40, h: 8, vx: 0 } };
    setScore(0);
    setAbility1(0);
    setAbility2(0);
    setAbility3(0);
    setRapidModeUntil(0);
    setGameOver(false);
    setRunning(true);
    setPaused(false);
  };

  return (
    <div className="space-y-3">
      {/* Game Instructions */}
      <div className="text-center text-sm text-gray-400 mb-2">
        <div className="flex justify-center gap-4 flex-wrap">
          <span>🎮 <strong>Controls:</strong> Arrow Keys / WASD to move</span>
          <span>🚀 <strong>Shoot:</strong> Spacebar or Click</span>
          <span>⏸️ <strong>Pause:</strong> P key or button</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-gray-300 flex gap-4">
          <span>Score: <span className="text-white font-bold">{score}</span></span>
          <span>High Score: <span className="text-yellow-300 font-bold">{highScore}</span></span>
          <span>Destroyed: <span className="text-green-300 font-bold">{score}</span></span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={togglePause} 
            className={`px-3 py-1 rounded ${paused ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold`}
            disabled={gameOver}
          >
            {paused ? '▶️ PLAY' : '⏸️ PAUSE'}
          </button>
          <button onClick={useAbility1} className={`px-3 py-1 rounded ${ability1===100?'bg-red-600':'bg-red-800/60'} text-white`}>Big Missile ({ability1}%)</button>
          <button onClick={useAbility2} className={`px-3 py-1 rounded ${ability2===100?'bg-blue-600':'bg-blue-800/60'} text-white`}>Rapid Fire 10s ({ability2}%)</button>
          <button onClick={useAbility3} className={`px-3 py-1 rounded ${ability3===100?'bg-green-600':'bg-green-800/60'} text-white`}>Twin Strike ({ability3}%)</button>
        </div>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} className="rounded border border-gray-700 bg-black mx-auto" style={{ width: '375px', height: '667px', maxWidth: '100%' }} />
        {paused && !gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded border border-gray-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-2xl font-bold mb-2">⏸️ GAME PAUSED</div>
              <div className="text-sm text-gray-300">Click PLAY to continue</div>
            </div>
          </div>
        )}
      </div>
      {gameOver && (
        <div className="p-4 bg-red-900/40 border border-red-600/40 rounded text-center text-red-200">
          <div className="text-xl font-bold">Earth is doomed 💥</div>
          <div className="mt-2">
            <button onClick={resetGame} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white">Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}


