/**
 * Multiversal Fishing Simulator - Game Engine
 * Core game loop and tick system
 */

class GameEngine {
    constructor() {
        this.tickRate = 10; // 10 ticks per second
        this.tickInterval = 1000 / this.tickRate; // 100ms
        this.lastTick = 0;
        this.tickCount = 0;
        this.isRunning = false;
        this.debugMode = false;
        this.tickWatchdog = {
            enabled: false,
            maxTickTime: 100, // 100ms max per tick
            warnings: 0,
            maxWarnings: 5
        };
        
        this.startTime = Date.now();
        this.gameTime = 0;
        
        // Bind methods
        this.tick = this.tick.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTick = performance.now();
        this.tickLoop();
        
        console.log('Game engine started');
    }

    stop() {
        this.isRunning = false;
        console.log('Game engine stopped');
    }

    tickLoop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const deltaTime = now - this.lastTick;

        // Only tick if enough time has passed
        if (deltaTime >= this.tickInterval) {
            const tickStart = performance.now();
            
            this.tick(deltaTime);
            
            const tickTime = performance.now() - tickStart;
            
            // Watchdog monitoring
            if (this.debugMode && this.tickWatchdog.enabled) {
                if (tickTime > this.tickWatchdog.maxTickTime) {
                    this.tickWatchdog.warnings++;
                    console.warn(`Tick took ${tickTime.toFixed(2)}ms (exceeds ${this.tickWatchdog.maxTickTime}ms limit)`);
                    
                    if (this.tickWatchdog.warnings >= this.tickWatchdog.maxWarnings) {
                        console.error('Too many slow ticks detected. Game may be lagging.');
                        this.tickWatchdog.warnings = 0; // Reset to avoid spam
                    }
                }
            }
            
            this.lastTick = now;
            this.tickCount++;
            this.gameTime += deltaTime;
        }

        // Continue the loop
        requestAnimationFrame(() => this.tickLoop());
    }

    tick(deltaTime) {
        // This method will be called 10 times per second
        // All game logic that needs to run continuously goes here
        
        // Update game state
        if (window.gameState) {
            window.gameState.update(deltaTime);
        }
        
        // Update fishing mechanics
        if (window.fishingMechanics) {
            window.fishingMechanics.update(deltaTime);
        }
        
        // Update progression system
        if (window.progressionSystem) {
            window.progressionSystem.update(deltaTime);
        }
        
        // Update UI
        if (window.uiManager) {
            window.uiManager.update(deltaTime);
        }
        
        // Autosave every 30 seconds (300 ticks at 10Hz)
        if (this.tickCount % 300 === 0) {
            if (window.gameState) {
                window.gameState.autoSave();
            }
        }
    }

    // Debug methods
    enableDebugMode() {
        this.debugMode = true;
        this.tickWatchdog.enabled = true;
        console.log('Debug mode enabled');
    }

    disableDebugMode() {
        this.debugMode = false;
        this.tickWatchdog.enabled = false;
        console.log('Debug mode disabled');
    }

    getStats() {
        return {
            tickRate: this.tickRate,
            tickCount: this.tickCount,
            gameTime: this.gameTime,
            isRunning: this.isRunning,
            debugMode: this.debugMode,
            uptime: Date.now() - this.startTime
        };
    }

    // Performance monitoring
    getPerformanceStats() {
        const now = performance.now();
        const actualTickRate = this.tickCount / (this.gameTime / 1000);
        
        return {
            targetTickRate: this.tickRate,
            actualTickRate: actualTickRate.toFixed(2),
            tickCount: this.tickCount,
            gameTime: this.gameTime,
            uptime: Date.now() - this.startTime,
            warnings: this.tickWatchdog.warnings
        };
    }
}

// Initialize game engine
window.gameEngine = new GameEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
