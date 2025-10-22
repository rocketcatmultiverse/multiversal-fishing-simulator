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
        this.restorePurchasedUpgrades();
    }

    initializeElements() {
        this.upgradeSections.localUpgrades = document.getElementById('local-upgrades');
        this.upgradeSections.generalUpgrades = document.getElementById('general-upgrades');
        this.upgradeSections.progressionUpgrades = document.getElementById('progression-upgrades');
        this.upgradeSections.autobuyers = document.getElementById('autobuyers');
        this.upgradeSections.purchasedUpgrades = document.getElementById('purchased-upgrades-list');
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

    createPurchasedUpgradeItem(name) {
        const item = document.createElement('div');
        item.className = 'purchased-upgrade-item';
        item.textContent = name;
        return item;
    }

    addPurchasedUpgrade(name) {
        if (this.upgradeSections.purchasedUpgrades) {
            const item = this.createPurchasedUpgradeItem(name);
            this.upgradeSections.purchasedUpgrades.appendChild(item);
        }
    }

    removeUpgradeFromGeneral(upgradeId) {
        const element = document.getElementById(upgradeId);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    restorePurchasedUpgrades() {
        // Wait for game state to be loaded
        if (!window.gameState || !window.gameState.state) {
            setTimeout(() => this.restorePurchasedUpgrades(), 100);
            return;
        }
        
        const state = window.gameState.state;
        
        // Restore Auto Collect Nets if purchased
        if (state.generalUpgrades.autoCollectNets) {
            this.addPurchasedUpgrade('Auto Collect Nets');
            this.removeUpgradeFromGeneral('auto-collect-nets');
        }
        
        // Restore Auto Net Collect Interval if at 0s
        if (state.generalUpgrades.autoNetCollectInterval > 0) {
            const currentInterval = window.gameState.getCurrentNetAutoCollectInterval();
            if (currentInterval <= 0) {
                this.addPurchasedUpgrade('0s Auto Collect Interval');
                this.removeUpgradeFromGeneral('auto-net-collect-interval');
            }
        }
        
        // Restore Max Buyer upgrades if purchased
        if (state.generalUpgrades.rodMaxBuyer) {
            this.addPurchasedUpgrade('Rod Max Buyer');
            this.removeUpgradeFromGeneral('rod-max-buyer-upgrade');
        }
        
        if (state.generalUpgrades.netMaxBuyer) {
            this.addPurchasedUpgrade('Net Max Buyer');
            this.removeUpgradeFromGeneral('net-max-buyer-upgrade');
        }
        
        if (state.generalUpgrades.baitMaxBuyer) {
            this.addPurchasedUpgrade('Bait Max Buyer');
            this.removeUpgradeFromGeneral('bait-max-buyer-upgrade');
        }
        
        if (state.generalUpgrades.maxBuyer) {
            this.addPurchasedUpgrade('Max Buyer');
            this.removeUpgradeFromGeneral('max-buyer-upgrade');
        }
        
        if (state.generalUpgrades.maxCatchFishBuyer) {
            this.addPurchasedUpgrade('Max Catch Fish Buyer');
            this.removeUpgradeFromGeneral('max-catch-fish-buyer-upgrade');
        }
        
        // Restore new parallel multiverse upgrades if purchased
        if (state.generalUpgrades.automaxer) {
            this.addPurchasedUpgrade('Automaxer');
            this.removeUpgradeFromGeneral('automaxer-upgrade');
        }
        
        if (state.generalUpgrades.autoMultiply) {
            this.addPurchasedUpgrade('Auto-multiply');
            this.removeUpgradeFromGeneral('auto-multiply-upgrade');
        }
        
        if (state.generalUpgrades.autoAscend) {
            this.addPurchasedUpgrade('Auto-Ascend');
            this.removeUpgradeFromGeneral('auto-ascend-upgrade');
        }
    }

    // Local Upgrades (apply to current tier only)
    createLocalUpgrades() {
        if (!this.upgradeSections.localUpgrades) return;
        
        // Add Max Buyer button next to header
        this.createLocalMaxBuyerButton();
        
        // Rod upgrades (10 levels)
        this.createRodUpgrades();
        
        // Net upgrades (10 levels)
        this.createNetUpgrades();
        
        // Bait upgrades (10 levels)
        this.createBaitUpgrades();
    }

    createLocalMaxBuyerButton() {
        const maxBuyerButton = document.createElement('button');
        maxBuyerButton.className = 'local-max-buyer-button';
        maxBuyerButton.id = 'local-max-buyer-button';
        maxBuyerButton.textContent = 'Max All';
        maxBuyerButton.style.display = 'none';
        
        maxBuyerButton.addEventListener('click', () => this.buyAllMax());
        
        // Insert at the beginning of local upgrades
        this.upgradeSections.localUpgrades.insertBefore(maxBuyerButton, this.upgradeSections.localUpgrades.firstChild);
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
            <button class="max-button" id="rod-max-button" style="display: none;">Max</button>
        `;
        
        rodUpgrade.addEventListener('click', () => this.buyRodUpgrade());
        
        // Add Max button event listener
        const rodMaxButton = rodUpgrade.querySelector('#rod-max-button');
        if (rodMaxButton) {
            rodMaxButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the main upgrade click
                this.buyRodMax();
            });
        }
        
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
            <button class="max-button" id="net-max-button" style="display: none;">Max</button>
        `;
        
        netUpgrade.addEventListener('click', () => this.buyNetUpgrade());
        
        // Add Max button event listener
        const netMaxButton = netUpgrade.querySelector('#net-max-button');
        if (netMaxButton) {
            netMaxButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the main upgrade click
                this.buyNetMax();
            });
        }
        
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
            <button class="max-button" id="bait-max-button" style="display: none;">Max</button>
        `;
        
        baitUpgrade.addEventListener('click', () => this.buyBaitUpgrade());
        
        // Add Max button event listener
        const baitMaxButton = baitUpgrade.querySelector('#bait-max-button');
        if (baitMaxButton) {
            baitMaxButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the main upgrade click
                this.buyBaitMax();
            });
        }
        
        this.upgradeSections.localUpgrades.appendChild(baitUpgrade);
    }

    // General Upgrades (persist across tiers)
    createGeneralUpgrades() {
        if (!this.upgradeSections.generalUpgrades) return;
        
        // Catch Fish Multipliers
        this.createCatchFishMultipliers();
        
        // Auto Collect Nets
        this.createAutoCollectNets();
        
        // Auto Net Collect Interval
        this.createAutoNetCollectInterval();
        
        // Max Buyer upgrades
        this.createMaxBuyerUpgrades();
        
        // New parallel multiverse upgrades (only show if 2+ parallel multiverses)
        this.createAutomaxer();
        this.createAutoMultiply();
        this.createAutoAscend();
        this.createAutoParallelize();
        this.createMultiversalPropagation();
        this.createFishingMastery();
        this.createNetMastery();
        this.createBaitMastery();
        this.createParallelizedPropagation();
        this.createAutoParallelizedPropagation();
        this.createAutoMultiversalPropagation();
        this.createAutoFishingMastery();
        this.createAutoNetMastery();
        this.createAutoBaitMastery();
        this.createAutoCatchFish();
        this.createParallelMultiverseMultiplier();
        this.createAutoParallelMultiverseMultiplier();
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
            <button class="max-button" id="catch-fish-max-button" style="display: none;">Max</button>
        `;
        
        upgrade.addEventListener('click', () => this.buyCatchFishMultiplier());
        
        // Add Max button event listener
        const catchFishMaxButton = upgrade.querySelector('#catch-fish-max-button');
        if (catchFishMaxButton) {
            catchFishMaxButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the main upgrade click
                this.buyCatchFishMax();
            });
        }
        
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

    createAutoNetCollectInterval() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-net-collect-interval';
        
        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto Net Collect Interval -0.5s</div>
                <div class="upgrade-effect">Reduces auto-collect timer by 0.5 seconds</div>
            </div>
            <div class="upgrade-cost" id="auto-net-collect-interval-cost">50000 fish</div>
        `;
        
        upgrade.addEventListener('click', () => this.buyAutoNetCollectInterval());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    // New parallel multiverse upgrades
    createAutomaxer() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'automaxer-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Automaxer</div>
                <div class="upgrade-effect">Automatically maxes Local Upgrades when you have the fish</div>
            </div>
            <div class="upgrade-cost" id="automaxer-cost">1M fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutomaxer());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoMultiply() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-multiply-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-multiply</div>
                <div class="upgrade-effect">Automatically Multiplies when local upgrades are maxed</div>
            </div>
            <div class="upgrade-cost" id="auto-multiply-cost">10M fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoMultiply());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoAscend() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-ascend-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Ascend</div>
                <div class="upgrade-effect">Automatically Ascends when you have the fish</div>
            </div>
            <div class="upgrade-cost" id="auto-ascend-cost">100M fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoAscend());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoParallelize() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-parallelize-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Parallelize</div>
                <div class="upgrade-effect">Automatically Parallelizes when you have the fish</div>
            </div>
            <div class="upgrade-cost" id="auto-parallelize-cost">1B fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoParallelize());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoParallelizedPropagation() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-parallelized-propagation-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Parallelized Propagation</div>
                <div class="upgrade-effect">Automatically buys Parallelized Propagation upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-parallelized-propagation-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoParallelizedPropagation());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoMultiversalPropagation() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-multiversal-propagation-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Multiversal Propagation</div>
                <div class="upgrade-effect">Automatically buys Multiversal Propagation upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-multiversal-propagation-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoMultiversalPropagation());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoFishingMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-fishing-mastery-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Fishing Mastery</div>
                <div class="upgrade-effect">Automatically buys Fishing Mastery upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-fishing-mastery-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoFishingMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoNetMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-net-mastery-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Net Mastery</div>
                <div class="upgrade-effect">Automatically buys Net Mastery upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-net-mastery-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoNetMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoBaitMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-bait-mastery-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Bait Mastery</div>
                <div class="upgrade-effect">Automatically buys Bait Mastery upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-bait-mastery-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoBaitMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoCatchFish() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-catch-fish-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Catch Fish</div>
                <div class="upgrade-effect">Automatically buys Catch Fish upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-catch-fish-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoCatchFish());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createParallelMultiverseMultiplier() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'parallel-multiverse-multiplier-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Parallel Multiverse Multiplier</div>
                <div class="upgrade-effect">Increases parallel multiverses gained when parallelizing</div>
            </div>
            <div class="upgrade-cost" id="parallel-multiverse-multiplier-cost">1Q fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyParallelMultiverseMultiplier());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createAutoParallelMultiverseMultiplier() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'auto-parallel-multiverse-multiplier-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Auto-Parallel Multiverse Multiplier</div>
                <div class="upgrade-effect">Automatically buys Parallel Multiverse Multiplier upgrades</div>
            </div>
            <div class="upgrade-cost" id="auto-parallel-multiverse-multiplier-cost">1Qi fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyAutoParallelMultiverseMultiplier());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createMultiversalPropagation() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'multiversal-propagation-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Multiversal Propagation</div>
                <div class="upgrade-effect">Each container adds bonus FPS from previous containers</div>
            </div>
            <div class="upgrade-cost" id="multiversal-propagation-cost">1B fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyMultiversalPropagation());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createFishingMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'fishing-mastery-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Fishing Mastery</div>
                <div class="upgrade-effect">Permanent boost to fishing fish gains</div>
            </div>
            <div class="upgrade-cost" id="fishing-mastery-cost">10B fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyFishingMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createNetMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'net-mastery-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Net Mastery</div>
                <div class="upgrade-effect">Permanent boost to net fish gains</div>
            </div>
            <div class="upgrade-cost" id="net-mastery-cost">100B fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyNetMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createBaitMastery() {
        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'bait-mastery-upgrade';

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Bait Mastery</div>
                <div class="upgrade-effect">Permanent boost to bait power</div>
            </div>
            <div class="upgrade-cost" id="bait-mastery-cost">1T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyBaitMastery());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createParallelizedPropagation() {

        const upgrade = document.createElement('div');
        upgrade.className = 'upgrade-item';
        upgrade.id = 'parallelized-propagation-upgrade';
        upgrade.style.display = 'none'; // Hide by default

        upgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Parallelized Propagation</div>
                <div class="upgrade-effect">Carry over FPS from previous parallel multiverses</div>
            </div>
            <div class="upgrade-cost" id="parallelized-propagation-cost">10T fish</div>
        `;

        upgrade.addEventListener('click', () => this.buyParallelizedPropagation());
        this.upgradeSections.generalUpgrades.appendChild(upgrade);
    }

    createMaxBuyerUpgrades() {
        // Rod Max Buyer
        const rodMaxUpgrade = document.createElement('div');
        rodMaxUpgrade.className = 'upgrade-item';
        rodMaxUpgrade.id = 'rod-max-buyer-upgrade';
        
        rodMaxUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Rod Max Buyer</div>
                <div class="upgrade-effect">Automatically buy rod upgrades to max level</div>
            </div>
            <div class="upgrade-cost" id="rod-max-buyer-cost">50000 fish</div>
        `;
        
        rodMaxUpgrade.addEventListener('click', () => this.buyRodMaxBuyer());
        this.upgradeSections.generalUpgrades.appendChild(rodMaxUpgrade);

        // Net Max Buyer
        const netMaxUpgrade = document.createElement('div');
        netMaxUpgrade.className = 'upgrade-item';
        netMaxUpgrade.id = 'net-max-buyer-upgrade';
        
        netMaxUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Net Max Buyer</div>
                <div class="upgrade-effect">Buy net upgrades to max level</div>
            </div>
            <div class="upgrade-cost" id="net-max-buyer-cost">50000 fish</div>
        `;
        
        netMaxUpgrade.addEventListener('click', () => this.buyNetMaxBuyer());
        this.upgradeSections.generalUpgrades.appendChild(netMaxUpgrade);

        // Bait Max Buyer
        const baitMaxUpgrade = document.createElement('div');
        baitMaxUpgrade.className = 'upgrade-item';
        baitMaxUpgrade.id = 'bait-max-buyer-upgrade';
        
        baitMaxUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Bait Max Buyer</div>
                <div class="upgrade-effect">Automatically buy bait upgrades to max level</div>
            </div>
            <div class="upgrade-cost" id="bait-max-buyer-cost">50000 fish</div>
        `;
        
        baitMaxUpgrade.addEventListener('click', () => this.buyBaitMaxBuyer());
        this.upgradeSections.generalUpgrades.appendChild(baitMaxUpgrade);

        // Max Buyer (all three)
        const maxBuyerUpgrade = document.createElement('div');
        maxBuyerUpgrade.className = 'upgrade-item';
        maxBuyerUpgrade.id = 'max-buyer-upgrade';
        
        maxBuyerUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Max Buyer</div>
                <div class="upgrade-effect">Automatically buy all upgrades to max level</div>
            </div>
            <div class="upgrade-cost" id="max-buyer-cost">200000 fish</div>
        `;
        
        maxBuyerUpgrade.addEventListener('click', () => this.buyMaxBuyer());
        this.upgradeSections.generalUpgrades.appendChild(maxBuyerUpgrade);

        // Max Catch Fish Buyer (appears after Max Buyer is purchased)
        const maxCatchFishUpgrade = document.createElement('div');
        maxCatchFishUpgrade.className = 'upgrade-item';
        maxCatchFishUpgrade.id = 'max-catch-fish-buyer-upgrade';
        maxCatchFishUpgrade.style.display = 'none'; // Hidden by default
        
        maxCatchFishUpgrade.innerHTML = `
            <div>
                <div class="upgrade-name">Max Catch Fish Buyer</div>
                <div class="upgrade-effect">Automatically buy catch fish upgrades to max level</div>
            </div>
            <div class="upgrade-cost" id="max-catch-fish-buyer-cost">500000 fish</div>
        `;
        
        maxCatchFishUpgrade.addEventListener('click', () => this.buyMaxCatchFishBuyer());
        this.upgradeSections.generalUpgrades.appendChild(maxCatchFishUpgrade);
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
                <div class="upgrade-name">Multiply <span id="multiply-tier-name">Pond</span></div>
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
                <div class="upgrade-effect">Move to next tier</div>
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
        const currentMultiplier = state.generalUpgrades.catchFishMultiplier;
        
        // Calculate next multiplier: +1 each time
        const nextMultiplier = currentMultiplier + 1;
        const cost = this.getCatchFishMultiplierCost(nextMultiplier);
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.catchFishMultiplier = nextMultiplier;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log(`Catch Fish multiplier upgraded to x${nextMultiplier}!`);
            return true;
        }
        
        return false;
    }

    buyAutoCollectNets() {
        const state = window.gameState.state;
        const cost = this.getAutoCollectNetsCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.autoCollectNets) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoCollectNets = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto Collect Nets');
            this.removeUpgradeFromGeneral('auto-collect-nets');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto Collect Nets purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoNetCollectInterval() {
        const state = window.gameState.state;
        const cost = this.getAutoNetCollectIntervalCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoNetCollectInterval += 1;
            
            // Reduce current timer by 0.5 seconds if auto-collect is active
            if (state.netAutoCollectActive && state.netAutoCollectTimer > 0) {
                state.netAutoCollectTimer = Math.max(0, state.netAutoCollectTimer - 0.5);
            }
            
            // Check if interval reached 0s and move to purchased upgrades
            const newInterval = window.gameState.getCurrentNetAutoCollectInterval();
            if (newInterval <= 0) {
                this.addPurchasedUpgrade('0s Auto Collect Interval');
                this.removeUpgradeFromGeneral('auto-net-collect-interval');
            }
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto Net Collect Interval upgraded!');
            return true;
        }
        
        return false;
    }

    // New parallel multiverse upgrade purchase methods
    buyAutomaxer() {
        const state = window.gameState.state;
        const cost = this.getAutomaxerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.automaxer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Automaxer');
            this.removeUpgradeFromGeneral('automaxer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Automaxer purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoMultiply() {
        const state = window.gameState.state;
        const cost = this.getAutoMultiplyCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoMultiply = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-multiply');
            this.removeUpgradeFromGeneral('auto-multiply-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-multiply purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoAscend() {
        const state = window.gameState.state;
        const cost = this.getAutoAscendCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoAscend = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Ascend');
            this.removeUpgradeFromGeneral('auto-ascend-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Ascend purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoParallelize() {
        const state = window.gameState.state;
        const cost = this.getAutoParallelizeCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoParallelize = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Parallelize');
            this.removeUpgradeFromGeneral('auto-parallelize-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Parallelize purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoParallelizedPropagation() {
        const state = window.gameState.state;
        const cost = this.getAutoParallelizedPropagationCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoParallelizedPropagation = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Parallelized Propagation');
            this.removeUpgradeFromGeneral('auto-parallelized-propagation-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Parallelized Propagation purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoMultiversalPropagation() {
        const state = window.gameState.state;
        const cost = this.getAutoMultiversalPropagationCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoMultiversalPropagation = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Multiversal Propagation');
            this.removeUpgradeFromGeneral('auto-multiversal-propagation-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Multiversal Propagation purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoFishingMastery() {
        const state = window.gameState.state;
        const cost = this.getAutoFishingMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoFishingMastery = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Fishing Mastery');
            this.removeUpgradeFromGeneral('auto-fishing-mastery-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Fishing Mastery purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoNetMastery() {
        const state = window.gameState.state;
        const cost = this.getAutoNetMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoNetMastery = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Net Mastery');
            this.removeUpgradeFromGeneral('auto-net-mastery-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Net Mastery purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoBaitMastery() {
        const state = window.gameState.state;
        const cost = this.getAutoBaitMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoBaitMastery = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Bait Mastery');
            this.removeUpgradeFromGeneral('auto-bait-mastery-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Bait Mastery purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoCatchFish() {
        const state = window.gameState.state;
        const cost = this.getAutoCatchFishCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoCatchFish = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Catch Fish');
            this.removeUpgradeFromGeneral('auto-catch-fish-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Catch Fish purchased!');
            return true;
        }
        
        return false;
    }

    buyParallelMultiverseMultiplier() {
        const state = window.gameState.state;
        const cost = this.getParallelMultiverseMultiplierCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.parallelMultiverseMultiplier += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Parallel Multiverse Multiplier purchased!');
            return true;
        }
        
        return false;
    }

    buyAutoParallelMultiverseMultiplier() {
        const state = window.gameState.state;
        const cost = this.getAutoParallelMultiverseMultiplierCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.autoParallelMultiverseMultiplier = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Auto-Parallel Multiverse Multiplier');
            this.removeUpgradeFromGeneral('auto-parallel-multiverse-multiplier-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Auto-Parallel Multiverse Multiplier purchased!');
            return true;
        }
        
        return false;
    }

    buyMultiversalPropagation() {
        const state = window.gameState.state;
        const cost = this.getMultiversalPropagationCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.multiversalPropagation += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Multiversal Propagation upgraded!');
            return true;
        }
        
        return false;
    }

    buyFishingMastery() {
        const state = window.gameState.state;
        const cost = this.getFishingMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.fishingMastery += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Fishing Mastery upgraded!');
            return true;
        }
        
        return false;
    }

    buyNetMastery() {
        const state = window.gameState.state;
        const cost = this.getNetMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.netMastery += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Net Mastery upgraded!');
            return true;
        }
        
        return false;
    }

    buyBaitMastery() {
        const state = window.gameState.state;
        const cost = this.getBaitMasteryCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.baitMastery += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Bait Mastery upgraded!');
            return true;
        }
        
        return false;
    }

    buyParallelizedPropagation() {
        const state = window.gameState.state;
        const cost = this.getParallelizedPropagationCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.parallelizedPropagation += 1;
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Parallelized Propagation upgraded!');
            return true;
        }
        
        return false;
    }

    buyRodMaxBuyer() {
        const state = window.gameState.state;
        const cost = this.getRodMaxBuyerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.rodMaxBuyer) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.rodMaxBuyer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Rod Max Buyer');
            this.removeUpgradeFromGeneral('rod-max-buyer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Rod Max Buyer purchased!');
            return true;
        }
        
        return false;
    }

    buyNetMaxBuyer() {
        const state = window.gameState.state;
        const cost = this.getNetMaxBuyerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.netMaxBuyer) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.netMaxBuyer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Net Max Buyer');
            this.removeUpgradeFromGeneral('net-max-buyer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Net Max Buyer purchased!');
            return true;
        }
        
        return false;
    }

    buyBaitMaxBuyer() {
        const state = window.gameState.state;
        const cost = this.getBaitMaxBuyerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.baitMaxBuyer) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.baitMaxBuyer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Bait Max Buyer');
            this.removeUpgradeFromGeneral('bait-max-buyer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Bait Max Buyer purchased!');
            return true;
        }
        
        return false;
    }

    buyMaxBuyer() {
        const state = window.gameState.state;
        const cost = this.getMaxBuyerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.maxBuyer) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.maxBuyer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Max Buyer');
            this.removeUpgradeFromGeneral('max-buyer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Max Buyer purchased!');
            return true;
        }
        
        return false;
    }

    buyMaxCatchFishBuyer() {
        const state = window.gameState.state;
        const cost = this.getMaxCatchFishBuyerCost();
        
        if (window.gameState.compareNumbers(state.fish, cost) >= 0 && !state.generalUpgrades.maxCatchFishBuyer) {
            state.fish = window.gameState.subtractNumbers(state.fish, cost);
            state.generalUpgrades.maxCatchFishBuyer = true;
            
            // Move to purchased upgrades
            this.addPurchasedUpgrade('Max Catch Fish Buyer');
            this.removeUpgradeFromGeneral('max-catch-fish-buyer-upgrade');
            
            window.gameState.save();
            this.updateUpgradeAvailability();
            console.log('Max Catch Fish Buyer purchased!');
            return true;
        }
        
        return false;
    }

    buyCatchFishMax() {
        if (!window.gameState.state.generalUpgrades.maxCatchFishBuyer) return false;
        
        let upgradesBought = 0;
        while (this.buyCatchFishMultiplier()) {
            upgradesBought++;
        }
        
        if (upgradesBought > 0) {
            console.log(`Max Catch Fish Buyer: Purchased ${upgradesBought} catch fish upgrades`);
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
            
            // Check if we're at Universe level - use parallelize instead of ascend
            if (state.currentTier === 'universe') {
                if (window.gameState.parallelize()) {
                    this.updateUpgradeAvailability();
                    console.log('Parallelized! Started new multiverse.');
                    return true;
                }
            } else {
                if (window.gameState.ascend()) {
                    this.updateUpgradeAvailability();
                    console.log('Ascended! Moved to next tier.');
                    return true;
                }
            }
        }
        
        return false;
    }

    // Max Buyer functions
    buyRodMax() {
        if (!window.gameState.state.generalUpgrades.rodMaxBuyer) return false;
        
        let upgradesBought = 0;
        while (this.buyRodUpgrade()) {
            upgradesBought++;
        }
        
        if (upgradesBought > 0) {
            console.log(`Rod Max Buyer: Purchased ${upgradesBought} rod upgrades`);
            return true;
        }
        return false;
    }

    buyNetMax() {
        if (!window.gameState.state.generalUpgrades.netMaxBuyer) return false;
        
        let upgradesBought = 0;
        while (this.buyNetUpgrade()) {
            upgradesBought++;
        }
        
        if (upgradesBought > 0) {
            console.log(`Net Max Buyer: Purchased ${upgradesBought} net upgrades`);
            return true;
        }
        return false;
    }

    buyBaitMax() {
        if (!window.gameState.state.generalUpgrades.baitMaxBuyer) return false;
        
        let upgradesBought = 0;
        while (this.buyBaitUpgrade()) {
            upgradesBought++;
        }
        
        if (upgradesBought > 0) {
            console.log(`Bait Max Buyer: Purchased ${upgradesBought} bait upgrades`);
            return true;
        }
        return false;
    }

    buyAllMax() {
        if (!window.gameState.state.generalUpgrades.maxBuyer) return false;
        
        let totalUpgrades = 0;
        
        // Buy rod upgrades first
        while (this.buyRodUpgrade()) {
            totalUpgrades++;
        }
        
        // Then net upgrades
        while (this.buyNetUpgrade()) {
            totalUpgrades++;
        }
        
        // Finally bait upgrades
        while (this.buyBaitUpgrade()) {
            totalUpgrades++;
        }
        
        if (totalUpgrades > 0) {
            console.log(`Max Buyer: Purchased ${totalUpgrades} total upgrades`);
            return true;
        }
        return false;
    }

    // Cost calculation methods
    getRodUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = window.gameState.createNumber(10);
        
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
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const levelMultiplier = window.gameState.safePower(1.5, level);
        const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
        
        // Calculate total cost using safe number operations
        let totalCost = window.gameState.multiplyNumbers(baseCost, tierMultiplier);
        totalCost = window.gameState.multiplyNumbers(totalCost, window.gameState.toSafeNumber(levelMultiplier));
        totalCost = window.gameState.multiplyNumbers(totalCost, parallelizeMultiplier);
        
        return totalCost;
    }

    getNetUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = window.gameState.createNumber(25);
        
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
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const levelMultiplier = window.gameState.safePower(1.5, level);
        const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
        
        // Calculate total cost using safe number operations
        let totalCost = window.gameState.multiplyNumbers(baseCost, tierMultiplier);
        totalCost = window.gameState.multiplyNumbers(totalCost, window.gameState.toSafeNumber(levelMultiplier));
        totalCost = window.gameState.multiplyNumbers(totalCost, parallelizeMultiplier);
        
        return totalCost;
    }

    getBaitUpgradeCost(level) {
        const state = window.gameState.state;
        const baseCost = window.gameState.createNumber(50);
        
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
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const levelMultiplier = window.gameState.safePower(1.5, level);
        const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
        
        // Calculate total cost using safe number operations
        let totalCost = window.gameState.multiplyNumbers(baseCost, tierMultiplier);
        totalCost = window.gameState.multiplyNumbers(totalCost, window.gameState.toSafeNumber(levelMultiplier));
        totalCost = window.gameState.multiplyNumbers(totalCost, parallelizeMultiplier);
        
        return totalCost;
    }

    getCatchFishMultiplierCost(multiplier) {
        // First upgrade costs 1K fish, then exponential scaling
        const baseCost = window.gameState.createNumber(1000);
        const level = multiplier - 1; // Calculate which level this is (0, 1, 2, 3...)
        const costMultiplier = window.gameState.safePower(2, level); // Exponential scaling: 1x, 2x, 4x, 8x...
        return window.gameState.multiplyNumbers(baseCost, window.gameState.toSafeNumber(costMultiplier));
    }

    getAutoCollectNetsCost() {
        return window.gameState.createNumber(10000);
    }

    getAutoNetCollectIntervalCost() {
        const state = window.gameState.state;
        const level = state.generalUpgrades.autoNetCollectInterval;
        // Aggressive exponential scaling: 50K, 100K, 200K, 400K, 800K, 1.6M, 3.2M, 6.4M, 12.8M, 25.6M, 51.2M, 102.4M, 204.8M, 409.6M, 819.2M, 1.638B, 3.276B, 6.552B, 13.104B, 26.208B, 52.416B, 104.832B, 209.664B, 419.328B, 838.656B, 1.677T
        const baseCost = window.gameState.createNumber(50000);
        const multiplier = window.gameState.safePower(2, level);
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getRodMaxBuyerCost() {
        return window.gameState.createNumber(50000);
    }

    getNetMaxBuyerCost() {
        return window.gameState.createNumber(50000);
    }

    getBaitMaxBuyerCost() {
        return window.gameState.createNumber(50000);
    }

    getMaxBuyerCost() {
        return window.gameState.createNumber(200000);
    }

    getMaxCatchFishBuyerCost() {
        return window.gameState.createNumber(500000);
    }

    // New parallel multiverse upgrade cost methods
    getAutomaxerCost() {
        return window.gameState.createNumber(1000000); // 1M fish
    }

    getAutoMultiplyCost() {
        return window.gameState.createNumber(10000000); // 10M fish
    }

    getAutoAscendCost() {
        return window.gameState.createNumber(100000000); // 100M fish
    }

    getAutoParallelizeCost() {
        return window.gameState.createNumber(1000000000); // 1B fish
    }

    getAutoParallelizedPropagationCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getAutoMultiversalPropagationCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getAutoFishingMasteryCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getAutoNetMasteryCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getAutoBaitMasteryCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getAutoCatchFishCost() {
        return window.gameState.createNumber(1000000000000); // 1T fish
    }

    getParallelMultiverseMultiplierCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.parallelMultiverseMultiplier + 1;
        // Exponential scaling starting at 1Q (1e15)
        const baseCost = window.gameState.createNumber(1000000000000000); // 1Q fish
        return window.gameState.multiplyNumbers(baseCost, window.gameState.safePower(10, nextLevel - 1));
    }

    getAutoParallelMultiverseMultiplierCost() {
        return window.gameState.createNumber(1000000000000000000); // 1Qi fish
    }

    getMultiversalPropagationCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.multiversalPropagation + 1;
        // Aggressive exponential scaling starting at 1B
        const baseCost = window.gameState.createNumber(1000000000); // 1B fish
        if (nextLevel === 1) return baseCost;
        const multiplier = window.gameState.safePower(10, nextLevel - 1); // Each level costs 10x more
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getFishingMasteryCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.fishingMastery + 1;
        // Aggressive exponential scaling starting at 10B
        const baseCost = window.gameState.createNumber(10000000000); // 10B fish
        if (nextLevel === 1) return baseCost;
        const multiplier = window.gameState.safePower(10, nextLevel - 1); // Each level costs 10x more
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getNetMasteryCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.netMastery + 1;
        // Aggressive exponential scaling starting at 100B
        const baseCost = window.gameState.createNumber(100000000000); // 100B fish
        if (nextLevel === 1) return baseCost;
        const multiplier = window.gameState.safePower(10, nextLevel - 1); // Each level costs 10x more
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getBaitMasteryCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.baitMastery + 1;
        // Aggressive exponential scaling starting at 1T
        const baseCost = window.gameState.createNumber(1000000000000); // 1T fish
        if (nextLevel === 1) return baseCost;
        const multiplier = window.gameState.safePower(10, nextLevel - 1); // Each level costs 10x more
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getParallelizedPropagationCost() {
        const state = window.gameState.state;
        const nextLevel = state.generalUpgrades.parallelizedPropagation + 1;
        // Aggressive exponential scaling starting at 10T
        const baseCost = window.gameState.createNumber(10000000000000); // 10T fish
        if (nextLevel === 1) return baseCost;
        const multiplier = window.gameState.safePower(10, nextLevel - 1); // Each level costs 10x more
        return window.gameState.multiplyNumbers(baseCost, multiplier);
    }

    getMultiplyCost() {
        const state = window.gameState.state;
        const baseCost = window.gameState.createNumber(1000);
        
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
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        
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
        const containerMultiplier = window.gameState.safePower(1.5, containerCount);
        const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
        
        // Calculate total cost using safe number operations
        let totalCost = window.gameState.multiplyNumbers(baseCost, tierMultiplier);
        totalCost = window.gameState.multiplyNumbers(totalCost, window.gameState.toSafeNumber(containerMultiplier));
        totalCost = window.gameState.multiplyNumbers(totalCost, parallelizeMultiplier);
        
        return totalCost;
    }

    getAscendCost() {
        const state = window.gameState.state;
        const baseCost = window.gameState.createNumber(100000);
        
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
        
        const tierMultiplier = window.gameState.createNumber(tierMultipliers[state.currentTier] || 1);
        const parallelizeMultiplier = window.gameState.toSafeNumber(window.gameState.getParallelizeMultiplier());
        
        // Calculate total cost using safe number operations
        let totalCost = window.gameState.multiplyNumbers(baseCost, tierMultiplier);
        totalCost = window.gameState.multiplyNumbers(totalCost, parallelizeMultiplier);
        
        return totalCost;
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
            const rodEffect = state.localUpgrades.rodLevel < 10 ? `+${window.gameState.toRegularNumber(window.gameState.safePower(1.5, state.localUpgrades.rodLevel + 1)).toFixed(1)}x fish per catch` : 'Max Level';
            
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
            const netEffect = state.localUpgrades.netLevel < 10 ? `+1 net, +${window.gameState.toRegularNumber(window.gameState.safePower(1.2, state.localUpgrades.netLevel + 1)).toFixed(1)}x capacity` : 'Max Level';
            
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
            const baitEffect = state.localUpgrades.baitLevel < 10 ? `+${window.gameState.toRegularNumber(window.gameState.safePower(1.2, state.localUpgrades.baitLevel + 1)).toFixed(1)}x fishing speed` : 'Max Level';
            
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
            const currentMultiplier = state.generalUpgrades.catchFishMultiplier;
            
            // Calculate next multiplier: +1 each time
            const nextMultiplier = currentMultiplier + 1;
            const cost = this.getCatchFishMultiplierCost(nextMultiplier);
            const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
            
            multiplierNameElement.textContent = `Catch Fish x${nextMultiplier}`;
            multiplierEffectElement.textContent = `Click once to catch ${nextMultiplier} fish`;
            multiplierCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            
            multiplierElement.classList.toggle('affordable', canAfford);
            multiplierElement.classList.toggle('unaffordable', !canAfford);
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
        
        // Update auto net collect interval
        const intervalElement = document.getElementById('auto-net-collect-interval');
        const intervalCostElement = document.getElementById('auto-net-collect-interval-cost');
        
        if (intervalElement && intervalCostElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getAutoNetCollectIntervalCost()) >= 0;
            const currentInterval = window.gameState.getCurrentNetAutoCollectInterval();
            const isAvailable = state.generalUpgrades.autoCollectNets && currentInterval > 0; // Hide when interval reaches 0s
            const cost = this.getAutoNetCollectIntervalCost();
            
            // Update the name to show current interval
            const nameElement = intervalElement.querySelector('.upgrade-name');
            if (nameElement) {
                nameElement.textContent = `Auto Net Collect Interval -0.5s (${currentInterval}s)`;
            }
            
            intervalCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            
            intervalElement.classList.toggle('affordable', canAfford && isAvailable);
            intervalElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            intervalElement.style.display = isAvailable ? 'block' : 'none';
        }
        
        // Update Max Buyer upgrades
        this.updateMaxBuyerUI();
    }

    updateMaxBuyerUI() {
        const state = window.gameState.state;
        
        // Update Rod Max Buyer
        const rodMaxElement = document.getElementById('rod-max-buyer-upgrade');
        const rodMaxCostElement = document.getElementById('rod-max-buyer-cost');
        if (rodMaxElement && rodMaxCostElement) {
            const canAfford = window.gameState.compareNumbers(state.fish, this.getRodMaxBuyerCost()) >= 0;
            const isAvailable = !state.generalUpgrades.rodMaxBuyer;
            const cost = this.getRodMaxBuyerCost();
            
            rodMaxCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            rodMaxElement.classList.toggle('affordable', canAfford && isAvailable);
            rodMaxElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            rodMaxElement.classList.toggle('purchased', !isAvailable);
        }

        // Update Net Max Buyer
        const netMaxElement = document.getElementById('net-max-buyer-upgrade');
        const netMaxCostElement = document.getElementById('net-max-buyer-cost');
        if (netMaxElement && netMaxCostElement) {
            const canAfford = window.gameState.compareNumbers(state.fish, this.getNetMaxBuyerCost()) >= 0;
            const isAvailable = !state.generalUpgrades.netMaxBuyer;
            const cost = this.getNetMaxBuyerCost();
            
            netMaxCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            netMaxElement.classList.toggle('affordable', canAfford && isAvailable);
            netMaxElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            netMaxElement.classList.toggle('purchased', !isAvailable);
        }

        // Update Bait Max Buyer
        const baitMaxElement = document.getElementById('bait-max-buyer-upgrade');
        const baitMaxCostElement = document.getElementById('bait-max-buyer-cost');
        if (baitMaxElement && baitMaxCostElement) {
            const canAfford = window.gameState.compareNumbers(state.fish, this.getBaitMaxBuyerCost()) >= 0;
            const isAvailable = !state.generalUpgrades.baitMaxBuyer;
            const cost = this.getBaitMaxBuyerCost();
            
            baitMaxCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            baitMaxElement.classList.toggle('affordable', canAfford && isAvailable);
            baitMaxElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            baitMaxElement.classList.toggle('purchased', !isAvailable);
        }

        // Update Max Buyer (all three)
        const maxBuyerElement = document.getElementById('max-buyer-upgrade');
        const maxBuyerCostElement = document.getElementById('max-buyer-cost');
        if (maxBuyerElement && maxBuyerCostElement) {
            const canAfford = window.gameState.compareNumbers(state.fish, this.getMaxBuyerCost()) >= 0;
            const isAvailable = !state.generalUpgrades.maxBuyer;
            const cost = this.getMaxBuyerCost();
            
            maxBuyerCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            maxBuyerElement.classList.toggle('affordable', canAfford && isAvailable);
            maxBuyerElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            maxBuyerElement.classList.toggle('purchased', !isAvailable);
        }

        // Update Max Catch Fish Buyer (appears after Max Buyer is purchased)
        const maxCatchFishElement = document.getElementById('max-catch-fish-buyer-upgrade');
        const maxCatchFishCostElement = document.getElementById('max-catch-fish-buyer-cost');
        if (maxCatchFishElement && maxCatchFishCostElement) {
            const canAfford = window.gameState.compareNumbers(state.fish, this.getMaxCatchFishBuyerCost()) >= 0;
            const isAvailable = !state.generalUpgrades.maxCatchFishBuyer && state.generalUpgrades.maxBuyer;
            const cost = this.getMaxCatchFishBuyerCost();
            
            maxCatchFishElement.style.display = state.generalUpgrades.maxBuyer ? 'block' : 'none';
            maxCatchFishCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
            maxCatchFishElement.classList.toggle('affordable', canAfford && isAvailable);
            maxCatchFishElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
            maxCatchFishElement.classList.toggle('purchased', !isAvailable);
        }

        // Update new parallel multiverse upgrades (only show if 2+ parallel multiverses)
        if (state.parallelMultiverses >= 2) {
            // Update Automaxer
            const automaxerElement = document.getElementById('automaxer-upgrade');
            const automaxerCostElement = document.getElementById('automaxer-cost');
            if (automaxerElement && automaxerCostElement) {
                const cost = this.getAutomaxerCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.automaxer;
                
                automaxerCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                automaxerElement.classList.toggle('affordable', canAfford && isAvailable);
                automaxerElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                automaxerElement.classList.toggle('purchased', !isAvailable);
                automaxerElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-multiply
            const autoMultiplyElement = document.getElementById('auto-multiply-upgrade');
            const autoMultiplyCostElement = document.getElementById('auto-multiply-cost');
            if (autoMultiplyElement && autoMultiplyCostElement) {
                const cost = this.getAutoMultiplyCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoMultiply;
                
                autoMultiplyCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoMultiplyElement.classList.toggle('affordable', canAfford && isAvailable);
                autoMultiplyElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoMultiplyElement.classList.toggle('purchased', !isAvailable);
                autoMultiplyElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Ascend (only show if Auto-multiply is purchased)
            const autoAscendElement = document.getElementById('auto-ascend-upgrade');
            const autoAscendCostElement = document.getElementById('auto-ascend-cost');
            if (autoAscendElement && autoAscendCostElement) {
                const cost = this.getAutoAscendCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoAscend && state.generalUpgrades.autoMultiply;
                
                autoAscendCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoAscendElement.classList.toggle('affordable', canAfford && isAvailable);
                autoAscendElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoAscendElement.classList.toggle('purchased', !isAvailable);
                autoAscendElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Parallelize (only show if 20+ parallel multiverses)
            const autoParallelizeElement = document.getElementById('auto-parallelize-upgrade');
            const autoParallelizeCostElement = document.getElementById('auto-parallelize-cost');
            if (autoParallelizeElement && autoParallelizeCostElement) {
                const cost = this.getAutoParallelizeCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoParallelize && state.parallelMultiverses >= 20;
                
                autoParallelizeCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoParallelizeElement.classList.toggle('affordable', canAfford && isAvailable);
                autoParallelizeElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoParallelizeElement.classList.toggle('purchased', !isAvailable);
                autoParallelizeElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Parallelized Propagation (only show if 100+ parallel multiverses)
            const autoParallelizedPropagationElement = document.getElementById('auto-parallelized-propagation-upgrade');
            const autoParallelizedPropagationCostElement = document.getElementById('auto-parallelized-propagation-cost');
            if (autoParallelizedPropagationElement && autoParallelizedPropagationCostElement) {
                const cost = this.getAutoParallelizedPropagationCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoParallelizedPropagation && state.parallelMultiverses >= 100;
                
                autoParallelizedPropagationCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoParallelizedPropagationElement.classList.toggle('affordable', canAfford && isAvailable);
                autoParallelizedPropagationElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoParallelizedPropagationElement.classList.toggle('purchased', !isAvailable);
                autoParallelizedPropagationElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Multiversal Propagation (only show if 100+ parallel multiverses)
            const autoMultiversalPropagationElement = document.getElementById('auto-multiversal-propagation-upgrade');
            const autoMultiversalPropagationCostElement = document.getElementById('auto-multiversal-propagation-cost');
            if (autoMultiversalPropagationElement && autoMultiversalPropagationCostElement) {
                const cost = this.getAutoMultiversalPropagationCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoMultiversalPropagation && state.parallelMultiverses >= 100;
                
                autoMultiversalPropagationCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoMultiversalPropagationElement.classList.toggle('affordable', canAfford && isAvailable);
                autoMultiversalPropagationElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoMultiversalPropagationElement.classList.toggle('purchased', !isAvailable);
                autoMultiversalPropagationElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Fishing Mastery (only show if 100+ parallel multiverses)
            const autoFishingMasteryElement = document.getElementById('auto-fishing-mastery-upgrade');
            const autoFishingMasteryCostElement = document.getElementById('auto-fishing-mastery-cost');
            if (autoFishingMasteryElement && autoFishingMasteryCostElement) {
                const cost = this.getAutoFishingMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoFishingMastery && state.parallelMultiverses >= 100;
                
                autoFishingMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoFishingMasteryElement.classList.toggle('affordable', canAfford && isAvailable);
                autoFishingMasteryElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoFishingMasteryElement.classList.toggle('purchased', !isAvailable);
                autoFishingMasteryElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Net Mastery (only show if 100+ parallel multiverses)
            const autoNetMasteryElement = document.getElementById('auto-net-mastery-upgrade');
            const autoNetMasteryCostElement = document.getElementById('auto-net-mastery-cost');
            if (autoNetMasteryElement && autoNetMasteryCostElement) {
                const cost = this.getAutoNetMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoNetMastery && state.parallelMultiverses >= 100;
                
                autoNetMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoNetMasteryElement.classList.toggle('affordable', canAfford && isAvailable);
                autoNetMasteryElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoNetMasteryElement.classList.toggle('purchased', !isAvailable);
                autoNetMasteryElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Bait Mastery (only show if 100+ parallel multiverses)
            const autoBaitMasteryElement = document.getElementById('auto-bait-mastery-upgrade');
            const autoBaitMasteryCostElement = document.getElementById('auto-bait-mastery-cost');
            if (autoBaitMasteryElement && autoBaitMasteryCostElement) {
                const cost = this.getAutoBaitMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoBaitMastery && state.parallelMultiverses >= 100;
                
                autoBaitMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoBaitMasteryElement.classList.toggle('affordable', canAfford && isAvailable);
                autoBaitMasteryElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoBaitMasteryElement.classList.toggle('purchased', !isAvailable);
                autoBaitMasteryElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Catch Fish (only show if 100+ parallel multiverses)
            const autoCatchFishElement = document.getElementById('auto-catch-fish-upgrade');
            const autoCatchFishCostElement = document.getElementById('auto-catch-fish-cost');
            if (autoCatchFishElement && autoCatchFishCostElement) {
                const cost = this.getAutoCatchFishCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoCatchFish && state.parallelMultiverses >= 100;
                
                autoCatchFishCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoCatchFishElement.classList.toggle('affordable', canAfford && isAvailable);
                autoCatchFishElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoCatchFishElement.classList.toggle('purchased', !isAvailable);
                autoCatchFishElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Parallel Multiverse Multiplier (only show if 500+ parallel multiverses)
            const parallelMultiverseMultiplierElement = document.getElementById('parallel-multiverse-multiplier-upgrade');
            const parallelMultiverseMultiplierCostElement = document.getElementById('parallel-multiverse-multiplier-cost');
            if (parallelMultiverseMultiplierElement && parallelMultiverseMultiplierCostElement) {
                const cost = this.getParallelMultiverseMultiplierCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = state.parallelMultiverses >= 500;
                
                const currentLevel = state.generalUpgrades.parallelMultiverseMultiplier;
                const nextLevel = currentLevel + 1;
                
                parallelMultiverseMultiplierCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                parallelMultiverseMultiplierElement.classList.toggle('affordable', canAfford && isAvailable);
                parallelMultiverseMultiplierElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                parallelMultiverseMultiplierElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Auto-Parallel Multiverse Multiplier (only show if 500+ parallel multiverses)
            const autoParallelMultiverseMultiplierElement = document.getElementById('auto-parallel-multiverse-multiplier-upgrade');
            const autoParallelMultiverseMultiplierCostElement = document.getElementById('auto-parallel-multiverse-multiplier-cost');
            if (autoParallelMultiverseMultiplierElement && autoParallelMultiverseMultiplierCostElement) {
                const cost = this.getAutoParallelMultiverseMultiplierCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const isAvailable = !state.generalUpgrades.autoParallelMultiverseMultiplier && state.parallelMultiverses >= 500;
                
                autoParallelMultiverseMultiplierCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                autoParallelMultiverseMultiplierElement.classList.toggle('affordable', canAfford && isAvailable);
                autoParallelMultiverseMultiplierElement.classList.toggle('unaffordable', !canAfford || !isAvailable);
                autoParallelMultiverseMultiplierElement.classList.toggle('purchased', !isAvailable);
                autoParallelMultiverseMultiplierElement.style.display = isAvailable ? 'block' : 'none';
            }

            // Update Multiversal Propagation
            const propagationElement = document.getElementById('multiversal-propagation-upgrade');
            const propagationCostElement = document.getElementById('multiversal-propagation-cost');
            if (propagationElement && propagationCostElement) {
                const cost = this.getMultiversalPropagationCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const currentLevel = state.generalUpgrades.multiversalPropagation;
                const currentCoefficient = window.gameState.getMultiversalPropagationEffectiveness();
                
                // Update the upgrade name to show current coefficient
                const upgradeNameElement = propagationElement.querySelector('.upgrade-name');
                if (upgradeNameElement) {
                    upgradeNameElement.textContent = `Multiversal Propagation (${currentCoefficient.toFixed(1)}x)`;
                }
                
                propagationCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                propagationElement.classList.toggle('affordable', canAfford);
                propagationElement.classList.toggle('unaffordable', !canAfford);
                propagationElement.style.display = 'block';
            }

            // Update Fishing Mastery
            const fishingMasteryElement = document.getElementById('fishing-mastery-upgrade');
            const fishingMasteryCostElement = document.getElementById('fishing-mastery-cost');
            if (fishingMasteryElement && fishingMasteryCostElement) {
                const cost = this.getFishingMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const currentLevel = state.generalUpgrades.fishingMastery;
                const currentBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel));
                const nextBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel + 1));
                
                // Update the upgrade effect to show current and next bonus
                const upgradeEffectElement = fishingMasteryElement.querySelector('.upgrade-effect');
                if (upgradeEffectElement) {
                    upgradeEffectElement.textContent = `Current: ${currentBonus.toFixed(2)}x → Next: ${nextBonus.toFixed(2)}x`;
                }
                
                fishingMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                fishingMasteryElement.classList.toggle('affordable', canAfford);
                fishingMasteryElement.classList.toggle('unaffordable', !canAfford);
                fishingMasteryElement.style.display = 'block';
            }

            // Update Net Mastery
            const netMasteryElement = document.getElementById('net-mastery-upgrade');
            const netMasteryCostElement = document.getElementById('net-mastery-cost');
            if (netMasteryElement && netMasteryCostElement) {
                const cost = this.getNetMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const currentLevel = state.generalUpgrades.netMastery;
                const currentBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel));
                const nextBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel + 1));
                
                // Update the upgrade effect to show current and next bonus
                const upgradeEffectElement = netMasteryElement.querySelector('.upgrade-effect');
                if (upgradeEffectElement) {
                    upgradeEffectElement.textContent = `Current: ${currentBonus.toFixed(2)}x → Next: ${nextBonus.toFixed(2)}x`;
                }
                
                netMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                netMasteryElement.classList.toggle('affordable', canAfford);
                netMasteryElement.classList.toggle('unaffordable', !canAfford);
                netMasteryElement.style.display = 'block';
            }

            // Update Bait Mastery
            const baitMasteryElement = document.getElementById('bait-mastery-upgrade');
            const baitMasteryCostElement = document.getElementById('bait-mastery-cost');
            if (baitMasteryElement && baitMasteryCostElement) {
                const cost = this.getBaitMasteryCost();
                const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                const currentLevel = state.generalUpgrades.baitMastery;
                const currentBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel));
                const nextBonus = window.gameState.toRegularNumber(window.gameState.safePower(1.1, currentLevel + 1));
                
                // Update the upgrade effect to show current and next bonus
                const upgradeEffectElement = baitMasteryElement.querySelector('.upgrade-effect');
                if (upgradeEffectElement) {
                    upgradeEffectElement.textContent = `Current: ${currentBonus.toFixed(2)}x → Next: ${nextBonus.toFixed(2)}x`;
                }
                
                baitMasteryCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                baitMasteryElement.classList.toggle('affordable', canAfford);
                baitMasteryElement.classList.toggle('unaffordable', !canAfford);
                baitMasteryElement.style.display = 'block';
            }

            // Update Parallelized Propagation (only show if 5+ parallel multiverses)
            if (state.parallelMultiverses >= 5) {
                const parallelizedPropagationElement = document.getElementById('parallelized-propagation-upgrade');
                const parallelizedPropagationCostElement = document.getElementById('parallelized-propagation-cost');
                if (parallelizedPropagationElement && parallelizedPropagationCostElement) {
                    const cost = this.getParallelizedPropagationCost();
                    const canAfford = window.gameState.compareNumbers(state.fish, cost) >= 0;
                    const currentLevel = state.generalUpgrades.parallelizedPropagation;
                    const currentCoefficient = window.gameState.getParallelizedPropagationEffectiveness();
                    
                    // Update the upgrade effect to show current coefficient
                    const upgradeEffectElement = parallelizedPropagationElement.querySelector('.upgrade-effect');
                    if (upgradeEffectElement) {
                        upgradeEffectElement.textContent = `Current: ${currentCoefficient.toFixed(1)}x effectiveness`;
                    }
                    
                    parallelizedPropagationCostElement.textContent = `${window.gameState.formatNumber(cost)} fish`;
                    parallelizedPropagationElement.classList.toggle('affordable', canAfford);
                    parallelizedPropagationElement.classList.toggle('unaffordable', !canAfford);
                    parallelizedPropagationElement.style.display = 'block';
                }
            } else {
                // Hide Parallelized Propagation if not enough parallel multiverses
                const parallelizedPropagationElement = document.getElementById('parallelized-propagation-upgrade');
                if (parallelizedPropagationElement) {
                    parallelizedPropagationElement.style.display = 'none';
                }
            }
        } else {
            // Hide all parallel multiverse upgrades if not enough parallel multiverses
            const upgradeIds = ['automaxer-upgrade', 'auto-multiply-upgrade', 'auto-ascend-upgrade', 
                              'multiversal-propagation-upgrade', 'fishing-mastery-upgrade', 
                              'net-mastery-upgrade', 'bait-mastery-upgrade'];
            upgradeIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });
        }

        // Update Max buttons visibility
        this.updateMaxButtonsVisibility();
    }

    updateMaxButtonsVisibility() {
        const state = window.gameState.state;
        
        // Show/hide Max buttons based on purchased upgrades
        const rodMaxButton = document.getElementById('rod-max-button');
        const netMaxButton = document.getElementById('net-max-button');
        const baitMaxButton = document.getElementById('bait-max-button');
        const localMaxBuyerButton = document.getElementById('local-max-buyer-button');
        const catchFishMaxButton = document.getElementById('catch-fish-max-button');
        
        if (rodMaxButton) {
            const isRodMaxed = state.localUpgrades.rodLevel === 9;
            rodMaxButton.style.display = state.generalUpgrades.rodMaxBuyer ? 'block' : 'none';
            rodMaxButton.disabled = isRodMaxed;
            rodMaxButton.style.opacity = isRodMaxed ? '0.5' : '1';
        }
        if (netMaxButton) {
            const isNetMaxed = state.localUpgrades.netLevel === 9;
            netMaxButton.style.display = state.generalUpgrades.netMaxBuyer ? 'block' : 'none';
            netMaxButton.disabled = isNetMaxed;
            netMaxButton.style.opacity = isNetMaxed ? '0.5' : '1';
        }
        if (baitMaxButton) {
            const isBaitMaxed = state.localUpgrades.baitLevel === 9;
            baitMaxButton.style.display = state.generalUpgrades.baitMaxBuyer ? 'block' : 'none';
            baitMaxButton.disabled = isBaitMaxed;
            baitMaxButton.style.opacity = isBaitMaxed ? '0.5' : '1';
        }
        if (catchFishMaxButton) {
            catchFishMaxButton.style.display = state.generalUpgrades.maxCatchFishBuyer ? 'block' : 'none';
        }
        if (localMaxBuyerButton) {
            const isMaxBuyerPurchased = state.generalUpgrades.maxBuyer;
            // Check if all local upgrades are at maximum level (level 9)
            // Levels 0-9 are valid, so level 9 is the maximum
            const allLocalMaxed = state.localUpgrades.rodLevel === 9 && 
                                 state.localUpgrades.netLevel === 9 && 
                                 state.localUpgrades.baitLevel === 9;
            
            localMaxBuyerButton.style.display = isMaxBuyerPurchased ? 'block' : 'none';
            localMaxBuyerButton.disabled = allLocalMaxed;
            localMaxBuyerButton.style.opacity = allLocalMaxed ? '0.5' : '1';
        }
    }

    updateProgressionUpgradeUI() {
        // Update multiply button
        const multiplyElement = document.getElementById('multiply-upgrade');
        const multiplyCostElement = document.getElementById('multiply-cost');
        const multiplyTierNameElement = document.getElementById('multiply-tier-name');
        
        if (multiplyElement && multiplyCostElement && multiplyTierNameElement) {
            const state = window.gameState.state;
            const canAfford = window.gameState.compareNumbers(state.fish, this.getMultiplyCost()) >= 0;
            const cost = this.getMultiplyCost();
            
            // Update tier name
            const tierName = state.currentTier.charAt(0).toUpperCase() + state.currentTier.slice(1);
            multiplyTierNameElement.textContent = tierName;
            
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
                // At Universe tier, show parallelize button
                ascendTierNameElement.textContent = 'Parallelize';
                ascendElement.style.display = 'block';
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
