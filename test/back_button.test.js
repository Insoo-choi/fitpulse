import test from 'node:test';
import assert from 'node:assert/strict';

function simulateAndroidBack({ openModals = [], currentTab = 'home', tabHistory = [] }) {
    // 1. Dynamic date modal
    if (openModals.includes('date-info-modal')) {
        return { handled: true, action: 'close_date_modal' };
    }

    // 2. Modals list in priority order
    const modalOrder = [
        'summary-modal', 'routine-diff-modal', 'workout-action-modal',
        'rpe-modal', 'daily-weight-modal', 'profile-settings-modal',
        'plate-calculator-modal', 'exercise-history-modal', 'custom-exercise-modal',
        'exercise-modal', 'set-edit-modal', 'routine-paste-modal',
        'routine-edit-modal', 'routine-manage-modal'
    ];

    for (const m of modalOrder) {
        if (openModals.includes(m)) {
            return { handled: true, action: `close_modal_${m}` };
        }
    }

    // 3. Active workout tab
    if (currentTab === 'workout_active') {
        return { handled: true, action: 'prompt_abort_workout' };
    }

    // 4. Sub tabs back
    if (tabHistory.length > 0) {
        const prev = tabHistory[tabHistory.length - 1];
        return { handled: true, action: `switch_tab_${prev}` };
    }

    if (currentTab !== 'home') {
        return { handled: true, action: 'switch_tab_home' };
    }

    // 5. At home tab without modals -> pass to native exit
    return { handled: false, action: 'native_double_press_exit' };
}

test('simulateAndroidBack closes top modal first', () => {
    const res = simulateAndroidBack({ openModals: ['routine-manage-modal', 'routine-edit-modal'], currentTab: 'workout' });
    assert.equal(res.handled, true);
    assert.equal(res.action, 'close_modal_routine-edit-modal');
});

test('simulateAndroidBack prompts abort if in active workout', () => {
    const res = simulateAndroidBack({ openModals: [], currentTab: 'workout_active' });
    assert.equal(res.handled, true);
    assert.equal(res.action, 'prompt_abort_workout');
});

test('simulateAndroidBack returns to home from report tab', () => {
    const res = simulateAndroidBack({ openModals: [], currentTab: 'report', tabHistory: ['home'] });
    assert.equal(res.handled, true);
    assert.equal(res.action, 'switch_tab_home');
});

test('simulateAndroidBack yields to native exit only when at clean home screen', () => {
    const res = simulateAndroidBack({ openModals: [], currentTab: 'home', tabHistory: [] });
    assert.equal(res.handled, false);
    assert.equal(res.action, 'native_double_press_exit');
});
