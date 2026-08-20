import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

const context = { state: { history: [] } };
const fn = new Function('context', `
  const state = context.state;
  ${utilsCode}
  context.calculate1RM = calculate1RM;
  context.getPersonalRecord = getPersonalRecord;
`);
fn(context);

const { calculate1RM, getPersonalRecord } = context;

test('calculate1RM correctly estimates 1RM using Epley formula', () => {
    // 1 rep -> exactly same weight
    assert.equal(calculate1RM(100, 1), 100);

    // 100kg x 10 reps -> 100 * (1 + 10/30) = 133.3kg
    assert.equal(calculate1RM(100, 10), 133.3);

    // 80kg x 8 reps -> 80 * (1 + 8/30) = 101.3kg
    assert.equal(calculate1RM(80, 8), 101.3);

    // 60kg x 6 reps -> 60 * (1 + 6/30) = 72.0kg
    assert.equal(calculate1RM(60, 6), 72);

    // Edge cases: 0 weight or 0 reps
    assert.equal(calculate1RM(0, 10), 0);
    assert.equal(calculate1RM(100, 0), 0);
});

test('getPersonalRecord accurately finds highest estimated 1RM from history', () => {
    context.state.history = [
        {
            id: 'h1',
            date: '2026-08-10',
            exercises: [
                {
                    name: '플랫 바벨 벤치프레스',
                    sets: [
                        { weight: '70', reps: '8' }, // E1RM: 70 * (1 + 8/30) = 88.7kg
                        { weight: '75', reps: '6' }  // E1RM: 75 * (1 + 6/30) = 90.0kg (PR)
                    ]
                }
            ]
        },
        {
            id: 'h2',
            date: '2026-08-15',
            exercises: [
                {
                    name: '플랫 바벨 벤치프레스',
                    sets: [
                        { weight: '80', reps: '3' } // E1RM: 80 * (1 + 3/30) = 88.0kg
                    ]
                }
            ]
        }
    ];

    const pr = getPersonalRecord('플랫 바벨 벤치프레스');
    assert.equal(pr.max1RM, 90.0);
    assert.equal(pr.maxWeight, 75);
    assert.equal(pr.maxReps, 6);
    assert.equal(pr.date, '2026-08-10');

    // Exercise with no history
    const emptyPr = getPersonalRecord('바벨 스쿼트');
    assert.equal(emptyPr.max1RM, 0);
});
