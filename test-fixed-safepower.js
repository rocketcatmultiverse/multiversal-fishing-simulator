// Test the fixed safePower function
function createNumber(base, exponent = 0) {
    return normalizeNumber({ base: base, exponent: exponent });
}

function normalizeNumber(num) {
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
    
    return { base: base, exponent: exponent };
}

function toSafeNumber(value) {
    if (typeof value === 'number') {
        if (!isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
            return normalizeNumber({ base: value, exponent: 0 });
        }
        return normalizeNumber({ base: value, exponent: 0 });
    }
    if (typeof value === 'object' && value.base !== undefined && value.exponent !== undefined) {
        return normalizeNumber(value);
    }
    return { base: 0, exponent: 0 };
}

function safePower(base, exponent) {
    if (exponent === 0) return createNumber(1);
    if (base === 0) return createNumber(0);
    if (base === 1) return createNumber(1);
    
    // For small exponents, use direct calculation
    if (exponent <= 15) {
        const result = Math.pow(base, exponent);
        return createNumber(result);
    }
    
    // For larger exponents, use logarithmic approach
    const safeBase = toSafeNumber(base);
    const safeExponent = toSafeNumber(exponent);
    
    // Use logarithms to avoid overflow: a^b = 10^(b * log10(a))
    const logBase = Math.log10(Math.abs(safeBase.base));
    const resultExponent = (safeExponent.base * Math.pow(10, safeExponent.exponent)) * logBase;
    
    // For very large resultExponent, avoid Math.pow(10, resultExponent) which can overflow
    if (resultExponent > 15) {
        // Return the result directly in base/exponent format, properly normalized
        return normalizeNumber({ base: Math.sign(safeBase.base), exponent: Math.floor(resultExponent) });
    }
    
    return createNumber(Math.pow(safeBase.base, safeExponent.base) * Math.pow(10, resultExponent));
}

function multiplyNumbers(a, b) {
    const safeA = toSafeNumber(a);
    const safeB = toSafeNumber(b);
    
    if (safeA.base === 0 || safeB.base === 0) {
        return { base: 0, exponent: 0 };
    }
    
    const result = { 
        base: safeA.base * safeB.base, 
        exponent: safeA.exponent + safeB.exponent 
    };
    return normalizeNumber(result);
}

console.log('Testing FIXED safePower function:');
console.log('');

for (let level = 25; level <= 30; level++) {
    const nextLevel = level;
    const baseCost = createNumber(1000000000); // 1B fish
    const multiplier = safePower(10, nextLevel - 1);
    const cost = multiplyNumbers(baseCost, multiplier);
    
    console.log(`Level ${level}:`);
    console.log(`  Base cost: {base: ${baseCost.base}, exponent: ${baseCost.exponent}}`);
    console.log(`  Multiplier (10^${nextLevel-1}): {base: ${multiplier.base}, exponent: ${multiplier.exponent}}`);
    console.log(`  Final cost: {base: ${cost.base}, exponent: ${cost.exponent}}`);
    console.log(`  Cost in scientific: ${cost.base.toFixed(2)}e${cost.exponent}`);
    console.log('');
}
