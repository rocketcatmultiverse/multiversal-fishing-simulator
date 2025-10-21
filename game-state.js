/**
 * Multiversal Fishing Simulator - Game State Management
 * Handles save/load, persistence, and core game state
 */

class GameState {
    constructor() {
        this.state = {
            // Core resources
            fish: { base: 0, exponent: 0 }, // Use base/exponent for large numbers
            fishPerSecond: 0,
            
            // Fishing mechanics
            fishingActive: false,
            fishingProgress: 0,
            fishingDuration: 1000, // milliseconds
            catchFishMultiplier: 1, // x1, x5, x10, x20, etc.
            fishingQueue: 0, // Number of fishing actions queued
            containerFishAccumulator: 0, // Accumulates fractional fish from containers
            containerTickCounter: 0, // Counter for 10-tick intervals
            
            // Net mechanics
            nets: { count: 0, capacity: 20, fish: 0, maxFish: 200, fractionalAccumulator: 0 },
            autoCollectNets: false,
            
            // Local upgrades (apply to current tier only)
            localUpgrades: {
                rodLevel: 0, // 0-9 (10 levels)
                netLevel: 0, // 0-9 (10 levels)
                baitLevel: 0 // 0-9 (10 levels)
            },
            
            // General upgrades (persist across tiers)
            generalUpgrades: {
                catchFishMultiplier: 1, // x1, x5, x10, x20, etc.
                autoCollectNets: false
            },
            
            // Progression system
            currentTier: 'pond', // pond, lake, ocean, planet, solar, galaxy, universe
            tierCount: 1,
            universeNumber: 1,
            
            // Container system for previous tiers
            containers: {
                ponds: [], // Array of {fishPerSecond: number, timestamp: number}
                lakes: [],
                oceans: [],
                planets: [],
                solar: [],
                galaxies: [],
                universes: []
            },
            
            // Autobuyers
            autobuyers: {
                rods: false,
                nets: false,
                bait: false,
                multiply: false,
                ascend: false
            },
            
            // Statistics
            totalFishCaught: { base: 0, exponent: 0 },
            totalTimePlayed: 0,
            lastSaveTime: Date.now(),
            
            // Coefficients for balancing
            coefficients: {
                rodCostMultiplier: 2.0,
                netCostMultiplier: 3.0,
                baitCostMultiplier: 2.5,
                multiplyCostMultiplier: 15.0,
                ascendCostMultiplier: 100.0,
                fishingSpeedMultiplier: 1.0,
                netCapacityMultiplier: 2.0,
                tierCostMultiplier: 10.0
            }
        };
        
        this.cookieName = 'mfs_save';
        this.autoSaveInterval = 30000; // 30 seconds
        this.lastAutoSave = 0;
        
        this.load();
    }

    // Number handling for large numbers
    createNumber(base, exponent = 0) {
        return this.normalizeNumber({ base: base, exponent: exponent });
    }

    normalizeNumber(num) {
        if (num.base === 0 || Math.abs(num.base) < 1e-15) {
            return { base: 0, exponent: 0 };
        }
        
        let base = num.base;
        let exponent = num.exponent;
        
        // Normalize base to be between 1 and 10
        while (base >= 10) {
            base /= 10;
            exponent += 1;
        }
        while (base < 1 && base > 1e-15) {
            base *= 10;
            exponent -= 1;
        }
        
        // Handle very small numbers (effectively zero)
        if (Math.abs(base) < 1e-15 || exponent < -15) {
            return { base: 0, exponent: 0 };
        }
        
        return { base: base, exponent: exponent };
    }

    addNumbers(a, b) {
        // Handle zero cases
        if (a.base === 0 || Math.abs(a.base) < 1e-15) return b;
        if (b.base === 0 || Math.abs(b.base) < 1e-15) return a;
        
        if (a.exponent === b.exponent) {
            const result = { base: a.base + b.base, exponent: a.exponent };
            return this.normalizeNumber(result);
        }
        
        const diff = Math.abs(a.exponent - b.exponent);
        if (diff > 15) {
            // If difference is too large, return the larger number
            return a.exponent > b.exponent ? a : b;
        }
        
        let result;
        if (a.exponent > b.exponent) {
            const multiplier = Math.pow(10, a.exponent - b.exponent);
            result = { base: a.base + b.base / multiplier, exponent: a.exponent };
        } else {
            const multiplier = Math.pow(10, b.exponent - a.exponent);
            result = { base: a.base / multiplier + b.base, exponent: b.exponent };
        }
        
        return this.normalizeNumber(result);
    }

