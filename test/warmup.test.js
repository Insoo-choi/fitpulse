import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

const context = {};
const fn = new Function('context', `
  ${utilsCode}
  context.generateWarmupSets = generateWarmupSets;
`);
fn(context);

const { generateWarmupSets } = context;

test('generateWarmupSets generates 3-stage pyramid for weights >= 50kg', () => {
    // 100kg working weight:
    // Warmup 1: 40kg (40%) x 10
    // Warmup 2: 60kg (60%) x 5
    // Warmup 3: 80kg (80%) x 2
    const sets = generateWarmupSets(100);
    assert.equal(sets.length, 3);

    assert.equal(sets[0].weight, '40');
    assert.equal(sets[0].reps, '10');
    assert.equal(sets[0].isWarmup, true);

    assert.equal(sets[1].weight, '60');
    assert.equal(sets[1].reps, '5');

    assert.equal(sets[2].weight, '80');
    assert.equal(sets[2].reps, '2');
});

test('generateWarmupSets generates 2-stage pyramid for 20kg <= weights < 50kg', () => {
    // 40kg working weight:
    // Warmup 1: 20kg (50%) x 8
    // Warmup 2: 30kg (75%) x 4
    const sets = generateWarmupSets(40);
    assert.equal(sets.length, 2);

    assert.equal(sets[0].weight, '20');
    assert.equal(sets[0].reps, '8');

    assert.equal(sets[1].weight, '30');
    assert.equal(sets[1].reps, '4');
});

test('generateWarmupSets returns empty array for 0kg or negative weights', () => {
    assert.deepEqual(generateWarmupSets(0), []);
    assert.deepEqual(generateWarmupSets(-10), []);
    assert.deepEqual(generateWarmupSets(''), []);
});
