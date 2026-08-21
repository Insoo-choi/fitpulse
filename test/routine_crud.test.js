import test from 'node:test';
import assert from 'node:assert/strict';

function createRoutine(state, name, exercises = []) {
    const routine = {
        id: 'routine_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        name: name.trim(),
        exercises: exercises
    };
    if (!state.routines) state.routines = [];
    state.routines.push(routine);
    return routine;
}

function updateRoutine(state, id, updatedData) {
    if (!state.routines) return false;
    const idx = state.routines.findIndex(r => r.id === id);
    if (idx === -1) return false;
    state.routines[idx] = { ...state.routines[idx], ...updatedData };
    return true;
}

function deleteRoutine(state, id) {
    if (!state.routines) return false;
    const idx = state.routines.findIndex(r => r.id === id);
    if (idx === -1) return false;
    state.routines.splice(idx, 1);
    return true;
}

function duplicateRoutine(state, id) {
    if (!state.routines) return null;
    const orig = state.routines.find(r => r.id === id);
    if (!orig) return null;
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.id = 'routine_' + Date.now() + '_clone';
    cloned.name = `${orig.name} (복사본)`;
    const origIdx = state.routines.findIndex(r => r.id === id);
    state.routines.splice(origIdx + 1, 0, cloned);
    return cloned;
}

test('Routine CRUD operations succeed with valid data', () => {
    const state = { routines: [] };
    
    // Create
    const r1 = createRoutine(state, '하체 루틴', [{ name: '바벨 스쿼트', sets: [{ weight: '100', reps: '5' }] }]);
    assert.equal(state.routines.length, 1);
    assert.equal(state.routines[0].name, '하체 루틴');
    
    // Update
    const updated = updateRoutine(state, r1.id, { name: '하체 폭파 루틴' });
    assert.equal(updated, true);
    assert.equal(state.routines[0].name, '하체 폭파 루틴');
    
    // Duplicate
    const cloned = duplicateRoutine(state, r1.id);
    assert.ok(cloned);
    assert.equal(state.routines.length, 2);
    assert.equal(state.routines[1].name, '하체 폭파 루틴 (복사본)');
    
    // Delete
    const deleted = deleteRoutine(state, r1.id);
    assert.equal(deleted, true);
    assert.equal(state.routines.length, 1);
    assert.equal(state.routines[0].name, '하체 폭파 루틴 (복사본)');
});