    subtractNumbers(a, b) {
        const negB = { base: -b.base, exponent: b.exponent };
        const result = this.addNumbers(a, negB);
        
        // Ensure result is not negative (fish can't go below zero)
        if (result.base < 0) {
            return { base: 0, exponent: 0 };
        }
        
        return result;
    }

    multiplyNumbers(a, b) {
        const result = { 
            base: a.base * b.base, 
            exponent: a.exponent + b.exponent 
        };
        return this.normalizeNumber(result);
    }

    divideNumbers(a, b) {
        const result = { 
            base: a.base / b.base, 
            exponent: a.exponent - b.exponent 
        };
        return this.normalizeNumber(result);
    }

    compareNumbers(a, b, tolerance = 1e-10) {
        if (a.exponent !== b.exponent) {
            return a.exponent - b.exponent;
        }
        const diff = a.base - b.base;
        // If the difference is very small, consider them equal
        if (Math.abs(diff) < tolerance) {
            return 0;
        }
        return diff;
    }

    formatNumber(num) {
        // Normalize the number to base/exponent form
        let base = num.base;
        let exponent = num.exponent;
        
        // Debug logging for large numbers
        if (exponent > 6) {
            console.log(`formatNumber: base=${base}, exponent=${exponent}`);
        }
        
        // Handle zero case first
        if (base === 0 || Math.abs(base) < 1e-15) {
            return "0";
        }
        
        // Normalize base to be between 1 and 10
        while (base >= 10) {
            base /= 10;
            exponent += 1;
        }
        while (base < 1 && base > 1e-15) {
            base *= 10;
            exponent -= 1;
        }
        
        // Handle very small numbers (effectively zero)
        if (Math.abs(base) < 1e-15 || exponent < -15) {
            return "0";
        }
        
        // For numbers that fit in standard notation
        if (exponent === 0) {
            return Math.floor(base).toLocaleString();
        }
        
        // Use scientific notation for very large numbers (septillion and above)
        if (exponent >= 24) {
            return `${Math.floor(base * 100) / 100}e${exponent}`;
        }
        
        // Use standard notation with suffixes for intermediate values
        const suffixes = [
            '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Novg', 'Tg', 'Utg', 'Dtg', 'Ttg', 'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Octg', 'Notg', 'Qd', 'Uqd', 'Dqd', 'Tqd', 'Qaqd', 'Qiqd', 'Sxqd', 'Spqd', 'Ocqd', 'Noqd'
        ];
        
        const suffixIndex = Math.floor(exponent / 3);
        
        if (suffixIndex < suffixes.length) {
            const displayExponent = exponent % 3;
            const displayValue = base * Math.pow(10, displayExponent);
            
            // Round to avoid floating-point precision issues
            const roundedValue = Math.round(displayValue * 100) / 100;
            
            if (roundedValue >= 1000) {
                // For 1000+, show with decimals (e.g., 1.25K, 2.50K)
                return `${(roundedValue / 1000).toFixed(2)}${suffixes[suffixIndex + 1]}`;
            } else if (roundedValue >= 100) {
                // For 100-999, show whole number (e.g., 100K, 250K)
                return `${Math.floor(roundedValue)}${suffixes[suffixIndex]}`;
            } else if (roundedValue >= 10) {
                // For 10-99, show whole number (e.g., 10K, 25K)
                return `${Math.floor(roundedValue)}${suffixes[suffixIndex]}`;
            } else if (roundedValue >= 1) {
                // For 1-9, show whole number (e.g., 1K, 2K)
                return `${Math.floor(roundedValue)}${suffixes[suffixIndex]}`;
            } else {
                // For < 1, show 0
                return "0";
            }
        }
        
        // Fallback to scientific notation
        return `${Math.floor(base * 100) / 100}e${exponent}`;
    }

