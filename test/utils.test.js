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

test('getTodayDateString returns YYYY-MM-DD format correctly', () => {
    const d = new Date(2026, 7, 20); // 2026-08-20 (0-indexed month)
    assert.equal(getTodayDateString(d), '2026-08-20');

    const d2 = new Date(2026, 0, 5); // 2026-01-05
    assert.equal(getTodayDateString(d2), '2026-01-05');
});

test('getTodayDateString returns current date without argument', () => {
    const today = getTodayDateString();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
});
