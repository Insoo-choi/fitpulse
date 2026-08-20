import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

const context = {
    state: { bodyWeight: 70, proteinHistory: [] }
};
const fn = new Function('context', `
  const state = context.state;
  ${utilsCode}
  context.getDailyProteinData = getDailyProteinData;
  context.addProteinEntry = addProteinEntry;
  context.removeProteinEntry = removeProteinEntry;
`);
fn(context);

const { getDailyProteinData, addProteinEntry, removeProteinEntry } = context;

test('addProteinEntry adds entries and accurately aggregates daily total', () => {
    context.state.proteinHistory = [];
    context.state.bodyWeight = 70;

    // 1st meal: 30g
    const e1 = addProteinEntry('2026-08-20', 30, '닭가슴살 1팩');
    assert.ok(e1);
    assert.equal(e1.amount, 30);
    assert.equal(e1.note, '닭가슴살 1팩');

    // 2nd meal: 20g
    const e2 = addProteinEntry('2026-08-20', 20, '프로틴 쉐이크');
    assert.ok(e2);

    const data = getDailyProteinData('2026-08-20');
    assert.equal(data.total, 50);
    assert.equal(data.target, 126); // 70 * 1.8 = 126g
    assert.equal(data.percentage, Math.round((50 / 126) * 100));
    assert.equal(data.logs.length, 2);
});

test('removeProteinEntry removes entry and recalculates daily total', () => {
    const dataBefore = getDailyProteinData('2026-08-20');
    const firstLogId = dataBefore.logs[0].id;

    const removed = removeProteinEntry('2026-08-20', firstLogId);
    assert.equal(removed, true);

    const dataAfter = getDailyProteinData('2026-08-20');
    assert.equal(dataAfter.logs.length, 1);
    assert.equal(dataAfter.total, 20);
});

test('addProteinEntry rejects 0 or negative values', () => {
    assert.equal(addProteinEntry('2026-08-20', 0), null);
    assert.equal(addProteinEntry('2026-08-20', -10), null);
});
