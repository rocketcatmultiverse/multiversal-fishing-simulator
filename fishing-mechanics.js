/**
 * Multiversal Fishing Simulator - Fishing Mechanics
 * Handles fishing, rods, nets, and related mechanics
 */

class FishingMechanics {
    constructor() {
        this.fishingButton = null;
        this.netButton = null;
        this.fishingProgressBar = null;
        this.netProgressBar = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.fishingButton = document.getElementById('catch-fish-btn');
        this.netButton = document.getElementById('collect-nets-btn');
        this.fishingProgressBar = document.getElementById('fishing-progress');
        this.fishingProgressFill = document.getElementById('fishing-progress-fill');
        this.netProgressBar = document.getElementById('net-progress');
        this.netProgressFill = document.getElementById('net-progress-fill');
    }

    setupEventListeners() {
        if (this.fishingButton) {
            this.fishingButton.addEventListener('click', () => this.startFishing());
        }
        
        if (this.netButton) {
            this.netButton.addEventListener('click', () => this.collectNets());
        }
    }

    update(deltaTime) {
        this.updateFishing(deltaTime);
        this.updateNets(deltaTime);
        this.updateUI();
    }

    // Fishing mechanics
    startFishing() {
        const state = window.gameState.state;
        
        // If already fishing, add to queue instead
        if (state.fishingActive) {
            state.fishingQueue += state.generalUpgrades.catchFishMultiplier;
            this.updateFishingButton();
            return;
        }
        
        // Start fishing with multiplier
        state.fishingActive = true;
        state.fishingProgress = 0;
        state.fishingQueue = state.generalUpgrades.catchFishMultiplier - 1; // -1 because we're starting one now
        
        this.updateFishingButton();
        this.updateFishingProgressBar();
    }

    updateFishing(deltaTime) {
        if (!window.gameState.state.fishingActive) return;
        
        const state = window.gameState.state;
        const baseDuration = state.fishingDuration;
        const speedMultiplier = state.coefficients.fishingSpeedMultiplier;
        
        // Apply bait upgrades (if any) to speed
        const baitMultiplier = Math.pow(1.1, state.localUpgrades.baitLevel); // 10% faster per bait level
        const actualDuration = baseDuration / (speedMultiplier * baitMultiplier);
        
        state.fishingProgress += deltaTime;
        
        if (state.fishingProgress >= actualDuration) {
            this.completeFishing();
        }
        
        this.updateFishingProgressBar();
    }

    completeFishing() {
        const state = window.gameState.state;
        
        // Calculate fish caught using base/exponent system
        let fishCaught = window.gameState.createNumber(1);
        
        // Apply local rod upgrades
        if (state.localUpgrades.rodLevel > 0) {
            const rodMultiplier = Math.pow(1.5, state.localUpgrades.rodLevel);
            fishCaught = window.gameState.multiplyNumbers(fishCaught, window.gameState.createNumber(rodMultiplier));
        }
        
        // Apply tier multipliers
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const tierMultiplier = tierMultipliers[state.currentTier] || 1;
        fishCaught = window.gameState.multiplyNumbers(fishCaught, window.gameState.createNumber(tierMultiplier));
        
        // Apply catch fish multiplier
        fishCaught = window.gameState.multiplyNumbers(fishCaught, window.gameState.createNumber(state.generalUpgrades.catchFishMultiplier));
        
        // Ensure fish caught is always a whole number
        fishCaught.base = Math.floor(fishCaught.base);
        
        // Add fish to total
        state.fish = window.gameState.addNumbers(state.fish, fishCaught);
        state.totalFishCaught = window.gameState.addNumbers(state.totalFishCaught, fishCaught);
        
        // Show fish catch animation
        if (this.fishingButton) {
            this.createFishAnimation(fishCaught, this.fishingButton);
        }
        
        // Check if there are more fishing actions in queue
        if (state.fishingQueue > 0) {
            // Start next fishing action
            state.fishingQueue--;
            state.fishingProgress = 0;
            console.log(`Caught ${window.gameState.formatNumber(fishCaught)} fish! ${state.fishingQueue} more actions queued.`);
        } else {
            // No more actions, stop fishing
            state.fishingActive = false;
            state.fishingProgress = 0;
            console.log(`Caught ${window.gameState.formatNumber(fishCaught)} fish!`);
        }
        
        this.updateFishingButton();
        this.updateFishingProgressBar();
    }

