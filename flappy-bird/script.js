// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_WIDTH = 30;
const BIRD_HEIGHT = 25;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const PIPE_SPEED = 3;
const GROUND_HEIGHT = 80;

// Game variables
let canvas, ctx;
let bird = {
    x: 50,
    y: CANVAS_HEIGHT / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    dy: 0,
    rotation: 0
};
let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyBirdHighScore')) || 0;
let gameRunning = false;
let gameOver = false;
let frameCount = 0;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Update high score display
    document.getElementById('highScore').textContent = highScore;
    
    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    
    canvas.addEventListener('click', flap);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flap();
        }
    });
    
    // Start game loop
    gameLoop();
}

// Start game
function startGame() {
    if (!gameRunning) {
        resetGame();
        gameRunning = true;
        gameOver = false;
    }
}

// Toggle pause
function togglePause() {
    if (gameRunning && !gameOver) {
        gameRunning = false;
        document.getElementById('pauseBtn').textContent = 'Resume';
    } else if (!gameRunning && !gameOver) {
        gameRunning = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
}

// Reset game
function resetGame() {
    bird.x = 50;
    bird.y = CANVAS_HEIGHT / 2;
    bird.dy = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameRunning = true;
    gameOver = false;
    document.getElementById('score').textContent = score;
    document.getElementById('pauseBtn').textContent = 'Pause';
}

// Bird flap
function flap() {
    if (gameRunning && !gameOver) {
        bird.dy = JUMP_STRENGTH;
    } else if (gameOver) {
        startGame();
    }
}

// Generate pipes
function generatePipes() {
    if (frameCount % 100 === 0) {
        const pipeHeight = Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 100) + 50;
        pipes.push({
            x: CANVAS_WIDTH,
            width: PIPE_WIDTH,
            topHeight: pipeHeight,
            bottomY: pipeHeight + PIPE_GAP,
            passed: false
        });
    }
}

// Update game state
function update() {
    if (!gameRunning || gameOver) return;
    
    // Update bird position
    bird.dy += GRAVITY;
    bird.y += bird.dy;
    
    // Update bird rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.dy * 0.05, -0.5), 1);
    
    // Generate pipes
    generatePipes();
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').textContent = score;
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyBirdHighScore', highScore);
                document.getElementById('highScore').textContent = highScore;
            }
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
        }
        
        // Check collision with pipes
        if (checkCollision(bird, pipe)) {
            gameOver = true;
            gameRunning = false;
            break;
        }
    }
    
    // Check collision with ground or ceiling
    if (bird.y + bird.height > CANVAS_HEIGHT - GROUND_HEIGHT || bird.y < 0) {
        gameOver = true;
        gameRunning = false;
    }
    
    frameCount++;
}

// Check collision between bird and pipe
function checkCollision(bird, pipe) {
    return bird.x < pipe.x + pipe.width &&
           bird.x + bird.width > pipe.x &&
           (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY);
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);
    
    // Draw ground
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw ground details
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 10);
    
    // Draw sun
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(350, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw clouds
    drawCloud(100, 100, 60, 30);
    drawCloud(250, 150, 80, 40);
    drawCloud(150, 200, 70, 35);
    
    // Draw pipes
    pipes.forEach(pipe => {
        // Top pipe
        drawPipe(pipe.x, 0, pipe.width, pipe.topHeight, true);
        
        // Bottom pipe
        drawPipe(pipe.x, pipe.bottomY, pipe.width, CANVAS_HEIGHT - GROUND_HEIGHT - pipe.bottomY, false);
    });
    
    // Draw bird
    drawBird();
    
    // Draw game over screen if needed
    if (gameOver) {
        drawGameOver();
    }
    
    // Draw pause message if needed
    if (!gameRunning && !gameOver && frameCount > 0) {
        drawPauseMessage();
    }
}

// Draw cloud
function drawCloud(x, y, width, height) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, width / 3, 0, Math.PI * 2);
    ctx.arc(x + width / 3, y, width / 2.5, 0, Math.PI * 2);
    ctx.arc(x + (2 * width) / 3, y, width / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - width / 6, y, width, height);
}

// Draw pipe
function drawPipe(x, y, width, height, isTop) {
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x, y, width, height);
    
    // Pipe cap
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(x - 5, isTop ? y + height - 20 : y, width + 10, 20);
    
    // Pipe details
    ctx.fillStyle = '#006400';
    for (let i = 0; i < height; i += 30) {
        ctx.fillRect(x + 5, y + i + 5, width - 10, 5);
    }
}

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    
    // Bird body
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Bird wings
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(-bird.width / 2, -bird.height / 2);
    ctx.lineTo(-bird.width / 2 - 15, -bird.height / 2 + 5);
    ctx.lineTo(-bird.width / 2, -bird.height / 2 + 15);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 8, -3);
    ctx.lineTo(bird.width / 2 + 8, 3);
    ctx.fill();
    
    ctx.restore();
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click or Press Space to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
}

// Draw pause message
function drawPauseMessage() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click Resume or Press Space to Continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.addEventListener('load', init);