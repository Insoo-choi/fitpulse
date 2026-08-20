// --- Utilities, Classification & Clipboard ---

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
