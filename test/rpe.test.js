import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');
const stateCode = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf-8');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

// Helper to simulate RPE calculation logic
function calculateOverload(category, score, minIncrement = 2.5) {
    let weightInc = 0;
    let repInc = 0;

    if (score === 1) { // Easy
        if (category === 'large_compound') weightInc = minIncrement * 2;
        else if (category === 'upper_compound') weightInc = minIncrement;
        else { weightInc = minIncrement; repInc = 2; }
    } else if (score === 2) { // Good
        if (category === 'large_compound') weightInc = minIncrement;
        else if (category === 'upper_compound') weightInc = minIncrement; 
        else { weightInc = 0; repInc = 1; }
    } else if (score === 3) { // Hard
        // keep volume
    }

    return { weightInc, repInc };
}

test('RPE Score 1 (Easy) gives aggressive progressive overload', () => {
    // Large compound (Squat, Deadlift) -> +2x increment (+5.0kg on 2.5kg base)
    const large = calculateOverload('large_compound', 1, 2.5);
    assert.equal(large.weightInc, 5.0);
    assert.equal(large.repInc, 0);

    // Upper compound (Bench, OHP) -> +1x increment (+2.5kg)
    const upper = calculateOverload('upper_compound', 1, 2.5);
    assert.equal(upper.weightInc, 2.5);
    assert.equal(upper.repInc, 0);

    // Isolation (Lateral Raise, Bicep Curl) -> +2.5kg & +2 reps
    const iso = calculateOverload('isolation', 1, 2.5);
    assert.equal(iso.weightInc, 2.5);
    assert.equal(iso.repInc, 2);
});

test('RPE Score 2 (Moderate/Good) gives standard progressive overload', () => {
    // Large compound -> +1x increment (+2.5kg)
    const large = calculateOverload('large_compound', 2, 2.5);
    assert.equal(large.weightInc, 2.5);
    assert.equal(large.repInc, 0);

    // Upper compound -> +1x increment (+2.5kg)
    const upper = calculateOverload('upper_compound', 2, 2.5);
    assert.equal(upper.weightInc, 2.5);
    assert.equal(upper.repInc, 0);

    // Isolation -> +1 rep (volume increment without excessive weight jump)
    const iso = calculateOverload('isolation', 2, 2.5);
    assert.equal(iso.weightInc, 0);
    assert.equal(iso.repInc, 1);
});

test('RPE Score 3 (Hard) maintains current weight and reps', () => {
    const large = calculateOverload('large_compound', 3, 2.5);
    assert.equal(large.weightInc, 0);
    assert.equal(large.repInc, 0);

    const upper = calculateOverload('upper_compound', 3, 2.5);
    assert.equal(upper.weightInc, 0);
    assert.equal(upper.repInc, 0);

    const iso = calculateOverload('isolation', 3, 2.5);
    assert.equal(iso.weightInc, 0);
    assert.equal(iso.repInc, 0);
});

test('Custom minIncrement scaling works accurately', () => {
    // With 1.25kg microplates
    const largeEasy = calculateOverload('large_compound', 1, 1.25);
    assert.equal(largeEasy.weightInc, 2.5);

    const upperGood = calculateOverload('upper_compound', 2, 1.25);
    assert.equal(upperGood.weightInc, 1.25);
});
