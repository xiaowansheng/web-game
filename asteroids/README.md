# Asteroids Game

A classic Asteroids game implemented in HTML5 Canvas.

## Description

This is a modern take on the classic Asteroids arcade game. Control a spaceship, destroy asteroids, and survive as long as possible!

## Features

- Classic Asteroids gameplay
- Smooth 60fps animation
- Responsive controls
- Score tracking
- Multiple lives system
- Progressive difficulty
- Visual effects

## How to Play

### Controls

- **Arrow Keys** or **WASD**: Control the spaceship
  - Up/W: Thrust forward
  - Left/A: Turn left
  - Right/D: Turn right
- **Spacebar**: Shoot bullets

### Objective

- Destroy all asteroids on screen
- Avoid colliding with asteroids
- Each destroyed asteroid awards points based on its size
- Smaller asteroids split into more asteroids when destroyed
- Survive as long as possible to get the highest score

## Installation

1. Clone or download this repository
2. Navigate to the `asteroids` directory
3. Install dependencies (optional):
   ```bash
   pnpm install
   ```

## Running the Game

### Option 1: Using Python HTTP Server

```bash
pnpm start
```

Then open your browser and navigate to `http://localhost:8000`

### Option 2: Directly in Browser

Simply open the `index.html` file in your web browser.

## Game Mechanics

- **Player Ship**: Your spaceship that can thrust, turn, and shoot
- **Asteroids**: Come in 3 sizes, split into smaller ones when destroyed
- **Bullets**: Travel in straight lines, destroy asteroids on impact
- **Lives**: Start with 3 lives, lose one when colliding with an asteroid
- **Score**: Earn points for destroying asteroids (10-30 points depending on size)

## Technologies Used

- HTML5 Canvas for rendering
- JavaScript for game logic
- CSS3 for styling
- pnpm for package management (optional)

## License

MIT License