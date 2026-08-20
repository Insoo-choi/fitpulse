// --- Utilities, Classification & Clipboard ---

function getTodayDateString(dateObj = new Date()) {
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getExerciseCategory(name, manualType) {
    if (manualType) return manualType;
    const n = name.toLowerCase();
    
    // 1. 대근육 복합 (하체 및 전신 대관절)
    if (n.includes('스쿼트') || n.includes('데드리프트') || n.includes('데드') || n.includes('레그프레스') || n.includes('레그 프레스') || n.includes('런지') || n.includes('스플릿') || n.includes('힙 쓰러스트') || n.includes('힙쓰러스트') || n.includes('랙풀') || n.includes('rdl')) {
        return 'large_compound';
    }
    
    // 2. 상체 다관절 복합
    if (!n.includes('플라이') && !n.includes('레이즈') && !n.includes('컬') && !n.includes('익스텐션') && !n.includes('푸시다운') && !n.includes('킥백')) {
        if (n.includes('벤치') || n.includes('프레스') || n.includes('ohp') || n.includes('로우') || n.includes('풀다운') || n.includes('풀인') || n.includes('풀업') || n.includes('턱걸이') || n.includes('친업') || n.includes('딥스') || n.includes('푸시업')) {
            return 'upper_compound';
        }
    }
    
    // 3. 소근육 및 고립 운동
    return 'isolation';
}

function getOverloadTypeLabel(type) {
    if (type === 'large_compound') return '💪대근육';
    if (type === 'upper_compound') return '🏋️상체다관절';
    if (type === 'isolation') return '🎯소근육';
    return '분류';
}

// --- 1RM & Personal Record (PR) Calculations ---
function calculate1RM(weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    // Epley formula: 1RM = w * (1 + r / 30)
    const e1rm = w * (1 + (r / 30));
    return Math.round(e1rm * 10) / 10;
}

function getPersonalRecord(exerciseName) {
    let max1RM = 0;
    let maxWeight = 0;
    let maxRepsAtMaxWeight = 0;
    let prDate = null;
    
    (state.history || []).forEach(workout => {
        if (workout.isRunning || !workout.exercises) return;
        workout.exercises.forEach(ex => {
            if (ex.name !== exerciseName || !ex.sets) return;
            ex.sets.forEach(s => {
                const w = parseFloat(s.weight) || 0;
                const r = parseInt(s.reps) || 0;
                const e1rm = calculate1RM(w, r);
                if (e1rm > max1RM) {
                    max1RM = e1rm;
                    maxWeight = w;
                    maxRepsAtMaxWeight = r;
                    prDate = workout.date;
                }
            });
        });
    });
    
    return {
        max1RM,
        maxWeight,
        maxReps: maxRepsAtMaxWeight,
        date: prDate
    };
}

// --- Weekly Muscle Volume Tracker (Hypertrophy Guidelines) ---
function calculateWeeklyMuscleVolume(historyList = (typeof state !== 'undefined' && state ? state.history : []), referenceDate = new Date()) {
    const categories = ['가슴', '등', '하체', '어깨', '팔', '코어'];
    const volumeMap = {
        '가슴': 0,
        '등': 0,
        '하체': 0,
        '어깨': 0,
        '팔': 0,
        '코어': 0
    };
    
    const ref = new Date(referenceDate);
    const sevenDaysAgo = new Date(ref);
    sevenDaysAgo.setDate(ref.getDate() - 6);
    const minDateStr = typeof getTodayDateString === 'function' ? getTodayDateString(sevenDaysAgo) : sevenDaysAgo.toISOString().slice(0, 10);
    const maxDateStr = typeof getTodayDateString === 'function' ? getTodayDateString(ref) : ref.toISOString().slice(0, 10);
    
    (historyList || []).forEach(workout => {
        if (workout.isRunning || !workout.exercises || !workout.date) return;
        if (workout.date < minDateStr || workout.date > maxDateStr) return;
        
        workout.exercises.forEach(ex => {
            let cat = '기타';
            const dbItem = (typeof exerciseDB !== 'undefined' ? exerciseDB : []).find(e => e.name === ex.name);
            if (dbItem && dbItem.category) {
                cat = dbItem.category;
            } else {
                const name = (ex.name || '').toLowerCase();
                if (name.includes('스쿼트') || name.includes('레그') || name.includes('런지') || name.includes('힙') || name.includes('카프')) cat = '하체';
                else if (name.includes('데드') || name.includes('풀업') || name.includes('턱걸이') || name.includes('랫') || name.includes('로우') || name.includes('풀다운')) cat = '등';
                else if (name.includes('벤치') || name.includes('체스트') || name.includes('딥스') || name.includes('푸시업') || name.includes('펙덱')) cat = '가슴';
                else if (name.includes('숄더') || name.includes('사레레') || name.includes('레이즈') || name.includes('ohp') || name.includes('프레스') || name.includes('슈러그')) cat = '어깨';
                else if (name.includes('컬') || name.includes('익스텐션') || name.includes('삼두') || name.includes('이두') || name.includes('푸시다운')) cat = '팔';
                else if (name.includes('크런치') || name.includes('플랭크') || name.includes('레그레이즈') || name.includes('앱')) cat = '코어';
                else cat = '가슴';
            }
            
            const setsCount = (ex.sets || []).length;
            if (volumeMap[cat] !== undefined) {
                volumeMap[cat] += setsCount;
            }
        });
    });
    
    return categories.map(cat => {
        const sets = volumeMap[cat] || 0;
        let status = 'low';
        let statusLabel = '유지 볼륨';
        let badgeColor = 'text-blue-400 bg-blue-950/80 border-blue-800/50';
        let barColor = 'from-blue-600 to-blue-400';
        
        if (sets >= 10 && sets <= 20) {
            status = 'optimal';
            statusLabel = '🔥 최적 성장';
            badgeColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800/50';
            barColor = 'from-emerald-600 to-emerald-400';
        } else if (sets > 20) {
            status = 'high';
            statusLabel = '⚡ 고볼륨';
            badgeColor = 'text-amber-400 bg-amber-950/80 border-amber-800/50';
            barColor = 'from-amber-600 to-amber-400';
        }
        
        return {
            category: cat,
            sets: sets,
            status: status,
            statusLabel: statusLabel,
            badgeColor: badgeColor,
            barColor: barColor,
            percentage: Math.min(Math.round((sets / 20) * 100), 100)
        };
    });
}

function copyWorkoutSummary() {
    const workout = lastFinishedWorkout || (state.history.length > 0 ? state.history[state.history.length - 1] : null);
    if (!workout) {
        alert('복사할 운동 기록이 없습니다.');
        return;
    }
    
    let text = `🔥 FitPulse Pro 운동 완료!\n`;
    text += `📅 날짜: ${workout.date}\n`;
    text += `🏋️ 루틴: ${workout.name || '자율 운동'}\n`;
    text += `⏱️ 시간: ${workout.duration}분 | 📊 총 볼륨: ${workout.totalVolume || 0}kg\n\n`;
    text += `[운동 목록]\n`;
    
    if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach((ex, idx) => {
            text += `${idx + 1}. ${ex.name}\n`;
            if (ex.sets && ex.sets.length > 0) {
                ex.sets.forEach((s, sIdx) => {
                    text += `   - ${sIdx + 1}세트: ${s.weight}kg x ${s.reps}회\n`;
                });
            }
        });
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('📋 운동 기록이 클립보드에 복사되었습니다!');
        }).catch(() => {
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('📋 운동 기록이 클립보드에 복사되었습니다!');
    } catch (err) {
        alert('클립보드 복사에 실패했습니다.');
    }
    document.body.removeChild(textarea);
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// --- Backup & Restore (JSON Export / Import) ---

function exportFitPulseData() {
    const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    const backupData = {
        app: 'FitPulse Pro',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        state: state
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpulse_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFitPulseData(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        const importedState = parsed.state || parsed;
        
        if (!importedState || typeof importedState !== 'object') {
            return { success: false, message: '올바른 백업 데이터 형식이 아닙니다.' };
        }
        
        if (!Array.isArray(importedState.routines) || !Array.isArray(importedState.history)) {
            return { success: false, message: '백업 데이터에 필수 항목(루틴, 기록)이 누락되었습니다.' };
        }
        
        state.routines = importedState.routines || [];
        state.history = importedState.history || [];
        state.weightHistory = importedState.weightHistory || [];
        state.bodyWeight = parseFloat(importedState.bodyWeight) || 70;
        state.height = parseFloat(importedState.height) || 175;
        state.minIncrement = parseFloat(importedState.minIncrement) || 2.5;
        state.defaultRestTime = parseInt(importedState.defaultRestTime) || 90;
        state.workoutCount = parseInt(importedState.workoutCount) || state.history.length;
        
        saveData();
        return { success: true, message: `✅ 백업 데이터가 성공적으로 복원되었습니다! (루틴 ${state.routines.length}개, 기록 ${state.history.length}개)` };
    } catch (e) {
        return { success: false, message: 'JSON 파일을 파싱하는 중 오류가 발생했습니다: ' + e.message };
    }
}

function handleBackupFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const result = importFitPulseData(e.target.result);
        alert(result.message);
        if (result.success) {
            if (typeof switchTab === 'function') {
                switchTab(currentTab || 'home');
            }
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// --- Rest Timer ---
function startRestTimer() {
    if (isResting) clearInterval(timerInterval);
    isResting = true;
    isOvertime = false;
    restTargetTime = Date.now() + (state.defaultRestTime * 1000);
    saveRestTimerState();
    
    const timerEl = document.getElementById('rest-timer');
    if (timerEl) timerEl.classList.remove('hidden');
    const iconCont = document.getElementById('rest-icon-container');
    if (iconCont) iconCont.className = 'bg-slate-700 p-2 rounded-lg';
    const icon = document.getElementById('rest-icon');
    if (icon) icon.classList.replace('text-rose-400', 'text-brand-400');
    const label = document.getElementById('rest-label');
    if (label) label.innerText = '휴식 타이머';
    const display = document.getElementById('rest-time-display');
    if (display) display.classList.replace('text-rose-400', 'text-white');
    
    timerInterval = setInterval(updateRestTimerDisplay, 100);
}

function updateRestTimerDisplay() {
    const now = Date.now();
    const diff = restTargetTime - now;
    const display = document.getElementById('rest-time-display');
    if (!display) return;
    
    if (diff <= 0) {
        if (!isOvertime) {
            isOvertime = true;
            if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
            const audio = document.getElementById('beep-sound');
            if(audio) audio.play().catch(e=>{});
            
            const iconCont = document.getElementById('rest-icon-container');
            if (iconCont) iconCont.className = 'bg-rose-900/50 p-2 rounded-lg animate-pulse';
            const icon = document.getElementById('rest-icon');
            if (icon) icon.classList.replace('text-brand-400', 'text-rose-400');
            const label = document.getElementById('rest-label');
            if (label) label.innerText = '휴식 초과';
            display.classList.replace('text-white', 'text-rose-400');
        }
        const overDiff = Math.abs(diff);
        const m = Math.floor(overDiff / 60000).toString().padStart(2, '0');
        const s = Math.floor((overDiff % 60000) / 1000).toString().padStart(2, '0');
        display.innerText = `+${m}:${s}`;
    } else {
        const m = Math.floor(diff / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        display.innerText = `${m}:${s}`;
    }
}

function addRestTime(secs) { 
    restTargetTime += secs * 1000; 
    state.defaultRestTime = Math.max(30, state.defaultRestTime + secs);
    saveData();
    saveRestTimerState();
}

function skipRestTime() {
    isResting = false;
    clearInterval(timerInterval);
    saveRestTimerState();
    const timerEl = document.getElementById('rest-timer');
    if (timerEl) timerEl.classList.add('hidden');
}

// --- Drag & Drop (Touch & Desktop) ---
let dragSrcEl = null;
let activeClone = null;
let initialY = 0;
let initialCloneTop = 0;
let originalCard = null;

function bindDragEvents() {
    const isTouch = 'ontouchstart' in window;
    const handles = document.querySelectorAll('.drag-handle-workout');
    
    handles.forEach(handle => {
        const card = handle.closest('.ex-card');
        if(!card) return;

        if(isTouch) {
            handle.addEventListener('touchstart', handleTouchStart, {passive: false});
            handle.addEventListener('touchmove', handleTouchMove, {passive: false});
            handle.addEventListener('touchend', handleTouchEnd);
        } else {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragenter', handleDragEnter);
            card.addEventListener('dragover', handleDragOver);
            card.addEventListener('dragleave', handleDragLeave);
            card.addEventListener('drop', handleDrop);
            card.addEventListener('dragend', handleDragEnd);
        }
    });
}

function handleTouchStart(e) {
    originalCard = this.closest('.ex-card');
    if(!originalCard) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    initialY = touch.clientY;
    
    const rect = originalCard.getBoundingClientRect();
    initialCloneTop = rect.top;
    activeClone = originalCard.cloneNode(true);
    activeClone.style.position = 'fixed';
    activeClone.style.top = initialCloneTop + 'px';
    activeClone.style.left = rect.left + 'px';
    activeClone.style.width = rect.width + 'px';
    activeClone.style.zIndex = '9999';
    activeClone.style.opacity = '0.9';
    activeClone.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
    document.body.appendChild(activeClone);
    
    originalCard.style.opacity = '0.3';
}

function handleTouchMove(e) {
    if(!activeClone) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - initialY;
    activeClone.style.top = (initialCloneTop + deltaY) + 'px';
    
    const scrollY = window.scrollY;
    if (touch.clientY < 100) { window.scrollBy(0, -10); }
    else if (window.innerHeight - touch.clientY < 100) { window.scrollBy(0, 10); }
    
    const siblings = [...document.querySelectorAll('.ex-card')].filter(c => c !== originalCard);
    const cloneRect = activeClone.getBoundingClientRect();
    const cloneCenterY = cloneRect.top + cloneRect.height / 2;
    
    for(let sibling of siblings) {
        const sibRect = sibling.getBoundingClientRect();
        if(cloneCenterY > sibRect.top && cloneCenterY < sibRect.bottom) {
            const container = document.getElementById('active-workout-exercises');
            const originalIdx = parseInt(originalCard.getAttribute('data-index'));
            const siblingIdx = parseInt(sibling.getAttribute('data-index'));
            
            if(originalIdx < siblingIdx) {
                sibling.after(originalCard);
            } else {
                sibling.before(originalCard);
            }
            let tempCards = container.querySelectorAll('.ex-card');
            tempCards.forEach((c, idx) => c.setAttribute('data-index', idx));
            break;
        }
    }
}

function handleTouchEnd(e) {
    if(!activeClone) return;
    activeClone.remove();
    activeClone = null;
    originalCard.style.opacity = '1';
    
    const newCards = document.querySelectorAll('.ex-card');
    const newExercises = [];
    newCards.forEach(card => {
        const oldIdx = parseInt(card.getAttribute('data-index'));
        newExercises.push(state.activeWorkout.exercises[oldIdx]);
    });
    
    state.activeWorkout.exercises = newExercises;
    saveActiveWorkout();
    updateUI();
}

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDragEnter(e) { this.classList.add('drag-over'); }
function handleDragLeave(e) { this.classList.remove('drag-over'); }
function handleDragEnd(e) { this.classList.remove('dragging'); document.querySelectorAll('.ex-card').forEach(c => c.classList.remove('drag-over')); }
function handleDrop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
        const dragIdx = parseInt(dragSrcEl.getAttribute('data-index'));
        const dropIdx = parseInt(this.getAttribute('data-index'));
        
        const exToMove = state.activeWorkout.exercises.splice(dragIdx, 1)[0];
        state.activeWorkout.exercises.splice(dropIdx, 0, exToMove);
        
        saveActiveWorkout();
        updateUI();
    }
    return false;
}
