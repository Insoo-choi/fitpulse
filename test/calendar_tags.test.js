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
  context.getWorkoutMuscleTags = getWorkoutMuscleTags;
`);
fn(context);

const { getWorkoutMuscleTags } = context;

test('getWorkoutMuscleTags extracts unique muscle categories up to 3 tags', () => {
    const workout = {
        name: '가슴/삼두 루틴',
        exercises: [
            { name: '플랫 바벨 벤치프레스' }, // 가슴
            { name: '인클라인 덤벨 프레스' },  // 가슴 (중복 제거)
            { name: '트라이셉스 푸시다운' },   // 팔
            { name: '사이드 레터럴 레이즈' },  // 어깨
            { name: '바벨 스쿼트' }          // 하체 (최대 3개로 제한)
        ]
    };

    const tags = getWorkoutMuscleTags(workout);
    assert.equal(tags.length, 3);
    assert.ok(tags.includes('가슴'));
    assert.ok(tags.includes('팔'));
    assert.ok(tags.includes('어깨'));
    assert.ok(!tags.includes('하체'));
});

test('getWorkoutMuscleTags handles empty or invalid workout safely', () => {
    assert.deepEqual(getWorkoutMuscleTags(null), []);
    assert.deepEqual(getWorkoutMuscleTags({}), []);
    assert.deepEqual(getWorkoutMuscleTags({ exercises: [] }), []);
});
