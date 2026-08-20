import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');
const stateCode = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf-8');

// Mock localStorage
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

function createStorageContext() {
    const mockStorage = new MockLocalStorage();
    const ctx = { localStorage: mockStorage };
    const fn = new Function('ctx', `
        const localStorage = ctx.localStorage;
        ${dataCode}
        ${stateCode}
        ctx.state = state;
        ctx.loadData = loadData;
        ctx.saveData = saveData;
        ctx.saveActiveWorkout = saveActiveWorkout;
        ctx.DB_KEY = DB_KEY;
        ctx.getState = () => state;
        ctx.setState = (s) => { state = s; };
    `);
    fn(ctx);
    return ctx;
}

test('Storage sync: saveActiveWorkout saves when active and removes when null', () => {
    const ctx = createStorageContext();
    ctx.getState().activeWorkout = { id: 'w1', name: '자율 운동', startTime: 1000 };
    ctx.saveActiveWorkout();

    assert.ok(ctx.localStorage.getItem('fitpulse_active'));
    assert.equal(JSON.parse(ctx.localStorage.getItem('fitpulse_active')).id, 'w1');

    // Finish workout -> activeWorkout = null
    ctx.getState().activeWorkout = null;
    ctx.saveActiveWorkout();

    assert.equal(ctx.localStorage.getItem('fitpulse_active'), null);
});

test('Storage isolation: loadData does not revive workout when fitpulse_active is missing', () => {
    const ctx = createStorageContext();
    // Simulate main DB containing dirty activeWorkout
    const dirtyState = {
        routines: [],
        history: [],
        activeWorkout: { id: 'old_workout' }
    };
    ctx.localStorage.setItem(ctx.DB_KEY, JSON.stringify(dirtyState));
    // fitpulse_active is empty/removed
    ctx.localStorage.removeItem('fitpulse_active');

    ctx.loadData();
    assert.equal(ctx.getState().activeWorkout, null);
});

test('Storage sync: saveData cleans up fitpulse_active when activeWorkout is null', () => {
    const ctx = createStorageContext();
    ctx.localStorage.setItem('fitpulse_active', JSON.stringify({ id: 'active_1' }));
    ctx.getState().activeWorkout = null;
    
    ctx.saveData();
    assert.equal(ctx.localStorage.getItem('fitpulse_active'), null);
});
