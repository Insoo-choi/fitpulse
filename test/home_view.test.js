import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homeCode = fs.readFileSync(path.join(__dirname, '../js/views/home.js'), 'utf-8');
const utilsCode = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8');

// Mock DOM environment
class MockElement {
    constructor(id = '') {
        this.id = id;
        this.innerHTML = '';
        this.value = '';
        this.children = [];
    }
}

const mockGrid = new MockElement('calendar-grid');
const mockMonth = new MockElement('cal-month');

const mockDocument = {
    getElementById: (id) => {
        if (id === 'calendar-grid') return mockGrid;
        if (id === 'cal-month') return mockMonth;
        return new MockElement(id);
    },
    createElement: (tag) => new MockElement(tag),
    body: { appendChild: () => {} }
};

const mockLucide = { createIcons: () => {} };

const context = {
    document: mockDocument,
    lucide: mockLucide,
    state: { history: [], weightHistory: [], proteinHistory: [], bodyWeight: 70 }
};

const fn = new Function('context', `
  const document = context.document;
  const lucide = context.lucide;
  const state = context.state;
  ${utilsCode}
  ${homeCode}
  context.renderHomeView = renderHomeView;
  context.renderCalendar = renderCalendar;
  context.showDateInfo = showDateInfo;
`);
fn(context);

const { renderHomeView, renderCalendar, showDateInfo } = context;

test('renderHomeView outputs valid HTML containing calendar container and buttons', () => {
    const html = renderHomeView();
    assert.ok(html.includes('calendar-grid'), 'Home view must contain calendar-grid container');
    assert.ok(html.includes('이번 달 기록'), 'Home view must contain calendar header');
    assert.ok(html.includes('운동 시작'), 'Home view must contain workout start button');
});

test('renderCalendar executes cleanly and populates calendar tiles without syntax errors', () => {
    mockGrid.innerHTML = '';
    context.state.history = [
        {
            date: '2026-08-20',
            isRunning: false,
            exercises: [{ name: '바벨 스쿼트' }]
        }
    ];

    renderCalendar();
    assert.ok(mockGrid.innerHTML.length > 0, 'Calendar grid must be populated with day tiles');
    assert.ok(mockGrid.innerHTML.includes('showDateInfo'), 'Calendar grid tiles must have click listeners');
});

test('showDateInfo creates modal cleanly without syntax errors', () => {
    assert.doesNotThrow(() => {
        showDateInfo('2026-08-20');
    });
});
