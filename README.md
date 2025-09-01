# Shooting Master 3D

A lightweight web-based 3D first-person shooter game built with Three.js.

## Description

Shooting Master 3D is a fast-paced shooting game that runs directly in the browser. Players aim and shoot at geometric targets in a 3D environment, earning points and building combos for higher scores.

## Features

- First-person 3D perspective using Three.js
- Dynamic enemy spawning with geometric shapes
- Combo system for higher scores
- Real-time scoring and timer
- Leaderboard to track top players
- Particle effects for visual feedback
- Responsive design that works on different screen sizes

## How to Play

1. Enter a username (2-12 characters)
2. Click "Start Game"
3. Use the mouse to aim at the center of the screen
4. Left-click to shoot at the colored geometric targets
5. Build combos by hitting targets without missing
6. Try to get the highest score in 60 seconds!

## Technical Details

- Built with Three.js for 3D rendering
- Pure HTML/CSS/JavaScript implementation
- No external dependencies except Three.js CDN
- Runs entirely in the browser (no server required)

## Game Mechanics

### Scoring System
- Base score: 10 points per hit
- Difficulty bonus: +5 points per 10 seconds played
- Combo multipliers:
  - 2-4 hits in a row: 1.2x multiplier
  - 5-7 hits in a row: 1.5x multiplier
  - 8+ hits in a row: 2x multiplier
- Combo breaks after 3 seconds without a hit

### Enemy System
- Game starts with 3 enemies
- 2 new enemies spawn every 10 seconds
- Maximum of 15 enemies on screen
- Enemies move randomly within a defined area

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Installation

Simply open `index.html` in a modern web browser. No build process or server required.

## Development

To modify the game:

1. Edit `index.html` for UI changes
2. Edit `game.js` for game logic
3. No build step required - changes are reflected immediately upon reloading the page

## Future Improvements

- Add sound effects and background music
- Implement different weapon types
- Add power-ups and special targets
- Improve mobile touch controls
- Add difficulty settings
- Implement server-side leaderboard storage

## License

This project is open source and available under the MIT License.