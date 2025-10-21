/**
 * Multiversal Fishing Simulator - Progression System
 * Handles bodies, ponds, lakes, oceans, planets, solar systems, galaxies, universes
 */

class ProgressionSystem {
    constructor() {
        this.upgradeSections = {
            localUpgrades: null,
            generalUpgrades: null,
            progressionUpgrades: null,
            autobuyers: null
        };
        
        this.initializeElements();
        this.setupUpgrades();
    }

    initializeElements() {
        this.upgradeSections.localUpgrades = document.getElementById('local-upgrades');
        this.upgradeSections.generalUpgrades = document.getElementById('general-upgrades');
        this.upgradeSections.progressionUpgrades = document.getElementById('progression-upgrades');
        this.upgradeSections.autobuyers = document.getElementById('autobuyers');
    }

    setupUpgrades() {
        this.createLocalUpgrades();
        this.createGeneralUpgrades();
        this.createProgressionUpgrades();
        // Autobuyers removed
    }

    update(deltaTime) {
        // Autobuyers removed
        this.updateUpgradeAvailability();
    }

    // Local Upgrades (apply to current tier only)
    createLocalUpgrades() {
        if (!this.upgradeSections.localUpgrades) return;
        
        // Rod upgrades (10 levels)
        this.createRodUpgrades();
        
        // Net upgrades (10 levels)
        this.createNetUpgrades();
        
        // Bait upgrades (10 levels)
        this.createBaitUpgrades();
    }

    createRodUpgrades() {
        const rodUpgrade = document.createElement('div');
        rodUpgrade.className = 'upgrade-item';
        rodUpgrade.id = 'rod-upgrade';
        
        rodUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name" id="rod-name">Better Rod</div>
                <div class="upgrade-effect" id="rod-effect">+50% fish per catch</div>
            </div>
            <div class="upgrade-cost" id="rod-cost">10 fish</div>
        `;
        
        rodUpgrade.addEventListener('click', () => this.buyRodUpgrade());
        this.upgradeSections.localUpgrades.appendChild(rodUpgrade);
    }

    createNetUpgrades() {
        const netUpgrade = document.createElement('div');
        netUpgrade.className = 'upgrade-item';
        netUpgrade.id = 'net-upgrade';
        
        netUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name" id="net-name">Fishing Net</div>
                <div class="upgrade-effect" id="net-effect">Passive fish generation</div>
            </div>
            <div class="upgrade-cost" id="net-cost">25 fish</div>
        `;
        
        netUpgrade.addEventListener('click', () => this.buyNetUpgrade());
        this.upgradeSections.localUpgrades.appendChild(netUpgrade);
    }

    createBaitUpgrades() {
        const baitUpgrade = document.createElement('div');
        baitUpgrade.className = 'upgrade-item';
        baitUpgrade.id = 'bait-upgrade';
        
        baitUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name" id="bait-name">Better Bait</div>
                <div class="upgrade-effect" id="bait-effect">+10% fishing speed</div>
            </div>
            <div class="upgrade-cost" id="bait-cost">50 fish</div>
        `;
        
        baitUpgrade.addEventListener('click', () => this.buyBaitUpgrade());
        this.upgradeSections.localUpgrades.appendChild(baitUpgrade);
    }

    // General Upgrades (persist across tiers)
    createGeneralUpgrades() {
        if (!this.upgradeSections.generalUpgrades) return;
        
        // Catch Fish Multipliers
        this.createCatchFishMultipliers();
        
        // Auto Collect Nets
        this.createAutoCollectNets();
    }

    createCatchFishMultipliers() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'catch-multiplier-upgrade';
        
        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name" id="catch-multiplier-name">Catch Fish x1</div>
                <div class="upgrade-effect" id="catch-multiplier-effect">Click once to catch 1 fish</div>
            </div>
            <div class="upgrade-cost" id="catch-multiplier-cost">1000 fish</div>
        `;
        
        upgrade.addEventListener('click', () => this.buyCatchFishMultiplier());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoCollectNets() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-collect-nets';
        
        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto Collect Nets</div>
                <div class="upgrade-effect">Automatically collect nets when full</div>
            </div>
            <div class="upgrade-cost" id="auto-collect-nets-cost">10000 fish</div>
        `;
        
        upgrade.addEventListener('click', () => this.buyAutoCollectNets());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    // Progression Upgrades (Multiply and Ascend)
    createProgressionUpgrades() {
        if (!this.upgradeSections.progressionUpgrades) return;
        
        // Multiply button
        this.createMultiplyUpgrade();
        
        // Ascend button
        this.createAscendUpgrade();
    }

    createMultiplyUpgrade() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item progression';
        upgrade.id = 'multiply-upgrade';
        
        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Add Current <span id="multiply-tier-name">Pond</span>, Start New <span id="multiply-tier-name-new">Pond</span></div>
                <div class="upgrade-effect">Add current progress to Multiverse and reset</div>
            </div>
            <div class="upgrade-cost" id="multiply-cost">1000 fish</div>
        `;
        
        upgrade.addEventListener('click', () => this.buyMultiply());
        this.upgradeSections.progressionUpgrades.appendChild(upgrade);
    }

