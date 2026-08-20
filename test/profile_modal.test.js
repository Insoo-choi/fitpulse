import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function mirroring saveProfileModalSettings logic
function applyProfileSettings(state, { height, weight, minIncrement, todayStr = '2026-08-20' }) {
    const newHeight = parseFloat(height);
    const newWeight = parseFloat(weight);
    const newMinInc = parseFloat(minIncrement);

    if (newHeight && newHeight > 50 && newHeight < 300) {
        state.height = newHeight;
    }
    if (newWeight && newWeight > 20 && newWeight < 500) {
        state.bodyWeight = newWeight;
        if (!state.weightHistory) state.weightHistory = [];
        const wIdx = state.weightHistory.findIndex(w => w.date === todayStr);
        if (wIdx > -1) {
            state.weightHistory[wIdx].weight = newWeight;
        } else {
            state.weightHistory.push({ date: todayStr, weight: newWeight });
        }
    }
    if (newMinInc && newMinInc > 0 && newMinInc <= 20) {
        state.minIncrement = newMinInc;
    }
    return state;
}

test('applyProfileSettings updates height, weight, and minIncrement valid values', () => {
    const state = { height: 175, bodyWeight: 70, minIncrement: 2.5, weightHistory: [] };

    applyProfileSettings(state, { height: '180', weight: '74.5', minIncrement: '1.25', todayStr: '2026-08-20' });

    assert.equal(state.height, 180);
    assert.equal(state.bodyWeight, 74.5);
    assert.equal(state.minIncrement, 1.25);
    assert.equal(state.weightHistory.length, 1);
    assert.equal(state.weightHistory[0].weight, 74.5);
});

test('applyProfileSettings rejects absurd or negative values', () => {
    const state = { height: 175, bodyWeight: 70, minIncrement: 2.5, weightHistory: [] };

    applyProfileSettings(state, { height: '-10', weight: '0', minIncrement: '-5' });

    assert.equal(state.height, 175);
    assert.equal(state.bodyWeight, 70);
    assert.equal(state.minIncrement, 2.5);
});