    // Net mechanics
    updateNets(deltaTime) {
        const state = window.gameState.state;
        
        if (state.nets.count === 0) return;
        
        // Calculate net capacity with net level scaling
        const baseCapacity = 100;
        const netScaledCapacity = baseCapacity * Math.pow(1.2, state.localUpgrades.netLevel);
        
        // Calculate fish generation with net level scaling
        const baseFishPerSecond = state.nets.count * state.coefficients.netCapacityMultiplier;
        const netScaledFishPerSecond = baseFishPerSecond * Math.pow(1.2, state.localUpgrades.netLevel);
        
        // Apply tier multipliers
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const tierMultiplier = tierMultipliers[state.currentTier] || 1;
        const tierScaledFishPerSecond = netScaledFishPerSecond * tierMultiplier;
        const tierScaledCapacity = netScaledCapacity * tierMultiplier;
        const fishGenerated = (tierScaledFishPerSecond * deltaTime) / 1000;
        
        // Add fractional fish to accumulator
        if (!state.nets.fractionalAccumulator) {
            state.nets.fractionalAccumulator = 0;
        }
        state.nets.fractionalAccumulator += fishGenerated;
        
        // Convert accumulated fractional fish to whole fish
        const wholeFishToAdd = Math.floor(state.nets.fractionalAccumulator);
        if (wholeFishToAdd > 0) {
            state.nets.fish += wholeFishToAdd;
            state.nets.fractionalAccumulator -= wholeFishToAdd;
        }
        
        // Auto-retrieve when limit is reached
        if (state.nets.fish >= tierScaledCapacity) {
            state.nets.fish = Math.min(state.nets.fish, tierScaledCapacity);
            this.collectNets();
        }
        
        this.updateNetUI();
    }

    collectNets() {
        const state = window.gameState.state;
        
        if (state.nets.fish <= 0) return;
        
        // Add net fish to total
        const fishToAdd = window.gameState.createNumber(state.nets.fish);
        state.fish = window.gameState.addNumbers(state.fish, fishToAdd);
        state.totalFishCaught = window.gameState.addNumbers(state.totalFishCaught, fishToAdd);
        
        // Show net collection animation
        if (this.netButton) {
            this.createFishAnimation(fishToAdd, this.netButton);
        }
        
        console.log(`Collected ${state.nets.fish} fish from nets!`);
        
        // Reset net fish
        state.nets.fish = 0;
        
        this.updateNetUI();
    }

    // UI Updates
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

    updateUI() {
        this.updateFishingButton();
        this.updateNetUI();
    }

    updateFishingButton() {
        if (!this.fishingButton) return;
        
        const state = window.gameState.state;
        
        if (state.fishingActive) {
            this.fishingButton.disabled = true;
            const queueText = state.fishingQueue > 0 ? ` (${state.fishingQueue + 1} left)` : '';
            this.fishingButton.textContent = `Fishing...${queueText}`;
            this.fishingProgressBar.classList.remove('hidden');
        } else {
            this.fishingButton.disabled = false;
            const multiplier = state.generalUpgrades.catchFishMultiplier;
            this.fishingButton.textContent = multiplier > 1 ? `Catch Fish (x${multiplier})` : 'Catch Fish';
            this.fishingProgressBar.classList.add('hidden');
        }
    }

    updateFishingProgressBar() {
        if (!this.fishingProgressFill) return;
        
        const state = window.gameState.state;
        
        if (!state.fishingActive) {
            this.fishingProgressFill.style.width = '0%';
            return;
        }
        
        const baseDuration = state.fishingDuration;
        const speedMultiplier = state.coefficients.fishingSpeedMultiplier;
        const baitMultiplier = Math.pow(1.1, state.localUpgrades.baitLevel);
        const actualDuration = baseDuration / (speedMultiplier * baitMultiplier);
        
        const progress = Math.min((state.fishingProgress / actualDuration) * 100, 100);
        this.fishingProgressFill.style.width = `${progress}%`;
    }

    updateNetUI() {
        if (!this.netButton || !this.netProgressFill) return;
        
        const state = window.gameState.state;
        
        // Calculate net-scaled and tier-scaled capacity for UI
        const baseCapacity = 100;
        const netScaledCapacity = baseCapacity * Math.pow(1.2, state.localUpgrades.netLevel);
        
        // Apply tier multipliers (same as fishing)
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const tierMultiplier = tierMultipliers[state.currentTier] || 1;
        const tierScaledCapacity = netScaledCapacity * tierMultiplier;
        
        // Update net button text with formatted numbers
        const fishFormatted = window.gameState.formatNumber(window.gameState.createNumber(Math.floor(state.nets.fish)));
        const capacityFormatted = window.gameState.formatNumber(window.gameState.createNumber(Math.floor(tierScaledCapacity)));
        this.netButton.textContent = `Collect Nets (${fishFormatted}/${capacityFormatted})`;
        
        // Update net progress bar using tier-scaled capacity
        const progress = (state.nets.fish / tierScaledCapacity) * 100;
        this.netProgressFill.style.width = `${progress}%`;
        
        // Enable/disable button based on fish available
        this.netButton.disabled = state.nets.fish <= 0;
    }

    // Debug methods
    setFishingSpeed(multiplier) {
        window.gameState.state.coefficients.fishingSpeedMultiplier = multiplier;
    }

    addNets(count) {
        window.gameState.state.nets.count += count;
    }

    setNetCapacity(capacity) {
        window.gameState.state.nets.maxFish = capacity;
    }
}

// Initialize fishing mechanics
window.fishingMechanics = new FishingMechanics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FishingMechanics;
}
