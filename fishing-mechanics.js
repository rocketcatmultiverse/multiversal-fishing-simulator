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
        this.netAutoCollectProgressBar = document.getElementById('net-auto-collect-progress');
        this.netAutoCollectProgressFill = document.getElementById('net-auto-collect-progress-fill');
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
        const state = window.gameState.state;
        
        // Continue processing if fishing is active OR if there's a queue to process
        if (!state.fishingActive && state.fishingQueue === 0) return;
        
        const baseDuration = state.fishingDuration;
        const speedMultiplier = state.coefficients.fishingSpeedMultiplier;
        
        // Apply bait upgrades (if any) to speed
        const baitMultiplier = window.gameState.toRegularNumber(window.gameState.safePower(1.2, state.localUpgrades.baitLevel)); // 20% faster per bait level
        
        // Apply bait mastery multiplier to speed
        const baitMasteryMultiplier = window.gameState.toRegularNumber(window.gameState.getBaitMasteryMultiplier());
        
        const actualDuration = baseDuration / (speedMultiplier * baitMultiplier * baitMasteryMultiplier);
        
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
            const rodMultiplier = window.gameState.toRegularNumber(window.gameState.safePower(1.5, state.localUpgrades.rodLevel));
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
        
        // Apply fishing mastery multiplier
        const fishingMasteryMultiplier = window.gameState.getFishingMasteryMultiplier();
        fishCaught = window.gameState.multiplyNumbers(fishCaught, fishingMasteryMultiplier);
        
        // Add fractional fish to accumulator using safe numbers
        if (!state.fishingFractionalAccumulator || typeof state.fishingFractionalAccumulator === 'number') {
            state.fishingFractionalAccumulator = window.gameState.createNumber(0);
        }
        
        // Add fish caught to accumulator using safe number operations
        state.fishingFractionalAccumulator = window.gameState.addNumbers(state.fishingFractionalAccumulator, fishCaught);
        
        // Convert accumulated fractional fish to whole fish using safe operations
        const oneFish = window.gameState.createNumber(1);
        if (window.gameState.compareNumbers(state.fishingFractionalAccumulator, oneFish) >= 0) {
            const wholeFishToAdd = window.gameState.safeFloor(state.fishingFractionalAccumulator);
            state.fishingFractionalAccumulator = window.gameState.subtractNumbers(state.fishingFractionalAccumulator, wholeFishToAdd);
            
            if (window.gameState.compareNumbers(wholeFishToAdd, window.gameState.createNumber(0)) > 0) {
                state.fish = window.gameState.addNumbers(state.fish, wholeFishToAdd);
                state.totalFishCaught = window.gameState.addNumbers(state.totalFishCaught, wholeFishToAdd);
                
                // Show fish catch animation with actual fish added
                if (this.fishingButton) {
                    this.createFishAnimation(wholeFishToAdd, this.fishingButton);
                }
            }
        }
        
        // Check if there are more fishing actions in queue
        if (state.fishingQueue > 0) {
            // Start next fishing action
            state.fishingQueue--;
            state.fishingActive = true; // Ensure fishing is active for queue processing
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
        
        // Calculate net capacity with net level scaling using safe numbers
        const baseCapacity = window.gameState.createNumber(100);
        const netLevelMultiplier = window.gameState.safePower(1.2, state.localUpgrades.netLevel);
        const netScaledCapacity = window.gameState.multiplyNumbers(baseCapacity, netLevelMultiplier);
        
        // Apply net mastery multiplier to capacity
        const netMasteryMultiplier = window.gameState.getNetMasteryMultiplier();
        const netMasteryScaledCapacity = window.gameState.multiplyNumbers(netScaledCapacity, netMasteryMultiplier);
        
        // Calculate fish generation with net level scaling using safe numbers
        const baseFishPerSecond = window.gameState.createNumber(state.nets.count * state.coefficients.netCapacityMultiplier);
        const netScaledFishPerSecond = window.gameState.multiplyNumbers(baseFishPerSecond, netLevelMultiplier);
        
        // Apply net mastery multiplier to fish generation speed
        const netMasteryScaledFishPerSecond = window.gameState.multiplyNumbers(netScaledFishPerSecond, netMasteryMultiplier);
        
        // Apply tier multipliers using safe numbers
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const tierScaledCapacity = window.gameState.multiplyNumbers(netMasteryScaledCapacity, tierMultiplier);
        const tierScaledFishPerSecond = window.gameState.multiplyNumbers(netMasteryScaledFishPerSecond, tierMultiplier);
        
        // Calculate fish generated using safe numbers
        const fishGenerated = window.gameState.multiplyNumbers(tierScaledFishPerSecond, window.gameState.createNumber(deltaTime / 1000));
        
        // Check if nets are at capacity using safe numbers
        const isAtCapacity = window.gameState.compareNumbers(state.nets.fish, tierScaledCapacity) >= 0;
        
        // Only generate fish if nets aren't at capacity AND auto-collect timer is not active
        if (!isAtCapacity && !state.netAutoCollectActive) {
            // Add fractional fish to accumulator using safe numbers
            if (!state.nets.fractionalAccumulator) {
                state.nets.fractionalAccumulator = window.gameState.createNumber(0);
            }
            
            const fishGeneratedSafe = window.gameState.toSafeNumber(fishGenerated);
            state.nets.fractionalAccumulator = window.gameState.addNumbers(state.nets.fractionalAccumulator, fishGeneratedSafe);
            
            // Convert accumulated fractional fish to whole fish
            const wholeFishToAdd = window.gameState.safeFloor(state.nets.fractionalAccumulator);
            if (window.gameState.compareNumbers(wholeFishToAdd, window.gameState.createNumber(0)) > 0) {
                // Ensure we don't exceed net capacity
                const currentFish = window.gameState.toSafeNumber(state.nets.fish);
                const capacity = window.gameState.toSafeNumber(tierScaledCapacity);
                const availableCapacity = window.gameState.subtractNumbers(capacity, currentFish);
                const fishToActuallyAdd = window.gameState.safeMin(wholeFishToAdd, availableCapacity);
                
                if (window.gameState.compareNumbers(fishToActuallyAdd, window.gameState.createNumber(0)) > 0) {
                    state.nets.fish = window.gameState.addNumbers(state.nets.fish, fishToActuallyAdd);
                    state.nets.fractionalAccumulator = window.gameState.subtractNumbers(state.nets.fractionalAccumulator, fishToActuallyAdd);
                }
            }
        }
        
        // Handle auto-collect timer system
        if (state.generalUpgrades.autoCollectNets && window.gameState.compareNumbers(state.nets.fish, tierScaledCapacity) >= 0) {
            const currentInterval = window.gameState.getCurrentNetAutoCollectInterval();
            
            if (currentInterval === 0) {
                // Instant collection for 0s interval
                state.nets.fish = window.gameState.safeMin(state.nets.fish, tierScaledCapacity);
                this.collectNets();
            } else {
                // Timer-based collection for intervals > 0s
                if (!state.netAutoCollectActive) {
                    // Start the timer when nets reach capacity
                    state.netAutoCollectActive = true;
                    state.netAutoCollectTimer = currentInterval;
                } else {
                    // Update timer
                    state.netAutoCollectTimer -= deltaTime / 1000; // Convert to seconds
                    
                    // If timer reaches 0, collect immediately
                    if (state.netAutoCollectTimer <= 0) {
                        state.nets.fish = window.gameState.safeMin(state.nets.fish, tierScaledCapacity);
                        this.collectNets();
                        state.netAutoCollectActive = false;
                        state.netAutoCollectTimer = 0;
                    }
                }
            }
        } else if (state.netAutoCollectActive && window.gameState.compareNumbers(state.nets.fish, tierScaledCapacity) < 0) {
            // Reset timer if nets are no longer at capacity
            state.netAutoCollectActive = false;
            state.netAutoCollectTimer = 0;
        }
        
        this.updateNetUI();
    }

    updateNetAutoCollectProgressBar() {
        if (!this.netAutoCollectProgressBar || !this.netAutoCollectProgressFill) return;
        
        const state = window.gameState.state;
        
        if (!state.netAutoCollectActive) {
            this.netAutoCollectProgressBar.classList.add('hidden');
            return;
        }
        
        this.netAutoCollectProgressBar.classList.remove('hidden');
        
        const currentInterval = window.gameState.getCurrentNetAutoCollectInterval();
        if (currentInterval > 0) {
            const progress = ((currentInterval - state.netAutoCollectTimer) / currentInterval) * 100;
            this.netAutoCollectProgressFill.style.width = `${Math.min(progress, 100)}%`;
        } else {
            this.netAutoCollectProgressFill.style.width = '100%';
        }
    }

    collectNets() {
        const state = window.gameState.state;
        
        if (window.gameState.compareNumbers(state.nets.fish, window.gameState.createNumber(0)) <= 0) return;
        
        // Add net fish to total using safe numbers
        const fishToAdd = window.gameState.toSafeNumber(state.nets.fish);
        state.fish = window.gameState.addNumbers(state.fish, fishToAdd);
        state.totalFishCaught = window.gameState.addNumbers(state.totalFishCaught, fishToAdd);
        
        // Show net collection animation
        if (this.netButton) {
            this.createFishAnimation(fishToAdd, this.netButton);
        }
        
        console.log(`Collected ${window.gameState.formatNumber(state.nets.fish)} fish from nets!`);
        
        // Reset net fish
        state.nets.fish = window.gameState.createNumber(0);
        
        // Reset auto-collect timer if it was active
        if (state.netAutoCollectActive) {
            state.netAutoCollectActive = false;
            state.netAutoCollectTimer = 0;
        }
        
        this.updateNetUI();
    }

    // UI Updates
    // Animation methods
    createFishAnimation(amount, element) {
        const animation = document.createElement('div');
        animation.className = 'fish-catch-animation';
        animation.textContent = `+${window.gameState.formatNumber(amount)} Fish`;
        
        // Position to the right of the element
        const rect = element.getBoundingClientRect();
        animation.style.left = (rect.right + 10) + 'px'; // 10px to the right of the button
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

    updateUI() {
        this.updateFishingButton();
        this.updateNetUI();
    }

    updateFishingButton() {
        if (!this.fishingButton) return;
        
        const state = window.gameState.state;
        
        if (state.fishingActive || state.fishingQueue > 0) {
            this.fishingButton.disabled = true;
            const queueText = state.fishingQueue > 0 ? ` (${state.fishingQueue + (state.fishingActive ? 1 : 0)} left)` : '';
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
        const baitMultiplier = window.gameState.toRegularNumber(window.gameState.safePower(1.2, state.localUpgrades.baitLevel));
        
        // Apply bait mastery multiplier to speed for progress bar
        const baitMasteryMultiplier = window.gameState.toRegularNumber(window.gameState.getBaitMasteryMultiplier());
        
        const actualDuration = baseDuration / (speedMultiplier * baitMultiplier * baitMasteryMultiplier);
        
        const progress = Math.min((state.fishingProgress / actualDuration) * 100, 100);
        this.fishingProgressFill.style.width = `${progress}%`;
    }

    updateNetUI() {
        if (!this.netButton || !this.netProgressFill) return;
        
        const state = window.gameState.state;
        
        // Calculate net-scaled and tier-scaled capacity for UI using safe numbers
        const baseCapacity = window.gameState.createNumber(100);
        const netLevelMultiplier = window.gameState.safePower(1.2, state.localUpgrades.netLevel);
        const netScaledCapacity = window.gameState.multiplyNumbers(baseCapacity, netLevelMultiplier);
        
        // Apply net mastery multiplier to capacity for UI
        const netMasteryMultiplier = window.gameState.getNetMasteryMultiplier();
        const netMasteryScaledCapacity = window.gameState.multiplyNumbers(netScaledCapacity, netMasteryMultiplier);
        
        // Apply tier multipliers using safe numbers
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const tierScaledCapacity = window.gameState.multiplyNumbers(netMasteryScaledCapacity, tierMultiplier);
        
        // Update net button text with formatted numbers using safe numbers
        const fishFormatted = window.gameState.formatNumber(window.gameState.safeFloor(state.nets.fish));
        const capacityFormatted = window.gameState.formatNumber(window.gameState.safeFloor(tierScaledCapacity));
        
        // Update button text based on auto-collect state
        if (state.generalUpgrades.autoCollectNets && state.netAutoCollectActive) {
            const timeLeft = state.netAutoCollectTimer.toFixed(1);
            this.netButton.textContent = `Auto-collecting... (${timeLeft}s left)`;
        } else {
            this.netButton.textContent = `Collect Nets (${fishFormatted}/${capacityFormatted})`;
        }
        
        // Update net progress bar
        if (state.generalUpgrades.autoCollectNets && state.netAutoCollectActive) {
            // Show timer progress instead of fish progress
            const currentInterval = window.gameState.getCurrentNetAutoCollectInterval();
            const timerProgress = currentInterval > 0 ? ((currentInterval - state.netAutoCollectTimer) / currentInterval) * 100 : 100;
            this.netProgressFill.style.width = `${Math.min(timerProgress, 100)}%`;
        } else {
            // Show fish progress
            const progress = (state.nets.fish / tierScaledCapacity) * 100;
            this.netProgressFill.style.width = `${progress}%`;
        }
        
        // Enable/disable button based on fish available (allow manual collection during auto-collect)
        this.netButton.disabled = state.nets.fish <= 0;
        
        // Update auto-collect progress bar overlay
        this.updateNetAutoCollectProgressBar();
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
