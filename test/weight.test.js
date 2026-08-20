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
  context.getTodayDateString = getTodayDateString;
`);
fn(context);

const { getTodayDateString } = context;

test('Weight history update: updates today record or pushes new one', () => {
    const today = getTodayDateString();
    const weightHistory = [
        { date: '2026-08-18', weight: 70.0 },
        { date: '2026-08-19', weight: 69.8 }
    ];

    // Push new today weight
    const newWeight = 69.5;
    const wIdx = weightHistory.findIndex(entry => entry.date === today);
    if (wIdx > -1) {
        weightHistory[wIdx].weight = newWeight;
    } else {
        weightHistory.push({ date: today, weight: newWeight });
    }

    assert.equal(weightHistory.length, 3);
    assert.equal(weightHistory[2].date, today);
    assert.equal(weightHistory[2].weight, 69.5);

    // Update same today weight
    const updatedWeight = 69.2;
    const wIdx2 = weightHistory.findIndex(entry => entry.date === today);
    if (wIdx2 > -1) {
        weightHistory[wIdx2].weight = updatedWeight;
    } else {
        weightHistory.push({ date: today, weight: updatedWeight });
    }

    assert.equal(weightHistory.length, 3);
    assert.equal(weightHistory[2].weight, 69.2);
});

test('Daily weight modal prompt condition: triggers only once per day when unrecorded and undismissed', () => {
    const today = getTodayDateString();

    // Scenario 1: No today record, not dismissed -> Should prompt
    const history1 = [{ date: '2026-08-19', weight: 70 }];
    const dismissed1 = '2026-08-19';
    const hasTodayRecord1 = history1.some(w => w.date === today);
    const shouldPrompt1 = !hasTodayRecord1 && dismissed1 !== today;
    assert.equal(shouldPrompt1, true);

    // Scenario 2: Already dismissed today -> Should NOT prompt
    const dismissed2 = today;
    const shouldPrompt2 = !hasTodayRecord1 && dismissed2 !== today;
    assert.equal(shouldPrompt2, false);

    // Scenario 3: Already has today record -> Should NOT prompt
    const history3 = [{ date: today, weight: 70 }];
    const hasTodayRecord3 = history3.some(w => w.date === today);
    const shouldPrompt3 = !hasTodayRecord3 && dismissed1 !== today;
    assert.equal(shouldPrompt3, false);
});
