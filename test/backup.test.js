import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');
const stateCode = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf-8');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) { return this.store[key] || null; }
    setItem(key, value) { this.store[key] = String(value); }
    removeItem(key) { delete this.store[key]; }
    clear() { this.store = {}; }
}

function createBackupContext() {
    const mockStorage = new MockLocalStorage();
    const ctx = { localStorage: mockStorage };
    const fn = new Function('ctx', `
        const localStorage = ctx.localStorage;
        ${dataCode}
        ${stateCode}
        ${utilsCode}
        ctx.state = state;
        ctx.importFitPulseData = importFitPulseData;
        ctx.getState = () => state;
    `);
    fn(ctx);
    return ctx;
}

test('importFitPulseData successfully imports valid backup JSON', () => {
    const ctx = createBackupContext();
    const validBackup = {
        app: 'FitPulse Pro',
        version: '2.0',
        exportedAt: '2026-08-20T12:00:00.000Z',
        state: {
            routines: [
                { id: 'r1', name: '가슴/삼두', exercises: [] }
            ],
            history: [
                { id: 'h1', date: '2026-08-20', name: '가슴/삼두', totalVolume: 5000 }
            ],
            weightHistory: [
                { date: '2026-08-20', weight: 72.5 }
            ],
            bodyWeight: 72.5,
            height: 180,
            minIncrement: 1.25,
            defaultRestTime: 120,
            workoutCount: 1
        }
    };

    const result = ctx.importFitPulseData(JSON.stringify(validBackup));
    assert.equal(result.success, true);
    assert.match(result.message, /성공적으로 복원되었습니다/);

    const s = ctx.getState();
    assert.equal(s.routines.length, 1);
    assert.equal(s.routines[0].name, '가슴/삼두');
    assert.equal(s.history.length, 1);
    assert.equal(s.bodyWeight, 72.5);
    assert.equal(s.height, 180);
    assert.equal(s.minIncrement, 1.25);
    assert.equal(s.defaultRestTime, 120);
});

test('importFitPulseData handles corrupted or non-JSON input gracefully', () => {
    const ctx = createBackupContext();
    const result = ctx.importFitPulseData('{ invalid json ');
    assert.equal(result.success, false);
    assert.match(result.message, /오류가 발생했습니다/);
});

test('importFitPulseData validates required arrays', () => {
    const ctx = createBackupContext();
    const invalidBackup = {
        state: {
            routines: 'not_an_array',
            history: []
        }
    };
    const result = ctx.importFitPulseData(JSON.stringify(invalidBackup));
    assert.equal(result.success, false);
    assert.match(result.message, /필수 항목/);
});
