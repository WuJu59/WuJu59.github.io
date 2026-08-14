/* 跳跃障碍小游戏：角色动图按帧播放 + 障碍图片，黑底 */
(function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("game-score");
  const bestEl = document.getElementById("game-best");
  const stateEl = document.getElementById("game-state");

  canvas.width = 720;
  canvas.height = 240;
  const GROUND = 196;

  const runnerImg = new Image();
  runnerImg.src = "assets/runner.png";
  const obstacleImg = new Image();
  obstacleImg.src = "assets/obstacle.png";

  let frames = [];
  let playerH = 56;
  let playerW = 22;
  const player = { x: 64, y: GROUND - playerH, vy: 0, grounded: true };

  let obstacles = [];
  let speed = 2.6;
  let score = 0;
  let best = 0;
  let over = false;
  let frame = 0;
  let spawnTimer = 70;

  /* 背景小星星（固定位置，黑底上的点缀） */
  const stars = [];
  for (let i = 0; i < 26; i++) {
    stars.push({ x: Math.random() * 720, y: Math.random() * 150, r: 1 + Math.random() * 1.5 });
  }

  try { best = Number(localStorage.getItem("wuju59-game-best")) || 0; } catch (e) { /* 忽略 */ }
  bestEl.textContent = String(best);
  scoreEl.textContent = "0";

  /* 从透明底动图里自动切帧 */
  function analyzeFrames(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const cx = c.getContext("2d");
    cx.drawImage(img, 0, 0);
    const { data } = cx.getImageData(0, 0, c.width, c.height);
    const w = c.width, h = c.height;
    const colHas = new Array(w).fill(false);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (data[(y * w + x) * 4 + 3] > 20) { colHas[x] = true; break; }
      }
    }
    const runs = [];
    let start = -1;
    for (let x = 0; x <= w; x++) {
      const v = x < w && colHas[x];
      if (v && start < 0) start = x;
      if (!v && start >= 0) {
        if (x - start >= 4) runs.push([start, x - 1]);
        start = -1;
      }
    }
    if (!runs.length) return [{ x: 0, y: 0, w, h }];
    return runs.map(([x0, x1]) => {
      let y0 = h, y1 = -1;
      for (let x = x0; x <= x1; x++) {
        for (let y = 0; y < h; y++) {
          if (data[(y * w + x) * 4 + 3] > 20) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
      }
      return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    });
  }

  function initFrames() {
    if (!runnerImg.naturalWidth) return false;
    try {
      frames = analyzeFrames(runnerImg);
    } catch (e) {
      /* 本地 file:// 或跨域环境 canvas 会被污染，回退到均分切帧 */
      const w = runnerImg.naturalWidth;
      const h = runnerImg.naturalHeight;
      const n = 8;
      const slot = w / n;
      const fw = slot * 0.62;
      frames = Array.from({ length: n }, (_, i) => ({
        x: slot * i + (slot - fw) / 2,
        y: h * 0.06,
        w: fw,
        h: h * 0.9
      }));
    }
    const fr = frames[0];
    playerH = 56;
    playerW = Math.max(10, fr.w * (playerH / fr.h));
    player.y = GROUND - playerH;
    window.__gameDebug = { frameCount: frames.length, playerW: Math.round(playerW), playerH };
    return true;
  }

  function reset() {
    player.y = GROUND - playerH;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    speed = 2.6;
    score = 0;
    over = false;
    spawnTimer = 70;
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
    if (!frames.length) initFrames();

    player.vy += 0.52;
    player.y += player.vy;
    if (player.y >= GROUND - playerH) {
      player.y = GROUND - playerH;
      player.vy = 0;
      player.grounded = true;
    }
    spawnTimer--;
    if (spawnTimer <= 0) {
      const h = 24 + Math.random() * 22;
      const ratio = obstacleImg.naturalWidth ? obstacleImg.naturalWidth / obstacleImg.naturalHeight : 1.43;
      obstacles.push({ x: canvas.width + 20, h, w: h * ratio });
      spawnTimer = 60 + Math.random() * 55;
    }
    obstacles.forEach(o => { o.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.w > -30);
    score += 0.1;
    speed = 2.6 + score / 350;

    const pr = { x: player.x + 4, y: player.y + 8, w: playerW - 8, h: playerH - 10 };
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
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* 星星 */
    ctx.fillStyle = "#888";
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    /* 地面 */
    ctx.fillStyle = "#555";
    ctx.fillRect(0, GROUND, canvas.width, 2);

    /* 障碍 */
    if (obstacleImg.naturalWidth) {
      for (const o of obstacles) {
        ctx.drawImage(obstacleImg, o.x, GROUND - o.h, o.w, o.h);
      }
    }

    /* 角色（帧播放） */
    if (frames.length) {
      const animSpeed = Math.max(3, Math.round(9 - speed * 0.8));
      const fr = frames[Math.floor(frame / animSpeed) % frames.length];
      ctx.drawImage(runnerImg, fr.x, fr.y, fr.w, fr.h, player.x, player.y, playerW, playerH);
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
  initFrames();
  loop();
})();
