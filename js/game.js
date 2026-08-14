/* 跳跃障碍小游戏：角色动图按 8x4 网格切帧播放，障碍按 4x2 网格，黑底 */
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

  /* 网格切帧参数（按你的动图设定） */
  const RUNNER_COLS = 8;
  const RUNNER_ROWS = 4;
  const OB_COLS = 4;
  const OB_ROWS = 2;
  const SCALE = 2; /* 放大 2 倍显示 */
  const JUMP_VY = -8.0;
  const GRAVITY = 0.62;
  const HOLD_GRAVITY = 0.38; /* 按住时重力变小，跳得更高更久 */
  const MAX_HOLD = 26;       /* 按住最多生效的帧数，防止无限飘 */

  const runnerImg = new Image();
  runnerImg.src = "assets/runner.png";
  const obstacleImg = new Image();
  obstacleImg.src = "assets/obstacle.png";

  /* 帧尺寸（按图实际尺寸均分） */
  let runnerFW = 40, runnerFH = 56;
  let obFW = 40, obFH = 56;
  function frameSizes() {
    if (runnerImg.naturalWidth) {
      runnerFW = runnerImg.naturalWidth / RUNNER_COLS;
      runnerFH = runnerImg.naturalHeight / RUNNER_ROWS;
    }
    if (obstacleImg.naturalWidth) {
      obFW = obstacleImg.naturalWidth / OB_COLS;
      obFH = obstacleImg.naturalHeight / OB_ROWS;
    }
  }

  const playerW = runnerFW * SCALE; /* 80 */
  const playerH = runnerFH * SCALE; /* 112 */
  const player = { x: 64, y: GROUND - playerH, vy: 0, grounded: true };

  let obstacles = [];
  let speed = 2.6;
  let score = 0;
  let best = 0;
  let over = false;
  let frame = 0;
  let spawnTimer = 70;
  let runFrame = 0;
  let holding = false;
  let holdFrames = 0;

  /* 黑底上的星星点缀 */
  const stars = [];
  for (let i = 0; i < 26; i++) {
    stars.push({ x: Math.random() * 720, y: Math.random() * 150, r: 1 + Math.random() * 1.5 });
  }

  try { best = Number(localStorage.getItem("wuju59-game-best")) || 0; } catch (e) { /* 忽略 */ }
  bestEl.textContent = String(best);
  scoreEl.textContent = "0";

  window.__gameDebug = {
    frameCount: RUNNER_COLS * RUNNER_ROWS,
    playerW: Math.round(playerW),
    playerH: Math.round(playerH),
    obstacleFrames: OB_COLS * OB_ROWS
  };

  function reset() {
    player.y = GROUND - playerH;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    speed = 2.6;
    score = 0;
    over = false;
    spawnTimer = 70;
    runFrame = 0;
    holding = false;
    holdFrames = 0;
    stateEl.textContent = "空格 / 点击 跳跃";
    scoreEl.textContent = "0";
  }

  function jump() {
    if (over) { reset(); return; }
    if (player.grounded) {
      player.vy = JUMP_VY;
      player.grounded = false;
      holding = true;
      holdFrames = 0;
    }
  }

  function releaseJump() {
    holding = false;
  }

  function update() {
    if (over) return;
    frame++;
    frameSizes();

    const g = (holding && player.vy < 0 && holdFrames < MAX_HOLD) ? HOLD_GRAVITY : GRAVITY;
    if (holding) holdFrames++;
    if (holdFrames >= MAX_HOLD) holding = false;
    player.vy += g;
    player.y += player.vy;
    if (player.y >= GROUND - playerH) {
      player.y = GROUND - playerH;
      player.vy = 0;
      player.grounded = true;
      holding = false;
      holdFrames = 0;
    }
    spawnTimer--;
    if (spawnTimer <= 0) {
      const h = 30 + Math.random() * 20;
      obstacles.push({
        x: canvas.width + 20,
        h,
        w: h * (obFW / obFH),
        fi: Math.floor(Math.random() * (OB_COLS * OB_ROWS))
      });
      spawnTimer = 60 + Math.random() * 55;
    }
    obstacles.forEach(o => { o.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.w > -40);
    score += 0.1;
    speed = 2.6 + score / 350;

    /* 只有落地时才推进跑步动画帧；腾空时暂停 */
    if (player.grounded) {
      const animSpeed = Math.max(3, Math.round(12 - speed * 0.8));
      runFrame = Math.floor(frame / animSpeed) % (RUNNER_COLS * RUNNER_ROWS);
    }
    window.__gameDebug.grounded = player.grounded;
    window.__gameDebug.runFrame = runFrame;
    window.__gameDebug.y = Math.round(player.y);
    window.__gameDebug.holding = holding;
    window.__gameDebug.frame = frame;

    const pr = { x: player.x + 12, y: player.y + 14, w: playerW - 24, h: playerH - 26 };
    for (const o of obstacles) {
      const or = { x: o.x + 4, y: GROUND - o.h + 5, w: o.w - 8, h: o.h - 5 };
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

    /* 障碍（4x2 网格切帧，每个障碍随机取一帧，不播放） */
    if (obstacleImg.naturalWidth) {
      for (const o of obstacles) {
        const obRow = Math.floor(o.fi / OB_COLS);
        const obCol = o.fi % OB_COLS;
        ctx.drawImage(obstacleImg, obCol * obFW, obRow * obFH, obFW, obFH, o.x, GROUND - o.h, o.w, o.h);
      }
    }

    /* 角色（8x4 网格切帧，32 帧循环播放，随速度加快） */
    if (runnerImg.naturalWidth) {
      const row = Math.floor(runFrame / RUNNER_COLS);
      const col = runFrame % RUNNER_COLS;
      ctx.drawImage(runnerImg, col * runnerFW, row * runnerFH, runnerFW, runnerFH, player.x, player.y, playerW, playerH);
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
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      releaseJump();
    }
  });
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    jump();
  });
  canvas.addEventListener("pointerup", releaseJump);
  canvas.addEventListener("pointercancel", releaseJump);
  window.addEventListener("blur", releaseJump);
  document.getElementById("game-restart").addEventListener("click", reset);

  reset();
  frameSizes();
  loop();
})();
