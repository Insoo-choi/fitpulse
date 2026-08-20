import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function mirroring workout.js toggleSetType logic
function cycleSetType(currentType) {
    const types = ['normal', 'warmup', 'drop', 'failure'];
    const current = currentType || 'normal';
    const nextIdx = (types.indexOf(current) + 1) % types.length;
    return {
        type: types[nextIdx],
        isWarmup: types[nextIdx] === 'warmup'
    };
}

test('cycleSetType cycles through normal -> warmup -> drop -> failure -> normal', () => {
    let state = cycleSetType('normal');
    assert.equal(state.type, 'warmup');
    assert.equal(state.isWarmup, true);

    state = cycleSetType(state.type);
    assert.equal(state.type, 'drop');
    assert.equal(state.isWarmup, false);

    state = cycleSetType(state.type);
    assert.equal(state.type, 'failure');
    assert.equal(state.isWarmup, false);

    state = cycleSetType(state.type);
    assert.equal(state.type, 'normal');
    assert.equal(state.isWarmup, false);
});

test('cycleSetType defaults undefined to normal before advancing to warmup', () => {
    const state = cycleSetType(undefined);
    assert.equal(state.type, 'warmup');
    assert.equal(state.isWarmup, true);
});
