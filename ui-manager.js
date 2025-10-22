/**
 * Multiversal Fishing Simulator - UI Manager
 * Handles all UI updates, newsfeed, and progress bars
 */

class UIManager {
    constructor() {
        this.elements = {
            fishDisplay: null,
            netCount: null,
            infinityProgressFill: null,
            infinityText: null,
            debugConsole: null,
            debugInput: null,
            debugOutput: null
        };
        
        this.victoryTriggered = false; // Track if victory sequence has been triggered
        
        this.newsItems = [
            "Local fisherman discovers fish can be caught with buttons!",
            "Scientists baffled by exponential fish growth patterns",
            "Breaking: New pond discovered in neighboring universe",
            "Fish prices skyrocket as demand reaches infinity",
            "Multiversal fishing license now required for advanced anglers",
            "Galaxy-sized fishing nets cause traffic jams in space",
            "Universe #42 reports record-breaking fish harvest",
            "Infinite fish supply discovered in parallel dimension",
            "Fishing rods now available in quantum superposition",
            "Breaking: Fish have achieved consciousness, demand better working conditions",
            "Quantum fishing hooks revolutionize multiversal angling",
            "Local pond reaches maximum fish capacity, residents concerned",
            "New study: Fish actually enjoy being caught repeatedly",
            "Galactic fishing tournament breaks all previous records",
            "Scientists discover secret to exponential fish breeding",
            "Breaking: First fish successfully parallelizes to new universe",
            "Fishing nets now available in 47 different quantum entanglement states",
            "Local angler accidentally creates infinite fish loop",
            "Multiversal fishing association announces new safety protocols",
            "Fish market crashes as supply exceeds all known mathematics",
            "Revolutionary bait technology increases catch rates by 69e420",
            "Breaking: Fish have started organizing labor unions",
            "New fishing rod design incorporates antimatter dimensions",
            "Scientists confirm: Fish are actually just really good at stupid math",
            "Galactic fishing fleet reports mysterious fish disappearances",
            "Breaking: Fish have learned to use fishing rods themselves",
            "Multiversal fishing championship ends in infinite tie",
            "Local fisherman discovers secret to catching imaginary numbers of fish",
            "Hi mom",
            "Stack overflow: Most of the time, it's just a pile of fish.",
        ];
        
        this.currentNewsIndex = 0;
        this.newsUpdateInterval = 30000; // 30 seconds to match animation duration
        this.lastNewsUpdate = 0;
        
        // Containers display optimization
        this.lastContainersHash = '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.startNewsfeed();
        
        // Initialize modal functionality
        this.initializeModals();
    }

    initializeElements() {
        this.elements.fishDisplay = document.getElementById('fish-display');
        this.elements.netCount = document.getElementById('net-count');
        this.elements.infinityProgressFill = document.getElementById('infinity-progress-fill');
        this.elements.infinityText = document.getElementById('infinity-text');
        this.elements.debugConsole = document.getElementById('debug-console');
        this.elements.debugInput = document.getElementById('debug-input');
        this.elements.debugOutput = document.getElementById('debug-output');
    }

