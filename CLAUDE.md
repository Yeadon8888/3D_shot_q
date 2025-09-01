# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Shooting Master 3D" - a web-based first-person shooter game built with Three.js and vanilla JavaScript. The game runs entirely in the browser without any build process or server requirements.

## Commands

### Development
- **Running the game**: Simply open `index.html` in any modern web browser
- **No build process required**: Changes to `game.js` or `index.html` are reflected immediately upon page reload
- **Testing**: Manual testing by playing the game in the browser

### File Structure
- `index.html`: Main HTML file containing UI structure and CSS styling
- `game.js`: Complete game logic including Three.js scene setup, game mechanics, and user interactions
- `README.md`: Project documentation and game instructions

## Architecture

### Core Game Loop
The game follows a standard game loop pattern in the `animate()` function:
1. Request animation frame
2. Update game state (if playing)
3. Render Three.js scene

### Key Systems

**Scene Management** (`game.js:62-127`)
- Three.js scene initialization with camera, renderer, lighting
- Environment creation with ground plane and grid helper

**Game State Management** (`game.js:8-18`)
- States: 'start', 'playing', 'ended'
- Score tracking, combo system, timer management

**Enemy System** (`game.js:184-226`)
- Dynamic spawning with geometric shapes (boxes/spheres)
- Random movement within bounded area
- Automatic spawning every 10 seconds during gameplay

**Input Handling**
- Pointer lock for mouse look controls (`game.js:285-293`)
- WASD/arrow keys for movement (`game.js:228-269`) 
- Mouse click for shooting with raycasting (`game.js:296-356`)

**Scoring System** (`game.js:318-341`)
- Base score: 10 points + difficulty bonus
- Combo multipliers: 1.2x (2-4 hits), 1.5x (5-7 hits), 2x (8+ hits)
- Combo breaks after 3 seconds without hit

**Leaderboard** (`game.js:52-59, 450-483`)
- Client-side storage in JavaScript array
- Top 10 players displayed with username, score, accuracy

### Key Functions
- `init()`: Initialize Three.js scene and event listeners
- `startGame()`: Reset game state and begin new session  
- `spawnEnemy()`: Create new enemy with random properties
- `updateGame()`: Main game update loop for movement, enemies, timing
- `endGame()`: Calculate final stats and update leaderboard

## Dependencies
- Three.js r128 (loaded from CDN)
- No other external dependencies or build tools required