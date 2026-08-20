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
  context.calculatePlates = calculatePlates;
`);
fn(context);

const { calculatePlates } = context;

test('calculatePlates correctly calculates plates for 100kg on 20kg barbell', () => {
    // 100kg total - 20kg bar = 80kg (40kg per side) -> 20kg x 2
    const res = calculatePlates(100, 20);
    assert.equal(res.targetWeight, 100);
    assert.equal(res.barWeight, 20);
    assert.equal(res.sideWeight, 40);
    assert.equal(res.remainder, 0);

    assert.equal(res.plates.length, 1);
    assert.equal(res.plates[0].plate, 20);
    assert.equal(res.plates[0].count, 2);
});

test('calculatePlates correctly calculates plates for 87.5kg on 20kg barbell', () => {
    // 87.5kg total - 20kg bar = 67.5kg (33.75kg per side)
    // 33.75kg -> 20kg x 1 (rem 13.75), 10kg x 1 (rem 3.75), 2.5kg x 1 (rem 1.25), 1.25kg x 1 (rem 0)
    const res = calculatePlates(87.5, 20);
    assert.equal(res.sideWeight, 33.75);
    assert.equal(res.remainder, 0);

    assert.equal(res.plates.length, 4);
    assert.deepEqual(res.plates, [
        { plate: 20, count: 1 },
        { plate: 10, count: 1 },
        { plate: 2.5, count: 1 },
        { plate: 1.25, count: 1 }
    ]);
});

test('calculatePlates handles target weights <= bar weight', () => {
    const res20 = calculatePlates(20, 20);
    assert.equal(res20.sideWeight, 0);
    assert.equal(res20.plates.length, 0);

    const res15 = calculatePlates(10, 20);
    assert.equal(res15.sideWeight, 0);
    assert.equal(res15.plates.length, 0);
});