    createAscendUpgrade() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item progression';
        upgrade.id = 'ascend-upgrade';
        
        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name" id="ascend-tier-name">Ascend to Lake</div>
                <div class="upgrade-effect">Aggregate all Multiverse progress and move to next tier</div>
            </div>
            <div class="upgrade-cost" id="ascend-cost">100000 fish</div>
        `;
        
        upgrade.addEventListener('click', () => this.buyAscend());
        this.upgradeSections.progressionUpgrades.appendChild(upgrade);
    }

    // Helper methods for upgrade names
    getRodNames() {
        const state = window.gameState.state;
        const tier = state.currentTier;
        
        const rodNames = {
            'pond': ['Wooden Rod', 'Iron Rod', 'Copper Rod', 'Bronze Rod', 'Steel Rod', 'Silver Rod', 'Gold Rod', 'Platinum Rod', 'Diamond Rod', 'Mithril Rod'],
            'lake': ['Fiberglass Rod', 'Carbon Fiber Rod', 'Titanium Rod', 'Ceramic Rod', 'Composite Rod', 'Nano Rod', 'Quantum Rod', 'Crystal Rod', 'Energy Rod', 'Plasma Rod'],
            'ocean': ['Hydrodynamic Rod', 'Pressure Rod', 'Deep Sea Rod', 'Abyssal Rod', 'Trench Rod', 'Current Rod', 'Tidal Rod', 'Tsunami Rod', 'Whirlpool Rod', 'Vortex Rod'],
            'planet': ['Gravity Rod', 'Atmospheric Rod', 'Magnetic Rod', 'Seismic Rod', 'Volcanic Rod', 'Tectonic Rod', 'Core Rod', 'Mantle Rod', 'Crust Rod', 'Surface Rod'],
            'solar': ['Solar Rod', 'Stellar Rod', 'Fusion Rod', 'Plasma Rod', 'Corona Rod', 'Flare Rod', 'Nova Rod', 'Supernova Rod', 'Pulsar Rod', 'Quasar Rod'],
            'galaxy': ['Galactic Rod', 'Spiral Rod', 'Elliptical Rod', 'Irregular Rod', 'Barred Rod', 'Ring Rod', 'Lenticular Rod', 'Dwarf Rod', 'Giant Rod', 'Supermassive Rod'],
            'universe': ['Universal Rod', 'Cosmic Rod', 'Infinite Rod', 'Eternal Rod', 'Omnipotent Rod', 'Transcendent Rod', 'Divine Rod', 'Godlike Rod', 'Absolute Rod', 'Ultimate Rod']
        };
        
        return rodNames[tier] || rodNames['pond'];
    }

    getNetNames() {
        const state = window.gameState.state;
        const tier = state.currentTier;
        
        const netNames = {
            'pond': ['Basic Net', 'Mesh Net', 'Fine Net', 'Strong Net', 'Reinforced Net', 'Steel Net', 'Chain Net', 'Wire Net', 'Fiber Net', 'Advanced Net'],
            'lake': ['Lake Net', 'Deep Net', 'Wide Net', 'Long Net', 'Multi Net', 'Smart Net', 'Auto Net', 'Precision Net', 'Efficient Net', 'Master Net'],
            'ocean': ['Ocean Net', 'Current Net', 'Pressure Net', 'Depth Net', 'Tidal Net', 'Wave Net', 'Flow Net', 'Stream Net', 'Drift Net', 'Ocean Master Net'],
            'planet': ['Planetary Net', 'Atmospheric Net', 'Gravity Net', 'Magnetic Net', 'Seismic Net', 'Tectonic Net', 'Core Net', 'Mantle Net', 'Crust Net', 'Planet Master Net'],
            'solar': ['Solar Net', 'Stellar Net', 'Fusion Net', 'Plasma Net', 'Corona Net', 'Flare Net', 'Nova Net', 'Supernova Net', 'Pulsar Net', 'Solar Master Net'],
            'galaxy': ['Galactic Net', 'Spiral Net', 'Elliptical Net', 'Irregular Net', 'Barred Net', 'Ring Net', 'Lenticular Net', 'Dwarf Net', 'Giant Net', 'Galaxy Master Net'],
            'universe': ['Universal Net', 'Cosmic Net', 'Infinite Net', 'Eternal Net', 'Omnipotent Net', 'Transcendent Net', 'Divine Net', 'Godlike Net', 'Absolute Net', 'Ultimate Net']
        };
        
        return netNames[tier] || netNames['pond'];
    }

    getBaitNames() {
        const state = window.gameState.state;
        const tier = state.currentTier;
        
        const baitNames = {
            'pond': ['Worm Bait', 'Bread Bait', 'Corn Bait', 'Cheese Bait', 'Meat Bait', 'Fish Bait', 'Shrimp Bait', 'Cricket Bait', 'Maggot Bait', 'Premium Bait'],
            'lake': ['Lake Bait', 'Minnow Bait', 'Crayfish Bait', 'Frog Bait', 'Leech Bait', 'Grub Bait', 'Nymph Bait', 'Larva Bait', 'Pupa Bait', 'Lake Master Bait'],
            'ocean': ['Ocean Bait', 'Squid Bait', 'Crab Bait', 'Lobster Bait', 'Eel Bait', 'Octopus Bait', 'Jellyfish Bait', 'Plankton Bait', 'Krill Bait', 'Ocean Master Bait'],
            'planet': ['Planetary Bait', 'Atmospheric Bait', 'Gravity Bait', 'Magnetic Bait', 'Seismic Bait', 'Tectonic Bait', 'Core Bait', 'Mantle Bait', 'Crust Bait', 'Planet Master Bait'],
            'solar': ['Solar Bait', 'Stellar Bait', 'Fusion Bait', 'Plasma Bait', 'Corona Bait', 'Flare Bait', 'Nova Bait', 'Supernova Bait', 'Pulsar Bait', 'Solar Master Bait'],
            'galaxy': ['Galactic Bait', 'Spiral Bait', 'Elliptical Bait', 'Irregular Bait', 'Barred Bait', 'Ring Bait', 'Lenticular Bait', 'Dwarf Bait', 'Giant Bait', 'Galaxy Master Bait'],
            'universe': ['Universal Bait', 'Cosmic Bait', 'Infinite Bait', 'Eternal Bait', 'Omnipotent Bait', 'Transcendent Bait', 'Divine Bait', 'Godlike Bait', 'Absolute Bait', 'Ultimate Bait']
        };
        
        return baitNames[tier] || baitNames['pond'];
    }

    // Purchase methods
    buyRodUpgrade() {
        const state = window.gameState.state;
        const cost = this.getRodUpgradeCost(state.localUpgrades.rodLevel);
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && state.localUpgrades.rodLevel < 10) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.localUpgrades.rodLevel++;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log(`Rod upgraded to level ${state.localUpgrades.rodLevel}!`);
            return true;
        }
        
        return false;
    }

    buyNetUpgrade() {
        const state = window.gameState.state;
        const cost = this.getNetUpgradeCost(state.localUpgrades.netLevel);
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && state.localUpgrades.netLevel < 10) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.localUpgrades.netLevel++;
            state.nets.count++;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log(`Net upgraded to level ${state.localUpgrades.netLevel}!`);
            return true;
        }
        
        return false;
    }

    buyBaitUpgrade() {
        const state = window.gameState.state;
        const cost = this.getBaitUpgradeCost(state.localUpgrades.baitLevel);
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && state.localUpgrades.baitLevel < 10) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.localUpgrades.baitLevel++;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log(`Bait upgraded to level ${state.localUpgrades.baitLevel}!`);
            return true;
        }
        
        return false;
    }

    buyCatchFishMultiplier() {
        const state = window.gameState.state;
        const multipliers = [1, 5, 10, 20, 50, 100];
        const currentMultiplier = state.generalUpgrades.catchFishMultiplier;
        const currentIndex = multipliers.indexOf(currentMultiplier);
        
        if (currentIndex < multipliers.length - 1) {
            const nextMultiplier = multipliers[currentIndex + 1];
            const cost = this.getCatchFishMultiplierCost(nextMultiplier);
            
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
                state.fish = window.gameState.subtractNumbers(state.fish, cost);
                state.generalUpgrades.catchFishMultiplier = nextMultiplier;
                
                window.gameState.save();
                this.updateUpgradeAvailability();
                console.log(`Catch Fish multiplier upgraded to x${nextMultiplier}!`);
                return true;
            }
        }
        
        return false;
    }

    buyAutoCollectNets() {
        const state = window.gameState.state;
        const cost = this.getAutoCollectNetsCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.autoCollectNets) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoCollectNets = true;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto Collect Nets purchased!');
            return true;
        }
        
        return false;
    }

    buyMultiply() {
        const state = window.gameState.state;
        const cost = this.getMultiplyCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            
            if (window.gameState.multiply()) {
                this.updateUpgradeAvailability();
                console.log('Multiplied! New pond started.');
                return true;
            }
        }
        
            return false;
    }

    buyAscend() {
        const state = window.gameState.state;
        const cost = this.getAscendCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            
            if (window.gameState.ascend()) {
                this.updateUpgradeAvailability();
                console.log('Ascended! Moved to next tier.');
                return true;
            }
        }
        
        return false;
    }

    // Cost calculation methods
    getRodUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = 10;
        
        // Increase base cost based on current tier
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
        const levelMultiplier = Math.pow(1.5, level);
        const totalCost = baseCost * tierMultiplier * levelMultiplier;
        
        return window.gameState.createNumber(totalCost);
    }

    getNetUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = 25;
        
        // Increase base cost based on current tier
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
        const levelMultiplier = Math.pow(1.5, level);
        const totalCost = baseCost * tierMultiplier * levelMultiplier;
        
        return window.gameState.createNumber(totalCost);
    }

    getBaitUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = 50;
        
        // Increase base cost based on current tier
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
        const levelMultiplier = Math.pow(1.5, level);
        const totalCost = baseCost * tierMultiplier * levelMultiplier;
        
        return window.gameState.createNumber(totalCost);
    }

    getCatchFishMultiplierCost(multiplier) {
        return window.gameState.createNumber(multiplier * 1000);
    }

    getAutoCollectNetsCost() {
        return window.gameState.createNumber(10000);
    }

    getMultiplyCost() {
        const state = window.gameState.state;
        const baseCost = 1000;
        
        // Increase cost based on current tier
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
        
        // Increase cost based on number of containers in current tier
        const tierToContainerKey = {
            'pond': 'ponds',
            'lake': 'lakes', 
            'ocean': 'oceans',
            'planet': 'planets',
            'solar': 'solar',
            'galaxy': 'galaxies',
            'universe': 'universes'
        };
        
        const containerKey = tierToContainerKey[state.currentTier];
        const containerCount = containerKey ? (state.containers[containerKey] ? state.containers[containerKey].length : 0) : 0;
        const containerMultiplier = Math.pow(1.5, containerCount);
        
        const totalCost = baseCost * tierMultiplier * containerMultiplier;
        return window.gameState.createNumber(totalCost);
    }

    getAscendCost() {
        const state = window.gameState.state;
        const baseCost = 100000;
        
        // Increase cost based on current tier only
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
        const totalCost = baseCost * tierMultiplier;
        return window.gameState.createNumber(totalCost);
    }

    // Autobuyers
    // Autobuyers removed from game

    // Autobuyer methods removed

    // Affordability checks
    canAffordRodUpgrade() {
        const state = window.gameState.state;
        const cost = this.getRodUpgradeCost(state.localUpgrades.rodLevel);
        return window.gameState.compareNumbers(state.fish, cost) >= 0;
    }

    canAffordNetUpgrade() {
        const state = window.gameState.state;
        const cost = this.getNetUpgradeCost(state.localUpgrades.netLevel);
        return window.gameState.compareNumbers(state.fish, cost) >= 0;
    }

    canAffordBaitUpgrade() {
        const state = window.gameState.state;
        const cost = this.getBaitUpgradeCost(state.localUpgrades.baitLevel);
        return window.gameState.compareNumbers(state.fish, cost) >= 0;
    }

    canAffordMultiply() {
        const state = window.gameState.state;
        const cost = this.getMultiplyCost();
        return window.gameState.compareNumbers(state.fish, cost) >= 0;
    }

    canAffordAscend() {
        const state = window.gameState.state;
        const cost = this.getAscendCost();
        return window.gameState.compareNumbers(state.fish, cost) >= 0;
    }

    // UI Updates
    updateUpgradeAvailability() {
        this.updateLocalUpgradeUI();
        this.updateGeneralUpgradeUI();
        this.updateProgressionUpgradeUI();
        // Autobuyer UI removed
    }

    updateLocalUpgradeUI() {
        // Update rod upgrade
        const rodElement = document.getElementById('rod-upgrade');
        const rodCostElement = document.getElementById('rod-cost');
        const rodNameElement = document.getElementById('rod-name');
        const rodEffectElement = document.getElementById('rod-effect');
        
        if (rodElement && rodCostElement && rodNameElement && rodEffectElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getRodUpgradeCost(state.localUpgrades.rodLevel)) >= 0;
            const isAvailable = state.localUpgrades.rodLevel < 10;
            const cost = this.getRodUpgradeCost(state.localUpgrades.rodLevel);
            
            const rodNames = this.getRodNames();
            const rodName = state.localUpgrades.rodLevel < rodNames.length ? rodNames[state.localUpgrades.rodLevel] : 'Max Level';
            const rodEffect = state.localUpgrades.rodLevel < 10 ? `+${Math.pow(1.5, state.localUpgrades.rodLevel + 1).toFixed(1)}x fish per catch` : 'Max Level';
            
            rodNameElement.textContent = rodName;
            rodEffectElement.textContent = rodEffect;
            rodCostElement.textContent = isAvailable ? `${window.gameState.formatNumber(cost)} fish` : 'Max Level';
            
            rodElement.classList.toggle('affordable', canAfford && isAvailable);
            rodElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
        }
        
        // Update net upgrade
        const netElement = document.getElementById('net-upgrade');
        const netCostElement = document.getElementById('net-cost');
        const netNameElement = document.getElementById('net-name');
        const netEffectElement = document.getElementById('net-effect');
        
        if (netElement && netCostElement && netNameElement && netEffectElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getNetUpgradeCost(state.localUpgrades.netLevel)) >= 0;
            const isAvailable = state.localUpgrades.netLevel < 10;
            const cost = this.getNetUpgradeCost(state.localUpgrades.netLevel);
            
            const netNames = this.getNetNames();
            const netName = state.localUpgrades.netLevel < netNames.length ? netNames[state.localUpgrades.netLevel] : 'Max Level';
            const netEffect = state.localUpgrades.netLevel < 10 ? `+1 net, +${Math.pow(1.2, state.localUpgrades.netLevel + 1).toFixed(1)}x capacity` : 'Max Level';
            
            netNameElement.textContent = netName;
            netEffectElement.textContent = netEffect;
            netCostElement.textContent = isAvailable ? `${window.gameState.formatNumber(cost)} fish` : 'Max Level';
            
            netElement.classList.toggle('affordable', canAfford && isAvailable);
            netElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
        }
        
        // Update bait upgrade
        const baitElement = document.getElementById('bait-upgrade');
        const baitCostElement = document.getElementById('bait-cost');
        const baitNameElement = document.getElementById('bait-name');
        const baitEffectElement = document.getElementById('bait-effect');
        
        if (baitElement && baitCostElement && baitNameElement && baitEffectElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getBaitUpgradeCost(state.localUpgrades.baitLevel)) >= 0;
            const isAvailable = state.localUpgrades.baitLevel < 10;
            const cost = this.getBaitUpgradeCost(state.localUpgrades.baitLevel);
            
            const baitNames = this.getBaitNames();
            const baitName = state.localUpgrades.baitLevel < baitNames.length ? baitNames[state.localUpgrades.baitLevel] : 'Max Level';
            const baitEffect = state.localUpgrades.baitLevel < 10 ? `+${Math.pow(1.1, state.localUpgrades.baitLevel + 1).toFixed(1)}x fishing speed` : 'Max Level';
            
            baitNameElement.textContent = baitName;
            baitEffectElement.textContent = baitEffect;
            baitCostElement.textContent = isAvailable ? `${window.gameState.formatNumber(cost)} fish` : 'Max Level';
            
            baitElement.classList.toggle('affordable', canAfford && isAvailable);
            baitElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
        }
    }

    updateGeneralUpgradeUI() {
        // Update catch fish multiplier
        const multiplierElement = document.getElementById('catch-multiplier-upgrade');
        const multiplierCostElement = document.getElementById('catch-multiplier-cost');
        const multiplierNameElement = document.getElementById('catch-multiplier-name');
        const multiplierEffectElement = document.getElementById('catch-multiplier-effect');
        
        if (multiplierElement && multiplierCostElement && multiplierNameElement && multiplierEffectElement) {
            const state = window.gameState.state;
            const multipliers = [1, 5, 10, 20, 50, 100];
            const currentMultiplier = state.generalUpgrades.catchFishMultiplier;
            const currentIndex = multipliers.indexOf(currentMultiplier);
            
            if (currentIndex < multipliers.length - 1) {
                const nextMultiplier = multipliers[currentIndex + 1];
                const cost = this.getCatchFishMultiplierCost(nextMultiplier);
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                
                multiplierNameElement.textContent = `Catch Fish x${nextMultiplier}`;
                multiplierEffectElement.textContent = `Click once to catch ${nextMultiplier} fish`;
                multiplierCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                
                multiplierElement.classList.toggle('affordable', canAfford);
                multiplierElement.classList.toggle('unaffordable', !canAfford);
            } else {
                multiplierNameElement.textContent = 'Catch Fish x100';
                multiplierEffectElement.textContent = 'Click once to catch 100 fish';
                multiplierCostElement.textContent = 'Max Level';
                
                multiplierElement.classList.remove('affordable', 'unaffordable');
                multiplierElement.classList.add('purchased');
            }
        }
        
        // Update auto collect nets
        const element = document.getElementById('auto-collect-nets');
        const costElement = document.getElementById('auto-collect-nets-cost');
        
        if (element && costElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getAutoCollectNetsCost()) >= 0;
            const isAvailable = !state.generalUpgrades.autoCollectNets;
            const cost = this.getAutoCollectNetsCost();
        
        costElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
        
            element.classList.toggle('affordable', canAfford && isAvailable);
            element.classList.toggle('unaffordable', !canAfford || !isAvailable);
            element.classList.toggle('purchased', !isAvailable);
        }
    }

    updateProgressionUpgradeUI() {
        // Update multiply button
        const multiplyElement = document.getElementById('multiply-upgrade');
        const multiplyCostElement = document.getElementById('multiply-cost');
        const multiplyTierNameElement = document.getElementById('multiply-tier-name');
        const multiplyTierNameNewElement = document.getElementById('multiply-tier-name-new');
        
        if (multiplyElement && multiplyCostElement && multiplyTierNameElement && multiplyTierNameNewElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getMultiplyCost()) >= 0;
            const cost = this.getMultiplyCost();
            
            // Update tier names
            const tierName = state.currentTier.charAt(0).toUpperCase() + state.currentTier.slice(1);
            multiplyTierNameElement.textContent = tierName;
            multiplyTierNameNewElement.textContent = tierName;
            
            multiplyCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            
            multiplyElement.classList.toggle('affordable', canAfford);
            multiplyElement.classList.toggle('unaffordable', !canAfford);
        }
        
        // Update ascend button
        const ascendElement = document.getElementById('ascend-upgrade');
        const ascendCostElement = document.getElementById('ascend-cost');
        const ascendTierNameElement = document.getElementById('ascend-tier-name');
        
        if (ascendElement && ascendCostElement && ascendTierNameElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getAscendCost()) >= 0;
            const cost = this.getAscendCost();
            
            // Update ascend tier name
            const tiers = ['pond', 'lake', 'ocean', 'planet', 'solar', 'galaxy', 'universe'];
            const currentIndex = tiers.indexOf(state.currentTier);
            
            if (currentIndex < tiers.length - 1) {
                const nextTier = tiers[currentIndex + 1];
                const nextTierName = nextTier.charAt(0).toUpperCase() + nextTier.slice(1);
                ascendTierNameElement.textContent = `Ascend to ${nextTierName}`;
                ascendElement.style.display = 'block'; // Show ascend button
            } else {
                // At Universe tier, hide the ascend button
                ascendElement.style.display = 'none';
                return;
            }
            
            ascendCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            
            ascendElement.classList.toggle('affordable', canAfford);
            ascendElement.classList.toggle('unaffordable', !canAfford);
        }
    }

    // Autobuyer UI removed

    updateTierUI() {
        const universeElement = document.getElementById('universe-number');
        const tierElement = document.getElementById('current-tier');
        
        if (universeElement) {
            universeElement.textContent = window.gameState.state.universeNumber;
        }
        
        if (tierElement) {
            tierElement.textContent = window.gameState.state.currentTier.charAt(0).toUpperCase() + window.gameState.state.currentTier.slice(1);
        }
    }

    // Debug methods
    addBodies(count) {
        window.gameState.state.tierCount += count;
        window.gameState.save();
    }

    setTier(tier) {
        window.gameState.state.currentTier = tier;
        window.gameState.save();
    }

    unlockAllAutobuyers() {
        const state = window.gameState.state;
        state.autobuyers.rods = true;
        state.autobuyers.nets = true;
        state.autobuyers.bait = true;
        state.autobuyers.multiply = true;
        state.autobuyers.ascend = true;
        window.gameState.save();
    }
}

// Initialize progression system
window.progressionSystem = new ProgressionSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressionSystem;
}
