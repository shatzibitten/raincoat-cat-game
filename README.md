# Raincoat Cat - A Grappling Hook Adventure

A retro-style platformer game built with Phaser 3 featuring a cute cat in a yellow raincoat with grappling hook mechanics.

## Features

- **5 Levels** with increasing difficulty
- **Grappling Hook Mechanics** - Swing across gaps using the hook
- **Procedurally Generated Sprites** - All graphics created with code
- **Procedural Sound Effects** - Web Audio API synthesized sounds
- **Combo System** - Chain hooks without touching ground for bonus points
- **Collectibles** - Raindrops and secret stars

## Controls

| Key | Action |
|-----|--------|
| A/D or ←/→ | Move Left/Right |
| SPACE or W/↑ | Jump |
| E or Left Click | Fire Grappling Hook |
| Arrow Keys/Mouse | Aim Hook Direction |
| E again or Right Click | Cancel Hook |
| ESC | Pause Game |
| R | Restart Level |

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
src/
├── main.js              # Game entry point and config
├── Player.js            # Player class with movement and hook
├── Enemy.js             # Enemy class
├── SoundManager.js      # Procedural sound generation
├── levels.js            # Level data (ASCII maps)
└── scenes/
    ├── BootScene.js     # Initial boot
    ├── PreloadScene.js  # Sprite generation
    ├── MenuScene.js     # Main menu
    ├── GameScene.js     # Main gameplay
    ├── UIScene.js       # HUD overlay
    ├── LevelCompleteScene.js
    ├── GameOverScene.js
    ├── ControlsScene.js
    └── PauseScene.js
```

## Level Map Legend

```
@ - Player spawn
# - Ground tile (grass)
D - Dirt tile
S - Stone tile
P - Platform (one-way)
^ - Spikes
H - Hook point
C - Checkpoint
F - Finish flag
r - Raindrop collectible
* - Secret star
1 - Slime enemy
2 - Bug enemy
. - Empty space
```

## Technologies

- **Phaser 3** - Game framework
- **Vite** - Build tool
- **Web Audio API** - Sound synthesis

## License

MIT
