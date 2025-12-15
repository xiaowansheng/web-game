# Pacman Game

A classic Pacman game implemented with HTML, CSS, and JavaScript.

## Features

- Classic Pacman gameplay
- 4 colorful ghosts with different behaviors
- Score tracking
- Lives system
- Multiple levels with increasing difficulty
- Responsive controls
- Pause/resume functionality

## Installation

1. Ensure you have Node.js and pnpm installed
2. Navigate to the game directory:
   ```bash
   cd pacman
   ```
3. Install dependencies (if any):
   ```bash
   pnpm install
   ```

## How to Run

### Using pnpm scripts:
```bash
pnpm dev
```
or
```bash
pnpm start
```

This will start a local HTTP server. Open your browser and navigate to `http://localhost:8000`.

### Directly in Browser:
You can also open `index.html` directly in your web browser.

## Controls

- **Arrow Keys**: Move Pacman
- **Space Bar**: Start/Pause game
- **Start Button**: Start or Restart the game
- **Pause Button**: Pause/Resume the game

## Gameplay

1. Control Pacman to eat all the pellets in the maze
2. Avoid the ghosts
3. Each pellet eaten gives you 10 points
4. You have 3 lives
5. Complete each level by eating all pellets
6. Ghosts become faster as you progress to higher levels

## Game Structure

```
pacman/
├── index.html          # Main HTML file
├── style.css           # Game styling
├── script.js           # Game logic
├── package.json        # pnpm configuration
└── README.md           # This file
```

## Technologies Used

- HTML5 Canvas for game rendering
- CSS3 for styling
- Vanilla JavaScript for game logic
- pnpm for package management

## License

MIT
