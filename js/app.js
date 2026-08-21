// --- Application Entry Point & Navigation ---

window.onload = () => {
    lucide.createIcons();
    loadData();
    if (typeof updateHeaderProfileInfo === 'function') updateHeaderProfileInfo();
    if (state.activeWorkout) {
        switchTab('workout_active');
        restoreRestTimerState();
    } else {
        switchTab('home');
        checkDailyWeightPrompt();
    }
    bindDragEvents();
    setupLifecycleListeners();
};

function checkDailyWeightPrompt() {
    const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    const hasTodayRecord = (state.weightHistory || []).some(w => w.date === today);
    const dismissedDate = localStorage.getItem('fitpulse_weight_dismissed_date');
    
    if (!hasTodayRecord && dismissedDate !== today) {
        setTimeout(() => {
            openDailyWeightModal();
        }, 500);
    }
}

function setupLifecycleListeners() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (state.activeWorkout) {
                const timerEl = document.getElementById('workout-timer');
                if (timerEl && state.activeWorkout.startTime) {
                    const diff = Date.now() - state.activeWorkout.startTime;
                    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                    timerEl.innerText = `${h}:${m}:${s}`;
                }
                restoreRestTimerState();
            }
        } else {
            if (state.activeWorkout) {
                saveActiveWorkout();
                saveRestTimerState();
            }
        }
    });

    window.addEventListener('pagehide', () => {
        if (state.activeWorkout) {
            saveActiveWorkout();
            saveRestTimerState();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (state.activeWorkout) {
            saveActiveWorkout();
            saveRestTimerState();
        }
    });
}

let tabHistory = [];

function switchTab(tab, isBack = false) {
    if (!isBack && currentTab && currentTab !== tab && currentTab !== 'workout_active' && tab !== 'workout_active') {
        tabHistory.push(currentTab);
        if (tabHistory.length > 20) tabHistory.shift();
    }
    
    currentTab = tab;
    document.querySelectorAll('[id^="tab-"]').forEach(el => {
        el.classList.remove('tab-active');
        el.classList.add('tab-inactive');
    });
    
    const views = ['home', 'workout', 'report', 'workout_active'];
    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.remove();
    });

    const main = document.getElementById('main-content');
    let content = '';

    if (tab === 'home') {
        const t = document.getElementById('tab-home');
        if (t) { t.classList.add('tab-active'); t.classList.remove('tab-inactive'); }
        content = renderHomeView();
    } else if (tab === 'workout') {
        if (state.activeWorkout) {
            switchTab('workout_active');
            return;
        }
        const t = document.getElementById('tab-workout');
        if (t) { t.classList.add('tab-active'); t.classList.remove('tab-inactive'); }
        content = renderWorkoutStartView();
    } else if (tab === 'workout_active') {
        const t = document.getElementById('tab-workout');
        if (t) { t.classList.add('tab-active'); t.classList.remove('tab-inactive'); }
        content = renderActiveWorkoutView();
    } else if (tab === 'report') {
        const t = document.getElementById('tab-report');
        if (t) { t.classList.add('tab-active'); t.classList.remove('tab-inactive'); }
        content = renderReportView();
    }

    if (main) {
        main.innerHTML = `<div id="view-${tab}" class="w-full flex flex-col flex-1 pb-10 fade-in">${content}</div>`;
    }
    lucide.createIcons();
    
    if (tab === 'workout_active') {
        renderActiveWorkout();
        startWorkoutTimer();
    } else if (tab === 'report') {
        renderCharts();
    } else if (tab === 'home') {
        renderCalendar();
    }
}

// --- Android Back Button Handler ---
window.handleAndroidBack = function() {
    try {
        // 1. Dynamic date info modal check
        const dateModal = document.getElementById('date-info-modal');
        if (dateModal) {
            dateModal.remove();
            return true;
        }

        // 2. Modals in LIFO order (highest z-index / top modal first)
        const modalCheckList = [
            { id: 'summary-modal', close: () => closeSummary() },
            { id: 'change-routine-modal', close: () => closeModal('change-routine-modal') },
            { id: 'routine-diff-modal', close: () => closeModal('routine-diff-modal') },
            { id: 'workout-action-modal', close: () => closeModal('workout-action-modal') },
            { id: 'rpe-modal', close: () => closeModal('rpe-modal') },
            { id: 'daily-weight-modal', close: () => closeModal('daily-weight-modal') },
            { id: 'profile-settings-modal', close: () => closeModal('profile-settings-modal') },
            { id: 'plate-calculator-modal', close: () => closeModal('plate-calculator-modal') },
            { id: 'exercise-history-modal', close: () => closeModal('exercise-history-modal') },
            { id: 'custom-exercise-modal', close: () => closeModal('custom-exercise-modal') },
            { id: 'exercise-modal', close: () => closeExerciseModal() },
            { id: 'set-edit-modal', close: () => closeModal('set-edit-modal') },
            { id: 'routine-paste-modal', close: () => closeModal('routine-paste-modal') },
            { id: 'routine-edit-modal', close: () => closeRoutineEditModal() },
            { id: 'routine-manage-modal', close: () => closeModal('routine-manage-modal') }
        ];

        for (const m of modalCheckList) {
            const el = document.getElementById(m.id);
            if (el && !el.classList.contains('hidden')) {
                m.close();
                return true;
            }
        }

        // 3. Active workout tab back handling -> prompt workout abort
        if (currentTab === 'workout_active') {
            promptAbortWorkout();
            return true;
        }

        // 4. Sub tabs back handling -> previous tab or Home
        if (tabHistory.length > 0) {
            const prevTab = tabHistory.pop();
            if (prevTab && prevTab !== currentTab) {
                switchTab(prevTab, true);
                return true;
            }
        }

        if (currentTab !== 'home') {
            switchTab('home', true);
            return true;
        }

        // 5. At home tab without any modals -> return false to let native handle double-press exit
        return false;
    } catch (e) {
        console.error('Error in handleAndroidBack:', e);
        return false;
    }
};