    setupEventListeners() {
        // Debug console
        if (this.elements.debugInput) {
            this.elements.debugInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleDebugCommand();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                this.toggleDebugConsole();
            }
        });
    }

    update(deltaTime) {
        this.updateFishDisplay();
        this.updateNetDisplay();
        this.updateInfinityProgress();
        this.updateNewsfeed(deltaTime);
        this.updateContainersDisplay();
        this.updateTierDisplay();
    }

    // Fish Display
    updateFishDisplay() {
        if (!this.elements.fishDisplay) return;
        
        const fish = window.gameState.state.fish;
        this.elements.fishDisplay.textContent = window.gameState.formatNumber(fish);
    }

    // Net Display
    updateNetDisplay() {
        if (!this.elements.netCount) return;
        
        const netCount = window.gameState.state.nets.count;
        this.elements.netCount.textContent = netCount;
    }

    // Infinity Progress
    updateInfinityProgress() {
        if (!this.elements.infinityProgressFill || !this.elements.infinityText) return;
        
        const fish = window.gameState.state.fish;
        const infinityFish = window.gameState.createNumber(69, 420); // 69e420
        
        // Check for victory condition first
        if (window.gameState.compareNumbers(fish, infinityFish) >= 0) {
            if (!this.victoryTriggered) {
                this.victoryTriggered = true;
                this.triggerVictorySequence();
            }
            return;
        }
        
        // Calculate progress percentage using logarithmic scaling
        let progress = 0;
        // Use logarithmic scaling for better progress visualization
        // Convert both numbers to safe format for comparison
        const safeFish = window.gameState.toSafeNumber(fish);
        const safeInfinity = window.gameState.toSafeNumber(infinityFish);
        
        // Handle zero or invalid values
        if (safeFish.base === 0 || safeInfinity.base === 0) {
            progress = 0;
        } else {
            // Calculate logarithmic progress
            // Use the formula: progress = (log10(current) / log10(target)) * 100
            // This gives us meaningful progress even at small values
            
            const fishExponent = safeFish.exponent + Math.log10(Math.abs(safeFish.base));
            const infinityExponent = safeInfinity.exponent + Math.log10(Math.abs(safeInfinity.base));
            
            // Calculate progress as percentage of logarithmic distance
            progress = Math.min((fishExponent / infinityExponent) * 100, 100);
            
            // Ensure progress is never negative
            progress = Math.max(progress, 0);
        }
        
        this.elements.infinityProgressFill.style.width = `${progress}%`;
        
        // Show logarithmic progress with current fish count
        const safeFishDisplay = window.gameState.toSafeNumber(fish);
        let currentMagnitude, targetMagnitude;
        
        // Handle zero fish case
        if (safeFishDisplay.base === 0) {
            currentMagnitude = 0;
        } else {
            const fishExponent = safeFishDisplay.exponent + Math.log10(Math.abs(safeFishDisplay.base));
            currentMagnitude = Math.floor(fishExponent);
        }
        
        const infinityExponent = 420 + Math.log10(69); // 69e420
        targetMagnitude = Math.floor(infinityExponent);
        
        this.elements.infinityText.textContent = `Progress to Infinity Fish: ${progress.toFixed(1)}% (e${currentMagnitude}/e${targetMagnitude})`;
            this.elements.infinityText.style.color = '#cccccc';
    }

    // Container Display
    // Animation methods
    createFishAnimation(amount, element) {
        const animation = document.createElement('div');
        animation.className = 'fish-catch-animation';
        animation.textContent = `+${window.gameState.formatNumber(amount)} Fish`;
        
        // Position to the right of the element
        const rect = element.getBoundingClientRect();
        animation.style.left = (rect.right + 10) + 'px'; // 10px to the right of the element
        animation.style.top = (rect.top + rect.height / 2) + 'px'; // Center vertically
        
        // Add to body
        document.body.appendChild(animation);
        
        // Remove after animation completes (1 second)
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 1000);
    }

    updateContainerDisplay() {
        const containersList = document.getElementById('containers-list');
        if (!containersList) return;
        
        const state = window.gameState.state;
        containersList.innerHTML = '';
        
        // Display containers for each tier
        Object.keys(state.containers).forEach(containerType => {
            const containers = state.containers[containerType];
            if (containers.length > 0) {
                const containerTypeName = containerType.charAt(0).toUpperCase() + containerType.slice(1, -1); // Remove 's' and capitalize
                
                containers.forEach((container, index) => {
                    const containerItem = document.createElement('div');
                    containerItem.className = 'container-item';
                    
                    containerItem.innerHTML = `
                        <h4>${containerTypeName} #${index + 1}</h4>
                        <div class="fish-per-second">${window.gameState.formatNumber(window.gameState.createNumber(container.propagatedFPS || container.fishPerSecond))} fish/sec</div>
                    `;
                    
                    containersList.appendChild(containerItem);
                });
            }
        });
    }

    // Tier Display
    updateTierDisplay() {
        const tierElement = document.getElementById('current-tier');
        if (!tierElement) return;
        
        const state = window.gameState.state;
        const tierName = state.currentTier.charAt(0).toUpperCase() + state.currentTier.slice(1);
        tierElement.textContent = tierName;
    }

    // Newsfeed
    initializeModals() {
        // Initialize other modals and elements
        this.selectedUniverseIndex = null;
    }

    startNewsfeed() {
        this.updateNewsfeedContent();
    }

    updateNewsfeed(deltaTime) {
        this.lastNewsUpdate += deltaTime;
        
        if (this.lastNewsUpdate >= this.newsUpdateInterval) {
            this.updateNewsfeedContent();
            this.lastNewsUpdate = 0;
        }
    }

    updateNewsfeedContent() {
        const newsfeedContent = document.getElementById('newsfeed-content');
        if (!newsfeedContent) return;
        
        // Cycle through news items
        const currentNews = this.newsItems[this.currentNewsIndex];
        newsfeedContent.innerHTML = `<span class="news-item">${currentNews}</span>`;
        
        this.currentNewsIndex = (this.currentNewsIndex + 1) % this.newsItems.length;
    }

    // Debug Console
    toggleDebugConsole() {
        if (!this.elements.debugConsole) return;
        
        this.elements.debugConsole.classList.toggle('hidden');
        
        if (!this.elements.debugConsole.classList.contains('hidden')) {
            this.elements.debugInput.focus();
        }
    }

    handleDebugCommand() {
        const input = this.elements.debugInput.value.trim();
        if (!input) return;
        
        this.addDebugOutput(`> ${input}`);
        
        try {
            const result = this.executeDebugCommand(input);
            if (result !== undefined) {
                this.addDebugOutput(result);
            }
        } catch (error) {
            this.addDebugOutput(`Error: ${error.message}`);
        }
        
        this.elements.debugInput.value = '';
    }

    executeDebugCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch (cmd) {
            case 'help':
                return this.getDebugHelp();
            
            case 'fish':
                const fish = window.gameState.state.fish;
                return `Current fish: base=${fish.base}, exponent=${fish.exponent}, formatted=${window.gameState.formatNumber(fish)}`;
            
            case 'addfish':
                const amount = parseFloat(args[0]) || 100;
                window.gameState.addFish(amount);
                return `Added ${window.gameState.formatNumber(window.gameState.toSafeNumber(amount))} fish`;
            
            case 'setfish':
                const setAmount = parseFloat(args[0]) || 0;
                window.gameState.setFish(setAmount);
                return `Set fish to ${window.gameState.formatNumber(window.gameState.toSafeNumber(setAmount))}`;
            
            case 'addbodies':
                const bodyCount = parseInt(args[0]) || 1;
                window.progressionSystem.addBodies(bodyCount);
                return `Added ${bodyCount} bodies`;
            
            case 'settier':
                const tier = args[0] || 'pond';
                window.progressionSystem.setTier(tier);
                return `Set tier to ${tier}`;
            
            case 'unlockautobuyers':
                window.progressionSystem.unlockAllAutobuyers();
                return 'Unlocked all autobuyers';
            
            case 'setspeed':
                const speed = parseFloat(args[0]) || 1.0;
                window.fishingMechanics.setFishingSpeed(speed);
                return `Set fishing speed to ${speed}x`;
            
            case 'addnets':
                const netCount = parseInt(args[0]) || 1;
                window.fishingMechanics.addNets(netCount);
                return `Added ${netCount} nets`;
            
            case 'reset':
                window.gameState.reset();
                return 'Game reset';
            
            case 'universe':
                // Reset and go straight to Universe stage for testing
                window.gameState.reset();
                const state = window.gameState.state;
                
                // Set up for Universe tier
                state.currentTier = 'universe';
                state.universeNumber = 1;
                state.fish = window.gameState.createNumber(1000000); // Give enough fish to test
                
                // Add some universes to multiverse for testing
                state.containers.universes = [
                    { fishPerSecond: 1000 },
                    { fishPerSecond: 2000 },
                    { fishPerSecond: 5000 }
                ];
                
                window.gameState.save();
                return 'Reset to Universe stage with test universes';
            
            case 'save':
                const hash = window.gameState.save();
                return `Game saved with hash: ${hash}`;
            
            case 'export':
                const exportData = window.gameState.exportSave();
                return `Export data: ${exportData.hash}`;
            
            case 'stats':
                return this.getGameStats();
            
            case 'performance':
                return this.getPerformanceStats();
            
            default:
                return `Unknown command: ${cmd}. Type 'help' for available commands.`;
        }
    }

    getDebugHelp() {
        return `Available commands:
- fish: Show current fish value details
- addfish [amount]: Add fish
- setfish [amount]: Set fish count
- addbodies [count]: Add bodies
- settier [tier]: Set current tier
- unlockautobuyers: Unlock all autobuyers
- setspeed [multiplier]: Set fishing speed
- addnets [count]: Add nets
- reset: Reset game
- universe: Reset to Universe stage with test data
- save: Save game
- export: Export save data
- stats: Show game statistics
- performance: Show performance stats
- help: Show this help`;
    }

    addDebugOutput(text) {
        if (!this.elements.debugOutput) return;
        
        const output = document.createElement('div');
        output.textContent = text;
        output.style.marginBottom = '5px';
        
        this.elements.debugOutput.appendChild(output);
        this.elements.debugOutput.scrollTop = this.elements.debugOutput.scrollHeight;
        
        // Limit output lines
        const lines = this.elements.debugOutput.children;
        if (lines.length > 50) {
            this.elements.debugOutput.removeChild(lines[0]);
        }
    }

    getGameStats() {
        const state = window.gameState.state;
        const engine = window.gameEngine;
        
        return `Game Statistics:
Fish: ${window.gameState.formatNumber(state.fish)}
Total Fish Caught: ${window.gameState.formatNumber(state.totalFishCaught)}
Bodies: ${state.bodyCount}
Current Tier: ${state.currentTier}
Tier Count: ${state.tierCount}
Universe: ${state.universeNumber}
Galaxies: ${state.galaxyCount}
Rod Level: ${state.rodLevel}
Net Level: ${state.netLevel}
Nets: ${state.nets.count}
Play Time: ${Math.floor(state.totalTimePlayed / 1000)}s
Tick Count: ${engine.tickCount}`;
    }

    getPerformanceStats() {
        const stats = window.gameEngine.getPerformanceStats();
        
        return `Performance Statistics:
Target Tick Rate: ${stats.targetTickRate} Hz
Actual Tick Rate: ${stats.actualTickRate} Hz
Tick Count: ${stats.tickCount}
Game Time: ${Math.floor(stats.gameTime / 1000)}s
Uptime: ${Math.floor(stats.uptime / 1000)}s
Warnings: ${stats.warnings}`;
    }

    // Utility methods
    showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background-color: #222222;
            color: #ffffff;
            padding: 10px 15px;
            border: 1px solid #444444;
            border-radius: 5px;
            z-index: 1002;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    updateAllUI() {
        this.updateFishDisplay();
        this.updateNetDisplay();
        this.updateInfinityProgress();
        this.updateContainerDisplay();
        this.updateTierDisplay();
        
        // Update upgrade availability
        if (window.progressionSystem) {
            window.progressionSystem.updateUpgradeAvailability();
        }
    }
    
    updateContainersDisplay() {
        const containersList = document.getElementById('containers-list');
        if (!containersList) return;
        
        const state = window.gameState.state;
        
        // Update multiverse heading with multiplier
        const multiverseHeading = document.querySelector('#containers-display h3');
        if (multiverseHeading) {
            const multiplier = state.multiverseMultiplier || 1.0;
            // Always show the heading, but only show multiplier if > 1.0
            if (multiplier > 1.0) {
                // Handle large multipliers safely
                const multiplierRegular = window.gameState.toRegularNumber(window.gameState.toSafeNumber(multiplier));
                const multiplierText = isFinite(multiplierRegular) && multiplierRegular < 1000 
                    ? multiplierRegular.toFixed(2) 
                    : window.gameState.formatNumber(window.gameState.toSafeNumber(multiplier));
                const newHeading = `Multiverse (${multiplierText}x)`;
            if (multiverseHeading.textContent !== newHeading) {
                multiverseHeading.textContent = newHeading;
                }
            } else {
                // Show just "Multiverse" without multiplier
                if (multiverseHeading.textContent !== 'Multiverse') {
                    multiverseHeading.textContent = 'Multiverse';
                }
            }
            multiverseHeading.style.display = 'block';
        }
        
        // Update parallel multiverses display
        const parallelDisplay = document.getElementById('parallel-multiverses-display');
        const parallelCount = document.getElementById('parallel-multiverses-count');
        const parallelizedPropagationFPSDisplay = document.getElementById('parallelized-propagation-fps');
        const parallelizedPropagationFPSValue = document.getElementById('parallelized-propagation-fps-value');
        
        if (parallelDisplay && parallelCount) {
            if (state.parallelMultiverses > 1) {
                parallelDisplay.style.display = 'block';
                const multiplier = window.gameState.getParallelizeMultiplier();
                const multiplierRegular = window.gameState.toRegularNumber(window.gameState.toSafeNumber(multiplier));
                const multiplierText = isFinite(multiplierRegular) && multiplierRegular < 1000 
                    ? multiplierRegular.toFixed(2) 
                    : window.gameState.formatNumber(window.gameState.toSafeNumber(multiplier));
                parallelCount.textContent = `${state.parallelMultiverses} (${multiplierText}x)`;
                
                // Show parallelized propagation FPS if it exists
                if (parallelizedPropagationFPSDisplay && parallelizedPropagationFPSValue) {
                    if (window.gameState.compareNumbers(state.parallelizedPropagationFPS, window.gameState.createNumber(0)) > 0) {
                        parallelizedPropagationFPSDisplay.style.display = 'block';
                        parallelizedPropagationFPSValue.textContent = window.gameState.formatNumber(state.parallelizedPropagationFPS);
                        
                        // Calculate and display fish per tick (FPS / 10 since we run 10 loops per second)
                        const fishPerTickElement = document.getElementById('parallelized-propagation-fish-per-tick');
                        if (fishPerTickElement) {
                            let fishPerTick = window.gameState.divideNumbers(state.parallelizedPropagationFPS, window.gameState.createNumber(10));
                            // Apply parallelize multiplier to match actual fish gained
                            const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
                            fishPerTick = window.gameState.multiplyNumbers(fishPerTick, parallelizeMultiplier);
                            fishPerTickElement.textContent = window.gameState.formatNumber(fishPerTick);
                        }
                    } else {
                        parallelizedPropagationFPSDisplay.style.display = 'none';
                    }
                }
            } else {
                parallelDisplay.style.display = 'none';
            }
        }
        
        // Check if containers data has changed
        const currentDataHash = this.getContainersDataHash(state.containers);
        if (this.lastContainersHash === currentDataHash) {
            return; // No changes, skip re-rendering
        }
        this.lastContainersHash = currentDataHash;
        
        // Clear existing containers
        containersList.innerHTML = '';
        
        // Display all containers
        Object.keys(state.containers).forEach(containerType => {
            const containers = state.containers[containerType];
            if (containers.length > 0) {
                const containerTypeName = containerType.charAt(0).toUpperCase() + containerType.slice(1, -1); // Remove 's'
                
                containers.forEach((container, index) => {
                    const containerItem = document.createElement('div');
                    containerItem.className = 'container-item';
                    
                    // Handle both safe numbers and regular numbers
                    const fpsValue = container.propagatedFPS || container.fishPerSecond;
                    const safeFPS = window.gameState.toSafeNumber(fpsValue);
                    const fishPerSecond = window.gameState.formatNumber(safeFPS);
                    
                    containerItem.innerHTML = `
                        <h4>${containerTypeName} #${index + 1}</h4>
                        <div class="fish-per-second">${fishPerSecond} fish/sec</div>
                    `;
                    
                    containersList.appendChild(containerItem);
                });
            }
        });
    }
    
    getContainersDataHash(containers) {
        // Create a simple hash of the containers data to detect changes
        let hash = '';
        Object.keys(containers).forEach(containerType => {
            hash += containerType + ':' + containers[containerType].length + ';';
            containers[containerType].forEach(container => {
                hash += (container.propagatedFPS || container.fishPerSecond) + ';';
            });
        });
        return hash;
    }
    // ============================================================================
    // VICTORY SEQUENCE SYSTEM
    // ============================================================================
    
    triggerVictorySequence() {
        console.log('🎉 VICTORY! Infinity Fish achieved!');
        
        // Stop the game engine
        if (window.gameEngine) {
            window.gameEngine.stop();
        }
        
        // Start the simple fade transition
        this.startFadeTransition();
        
        // After fade completes, show victory screen
        setTimeout(() => {
            this.showVictoryScreen();
        }, 1200); // Wait for fade to complete
    }
    
    startFadeTransition() {
        // Create the fade overlay
        const fadeOverlay = document.createElement('div');
        fadeOverlay.id = 'fade-overlay';
        fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0a0a0a;
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 1s ease-in-out;
        `;
        
        document.body.appendChild(fadeOverlay);
        
        // Fade in the overlay
        setTimeout(() => {
            fadeOverlay.style.opacity = '1';
        }, 100);
        
        // Keep the overlay until victory screen is ready
        // The victory screen will remove it when it fades in
        this.fadeOverlay = fadeOverlay;
    }
    
    showVictoryScreen() {
        // Remove the fade overlay first
        if (this.fadeOverlay) {
            this.fadeOverlay.remove();
            this.fadeOverlay = null;
        }
        
        // Create victory screen overlay
        const victoryOverlay = document.createElement('div');
        victoryOverlay.id = 'victory-screen';
        victoryOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0a0a0a;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 1s ease-in;
            font-family: 'Courier New', monospace;
        `;
        
        // Create victory content
        const victoryContent = document.createElement('div');
        victoryContent.style.cssText = `
            text-align: center;
        `;
        
        // Victory title
        const title = document.createElement('h1');
        title.textContent = 'CONGRATULATIONS!';
        title.style.cssText = `
            font-size: 3rem;
            color: #4ecdc4;
            margin: 0 0 1rem 0;
            font-family: 'Courier New', monospace;
            animation: victoryTextGlow 2s ease-in-out infinite;
        `;
        
        // Victory message
        const message = document.createElement('h2');
        message.textContent = 'You have achieved INFINITY FISH!';
        message.style.cssText = `
            font-size: 2rem;
            color: #cccccc;
            margin: 0 0 1rem 0;
            font-family: 'Courier New', monospace;
        `;
        
        // Fish count display
        const fishCount = document.createElement('div');
        fishCount.textContent = '69e420 Fish';
        fishCount.style.cssText = `
            font-size: 2.5rem;
            color: #4ecdc4;
            margin: 0 0 2rem 0;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        `;
        
        // Action buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 2rem;
            margin-top: 2rem;
        `;
        
        // Reset game button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.style.cssText = `
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            background: #333333;
            color: #cccccc;
            border: 2px solid #4ecdc4;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            transition: all 0.3s ease;
        `;
        
        // Keep playing button
        const keepPlayingButton = document.createElement('button');
        keepPlayingButton.textContent = 'Keep Playing';
        keepPlayingButton.style.cssText = `
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            background: #333333;
            color: #cccccc;
            border: 2px solid #4ecdc4;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            transition: all 0.3s ease;
        `;
        
        // Add hover effects
        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.background = '#4ecdc4';
            resetButton.style.color = '#0a0a0a';
        });
        
        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.background = '#333333';
            resetButton.style.color = '#cccccc';
        });
        
        keepPlayingButton.addEventListener('mouseenter', () => {
            keepPlayingButton.style.background = '#4ecdc4';
            keepPlayingButton.style.color = '#0a0a0a';
        });
        
        keepPlayingButton.addEventListener('mouseleave', () => {
            keepPlayingButton.style.background = '#333333';
            keepPlayingButton.style.color = '#cccccc';
        });
        
        // Add button functionality
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        keepPlayingButton.addEventListener('click', () => {
            this.keepPlaying();
        });
        
        // Assemble the victory screen
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(keepPlayingButton);
        
        victoryContent.appendChild(title);
        victoryContent.appendChild(message);
        victoryContent.appendChild(fishCount);
        victoryContent.appendChild(buttonContainer);
        
        victoryOverlay.appendChild(victoryContent);
        document.body.appendChild(victoryOverlay);
        
        // Fade in the victory screen
        setTimeout(() => {
            victoryOverlay.style.opacity = '1';
        }, 100);
    }
    
    resetGame() {
        // Reset the game state
        if (window.gameState) {
            window.gameState.reset();
        }
        
        // Reset victory flag
        this.victoryTriggered = false;
        
        // Remove victory screen
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.remove();
        }
        
        // Clean up any remaining fade overlay
        if (this.fadeOverlay) {
            this.fadeOverlay.remove();
            this.fadeOverlay = null;
        }
        
        // Clear purchased upgrades list and restore basic upgrades to general upgrades section
        this.restoreBasicUpgradesAfterReset();
        
        // Restart the game engine
        if (window.gameEngine) {
            window.gameEngine.start();
        }
        
        // Reset UI
        this.update();
    }
    
    restoreBasicUpgradesAfterReset() {
        // Clear the purchased upgrades list
        const purchasedUpgradesList = document.getElementById('purchased-upgrades-list');
        if (purchasedUpgradesList) {
            purchasedUpgradesList.innerHTML = '';
        }
        
        // Recreate the progression system to restore basic upgrades to general upgrades section
        if (window.progressionSystem) {
            // Clear existing general upgrades
            const generalUpgradesSection = document.getElementById('general-upgrades');
            if (generalUpgradesSection) {
                generalUpgradesSection.innerHTML = '';
            }
            
            // Recreate general upgrades (this will add back the basic upgrades)
            window.progressionSystem.createGeneralUpgrades();
            
            // Update upgrade availability
            window.progressionSystem.updateUpgradeAvailability();
        }
    }
    
    keepPlaying() {
        // Remove victory screen
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.remove();
        }
        
        // Clean up any remaining fade overlay
        if (this.fadeOverlay) {
            this.fadeOverlay.remove();
            this.fadeOverlay = null;
        }
        
        // Restart the game engine
        if (window.gameEngine) {
            window.gameEngine.start();
        }
        
        // Reset victory flag so it can trigger again if they reach infinity again
        this.victoryTriggered = false;
    }
}

// Initialize UI manager
window.uiManager = new UIManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
