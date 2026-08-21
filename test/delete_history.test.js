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
    assert.equal(deleteWorkoutHistory(undefined), false);
});

test('deleteWorkoutHistory supports direct index and object reference', () => {
    context.state.history = [
        { id: 'w1', name: '1차 세션' },
        { id: 'w2', name: '2차 세션' },
        { id: 'w3', name: '3차 세션' }
    ];

    // Delete 2nd session by index 1
    const res1 = deleteWorkoutHistory(1);
    assert.equal(res1, true);
    assert.equal(context.state.history.length, 2);
    assert.equal(context.state.history[0].id, 'w1');
    assert.equal(context.state.history[1].id, 'w3');

    // Delete by object reference
    const targetObj = context.state.history[0];
    const res2 = deleteWorkoutHistory(targetObj);
    assert.equal(res2, true);
    assert.equal(context.state.history.length, 1);
    assert.equal(context.state.history[0].id, 'w3');
});

