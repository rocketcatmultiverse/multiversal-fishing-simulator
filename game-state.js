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
            fishingDuration: 2000, // milliseconds
            catchFishMultiplier: 1, // x1, x5, x10, x20, etc.
            fishingQueue: 0, // Number of fishing actions queued
            fishingFractionalAccumulator: { base: 0, exponent: 0 }, // Accumulates fractional fish from fishing (safe number)
            containerFishAccumulator: { base: 0, exponent: 0 }, // Accumulates fractional fish from containers (safe number)
            containerTickCounter: 0, // Counter for 10-tick intervals
            
            // Net mechanics
            nets: { count: 0, capacity: 20, fish: 0, maxFish: 200, fractionalAccumulator: { base: 0, exponent: 0 } },
            autoCollectNets: false,
            netAutoCollectTimer: 0, // Timer for auto-collect (in seconds)
            netAutoCollectInterval: 10, // Default interval (in seconds)
            netAutoCollectActive: false, // Whether timer is currently running
            
            // Local upgrades (apply to current tier only)
            localUpgrades: {
                rodLevel: 0, // 0-9 (10 levels)
                netLevel: 0, // 0-9 (10 levels)
                baitLevel: 0 // 0-9 (10 levels)
            },
            
            // General upgrades (persist across tiers)
            generalUpgrades: {
                catchFishMultiplier: 1, // x1, x5, x10, x20, etc.
                autoCollectNets: false,
                autoNetCollectInterval: 0, // Number of interval upgrades purchased
                rodMaxBuyer: false,
                netMaxBuyer: false,
                baitMaxBuyer: false,
                maxBuyer: false,
                maxCatchFishBuyer: false,
                // New parallel multiverse upgrades
                automaxer: false,
                autoMultiply: false,
                autoAscend: false,
                autoParallelize: false,
                multiversalPropagation: 0,
                fishingMastery: 0,
                netMastery: 0,
                baitMastery: 0,
                parallelizedPropagation: 0,
                autoParallelizedPropagation: false,
                autoMultiversalPropagation: false,
                autoFishingMastery: false,
                autoNetMastery: false,
                autoBaitMastery: false,
                autoCatchFish: false,
                parallelMultiverseMultiplier: 0,
                autoParallelMultiverseMultiplier: false
            },
            
            // Progression system
            currentTier: 'pond', // pond, lake, ocean, planet, solar, galaxy, universe
            tierCount: 1,
            universeNumber: 1,
            parallelMultiverses: 1, // Number of parallel multiverses (prestige level)
            
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
            
            // Parallelized Propagation
            parallelizedPropagationFPS: { base: 0, exponent: 0 }, // Accumulated FPS from parallelized propagation
            
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
        this.cleanupContainerValues();
    }

    cleanupContainerValues() {
        // Clean up any existing containers that have overflow values
        Object.keys(this.state.containers).forEach(containerType => {
            this.state.containers[containerType].forEach(container => {
                if (typeof container.fishPerSecond === 'number') {
                    // Check if it's an overflow value
                    if (!isFinite(container.fishPerSecond) || 
                        container.fishPerSecond === Number.MAX_VALUE || 
                        container.fishPerSecond === -Number.MAX_VALUE ||
                        container.fishPerSecond < 0) {
                        // Reset to a safe value
                        container.fishPerSecond = this.createNumber(0);
                    } else {
                        // Convert to safe number format
                        container.fishPerSecond = this.toSafeNumber(container.fishPerSecond);
                    }
                }
            });
        });
        
        // Clean up accumulators - convert from regular numbers to safe numbers if needed
        if (typeof this.state.fishingFractionalAccumulator === 'number') {
            this.state.fishingFractionalAccumulator = this.toSafeNumber(this.state.fishingFractionalAccumulator);
        }
        
        if (typeof this.state.containerFishAccumulator === 'number') {
            this.state.containerFishAccumulator = this.toSafeNumber(this.state.containerFishAccumulator);
        }
        
        // Clean up net fractional accumulator
        if (typeof this.state.nets.fractionalAccumulator === 'number') {
            this.state.nets.fractionalAccumulator = this.toSafeNumber(this.state.nets.fractionalAccumulator);
        }
    }

    // Enhanced number handling for extremely large numbers
    createNumber(base, exponent = 0) {
        return this.normalizeNumber({ base: base, exponent: exponent });
    }

    // Convert any number (including very large ones) to our safe format
    toSafeNumber(value) {
        if (typeof value === 'object' && value.base !== undefined && value.exponent !== undefined) {
            return this.normalizeNumber(value);
        }
        
        if (typeof value === 'number') {
            if (!isFinite(value)) {
                if (value === Infinity) return { base: 1, exponent: 1000 };
                if (value === -Infinity) return { base: -1, exponent: 1000 };
                return { base: 0, exponent: 0 }; // NaN case
            }
            
            if (Math.abs(value) === 0) return { base: 0, exponent: 0 };
            
            // Convert to base/exponent format
            const exponent = Math.floor(Math.log10(Math.abs(value)));
            const base = value / Math.pow(10, exponent);
            return this.normalizeNumber({ base: base, exponent: exponent });
        }
        
        return { base: 0, exponent: 0 };
    }

    // Convert safe number back to regular number (with safety checks)
    // WARNING: This method can cause overflow for large numbers!
    // Use only when absolutely necessary for display or small calculations
    toRegularNumber(safeNum) {
        if (typeof safeNum === 'number') return safeNum;
        if (typeof safeNum === 'object' && safeNum.base !== undefined && safeNum.exponent !== undefined) {
            // For very large exponents, avoid Math.pow to prevent overflow
            if (safeNum.exponent > 300) {
                console.warn(`Converting very large safe number to regular number (exponent: ${safeNum.exponent}). This may cause precision loss.`);
                return safeNum.base > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
            }
            
            // For exponents > 15, avoid Math.pow(10, exponent) which can cause overflow
            if (safeNum.exponent > 15) {
                // Return a very large number representation
                return safeNum.base > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
            }
            
            const result = safeNum.base * Math.pow(10, safeNum.exponent);
            if (!isFinite(result)) {
                return safeNum.base > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
            }
            return result;
        }
        return 0;
    }

    // Test method to verify large number handling (can be removed in production)
    testLargeNumbers() {
        console.log("Testing large number operations...");
        
        // Test 69e420
        const largeNumber = this.createNumber(69, 420);
        console.log("69e420:", this.formatNumber(largeNumber));
        
        // Test multiplication
        const multiplied = this.multiplyNumbers(largeNumber, this.createNumber(2));
        console.log("69e420 * 2:", this.formatNumber(multiplied));
        
        // Test power operation
        const powered = this.safePower(10, 100);
        console.log("10^100:", this.formatNumber(powered));
        
        // Test very large power
        const veryLargePower = this.safePower(2, 1000);
        console.log("2^1000:", this.formatNumber(veryLargePower));
        
        console.log("Large number tests completed successfully!");
    }

    // Safe floor operation for safe numbers
    safeFloor(safeNum) {
        const safe = this.toSafeNumber(safeNum);
        if (safe.base === 0) return this.createNumber(0);
        
        // For very large numbers, floor the base and keep the exponent
        if (safe.exponent > 15) {
            return { base: Math.floor(safe.base), exponent: safe.exponent };
        }
        
        // For smaller numbers, convert to regular number and floor
        const regular = this.toRegularNumber(safe);
        return this.createNumber(Math.floor(regular));
    }

    // Safe comparison for display purposes
    safeCompareForDisplay(a, b) {
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        if (safeA.exponent !== safeB.exponent) {
            return safeA.exponent - safeB.exponent;
        }
        return safeA.base - safeB.base;
    }

    // ============================================================================
    // COMPREHENSIVE MATHEMATICAL OPERATIONS INTERFACE
    // ============================================================================
    // All mathematical operations should go through this interface to ensure large number safety
    
    // Safe power operation that never overflows
    safePower(base, exponent) {
        if (exponent === 0) return this.createNumber(1);
        if (base === 0) return this.createNumber(0);
        if (base === 1) return this.createNumber(1);
        
        // For small exponents, use direct calculation
        if (exponent <= 15) {
            const result = Math.pow(base, exponent);
            return this.createNumber(result);
        }
        
        // For larger exponents, use logarithmic approach
        // Don't normalize the base - we need the original value for log10 calculation
        const safeExponent = this.toSafeNumber(exponent);
        
        // Use logarithms to avoid overflow: a^b = 10^(b * log10(a))
        const logBase = Math.log10(Math.abs(base));
        const resultExponent = (safeExponent.base * Math.pow(10, safeExponent.exponent)) * logBase;
        
        // For very large resultExponent, avoid Math.pow(10, resultExponent) which can overflow
        if (resultExponent > 15) {
            // Return the result directly in base/exponent format, properly normalized
            return this.normalizeNumber({ base: Math.sign(base), exponent: Math.floor(resultExponent) });
        }
        
        return this.createNumber(Math.pow(base, safeExponent.base) * Math.pow(10, resultExponent));
    }
    
    // Safe logarithm operation
    safeLog(value, base = 10) {
        const safeValue = this.toSafeNumber(value);
        const safeBase = this.toSafeNumber(base);
        
        if (safeValue.base <= 0) return this.createNumber(-Infinity);
        if (safeValue.base === 1 && safeValue.exponent === 0) return this.createNumber(0);
        
        // For large numbers, use the exponent directly
        if (safeValue.exponent > 15) {
            return this.createNumber(safeValue.exponent + Math.log10(safeValue.base));
        }
        
        const regularValue = this.toRegularNumber(safeValue);
        return this.createNumber(Math.log(regularValue) / Math.log(this.toRegularNumber(safeBase)));
    }
    
    // Safe absolute value
    safeAbs(value) {
        const safe = this.toSafeNumber(value);
        return { base: Math.abs(safe.base), exponent: safe.exponent };
    }
    
    // Safe minimum
    safeMin(a, b) {
        return this.compareNumbers(a, b) <= 0 ? this.toSafeNumber(a) : this.toSafeNumber(b);
    }
    
    // Safe maximum
    safeMax(a, b) {
        return this.compareNumbers(a, b) >= 0 ? this.toSafeNumber(a) : this.toSafeNumber(b);
    }
    
    // Safe square root
    safeSqrt(value) {
        const safe = this.toSafeNumber(value);
        if (safe.base < 0) return this.createNumber(0);
        
        // For large numbers, sqrt(a * 10^b) = sqrt(a) * 10^(b/2)
        if (safe.exponent > 15) {
            const sqrtBase = Math.sqrt(safe.base);
            const sqrtExponent = safe.exponent / 2;
            return this.createNumber(sqrtBase, sqrtExponent);
        }
        
        const regular = this.toRegularNumber(safe);
        return this.createNumber(Math.sqrt(regular));
    }
    
    // Safe 10^exponent operation (avoids Math.pow(10, exponent) overflow)
    safePowerOfTen(exponent) {
        if (exponent === 0) return this.createNumber(1);
        if (exponent < 0) return this.createNumber(Math.pow(10, exponent));
        
        // For large exponents, use base/exponent format directly
        if (exponent > 300) {
            return this.createNumber(1, exponent);
        }
        
        return this.createNumber(Math.pow(10, exponent));
    }
    
    // Safe division by power of 10
    safeDivideByPowerOfTen(value, exponent) {
        const safeValue = this.toSafeNumber(value);
        return this.createNumber(safeValue.base, safeValue.exponent - exponent);
    }
    
    // Safe multiplication by power of 10
    safeMultiplyByPowerOfTen(value, exponent) {
        const safeValue = this.toSafeNumber(value);
        return this.createNumber(safeValue.base, safeValue.exponent + exponent);
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


    convertToSafeNumber(value) {
        // Convert potentially large numbers to our base/exponent format
        if (typeof value === 'number') {
            if (!isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
                // Number is too large or infinite, convert to base/exponent
                if (value === Infinity || value === -Infinity) {
                    return { base: Math.sign(value), exponent: 1000 }; // Very large number
                }
                
                // Convert large number to base/exponent
                const exponent = Math.floor(Math.log10(Math.abs(value)));
                const base = value / Math.pow(10, exponent);
                return this.normalizeNumber({ base: base, exponent: exponent });
            }
            return value;
        }
        
        if (typeof value === 'object' && value.base !== undefined && value.exponent !== undefined) {
            // Already in base/exponent format
            return this.normalizeNumber(value);
        }
        
        return value;
    }

    addNumbers(a, b) {
        // Convert both numbers to safe format
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        // Handle zero cases
        if (safeA.base === 0 || Math.abs(safeA.base) < 1e-15) return safeB;
        if (safeB.base === 0 || Math.abs(safeB.base) < 1e-15) return safeA;
        
        if (safeA.exponent === safeB.exponent) {
            const result = { base: safeA.base + safeB.base, exponent: safeA.exponent };
            return this.normalizeNumber(result);
        }
        
        const diff = Math.abs(safeA.exponent - safeB.exponent);
        if (diff > 15) {
            // If difference is too large, return the larger number
            return safeA.exponent > safeB.exponent ? safeA : safeB;
        }
        
        let result;
        if (safeA.exponent > safeB.exponent) {
            const multiplier = Math.pow(10, safeA.exponent - safeB.exponent);
            result = { base: safeA.base + safeB.base / multiplier, exponent: safeA.exponent };
        } else {
            const multiplier = Math.pow(10, safeB.exponent - safeA.exponent);
            result = { base: safeA.base / multiplier + safeB.base, exponent: safeB.exponent };
        }
        
        return this.normalizeNumber(result);
    }

    subtractNumbers(a, b) {
        // Convert both numbers to safe format
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        // Handle zero cases
        if (safeA.base === 0 || Math.abs(safeA.base) < 1e-15) {
            return { base: -safeB.base, exponent: safeB.exponent };
        }
        if (safeB.base === 0 || Math.abs(safeB.base) < 1e-15) return safeA;
        
        if (safeA.exponent === safeB.exponent) {
            const result = { base: safeA.base - safeB.base, exponent: safeA.exponent };
            return this.normalizeNumber(result);
        }
        
        const diff = Math.abs(safeA.exponent - safeB.exponent);
        if (diff > 15) {
            // If difference is too large, return the larger number
            return safeA.exponent > safeB.exponent ? safeA : { base: -safeB.base, exponent: safeB.exponent };
        }
        
        let result;
        if (safeA.exponent > safeB.exponent) {
            const multiplier = Math.pow(10, safeA.exponent - safeB.exponent);
            result = { base: safeA.base - safeB.base / multiplier, exponent: safeA.exponent };
        } else {
            const multiplier = Math.pow(10, safeB.exponent - safeA.exponent);
            result = { base: safeA.base / multiplier - safeB.base, exponent: safeB.exponent };
        }
        
        return this.normalizeNumber(result);
    }

    multiplyNumbers(a, b) {
        // Convert both numbers to safe format
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        // Handle zero cases
        if (safeA.base === 0 || safeB.base === 0) {
            return { base: 0, exponent: 0 };
        }
        
        const result = { 
            base: safeA.base * safeB.base, 
            exponent: safeA.exponent + safeB.exponent 
        };
        return this.normalizeNumber(result);
    }

    divideNumbers(a, b) {
        // Convert both numbers to safe format
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        // Handle zero cases
        if (safeA.base === 0) {
            return { base: 0, exponent: 0 };
        }
        if (safeB.base === 0) {
            // Instead of throwing an error, return a very large number
            return this.createNumber(Number.MAX_VALUE);
        }
        
        const result = { 
            base: safeA.base / safeB.base, 
            exponent: safeA.exponent - safeB.exponent 
        };
        return this.normalizeNumber(result);
    }

    compareNumbers(a, b) {
        // Convert both numbers to safe format
        const safeA = this.toSafeNumber(a);
        const safeB = this.toSafeNumber(b);
        
        // Handle zero cases
        if (safeA.base === 0 && safeB.base === 0) return 0;
        if (safeA.base === 0) return safeB.base > 0 ? -1 : 1;
        if (safeB.base === 0) return safeA.base > 0 ? 1 : -1;
        
        // Compare exponents first
        if (safeA.exponent !== safeB.exponent) {
            return safeA.exponent - safeB.exponent;
        }
        
        // If exponents are equal, compare bases with small tolerance for floating point precision
        const diff = safeA.base - safeB.base;
        const tolerance = 1e-10; // Very small tolerance for floating point precision
        
        if (Math.abs(diff) < tolerance) {
            return 0; // Consider them equal
        }
        
        return diff;
    }


    formatNumber(num) {
        // Convert to safe number format first
        const safeNum = this.toSafeNumber(num);
        
        // Handle zero
        if (safeNum.base === 0 || Math.abs(safeNum.base) < 1e-15) {
            return "0";
        }
        
        // For very large numbers (exponent >= 15), always use scientific notation
        if (safeNum.exponent >= 15) {
            return `${safeNum.base.toFixed(2)}e${safeNum.exponent}`;
        }
        
        // For smaller numbers, we can safely convert to regular number for formatting
        // since we know the exponent is < 15
        const regularNum = this.toRegularNumber(safeNum);
        
        // Handle very small numbers
        if (regularNum < 1) {
            return regularNum.toFixed(3);
        }
        
        // Define suffixes (only up to Oc)
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
        
        // Determine which suffix to use
        let suffixIndex = 0;
        let displayValue = regularNum;
        
        while (displayValue >= 1000 && suffixIndex < suffixes.length - 1) {
            displayValue /= 1000;
            suffixIndex++;
        }
        
        const suffix = suffixes[suffixIndex];
        
        // If we've exceeded our suffix range, use scientific notation
        if (displayValue >= 1000) {
            return `${safeNum.base.toFixed(2)}e${safeNum.exponent}`;
        }
        
        // Format based on value range with proper decimal places
        if (suffixIndex === 0) {
            // No suffix: 1-999, display as whole integers
            return Math.floor(displayValue).toString();
        } else if (displayValue >= 100) {
            // 100-999: show as whole numbers (e.g., 250K, 999M)
            return `${Math.floor(displayValue)}${suffix}`;
        } else if (displayValue >= 10) {
            // 10-99: show with 2 decimal places (e.g., 12.50K, 99.99M)
            return `${displayValue.toFixed(2)}${suffix}`;
        } else {
            // 1-9: show with 2 decimal places (e.g., 1.25K, 9.99M)
            return `${displayValue.toFixed(2)}${suffix}`;
        }
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
                    
                    // Ensure critical properties exist with default values
                    if (typeof this.state.multiverseMultiplier === 'undefined') {
                        this.state.multiverseMultiplier = 1.0;
                    }
                    if (typeof this.state.skipCrunchConfirmation === 'undefined') {
                        this.state.skipCrunchConfirmation = false;
                    }
                    if (!this.state.autobuyers) {
                        this.state.autobuyers = {
                            rods: false,
                            nets: false,
                            bait: false,
                            multiply: false,
                            ascend: false
                        };
                    }
                    
                    // Ensure new net auto-collect properties exist
                    if (typeof this.state.netAutoCollectTimer === 'undefined') {
                        this.state.netAutoCollectTimer = 0;
                    }
                    if (typeof this.state.netAutoCollectInterval === 'undefined') {
                        this.state.netAutoCollectInterval = 10;
                    }
                    if (typeof this.state.netAutoCollectActive === 'undefined') {
                        this.state.netAutoCollectActive = false;
                    }
                    if (typeof this.state.generalUpgrades.autoNetCollectInterval === 'undefined') {
                        this.state.generalUpgrades.autoNetCollectInterval = 0;
                    }
                    
                    // Ensure parallel multiverses property exists
                    if (typeof this.state.parallelMultiverses === 'undefined') {
                        this.state.parallelMultiverses = 1;
                    }
                    
                    // Ensure new parallel multiverse upgrades exist
                    if (typeof this.state.generalUpgrades.automaxer === 'undefined') {
                        this.state.generalUpgrades.automaxer = false;
                    }
                    if (typeof this.state.generalUpgrades.autoMultiply === 'undefined') {
                        this.state.generalUpgrades.autoMultiply = false;
                    }
                    if (typeof this.state.generalUpgrades.autoAscend === 'undefined') {
                        this.state.generalUpgrades.autoAscend = false;
                    }
                    if (typeof this.state.generalUpgrades.autoParallelize === 'undefined') {
                        this.state.generalUpgrades.autoParallelize = false;
                    }
                    if (typeof this.state.generalUpgrades.multiversalPropagation === 'undefined') {
                        this.state.generalUpgrades.multiversalPropagation = 0;
                    }
                    if (typeof this.state.generalUpgrades.fishingMastery === 'undefined') {
                        this.state.generalUpgrades.fishingMastery = 0;
                    }
                    if (typeof this.state.generalUpgrades.netMastery === 'undefined') {
                        this.state.generalUpgrades.netMastery = 0;
                    }
                    if (typeof this.state.generalUpgrades.baitMastery === 'undefined') {
                        this.state.generalUpgrades.baitMastery = 0;
                    }
                    if (typeof this.state.generalUpgrades.parallelizedPropagation === 'undefined') {
                        this.state.generalUpgrades.parallelizedPropagation = 0;
                    }
                    if (typeof this.state.generalUpgrades.autoParallelizedPropagation === 'undefined') {
                        this.state.generalUpgrades.autoParallelizedPropagation = false;
                    }
                    if (typeof this.state.generalUpgrades.autoMultiversalPropagation === 'undefined') {
                        this.state.generalUpgrades.autoMultiversalPropagation = false;
                    }
                    if (typeof this.state.generalUpgrades.autoFishingMastery === 'undefined') {
                        this.state.generalUpgrades.autoFishingMastery = false;
                    }
                    if (typeof this.state.generalUpgrades.autoNetMastery === 'undefined') {
                        this.state.generalUpgrades.autoNetMastery = false;
                    }
                    if (typeof this.state.generalUpgrades.autoBaitMastery === 'undefined') {
                        this.state.generalUpgrades.autoBaitMastery = false;
                    }
                    if (typeof this.state.generalUpgrades.autoCatchFish === 'undefined') {
                        this.state.generalUpgrades.autoCatchFish = false;
                    }
                    if (typeof this.state.generalUpgrades.parallelMultiverseMultiplier === 'undefined') {
                        this.state.generalUpgrades.parallelMultiverseMultiplier = 0;
                    }
                    if (typeof this.state.generalUpgrades.autoParallelMultiverseMultiplier === 'undefined') {
                        this.state.generalUpgrades.autoParallelMultiverseMultiplier = false;
                    }
                    
                    // Ensure parallelized propagation FPS exists
                    if (typeof this.state.parallelizedPropagationFPS === 'undefined') {
                        this.state.parallelizedPropagationFPS = { base: 0, exponent: 0 };
                    }
                    
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
        // Add parallelized propagation FPS every loop
        if (this.compareNumbers(this.state.parallelizedPropagationFPS, this.createNumber(0)) > 0) {
            // Convert FPS to fish per loop (divide by 10 since we run 10 loops per second)
            let fishPerLoop = this.divideNumbers(this.state.parallelizedPropagationFPS, this.createNumber(10));
            
            // Apply parallelize multiplier to parallelized propagation FPS
            const parallelizeMultiplier = this.toSafeNumber(this.getParallelizeMultiplier());
            fishPerLoop = this.multiplyNumbers(fishPerLoop, parallelizeMultiplier);
            
            this.state.fish = this.addNumbers(this.state.fish, fishPerLoop);
        }
        
        // Increment tick counter
        this.state.containerTickCounter++;
        
        // Only add fish every 10 ticks (once per second)
        if (this.state.containerTickCounter >= 10) {
            this.state.containerTickCounter = 0;
            
            // Calculate total fish per second from all containers
            let totalFPS = this.createNumber(0);
            
            Object.keys(this.state.containers).forEach(containerType => {
                this.state.containers[containerType].forEach(container => {
                    const containerFPS = this.toSafeNumber(container.fishPerSecond);
                    totalFPS = this.addNumbers(totalFPS, containerFPS);
                });
            });
            
            // Apply multiverse multiplier
            const multiverseMultiplier = this.toSafeNumber(this.state.multiverseMultiplier || 1.0);
            totalFPS = this.multiplyNumbers(totalFPS, multiverseMultiplier);
            
            // Apply parallelize multiplier
            const parallelizeMultiplier = this.toSafeNumber(this.getParallelizeMultiplier());
            totalFPS = this.multiplyNumbers(totalFPS, parallelizeMultiplier);
            
            // Add fish per second to accumulator using safe numbers
            if (this.compareNumbers(totalFPS, this.createNumber(0)) > 0) {
                this.state.containerFishAccumulator = this.addNumbers(this.state.containerFishAccumulator, totalFPS);
                
                // Add whole fish when accumulator reaches 1 or more
                const oneFish = this.createNumber(1);
                if (this.compareNumbers(this.state.containerFishAccumulator, oneFish) >= 0) {
                    const wholeFishToAdd = this.safeFloor(this.state.containerFishAccumulator);
                    this.state.containerFishAccumulator = this.subtractNumbers(this.state.containerFishAccumulator, wholeFishToAdd); // Keep the remainder
                    
                    if (this.compareNumbers(wholeFishToAdd, this.createNumber(0)) > 0) {
                        this.state.fish = this.addNumbers(this.state.fish, wholeFishToAdd);
                        this.state.totalFishCaught = this.addNumbers(this.state.totalFishCaught, wholeFishToAdd);
                        
                        // Show container fish animation
                        if (window.uiManager && window.uiManager.createFishAnimation) {
                            const multiverseHeading = document.querySelector('#containers-display h3');
                            if (multiverseHeading) {
                                window.uiManager.createFishAnimation(wholeFishToAdd, multiverseHeading);
                            }
                        }
                    }
                }
            }
        }
    }

    calculateFishPerSecond() {
        // Calculate fish per second from current nets
        let fps = this.createNumber(0);
        
        // Net fish generation
        if (this.state.nets.count > 0) {
            const netFPS = this.multiplyNumbers(
                this.createNumber(this.state.nets.count), 
                this.createNumber(this.state.coefficients.netCapacityMultiplier)
            );
            fps = this.addNumbers(fps, netFPS);
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
                const containerFPS = this.toSafeNumber(container.fishPerSecond);
                fps = this.addNumbers(fps, containerFPS);
            });
        });
        
        this.state.fishPerSecond = this.multiplyNumbers(fps, this.createNumber(currentTierMultiplier));
    }

    // Debug methods
    reset() {
        this.state = {
            fish: { base: 0, exponent: 0 },
            fishPerSecond: 0,
            fishingActive: false,
            fishingProgress: 0,
            fishingDuration: 2000,
            catchFishMultiplier: 1,
            fishingQueue: 0,
            fishingFractionalAccumulator: { base: 0, exponent: 0 },
            containerFishAccumulator: { base: 0, exponent: 0 },
            containerTickCounter: 0,
            nets: { count: 0, capacity: 20, fish: 0, maxFish: 200, fractionalAccumulator: { base: 0, exponent: 0 } },
            autoCollectNets: false,
            netAutoCollectTimer: 0,
            netAutoCollectInterval: 10,
            netAutoCollectActive: false,
            localUpgrades: {
                rodLevel: 0,
                netLevel: 0,
                baitLevel: 0
            },
            generalUpgrades: {
                // Basic upgrades available at game start - reset to defaults
                catchFishMultiplier: 1,
                autoCollectNets: false,
                autoNetCollectInterval: 0,
                rodMaxBuyer: false,
                netMaxBuyer: false,
                baitMaxBuyer: false,
                maxBuyer: false,
                maxCatchFishBuyer: false,
                // Advanced upgrades only available with 2+ parallel multiverses - reset to defaults
                automaxer: false,
                autoMultiply: false,
                autoAscend: false,
                autoParallelize: false,
                multiversalPropagation: 0,
                fishingMastery: 0,
                netMastery: 0,
                baitMastery: 0,
                parallelizedPropagation: 0,
                autoParallelizedPropagation: false,
                autoMultiversalPropagation: false,
                autoFishingMastery: false,
                autoNetMastery: false,
                autoBaitMastery: false,
                autoCatchFish: false,
                parallelMultiverseMultiplier: 0,
                autoParallelMultiverseMultiplier: false
            },
            currentTier: 'pond',
            tierCount: 1,
            universeNumber: 1,
            parallelMultiverses: 1,
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
            
            // Parallelized Propagation
            parallelizedPropagationFPS: { base: 0, exponent: 0 },
            
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
        // Convert amount to safe number format
        const safeAmount = this.toSafeNumber(amount);
        
        // For very large numbers, don't use Math.floor as it can cause precision loss
        if (safeAmount.exponent > 15) {
            // For extremely large numbers, add directly without flooring
            this.state.fish = this.addNumbers(this.state.fish, safeAmount);
        } else {
            // For smaller numbers, floor as usual
            const regularAmount = this.toRegularNumber(safeAmount);
            const wholeAmount = Math.floor(regularAmount);
        this.state.fish = this.addNumbers(this.state.fish, this.createNumber(wholeAmount));
        }
        this.save();
    }

    setFish(amount) {
        // Convert amount to safe number format
        const safeAmount = this.toSafeNumber(amount);
        
        // For very large numbers, don't use Math.floor as it can cause precision loss
        if (safeAmount.exponent > 15) {
            // For extremely large numbers, set directly
            this.state.fish = safeAmount;
        } else {
            // For smaller numbers, floor as usual
            const regularAmount = this.toRegularNumber(safeAmount);
            const wholeAmount = Math.floor(regularAmount);
        this.state.fish = this.createNumber(wholeAmount);
        }
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
        // Use safe number format to prevent overflow
        const currentFPS = this.calculateCurrentFPSSafe();
        const containerEntry = {
            fishPerSecond: currentFPS
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
        // Preserve fishing queue before resetting
        const preservedFishingQueue = this.state.fishingQueue;
        
        this.resetCurrentTier();
        
        // Restore fishing queue
        this.state.fishingQueue = preservedFishingQueue;
        
        this.save();
        return true;
    }

    ascend() {
        // Aggregate all containers into the next tier
        const tiers = ['pond', 'lake', 'ocean', 'planet', 'solar', 'galaxy', 'universe'];
        const currentIndex = tiers.indexOf(this.state.currentTier);
        
        if (currentIndex < tiers.length - 1) {
            const nextTier = tiers[currentIndex + 1];
            
            // Calculate total fish per second from all containers using safe number operations
            let totalFPS = this.createNumber(0);
            Object.keys(this.state.containers).forEach(containerType => {
                this.state.containers[containerType].forEach(container => {
                    const containerFPS = this.toSafeNumber(container.fishPerSecond);
                    totalFPS = this.addNumbers(totalFPS, containerFPS);
                });
            });
            
            // Add to next tier container (store as safe number to prevent overflow)
            const containerEntry = {
                fishPerSecond: totalFPS
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
            
            // Preserve fishing queue before resetting
            const preservedFishingQueue = this.state.fishingQueue;
            
            // Reset current tier progress
            this.resetCurrentTier();
            
            // Restore fishing queue
            this.state.fishingQueue = preservedFishingQueue;
            
            this.save();
            return true;
        } else if (this.state.currentTier === 'universe') {
            // Special case: add new universe (don't ascend, just add to multiverse)
            // Calculate current fish per second from nets and fishing
            const netFPS = this.calculateCurrentFPSSafe();
            const fishingFPS = this.calculateFishingFPS();
            const totalFPS = this.addNumbers(netFPS, fishingFPS);
            
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
        // Calculate fish per second from current nets using safe number operations
        let fps = this.createNumber(0);
        
        if (this.state.nets.count > 0) {
            // Base fish per second from nets
            let baseFPS = this.multiplyNumbers(
                this.createNumber(this.state.nets.count), 
                this.createNumber(this.state.coefficients.netCapacityMultiplier)
            );
            
            // Apply net level scaling using safe power
            const netLevelMultiplier = this.safePower(1.2, this.state.localUpgrades.netLevel);
            baseFPS = this.multiplyNumbers(baseFPS, this.toSafeNumber(netLevelMultiplier));
            
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
            fps = this.multiplyNumbers(baseFPS, this.createNumber(tierMultiplier));
        }
        
        // Add fish per second from active fishing
        const fishingFPS = this.toSafeNumber(this.calculateFishingFPS());
        fps = this.addNumbers(fps, fishingFPS);
        
        return fps;
    }

    calculateCurrentFPSSafe() {
        // Calculate fish per second from current nets using safe number operations
        // Returns safe number format to prevent overflow when storing in containers
        let fps = this.createNumber(0);
        
        if (this.state.nets.count > 0) {
            // Base fish per second from nets
            let baseFPS = this.multiplyNumbers(
                this.createNumber(this.state.nets.count), 
                this.createNumber(this.state.coefficients.netCapacityMultiplier)
            );
            
            // Apply net level scaling using safe power
            const netLevelMultiplier = this.safePower(1.2, this.state.localUpgrades.netLevel);
            baseFPS = this.multiplyNumbers(baseFPS, this.toSafeNumber(netLevelMultiplier));
            
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
            fps = this.multiplyNumbers(baseFPS, this.createNumber(tierMultiplier));
        }
        
        // Add fish per second from active fishing
        const fishingFPS = this.toSafeNumber(this.calculateFishingFPS());
        fps = this.addNumbers(fps, fishingFPS);
        
        // Apply multiversal propagation - adds FPS from the previous universe only
        const propagationEffectiveness = this.getMultiversalPropagationEffectiveness();
        if (propagationEffectiveness > 0 && this.state.universeNumber > 1 && this.state.containers.universes.length > 0) {
            // Get FPS from the most recent (previous) universe only
            const previousUniverse = this.state.containers.universes[this.state.containers.universes.length - 1];
            const previousUniverseFPS = this.toSafeNumber(previousUniverse.fishPerSecond);
            
            // Apply propagation coefficient divided by current universe number
            const propagationCoefficient = propagationEffectiveness / this.state.universeNumber;
            const propagationFPS = this.multiplyNumbers(previousUniverseFPS, this.createNumber(propagationCoefficient));
            fps = this.addNumbers(fps, propagationFPS);
        }
        
        return fps; // Return safe number format
    }

    calculateParallelMultiverseFPS() {
        // Only calculate if we have 5+ parallel multiverses
        if (this.state.parallelMultiverses < 5) return this.createNumber(0);
        
        const propagationEffectiveness = this.getParallelizedPropagationEffectiveness();
        if (propagationEffectiveness <= 0) return this.createNumber(0);
        
        // Calculate cumulative FPS from previous parallel multiverses
        let cumulativeFPS = this.createNumber(0);
        for (let i = 1; i < this.state.parallelMultiverses; i++) {
            // Each previous multiverse contributes its FPS * effectiveness
            const multiverseFPS = this.calculateMultiverseFPS(i);
            const contribution = this.multiplyNumbers(multiverseFPS, this.createNumber(propagationEffectiveness));
            
            // Safely add to cumulative FPS
            cumulativeFPS = this.addNumbers(cumulativeFPS, contribution);
        }
        
        return cumulativeFPS;
    }

    calculateMultiverseFPS(multiverseNumber) {
        // Calculate FPS for a specific multiverse number
        // Use base FPS calculation without parallel multiverse FPS to avoid infinite loop
        const baseFPS = this.calculateBaseFPS();
        const multiplier = this.getParallelizeMultiplier();
        const power = multiverseNumber - 1;
        
        // Calculate multiplier using safe power
        const multiplierSafe = this.safePower(multiplier, power);
        
        // Return safe number result
        return this.multiplyNumbers(baseFPS, multiplierSafe);
    }

    calculateBaseFPS() {
        // Calculate FPS without parallel multiverse contribution to avoid infinite loops
        let fps = this.createNumber(0);
        
        // Add fish per second from nets
        if (this.state.nets.fish > 0) {
            const netFPS = this.toSafeNumber(this.state.nets.fishPerSecond);
            fps = this.addNumbers(fps, netFPS);
        }
        
        // Add fish per second from containers (without parallel multiverse FPS)
        Object.keys(this.state.containers).forEach(containerType => {
            this.state.containers[containerType].forEach(container => {
                const containerFPS = this.toSafeNumber(container.fishPerSecond);
                fps = this.addNumbers(fps, containerFPS);
            });
        });
        
        // Apply multipliers
        const parallelizeMultiplier = this.toSafeNumber(this.getParallelizeMultiplier());
        fps = this.multiplyNumbers(fps, parallelizeMultiplier);
        
        const netMasteryMultiplier = this.toSafeNumber(this.getNetMasteryMultiplier());
        fps = this.multiplyNumbers(fps, netMasteryMultiplier);
        
        // Apply auto-collect interval multiplier
        const autoCollectInterval = this.getCurrentNetAutoCollectInterval();
        if (autoCollectInterval > 0) {
            const baseInterval = 10;
            const intervalMultiplier = baseInterval / (baseInterval + autoCollectInterval);
            fps = this.multiplyNumbers(fps, this.createNumber(intervalMultiplier));
        }
        
        // Add fish per second from active fishing
        const fishingFPS = this.toSafeNumber(this.calculateFishingFPS());
        fps = this.addNumbers(fps, fishingFPS);
        
        return fps;
    }

    getCurrentNetAutoCollectInterval() {
        const state = this.state;
        const baseInterval = 10; // 10 seconds base
        const intervalReduction = state.generalUpgrades.autoNetCollectInterval * 0.5; // 0.5 seconds per upgrade
        return Math.max(0, baseInterval - intervalReduction); // Minimum 0 seconds
    }

    getParallelizeMultiplier() {
        // Each parallelize adds 1.2x multiplier
        const power = this.state.parallelMultiverses - 1;
        return this.safePower(1.2, power);
    }

    getFishingMasteryMultiplier() {
        // Each mastery level adds 1.2x multiplier (more impactful)
        return this.safePower(1.2, this.state.generalUpgrades.fishingMastery);
    }

    getNetMasteryMultiplier() {
        // Each mastery level adds 1.2x multiplier (more impactful)
        return this.safePower(1.2, this.state.generalUpgrades.netMastery);
    }

    getBaitMasteryMultiplier() {
        // Each mastery level adds 1.2x multiplier (more impactful)
        return this.safePower(1.2, this.state.generalUpgrades.baitMastery);
    }

    getMultiversalPropagationEffectiveness() {
        // Base effectiveness of 0.1, increases by 0.1 per level
        return 0.1 + (this.state.generalUpgrades.multiversalPropagation * 0.1);
    }

    getParallelizedPropagationEffectiveness() {
        // Base effectiveness of 0.1, increases by 0.1 per level
        return 0.1 + (this.state.generalUpgrades.parallelizedPropagation * 0.1);
    }

    calculateAndAddParallelizedPropagationFPS() {
        // Only calculate if we have parallelized propagation upgrades
        const propagationEffectiveness = this.getParallelizedPropagationEffectiveness();
        if (propagationEffectiveness <= 0) return;
        
        // 1) Get current FPS (from local sources)
        const currentFPS = this.calculateCurrentFPSSafe();
        
        // 2) Get FPS gained in Multiverse (containers)
        let multiverseFPS = this.createNumber(0);
        Object.keys(this.state.containers).forEach(containerType => {
            this.state.containers[containerType].forEach(container => {
                const containerFPS = this.toSafeNumber(container.fishPerSecond);
                multiverseFPS = this.addNumbers(multiverseFPS, containerFPS);
            });
        });
        
        // 3) Calculate propagation FPS: (currentFPS + multiverseFPS) * propagationEffectiveness
        const totalFPS = this.addNumbers(currentFPS, multiverseFPS);
        const propagationFPS = this.multiplyNumbers(totalFPS, this.createNumber(propagationEffectiveness));
        
        // 4) Add to accumulated parallelized propagation FPS
        this.state.parallelizedPropagationFPS = this.addNumbers(this.state.parallelizedPropagationFPS, propagationFPS);
        
        console.log(`Parallelized Propagation: Added ${this.formatNumber(propagationFPS)} FPS (Total: ${this.formatNumber(this.state.parallelizedPropagationFPS)})`);
    }

    processAutoUpgrades() {
        // Only process if we have 2+ parallel multiverses
        if (this.state.parallelMultiverses < 2) return;
        
        // Auto-max local upgrades if automaxer is purchased
        if (this.state.generalUpgrades.automaxer) {
            this.processAutoMax();
        }
        
        // Auto-multiply if auto-multiply is purchased and local upgrades are maxed
        if (this.state.generalUpgrades.autoMultiply && this.areLocalUpgradesMaxed()) {
            this.processAutoMultiply();
        }
        
        // Auto-ascend if auto-ascend is purchased and we can ascend
        if (this.state.generalUpgrades.autoAscend && this.canAscend()) {
            this.processAutoAscend();
        }
        
        // Auto-parallelize if auto-parallelize is purchased and we can parallelize
        if (this.state.generalUpgrades.autoParallelize && this.canParallelize()) {
            this.processAutoParallelize();
        }
        
        // Auto-buy Parallelized Propagation if enabled
        if (this.state.generalUpgrades.autoParallelizedPropagation && this.canAffordParallelizedPropagation()) {
            this.processAutoParallelizedPropagation();
        }
        
        // Auto-buy Multiversal Propagation if enabled
        if (this.state.generalUpgrades.autoMultiversalPropagation && this.canAffordMultiversalPropagation()) {
            this.processAutoMultiversalPropagation();
        }
        
        // Auto-buy Fishing Mastery if enabled
        if (this.state.generalUpgrades.autoFishingMastery && this.canAffordFishingMastery()) {
            this.processAutoFishingMastery();
        }
        
        // Auto-buy Net Mastery if enabled
        if (this.state.generalUpgrades.autoNetMastery && this.canAffordNetMastery()) {
            this.processAutoNetMastery();
        }
        
        // Auto-buy Bait Mastery if enabled
        if (this.state.generalUpgrades.autoBaitMastery && this.canAffordBaitMastery()) {
            this.processAutoBaitMastery();
        }
        
        // Auto-buy Catch Fish if enabled
        if (this.state.generalUpgrades.autoCatchFish && this.canAffordCatchFish()) {
            this.processAutoCatchFish();
        }
        
        // Auto-buy Parallel Multiverse Multiplier if enabled
        if (this.state.generalUpgrades.autoParallelMultiverseMultiplier && this.canAffordParallelMultiverseMultiplier()) {
            this.processAutoParallelMultiverseMultiplier();
        }
    }

    processAutoMax() {
        // Try to buy rod upgrades
        while (this.state.localUpgrades.rodLevel < 10 && this.canAffordRodUpgrade()) {
            this.buyRodUpgrade();
        }
        
        // Try to buy net upgrades
        while (this.state.localUpgrades.netLevel < 10 && this.canAffordNetUpgrade()) {
            this.buyNetUpgrade();
        }
        
        // Try to buy bait upgrades
        while (this.state.localUpgrades.baitLevel < 10 && this.canAffordBaitUpgrade()) {
            this.buyBaitUpgrade();
        }
    }

    areLocalUpgradesMaxed() {
        return this.state.localUpgrades.rodLevel > 9 && 
               this.state.localUpgrades.netLevel > 9 && 
               this.state.localUpgrades.baitLevel > 9;
    }

    canAscend() {
        const tiers = ['pond', 'lake', 'ocean', 'planet', 'solar', 'galaxy', 'universe'];
        const currentIndex = tiers.indexOf(this.state.currentTier);
        return currentIndex < tiers.length - 1;
    }

    canParallelize() {
        // Can parallelize when at Universe level
        return this.state.currentTier === 'universe';
    }

    processAutoMultiply() {
        if (window.progressionSystem && window.progressionSystem.buyMultiply) {
            window.progressionSystem.buyMultiply();
        }
    }

    processAutoAscend() {
        if (window.progressionSystem && window.progressionSystem.buyAscend) {
            window.progressionSystem.buyAscend();
        }
    }

    processAutoParallelize() {
        if (this.parallelize()) {
            console.log('Auto-Parallelize triggered!');
        }
    }

    canAffordParallelizedPropagation() {
        const cost = window.progressionSystem.getParallelizedPropagationCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoParallelizedPropagation() {
        if (window.progressionSystem.buyParallelizedPropagation()) {
            console.log('Auto-Parallelized Propagation purchased!');
        }
    }

    canAffordMultiversalPropagation() {
        const cost = window.progressionSystem.getMultiversalPropagationCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoMultiversalPropagation() {
        if (window.progressionSystem.buyMultiversalPropagation()) {
            console.log('Auto-Multiversal Propagation purchased!');
        }
    }

    canAffordFishingMastery() {
        const cost = window.progressionSystem.getFishingMasteryCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoFishingMastery() {
        if (window.progressionSystem.buyFishingMastery()) {
            console.log('Auto-Fishing Mastery purchased!');
        }
    }

    canAffordNetMastery() {
        const cost = window.progressionSystem.getNetMasteryCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoNetMastery() {
        if (window.progressionSystem.buyNetMastery()) {
            console.log('Auto-Net Mastery purchased!');
        }
    }

    canAffordBaitMastery() {
        const cost = window.progressionSystem.getBaitMasteryCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoBaitMastery() {
        if (window.progressionSystem.buyBaitMastery()) {
            console.log('Auto-Bait Mastery purchased!');
        }
    }

    canAffordCatchFish() {
        const cost = window.progressionSystem.getCatchFishMultiplierCost(this.state.generalUpgrades.catchFishMultiplier + 1);
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoCatchFish() {
        if (window.progressionSystem.buyCatchFishMultiplier()) {
            console.log('Auto-Catch Fish purchased!');
        }
    }

    canAffordParallelMultiverseMultiplier() {
        const cost = window.progressionSystem.getParallelMultiverseMultiplierCost();
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    processAutoParallelMultiverseMultiplier() {
        if (window.progressionSystem.buyParallelMultiverseMultiplier()) {
            console.log('Auto-Parallel Multiverse Multiplier purchased!');
        }
    }

    canAffordRodUpgrade() {
        if (!window.progressionSystem) return false;
        const cost = window.progressionSystem.getRodUpgradeCost(this.state.localUpgrades.rodLevel);
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    canAffordNetUpgrade() {
        if (!window.progressionSystem) return false;
        const cost = window.progressionSystem.getNetUpgradeCost(this.state.localUpgrades.netLevel);
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    canAffordBaitUpgrade() {
        if (!window.progressionSystem) return false;
        const cost = window.progressionSystem.getBaitUpgradeCost(this.state.localUpgrades.baitLevel);
        return this.compareNumbers(this.state.fish, cost) >= 0;
    }

    buyRodUpgrade() {
        if (!window.progressionSystem) return false;
        return window.progressionSystem.buyRodUpgrade();
    }

    buyNetUpgrade() {
        if (!window.progressionSystem) return false;
        return window.progressionSystem.buyNetUpgrade();
    }

    buyBaitUpgrade() {
        if (!window.progressionSystem) return false;
        return window.progressionSystem.buyBaitUpgrade();
    }

    parallelize() {
        // Only allow parallelize at Universe level
        if (this.state.currentTier !== 'universe') {
            return false;
        }
        
        // Increment parallel multiverses (base + multiplier)
        const multiverseIncrease = 1 + this.state.generalUpgrades.parallelMultiverseMultiplier;
        this.state.parallelMultiverses += multiverseIncrease;
        
        // Calculate parallelized propagation FPS before resetting
        this.calculateAndAddParallelizedPropagationFPS();
        
        // Reset all progress but keep general upgrades
        this.state.fish = { base: 0, exponent: 0 };
        this.state.fishPerSecond = 0;
        this.state.fishingActive = false;
        this.state.fishingProgress = 0;
        // Keep fishing queue after parallelizing
        // this.state.fishingQueue = 0;
        this.state.fishingFractionalAccumulator = { base: 0, exponent: 0 };
        this.state.containerFishAccumulator = { base: 0, exponent: 0 };
        this.state.containerTickCounter = 0;
        
        // Reset nets
        this.state.nets = { count: 0, capacity: 20, fish: 0, maxFish: 200, fractionalAccumulator: { base: 0, exponent: 0 } };
        this.state.netAutoCollectTimer = 0;
        this.state.netAutoCollectActive = false;
        
        // Reset local upgrades
        this.state.localUpgrades = {
            rodLevel: 0,
            netLevel: 0,
            baitLevel: 0
        };
        
        // Reset progression
        this.state.currentTier = 'pond';
        this.state.tierCount = 1;
        this.state.universeNumber = 1;
        
        // Reset containers
        this.state.containers = {
            ponds: [],
            lakes: [],
            oceans: [],
            planets: [],
            solar: [],
            galaxies: [],
            universes: []
        };
        
        // Reset multiverse multiplier
        this.state.multiverseMultiplier = 1.0;
        
        // Keep general upgrades intact
        // Keep parallelMultiverses (already incremented)
        
        this.save();
        return true;
    }

    calculateFishingFPS() {
        // Calculate fish per second from active fishing
        const state = this.state;
        
        // Base fishing duration (in milliseconds)
        const baseDuration = state.fishingDuration;
        const speedMultiplier = state.coefficients.fishingSpeedMultiplier;
        
        // Apply bait upgrades to speed using safe power
        const baitMultiplier = this.safePower(1.2, state.localUpgrades.baitLevel);
        
        // Apply bait mastery multiplier to speed
        const baitMasteryMultiplier = this.getBaitMasteryMultiplier();
        
        // Calculate actual duration using safe number operations
        const speedMultiplierSafe = this.createNumber(speedMultiplier);
        const baitMultiplierSafe = this.toSafeNumber(baitMultiplier);
        const baitMasteryMultiplierSafe = this.toSafeNumber(baitMasteryMultiplier);
        
        // actualDuration = baseDuration / (speedMultiplier * baitMultiplier * baitMasteryMultiplier)
        const denominator = this.multiplyNumbers(speedMultiplierSafe, this.multiplyNumbers(baitMultiplierSafe, baitMasteryMultiplierSafe));
        const actualDuration = baseDuration / this.toRegularNumber(denominator);
        
        // Calculate fish per catch using safe number operations
        let fishPerCatch = this.createNumber(1);
        
        // Apply rod upgrades
        if (state.localUpgrades.rodLevel > 0) {
            const rodMultiplier = this.safePower(1.5, state.localUpgrades.rodLevel);
            fishPerCatch = this.multiplyNumbers(fishPerCatch, this.toSafeNumber(rodMultiplier));
        }
        
        // Apply catch fish multiplier
        fishPerCatch = this.multiplyNumbers(fishPerCatch, this.createNumber(state.generalUpgrades.catchFishMultiplier));
        
        // Apply fishing mastery multiplier
        const fishingMasteryMultiplier = this.toSafeNumber(this.getFishingMasteryMultiplier());
        fishPerCatch = this.multiplyNumbers(fishPerCatch, fishingMasteryMultiplier);
        
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
        fishPerCatch = this.multiplyNumbers(fishPerCatch, this.createNumber(tierMultiplier));
        
        // Calculate fish per second using safe number operations
        // fishPerSecond = fishPerCatch / (actualDuration / 1000)
        const durationInSeconds = this.createNumber(actualDuration / 1000);
        
        // Safety check to prevent division by zero
        if (this.compareNumbers(durationInSeconds, this.createNumber(0)) <= 0) {
            // If duration is 0 or negative, return a very high FPS
            return this.createNumber(Number.MAX_VALUE);
        }
        
        const fishPerSecond = this.divideNumbers(fishPerCatch, durationInSeconds);
        
        return fishPerSecond;
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
            fractionalAccumulator: { base: 0, exponent: 0 }
        };
        
        this.state.fishingActive = false;
        this.state.fishingProgress = 0;
        // Preserve fishing queue during multiply/ascend
        // this.state.fishingQueue = 0;
    }
}

// Initialize game state
window.gameState = new GameState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
