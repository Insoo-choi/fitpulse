// --- Application Entry Point & Navigation ---

window.onload = () => {
    lucide.createIcons();
    loadData();
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

function switchTab(tab) {
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

function connectWatch() {
    alert("워치 연결은 데모 모드입니다.");
}
