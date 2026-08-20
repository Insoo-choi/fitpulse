// --- Modals, Exercise Picker, Routine Manager & Paste Parser ---

function openExerciseModal(isReplace) { 
    replaceTargetIndex = isReplace ? replaceTargetIndex : -1;
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.open = "true";
    }
    renderExerciseList();
}

function openExerciseReplaceModal(idx) { 
    replaceTargetIndex = idx;
    openExerciseModal(true);
}

function closeExerciseModal() {
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.dataset.open = "false";
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

function renderExerciseList() {
    const listEl = document.getElementById('exercise-list');
    if (!listEl) return;
    const searchInput = document.getElementById('exercise-search');
    const search = (searchInput ? searchInput.value : '').toLowerCase();
    let filtered = exerciseDB.filter(e => e.name.toLowerCase().includes(search));
    if (currentExerciseCategoryFilter !== 'all') {
        filtered = filtered.filter(e => e.category === currentExerciseCategoryFilter);
    }
    
    listEl.innerHTML = filtered.map(e => `
        <div class="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-3 active:bg-slate-700 transition-colors shadow-sm cursor-pointer" onclick="selectExercise('${e.name}')">
            <span class="font-bold text-white text-sm">${e.name}</span>
            <span class="text-[10px] bg-brand-900/50 text-brand-300 border border-brand-700/50 px-2 py-1 rounded-md font-bold">${getOverloadTypeLabel(e.type || 'isolation')}</span>
        </div>
    `).join('');
}

function selectExercise(name) {
    const dbEx = exerciseDB.find(e => e.name === name);
    if (!dbEx) return;

    if (isEditingForRoutine && editingRoutine) {
        const defaultSets = [{ weight: '20', reps: '10' }, { weight: '20', reps: '10' }, { weight: '20', reps: '10' }];
        editingRoutine.exercises.push({
            name: dbEx.name,
            sets: defaultSets
        });
        isEditingForRoutine = false;
        closeExerciseModal();
        renderRoutineEditExercises();
        return;
    }

    const newEx = {
        name: dbEx.name,
        sets: [{weight:'0', reps:'0', completed: false}],
        weightType: dbEx.defaultWeightType || 'total',
        overloadType: dbEx.type
    };

    if (state.activeWorkout) {
        if (replaceTargetIndex > -1) {
            const oldSets = state.activeWorkout.exercises[replaceTargetIndex].sets;
            if(oldSets && oldSets.length > 0) {
                newEx.sets = JSON.parse(JSON.stringify(oldSets));
                newEx.sets.forEach(s => s.completed = false);
            }
            state.activeWorkout.exercises[replaceTargetIndex] = newEx;
        } else {
            state.activeWorkout.exercises.push(newEx);
        }
        
        saveActiveWorkout();
        updateUI();
    }
    
    closeExerciseModal();
}

function filterExercises() {
    renderExerciseList();
}

function setCategoryFilter(cat) { 
    currentExerciseCategoryFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.className = 'cat-btn px-4 py-1.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 whitespace-nowrap';
    });
    const activeBtn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
    if(activeBtn) activeBtn.className = 'cat-btn px-4 py-1.5 rounded-full text-xs font-bold bg-brand-600 text-white whitespace-nowrap';
    
    renderExerciseList();
}

function addCustomExercise() {
    const input = document.getElementById('custom-ex-name');
    if (input) input.value = '';
    const modal = document.getElementById('custom-exercise-modal');
    if (modal) modal.classList.remove('hidden');
}

function saveCustomExercise() {
    const nameInput = document.getElementById('custom-ex-name');
    const name = (nameInput ? nameInput.value : '').trim();
    if (!name) {
        alert('운동 이름을 입력해주세요.');
        return;
    }
    if (exerciseDB.some(e => e.name === name)) {
        alert('이미 존재하는 운동 이름입니다.');
        return;
    }
    const catEl = document.getElementById('custom-ex-category');
    const typeEl = document.getElementById('custom-ex-type');
    const category = catEl ? catEl.value : '가슴';
    const type = typeEl ? typeEl.value : 'upper_compound';
    
    const newEx = { name, category, type };
    exerciseDB.unshift(newEx);
    saveData();
    
    closeModal('custom-exercise-modal');
    renderExerciseList();
    
    if (state.activeWorkout || replaceTargetIndex > -1 || isEditingForRoutine) {
        selectExercise(name);
    }
}

