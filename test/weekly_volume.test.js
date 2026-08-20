import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

const context = {};
const fn = new Function('context', `
  ${dataCode}
  exerciseDB = [...defaultExercises];
  ${utilsCode}
  context.calculateWeeklyMuscleVolume = calculateWeeklyMuscleVolume;
  context.exerciseDB = exerciseDB;
`);
fn(context);

const { calculateWeeklyMuscleVolume } = context;

test('calculateWeeklyMuscleVolume accurately aggregates sets per muscle category in the last 7 days', () => {
    const referenceDate = new Date('2026-08-20T12:00:00Z');
    const mockHistory = [
        {
            id: 'w1',
            date: '2026-08-19', // within 7 days
            exercises: [
                { name: '플랫 바벨 벤치프레스', sets: [{}, {}, {}, {}] }, // 4 sets chest
                { name: '인클라인 덤벨 프레스', sets: [{}, {}, {}] },      // 3 sets chest
                { name: '사이드 레터럴 레이즈', sets: [{}, {}, {}, {}] }    // 4 sets shoulder
            ]
        },
        {
            id: 'w2',
            date: '2026-08-16', // within 7 days
            exercises: [
                { name: '바벨 스쿼트', sets: [{}, {}, {}, {}, {}] },      // 5 sets leg
                { name: '레그 익스텐션', sets: [{}, {}, {}, {}] },         // 4 sets leg
                { name: '시티드 레그 컬', sets: [{}, {}, {}] }             // 3 sets leg -> Total 12 sets (Optimal)
            ]
        },
        {
            id: 'w3',
            date: '2026-08-10', // 10 days ago -> should be ignored!
            exercises: [
                { name: '플랫 바벨 벤치프레스', sets: [{}, {}, {}, {}, {}] }
            ]
        }
    ];

    const result = calculateWeeklyMuscleVolume(mockHistory, referenceDate);
    assert.equal(result.length, 6);

    const chest = result.find(r => r.category === '가슴');
    assert.equal(chest.sets, 7);
    assert.equal(chest.status, 'low'); // < 10

    const legs = result.find(r => r.category === '하체');
    assert.equal(legs.sets, 12);
    assert.equal(legs.status, 'optimal'); // 10-20
    assert.match(legs.statusLabel, /최적 성장/);

    const back = result.find(r => r.category === '등');
    assert.equal(back.sets, 0);
});

test('calculateWeeklyMuscleVolume handles empty history gracefully', () => {
    const result = calculateWeeklyMuscleVolume([]);
    assert.equal(result.length, 6);
    result.forEach(item => {
        assert.equal(item.sets, 0);
        assert.equal(item.status, 'low');
    });
});
