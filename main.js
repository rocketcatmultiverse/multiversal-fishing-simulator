/**
 * Multiversal Fishing Simulator - Main Entry Point
 * Initializes all game systems and starts the game
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Multiversal Fishing Simulator - Initializing...');
    
    // Initialize all game systems
    initializeGame();
    
    // Start the game engine
    window.gameEngine.start();
    
    console.log('Game initialized successfully!');
    console.log('Press F12 or Ctrl+Shift+I to open debug console');
});

function initializeGame() {
    // Verify all systems are loaded
    const systems = [
        { name: 'Game Engine', obj: window.gameEngine },
        { name: 'Game State', obj: window.gameState },
        { name: 'Fishing Mechanics', obj: window.fishingMechanics },
        { name: 'Progression System', obj: window.progressionSystem },
        { name: 'UI Manager', obj: window.uiManager }
    ];
    
    systems.forEach(system => {
        if (!system.obj) {
            console.error(`Failed to initialize ${system.name}`);
            return;
        }
        console.log(`${system.name} initialized`);
    });
    
    // Set up global error handling
    window.addEventListener('error', (event) => {
        console.error('Game Error:', event.error);
        if (window.uiManager) {
            window.uiManager.showNotification(`Error: ${event.error.message}`, 5000);
        }
    });
    
    // Set up unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        if (window.uiManager) {
            window.uiManager.showNotification(`Promise Error: ${event.reason}`, 5000);
        }
    });
    
    // Initial UI update
    if (window.uiManager) {
        window.uiManager.updateAllUI();
    }
    
    // Set up visibility change handling for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('Game paused (tab hidden)');
        } else {
            console.log('Game resumed (tab visible)');
        }
    });
    
    // Set up beforeunload for save confirmation
    window.addEventListener('beforeunload', (event) => {
        if (window.gameState) {
            window.gameState.save();
        }
    });
}

// Global game functions for console access
window.game = {
    // Quick access to main systems
    engine: () => window.gameEngine,
    state: () => window.gameState,
    fishing: () => window.fishingMechanics,
    progression: () => window.progressionSystem,
    ui: () => window.uiManager,
    
    // Quick debug commands
    addFish: (amount) => window.gameState.addFish(amount),
    setFish: (amount) => window.gameState.setFish(amount),
    reset: () => window.gameState.reset(),
    save: () => window.gameState.save(),
    
    // Performance monitoring
    getStats: () => window.gameEngine.getStats(),
    getPerformance: () => window.gameEngine.getPerformanceStats(),
    
    // Debug mode toggle
    toggleDebug: () => {
        if (window.gameEngine.debugMode) {
            window.gameEngine.disableDebugMode();
        } else {
            window.gameEngine.enableDebugMode();
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeGame };
}