// --- Routine CRUD Logic ---
function createNewRoutine() {
    editingRoutineId = null;
    editingRoutine = {
        id: 'routine_' + Date.now(),
        name: '',
        exercises: []
    };
    const titleEl = document.getElementById('routine-modal-title');
    if (titleEl) titleEl.innerText = '새 루틴 생성';
    const nameInput = document.getElementById('edit-routine-name');
    if (nameInput) nameInput.value = '';
    const delBtn = document.getElementById('btn-delete-routine');
    if (delBtn) delBtn.classList.add('hidden');
    renderRoutineEditExercises();
    const modal = document.getElementById('routine-edit-modal');
    if (modal) modal.classList.remove('hidden');
}

function openRoutineEditModal(id) {
    editingRoutineId = id;
    const r = state.routines.find(x => x.id === id);
    if (!r) return;
    editingRoutine = JSON.parse(JSON.stringify(r));
    const titleEl = document.getElementById('routine-modal-title');
    if (titleEl) titleEl.innerText = '루틴 편집';
    const nameInput = document.getElementById('edit-routine-name');
    if (nameInput) nameInput.value = editingRoutine.name;
    const delBtn = document.getElementById('btn-delete-routine');
    if (delBtn) delBtn.classList.remove('hidden');
    renderRoutineEditExercises();
    const modal = document.getElementById('routine-edit-modal');
    if (modal) modal.classList.remove('hidden');
}

