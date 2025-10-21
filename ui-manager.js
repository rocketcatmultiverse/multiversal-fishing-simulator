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
            "Breaking: Fish have achieved consciousness, demand better working conditions"
        ];
        
        this.currentNewsIndex = 0;
        this.newsUpdateInterval = 5000; // 5 seconds
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
        
        // Calculate progress percentage
        let progress = 0;
        if (window.gameState.compareNumbers(fish, infinityFish) >= 0) {
            progress = 100;
        } else {
            // Calculate progress as percentage
            const fishValue = fish.base * Math.pow(10, fish.exponent);
            const infinityValue = infinityFish.base * Math.pow(10, infinityFish.exponent);
            progress = Math.min((fishValue / infinityValue) * 100, 100);
        }
        
        this.elements.infinityProgressFill.style.width = `${progress}%`;
        
        // Update text
        if (progress >= 100) {
            this.elements.infinityText.textContent = 'INFINITY FISH ACHIEVED!';
            this.elements.infinityText.style.color = '#ff0000';
        } else {
            this.elements.infinityText.textContent = `Progress to Infinity Fish: ${progress.toFixed(2)}%`;
            this.elements.infinityText.style.color = '#cccccc';
        }
    }

    // Container Display
    // Animation methods
    createFishAnimation(amount, element) {
        const animation = document.createElement('div');
        animation.className = 'fish-catch-animation';
        animation.textContent = `+${window.gameState.formatNumber(amount)} Fish`;
        
        // Position relative to the element
        const rect = element.getBoundingClientRect();
        animation.style.left = (rect.left + rect.width / 2) + 'px';
        animation.style.top = (rect.top + rect.height / 2) + 'px';
        
        // Add to body
        document.body.appendChild(animation);
        
        // Remove after animation completes
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 2000);
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
                        <div class="fish-per-second">${window.gameState.formatNumber(window.gameState.createNumber(container.fishPerSecond))} fish/sec</div>
                        ${containerType === 'universes' ? `<button class="crunch-button" onclick="window.gameState.crunchUniverse(${index})">Crunch</button>` : ''}
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
        // Initialize crunch modal
        this.crunchModal = document.getElementById('crunch-modal');
        this.crunchModalClose = document.getElementById('crunch-modal-close');
        this.confirmCrunch = document.getElementById('confirm-crunch');
        this.cancelCrunch = document.getElementById('cancel-crunch');
        this.currentMultiplier = document.getElementById('current-multiplier');
        this.newMultiplier = document.getElementById('new-multiplier');
        this.skipConfirmationCheckbox = document.getElementById('skip-crunch-confirmation');
        
        // Set up event listeners for modal
        this.crunchModalClose.addEventListener('click', () => this.hideCrunchModal());
        this.cancelCrunch.addEventListener('click', () => this.hideCrunchModal());
        this.confirmCrunch.addEventListener('click', () => this.executeCrunch());
        
        // Close modal when clicking outside
        this.crunchModal.addEventListener('click', (e) => {
            if (e.target === this.crunchModal) {
                this.hideCrunchModal();
            }
        });
        
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
                const amount = Math.floor(parseFloat(args[0]) || 100);
                window.gameState.addFish(amount);
                return `Added ${amount} fish`;
            
            case 'setfish':
                const setAmount = Math.floor(parseFloat(args[0]) || 0);
                window.gameState.setFish(setAmount);
                return `Set fish to ${setAmount}`;
            
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
                
                // Add some universes to multiverse for testing crunch
                state.containers.universes = [
                    { fishPerSecond: 1000, timestamp: Date.now() - 60000 },
                    { fishPerSecond: 2000, timestamp: Date.now() - 30000 },
                    { fishPerSecond: 5000, timestamp: Date.now() }
                ];
                
                window.gameState.save();
                return 'Reset to Universe stage with test universes for crunching';
            
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
            const newHeading = `Multiverse (${state.multiverseMultiplier.toFixed(2)}x)`;
            if (multiverseHeading.textContent !== newHeading) {
                multiverseHeading.textContent = newHeading;
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
                    
                    const fishPerSecond = window.gameState.formatNumber(window.gameState.createNumber(container.fishPerSecond));
                    const timestamp = new Date(container.timestamp).toLocaleString();
                    
                    containerItem.innerHTML = `
                        <h4>${containerTypeName} #${index + 1}</h4>
                        <div class="fish-per-second">${fishPerSecond} fish/sec</div>
                        <div class="timestamp">${timestamp}</div>
                        ${containerType === 'universes' ? `<button class="crunch-button" onclick="window.uiManager.showCrunchModal(${index})">Crunch</button>` : ''}
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
                hash += container.fishPerSecond + ',' + container.timestamp + ';';
            });
        });
        return hash;
    }
    
    showCrunchModal(universeIndex) {
        const state = window.gameState.state;
        
        // Check if user has disabled confirmation
        if (state.skipCrunchConfirmation) {
            // Skip modal and crunch directly
            const success = window.gameState.crunchUniverse(universeIndex);
            if (success) {
                this.updateContainersDisplay();
                console.log('Universe crunched! Multiverse multiplier increased.');
            }
            return;
        }
        
        this.selectedUniverseIndex = universeIndex;
        
        // Update multiplier display
        this.currentMultiplier.textContent = `${state.multiverseMultiplier.toFixed(2)}x`;
        this.newMultiplier.textContent = `${(state.multiverseMultiplier + 0.1).toFixed(2)}x`;
        
        // Reset checkbox state
        if (this.skipConfirmationCheckbox) {
            this.skipConfirmationCheckbox.checked = false;
        }
        
        // Show modal
        this.crunchModal.classList.remove('hidden');
    }
    
    hideCrunchModal() {
        this.crunchModal.classList.add('hidden');
        this.selectedUniverseIndex = null;
    }
    
    executeCrunch() {
        if (this.selectedUniverseIndex !== null) {
            // Check if user wants to skip confirmation next time
            if (this.skipConfirmationCheckbox && this.skipConfirmationCheckbox.checked) {
                window.gameState.state.skipCrunchConfirmation = true;
                window.gameState.save();
            }
            
            const success = window.gameState.crunchUniverse(this.selectedUniverseIndex);
            if (success) {
                this.hideCrunchModal();
                this.updateContainersDisplay();
                console.log('Universe crunched! Multiverse multiplier increased.');
            }
        }
    }
}

// Initialize UI manager
window.uiManager = new UIManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
