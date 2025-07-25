
function startMarioGameWhenReady() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    setTimeout(startMarioGameWhenReady, 50);
    return;
  }
  const ctx = canvas.getContext('2d');
  let gameRunning = true;
  let score = 0;
  let lives = 3;
  let level = 1;
  let gameSpeed = 0;
  let baseGameSpeed = 2;
  let enemySpawnRate = 0.02;
  let powerUpSpawnRate = 0.005;
  let gameStarted = false;
  let cameraX = 0;
  let worldWidth = 10000;
  let checkpointReached = 0;
  let distance = 0;
  const keys = { left: false, right: false, up: false, down: false };
  const player = { x: 100, y: 400, width: 32, height: 32, velX: 0, velY: 0, speed: 6, jumpPower: 18, onGround: false, crouching: false, invulnerable: false, invulnerableTime: 0, dying: false, deathAnimation: 0, maxSpeed: 8, acceleration: 0.8, friction: 0.85, coyoteTime: 0, maxCoyoteTime: 8, jumpBuffer: 0, maxJumpBuffer: 10 };
  let enemies = [];
  let powerUps = [];
  let particles = [];
  let clouds = [];
  let platforms = [];
  let checkpoints = [];
  const enemyTypes = {
      goomba: { width: 24, height: 24, speed: 1, color: '#8B4513', points: 100 },
      koopa: { width: 28, height: 32, speed: 1.5, color: '#228B22', points: 200 },
      spiny: { width: 26, height: 26, speed: 0.8, color: '#FF4500', points: 150 },
      piranha: { width: 30, height: 30, speed: 0, color: '#FF1493', points: 300 }
  };

  function createPlatforms() {
      platforms = [];
      for (let i = 0; i < worldWidth; i += 200) {
          platforms.push({ x: i, y: 500, width: 200, height: 100, type: 'ground' });
          if (i > 400 && Math.random() < 0.7) {
              platforms.push({ x: i + 50 + Math.random() * 100, y: 350 + Math.random() * 80, width: 80 + Math.random() * 40, height: 20, type: 'platform' });
          }
          if (i > 800 && Math.random() < 0.4) {
              platforms.push({ x: i + 30 + Math.random() * 120, y: 200 + Math.random() * 60, width: 60 + Math.random() * 30, height: 20, type: 'platform' });
          }
          if (i > 600 && Math.random() < 0.3) {
              platforms.push({ x: i + 20 + Math.random() * 140, y: 150 + Math.random() * 40, width: 40 + Math.random() * 20, height: 15, type: 'floating' });
          }
      }
  }
  function createCheckpoints() {
      checkpoints = [];
      for (let i = 1000; i < worldWidth; i += 800) {
          checkpoints.push({ x: i, y: 400, width: 10, height: 100, activated: false, number: Math.floor(i / 800) });
      }
  }
  function createClouds() {
      clouds = [];
      for (let i = 0; i < worldWidth / 200; i++) {
          clouds.push({ x: i * 200 + Math.random() * 150, y: 50 + Math.random() * 100, speed: 0.5 + Math.random() * 0.5, size: 30 + Math.random() * 20 });
      }
  }
  function createEnemy() {
      if (enemies.length > 10) return;
      const types = Object.keys(enemyTypes);
      const type = types[Math.floor(Math.random() * types.length)];
      const enemyData = enemyTypes[type];
      let spawnX = cameraX + canvas.width + Math.random() * 200;
      let spawnY = 500 - enemyData.height;
      for (let platform of platforms) {
          if (platform.x > spawnX - 100 && platform.x < spawnX + 100 && platform.type !== 'ground') {
              spawnX = platform.x + Math.random() * platform.width;
              spawnY = platform.y - enemyData.height;
              break;
          }
      }
      enemies.push({ x: spawnX, y: spawnY, width: enemyData.width, height: enemyData.height, speed: enemyData.speed + (level - 1) * 0.2, type: type, color: enemyData.color, points: enemyData.points, bounceY: type === 'piranha' ? Math.random() * 2 - 1 : 0, direction: Math.random() < 0.5 ? -1 : 1 });
  }
  function createPowerUp() {
      if (powerUps.length > 5) return;
      const types = ['mushroom', 'star', 'flower'];
      const type = types[Math.floor(Math.random() * types.length)];
      let spawnX = cameraX + canvas.width + Math.random() * 200;
      let spawnY = 450;
      for (let platform of platforms) {
          if (platform.x > spawnX - 100 && platform.x < spawnX + 100) {
              spawnX = platform.x + Math.random() * platform.width;
              spawnY = platform.y - 24;
              break;
          }
      }
      powerUps.push({ x: spawnX, y: spawnY, width: 24, height: 24, speed: 0, type: type, bounceY: 0, bounceDir: 1 });
  }
  function createParticle(x, y, color) {
      for (let i = 0; i < 5; i++) {
          particles.push({ x: x, y: y, velX: (Math.random() - 0.5) * 6, velY: (Math.random() - 0.5) * 6, color: color, life: 30, maxLife: 30 });
      }
  }
  document.addEventListener('keydown', (e) => {
      if (!gameStarted) { gameStarted = true; gameSpeed = baseGameSpeed; }
      switch(e.key.toLowerCase()) {
          case 'a': case 'arrowleft': keys.left = true; e.preventDefault(); break;
          case 'd': case 'arrowright': keys.right = true; e.preventDefault(); break;
          case 'w': case 'arrowup': case ' ': keys.up = true; player.jumpBuffer = player.maxJumpBuffer; e.preventDefault(); break;
          case 's': case 'arrowdown': keys.down = true; e.preventDefault(); break;
      }
  });
  document.addEventListener('keyup', (e) => {
      switch(e.key.toLowerCase()) {
          case 'a': case 'arrowleft': keys.left = false; e.preventDefault(); break;
          case 'd': case 'arrowright': keys.right = false; e.preventDefault(); break;
          case 'w': case 'arrowup': case ' ': keys.up = false; e.preventDefault(); break;
          case 's': case 'arrowdown': keys.down = false; e.preventDefault(); break;
      }
  });
  function checkPlatformCollisions() {
      player.onGround = false;
      for (let platform of platforms) {
          if (platform.x + platform.width < cameraX - 100 || platform.x > cameraX + canvas.width + 100) continue;
          if (player.velY >= 0 && player.y + player.height <= platform.y + 10 && player.y + player.height >= platform.y - 10 && player.x + player.width > platform.x && player.x < platform.x + platform.width) {
              player.y = platform.y - player.height; player.velY = 0; player.onGround = true;
          }
          if (player.velY < 0 && player.y >= platform.y + platform.height - 10 && player.y <= platform.y + platform.height + 10 && player.x + player.width > platform.x && player.x < platform.x + platform.width) {
              player.y = platform.y + platform.height; player.velY = 0;
          }
          if (player.velX > 0 && player.x + player.width >= platform.x && player.x + player.width <= platform.x + 10 && player.y + player.height > platform.y && player.y < platform.y + platform.height) {
              player.x = platform.x - player.width; player.velX = 0;
          }
          if (player.velX < 0 && player.x <= platform.x + platform.width && player.x >= platform.x + platform.width - 10 && player.y + player.height > platform.y && player.y < platform.y + platform.height) {
              player.x = platform.x + platform.width; player.velX = 0;
          }
      }
  }
  function updateCamera() {
      let targetX = player.x - canvas.width / 3;
      if (targetX > cameraX) cameraX = targetX;
      cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  }
  function updatePlayer() {
      if (player.dying) {
          player.deathAnimation++;
          player.velY += 0.8;
          player.y += player.velY;
          if (player.deathAnimation > 120) {
              lives--;
              if (lives <= 0) { gameOver(); } else { respawnPlayer(); }
          }
          return;
      }
      if (player.onGround) { player.coyoteTime = player.maxCoyoteTime; } else { player.coyoteTime--; }
      if (player.jumpBuffer > 0) { player.jumpBuffer--; }
      if (keys.left && player.x > cameraX + 50) { player.velX -= player.acceleration; player.velX = Math.max(player.velX, -player.maxSpeed); }
      else if (keys.right) { player.velX += player.acceleration; player.velX = Math.min(player.velX, player.maxSpeed); }
      else { player.velX *= player.friction; if (Math.abs(player.velX) < 0.1) player.velX = 0; }
      player.crouching = keys.down && player.onGround;
      if (player.crouching) player.velX *= 0.5;
      if (player.jumpBuffer > 0 && player.coyoteTime > 0) { player.velY = -player.jumpPower; player.onGround = false; player.jumpBuffer = 0; player.coyoteTime = 0; }
      if (!keys.up && player.velY < -5) player.velY *= 0.5;
      player.velY += 0.8;
      player.x += player.velX;
      player.y += player.velY;
      checkPlatformCollisions();
      updateCamera();
      distance = Math.max(distance, player.x);
      if (player.y > canvas.height + 100) { player.dying = true; player.deathAnimation = 0; player.velY = -10; }
      if (player.invulnerable) { player.invulnerableTime--; if (player.invulnerableTime <= 0) player.invulnerable = false; }
  }
  function respawnPlayer() {
      let respawnX = 100;
      for (let checkpoint of checkpoints) { if (checkpoint.activated) respawnX = checkpoint.x - 50; }
      player.x = respawnX; player.y = 300; player.velX = 0; player.velY = 0; player.dying = false; player.deathAnimation = 0; player.invulnerable = true; player.invulnerableTime = 120; player.coyoteTime = 0; player.jumpBuffer = 0; cameraX = Math.max(0, player.x - canvas.width / 3);
  }
  function updateEnemies() {
      for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (enemy.x < cameraX - 200 || enemy.x > cameraX + canvas.width + 200) { enemies.splice(i, 1); continue; }
          enemy.x += enemy.speed * enemy.direction;
          if (enemy.type === 'piranha') {
              enemy.y += enemy.bounceY;
              if (enemy.y < 300 || enemy.y > 450) enemy.bounceY *= -1;
          } else {
              enemy.y += 2;
              for (let platform of platforms) {
                  if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width && enemy.y + enemy.height > platform.y && enemy.y < platform.y + platform.height) {
                      enemy.y = platform.y - enemy.height; break;
                  }
              }
              let onPlatform = false;
              for (let platform of platforms) {
                  if (enemy.x + enemy.width/2 > platform.x && enemy.x + enemy.width/2 < platform.x + platform.width && enemy.y + enemy.height >= platform.y - 5 && enemy.y + enemy.height <= platform.y + 5) { onPlatform = true; break; }
              }
              if (!onPlatform) enemy.direction *= -1;
          }
      }
  }
  function updatePowerUps() {
      for (let i = powerUps.length - 1; i >= 0; i--) {
          const powerUp = powerUps[i];
          if (powerUp.x < cameraX - 200 || powerUp.x > cameraX + canvas.width + 200) { powerUps.splice(i, 1); continue; }
          powerUp.bounceY += powerUp.bounceDir * 0.1;
          if (powerUp.bounceY > 2 || powerUp.bounceY < -2) powerUp.bounceDir *= -1;
          powerUp.y += powerUp.bounceY;
      }
  }
  function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i];
          particle.x += particle.velX;
          particle.y += particle.velY;
          particle.life--;
          if (particle.life <= 0) particles.splice(i, 1);
      }
  }
  function updateClouds() {}
  function updateCheckpoints() {
      for (let checkpoint of checkpoints) {
          if (!checkpoint.activated && player.x + player.width > checkpoint.x && player.x < checkpoint.x + checkpoint.width) {
              checkpoint.activated = true; checkpointReached = checkpoint.number; score += 2000; createParticle(checkpoint.x + checkpoint.width/2, checkpoint.y + checkpoint.height/2, '#00FF00');
          }
      }
  }
  function checkCollisions() {
      if (player.dying) return;
      const playerRect = { x: player.x, y: player.crouching ? player.y + 8 : player.y, width: player.width, height: player.crouching ? player.height - 8 : player.height };
      for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (playerRect.x < enemy.x + enemy.width && playerRect.x + playerRect.width > enemy.x && playerRect.y < enemy.y + enemy.height && playerRect.y + playerRect.height > enemy.y) {
              if (player.velY > 0 && playerRect.y < enemy.y) {
                  score += enemy.points; createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color); enemies.splice(i, 1); player.velY = -8;
              } else if (!player.invulnerable) {
                  player.dying = true; player.deathAnimation = 0; player.velY = -10; createParticle(player.x + player.width/2, player.y + player.height/2, '#FF0000');
              }
          }
      }
      for (let i = powerUps.length - 1; i >= 0; i--) {
          const powerUp = powerUps[i];
          if (playerRect.x < powerUp.x + powerUp.width && playerRect.x + playerRect.width > powerUp.x && playerRect.y < powerUp.y + powerUp.height && playerRect.y + playerRect.height > powerUp.y) {
              switch(powerUp.type) {
                  case 'mushroom': score += 1000; break;
                  case 'star': score += 500; player.invulnerable = true; player.invulnerableTime = 300; break;
                  case 'flower': score += 800; break;
              }
              createParticle(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, '#FFD700');
              powerUps.splice(i, 1);
          }
      }
  }
  function drawPlatforms() {
      for (let platform of platforms) {
          if (platform.x + platform.width < cameraX || platform.x > cameraX + canvas.width) continue;
          let drawX = platform.x - cameraX;
          if (platform.type === 'ground') {
              ctx.fillStyle = '#8B4513'; ctx.fillRect(drawX, platform.y, platform.width, platform.height);
              ctx.fillStyle = '#654321'; for (let i = 0; i < platform.width; i += 20) { ctx.fillRect(drawX + i, platform.y, 2, platform.height); }
          } else {
              ctx.fillStyle = platform.type === 'floating' ? '#FFD700' : '#8B4513'; ctx.fillRect(drawX, platform.y, platform.width, platform.height);
              ctx.fillStyle = '#32CD32'; ctx.fillRect(drawX, platform.y, platform.width, 4);
              ctx.fillStyle = '#654321'; ctx.fillRect(drawX, platform.y + platform.height - 4, platform.width, 4);
          }
      }
  }
  function drawCheckpoints() {
      for (let checkpoint of checkpoints) {
          if (checkpoint.x + checkpoint.width < cameraX || checkpoint.x > cameraX + canvas.width) continue;
          let drawX = checkpoint.x - cameraX;
          ctx.fillStyle = checkpoint.activated ? '#00FF00' : '#FF0000'; ctx.fillRect(drawX, checkpoint.y, checkpoint.width, checkpoint.height);
          ctx.fillStyle = checkpoint.activated ? '#00FF00' : '#FF0000'; ctx.fillRect(drawX + checkpoint.width, checkpoint.y, 30, 20);
          ctx.fillStyle = '#FFFFFF'; ctx.font = '12px Arial'; ctx.fillText(checkpoint.number, drawX + checkpoint.width + 5, checkpoint.y + 15);
      }
  }
  function drawPlayer() {
      ctx.save();
      let drawX = player.x - cameraX;
      let drawY = player.y;
      if (player.invulnerable && Math.floor(player.invulnerableTime / 5) % 2) ctx.globalAlpha = 0.5;
      if (player.dying) {
          ctx.translate(drawX + player.width/2, drawY + player.height/2);
          ctx.rotate(player.deathAnimation * 0.1);
          ctx.translate(-player.width/2, -player.height/2);
      } else {
          ctx.translate(drawX, drawY);
      }
      ctx.fillStyle = '#FF0000'; ctx.fillRect(0, player.crouching ? 8 : 0, player.width, player.crouching ? player.height - 8 : player.height);
      ctx.fillStyle = '#FFFF00'; ctx.fillRect(4, player.crouching ? 12 : 4, 8, 8);
      ctx.fillStyle = '#0000FF'; ctx.fillRect(8, player.crouching ? 20 : 12, 16, player.crouching ? 12 : 20);
      ctx.restore();
  }
  function drawEnemies() {
      for (let enemy of enemies) {
          if (enemy.x + enemy.width < cameraX || enemy.x > cameraX + canvas.width) continue;
          let drawX = enemy.x - cameraX;
          ctx.fillStyle = enemy.color; ctx.fillRect(drawX, enemy.y, enemy.width, enemy.height);
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(drawX + 4, enemy.y + 4, 4, 4); ctx.fillRect(drawX + enemy.width - 8, enemy.y + 4, 4, 4);
          ctx.fillStyle = '#000000'; ctx.fillRect(drawX + 5, enemy.y + 5, 2, 2); ctx.fillRect(drawX + enemy.width - 7, enemy.y + 5, 2, 2);
          if (enemy.type === 'koopa') { ctx.fillStyle = '#FFFF00'; ctx.fillRect(drawX + 2, enemy.y + enemy.height - 8, enemy.width - 4, 6); }
          else if (enemy.type === 'spiny') { ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 3; i++) { ctx.fillRect(drawX + 4 + i * 6, enemy.y - 2, 4, 4); } }
      }
  }
  function drawPowerUps() {
      for (let powerUp of powerUps) {
          if (powerUp.x + powerUp.width < cameraX || powerUp.x > cameraX + canvas.width) continue;
          let drawX = powerUp.x - cameraX;
          switch(powerUp.type) {
              case 'mushroom': ctx.fillStyle = '#FF0000'; ctx.fillRect(drawX, powerUp.y, powerUp.width, powerUp.height); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(drawX + 4, powerUp.y + 4, 4, 4); ctx.fillRect(drawX + 12, powerUp.y + 4, 4, 4); break;
              case 'star': ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(drawX + 12, powerUp.y); for (let i = 0; i < 5; i++) { ctx.lineTo(drawX + 12 + Math.cos(i * 2 * Math.PI / 5) * 10, powerUp.y + 12 + Math.sin(i * 2 * Math.PI / 5) * 10); } ctx.fill(); break;
              case 'flower': ctx.fillStyle = '#FF6347'; ctx.fillRect(drawX, powerUp.y, powerUp.width, powerUp.height); ctx.fillStyle = '#FFFF00'; ctx.fillRect(drawX + 8, powerUp.y + 8, 8, 8); break;
          }
      }
  }
  function drawParticles() {
      for (let particle of particles) {
          ctx.globalAlpha = particle.life / particle.maxLife;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x - cameraX, particle.y, 3, 3);
          ctx.globalAlpha = 1;
      }
  }
  function drawClouds() {
      ctx.fillStyle = '#FFFFFF';
      for (let cloud of clouds) {
          if (cloud.x + cloud.size < cameraX || cloud.x > cameraX + canvas.width) continue;
          let drawX = cloud.x - cameraX;
          ctx.beginPath();
          ctx.arc(drawX, cloud.y, cloud.size/2, 0, Math.PI * 2);
          ctx.arc(drawX + cloud.size/2, cloud.y, cloud.size/3, 0, Math.PI * 2);
          ctx.arc(drawX - cloud.size/2, cloud.y, cloud.size/3, 0, Math.PI * 2);
          ctx.fill();
      }
  }
  function gameOver() {
      gameRunning = false;
      document.getElementById('finalScore').textContent = score;
      document.getElementById('gameOver').style.display = 'block';
  }
  window.restartGame = function() {
      gameRunning = true;
      score = 0;
      lives = 3;
      level = 1;
      gameSpeed = 0;
      baseGameSpeed = 2;
      gameStarted = false;
      cameraX = 0;
      checkpointReached = 0;
      distance = 0;
      enemies = [];
      powerUps = [];
      particles = [];
      player.x = 100;
      player.y = 300;
      player.velX = 0;
      player.velY = 0;
      player.dying = false;
      player.deathAnimation = 0;
      player.invulnerable = false;
      player.invulnerableTime = 0;
      player.coyoteTime = 0;
      player.jumpBuffer = 0;
      createPlatforms();
      createCheckpoints();
      createClouds();
      document.getElementById('gameOver').style.display = 'none';
      updateUI();
  }
  function updateUI() {
      document.getElementById('score').textContent = score;
      document.getElementById('lives').textContent = lives;
      document.getElementById('level').textContent = level;
      let distanceText = `Distancia: ${Math.floor(distance/100)}m`;
      if (checkpointReached > 0) distanceText += ` | Checkpoint: ${checkpointReached}`;
      document.getElementById('distance').textContent = distanceText;
  }
  function increaseDifficulty() {
      if (score > level * 5000) {
          level++;
          baseGameSpeed += 0.5;
          if (gameStarted) gameSpeed = baseGameSpeed;
          enemySpawnRate += 0.005;
          powerUpSpawnRate += 0.001;
      }
  }
  function gameLoop() {
      if (!gameRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updatePlayer();
      updateEnemies();
      updatePowerUps();
      updateParticles();
      updateClouds();
      updateCheckpoints();
      checkCollisions();
      increaseDifficulty();
      if (gameStarted && Math.random() < enemySpawnRate) createEnemy();
      if (gameStarted && Math.random() < powerUpSpawnRate) createPowerUp();
      drawClouds();
      drawPlatforms();
      drawCheckpoints();
      drawPlayer();
      drawEnemies();
      drawPowerUps();
      drawParticles();
      updateUI();
      requestAnimationFrame(gameLoop);
  }
  function init() {
      createPlatforms();
      createCheckpoints();
      createClouds();
      updateUI();
      gameLoop();
  }
  init();
}
startMarioGameWhenReady();
function createPlatforms() {
    platforms = [];
    for (let i = 0; i < worldWidth; i += 200) {
        platforms.push({ x: i, y: 500, width: 200, height: 100, type: 'ground' });
        if (i > 400 && Math.random() < 0.7) {
            platforms.push({ x: i + 50 + Math.random() * 100, y: 350 + Math.random() * 80, width: 80 + Math.random() * 40, height: 20, type: 'platform' });
        }
        if (i > 800 && Math.random() < 0.4) {
            platforms.push({ x: i + 30 + Math.random() * 120, y: 200 + Math.random() * 60, width: 60 + Math.random() * 30, height: 20, type: 'platform' });
        }
        if (i > 600 && Math.random() < 0.3) {
            platforms.push({ x: i + 20 + Math.random() * 140, y: 150 + Math.random() * 40, width: 40 + Math.random() * 20, height: 15, type: 'floating' });
        }
    }
}
function createCheckpoints() {
    checkpoints = [];
    for (let i = 1000; i < worldWidth; i += 800) {
        checkpoints.push({ x: i, y: 400, width: 10, height: 100, activated: false, number: Math.floor(i / 800) });
    }
}
function createClouds() {
    clouds = [];
    for (let i = 0; i < worldWidth / 200; i++) {
        clouds.push({ x: i * 200 + Math.random() * 150, y: 50 + Math.random() * 100, speed: 0.5 + Math.random() * 0.5, size: 30 + Math.random() * 20 });
    }
}
function createEnemy() {
    if (enemies.length > 10) return;
    const types = Object.keys(enemyTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const enemyData = enemyTypes[type];
    let spawnX = cameraX + canvas.width + Math.random() * 200;
    let spawnY = 500 - enemyData.height;
    for (let platform of platforms) {
        if (platform.x > spawnX - 100 && platform.x < spawnX + 100 && platform.type !== 'ground') {
            spawnX = platform.x + Math.random() * platform.width;
            spawnY = platform.y - enemyData.height;
            break;
        }
    }
    enemies.push({ x: spawnX, y: spawnY, width: enemyData.width, height: enemyData.height, speed: enemyData.speed + (level - 1) * 0.2, type: type, color: enemyData.color, points: enemyData.points, bounceY: type === 'piranha' ? Math.random() * 2 - 1 : 0, direction: Math.random() < 0.5 ? -1 : 1 });
}
function createPowerUp() {
    if (powerUps.length > 5) return;
    const types = ['mushroom', 'star', 'flower'];
    const type = types[Math.floor(Math.random() * types.length)];
    let spawnX = cameraX + canvas.width + Math.random() * 200;
    let spawnY = 450;
    for (let platform of platforms) {
        if (platform.x > spawnX - 100 && platform.x < spawnX + 100) {
            spawnX = platform.x + Math.random() * platform.width;
            spawnY = platform.y - 24;
            break;
        }
    }
    powerUps.push({ x: spawnX, y: spawnY, width: 24, height: 24, speed: 0, type: type, bounceY: 0, bounceDir: 1 });
}
function createParticle(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({ x: x, y: y, velX: (Math.random() - 0.5) * 6, velY: (Math.random() - 0.5) * 6, color: color, life: 30, maxLife: 30 });
    }
}
document.addEventListener('keydown', (e) => {
    if (!gameStarted) { gameStarted = true; gameSpeed = baseGameSpeed; }
    switch(e.key.toLowerCase()) {
        case 'a': case 'arrowleft': keys.left = true; e.preventDefault(); break;
        case 'd': case 'arrowright': keys.right = true; e.preventDefault(); break;
        case 'w': case 'arrowup': case ' ': keys.up = true; player.jumpBuffer = player.maxJumpBuffer; e.preventDefault(); break;
        case 's': case 'arrowdown': keys.down = true; e.preventDefault(); break;
    }
});
document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'a': case 'arrowleft': keys.left = false; e.preventDefault(); break;
        case 'd': case 'arrowright': keys.right = false; e.preventDefault(); break;
        case 'w': case 'arrowup': case ' ': keys.up = false; e.preventDefault(); break;
        case 's': case 'arrowdown': keys.down = false; e.preventDefault(); break;
    }
});
function checkPlatformCollisions() {
    player.onGround = false;
    for (let platform of platforms) {
        if (platform.x + platform.width < cameraX - 100 || platform.x > cameraX + canvas.width + 100) continue;
        if (player.velY >= 0 && player.y + player.height <= platform.y + 10 && player.y + player.height >= platform.y - 10 && player.x + player.width > platform.x && player.x < platform.x + platform.width) {
            player.y = platform.y - player.height; player.velY = 0; player.onGround = true;
        }
        if (player.velY < 0 && player.y >= platform.y + platform.height - 10 && player.y <= platform.y + platform.height + 10 && player.x + player.width > platform.x && player.x < platform.x + platform.width) {
            player.y = platform.y + platform.height; player.velY = 0;
        }
        if (player.velX > 0 && player.x + player.width >= platform.x && player.x + player.width <= platform.x + 10 && player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            player.x = platform.x - player.width; player.velX = 0;
        }
        if (player.velX < 0 && player.x <= platform.x + platform.width && player.x >= platform.x + platform.width - 10 && player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            player.x = platform.x + platform.width; player.velX = 0;
        }
    }
}
function updateCamera() {
    let targetX = player.x - canvas.width / 3;
    if (targetX > cameraX) cameraX = targetX;
    cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
}
function updatePlayer() {
    if (player.dying) {
        player.deathAnimation++;
        player.velY += 0.8;
        player.y += player.velY;
        if (player.deathAnimation > 120) {
            lives--;
            if (lives <= 0) { gameOver(); } else { respawnPlayer(); }
        }
        return;
    }
    if (player.onGround) { player.coyoteTime = player.maxCoyoteTime; } else { player.coyoteTime--; }
    if (player.jumpBuffer > 0) { player.jumpBuffer--; }
    if (keys.left && player.x > cameraX + 50) { player.velX -= player.acceleration; player.velX = Math.max(player.velX, -player.maxSpeed); }
    else if (keys.right) { player.velX += player.acceleration; player.velX = Math.min(player.velX, player.maxSpeed); }
    else { player.velX *= player.friction; if (Math.abs(player.velX) < 0.1) player.velX = 0; }
    player.crouching = keys.down && player.onGround;
    if (player.crouching) player.velX *= 0.5;
    if (player.jumpBuffer > 0 && player.coyoteTime > 0) { player.velY = -player.jumpPower; player.onGround = false; player.jumpBuffer = 0; player.coyoteTime = 0; }
    if (!keys.up && player.velY < -5) player.velY *= 0.5;
    player.velY += 0.8;
    player.x += player.velX;
    player.y += player.velY;
    checkPlatformCollisions();
    updateCamera();
    distance = Math.max(distance, player.x);
    if (player.y > canvas.height + 100) { player.dying = true; player.deathAnimation = 0; player.velY = -10; }
    if (player.invulnerable) { player.invulnerableTime--; if (player.invulnerableTime <= 0) player.invulnerable = false; }
}
function respawnPlayer() {
    let respawnX = 100;
    for (let checkpoint of checkpoints) { if (checkpoint.activated) respawnX = checkpoint.x - 50; }
    player.x = respawnX; player.y = 300; player.velX = 0; player.velY = 0; player.dying = false; player.deathAnimation = 0; player.invulnerable = true; player.invulnerableTime = 120; player.coyoteTime = 0; player.jumpBuffer = 0; cameraX = Math.max(0, player.x - canvas.width / 3);
}
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.x < cameraX - 200 || enemy.x > cameraX + canvas.width + 200) { enemies.splice(i, 1); continue; }
        enemy.x += enemy.speed * enemy.direction;
        if (enemy.type === 'piranha') {
            enemy.y += enemy.bounceY;
            if (enemy.y < 300 || enemy.y > 450) enemy.bounceY *= -1;
        } else {
            enemy.y += 2;
            for (let platform of platforms) {
                if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width && enemy.y + enemy.height > platform.y && enemy.y < platform.y + platform.height) {
                    enemy.y = platform.y - enemy.height; break;
                }
            }
            let onPlatform = false;
            for (let platform of platforms) {
                if (enemy.x + enemy.width/2 > platform.x && enemy.x + enemy.width/2 < platform.x + platform.width && enemy.y + enemy.height >= platform.y - 5 && enemy.y + enemy.height <= platform.y + 5) { onPlatform = true; break; }
            }
            if (!onPlatform) enemy.direction *= -1;
        }
    }
}
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (powerUp.x < cameraX - 200 || powerUp.x > cameraX + canvas.width + 200) { powerUps.splice(i, 1); continue; }
        powerUp.bounceY += powerUp.bounceDir * 0.1;
        if (powerUp.bounceY > 2 || powerUp.bounceY < -2) powerUp.bounceDir *= -1;
        powerUp.y += powerUp.bounceY;
    }
}
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.velX;
        particle.y += particle.velY;
        particle.life--;
        if (particle.life <= 0) particles.splice(i, 1);
    }
}
function updateClouds() {}
function updateCheckpoints() {
    for (let checkpoint of checkpoints) {
        if (!checkpoint.activated && player.x + player.width > checkpoint.x && player.x < checkpoint.x + checkpoint.width) {
            checkpoint.activated = true; checkpointReached = checkpoint.number; score += 2000; createParticle(checkpoint.x + checkpoint.width/2, checkpoint.y + checkpoint.height/2, '#00FF00');
        }
    }
}
function checkCollisions() {
    if (player.dying) return;
    const playerRect = { x: player.x, y: player.crouching ? player.y + 8 : player.y, width: player.width, height: player.crouching ? player.height - 8 : player.height };
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (playerRect.x < enemy.x + enemy.width && playerRect.x + playerRect.width > enemy.x && playerRect.y < enemy.y + enemy.height && playerRect.y + playerRect.height > enemy.y) {
            if (player.velY > 0 && playerRect.y < enemy.y) {
                score += enemy.points; createParticle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.color); enemies.splice(i, 1); player.velY = -8;
            } else if (!player.invulnerable) {
                player.dying = true; player.deathAnimation = 0; player.velY = -10; createParticle(player.x + player.width/2, player.y + player.height/2, '#FF0000');
            }
        }
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (playerRect.x < powerUp.x + powerUp.width && playerRect.x + playerRect.width > powerUp.x && playerRect.y < powerUp.y + powerUp.height && playerRect.y + playerRect.height > powerUp.y) {
            switch(powerUp.type) {
                case 'mushroom': score += 1000; break;
                case 'star': score += 500; player.invulnerable = true; player.invulnerableTime = 300; break;
                case 'flower': score += 800; break;
            }
            createParticle(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, '#FFD700');
            powerUps.splice(i, 1);
        }
    }
}
function drawPlatforms() {
    for (let platform of platforms) {
        if (platform.x + platform.width < cameraX || platform.x > cameraX + canvas.width) continue;
        let drawX = platform.x - cameraX;
        if (platform.type === 'ground') {
            ctx.fillStyle = '#8B4513'; ctx.fillRect(drawX, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#654321'; for (let i = 0; i < platform.width; i += 20) { ctx.fillRect(drawX + i, platform.y, 2, platform.height); }
        } else {
            ctx.fillStyle = platform.type === 'floating' ? '#FFD700' : '#8B4513'; ctx.fillRect(drawX, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#32CD32'; ctx.fillRect(drawX, platform.y, platform.width, 4);
            ctx.fillStyle = '#654321'; ctx.fillRect(drawX, platform.y + platform.height - 4, platform.width, 4);
        }
    }
}
function drawCheckpoints() {
    for (let checkpoint of checkpoints) {
        if (checkpoint.x + checkpoint.width < cameraX || checkpoint.x > cameraX + canvas.width) continue;
        let drawX = checkpoint.x - cameraX;
        ctx.fillStyle = checkpoint.activated ? '#00FF00' : '#FF0000'; ctx.fillRect(drawX, checkpoint.y, checkpoint.width, checkpoint.height);
        ctx.fillStyle = checkpoint.activated ? '#00FF00' : '#FF0000'; ctx.fillRect(drawX + checkpoint.width, checkpoint.y, 30, 20);
        ctx.fillStyle = '#FFFFFF'; ctx.font = '12px Arial'; ctx.fillText(checkpoint.number, drawX + checkpoint.width + 5, checkpoint.y + 15);
    }
}
function drawPlayer() {
    ctx.save();
    let drawX = player.x - cameraX;
    let drawY = player.y;
    if (player.invulnerable && Math.floor(player.invulnerableTime / 5) % 2) ctx.globalAlpha = 0.5;
    if (player.dying) {
        ctx.translate(drawX + player.width/2, drawY + player.height/2);
        ctx.rotate(player.deathAnimation * 0.1);
        ctx.translate(-player.width/2, -player.height/2);
    } else {
        ctx.translate(drawX, drawY);
    }
    ctx.fillStyle = '#FF0000'; ctx.fillRect(0, player.crouching ? 8 : 0, player.width, player.crouching ? player.height - 8 : player.height);
    ctx.fillStyle = '#FFFF00'; ctx.fillRect(4, player.crouching ? 12 : 4, 8, 8);
    ctx.fillStyle = '#0000FF'; ctx.fillRect(8, player.crouching ? 20 : 12, 16, player.crouching ? 12 : 20);
    ctx.restore();
}
function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.x + enemy.width < cameraX || enemy.x > cameraX + canvas.width) continue;
        let drawX = enemy.x - cameraX;
        ctx.fillStyle = enemy.color; ctx.fillRect(drawX, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(drawX + 4, enemy.y + 4, 4, 4); ctx.fillRect(drawX + enemy.width - 8, enemy.y + 4, 4, 4);
        ctx.fillStyle = '#000000'; ctx.fillRect(drawX + 5, enemy.y + 5, 2, 2); ctx.fillRect(drawX + enemy.width - 7, enemy.y + 5, 2, 2);
        if (enemy.type === 'koopa') { ctx.fillStyle = '#FFFF00'; ctx.fillRect(drawX + 2, enemy.y + enemy.height - 8, enemy.width - 4, 6); }
        else if (enemy.type === 'spiny') { ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 3; i++) { ctx.fillRect(drawX + 4 + i * 6, enemy.y - 2, 4, 4); } }
    }
}
function drawPowerUps() {
    for (let powerUp of powerUps) {
        if (powerUp.x + powerUp.width < cameraX || powerUp.x > cameraX + canvas.width) continue;
        let drawX = powerUp.x - cameraX;
        switch(powerUp.type) {
            case 'mushroom': ctx.fillStyle = '#FF0000'; ctx.fillRect(drawX, powerUp.y, powerUp.width, powerUp.height); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(drawX + 4, powerUp.y + 4, 4, 4); ctx.fillRect(drawX + 12, powerUp.y + 4, 4, 4); break;
            case 'star': ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(drawX + 12, powerUp.y); for (let i = 0; i < 5; i++) { ctx.lineTo(drawX + 12 + Math.cos(i * 2 * Math.PI / 5) * 10, powerUp.y + 12 + Math.sin(i * 2 * Math.PI / 5) * 10); } ctx.fill(); break;
            case 'flower': ctx.fillStyle = '#FF6347'; ctx.fillRect(drawX, powerUp.y, powerUp.width, powerUp.height); ctx.fillStyle = '#FFFF00'; ctx.fillRect(drawX + 8, powerUp.y + 8, 8, 8); break;
        }
    }
}
function drawParticles() {
    for (let particle of particles) {
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - cameraX, particle.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}
function drawClouds() {
    ctx.fillStyle = '#FFFFFF';
    for (let cloud of clouds) {
        if (cloud.x + cloud.size < cameraX || cloud.x > cameraX + canvas.width) continue;
        let drawX = cloud.x - cameraX;
        ctx.beginPath();
        ctx.arc(drawX, cloud.y, cloud.size/2, 0, Math.PI * 2);
        ctx.arc(drawX + cloud.size/2, cloud.y, cloud.size/3, 0, Math.PI * 2);
        ctx.arc(drawX - cloud.size/2, cloud.y, cloud.size/3, 0, Math.PI * 2);
        ctx.fill();
    }
}
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}
window.restartGame = function() {
    gameRunning = true;
    score = 0;
    lives = 3;
    level = 1;
    gameSpeed = 0;
    baseGameSpeed = 2;
    gameStarted = false;
    cameraX = 0;
    checkpointReached = 0;
    distance = 0;
    enemies = [];
    powerUps = [];
    particles = [];
    player.x = 100;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    player.dying = false;
    player.deathAnimation = 0;
    player.invulnerable = false;
    player.invulnerableTime = 0;
    player.coyoteTime = 0;
    player.jumpBuffer = 0;
    createPlatforms();
    createCheckpoints();
    createClouds();
    document.getElementById('gameOver').style.display = 'none';
    updateUI();
}
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    let distanceText = `Distancia: ${Math.floor(distance/100)}m`;
    if (checkpointReached > 0) distanceText += ` | Checkpoint: ${checkpointReached}`;
    document.getElementById('distance').textContent = distanceText;
}
function increaseDifficulty() {
    if (score > level * 5000) {
        level++;
        baseGameSpeed += 0.5;
        if (gameStarted) gameSpeed = baseGameSpeed;
        enemySpawnRate += 0.005;
        powerUpSpawnRate += 0.001;
    }
}
function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();
    updateEnemies();
    updatePowerUps();
    updateParticles();
    updateClouds();
    updateCheckpoints();
    checkCollisions();
    increaseDifficulty();
    if (gameStarted && Math.random() < enemySpawnRate) createEnemy();
    if (gameStarted && Math.random() < powerUpSpawnRate) createPowerUp();
    drawClouds();
    drawPlatforms();
    drawCheckpoints();
    drawPlayer();
    drawEnemies();
    drawPowerUps();
    drawParticles();
    updateUI();
    requestAnimationFrame(gameLoop);
}
function init() {
    createPlatforms();
    createCheckpoints();
    createClouds();
    updateUI();
    gameLoop();
}
init();
