import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');
const modalsCode = fs.readFileSync(path.join(__dirname, '../js/views/modals.js'), 'utf-8');

// Build sandbox
const context = {};
const fn = new Function('context', `
  ${dataCode}
  ${utilsCode}
  exerciseDB = [...defaultExercises];
  ${modalsCode}
  context.parseRoutineText = parseRoutineText;
  context.exerciseDB = exerciseDB;
`);
fn(context);

const { parseRoutineText } = context;

test('parseRoutineText parses standard Korean routine format', () => {
    const text = `
    [가슴 & 삼두 루틴]
    플랫 바벨 벤치프레스 60kg 8회 3세트
    인클라인 덤벨 프레스 22.5kg 10회 3세트
    펙덱 플라이 40kg 15회 4세트
    `;
    const result = parseRoutineText(text);
    assert.ok(result);
    assert.equal(result.name, '가슴 & 삼두 루틴');
    assert.equal(result.exercises.length, 3);
    
    assert.equal(result.exercises[0].name, '플랫 바벨 벤치프레스');
    assert.equal(result.exercises[0].sets.length, 3);
    assert.equal(result.exercises[0].sets[0].weight, '60');
    assert.equal(result.exercises[0].sets[0].reps, '8');

    assert.equal(result.exercises[1].name, '인클라인 덤벨 프레스');
    assert.equal(result.exercises[1].sets[0].weight, '22.5');
    assert.equal(result.exercises[1].sets[0].reps, '10');

    assert.equal(result.exercises[2].name, '펙덱 플라이');
    assert.equal(result.exercises[2].sets.length, 4);
    assert.equal(result.exercises[2].sets[0].weight, '40');
    assert.equal(result.exercises[2].sets[0].reps, '15');
});

test('parseRoutineText parses multiplication format (e.g. 10x3, 10*4)', () => {
    const text = `
    바벨 스쿼트 100kg 8x4
    레그 익스텐션 50k 12*3
    턱걸이 (풀업) 10회 4세트
    `;
    const result = parseRoutineText(text, '하체 & 등');
    assert.ok(result);
    assert.equal(result.name, '하체 & 등');
    assert.equal(result.exercises.length, 3);

    assert.equal(result.exercises[0].name, '바벨 스쿼트');
    assert.equal(result.exercises[0].sets.length, 4);
    assert.equal(result.exercises[0].sets[0].weight, '100');
    assert.equal(result.exercises[0].sets[0].reps, '8');

    assert.equal(result.exercises[1].name, '레그 익스텐션');
    assert.equal(result.exercises[1].sets.length, 3);
    assert.equal(result.exercises[1].sets[0].weight, '50');
    assert.equal(result.exercises[1].sets[0].reps, '12');

    assert.equal(result.exercises[2].name, '턱걸이 (풀업)');
    assert.equal(result.exercises[2].sets.length, 4);
    assert.equal(result.exercises[2].sets[0].weight, '0');
    assert.equal(result.exercises[2].sets[0].reps, '10');
});

test('parseRoutineText handles empty or invalid text safely', () => {
    assert.equal(parseRoutineText(''), null);
    assert.equal(parseRoutineText('   '), null);
    assert.equal(parseRoutineText(null), null);
});
