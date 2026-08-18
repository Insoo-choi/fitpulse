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

function deleteCurrentRoutine() {
    if (!editingRoutineId) return;
    if (!confirm('이 루틴을 삭제하시겠습니까?')) return;
    state.routines = state.routines.filter(r => r.id !== editingRoutineId);
    saveData();
    closeModal('routine-edit-modal');
    editingRoutineId = null;
    editingRoutine = null;
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
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return null;
    
    let routineName = fallbackName || '';
    const exercises = [];
    
    lines.forEach((line) => {
        const titleMatch = line.match(/^\[(.*?)\]|^#+\s*(.*?)$|^===(.*?)===/);
        if (titleMatch && !routineName) {
            routineName = (titleMatch[1] || titleMatch[2] || titleMatch[3] || '').trim();
            return;
        }
        
        let cleanLine = line.replace(/^[\d\.\)\-\*•\s]+/, '').trim();
        
        let weight = '0';
        const weightMatch = cleanLine.match(/(\d+(?:\.\d+)?)\s*(?:kg|k|키로)/i);
        if (weightMatch) {
            weight = weightMatch[1];
        }
        
        let reps = '10';
        const repsMatch = cleanLine.match(/(\d+)\s*(?:회|reps?|r)\b/i) || cleanLine.match(/(?:x|X|\*)\s*(\d+)/);
        if (repsMatch) {
            reps = repsMatch[1];
        }
        
        let setsCount = 3;
        const setsMatch = cleanLine.match(/(\d+)\s*(?:세트|sets?|s)\b/i);
        if (setsMatch) {
            setsCount = parseInt(setsMatch[1]) || 3;
        } else {
            const setRepMatch = cleanLine.match(/(\d+)\s*(?:x|X|\*)\s*(\d+)/);
            if (setRepMatch) {
                setsCount = parseInt(setRepMatch[1]) || 3;
                reps = setRepMatch[2];
            }
        }
        
        let exName = cleanLine
            .replace(/(\d+(?:\.\d+)?)\s*(?:kg|k|키로)/gi, '')
            .replace(/(\d+)\s*(?:세트|sets?|s)/gi, '')
            .replace(/(\d+)\s*(?:회|reps?|r)/gi, '')
            .replace(/(?:x|X|\*)\s*\d+/g, '')
            .replace(/[:\-,\/]/g, '')
            .trim();
        
        if (!exName) return;
        
        const matchedDB = exerciseDB.find(e => e.name.toLowerCase() === exName.toLowerCase() || e.name.includes(exName) || exName.includes(e.name));
        const finalName = matchedDB ? matchedDB.name : exName;
        
        if (!matchedDB && !exerciseDB.some(e => e.name === finalName)) {
            exerciseDB.push({ name: finalName, category: '가슴', type: getExerciseCategory(finalName) });
        }
        
        const sets = [];
        for (let s = 0; s < Math.min(Math.max(setsCount, 1), 10); s++) {
            sets.push({ weight: weight, reps: reps });
        }
        
        exercises.push({
            name: finalName,
            sets: sets
        });
    });
    
    if (exercises.length === 0) return null;
    if (!routineName) {
        const now = new Date();
        routineName = '붙여넣은 루틴 ' + (now.getMonth() + 1) + '/' + now.getDate();
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
    
    if (startNow) {
        startWorkout(routine.id);
    } else {
        alert(`✅ '${routine.name}' (${routine.exercises.length}개 종목)이 루틴 목록에 저장되었습니다!`);
        if (currentTab === 'workout') switchTab('workout');
    }
}
