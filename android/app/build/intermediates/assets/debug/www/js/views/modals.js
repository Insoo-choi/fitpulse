// --- Modals, Exercise Picker, Routine Manager & Paste Parser ---

function openExerciseModal(isReplace) { 
    replaceTargetIndex = isReplace ? replaceTargetIndex : -1;
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.open = "true";
    }
    const searchInput = document.getElementById('exercise-search');
    if (searchInput) searchInput.value = '';
    renderExerciseList();
}

function openExerciseReplaceModal(idx) { 
    replaceTargetIndex = idx;
    openExerciseModal(true);
}

function closeExerciseModal() {
    isEditingForRoutine = false;
    replaceTargetIndex = -1;
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.dataset.open = "false";
        setTimeout(() => { modal.classList.add('hidden'); }, 200);
    }
}

function renderExerciseList() {
    const listEl = document.getElementById('exercise-list');
    if (!listEl) return;
    const searchInput = document.getElementById('exercise-search');
    const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
    let filtered = exerciseDB.filter(e => e.name.toLowerCase().includes(search));
    if (currentExerciseCategoryFilter !== 'all') {
        filtered = filtered.filter(e => e.category === currentExerciseCategoryFilter);
    }
    
    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-10 text-slate-500 text-xs">
                <p class="mb-2">검색 결과가 없습니다.</p>
                <button onclick="addCustomExercise()" class="text-brand-400 font-bold bg-brand-900/30 px-3 py-1.5 rounded-lg border border-brand-700/40 active:scale-95 transition-all">+ '${search || '새 운동'}' 직접 추가</button>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(e => `
        <div class="flex justify-between items-center bg-slate-800 hover:bg-slate-750 p-4 rounded-xl mb-2.5 active:scale-[0.99] transition-all shadow-sm cursor-pointer border border-slate-700/40" onclick="selectExercise('${e.name}')">
            <span class="font-bold text-white text-sm">${e.name}</span>
            <span class="text-[10px] bg-brand-900/50 text-brand-300 border border-brand-700/50 px-2 py-1 rounded-md font-bold">${getOverloadTypeLabel(e.type || 'isolation')}</span>
        </div>
    `).join('');
}

