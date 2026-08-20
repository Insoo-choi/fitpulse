import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

const context = {
    state: { history: [] },
    saveDataCalled: false
};
const fn = new Function('context', `
  const state = context.state;
  function saveData() { context.saveDataCalled = true; }
  ${utilsCode}
  context.deleteWorkoutHistory = deleteWorkoutHistory;
`);
fn(context);

const { deleteWorkoutHistory } = context;

test('deleteWorkoutHistory successfully removes specified workout session by id', () => {
    context.state.history = [
        { id: 'w1', name: '가슴 운동', date: '2026-08-20' },
        { id: 'w2', name: '가슴 운동 (중복)', date: '2026-08-20' },
        { id: 'w3', name: '하체 운동', date: '2026-08-19' }
    ];

    const result = deleteWorkoutHistory('w2');
    assert.equal(result, true);
    assert.equal(context.state.history.length, 2);
    assert.deepEqual(context.state.history.map(h => h.id), ['w1', 'w3']);
});

test('deleteWorkoutHistory handles non-existent id gracefully', () => {
    context.state.history = [
        { id: 'w1', name: '가슴 운동', date: '2026-08-20' }
    ];

    const result = deleteWorkoutHistory('non-existent-id');
    assert.equal(result, false);
    assert.equal(context.state.history.length, 1);
});

test('deleteWorkoutHistory handles null or empty arguments safely', () => {
    assert.equal(deleteWorkoutHistory(null), false);
    assert.equal(deleteWorkoutHistory(''), false);
});
