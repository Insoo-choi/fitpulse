import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load utils.js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf-8');

// Evaluate in sandbox
const context = {};
const fn = new Function('context', `
  ${dataCode}
  ${utilsCode}
  context.getExerciseCategory = getExerciseCategory;
  context.getOverloadTypeLabel = getOverloadTypeLabel;
  context.defaultExercises = defaultExercises;
`);
fn(context);

const { getExerciseCategory, getOverloadTypeLabel, defaultExercises } = context;

test('getExerciseCategory classifies large compound exercises correctly', () => {
    assert.equal(getExerciseCategory('바벨 스쿼트'), 'large_compound');
    assert.equal(getExerciseCategory('펜듈럼 스쿼트'), 'large_compound');
    assert.equal(getExerciseCategory('컨벤셔널 데드리프트'), 'large_compound');
    assert.equal(getExerciseCategory('루마니안 데드리프트'), 'large_compound');
    assert.equal(getExerciseCategory('레그 프레스'), 'large_compound');
    assert.equal(getExerciseCategory('바벨 RDL'), 'large_compound');
    assert.equal(getExerciseCategory('불가리안 스플릿 스쿼트 (BSS)'), 'large_compound');
    assert.equal(getExerciseCategory('바벨 힙 쓰러스트'), 'large_compound');
});

test('getExerciseCategory classifies upper compound exercises correctly', () => {
    assert.equal(getExerciseCategory('플랫 바벨 벤치프레스'), 'upper_compound');
    assert.equal(getExerciseCategory('인클라인 덤벨 프레스'), 'upper_compound');
    assert.equal(getExerciseCategory('오버헤드 프레스 (OHP)'), 'upper_compound');
    assert.equal(getExerciseCategory('바벨 로우'), 'upper_compound');
    assert.equal(getExerciseCategory('클로즈 그립 랫 풀다운'), 'upper_compound');
    assert.equal(getExerciseCategory('중량 풀업'), 'upper_compound');
    assert.equal(getExerciseCategory('체스트 딥스'), 'upper_compound');
    assert.equal(getExerciseCategory('푸시업'), 'upper_compound');
});

test('getExerciseCategory classifies isolation exercises correctly', () => {
    assert.equal(getExerciseCategory('사이드 레터럴 레이즈'), 'isolation');
    assert.equal(getExerciseCategory('하이 케이블 사이드 레터럴 레이즈'), 'isolation');
    assert.equal(getExerciseCategory('펙덱 플라이'), 'isolation');
    assert.equal(getExerciseCategory('시티드 케이블 플라이'), 'isolation');
    assert.equal(getExerciseCategory('바벨 컬'), 'isolation');
    assert.equal(getExerciseCategory('베이비안 케이블 컬'), 'isolation');
    assert.equal(getExerciseCategory('라잉 트라이셉스 익스텐션 (스컬 크러셔)'), 'isolation');
    assert.equal(getExerciseCategory('오버헤드 케이블 익스텐션'), 'isolation');
    assert.equal(getExerciseCategory('레그 익스텐션'), 'isolation');
    assert.equal(getExerciseCategory('라이잉 레그 컬'), 'isolation');
    assert.equal(getExerciseCategory('케이블 크런치'), 'isolation');
});

test('getOverloadTypeLabel returns proper Korean labels', () => {
    assert.equal(getOverloadTypeLabel('large_compound'), '💪대근육');
    assert.equal(getOverloadTypeLabel('upper_compound'), '🏋️상체다관절');
    assert.equal(getOverloadTypeLabel('isolation'), '🎯소근육');
});

test('defaultExercises database contains 80+ presets with valid categories and types', () => {
    assert.ok(defaultExercises.length >= 80, `Expected >= 80 exercises, got ${defaultExercises.length}`);
    defaultExercises.forEach(ex => {
        assert.ok(ex.name && ex.name.length > 0, 'Exercise must have a valid name');
        assert.ok(['가슴', '등', '하체', '어깨', '팔', '코어'].includes(ex.category), `Invalid category: ${ex.category}`);
        assert.ok(['large_compound', 'upper_compound', 'isolation'].includes(ex.type), `Invalid type: ${ex.type}`);
    });
});