function selectExercise(name) {
    const dbEx = exerciseDB.find(e => e.name === name);
    if (!dbEx) return;

    if (isEditingForRoutine && editingRoutine) {
        const defaultSets = [
            { id: generateUid('set'), weight: '20', reps: '10' },
            { id: generateUid('set'), weight: '20', reps: '10' },
            { id: generateUid('set'), weight: '20', reps: '10' }
        ];
        editingRoutine.exercises.push({
            id: generateUid('ex'),
            name: dbEx.name,
            sets: defaultSets
        });
        isEditingForRoutine = false;
        closeExerciseModal();
        renderRoutineEditExercises();
        return;
    }

    const newEx = {
        id: generateUid('ex'),
        name: dbEx.name,
        sets: [{ id: generateUid('set'), weight: '0', reps: '0', completed: false }],
        weightType: dbEx.defaultWeightType || 'total',
        overloadType: dbEx.type
    };

    if (state.activeWorkout) {
        if (replaceTargetIndex > -1 && state.activeWorkout.exercises[replaceTargetIndex]) {
            const oldSets = state.activeWorkout.exercises[replaceTargetIndex].sets;
            if(oldSets && oldSets.length > 0) {
                newEx.sets = JSON.parse(JSON.stringify(oldSets));
                newEx.sets.forEach(s => {
                    s.id = generateUid('set');
                    s.completed = false;
                });
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
    const searchInput = document.getElementById('exercise-search');
    if (input) input.value = (searchInput && searchInput.value) ? searchInput.value.trim() : '';
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

// --- Routine CRUD Logic (ID-based, Solid & Intuitive) ---
function createNewRoutine() {
    editingRoutineId = null;
    editingRoutine = {
        id: generateUid('routine'),
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
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.open = "true";
    }
    lucide.createIcons();
}

function openRoutineEditModal(id) {
    if (!id && state.routines && state.routines.length > 0) {
        id = state.routines[0].id;
    }
    if (!id) {
        createNewRoutine();
        return;
    }
    
    editingRoutineId = id;
    const r = (state.routines || []).find(x => x && (x.id === id || String(x.id) === String(id)));
    if (!r) {
        console.warn('Routine not found for id:', id);
        alert('해당 루틴을 찾을 수 없습니다.');
        return;
    }
    editingRoutine = JSON.parse(JSON.stringify(r));
    if (!editingRoutine.id) editingRoutine.id = id;
    if (!Array.isArray(editingRoutine.exercises)) editingRoutine.exercises = [];
    
    editingRoutine.exercises.forEach(ex => {
        if (!ex.id) ex.id = generateUid('ex');
        if (!Array.isArray(ex.sets)) ex.sets = [];
        ex.sets.forEach(s => {
            if (!s.id) s.id = generateUid('set');
        });
    });

    const titleEl = document.getElementById('routine-modal-title');
    if (titleEl) titleEl.innerText = '루틴 상세 및 수정';
    const nameInput = document.getElementById('edit-routine-name');
    if (nameInput) nameInput.value = editingRoutine.name || '';
    const delBtn = document.getElementById('btn-delete-routine');
    if (delBtn) delBtn.classList.remove('hidden');
    
    // Close manage modal if open to prevent z-index layering conflicts
    closeModal('routine-manage-modal');
    
    renderRoutineEditExercises();
    const modal = document.getElementById('routine-edit-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.dataset.open = "true";
    }
    lucide.createIcons();
}

function closeRoutineEditModal() {
    editingRoutineId = null;
    editingRoutine = null;
    isEditingForRoutine = false;
    closeModal('routine-edit-modal');
    if (typeof renderRoutineManageList === 'function') renderRoutineManageList();
    if (typeof updateUI === 'function') updateUI();
}

function renderRoutineEditExercises() {
    const container = document.getElementById('routine-edit-exercises');
    if (!container || !editingRoutine) return;
    
    if (!editingRoutine.exercises || editingRoutine.exercises.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-slate-500">
                <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <i data-lucide="plus-circle" class="w-6 h-6"></i>
                </div>
                <p class="font-bold text-sm text-slate-400 mb-1">등록된 운동이 없습니다.</p>
                <p class="text-xs text-slate-500">하단의 '+ 종목 추가하기'를 눌러 루틴을 구성해보세요.</p>
            </div>
        `;
        lucide.createIcons({ root: container });
        return;
    }
    
    container.innerHTML = editingRoutine.exercises.map((ex, exIdx) => {
        let setsHtml = (ex.sets || []).map((s, sIdx) => `
            <div class="flex items-center gap-2 mb-2">
                <span class="w-6 text-slate-500 font-bold text-xs text-center">${sIdx + 1}</span>
                <div class="flex-1 flex items-center bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700/50">
                    <input type="number" step="0.5" value="${s.weight || 0}" class="w-full bg-transparent text-center text-white font-bold text-sm outline-none" oninput="updateRoutineSetValById('${ex.id}', '${s.id}', 'weight', this.value)">
                    <span class="text-[10px] text-slate-500 font-bold ml-1">kg</span>
                </div>
                <div class="flex-1 flex items-center bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700/50">
                    <input type="number" value="${s.reps || 0}" class="w-full bg-transparent text-center text-white font-bold text-sm outline-none" oninput="updateRoutineSetValById('${ex.id}', '${s.id}', 'reps', this.value)">
                    <span class="text-[10px] text-slate-500 font-bold ml-1">회</span>
                </div>
                <button onclick="removeRoutineSetById('${ex.id}', '${s.id}')" class="text-slate-500 hover:text-rose-400 p-1.5 active:scale-95 transition-all" title="세트 삭제">
                    <i data-lucide="minus-circle" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
        
        return `
            <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 shadow-sm" data-ex-id="${ex.id}">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-black text-white text-base truncate pr-2">${ex.name}</h4>
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="moveRoutineExerciseById('${ex.id}', -1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700/80 rounded-lg active:scale-95 transition-all" ${exIdx === 0 ? 'disabled style="opacity:0.3"' : ''} title="위로 이동"><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
                        <button onclick="moveRoutineExerciseById('${ex.id}', 1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700/80 rounded-lg active:scale-95 transition-all" ${exIdx === editingRoutine.exercises.length - 1 ? 'disabled style="opacity:0.3"' : ''} title="아래로 이동"><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
                        <button onclick="removeRoutineExerciseById('${ex.id}')" class="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/30 rounded-lg ml-1 active:scale-95 transition-all" title="운동 삭제"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div class="bg-slate-900/60 p-3 rounded-xl">
                    ${setsHtml}
                    <button onclick="addRoutineSetById('${ex.id}')" class="w-full mt-1 py-1.5 border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg active:bg-slate-800 transition-all">+ 세트 추가</button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons({ root: container });
}

function updateRoutineSetValById(exId, setId, field, val) {
    if (!editingRoutine || !editingRoutine.exercises) return;
    const ex = editingRoutine.exercises.find(e => e.id === exId);
    if (!ex || !ex.sets) return;
    const set = ex.sets.find(s => s.id === setId);
    if (set) {
        set[field] = val.toString();
    }
}

function addRoutineSetById(exId) {
    if (!editingRoutine || !editingRoutine.exercises) return;
    const ex = editingRoutine.exercises.find(e => e.id === exId);
    if (!ex) return;
    const last = ex.sets[ex.sets.length - 1] || { weight: '20', reps: '10' };
    ex.sets.push({ id: generateUid('set'), weight: last.weight || '20', reps: last.reps || '10' });
    renderRoutineEditExercises();
}

function removeRoutineSetById(exId, setId) {
    if (!editingRoutine || !editingRoutine.exercises) return;
    const ex = editingRoutine.exercises.find(e => e.id === exId);
    if (!ex || !ex.sets) return;
    if (ex.sets.length <= 1) {
        alert('최소 1개의 세트가 필요합니다. 운동을 삭제하려면 우측 상단의 휴지통 아이콘을 누르세요.');
        return;
    }
    ex.sets = ex.sets.filter(s => s.id !== setId);
    renderRoutineEditExercises();
}

function moveRoutineExerciseById(exId, dir) {
    if (!editingRoutine || !editingRoutine.exercises) return;
    const exIdx = editingRoutine.exercises.findIndex(e => e.id === exId);
    if (exIdx === -1) return;
    const targetIdx = exIdx + dir;
    if (targetIdx < 0 || targetIdx >= editingRoutine.exercises.length) return;
    const item = editingRoutine.exercises.splice(exIdx, 1)[0];
    editingRoutine.exercises.splice(targetIdx, 0, item);
    renderRoutineEditExercises();
}

function removeRoutineExerciseById(exId) {
    if (!editingRoutine || !editingRoutine.exercises) return;
    const ex = editingRoutine.exercises.find(e => e.id === exId);
    const exName = ex ? ex.name : '이 운동';
    if (!confirm(`'${exName}'을(를) 루틴에서 삭제하시겠습니까?`)) return;
    editingRoutine.exercises = editingRoutine.exercises.filter(e => e.id !== exId);
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
    const searchInput = document.getElementById('routine-search-input');
    if (searchInput) searchInput.value = '';
    renderRoutineManageList();
    const modal = document.getElementById('routine-manage-modal');
    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
}

function filterRoutineManageList() {
    renderRoutineManageList();
}

function renderRoutineManageList() {
    const listEl = document.getElementById('routine-manage-list');
    if (!listEl) return;
    
    const searchInput = document.getElementById('routine-search-input');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    
    let routines = state.routines || [];
    if (query) {
        routines = routines.filter(r => {
            const matchName = (r.name || '').toLowerCase().includes(query);
            const matchEx = (r.exercises || []).some(e => (e.name || '').toLowerCase().includes(query));
            return matchName || matchEx;
        });
    }

    if (routines.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-16 text-slate-500">
                <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <i data-lucide="dumbbell" class="w-6 h-6"></i>
                </div>
                <p class="font-bold text-sm text-slate-400 mb-1">${query ? '검색 결과가 없습니다.' : '등록된 루틴이 없습니다.'}</p>
                <p class="text-xs text-slate-500 mb-4">${query ? '다른 키워드로 검색하거나 새 루틴을 생성하세요.' : '새 루틴을 생성하거나 텍스트를 붙여넣어 시작하세요.'}</p>
                <div class="flex justify-center gap-2">
                    <button onclick="createNewRoutineFromManage()" class="text-xs bg-brand-600 text-white font-bold px-4 py-2 rounded-xl active:scale-95 transition-all">+ 새 루틴</button>
                    <button onclick="openRoutinePasteFromManage()" class="text-xs bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl active:scale-95 transition-all">붙여넣기</button>
                </div>
            </div>
        `;
        lucide.createIcons({ root: listEl });
        return;
    }
    
    listEl.innerHTML = routines.map((r, rIdx) => {
        const totalSets = (r.exercises || []).reduce((sum, e) => sum + (e.sets ? e.sets.length : 0), 0);
        const muscleTags = typeof getWorkoutMuscleTags === 'function' ? getWorkoutMuscleTags(r) : [];
        const tagsHtml = muscleTags.map(t => `<span class="text-[10px] bg-brand-950/80 text-brand-300 border border-brand-700/40 px-1.5 py-0.2 rounded font-black">${t}</span>`).join(' ');

        return `
        <div class="bg-slate-800/80 hover:bg-slate-800 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-3 shadow-md transition-all">
            <!-- Header & Details (Clicking opens Edit/Detail modal) -->
            <div class="cursor-pointer active:opacity-80 transition-opacity" data-routine-id="${r.id}" onclick="openRoutineEditModal(this.dataset.routineId)">
                <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2 min-w-0 pr-2">
                        <h4 class="font-black text-white text-base truncate">${r.name}</h4>
                        ${tagsHtml}
                        <span class="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700 shrink-0">${r.exercises.length}종목 · ${totalSets}세트</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-1.5 mt-2">
                    ${(r.exercises || []).slice(0, 6).map(e => `
                        <span class="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50 truncate max-w-[150px]">${e.name}</span>
                    `).join('')}
                    ${r.exercises.length > 6 ? `<span class="text-[10px] text-slate-500 self-center font-bold">+${r.exercises.length - 6}</span>` : ''}
                </div>
            </div>

            <!-- Action Buttons Bar -->
            <div class="flex items-center justify-between pt-2.5 border-t border-slate-700/50 mt-1">
                <button type="button" data-routine-id="${r.id}" onclick="startRoutineFromManage(this.dataset.routineId)" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
                    <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i> 운동 시작
                </button>
                <div class="flex items-center gap-1.5">
                    <button type="button" data-routine-id="${r.id}" onclick="moveRoutine(this.dataset.routineId, -1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700/70 hover:bg-slate-700 rounded-lg active:scale-95 transition-all" ${rIdx === 0 ? 'disabled style="opacity:0.3"' : ''} title="순서 위로"><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
                    <button type="button" data-routine-id="${r.id}" onclick="moveRoutine(this.dataset.routineId, 1)" class="p-1.5 text-slate-400 hover:text-white bg-slate-700/70 hover:bg-slate-700 rounded-lg active:scale-95 transition-all" ${rIdx === state.routines.length - 1 ? 'disabled style="opacity:0.3"' : ''} title="순서 아래로"><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
                    <button type="button" data-routine-id="${r.id}" onclick="duplicateRoutine(this.dataset.routineId)" class="p-1.5 text-brand-300 hover:text-white bg-brand-950/40 border border-brand-800/30 rounded-lg active:scale-95 transition-all" title="루틴 복제"><i data-lucide="copy" class="w-4 h-4"></i></button>
                    <button type="button" data-routine-id="${r.id}" onclick="openRoutineEditModal(this.dataset.routineId)" class="px-3 py-1.5 text-brand-300 hover:text-white bg-brand-950/70 hover:bg-brand-900/80 border border-brand-700/60 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm" title="루틴 수정">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5 text-brand-400"></i>
                        <span>수정</span>
                    </button>
                    <button type="button" data-routine-id="${r.id}" onclick="deleteRoutineDirectly(this.dataset.routineId)" class="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/30 rounded-lg active:scale-95 transition-all ml-0.5" title="루틴 삭제">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    lucide.createIcons({ root: listEl });
}

function moveRoutine(id, dir) {
    const idx = state.routines.findIndex(r => r.id === id);
    if (idx === -1) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= state.routines.length) return;
    const item = state.routines.splice(idx, 1)[0];
    state.routines.splice(targetIdx, 0, item);
    saveData();
    renderRoutineManageList();
    if (currentTab === 'workout') switchTab('workout');
}

function duplicateRoutine(id) {
    const orig = state.routines.find(r => r.id === id);
    if (!orig) return;
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.id = generateUid('routine');
    cloned.name = `${orig.name} (복사본)`;
    (cloned.exercises || []).forEach(ex => {
        ex.id = generateUid('ex');
        (ex.sets || []).forEach(s => {
            s.id = generateUid('set');
        });
    });
    const origIdx = state.routines.findIndex(r => r.id === id);
    state.routines.splice(origIdx + 1, 0, cloned);
    saveData();
    renderRoutineManageList();
    if (currentTab === 'workout') switchTab('workout');
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
    closeRoutineEditModal();
    renderRoutineManageList();
    if (currentTab === 'workout') {
        switchTab('workout');
    }
}

function saveRoutineEdit() {
    const nameInput = document.getElementById('edit-routine-name');
    let name = (nameInput ? nameInput.value : '').trim();
    if (!name) {
        if (editingRoutine && editingRoutine.name) {
            name = editingRoutine.name.trim();
        }
    }
    if (!name) {
        alert('루틴 이름을 입력해주세요.');
        return;
    }
    if (!editingRoutine.exercises || editingRoutine.exercises.length === 0) {
        alert('최소 1개 이상의 운동을 추가해주세요.');
        return;
    }
    
    editingRoutine.name = name;
    
    // Ensure all exercises and sets have clean values and IDs
    editingRoutine.exercises.forEach(ex => {
        if (!ex.id) ex.id = generateUid('ex');
        (ex.sets || []).forEach(s => {
            if (!s.id) s.id = generateUid('set');
            const w = parseFloat(s.weight);
            const r = parseInt(s.reps);
            s.weight = isNaN(w) ? '0' : w.toString();
            s.reps = isNaN(r) ? '10' : r.toString();
        });
    });

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
    closeRoutineEditModal();
    renderRoutineManageList();
    
    if (currentTab === 'workout') {
        switchTab('workout');
    }
}

// --- Routine Paste Parser Logic (High accuracy Regex) ---
function openRoutinePasteModal() {
    const nameInput = document.getElementById('paste-routine-name');
    const textInput = document.getElementById('paste-routine-text');
    if (nameInput) nameInput.value = '';
    if (textInput) textInput.value = '';
    const modal = document.getElementById('routine-paste-modal');
    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
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
            sets.push({ id: generateUid('set'), weight: weight, reps: reps });
        }
        
        exercises.push({
            id: generateUid('ex'),
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
        id: generateUid('routine'),
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
            sets.push({ id: generateUid('set'), weight: weight, reps: reps });
        }
        
        exercises.push({
            id: generateUid('ex'),
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
        id: generateUid('routine'),
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