    // Save/Load system
    save() {
        try {
            const saveData = {
                state: this.state,
                version: '1.0.0',
                timestamp: Date.now()
            };
            
            const saveString = JSON.stringify(saveData);
            const hash = this.hashString(saveString);
            
            // Store in cookie
            document.cookie = `${this.cookieName}=${hash}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
            
            // Also store the full data in localStorage for debugging
            localStorage.setItem(`${this.cookieName}_full`, saveString);
            
            this.state.lastSaveTime = Date.now();
            console.log('Game saved successfully');
            return hash;
        } catch (error) {
            console.error('Failed to save game:', error);
            return null;
        }
    }

    load() {
        try {
            // Try to load from cookie first
            const cookieValue = this.getCookie(this.cookieName);
            if (cookieValue) {
                // For now, load from localStorage (in production, would verify hash)
                const fullData = localStorage.getItem(`${this.cookieName}_full`);
                if (fullData) {
                    const saveData = JSON.parse(fullData);
                    this.state = { ...this.state, ...saveData.state };
                    console.log('Game loaded successfully');
                    return true;
                }
            }
            
            console.log('No save data found, starting new game');
            return false;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    autoSave() {
        const now = Date.now();
        if (now - this.lastAutoSave >= this.autoSaveInterval) {
            this.save();
            this.lastAutoSave = now;
        }
    }

    exportSave() {
        const saveData = {
            state: this.state,
            version: '1.0.0',
            timestamp: Date.now()
        };
        
        const saveString = JSON.stringify(saveData);
        const hash = this.hashString(saveString);
        
        return {
            hash: hash,
            data: saveString,
            timestamp: Date.now()
        };
    }

    importSave(saveString) {
        try {
            const saveData = JSON.parse(saveString);
            this.state = { ...this.state, ...saveData.state };
            this.save();
            console.log('Game imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }

    // Utility methods
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Game state updates
    update(deltaTime) {
        this.state.totalTimePlayed += deltaTime;
        
        // Update fish per second calculation
        this.calculateFishPerSecond();
        
        // Add fish from containers to player's fish
        this.addFishFromContainers(deltaTime);
        
        // Auto-save check
        this.autoSave();
    }

    addFishFromContainers(deltaTime) {
        // Increment tick counter
        this.state.containerTickCounter++;
        
        // Only add fish every 10 ticks (once per second)
        if (this.state.containerTickCounter >= 10) {
            this.state.containerTickCounter = 0;
            
            // Calculate total fish per second from all containers
            let totalFPS = 0;
            
            Object.keys(this.state.containers).forEach(containerType => {
                this.state.containers[containerType].forEach(container => {
                    totalFPS += container.fishPerSecond;
                });
            });
            
            // Apply multiverse multiplier
            totalFPS *= this.state.multiverseMultiplier;
            
            // Add fish per second to accumulator
            if (totalFPS > 0) {
                this.state.containerFishAccumulator += totalFPS;
                
                // Add whole fish when accumulator reaches 1 or more
                if (this.state.containerFishAccumulator >= 1) {
                    const wholeFishToAdd = Math.floor(this.state.containerFishAccumulator);
                    this.state.containerFishAccumulator -= wholeFishToAdd; // Keep the remainder
                    
                    if (wholeFishToAdd > 0) {
                        const fishToAddNumber = window.gameState.createNumber(wholeFishToAdd);
                        this.state.fish = window.gameState.addNumbers(this.state.fish, fishToAddNumber);
                        this.state.totalFishCaught = window.gameState.addNumbers(this.state.totalFishCaught, fishToAddNumber);
                        
                        // Show container fish animation
                        if (window.uiManager && window.uiManager.createFishAnimation) {
                            const containersDisplay = document.getElementById('containers-display');
                            if (containersDisplay) {
                                window.uiManager.createFishAnimation(fishToAddNumber, containersDisplay);
                            }
                        }
                    }
                }
            }
        }
    }

    calculateFishPerSecond() {
        // Calculate fish per second from current nets
        let fps = 0;
        
        // Net fish generation
        if (this.state.nets.count > 0) {
            fps += this.state.nets.count * this.state.coefficients.netCapacityMultiplier;
        }
        
        // Add fish per second from containers
        const tierMultipliers = {
            'pond': 1,
            'lake': 10,
            'ocean': 100,
            'planet': 1000,
            'solar': 10000,
            'galaxy': 100000,
            'universe': 1000000
        };
        
        const currentTierMultiplier = tierMultipliers[this.state.currentTier] || 1;
        
        // Add container contributions
        Object.keys(this.state.containers).forEach(containerType => {
            this.state.containers[containerType].forEach(container => {
                fps += container.fishPerSecond;
            });
        });
        
        this.state.fishPerSecond = fps * currentTierMultiplier;
    }

    // Debug methods
    reset() {
        this.state = {
            fish: { base: 0, exponent: 0 },
            fishPerSecond: 0,
            fishingActive: false,
            fishingProgress: 0,
            fishingDuration: 1000,
            catchFishMultiplier: 1,
            fishingQueue: 0,
            containerFishAccumulator: 0,
            containerTickCounter: 0,
            nets: { count: 0, capacity: 20, fish: 0, maxFish: 200, fractionalAccumulator: 0 },
            autoCollectNets: false,
            localUpgrades: {
                rodLevel: 0,
                netLevel: 0,
                baitLevel: 0
            },
            generalUpgrades: {
                catchFishMultiplier: 1,
                autoCollectNets: false
            },
            currentTier: 'pond',
            tierCount: 1,
            universeNumber: 1,
            containers: {
                ponds: [],
                lakes: [],
                oceans: [],
                planets: [],
                solar: [],
                galaxies: [],
                universes: []
            },
            multiverseMultiplier: 1.0,
            skipCrunchConfirmation: false, // Skip confirmation dialog for crunching
            autobuyers: {
                rods: false,
                nets: false,
                bait: false,
                multiply: false,
                ascend: false
            },
            totalFishCaught: { base: 0, exponent: 0 },
            totalTimePlayed: 0,
            lastSaveTime: Date.now(),
            coefficients: {
                rodCostMultiplier: 2.0,
                netCostMultiplier: 3.0,
                baitCostMultiplier: 2.5,
                multiplyCostMultiplier: 15.0,
                ascendCostMultiplier: 100.0,
                fishingSpeedMultiplier: 1.0,
                netCapacityMultiplier: 2.0,
                tierCostMultiplier: 10.0
            }
        };
        this.save();
    }

    // Console commands for debugging
    addFish(amount) {
        const wholeAmount = Math.floor(amount);
        this.state.fish = this.addNumbers(this.state.fish, this.createNumber(wholeAmount));
        this.save();
    }

    setFish(amount) {
        const wholeAmount = Math.floor(amount);
        this.state.fish = this.createNumber(wholeAmount);
        this.save();
    }

    jumpToTier(tier) {
        this.state.currentTier = tier;
        this.state.tierCount = 1;
        this.save();
    }

    // New mechanics for multiply and ascend
    multiply() {
        // Calculate current fish per second from nets and add to container
        const currentFPS = this.calculateCurrentFPS();
        const containerEntry = {
            fishPerSecond: currentFPS,
            timestamp: Date.now()
        };
        
        // Map tier names to container keys
        const tierToContainerKey = {
            'pond': 'ponds',
            'lake': 'lakes', 
            'ocean': 'oceans',
            'planet': 'planets',
            'solar': 'solar',
            'galaxy': 'galaxies',
            'universe': 'universes'
        };
        
        const containerKey = tierToContainerKey[this.state.currentTier];
        if (containerKey) {
            this.state.containers[containerKey].push(containerEntry);
        }
        
        // Reset current tier progress
        this.resetCurrentTier();
        
        this.save();
        return true;
    }

    ascend() {
        // Aggregate all containers into the next tier
        const tiers = ['pond', 'lake', 'ocean', 'planet', 'solar', 'galaxy', 'universe'];
        const currentIndex = tiers.indexOf(this.state.currentTier);
        
        if (currentIndex < tiers.length - 1) {
            const nextTier = tiers[currentIndex + 1];
            
            // Calculate total fish per second from all containers
            let totalFPS = 0;
            Object.keys(this.state.containers).forEach(containerType => {
                this.state.containers[containerType].forEach(container => {
                    totalFPS += container.fishPerSecond;
                });
            });
            
            // Add to next tier container
            const containerEntry = {
                fishPerSecond: totalFPS,
                timestamp: Date.now()
            };
            
            // Map tier names to container keys
            const tierToContainerKey = {
                'pond': 'ponds',
                'lake': 'lakes', 
                'ocean': 'oceans',
                'planet': 'planets',
                'solar': 'solar',
                'galaxy': 'galaxies',
                'universe': 'universes'
            };
            
            const containerKey = tierToContainerKey[nextTier];
            if (containerKey) {
                this.state.containers[containerKey].push(containerEntry);
            }
            
            // Clear all containers
            Object.keys(this.state.containers).forEach(key => {
                this.state.containers[key] = [];
            });
            
            // Move to next tier
            this.state.currentTier = nextTier;
            this.state.tierCount = 1;
            
            // Reset current tier progress
            this.resetCurrentTier();
            
            this.save();
            return true;
        } else if (this.state.currentTier === 'universe') {
            // Special case: add new universe (don't ascend, just add to multiverse)
            // Calculate current fish per second from nets and fishing
            const netFPS = this.calculateCurrentFPS();
            const fishingFPS = this.calculateFishingFPS();
            const totalFPS = netFPS + fishingFPS;
            
            // Add to universes container
            const containerEntry = {
                fishPerSecond: totalFPS,
                timestamp: Date.now()
            };
            
            this.state.containers.universes.push(containerEntry);
            
            // Increment universe number and reset tier
            this.state.universeNumber++;
            this.state.currentTier = 'pond';
            this.state.tierCount = 1;
            
            // Reset current tier progress
            this.resetCurrentTier();
            
            this.save();
            return true;
        }
        
        return false;
    }

    calculateCurrentFPS() {
        // Calculate fish per second from current nets
        let fps = 0;
        
        if (this.state.nets.count > 0) {
            // Base fish per second from nets
            let baseFPS = this.state.nets.count * this.state.coefficients.netCapacityMultiplier;
            
            // Apply net level scaling
            baseFPS *= Math.pow(1.2, this.state.localUpgrades.netLevel);
            
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
            
            const tierMultiplier = tierMultipliers[this.state.currentTier] || 1;
            fps = Math.floor(baseFPS * tierMultiplier); // Ensure whole number fish per second
        }
        
        // Add fish per second from active fishing
        const fishingFPS = this.calculateFishingFPS();
        fps += fishingFPS;
        
        return fps;
    }

    calculateFishingFPS() {
        // Calculate fish per second from active fishing
        const state = this.state;
        
        // Base fishing duration (in milliseconds)
        const baseDuration = state.fishingDuration;
        const speedMultiplier = state.coefficients.fishingSpeedMultiplier;
        
        // Apply bait upgrades to speed
        const baitMultiplier = Math.pow(1.1, state.localUpgrades.baitLevel);
        const actualDuration = baseDuration / (speedMultiplier * baitMultiplier);
        
        // Calculate fish per catch
        let fishPerCatch = 1;
        
        // Apply rod upgrades
        if (state.localUpgrades.rodLevel > 0) {
            fishPerCatch *= Math.pow(1.5, state.localUpgrades.rodLevel);
        }
        
        // Apply catch fish multiplier
        fishPerCatch *= state.generalUpgrades.catchFishMultiplier;
        
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
        fishPerCatch *= tierMultiplier;
        
        // Calculate fish per second (fish per catch / duration in seconds)
        const fishPerSecond = fishPerCatch / (actualDuration / 1000);
        
        return Math.floor(fishPerSecond);
    }

    crunchUniverse(universeIndex) {
        // Remove the universe from the container
        const universe = this.state.containers.universes[universeIndex];
        if (!universe) return false;
        
        // Calculate multiplier increase (each crunch adds 0.1x to the multiplier)
        const multiplierIncrease = 0.1;
        this.state.multiverseMultiplier += multiplierIncrease;
        
        // Remove the universe
        this.state.containers.universes.splice(universeIndex, 1);
        
        this.save();
        return true;
    }

    resetCurrentTier() {
        // Reset local upgrades and nets for current tier
        this.state.localUpgrades = {
            rodLevel: 0,
            netLevel: 0,
            baitLevel: 0
        };
        
        this.state.nets = {
            count: 0,
            capacity: 20,
            fish: 0,
            maxFish: 200,
            fractionalAccumulator: 0
        };
        
        this.state.fishingActive = false;
        this.state.fishingProgress = 0;
        this.state.fishingQueue = 0;
    }
}

// Initialize game state
window.gameState = new GameState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
