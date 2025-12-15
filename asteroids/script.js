// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let lives = 3;

// Player ship
const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 15,
    angle: 0,
    speed: 0,
    dx: 0,
    dy: 0,
    turningLeft: false,
    turningRight: false,
    thrusting: false,
    canShoot: true,
    shootCooldown: 0
};

// Game objects
let asteroids = [];
let bullets = [];
let particles = [];

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // Shoot on spacebar press
    if (e.code === 'Space' && gameState === 'playing' && player.canShoot) {
        shootBullet();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game initialization
function initGame() {
    score = 0;
    lives = 3;
    updateUI();
    
    // Reset player
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.angle = 0;
    player.speed = 0;
    player.dx = 0;
    player.dy = 0;
    player.turningLeft = false;
    player.turningRight = false;
    player.thrusting = false;
    
    // Clear objects
    asteroids = [];
    bullets = [];
    particles = [];
    
    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
        createAsteroid();
    }
}

// Create asteroid
function createAsteroid(x, y, size = 3) {
    const asteroid = {
        x: x || Math.random() * WIDTH,
        y: y || Math.random() * HEIGHT,
        radius: size * 15,
        size: size,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 2 + 1) * (size / 3),
        vertices: []
    };
    
    // Generate random vertices for asteroid shape
    for (let i = 0; i < 8; i++) {
        const vertexAngle = (i / 8) * Math.PI * 2;
        const vertexRadius = asteroid.radius * (Math.random() * 0.3 + 0.85);
        asteroid.vertices.push({
            x: Math.cos(vertexAngle) * vertexRadius,
            y: Math.sin(vertexAngle) * vertexRadius
        });
    }
    
    asteroids.push(asteroid);
}

// Shoot bullet
function shootBullet() {
    const bullet = {
        x: player.x + Math.cos(player.angle) * player.radius,
        y: player.y + Math.sin(player.angle) * player.radius,
        radius: 3,
        angle: player.angle,
        speed: 8
    };
    
    bullets.push(bullet);
    player.canShoot = false;
    player.shootCooldown = 20;
}

// Update game objects
function update() {
    if (gameState !== 'playing') return;
    
    // Update player
    updatePlayer();
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        // Remove bullets that are off-screen
        if (bullet.x < -50 || bullet.x > WIDTH + 50 || 
            bullet.y < -50 || bullet.y > HEIGHT + 50) {
            bullets.splice(i, 1);
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
        
        // Wrap asteroids around screen
        wrapObject(asteroid);
        
        // Check collision with player
        if (checkCollision(player, asteroid)) {
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            } else {
                // Reset player position
                player.x = WIDTH / 2;
                player.y = HEIGHT / 2;
                player.dx = 0;
                player.dy = 0;
                player.speed = 0;
            }
        }
    }
    
    // Check bullet-asteroid collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], asteroids[j])) {
                // Destroy asteroid
                const asteroid = asteroids[j];
                score += asteroid.size * 10;
                updateUI();
                
                // Create smaller asteroids if not the smallest size
                if (asteroid.size > 1) {
                    for (let k = 0; k < 2; k++) {
                        createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1);
                    }
                }
                
                // Remove asteroid and bullet
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Update shoot cooldown
    if (!player.canShoot) {
        player.shootCooldown--;
        if (player.shootCooldown <= 0) {
            player.canShoot = true;
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Check if all asteroids are destroyed
    if (asteroids.length === 0) {
        // Create new wave with more asteroids
        for (let i = 0; i < 6; i++) {
            createAsteroid();
        }
    }
}

// Update player
function updatePlayer() {
    // Handle input
    player.turningLeft = keys['ArrowLeft'] || keys['KeyA'];
    player.turningRight = keys['ArrowRight'] || keys['KeyD'];
    player.thrusting = keys['ArrowUp'] || keys['KeyW'];
    
    // Turning
    if (player.turningLeft) {
        player.angle -= 0.1;
    }
    if (player.turningRight) {
        player.angle += 0.1;
    }
    
    // Thrusting
    if (player.thrusting) {
        const thrust = 0.1;
        player.dx += Math.cos(player.angle) * thrust;
        player.dy += Math.sin(player.angle) * thrust;
    }
    
    // Apply friction
    player.dx *= 0.98;
    player.dy *= 0.98;
    
    // Update position
    player.x += player.dx;
    player.y += player.dy;
    
    // Wrap player around screen
    wrapObject(player);
}

// Wrap object around screen edges
function wrapObject(obj) {
    if (obj.x < -obj.radius) obj.x = WIDTH + obj.radius;
    if (obj.x > WIDTH + obj.radius) obj.x = -obj.radius;
    if (obj.y < -obj.radius) obj.y = HEIGHT + obj.radius;
    if (obj.y > HEIGHT + obj.radius) obj.y = -obj.radius;
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    if (gameState === 'playing') {
        // Render player
        renderPlayer();
        
        // Render asteroids
        renderAsteroids();
        
        // Render bullets
        renderBullets();
        
        // Render particles
        renderParticles();
    }
}

// Render player ship
function renderPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    // Draw ship triangle
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(0, -player.radius);
    ctx.lineTo(-player.radius, player.radius);
    ctx.lineTo(player.radius, player.radius);
    ctx.closePath();
    ctx.fill();
    
    // Draw ship outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw thruster if thrusting
    if (player.thrusting) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(-player.radius / 2, player.radius);
        ctx.lineTo(0, player.radius + 10);
        ctx.lineTo(player.radius / 2, player.radius);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// Render asteroids
function renderAsteroids() {
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
        
        for (let i = 1; i < asteroid.vertices.length; i++) {
            ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Draw asteroid outline
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    });
}

// Render bullets
function renderBullets() {
    ctx.fillStyle = '#fff';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Render particles
function renderParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.life / 30})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    initGame();
}

// Restart game
function restartGame() {
    startGame();
}

// Initialize game
initGame();
gameLoop();