/**
 * משחק נחש – גרסה נקייה ועובדת
 */
(function() {
  "use strict";

  const GRID = 20;
  const SIZE = 400;
  let canvas, ctx;
  let snake, direction, fruit;
  let gameOver, isRunning, isPaused;
  let score, gameTime;
  let gameInterval, timerInterval;
  let gameSpeed = 85;
  let obstacles = [];
  const SAVE_KEY = "gameHubSnakeState";

  function getEl(id) { return document.getElementById(id); }

  function saveGameState() {
    if (!isRunning || gameOver) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        snake: snake, direction: direction, fruit: fruit, score: score, gameTime: gameTime,
        gameSpeed: gameSpeed, obstacles: obstacles, ts: Date.now()
      }));
    } catch (e) {}
  }

  function loadGameState() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.snake || !Array.isArray(s.snake) || s.snake.length < 1) return null;
      if (Date.now() - (s.ts || 0) > 24 * 60 * 60 * 1000) return null;
      return s;
    } catch (e) { return null; }
  }

  function clearSavedState() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  function getSpeed() {
    const sel = getEl("speedSelect");
    if (!sel) return 85;
    const v = parseInt(sel.value, 10);
    return (v === 120 || v === 85 || v === 55) ? v : 85;
  }

  function initGame(fromSave) {
    if (fromSave) {
      var saved = loadGameState();
      if (saved) {
        snake = saved.snake;
        direction = saved.direction;
        fruit = saved.fruit;
        score = saved.score || 0;
        gameTime = saved.gameTime || 0;
        gameSpeed = saved.gameSpeed || getSpeed();
        obstacles = Array.isArray(saved.obstacles) ? saved.obstacles : spawnObstacles(5);
      } else {
        fromSave = false;
      }
    }
    if (!fromSave) {
      gameSpeed = getSpeed();
      snake = [{ x: 200, y: 200 }];
      direction = "RIGHT";
      fruit = spawnFruit();
      score = 0;
      gameTime = 0;
      obstacles = spawnObstacles(5);
    }
    gameOver = false;
    isPaused = false;

    const sel = getEl("speedSelect");
    if (sel) sel.disabled = true;

    clearInterval(gameInterval);
    clearInterval(timerInterval);

    gameInterval = setInterval(loop, gameSpeed);
    timerInterval = setInterval(function() {
      gameTime++;
      updateUI();
    }, 1000);

    isRunning = true;
    clearSavedState();
    hideStartOverlay();
    updateBtns("running");
  }

  function stopGame(ended) {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = !ended;

    if (!ended) saveGameState();

    const overlay = getEl("startOverlay");
    if (overlay) overlay.classList.remove("hidden");

    const title = getEl("overlayTitle");
    const desc = overlay ? overlay.querySelector(".overlay-desc") : null;
    const btnOvl = getEl("btnStartOverlay");

    if (ended) {
      if (title) title.textContent = "Game Over!";
      if (desc) desc.textContent = "לחץ התחל למשחק חדש";
      if (btnOvl) btnOvl.innerHTML = '<span>↻</span> התחל מחדש';
      saveToLeaderboard();
      clearSavedState();
    } else {
      if (title) title.textContent = "המשחק הוקפא";
      if (desc) desc.textContent = "לחץ התחל להמשך";
      if (btnOvl) btnOvl.innerHTML = '<span>▶</span> המשך';
      drawPausedScreen();
    }

    updateBtns("stopped");
    const sel = getEl("speedSelect");
    if (sel) sel.disabled = false;
  }

  function resumeGame() {
    isPaused = false;
    hideStartOverlay();
    gameInterval = setInterval(loop, gameSpeed);
    timerInterval = setInterval(function() {
      gameTime++;
      updateUI();
    }, 1000);
    isRunning = true;
    updateBtns("running");
  }

  function resetGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;
    clearSavedState();
    initGame(false);
  }

  function hideStartOverlay() {
    const ov = getEl("startOverlay");
    if (ov) ov.classList.add("hidden");
  }

  function updateUI() {
    const sd = getEl("scoreDisplay");
    const td = getEl("timerDisplay");
    if (sd) sd.textContent = "ניקוד: " + score;
    if (td) td.textContent = "זמן: " + gameTime;
  }

  function updateBtns(state) {
    const btn = getEl("btnStart");
    if (!btn) return;
    if (state === "running") {
      btn.innerHTML = '<span>⏸</span> עצור';
    } else {
      btn.innerHTML = '<span>▶</span> התחל';
    }
  }

  function spawnFruit() {
    return {
      x: Math.floor(Math.random() * (SIZE / GRID)) * GRID,
      y: Math.floor(Math.random() * (SIZE / GRID)) * GRID,
      bonus: Math.random() < 0.2
    };
  }

  function spawnObstacles(n) {
    const obs = [];
    for (let i = 0; i < n; i++) {
      let o;
      do {
        o = {
          x: Math.floor(Math.random() * (SIZE / GRID)) * GRID,
          y: Math.floor(Math.random() * (SIZE / GRID)) * GRID
        };
      } while (
        (o.x === 200 && o.y === 200) ||
        (fruit && o.x === fruit.x && o.y === fruit.y) ||
        obs.some(function(x) { return x.x === o.x && x.y === o.y; })
      );
      obs.push(o);
    }
    return obs;
  }

  function drawPausedScreen() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.font = "bold 24px Heebo";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("המשחק הוקפא", SIZE / 2, SIZE / 2 - 10);
    ctx.font = "16px Heebo";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("לחץ התחל להמשך", SIZE / 2, SIZE / 2 + 20);
  }

  function loop() {
    if (gameOver) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.font = "bold 28px Heebo";
      ctx.fillStyle = "#ef4444";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", SIZE / 2, SIZE / 2 - 15);
      ctx.font = "18px Heebo";
      ctx.fillStyle = "#fff";
      ctx.fillText("ניקוד: " + score, SIZE / 2, SIZE / 2 + 20);
      stopGame(true);
      return;
    }

    if (isPaused) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const head = { x: snake[0].x, y: snake[0].y };
    if (direction === "LEFT") head.x -= GRID;
    else if (direction === "UP") head.y -= GRID;
    else if (direction === "RIGHT") head.x += GRID;
    else head.y += GRID;

    snake.unshift(head);

    if (head.x === fruit.x && head.y === fruit.y) {
      if (typeof SOUNDS !== "undefined") SOUNDS.eat();
      if (fruit.bonus) {
        score += 20;
        if (gameSpeed > 40) {
          gameSpeed -= 5;
          clearInterval(gameInterval);
          gameInterval = setInterval(loop, gameSpeed);
        }
      } else score += 10;
      updateUI();
      fruit = spawnFruit();
    } else {
      snake.pop();
    }

    snake.forEach(function(seg, i) {
      const a = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = "rgba(74, 222, 128, " + a + ")";
      ctx.shadowColor = "rgba(34, 197, 94, 0.5)";
      ctx.shadowBlur = i === 0 ? 8 : 0;
      ctx.fillRect(seg.x + 2, seg.y + 2, GRID - 4, GRID - 4);
    });
    ctx.shadowBlur = 0;

    ctx.fillStyle = fruit.bonus ? "#3b82f6" : "#ef4444";
    ctx.shadowColor = fruit.bonus ? "#60a5fa" : "#f87171";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(fruit.x + GRID / 2, fruit.y + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
    obstacles.forEach(function(o) {
      ctx.fillRect(o.x + 2, o.y + 2, GRID - 4, GRID - 4);
    });

    if (
      head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE ||
      snake.slice(1).some(function(s) { return s.x === head.x && s.y === head.y; }) ||
      obstacles.some(function(o) { return o.x === head.x && o.y === head.y; })
    ) {
      gameOver = true;
    }
  }

  function getLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem("snakeLeaderboard") || "[]");
    } catch (e) { return []; }
  }

  function saveToLeaderboard() {
    var data = getLeaderboard();
    var name = (typeof window.__loggedUserName === "string") ? window.__loggedUserName : "";
    data.push({ score: score, name: name });
    data.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
    data = data.slice(0, 5);
    localStorage.setItem("snakeLeaderboard", JSON.stringify(data));
    renderLeaderboard(data);
  }

  function renderLeaderboard(data) {
    const tbody = getEl("leaderboardBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    const list = (data && data.length) ? data : [{ score: 0, name: "-" }, { score: 0, name: "-" }];
    list.slice(0, 5).forEach(function(ent, i) {
      const row = document.createElement("tr");
      row.innerHTML = "<td>" + (i + 1) + "</td><td>" + (ent.name || "-") + "</td><td>" + (ent.score || 0) + "</td>";
      tbody.appendChild(row);
    });
  }

  function doStart() {
    if (isPaused) resumeGame();
    else if (!isRunning) {
      var saved = loadGameState();
      initGame(!!saved);
    }
  }

  function doStop() {
    if (isRunning && !isPaused) stopGame(false);
  }

  function doReset() {
    if (!isRunning) resetGame();
  }

  function changeDir(e) {
    const k = e.keyCode || e.key;
    if (k === 37 || k === "ArrowLeft") { if (direction !== "RIGHT") direction = "LEFT"; }
    else if (k === 38 || k === "ArrowUp") { if (direction !== "DOWN") direction = "UP"; }
    else if (k === 39 || k === "ArrowRight") { if (direction !== "LEFT") direction = "RIGHT"; }
    else if (k === 40 || k === "ArrowDown") { if (direction !== "UP") direction = "DOWN"; }
    else if (k === 87 || k === "w") { if (direction !== "DOWN") direction = "UP"; }
    else if (k === 83 || k === "s") { if (direction !== "UP") direction = "DOWN"; }
    else if (k === 65 || k === "a") { if (direction !== "RIGHT") direction = "LEFT"; }
    else if (k === 68 || k === "d") { if (direction !== "LEFT") direction = "RIGHT"; }
  }

  function boot() {
    window.addEventListener("beforeunload", function() {
      if (isRunning && !isPaused && !gameOver) saveGameState();
    });
    canvas = getEl("gameCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    const btnOverlay = getEl("btnStartOverlay");
    const btnStart = getEl("btnStart");
    const btnStop = getEl("btnStop");
    const btnReset = getEl("btnReset");

    if (btnOverlay) btnOverlay.addEventListener("click", doStart);
    if (btnStart) btnStart.addEventListener("click", function() {
      if (isPaused) resumeGame();
      else if (!isRunning) doStart();
      else doStop();
    });
    if (btnStop) btnStop.addEventListener("click", doStop);
    if (btnReset) btnReset.addEventListener("click", doReset);

    document.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        if (!isRunning) doStart();
        else if (isPaused) resumeGame();
      } else if (e.key === "r" || e.key === "R") {
        if (!isRunning) doReset();
      } else if (e.key === "p" || e.key === "P") {
        if (isRunning && !isPaused) doStop();
        else if (isPaused) resumeGame();
      }
      changeDir(e);
    });

    document.querySelectorAll(".touch-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const d = this.getAttribute("data-dir");
        if (d === "UP" && direction !== "DOWN") direction = "UP";
        else if (d === "DOWN" && direction !== "UP") direction = "DOWN";
        else if (d === "LEFT" && direction !== "RIGHT") direction = "LEFT";
        else if (d === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
      });
    });

    renderLeaderboard(getLeaderboard());

    var saved = loadGameState();
    var btnOvl = getEl("btnStartOverlay");
    var ov = getEl("startOverlay");
    var overlayTitle = getEl("overlayTitle");
    var overlayDesc = ov ? ov.querySelector(".overlay-desc") : null;
    if (saved && btnOvl) {
      btnOvl.innerHTML = '<span>▶</span> המשך משחק';
      if (overlayTitle) overlayTitle.textContent = "משחק שמור";
      if (overlayDesc) overlayDesc.textContent = "לחץ להמשך המשחק הקודם (ניקוד: " + (saved.score || 0) + ")";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