function renderRoutineEditExercises() {
    const container = document.getElementById('routine-edit-exercises');
    if (!container || !editingRoutine) return;
    
    if (!editingRoutine.exercises || editingRoutine.exercises.length === 0) {
        container.innerHTML = `<div class="text-slate-500 text-center py-12 text-sm font-bold">등록된 운동이 없습니다.<br>하단의 '+ 종목 추가하기'를 눌러 추가해보세요.</div>`;
        return;
    }
    
    container.innerHTML = editingRoutine.exercises.map((ex, exIdx) => {
        let setsHtml = (ex.sets || []).map((s, sIdx) => `
            <div class="flex items-center gap-2 mb-2">
                <span class="w-6 text-slate-500 font-bold text-xs text-center">${sIdx + 1}</span>
                <div class="flex-1 flex items-center bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700/50">
                    <input type="number" step="0.5" value="${s.weight || 0}" class="w-full bg-transparent text-center text-white font-bold text-sm outline-none" oninput="updateRoutineSetVal(${exIdx}, ${sIdx}, 'weight', this.value)">
                    <span class="text-[10px] text-slate-500 font-bold ml-1">kg</span>
                </div>
                <div class="flex-1 flex items-center bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700/50">
                    <input type="number" value="${s.reps || 0}" class="w-full bg-transparent text-center text-white font-bold text-sm outline-none" oninput="updateRoutineSetVal(${exIdx}, ${sIdx}, 'reps', this.value)">
                    <span class="text-[10px] text-slate-500 font-bold ml-1">회</span>
                </div>
                <button onclick="removeRoutineSet(${exIdx}, ${sIdx})" class="text-slate-500 hover:text-rose-400 p-1.5 active:scale-95"><i data-lucide="minus-circle" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        
        return `
            <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-black text-white text-base truncate pr-2">${ex.name}</h4>
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="moveRoutineExercise(${exIdx}, -1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700 rounded-lg active:scale-95" ${exIdx === 0 ? 'disabled style="opacity:0.3"' : ''}><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
                        <button onclick="moveRoutineExercise(${exIdx}, 1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700 rounded-lg active:scale-95" ${exIdx === editingRoutine.exercises.length - 1 ? 'disabled style="opacity:0.3"' : ''}><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
                        <button onclick="removeRoutineExercise(${exIdx})" class="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/30 rounded-lg ml-1 active:scale-95"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div class="bg-slate-900/60 p-3 rounded-xl">
                    ${setsHtml}
                    <button onclick="addRoutineSet(${exIdx})" class="w-full mt-1 py-1.5 border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg active:bg-slate-800">+ 세트 추가</button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons({ root: container });
}

function updateRoutineSetVal(exIdx, sIdx, field, val) {
    if (editingRoutine && editingRoutine.exercises[exIdx] && editingRoutine.exercises[exIdx].sets[sIdx]) {
        editingRoutine.exercises[exIdx].sets[sIdx][field] = val.toString();
    }
}

function addRoutineSet(exIdx) {
    const ex = editingRoutine.exercises[exIdx];
    const last = ex.sets[ex.sets.length - 1] || { weight: '20', reps: '10' };
    ex.sets.push({ weight: last.weight || '20', reps: last.reps || '10' });
    renderRoutineEditExercises();
}

function removeRoutineSet(exIdx, sIdx) {
    const ex = editingRoutine.exercises[exIdx];
    if (ex.sets.length <= 1) {
        alert('최소 1개의 세트가 필요합니다.');
        return;
    }
    ex.sets.splice(sIdx, 1);
    renderRoutineEditExercises();
}

function moveRoutineExercise(exIdx, dir) {
    const targetIdx = exIdx + dir;
    if (targetIdx < 0 || targetIdx >= editingRoutine.exercises.length) return;
    const item = editingRoutine.exercises.splice(exIdx, 1)[0];
    editingRoutine.exercises.splice(targetIdx, 0, item);
    renderRoutineEditExercises();
}

function removeRoutineExercise(exIdx) {
    editingRoutine.exercises.splice(exIdx, 1);
    renderRoutineEditExercises();
}

function openRoutineExerciseAddModal() {
    isEditingForRoutine = true;
    replaceTargetIndex = -1;
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.open = "true";
    }
    renderExerciseList();
}

function openRoutineManageModal() {
    renderRoutineManageList();
    const modal = document.getElementById('routine-manage-modal');
    if (modal) modal.classList.remove('hidden');
}

function renderRoutineManageList() {
    const listEl = document.getElementById('routine-manage-list');
    if (!listEl) return;
    
    if (state.routines.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-16 text-slate-500">
                <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <i data-lucide="dumbbell" class="w-6 h-6"></i>
                </div>
                <p class="font-bold text-sm text-slate-400 mb-1">등록된 루틴이 없습니다.</p>
                <p class="text-xs text-slate-500 mb-4">새 루틴을 생성하거나 텍스트를 붙여넣어 시작하세요.</p>
                <div class="flex justify-center gap-2">
                    <button onclick="createNewRoutineFromManage()" class="text-xs bg-brand-600 text-white font-bold px-4 py-2 rounded-xl active:scale-95 transition-all">+ 새 루틴</button>
                    <button onclick="openRoutinePasteFromManage()" class="text-xs bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl active:scale-95 transition-all">붙여넣기</button>
                </div>
            </div>
        `;
        lucide.createIcons({ root: listEl });
        return;
    }
    
    listEl.innerHTML = state.routines.map(r => `
        <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3">
            <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0 pr-3 cursor-pointer" onclick="startRoutineFromManage('${r.id}')">
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-white text-base truncate">${r.name}</h4>
                        <span class="text-[10px] bg-brand-900/60 text-brand-300 font-bold px-2 py-0.5 rounded-full border border-brand-700/40">${r.exercises.length}종목</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 line-clamp-1">${r.exercises.map(e => e.name).join(', ')}</p>
                </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-700/40">
                <button onclick="startRoutineFromManage('${r.id}')" class="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all">
                    <i data-lucide="play" class="w-3.5 h-3.5 fill-emerald-400"></i> 운동 시작
                </button>
                <div class="flex items-center gap-1.5">
                    <button onclick="openRoutineEditModal('${r.id}')" class="px-3 py-1.5 text-slate-300 bg-slate-700/70 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5 text-brand-400"></i> 수정
                    </button>
                    <button onclick="deleteRoutineDirectly('${r.id}')" class="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/30 rounded-xl active:scale-95 transition-all" title="삭제">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons({ root: listEl });
}

function createNewRoutineFromManage() {
    createNewRoutine();
}

function openRoutinePasteFromManage() {
    openRoutinePasteModal();
}

function startRoutineFromManage(id) {
    closeModal('routine-manage-modal');
    startWorkout(id);
}

function deleteRoutineDirectly(id) {
    const routine = state.routines.find(r => r.id === id);
    const rName = routine ? routine.name : '루틴';
    if (!confirm(`'${rName}'을(를) 삭제하시겠습니까?`)) return;
    
    state.routines = state.routines.filter(r => r.id !== id);
    saveData();
    renderRoutineManageList();
    if (currentTab === 'workout') switchTab('workout');
}

function deleteCurrentRoutine() {
    if (!editingRoutineId) return;
    if (!confirm('이 루틴을 삭제하시겠습니까?')) return;
    state.routines = state.routines.filter(r => r.id !== editingRoutineId);
    saveData();
    closeModal('routine-edit-modal');
    editingRoutineId = null;
    editingRoutine = null;
    renderRoutineManageList();
    if (currentTab === 'workout') {
        switchTab('workout');
    }
}

function saveRoutineEdit() {
    const nameInput = document.getElementById('edit-routine-name');
    const name = (nameInput ? nameInput.value : '').trim();
    if (!name) {
        alert('루틴 이름을 입력해주세요.');
        return;
    }
    if (!editingRoutine.exercises || editingRoutine.exercises.length === 0) {
        alert('최소 1개 이상의 운동을 추가해주세요.');
        return;
    }
    
    editingRoutine.name = name;
    
    if (editingRoutineId) {
        const idx = state.routines.findIndex(r => r.id === editingRoutineId);
        if (idx > -1) {
            state.routines[idx] = editingRoutine;
        } else {
            state.routines.push(editingRoutine);
        }
    } else {
        state.routines.push(editingRoutine);
    }
    
    saveData();
    closeModal('routine-edit-modal');
    editingRoutineId = null;
    editingRoutine = null;
    renderRoutineManageList();
    
    if (currentTab === 'workout') {
        switchTab('workout');
    }
}

// --- Routine Paste Parser Logic ---
function openRoutinePasteModal() {
    const nameInput = document.getElementById('paste-routine-name');
    const textInput = document.getElementById('paste-routine-text');
    if (nameInput) nameInput.value = '';
    if (textInput) textInput.value = '';
    const modal = document.getElementById('routine-paste-modal');
    if (modal) modal.classList.remove('hidden');
}

function parseRoutineText(text, fallbackName) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return null;
    
    let routineName = fallbackName || '';
    const exercises = [];
    
    lines.forEach((line) => {
        const titleMatch = line.match(/^\[(.*?)\]|^#+\s*(.*?)$|^===(.*?)===|^【(.*?)】/);
        if (titleMatch && !routineName) {
            routineName = (titleMatch[1] || titleMatch[2] || titleMatch[3] || titleMatch[4] || '').trim();
            return;
        }
        
        let cleanLine = line.replace(/^[\d\.\)\-\*•\s]+/, '').trim();
        if (!cleanLine || cleanLine.startsWith('//') || cleanLine.startsWith('/*')) return;
        
        let weight = '0';
        const weightMatch = cleanLine.match(/(\d+(?:\.\d+)?)\s*(?:kg|k|키로|킬로)/i);
        if (weightMatch) {
            weight = weightMatch[1];
        }
        
        let reps = '10';
        let setsCount = 3;
        
        // 패턴 1: 10회 3세트
        const repSetMatch = cleanLine.match(/(\d+)\s*(?:회|reps?|r)\s*(\d+)\s*(?:세트|sets?|s)/i);
        // 패턴 2: 3세트 10회
        const setRepMatch = cleanLine.match(/(\d+)\s*(?:세트|sets?|s)\s*(\d+)\s*(?:회|reps?|r)/i);
        // 패턴 3: 10x3 또는 10*3 또는 10×3 (횟수 x 세트수)
        const multMatch = cleanLine.match(/(\d+)\s*(?:x|X|\*|×)\s*(\d+)/);
        
        if (repSetMatch) {
            reps = repSetMatch[1];
            setsCount = parseInt(repSetMatch[2]) || 3;
        } else if (setRepMatch) {
            setsCount = parseInt(setRepMatch[1]) || 3;
            reps = setRepMatch[2];
        } else if (multMatch) {
            reps = multMatch[1];
            setsCount = parseInt(multMatch[2]) || 3;
        } else {
            const singleRep = cleanLine.match(/(\d+)\s*(?:회|reps?|r)/i);
            const singleSet = cleanLine.match(/(\d+)\s*(?:세트|sets?|s)/i);
            if (singleRep) reps = singleRep[1];
            if (singleSet) setsCount = parseInt(singleSet[1]) || 3;
        }
        
        let exName = cleanLine
            .replace(/(\d+(?:\.\d+)?)\s*(?:kg|k|키로|킬로)/gi, '')
            .replace(/(\d+)\s*(?:세트|sets?|s)/gi, '')
            .replace(/(\d+)\s*(?:회|reps?|r)/gi, '')
            .replace(/(?:x|X|\*|×)\s*\d+/g, '')
            .replace(/[:\-,\/|]/g, '')
            .trim();
        
        if (!exName || exName.length < 2) return;
        
        const cleanExNameForSearch = exName.replace(/\s+/g, '').toLowerCase();
        const matchedDB = exerciseDB.find(e => {
            const dbClean = e.name.replace(/\s+/g, '').toLowerCase();
            return dbClean === cleanExNameForSearch || dbClean.includes(cleanExNameForSearch) || cleanExNameForSearch.includes(dbClean);
        });
        
        const finalName = matchedDB ? matchedDB.name : exName;
        
        if (!matchedDB && !exerciseDB.some(e => e.name === finalName)) {
            exerciseDB.push({ name: finalName, category: '가슴', type: getExerciseCategory(finalName) });
        }
        
        const sets = [];
        for (let s = 0; s < Math.min(Math.max(setsCount, 1), 15); s++) {
            sets.push({ weight: weight, reps: reps });
        }
        
        exercises.push({
            name: finalName,
            sets: sets
        });
    });
    
    if (exercises.length === 0) return null;
    if (!routineName) {
        const todayStr = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
        routineName = `붙여넣은 루틴 (${todayStr.slice(5)})`;
    }
    
    return {
        id: 'routine_' + Date.now(),
        name: routineName,
        exercises: exercises
    };
}

function processPastedRoutine(startNow) {
    const textInput = document.getElementById('paste-routine-text');
    const nameInput = document.getElementById('paste-routine-name');
    const text = (textInput ? textInput.value : '').trim();
    const customName = (nameInput ? nameInput.value : '').trim();
    
    if (!text) {
        alert('붙여넣을 텍스트를 입력해주세요.');
        return;
    }
    
    const routine = parseRoutineText(text, customName);
    if (!routine || routine.exercises.length === 0) {
        alert('운동 종목을 인식하지 못했습니다. 한 줄에 하나씩 운동명을 입력해주세요.');
        return;
    }
    
    state.routines.unshift(routine);
    saveData();
    closeModal('routine-paste-modal');
    renderRoutineManageList();
    
    if (startNow) {
        closeModal('routine-manage-modal');
        startWorkout(routine.id);
    } else {
        alert(`✅ '${routine.name}' (${routine.exercises.length}개 종목)이 루틴 목록에 저장되었습니다!`);
        if (currentTab === 'workout') switchTab('workout');
    }
}

// --- Daily Weight Prompt Logic ---
function openDailyWeightModal() {
    const input = document.getElementById('daily-weight-input');
    if (input) {
        input.value = (parseFloat(state.bodyWeight) || 70).toFixed(1);
    }
    const modal = document.getElementById('daily-weight-modal');
    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
}

function adjustDailyWeight(val) {
    const input = document.getElementById('daily-weight-input');
    if (!input) return;
    let current = parseFloat(input.value) || state.bodyWeight || 70;
    current = Math.max(20, Math.min(300, current + val));
    input.value = current.toFixed(1);
}

function saveDailyWeight() {
    const input = document.getElementById('daily-weight-input');
    const newWeight = input ? (parseFloat(input.value) || state.bodyWeight) : state.bodyWeight;
    
    state.bodyWeight = newWeight;
    
    const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    if (!state.weightHistory) state.weightHistory = [];
    const wIdx = state.weightHistory.findIndex(w => w.date === today);
    if (wIdx > -1) {
        state.weightHistory[wIdx].weight = newWeight;
    } else {
        state.weightHistory.push({ date: today, weight: newWeight });
    }
    
    saveData();
    localStorage.setItem('fitpulse_weight_dismissed_date', today);
    closeModal('daily-weight-modal');
    
    if (currentTab === 'report') {
        renderCharts();
    }
}

function dismissDailyWeight() {
    const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    localStorage.setItem('fitpulse_weight_dismissed_date', today);
    closeModal('daily-weight-modal');
}

// --- Barbell Plate Calculator Modal Logic ---
function openPlateCalculator(initialWeight = 60) {
    const input = document.getElementById('plate-target-weight');
    if (input) input.value = initialWeight;
    renderPlateCalculator();
    const modal = document.getElementById('plate-calculator-modal');
    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
}

function openPlateCalculatorFromModal() {
    const weightInput = document.getElementById('edit-weight-input');
    const w = parseFloat(weightInput ? weightInput.value : 0) || 60;
    openPlateCalculator(w);
}

function renderPlateCalculator() {
    const targetInput = document.getElementById('plate-target-weight');
    const barSelect = document.getElementById('plate-bar-weight');
    const sideEl = document.getElementById('plate-side-weight');
    const visualEl = document.getElementById('plate-visual-container');
    const summaryEl = document.getElementById('plate-summary-text');
    
    const target = parseFloat(targetInput ? targetInput.value : 0) || 0;
    const bar = parseFloat(barSelect ? barSelect.value : 20) || 20;
    
    const res = typeof calculatePlates === 'function' ? calculatePlates(target, bar) : { sideWeight: 0, plates: [] };
    
    if (sideEl) sideEl.innerText = `${res.sideWeight} kg`;
    
    const plateColors = {
        20: 'bg-blue-600 border-blue-400 text-white',
        15: 'bg-yellow-500 border-yellow-300 text-slate-900',
        10: 'bg-emerald-600 border-emerald-400 text-white',
        5: 'bg-rose-600 border-rose-400 text-white',
        2.5: 'bg-slate-700 border-slate-500 text-slate-100',
        1.25: 'bg-slate-500 border-slate-300 text-slate-900'
    };
    
    if (visualEl) {
        if (res.plates.length === 0) {
            visualEl.innerHTML = `<span class="text-xs text-slate-500 font-bold">${target <= bar ? '원판 필요 없음 (바벨만 사용)' : '장착 가능한 원판 조합 없음'}</span>`;
        } else {
            let html = '';
            res.plates.forEach(p => {
                const color = plateColors[p.plate] || 'bg-slate-700 border-slate-500 text-white';
                for (let i = 0; i < p.count; i++) {
                    html += `
                        <div class="flex flex-col items-center justify-center w-10 h-16 rounded-lg border-2 shadow-md ${color} font-black text-xs">
                            <span>${p.plate}</span>
                            <span class="text-[8px] font-normal opacity-80">kg</span>
                        </div>
                    `;
                }
            });
            visualEl.innerHTML = html;
        }
    }
    
    if (summaryEl) {
        if (res.plates.length > 0) {
            const summaryStr = res.plates.map(p => `<span class="text-amber-400 font-bold">${p.plate}kg</span> x ${p.count}개`).join(' + ');
            summaryEl.innerHTML = `한쪽당: ${summaryStr} ${res.remainder > 0 ? `<span class="text-rose-400 text-[10px]"> (잔여 ${res.remainder}kg)</span>` : ''}`;
        } else {
            summaryEl.innerHTML = '';
        }
    }
}

// --- Profile Settings Modal Logic ---
function updateHeaderProfileInfo() {
    const el = document.getElementById('header-user-weight');
    if (el) {
        const bw = (typeof state !== 'undefined' && state && state.bodyWeight) ? parseFloat(state.bodyWeight).toFixed(1) : '70.0';
        el.innerText = `${bw} kg`;
    }
}

function openProfileSettingsModal() {
    const hInput = document.getElementById('modal-user-height');
    const wInput = document.getElementById('modal-user-weight');
    const incInput = document.getElementById('modal-user-min-inc');
    
    if (hInput) hInput.value = (typeof state !== 'undefined' && state.height) ? state.height : 175;
    if (wInput) wInput.value = (typeof state !== 'undefined' && state.bodyWeight) ? state.bodyWeight : 70;
    if (incInput) incInput.value = (typeof state !== 'undefined' && state.minIncrement) ? state.minIncrement : 2.5;
    
    const modal = document.getElementById('profile-settings-modal');
    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
}

function saveProfileModalSettings() {
    const hInput = document.getElementById('modal-user-height');
    const wInput = document.getElementById('modal-user-weight');
    const incInput = document.getElementById('modal-user-min-inc');
    
    const newHeight = hInput ? parseFloat(hInput.value) : 175;
    const newWeight = wInput ? parseFloat(wInput.value) : 70;
    const newMinInc = incInput ? parseFloat(incInput.value) : 2.5;
    
    if (newHeight && newHeight > 50 && newHeight < 300) {
        state.height = newHeight;
    }
    if (newWeight && newWeight > 20 && newWeight < 500) {
        state.bodyWeight = newWeight;
        const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
        if (!state.weightHistory) state.weightHistory = [];
        const wIdx = state.weightHistory.findIndex(w => w.date === today);
        if (wIdx > -1) {
            state.weightHistory[wIdx].weight = newWeight;
        } else {
            state.weightHistory.push({ date: today, weight: newWeight });
        }
    }
    if (newMinInc && newMinInc > 0 && newMinInc <= 20) {
        state.minIncrement = newMinInc;
    }
    
    if (typeof saveData === 'function') saveData();
    updateHeaderProfileInfo();
    closeModal('profile-settings-modal');
    
    if (typeof currentTab !== 'undefined' && currentTab === 'report') {
        renderCharts();
    }
}
