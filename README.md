# Multiversal Fishing Simulator

A browser-based incremental game inspired by Antimatter Dimensions, where players progress through increasingly complex fishing mechanics across multiple universes.

## Game Overview

Start with a single "Catch Fish" button and progress through an exponential journey:
- **Early Game**: Fish → Rods → Bodies → Ponds
- **Mid Game**: Lakes → Oceans → Planets → Solar Systems
- **Late Game**: Galaxies → Universes → Infinity Fish

## Features

### Core Mechanics
- **Fishing System**: Click to catch fish with progress bars and cooldowns
- **Net System**: Passive fish generation with manual collection
- **Progression Tiers**: Ponds → Lakes → Oceans → Planets → Solar Systems → Galaxies → Universes
- **Body System**: Multiple bodies to fish in different locations
- **Autobuyers**: Automate upgrades and progression

### Technical Features
- **10Hz Game Loop**: Smooth 60fps performance with 10Hz game ticks
- **Large Number Support**: Base/exponent system for handling very large numbers
- **Save System**: Cookie-based persistence with export/import functionality
- **Debug Console**: Comprehensive debugging tools and console commands
- **Performance Monitoring**: Built-in performance tracking and optimization

### UI/UX
- **Minimalistic Design**: Black background with text-based interface
- **Newsfeed**: Horizontal scrolling satirical news updates
- **Progress Tracking**: Infinity Fish progress bar
- **Responsive Design**: Works on desktop and mobile browsers

## Getting Started

1. Open `index.html` in a modern web browser
2. Click "Catch Fish" to start fishing
3. Purchase upgrades as you accumulate fish
4. Progress through different tiers and universes
5. Reach the ultimate goal: Infinity Fish (69e420)

## Debug Console

Press `F12` or `Ctrl+Shift+I` to open the debug console. Available commands:

- `addfish [amount]`: Add fish to your total
- `setfish [amount]`: Set your fish count
- `addbodies [count]`: Add bodies
- `settier [tier]`: Set current tier (pond, lake, ocean, etc.)
- `unlockautobuyers`: Unlock all autobuyers
- `setspeed [multiplier]`: Set fishing speed multiplier
- `addnets [count]`: Add fishing nets
- `reset`: Reset the game
- `save`: Save the game
- `export`: Export save data
- `stats`: Show game statistics
- `performance`: Show performance statistics
- `help`: Show all available commands

## Game Balance

The game uses a coefficient system for easy balancing:
- **Rod Cost Multiplier**: Controls rod upgrade costs
- **Net Cost Multiplier**: Controls net upgrade costs
- **Body Cost Multiplier**: Controls body upgrade costs
- **Fishing Speed Multiplier**: Controls fishing speed
- **Net Capacity Multiplier**: Controls net efficiency
- **Tier Cost Multiplier**: Controls tier progression costs

## Technical Architecture

### File Structure
- `index.html`: Main HTML structure
- `styles.css`: CSS styling and responsive design
- `game-engine.js`: Core game loop and tick system
- `game-state.js`: State management and persistence
- `fishing-mechanics.js`: Fishing and net mechanics
- `progression-system.js`: Upgrade and progression systems
- `ui-manager.js`: UI updates and debug console
- `main.js`: Game initialization and entry point

### Performance Requirements
- **Tick Rate**: 10Hz (100ms intervals)
- **Calculation Time**: All fish calculations under 100ms
- **Memory**: Efficient caching of multipliers
- **Responsiveness**: UI remains responsive during calculations

## Development

### Prerequisites
- Modern web browser with JavaScript support
- No external dependencies required

### Running Locally
1. Clone or download the repository
2. Open `index.html` in a web browser
3. Start playing!

### Building for Production
The game is pure vanilla JavaScript with no build process required. Simply serve the files from any web server.

## Contributing

This is a single-player incremental game with no server-side components. All game logic runs in the browser, making it easy to modify and extend.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Inspiration

Based on [Antimatter Dimensions](https://github.com/IvarK/IvarK.github.io) by IvarK, a popular incremental/idle game with deep progression mechanics.

## Version History

- **v1.0.0**: Initial release with core fishing mechanics, progression system, and debug tools
