// --- State Management & Storage ---
let state = {
    history: [],
    routines: [],
    activeWorkout: null,
    workoutCount: 0,
    bodyWeight: 70,
    height: 175,
    minIncrement: 2.5,
    defaultRestTime: 60,
    weightHistory: []
};

// UI and Edit state
let currentTab = 'home';
let timerInterval = null;
let workoutTimerInterval = null;
let restTargetTime = 0; 
let isResting = false;
let isOvertime = false;
let hrDevice = null;
let hrChar = null;

let editingRoutineId = null;
let editingRoutine = null;
let currentEditingSet = null; // {exIndex, setIndex}
let replaceTargetIndex = -1;
let currentRpeExerciseIndex = -1;
let currentExerciseCategoryFilter = 'all';
let lastFinishedWorkout = null;
let isEditingForRoutine = false;

function loadData() {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {}
    }
    if (!state.routines) state.routines = [];
    if (!state.history) state.history = [];
    if (!state.bodyWeight) state.bodyWeight = 70;
    if (!state.height) state.height = 175;
    if (!state.minIncrement) state.minIncrement = 2.5;
    if (!state.defaultRestTime) state.defaultRestTime = 60;
    if (!state.weightHistory) state.weightHistory = [];
    
    // Merge Jeff Routines if missing
    jeffRoutines.forEach(jr => {
        if (!state.routines.find(r => r.id === jr.id)) {
            state.routines.unshift(jr);
        }
    });

    // Load active workout if exists
    const savedActive = localStorage.getItem('fitpulse_active');
    if (savedActive) {
        try {
            state.activeWorkout = JSON.parse(savedActive);
        } catch (e) {
            state.activeWorkout = null;
        }
    } else {
        state.activeWorkout = null;
    }

    const savedDB = localStorage.getItem(EXERCISE_DB_KEY);
    if (savedDB) {
        try {
            exerciseDB = JSON.parse(savedDB);
        } catch (e) {}
        defaultExercises.forEach(de => {
            if (!exerciseDB.find(e => e.name === de.name)) {
                exerciseDB.push(de);
            }
        });
    } else {
        exerciseDB = [...defaultExercises];
    }
}

function saveData() {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    localStorage.setItem(EXERCISE_DB_KEY, JSON.stringify(exerciseDB));
    if (state.activeWorkout) {
        localStorage.setItem('fitpulse_active', JSON.stringify(state.activeWorkout));
    } else {
        localStorage.removeItem('fitpulse_active');
    }
}

function saveActiveWorkout() {
    if (state.activeWorkout) {
        localStorage.setItem('fitpulse_active', JSON.stringify(state.activeWorkout));
    } else {
        localStorage.removeItem('fitpulse_active');
    }
}

function saveRestTimerState() {
    if (isResting && restTargetTime) {
        localStorage.setItem('fitpulse_rest_timer', JSON.stringify({
            restTargetTime: restTargetTime,
            isResting: true
        }));
    } else {
        localStorage.removeItem('fitpulse_rest_timer');
    }
}

function restoreRestTimerState() {
    const saved = localStorage.getItem('fitpulse_rest_timer');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data && data.isResting && data.restTargetTime) {
                isResting = true;
                restTargetTime = data.restTargetTime;
                const timerEl = document.getElementById('rest-timer');
                if (timerEl) {
                    timerEl.classList.remove('hidden');
                    if (timerInterval) clearInterval(timerInterval);
                    timerInterval = setInterval(updateRestTimerDisplay, 100);
                    updateRestTimerDisplay();
                }
            }
        } catch(e) {}
    }
}
