// Game Constants
const CANVAS_SIZE = 600;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Game State
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;

// Directions
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game Map (1 = Wall, 0 = Path, 2 = Ghost Home)
const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Pacman Object
const pacman = {
    x: 1, 
    y: 1,
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    speed: 4,
    animationFrame: 0
};

// Ghosts Array
const ghosts = [
    { x: 9, y: 9, direction: DIRECTIONS.UP, speed: 3, color: 'red', name: 'Blinky' },
    { x: 10, y: 9, direction: DIRECTIONS.UP, speed: 2.5, color: 'pink', name: 'Pinky' },
    { x: 9, y: 10, direction: DIRECTIONS.UP, speed: 2.5, color: 'cyan', name: 'Inky' },
    { x: 10, y: 10, direction: DIRECTIONS.UP, speed: 2.5, color: 'orange', name: 'Clyde' }
];

// Pellets Array
let pellets = [];
let powerPellets = [];

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Initialize Game
function initGame() {
    generatePellets();
    drawGame();
    setupEventListeners();
    updateUI();
}

// Generate Pellets
function generatePellets() {
    pellets = [];
    powerPellets = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (MAP[y][x] === 0) {
                pellets.push({ x, y, eaten: false });
            }
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Keyboard Controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Button Controls
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
}

// Handle Key Press
function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowUp':
            pacman.nextDirection = DIRECTIONS.UP;
            break;
        case 'ArrowDown':
            pacman.nextDirection = DIRECTIONS.DOWN;
            break;
        case 'ArrowLeft':
            pacman.nextDirection = DIRECTIONS.LEFT;
            break;
        case 'ArrowRight':
            pacman.nextDirection = DIRECTIONS.RIGHT;
            break;
        case ' ': // Space to start/pause
            if (gameRunning) {
                togglePause();
            } else {
                startGame();
            }
            break;
    }
}

// Start Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameLoop();
        startBtn.textContent = 'Restart';
    } else {
        // Restart Game
        resetGame();
    }
}

// Reset Game
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    level = 1;
    
    pacman.x = 1;
    pacman.y = 1;
    pacman.direction = DIRECTIONS.RIGHT;
    pacman.nextDirection = DIRECTIONS.RIGHT;
    
    ghosts.forEach((ghost, index) => {
        ghost.x = 9 + (index % 2);
        ghost.y = 9 + Math.floor(index / 2);
        ghost.direction = DIRECTIONS.UP;
    });
    
    generatePellets();
    updateUI();
    drawGame();
    startBtn.textContent = 'Start Game';
}

// Toggle Pause
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

// Update UI
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// Check if Position is Valid
function isValidPosition(x, y) {
    return MAP[y][x] === 0 || MAP[y][x] === 2;
}

// Move Pacman
function movePacman() {
    // Check if next direction is valid
    const nextX = Math.floor(pacman.x + pacman.nextDirection.x);
    const nextY = Math.floor(pacman.y + pacman.nextDirection.y);
    
    if (isValidPosition(nextX, nextY)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Move Pacman
    pacman.x += pacman.direction.x * (pacman.speed / 60);
    pacman.y += pacman.direction.y * (pacman.speed / 60);
    
    // Ensure Pacman stays within grid
    pacman.x = Math.max(0, Math.min(GRID_SIZE - 1, pacman.x));
    pacman.y = Math.max(0, Math.min(GRID_SIZE - 1, pacman.y));
    
    // Check for pellet collision
    checkPelletCollision();
    
    // Check for ghost collision
    checkGhostCollision();
}

// Move Ghosts
function moveGhosts() {
    ghosts.forEach(ghost => {
        // Simple AI - Random direction changes
        if (Math.random() < 0.1) {
            const directions = Object.values(DIRECTIONS);
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            
            const nextX = Math.floor(ghost.x + randomDirection.x);
            const nextY = Math.floor(ghost.y + randomDirection.y);
            
            if (isValidPosition(nextX, nextY)) {
                ghost.direction = randomDirection;
            }
        }
        
        // Move Ghost
        ghost.x += ghost.direction.x * (ghost.speed / 60);
        ghost.y += ghost.direction.y * (ghost.speed / 60);
        
        // Ensure Ghost stays within grid
        ghost.x = Math.max(0, Math.min(GRID_SIZE - 1, ghost.x));
        ghost.y = Math.max(0, Math.min(GRID_SIZE - 1, ghost.y));
        
        // Wall collision detection
        const nextX = Math.floor(ghost.x + ghost.direction.x);
        const nextY = Math.floor(ghost.y + ghost.direction.y);
        
        if (!isValidPosition(nextX, nextY)) {
            // Reverse direction if hitting wall
            ghost.direction = {
                x: -ghost.direction.x,
                y: -ghost.direction.y
            };
        }
    });
}

// Check Pellet Collision
function checkPelletCollision() {
    const gridX = Math.floor(pacman.x);
    const gridY = Math.floor(pacman.y);
    
    for (let i = 0; i < pellets.length; i++) {
        const pellet = pellets[i];
        if (!pellet.eaten && pellet.x === gridX && pellet.y === gridY) {
            pellet.eaten = true;
            score += 10;
            updateUI();
            
            // Check if all pellets are eaten
            if (pellets.every(p => p.eaten)) {
                levelUp();
            }
            break;
        }
    }
}

// Check Ghost Collision
function checkGhostCollision() {
    const gridX = Math.floor(pacman.x);
    const gridY = Math.floor(pacman.y);
    
    for (const ghost of ghosts) {
        const ghostGridX = Math.floor(ghost.x);
        const ghostGridY = Math.floor(ghost.y);
        
        if (gridX === ghostGridX && gridY === ghostGridY) {
            loseLife();
            break;
        }
    }
}

// Lose Life
function loseLife() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        pacman.x = 1;
        pacman.y = 1;
        pacman.direction = DIRECTIONS.RIGHT;
        pacman.nextDirection = DIRECTIONS.RIGHT;
        
        ghosts.forEach((ghost, index) => {
            ghost.x = 9 + (index % 2);
            ghost.y = 9 + Math.floor(index / 2);
            ghost.direction = DIRECTIONS.UP;
        });
    }
}

