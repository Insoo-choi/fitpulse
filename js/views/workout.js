// --- Workout Start & Active Workout Views ---

function renderWorkoutStartView() {
    let routinesHtml = state.routines.map((r) => `
        <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-3 flex items-center justify-between active:bg-slate-800 transition-colors">
            <div class="flex-1 min-w-0 pr-4 cursor-pointer" onclick="startWorkout('${r.id}')">
                <h4 class="font-bold text-white text-base truncate">${r.name}</h4>
                <p class="text-xs text-slate-400 mt-1 truncate">${r.exercises.map(e=>e.name).join(', ')}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="openRoutineEditModal('${r.id}')" class="p-2 text-slate-400 bg-slate-700/50 rounded-xl active:scale-95"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');

    return `
        <div class="px-4 py-6">
            <h2 class="text-2xl font-black text-white mb-6">운동 시작</h2>
            <button onclick="startWorkout()" class="w-full bg-brand-600 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mb-8">
                <i data-lucide="plus" class="w-6 h-6"></i> 자율 운동 (빈 화면)
            </button>
            
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-slate-300">내 루틴 목록</h3>
                <button onclick="createNewRoutine()" class="text-xs font-bold text-brand-400 bg-brand-900/30 px-3 py-1.5 rounded-full">+ 새 루틴</button>
            </div>
            <div>${routinesHtml}</div>
        </div>
    `;
}

function renderActiveWorkoutView() {
    return `
        <div class="flex flex-col h-full bg-slate-900">
            <div class="bg-slate-900 border-b border-slate-800 px-4 py-4 flex flex-col justify-between sticky top-[60px] z-30 shadow-sm">
                <div class="flex items-center justify-between mb-2 gap-2">
                    <div class="flex items-center min-w-0 flex-1">
                        <button onclick="promptAbortWorkout()" class="p-1 -ml-1 mr-2 text-slate-400 active:text-white shrink-0">
                            <i data-lucide="chevron-left" class="w-6 h-6"></i>
                        </button>
                        <h2 class="text-xl font-black text-white truncate pr-2 leading-tight">${state.activeWorkout ? state.activeWorkout.name : '운동'}</h2>
                    </div>
                    <div class="text-2xl font-black text-brand-400 tracking-widest leading-none shrink-0" id="workout-timer">00:00:00</div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500" id="workout-start-time"><i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>--:-- 시작</span>
                    <button onclick="finishWorkout()" class="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1 active:scale-95 transition-transform">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> 운동 완료
                    </button>
                </div>
            </div>
            
            <div class="flex-1 p-4 overflow-y-auto pb-40 relative" id="active-workout-exercises">
                <!-- Rendered by renderActiveWorkout() -->
            </div>
            
            <div class="fixed bottom-20 left-4 right-4 z-20">
                <button onclick="openExerciseModal(false)" class="w-full bg-slate-800/95 backdrop-blur-md border border-slate-700 text-brand-400 font-bold py-4 rounded-2xl active:bg-slate-700 shadow-xl flex items-center justify-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i> 종목 추가하기
                </button>
            </div>
        </div>
    `;
}

function renderActiveWorkout() {
    if (!state.activeWorkout) return;
    const container = document.getElementById('active-workout-exercises');
    if(!container) return;
    
    let html = '';
    
    state.activeWorkout.exercises.forEach((exercise, index) => {
        const isAllCompleted = exercise.sets.length > 0 && exercise.sets.every(s => s.completed);
        const category = exercise.overloadType || getExerciseCategory(exercise.name);
        const catLabel = getOverloadTypeLabel(category);
        const wType = exercise.weightType || 'total';
        const wLabel = wType === 'single' ? '한손' : wType === 'machine' ? '머신' : '전체';
        
        let setsHtml = exercise.sets.map((set, sIndex) => `
            <div class="flex items-center gap-2 mb-2 group">
                <div class="w-6 text-center text-xs font-bold text-slate-500">${sIndex + 1}</div>
                <div class="flex-1 flex gap-2 cursor-pointer" onclick="openSetEditModal(${index}, ${sIndex})">
                    <div class="flex-1 bg-slate-900/50 rounded-xl py-2 px-3 text-center border border-slate-700/50 relative">
                        <span class="font-black text-lg ${set.completed ? 'text-slate-400' : 'text-white'}">${set.weight}</span>
                        <span class="text-[10px] text-slate-500 font-bold ml-0.5">kg</span>
                    </div>
                    <div class="flex-1 bg-slate-900/50 rounded-xl py-2 px-3 text-center border border-slate-700/50">
                        <span class="font-black text-lg ${set.completed ? 'text-slate-400' : 'text-white'}">${set.reps}</span>
                        <span class="text-[10px] text-slate-500 font-bold ml-0.5">회</span>
                    </div>
                </div>
                <button onclick="toggleSetComplete(${index}, ${sIndex})" class="w-12 h-[42px] rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'} active:scale-90">
                    <i data-lucide="check" class="w-6 h-6 ${set.completed ? 'opacity-100' : 'opacity-30'}"></i>
                </button>
            </div>
        `).join('');

        html += `
        <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-4 transition-all ex-card ${isAllCompleted ? 'opacity-70' : 'shadow-lg shadow-black/20'}" data-index="${index}">
            <div class="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <div class="drag-handle-workout p-2 -ml-2 text-slate-500 cursor-grab active:cursor-grabbing">
                        <i data-lucide="grip-horizontal" class="w-5 h-5"></i>
                    </div>
                    <div class="flex flex-col min-w-0 flex-1">
                        <h3 class="font-black text-white text-lg truncate active:scale-95 transition-transform cursor-pointer" onclick="openExerciseReplaceModal(${index})">
                            ${exercise.name} <i data-lucide="refresh-cw" class="w-3 h-3 inline-block text-slate-500 ml-1"></i>
                        </h3>
                        <div class="flex items-center gap-1 shrink-0 mt-1">
                            <button onclick="toggleWeightType(${index})" class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 whitespace-nowrap active:scale-95">
                                ${wLabel}
                            </button>
                            <button onclick="toggleOverloadType(${index})" class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-900/50 text-brand-300 border border-brand-700/50 whitespace-nowrap active:scale-95">
                                ${catLabel}
                            </button>
                        </div>
                        ${exercise.aiMessage ? `<div class="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded-md mt-1.5 self-start">${exercise.aiMessage}</div>` : ''}
                    </div>
                </div>
                <div class="flex flex-col gap-1 shrink-0">
                    <button onclick="completeAllSets(${index})" class="text-[10px] font-bold bg-slate-700 text-emerald-400 px-2 py-1 rounded-md active:bg-slate-600">전체 완료</button>
                    <button onclick="removeExercise(${index})" class="text-[10px] font-bold text-slate-500 px-2 py-1 text-right active:text-rose-400">삭제</button>
                </div>
            </div>
            <div>
                ${setsHtml}
                <button onclick="addSet(${index})" class="w-full mt-2 py-2 border-2 border-dashed border-slate-700 text-slate-400 font-bold text-sm rounded-xl active:bg-slate-800 transition-colors">
                    + 세트 추가
                </button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
    lucide.createIcons();
    bindDragEvents();
}

function updateUI() {
    if (currentTab === 'workout_active') {
        renderActiveWorkout();
    }
}

function toggleWeightType(index) {
    const ex = state.activeWorkout.exercises[index];
    if (!ex.weightType || ex.weightType === 'total') ex.weightType = 'single';
    else if (ex.weightType === 'single') ex.weightType = 'machine';
    else ex.weightType = 'total';
    
    const dbEx = exerciseDB.find(e => e.name === ex.name);
    if (dbEx) dbEx.defaultWeightType = ex.weightType;

    saveActiveWorkout();
    updateUI();
}

function toggleOverloadType(index) {
    const ex = state.activeWorkout.exercises[index];
    const current = ex.overloadType || getExerciseCategory(ex.name);
    let nextType = 'large_compound';
    if (current === 'large_compound') nextType = 'upper_compound';
    else if (current === 'upper_compound') nextType = 'isolation';
    else if (current === 'isolation') nextType = 'large_compound';
    
    ex.overloadType = nextType;
    
    const dbEx = exerciseDB.find(e => e.name === ex.name);
    if (dbEx) dbEx.type = nextType;

    saveActiveWorkout();
    updateUI();
}

function toggleSetComplete(exIndex, setIndex) {
    const exercise = state.activeWorkout.exercises[exIndex];
    const set = exercise.sets[setIndex];
    set.completed = !set.completed;
    
    if (set.completed) {
        startRestTimer();
        if(navigator.vibrate) navigator.vibrate(50);
    }
    
    const isAllCompleted = exercise.sets.every(s => s.completed);
    saveActiveWorkout();
    updateUI();

    if (isAllCompleted && !exercise.rpeRated && state.activeWorkout.routineId) {
        setTimeout(() => openRpeModal(exIndex), 400);
    }
}

function completeAllSets(exIndex) {
    const exercise = state.activeWorkout.exercises[exIndex];
    exercise.sets.forEach(s => s.completed = true);
    saveActiveWorkout();
    updateUI();
    
    startRestTimer();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    if (!exercise.rpeRated && state.activeWorkout.routineId) {
        setTimeout(() => openRpeModal(exIndex), 400);
    }
}

function openRpeModal(exIndex) {
    currentRpeExerciseIndex = exIndex;
    const exercise = state.activeWorkout.exercises[exIndex];
    document.getElementById('rpe-exercise-name').innerText = exercise.name;
    document.getElementById('rpe-modal').classList.remove('hidden');
}

function submitRPE(score) {
    if (currentRpeExerciseIndex === -1) return;
    const exercise = state.activeWorkout.exercises[currentRpeExerciseIndex];
    exercise.rpeRated = true;

    if (state.activeWorkout.routineId) {
        const routine = state.routines.find(r => r.id === state.activeWorkout.routineId);
        if (routine) {
            const routineEx = routine.exercises.find(re => re.name === exercise.name);
            if (routineEx) {
                const category = exercise.overloadType || getExerciseCategory(exercise.name);
                const inc = parseFloat(state.minIncrement) || 2.5;
                let weightInc = 0;
                let repInc = 0;

                if (score === 1) { // Easy
                    if (category === 'large_compound') weightInc = inc * 2;
                    else if (category === 'upper_compound') weightInc = inc;
                    else { weightInc = inc; repInc = 2; }
                } else if (score === 2) { // Good
                    if (category === 'large_compound') weightInc = inc;
                    else if (category === 'upper_compound') weightInc = inc; 
                    else { weightInc = 0; repInc = 1; }
                } else if (score === 3) { // Hard
                    // keep volume
                }

                if (weightInc > 0 || repInc > 0) {
                    routineEx.sets.forEach(s => {
                        let w = parseFloat(s.weight || 0);
                        s.weight = (Math.round((w + weightInc)*10)/10).toString();
                        s.reps = (parseInt(s.reps || 0) + repInc).toString();
                    });
                    saveData();
                    exercise.aiMessage = `💡 AI 코칭: 다음번엔 ${weightInc>0 ? '+'+weightInc+'kg' : ''} ${repInc>0 ? '+'+repInc+'회' : ''} 추천`;
                } else if (score===3) {
                    exercise.aiMessage = `💡 AI 코칭: 현재 볼륨 완벽 적응 대기 중`;
                }
            }
        }
    }
    
    closeModal('rpe-modal');
    currentRpeExerciseIndex = -1;
    saveActiveWorkout();
    updateUI();
}

function openSetEditModal(exIndex, setIndex) {
    currentEditingSet = {exIndex, setIndex};
    const set = state.activeWorkout.exercises[exIndex].sets[setIndex];
    document.getElementById('edit-weight-input').value = set.weight;
    document.getElementById('edit-reps-input').value = set.reps;
    document.getElementById('set-edit-modal').classList.remove('hidden');
}

function adjustEditVal(field, val) {
    const input = document.getElementById(`edit-${field}-input`);
    let current = parseFloat(input.value) || 0;
    current += val;
    if(current < 0) current = 0;
    if(field === 'weight') current = (Math.round(current * 2) / 2).toString();
    else current = Math.round(current).toString();
    input.value = current;
}

function saveSetEdit() {
    if(!currentEditingSet) return;
    const w = document.getElementById('edit-weight-input').value;
    const r = document.getElementById('edit-reps-input').value;
    
    const set = state.activeWorkout.exercises[currentEditingSet.exIndex].sets[currentEditingSet.setIndex];
    set.weight = w;
    set.reps = r;
    
    closeModal('set-edit-modal');
    saveActiveWorkout();
    updateUI();
}

function removeExercise(i) {
    state.activeWorkout.exercises.splice(i, 1);
    saveActiveWorkout();
    updateUI();
}

function addSet(i) { 
    const ex = state.activeWorkout.exercises[i];
    const last = ex.sets[ex.sets.length - 1] || {weight:'0', reps:'0'};
    ex.sets.push({weight: last.weight, reps: last.reps, completed: false});
    saveActiveWorkout();
    updateUI();
}

function startWorkoutTimer() {
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    
    const startEl = document.getElementById('workout-start-time');
    const timerEl = document.getElementById('workout-timer');
    
    if(!state.activeWorkout.startTime) {
        state.activeWorkout.startTime = Date.now();
        saveActiveWorkout();
    }
    
    const date = new Date(state.activeWorkout.startTime);
    if (startEl) {
        startEl.innerHTML = `<i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')} 시작`;
    }
    
    workoutTimerInterval = setInterval(() => {
        if (!state.activeWorkout) return;
        const diff = Date.now() - state.activeWorkout.startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        if (timerEl) timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function startWorkout(rId) {
    let name = '자율 운동';
    let exercises = [];
    if(rId) {
        const r = state.routines.find(x => x.id === rId);
        if (r) {
            name = r.name;
            exercises = JSON.parse(JSON.stringify(r.exercises));
            exercises.forEach(e => { 
                e.sets.forEach(s => s.completed = false);
                const dbE = exerciseDB.find(db=>db.name===e.name);
                if(dbE) {
                    e.weightType = dbE.defaultWeightType || 'total';
                    e.overloadType = dbE.type;
                }
            });
        }
    }
    state.activeWorkout = {
        id: Date.now().toString(),
        routineId: rId,
        name: name,
        startTime: Date.now(),
        exercises: exercises
    };
    saveActiveWorkout();
    switchTab('workout_active');
}

function finishWorkout() {
    if(!state.activeWorkout) return;
    
    // Clean uncompleted sets
    state.activeWorkout.exercises.forEach(e => { e.sets = e.sets.filter(s => s.completed); });
    state.activeWorkout.exercises = state.activeWorkout.exercises.filter(e => e.sets.length > 0);
    
    if (state.activeWorkout.exercises.length === 0) {
        alert('완료된 운동 세트가 없습니다.');
        return;
    }

    // Check if routine has differences
    if (state.activeWorkout.routineId) {
        const origRoutine = state.routines.find(r => r.id === state.activeWorkout.routineId);
        if (origRoutine) {
            const diffs = detectRoutineDiff(origRoutine, state.activeWorkout);
            if (diffs.length > 0) {
                showRoutineDiffModal(diffs);
                return;
            }
        }
    }
    
    finalizeWorkout();
}

function detectRoutineDiff(orig, current) {
    const diffs = [];
    const origNames = orig.exercises.map(e => e.name);
    const currNames = current.exercises.map(e => e.name);
    
    currNames.forEach(name => {
        if (!origNames.includes(name)) {
            diffs.push(`➕ <span class="text-emerald-400 font-bold">${name}</span> 종목 추가됨`);
        }
    });
    
    origNames.forEach(name => {
        if (!currNames.includes(name)) {
            diffs.push(`➖ <span class="text-rose-400 font-bold">${name}</span> 종목 제외됨`);
        }
    });
    
    current.exercises.forEach(currEx => {
        const origEx = orig.exercises.find(e => e.name === currEx.name);
        if (origEx) {
            if (origEx.sets.length !== currEx.sets.length) {
                diffs.push(`🔄 ${currEx.name}: 세트 수 변경 (${origEx.sets.length}세트 → ${currEx.sets.length}세트)`);
            }
        }
    });
    
    return diffs;
}

function showRoutineDiffModal(diffs) {
    const container = document.getElementById('routine-diff-list');
    if (container) {
        container.innerHTML = diffs.map(d => `<div class="py-1 border-b border-slate-700/30 last:border-none">${d}</div>`).join('');
    }
    const modal = document.getElementById('routine-diff-modal');
    if (modal) modal.classList.remove('hidden');
}

function confirmRoutineDiff(updateOriginal) {
    if (updateOriginal && state.activeWorkout.routineId) {
        const origRoutine = state.routines.find(r => r.id === state.activeWorkout.routineId);
        if (origRoutine) {
            origRoutine.exercises = state.activeWorkout.exercises.map(e => ({
                name: e.name,
                sets: e.sets.map(s => ({ weight: s.weight, reps: s.reps }))
            }));
            saveData();
        }
    }
    closeModal('routine-diff-modal');
    finalizeWorkout();
}

function finalizeWorkout() {
    const diff = Date.now() - state.activeWorkout.startTime;
    const durationMin = Math.round(diff / 60000);
    
    let tVol = 0, tSets = 0, tReps = 0;
    state.activeWorkout.exercises.forEach(e => {
        const wt = e.weightType || 'total';
        let isBodyWt = e.name.includes('풀업') || e.name.includes('딥스') || e.name.includes('푸시업') || e.name.includes('턱걸이');
        
        e.sets.forEach(s => {
            let w = parseFloat(s.weight) || 0;
            if(wt === 'single') w *= 2;
            if(isBodyWt) w += parseFloat(state.bodyWeight || 70);
            
            let r = parseInt(s.reps) || 0;
            tVol += (w * r);
            tSets++;
            tReps += r;
        });
    });
    
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    
    const record = {
        id: state.activeWorkout.id,
        date: localISOTime,
        name: state.activeWorkout.name,
        duration: durationMin,
        totalVolume: Math.round(tVol),
        exercises: state.activeWorkout.exercises
    };
    
    state.history.push(record);
    state.workoutCount++;
    lastFinishedWorkout = record;
    saveData();
    
    // Calc stats based on dynamic MET & user bodyweight
    const userWeight = parseFloat(state.bodyWeight) || 70;
    const volPerMin = durationMin > 0 ? (tVol / durationMin) : 0;
    const dynamicMET = durationMin > 0 ? Math.min(Math.max(3.5, 3.5 + (volPerMin / 150) * 2.5), 8.0) : 4.0;
    const kcal = Math.round(dynamicMET * userWeight * (Math.max(durationMin, 1) / 60));
    const intensity = durationMin > 0 ? Math.round(tVol / durationMin) : 0;
    record.calories = kcal;
    saveData();
    
    // Draw Summary UI
    document.getElementById('sum-count').innerHTML = `${state.workoutCount}<span class="text-sm text-slate-400 font-normal">th</span>`;
    document.getElementById('sum-kcal').innerHTML = `${kcal}<span class="text-sm text-rose-500 font-bold ml-1">KCAL</span>`;
    document.getElementById('sum-duration').innerHTML = `${durationMin}<span class="text-sm text-slate-400 font-normal ml-1">분</span>`;
    document.getElementById('sum-volume').innerHTML = `${Math.round(tVol)}<span class="text-sm text-slate-400 font-normal ml-1">kg</span>`;
    document.getElementById('sum-ex').innerText = record.exercises.length;
    document.getElementById('sum-sets').innerHTML = `${tSets}<span class="text-sm text-slate-400 font-normal ml-1">세트</span>`;
    document.getElementById('sum-reps').innerHTML = `${tReps}<span class="text-sm text-slate-400 font-normal ml-1">회</span>`;
    document.getElementById('sum-intensity').innerHTML = `${intensity}<span class="text-sm text-slate-400 font-normal ml-1">kg/분</span>`;
    
    // Muscle activation bars
    const radarContainer = document.getElementById('muscle-activation-bars');
    const targetMap = {};
    record.exercises.forEach(e => {
        const cat = e.overloadType || getExerciseCategory(e.name);
        let label = getOverloadTypeLabel(cat);
        targetMap[label] = (targetMap[label] || 0) + e.sets.length;
    });
    
    let rHtml = '';
    let maxSet = Math.max(...Object.values(targetMap), 1);
    for(let [k,v] of Object.entries(targetMap)) {
        let pct = (v / maxSet) * 100;
        let colorClass = 'from-brand-600 to-brand-400';
        if(pct > 80) colorClass = 'from-rose-600 to-rose-400';
        else if (pct > 50) colorClass = 'from-emerald-600 to-emerald-400';
        
        rHtml += `
            <div>
                <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>${k}</span><span>${v} Sets</span>
                </div>
                <div class="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r ${colorClass} radar-bar glow-effect" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }
    if (radarContainer) {
        radarContainer.innerHTML = rHtml || '<div class="text-xs text-slate-500">데이터 없음</div>';
    }
    
    document.getElementById('summary-modal').classList.remove('hidden');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    
    // Clean up
    state.activeWorkout = null;
    saveData();
    clearInterval(workoutTimerInterval);
    skipRestTime();
}

function closeSummary() {
    document.getElementById('summary-modal').classList.add('hidden');
    switchTab('home');
}

function promptAbortWorkout() {
    document.getElementById('workout-action-modal').classList.remove('hidden');
}

function cancelWorkout() {
    state.activeWorkout = null;
    saveData();
    clearInterval(workoutTimerInterval);
    skipRestTime();
    closeModal('workout-action-modal');
    switchTab('workout');
}

function openChangeRoutineModal() {
    closeModal('workout-action-modal');
    const list = document.getElementById('change-routine-list');
    if (list) {
        list.innerHTML = state.routines.map(r => `
            <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between active:bg-slate-700 transition-colors" onclick="changeRoutine('${r.id}')">
                <div class="flex-1 min-w-0 pr-4 cursor-pointer">
                    <h4 class="font-bold text-white text-base truncate">${r.name}</h4>
                    <p class="text-xs text-slate-400 mt-1 truncate">${r.exercises.map(e=>e.name).join(', ')}</p>
                </div>
            </div>
        `).join('');
    }
    document.getElementById('change-routine-modal').classList.remove('hidden');
}

function changeRoutine(rId) {
    const r = state.routines.find(x => x.id === rId);
    if(!r) return;
    
    const exercises = JSON.parse(JSON.stringify(r.exercises));
    exercises.forEach(e => { 
        e.sets.forEach(s => s.completed = false);
        const dbE = exerciseDB.find(db=>db.name===e.name);
        if(dbE) {
            e.weightType = dbE.defaultWeightType || 'total';
            e.overloadType = dbE.type;
        }
    });
    
    state.activeWorkout.name = r.name;
    state.activeWorkout.routineId = rId;
    state.activeWorkout.exercises = exercises;
    
    saveActiveWorkout();
    updateUI();
    closeModal('change-routine-modal');
}
