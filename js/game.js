/* 跳跃障碍小游戏（浏览器小恐龙风格） */
(function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("game-score");
  const bestEl = document.getElementById("game-best");
  const stateEl = document.getElementById("game-state");

  canvas.width = 720;
  canvas.height = 240;
  const GROUND = 192;

  const player = { x: 64, w: 38, h: 44, y: GROUND - 44, vy: 0, grounded: true };
  let obstacles = [];
  let speed = 4.2;
  let score = 0;
  let best = 0;
  let over = false;
  let frame = 0;
  let spawnTimer = 40;

  try { best = Number(localStorage.getItem("wuju59-game-best")) || 0; } catch (e) { /* 忽略 */ }
  bestEl.textContent = String(best);
  scoreEl.textContent = "0";

  function reset() {
    player.y = GROUND - player.h;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    speed = 4.2;
    score = 0;
    over = false;
    spawnTimer = 40;
    stateEl.textContent = "空格 / 点击 跳跃";
    scoreEl.textContent = "0";
  }

  function jump() {
    if (over) { reset(); return; }
    if (player.grounded) {
      player.vy = -10.5;
      player.grounded = false;
    }
  }

  function update() {
    if (over) return;
    frame++;
    player.vy += 0.52;
    player.y += player.vy;
    if (player.y >= GROUND - player.h) {
      player.y = GROUND - player.h;
      player.vy = 0;
      player.grounded = true;
    }
    spawnTimer--;
    if (spawnTimer <= 0) {
      const h = 22 + Math.random() * 26;
      obstacles.push({ x: canvas.width + 20, w: 14 + Math.random() * 10, h });
      spawnTimer = 55 + Math.random() * 45;
    }
    obstacles.forEach(o => { o.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.w > -20);
    score += 0.1;
    speed = 4.2 + score / 320;

    const pr = { x: player.x + 6, y: player.y + 6, w: player.w - 12, h: player.h - 8 };
    for (const o of obstacles) {
      const or = { x: o.x + 3, y: GROUND - o.h + 4, w: o.w - 6, h: o.h - 4 };
      if (pr.x < or.x + or.w && pr.x + pr.w > or.x && pr.y < or.y + or.h && pr.y + pr.h > or.y) {
        over = true;
        const s = Math.floor(score);
        if (s > best) {
          best = s;
          bestEl.textContent = String(best);
          try { localStorage.setItem("wuju59-game-best", String(best)); } catch (e) { /* 忽略 */ }
        }
        stateEl.textContent = "撞到啦！按空格或点击重新开始";
        return;
      }
    }
    scoreEl.textContent = String(Math.floor(score));
  }

  function draw() {
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* 云 */
    ctx.fillStyle = "#f2d9b8";
    ctx.beginPath();
    ctx.arc(560, 34, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(575, 28, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(588, 34, 8, 0, Math.PI * 2);
    ctx.fill();
    /* 地面 */
    ctx.fillStyle = "#b8a98f";
    ctx.fillRect(0, GROUND, canvas.width, 2);
    /* 障碍（仙人掌） */
    ctx.fillStyle = "#6f8f4f";
    for (const o of obstacles) {
      ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
      ctx.fillRect(o.x - 5, GROUND - o.h - 9, 6, 12);
      ctx.fillRect(o.x + o.w - 1, GROUND - o.h - 9, 6, 12);
    }
    /* 小恐龙 */
    ctx.fillStyle = "#3a2c1e";
    const p = player;
    ctx.fillRect(p.x + 12, p.y - 2, 24, 16);
    ctx.fillRect(p.x, p.y + 10, p.w, p.h - 10);
    ctx.fillRect(p.x - 7, p.y + 18, 9, 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect(p.x + 26, p.y + 3, 6, 6);
    ctx.fillStyle = "#3a2c1e";
    ctx.fillRect(p.x + 30, p.y + 5, 3, 3);
    if (player.grounded) {
      const step = Math.floor(frame / 7) % 2;
      ctx.fillRect(p.x + 4, p.y + p.h - 6, 12, 6 - step * 3);
      ctx.fillRect(p.x + 20, p.y + p.h - 6, 12, 3 + step * 3);
    } else {
      ctx.fillRect(p.x + 4, p.y + p.h - 6, 12, 6);
      ctx.fillRect(p.x + 20, p.y + p.h - 6, 12, 6);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      jump();
    }
  });
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    jump();
  });
  document.getElementById("game-restart").addEventListener("click", reset);

  reset();
  loop();
})();
