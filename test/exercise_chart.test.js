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
  context.getPerformedExerciseList = getPerformedExerciseList;
  context.getExerciseHistoryTimeSeries = getExerciseHistoryTimeSeries;
`);
fn(context);

const { getPerformedExerciseList, getExerciseHistoryTimeSeries } = context;

test('getPerformedExerciseList returns unique list of performed exercises', () => {
    const mockHistory = [
        {
            date: '2026-08-10',
            exercises: [
                { name: '플랫 바벨 벤치프레스', sets: [{ weight: '60', reps: '8' }] },
                { name: '사이드 레터럴 레이즈', sets: [{ weight: '10', reps: '15' }] }
            ]
        },
        {
            date: '2026-08-12',
            exercises: [
                { name: '플랫 바벨 벤치프레스', sets: [{ weight: '65', reps: '8' }] },
                { name: '바벨 스쿼트', sets: [{ weight: '100', reps: '5' }] }
            ]
        }
    ];

    const list = getPerformedExerciseList(mockHistory);
    assert.equal(list.length, 3);
    assert.ok(list.includes('플랫 바벨 벤치프레스'));
    assert.ok(list.includes('사이드 레터럴 레이즈'));
    assert.ok(list.includes('바벨 스쿼트'));
});

test('getExerciseHistoryTimeSeries accurately calculates time series 1RM progression in chronological order', () => {
    const mockHistory = [
        {
            date: '2026-08-15',
            exercises: [
                {
                    name: '바벨 스쿼트',
                    sets: [
                        { weight: '100', reps: '5' }, // 1RM: 116.7
                        { weight: '110', reps: '3' }  // 1RM: 121.0
                    ]
                }
            ]
        },
        {
            date: '2026-08-10',
            exercises: [
                {
                    name: '바벨 스쿼트',
                    sets: [
                        { weight: '90', reps: '8' } // 1RM: 114.0
                    ]
                }
            ]
        }
    ];

    const timeSeries = getExerciseHistoryTimeSeries('바벨 스쿼트', mockHistory);
    assert.equal(timeSeries.length, 2);

    // Chronological order: 2026-08-10 should come first
    assert.equal(timeSeries[0].date, '2026-08-10');
    assert.equal(timeSeries[0].maxWeight, 90);
    assert.equal(timeSeries[0].max1RM, 114.0);

    assert.equal(timeSeries[1].date, '2026-08-15');
    assert.equal(timeSeries[1].maxWeight, 110);
    assert.equal(timeSeries[1].max1RM, 121.0);
});

test('getExerciseHistoryTimeSeries returns empty array for unperformed exercise', () => {
    const timeSeries = getExerciseHistoryTimeSeries('데드리프트', []);
    assert.equal(timeSeries.length, 0);
});