// Level Up
function levelUp() {
    level++;
    // Increase ghost speed for next level
    ghosts.forEach(ghost => {
        ghost.speed = Math.min(4, ghost.speed + 0.2);
    });
    generatePellets();
}

// Game Over
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    alert(`Game Over! Your Score: ${score}`);
    resetGame();
}

// Draw Game
function drawGame() {
    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw Map
    drawMap();
    
    // Draw Pellets
    drawPellets();
    
    // Draw Pacman
    drawPacman();
    
    // Draw Ghosts
    drawGhosts();
}

// Draw Map
function drawMap() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (MAP[y][x] === 1) {
                ctx.fillStyle = '#0000ff';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Add wall border
                ctx.strokeStyle = '#000080';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (MAP[y][x] === 2) {
                ctx.fillStyle = '#000033';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Draw Pellets
function drawPellets() {
    pellets.forEach(pellet => {
        if (!pellet.eaten) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(
                pellet.x * CELL_SIZE + CELL_SIZE / 2,
                pellet.y * CELL_SIZE + CELL_SIZE / 2,
                3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Draw Pacman
function drawPacman() {
    const centerX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    
    // Animation frame for mouth
    pacman.animationFrame = (pacman.animationFrame + 0.2) % (Math.PI * 2);
    const mouthAngle = 0.3 + Math.sin(pacman.animationFrame) * 0.2;
    
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    
    // Calculate mouth direction
    const startAngle = getMouthStartAngle(pacman.direction, mouthAngle);
    const endAngle = getMouthEndAngle(pacman.direction, mouthAngle);
    
    ctx.arc(centerX, centerY, CELL_SIZE / 2 - 2, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Draw Pacman's eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        centerX + pacman.direction.x * 5,
        centerY + pacman.direction.y * 5,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Get Mouth Start Angle
function getMouthStartAngle(direction, mouthAngle) {
    switch (direction) {
        case DIRECTIONS.UP:
            return Math.PI / 2 + mouthAngle;
        case DIRECTIONS.DOWN:
            return 3 * Math.PI / 2 + mouthAngle;
        case DIRECTIONS.LEFT:
            return Math.PI + mouthAngle;
        case DIRECTIONS.RIGHT:
            return mouthAngle;
    }
}

// Get Mouth End Angle
function getMouthEndAngle(direction, mouthAngle) {
    switch (direction) {
        case DIRECTIONS.UP:
            return Math.PI / 2 - mouthAngle;
        case DIRECTIONS.DOWN:
            return 3 * Math.PI / 2 - mouthAngle;
        case DIRECTIONS.LEFT:
            return Math.PI - mouthAngle;
        case DIRECTIONS.RIGHT:
            return 2 * Math.PI - mouthAngle;
    }
}

// Draw Ghosts
function drawGhosts() {
    ghosts.forEach(ghost => {
        const centerX = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        
        // Draw Ghost Body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, CELL_SIZE / 2 - 2, Math.PI, Math.PI * 2);
        ctx.rect(
            ghost.x * CELL_SIZE + 2,
            ghost.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE - 4,
            CELL_SIZE / 2 - 2
        );
        ctx.fill();
        
        // Draw Ghost Eyes
        ctx.fillStyle = '#fff';
        const eyeOffset = CELL_SIZE / 6;
        ctx.beginPath();
        ctx.arc(
            centerX - eyeOffset, centerY - 5,
            5, 0, Math.PI * 2
        );
        ctx.arc(
            centerX + eyeOffset, centerY - 5,
            5, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw Ghost Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(
            centerX - eyeOffset + ghost.direction.x * 2,
            centerY - 5 + ghost.direction.y * 2,
            2, 0, Math.PI * 2
        );
        ctx.arc(
            centerX + eyeOffset + ghost.direction.x * 2,
            centerY - 5 + ghost.direction.y * 2,
            2, 0, Math.PI * 2
        );
        ctx.fill();
    });
}

// Game Loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    movePacman();
    moveGhosts();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Initialize Game
initGame();
