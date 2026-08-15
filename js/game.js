/* 跳跃障碍小游戏：仿 Chrome 小恐龙
   角色/障碍都按贴图可见像素贴地，速度随分数增长，障碍间距随机 */
(function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("game-score");
  const bestEl = document.getElementById("game-best");
  const stateEl = document.getElementById("game-state");

  canvas.width = 960;
  canvas.height = 360;
  const GROUND = 305;

  /* 网格切帧参数（按你的动图设定） */
  const RUNNER_COLS = 8;
  const RUNNER_ROWS = 4;
  const OB_COLS = 4;
  const OB_ROWS = 2;
  const SCALE = 2.8; /* 放大显示倍数 */
  const JUMP_VY = -9.5;
  const GRAVITY = 0.55;
  const HOLD_GRAVITY = 0.26; /* 按住时重力变小，跳得更高更久 */
  const MAX_HOLD = 60;       /* 按住最多生效的帧数，防止无限飘 */

  const runnerImg = new Image();
  runnerImg.src = "assets/runner.png";
  const obstacleImg = new Image();
  obstacleImg.src = "assets/obstacle.png";

  /* 帧尺寸（按图实际尺寸均分） */
  let runnerFW = 40, runnerFH = 56;
  let obFW = 40, obFH = 56;
  let runnerBounds = []; /* 角色每帧贴图的可见像素范围 */
  let obBounds = [];     /* 障碍每帧贴图的可见像素范围 */
  let groundAnchorY = GROUND - 156.8; /* 角色可见底部贴地时的 y */
  let anchorsReady = false;

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

  /* 计算图片每个网格帧的可见像素范围（贴图本身的边界） */
  function computeBounds() {
    if (!obstacleImg.naturalWidth || !runnerImg.naturalWidth) return;
    const measure = (img, cols, rows, fw, fh) => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const cx = c.getContext("2d");
      cx.drawImage(img, 0, 0);
      const { data } = cx.getImageData(0, 0, c.width, c.height);
      const w = c.width, h = c.height;
      const arr = [];
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const x0c = Math.floor(col * fw), x1c = Math.floor((col + 1) * fw);
          const y0c = Math.floor(r * fh), y1c = Math.floor((r + 1) * fh);
          let vx = fw, vy = fh, vx1 = -1, vy1 = -1;
          for (let y = y0c; y < y1c; y++) {
            for (let x = x0c; x < x1c; x++) {
              if (data[(y * w + x) * 4 + 3] > 30) {
                const lx = x - x0c, ly = y - y0c;
                if (lx < vx) vx = lx;
                if (lx > vx1) vx1 = lx;
                if (ly < vy) vy = ly;
                if (ly > vy1) vy1 = ly;
              }
            }
          }
          arr.push({ vx, vy, vw: vx1 - vx + 1, vh: vy1 - vy + 1 });
        }
      }
      return arr;
    };
    try {
      runnerBounds = measure(runnerImg, RUNNER_COLS, RUNNER_ROWS, runnerFW, runnerFH);
      obBounds = measure(obstacleImg, OB_COLS, OB_ROWS, obFW, obFH);
    } catch (e) {
      /* file:// 等跨域环境：回退为整格内缩 15% */
      const fb = (fw, fh) => ({ vx: fw * 0.15, vy: fh * 0.15, vw: fw * 0.7, vh: fh * 0.7 });
      runnerBounds = Array.from({ length: RUNNER_COLS * RUNNER_ROWS }, () => fb(runnerFW, runnerFH));
      obBounds = Array.from({ length: OB_COLS * OB_ROWS }, () => fb(obFW, obFH));
    }
  }

  /* 让角色可见底部正好贴在地面线上 */
  function updateAnchors() {
    if (!runnerBounds.length) return;
    const rb = runnerBounds[runFrame] || runnerBounds[0];
    groundAnchorY = GROUND - ((rb.vy + rb.vh) / runnerFH) * playerH;
    anchorsReady = true;
  }

  const playerW = runnerFW * SCALE;
  const playerH = runnerFH * SCALE;
  const player = { x: 64, y: groundAnchorY, vy: 0, grounded: true };

  let obstacles = [];
  let speed = 3.0;
  let score = 0;
  let best = 0;
  let over = false;
  let frame = 0;
  let spawnTimer = 60;
  let runFrame = 0;
  let holding = false;
  let holdFrames = 0;

  /* 黑底上的星星点缀 */
  const stars = [];
  for (let i = 0; i < 26; i++) {
    stars.push({ x: Math.random() * canvas.width, y: Math.random() * (canvas.height * 0.55), r: 1 + Math.random() * 1.5 });
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
    player.y = groundAnchorY;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    speed = 3.0;
    score = 0;
    over = false;
    spawnTimer = 60;
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
    if (!obBounds.length || !runnerBounds.length) computeBounds();
    if (runnerBounds.length && !anchorsReady) updateAnchors();

    const g = (holding && player.vy < 0 && holdFrames < MAX_HOLD) ? HOLD_GRAVITY : GRAVITY;
    if (holding) holdFrames++;
    if (holdFrames >= MAX_HOLD) holding = false;
    player.vy += g;
    player.y += player.vy;
    if (player.y >= groundAnchorY) {
      player.y = groundAnchorY;
      player.vy = 0;
      player.grounded = true;
      holding = false;
      holdFrames = 0;
    }

    spawnTimer--;
    if (spawnTimer <= 0) {
      const h = 80 + Math.random() * 60;
      const fi = Math.floor(Math.random() * (OB_COLS * OB_ROWS));
      const b = obBounds[fi] || { vx: 4, vy: 5, vw: obFW - 8, vh: obFH - 10 };
      obstacles.push({
        x: canvas.width + 20 + Math.random() * 80,
        h,
        w: h * (obFW / obFH),
        fi,
        anchorY: GROUND - ((b.vy + b.vh) / obFH) * h
      });
      window.__gameDebug.lastObstacleH = Math.round(h);
      spawnTimer = 45 + Math.random() * 115;
    }
    obstacles.forEach(o => { o.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.w > -40);
    score += 0.1;
    speed = Math.min(13, 3.0 + score / 80); /* 速度随分数明显增长 */

    /* 只有落地时才推进跑步动画帧；腾空时暂停 */
    if (player.grounded) {
      const animSpeed = Math.max(3, Math.round(12 - speed * 0.6));
      runFrame = Math.floor(frame / animSpeed) % (RUNNER_COLS * RUNNER_ROWS);
      /* 逐帧贴地：当前帧贴图底部正好压在地面线上 */
      const rb = runnerBounds[runFrame];
      if (rb) groundAnchorY = GROUND - ((rb.vy + rb.vh) / runnerFH) * playerH;
    }

    /* 角色碰撞箱（按贴图可见像素） */
    const rb = runnerBounds[runFrame] || { vx: runnerFW * 0.15, vy: runnerFH * 0.15, vw: runnerFW * 0.7, vh: runnerFH * 0.7 };
    const sxP = playerW / runnerFW;
    const syP = playerH / runnerFH;
    const pr = {
      x: player.x + rb.vx * sxP + 1,
      y: player.y + rb.vy * syP + 1,
      w: Math.max(2, rb.vw * sxP - 2),
      h: Math.max(2, rb.vh * syP - 2)
    };
    for (const o of obstacles) {
      const b = obBounds[o.fi] || { vx: 4, vy: 5, vw: obFW - 8, vh: obFH - 10 };
      const sx = o.w / obFW;
      const sy = o.h / obFH;
      const or = {
        x: o.x + b.vx * sx + 1,
        y: o.anchorY + b.vy * sy + 1,
        w: Math.max(2, b.vw * sx - 2),
        h: Math.max(2, b.vh * sy - 2)
      };
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

    /* 调试信息 */
    window.__gameDebug.grounded = player.grounded;
    window.__gameDebug.runFrame = runFrame;
    window.__gameDebug.y = Math.round(player.y);
    window.__gameDebug.holding = holding;
    window.__gameDebug.frame = frame;
    window.__gameDebug.speed = +speed.toFixed(2);
    window.__gameDebug.groundAnchorY = Math.round(groundAnchorY);
    window.__gameDebug.playerVisibleBottom = Math.round(player.y + (rb.vy + rb.vh) * syP);
    window.__gameDebug.obBounds = obBounds.length ? obBounds[0] : null;
    if (obstacles.length) {
      const o = obstacles[0];
      const b = obBounds[o.fi] || { vx: 4, vy: 5, vw: obFW - 8, vh: obFH - 10 };
      window.__gameDebug.obVisibleBottom = Math.round(o.anchorY + (b.vy + b.vh) * (o.h / obFH));
    }
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
    /* 移动的地面虚线（仿小恐龙） */
    ctx.fillStyle = "#666";
    const off = Math.floor(frame * speed) % 28;
    for (let x = -off; x < canvas.width; x += 28) {
      ctx.fillRect(x, GROUND, 14, 2);
    }

    /* 障碍（4x2 网格切帧，每个障碍随机取一帧，不播放） */
    if (obstacleImg.naturalWidth) {
      for (const o of obstacles) {
        const obRow = Math.floor(o.fi / OB_COLS);
        const obCol = o.fi % OB_COLS;
        ctx.drawImage(obstacleImg, obCol * obFW, obRow * obFH, obFW, obFH, o.x, o.anchorY, o.w, o.h);
      }
    }

    /* 角色（8x4 网格切帧，32 帧循环播放） */
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
  computeBounds();
  updateAnchors();
  loop();
})();
