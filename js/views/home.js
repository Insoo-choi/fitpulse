// --- Home View & Calendar ---

function renderHomeView() {
    return `
        <div class="px-4 py-6">
            <h2 class="text-2xl font-black text-white mb-6">안녕하세요!<br><span class="text-brand-400">오늘도 득근해볼까요?</span> 💪</h2>
            
            <div class="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/50 shadow-xl mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-200">이번 달 기록</h3>
                    <div class="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full" id="cal-month">2026. 08</div>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center mb-2">
                    <div class="text-[10px] font-bold text-rose-400">일</div>
                    <div class="text-[10px] font-bold text-slate-400">월</div>
                    <div class="text-[10px] font-bold text-slate-400">화</div>
                    <div class="text-[10px] font-bold text-slate-400">수</div>
                    <div class="text-[10px] font-bold text-slate-400">목</div>
                    <div class="text-[10px] font-bold text-slate-400">금</div>
                    <div class="text-[10px] font-bold text-brand-400">토</div>
                </div>
                <div id="calendar-grid" class="grid grid-cols-7 gap-1 text-center"></div>
                <div class="mt-4 flex gap-4 justify-center text-[10px] font-bold text-slate-400">
                    <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> 헬스</div>
                    <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-500"></div> 러닝</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="switchTab('workout')" class="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-5 text-left border border-brand-500/30 active:scale-95 transition-transform shadow-lg shadow-brand-500/20">
                    <div class="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <i data-lucide="play" class="text-white w-5 h-5 ml-1"></i>
                    </div>
                    <h3 class="text-white font-black text-lg">운동 시작</h3>
                    <p class="text-brand-200 text-xs mt-1 font-bold">루틴 또는 자율운동</p>
                </button>
                <button onclick="openRoutineManageModal()" class="bg-slate-800 rounded-3xl p-5 text-left border border-slate-700 active:scale-95 transition-transform">
                    <div class="bg-slate-700 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <i data-lucide="folder-kanban" class="text-slate-300 w-5 h-5"></i>
                    </div>
                    <h3 class="text-white font-black text-lg">루틴 관리</h3>
                    <p class="text-slate-400 text-xs mt-1 font-bold">생성 · 수정 · 붙여넣기</p>
                </button>
            </div>
        </div>
    `;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // 월간 누적 러닝 거리 계산
    const monthStr = `${year}-${(month+1).toString().padStart(2,'0')}`;
    const runRecords = state.history.filter(h => h.isRunning && h.date.startsWith(monthStr));
    const totalRunDist = runRecords.reduce((sum, h) => sum + (parseFloat(h.distance)||0), 0);
    
    const monthHeader = document.getElementById('cal-month');
    if (monthHeader) {
        monthHeader.innerHTML = `${year}. ${(month+1).toString().padStart(2,'0')} <span class="ml-2 text-blue-400">🏃 ${totalRunDist.toFixed(1)}km</span>`;
    }
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = '';
    for(let i=0; i<firstDay; i++) {
        html += `<div></div>`;
    }
    
    for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`;
        
        const workouts = state.history.filter(h => h.date.startsWith(dateStr));
        const gymWorkouts = workouts.filter(h => !h.isRunning);
        const hasGym = gymWorkouts.length > 0;
        const hasRun = workouts.some(h => h.isRunning);
        
        let tagsPreview = '';
        if (hasGym) {
            const firstGym = gymWorkouts[0];
            const tags = typeof getWorkoutMuscleTags === 'function' ? getWorkoutMuscleTags(firstGym) : [];
            if (tags.length > 0) {
                tagsPreview = `<div class="text-[8px] leading-tight text-emerald-400 font-black truncate max-w-full px-0.5 mt-0.5 z-10">${tags[0]}</div>`;
            }
        }
        
        let dotHtml = '';
        if(hasGym && hasRun) {
            dotHtml = `<div class="flex gap-0.5 mt-0.5 z-10"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></div><div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div></div>`;
        } else if(hasGym && !tagsPreview) {
            dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 z-10 shadow-sm"></div>`;
        } else if(hasRun) {
            dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5 z-10 shadow-sm"></div>`;
        }

        const isToday = (i === now.getDate());
        
        html += `
            <div class="min-h-[44px] flex flex-col items-center justify-center relative cursor-pointer active:scale-90 transition-transform py-1 rounded-xl hover:bg-slate-700/40" onclick="showDateInfo('${dateStr}')">
                <span class="text-xs font-bold ${isToday ? 'text-brand-300 font-black' : 'text-slate-400'} z-10">${i}</span>
                ${isToday ? `<div class="absolute inset-0.5 bg-slate-700/90 rounded-xl z-0 border border-brand-500/40 shadow-sm"></div>` : ''}
                ${tagsPreview || dotHtml}
            </div>
        `;
    }
    grid.innerHTML = html;
}

function showDateInfo(dateStr) {
    const workouts = state.history.filter(h => h.date.startsWith(dateStr));
    
    let wInfo = '';
    if(workouts.length > 0) {
        wInfo = workouts.map(w => {
            if(w.isRunning) {
                return `<div class="bg-blue-900/30 border border-blue-800/50 p-3 rounded-xl mb-2 flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                        <div class="font-bold text-blue-400 text-sm mb-1">🏃 러닝 (${w.duration}분)</div>
                        <div class="text-xs text-slate-300">거리: ${w.distance || 0}km | 페이스: ${w.pace || '-'}</div>
                    </div>
                    <button type="button" onclick="removeWorkoutRecord('${w.id}', '${dateStr}')" title="기록 삭제" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700/60 active:scale-90 transition-all shrink-0">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>`;
            } else {
                const exList = (w.exercises || []).map(e => e.name).join(', ');
                const tags = typeof getWorkoutMuscleTags === 'function' ? getWorkoutMuscleTags(w) : [];
                const tagsHtml = tags.map(t => `<span class="text-[10px] bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-black px-2 py-0.5 rounded-md">${t}</span>`).join(' ');
                
                return `<div class="bg-emerald-900/30 border border-emerald-800/50 p-3 rounded-xl mb-2">
                    <div class="flex items-center justify-between mb-1.5">
                        <div class="font-bold text-emerald-400 text-sm truncate mr-2">💪 ${w.name || '운동'} (${w.duration}분)</div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            ${tagsHtml}
                            <button type="button" onclick="removeWorkoutRecord('${w.id}', '${dateStr}')" title="기록 삭제" class="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700/60 active:scale-90 transition-all ml-1">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-slate-300">총 볼륨: ${w.totalVolume}kg | ${(w.exercises||[]).length}종목</div>
                    <div class="text-[10px] text-slate-500 mt-1 truncate">${exList}</div>
                </div>`;
            }
        }).join('');
    } else {
        wInfo = '<p class="text-slate-400 text-sm text-center my-4">기록된 운동이 없습니다.</p>';
    }

    const proteinData = typeof getDailyProteinData === 'function' ? getDailyProteinData(dateStr) : { total: 0, target: 126, percentage: 0, logs: [] };
    
    let proteinLogsHtml = '';
    if (proteinData.logs.length > 0) {
        proteinLogsHtml = `
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1.5 max-h-24 overflow-y-auto no-scrollbar">
                ${proteinData.logs.map(log => `
                    <div class="flex items-center justify-between text-[11px] bg-slate-900/60 px-2 py-1 rounded-lg">
                        <span class="text-slate-300 font-bold"><span class="text-amber-400 font-black">+${log.amount}g</span> ${log.note ? `<span class="text-slate-400 text-[10px]">(${log.note})</span>` : ''} <span class="text-slate-500 text-[9px] ml-1">${log.time}</span></span>
                        <button onclick="handleRemoveProtein('${dateStr}', '${log.id}')" class="text-slate-500 hover:text-rose-400 p-0.5"><i data-lucide="x" class="w-3 h-3"></i></button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const proteinCardHtml = `
        <div class="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 mb-3">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5 font-black text-xs text-amber-300">
                    <i data-lucide="beef" class="w-4 h-4 text-amber-400"></i> 단백질 섭취량
                </div>
                <div class="text-xs font-black text-white">
                    <span class="text-amber-400 text-sm">${proteinData.total}</span> <span class="text-[10px] text-slate-400 font-normal">/ ${proteinData.target}g (${proteinData.percentage}%)</span>
                </div>
            </div>
            
            <div class="h-2 bg-slate-900 rounded-full overflow-hidden mb-3 border border-slate-800">
                <div class="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500" style="width: ${proteinData.percentage}%"></div>
            </div>

            <!-- Quick Add Buttons -->
            <div class="grid grid-cols-5 gap-1.5 mb-2">
                <button onclick="handleQuickAddProtein('${dateStr}', 10)" class="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-[11px] rounded-lg border border-slate-700 transition-transform">
                    +10g
                </button>
                <button onclick="handleQuickAddProtein('${dateStr}', 20)" class="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-[11px] rounded-lg border border-slate-700 transition-transform">
                    +20g
                </button>
                <button onclick="handleQuickAddProtein('${dateStr}', 30)" class="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-[11px] rounded-lg border border-slate-700 transition-transform">
                    +30g
                </button>
                <button onclick="handleQuickAddProtein('${dateStr}', 40)" class="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-[11px] rounded-lg border border-slate-700 transition-transform">
                    +40g
                </button>
                <button onclick="handleQuickAddProtein('${dateStr}', 50)" class="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-[11px] rounded-lg border border-slate-700 transition-transform">
                    +50g
                </button>
            </div>

            <!-- Custom Input -->
            <div class="flex gap-1.5">
                <input type="number" id="custom-protein-input" placeholder="직접 입력 (g)" inputmode="numeric" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-amber-500">
                <button onclick="handleCustomAddProtein('${dateStr}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-lg whitespace-nowrap transition-transform shadow-sm">
                    추가
                </button>
            </div>

            ${proteinLogsHtml}
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'date-info-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in';
    modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl max-h-[85vh]">
            <div class="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
                <h3 class="font-black text-white text-lg">${dateStr} 기록</h3>
                <button onclick="document.getElementById('date-info-modal').remove()" class="text-slate-400 p-1"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="p-4 overflow-y-auto no-scrollbar flex-1 space-y-3">
                ${proteinCardHtml}
                <div>
                    <h4 class="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><i data-lucide="dumbbell" class="w-3.5 h-3.5 text-brand-400"></i> 완료된 운동</h4>
                    ${wInfo}
                </div>
            </div>
            
            <div class="p-4 bg-slate-800/50 border-t border-slate-800 shrink-0">
                <h4 class="text-xs font-bold text-blue-400 mb-2.5 flex items-center gap-1"><i data-lucide="activity" class="w-3.5 h-3.5"></i> 러닝 기록 추가</h4>
                <div class="flex gap-2 mb-2.5">
                    <input type="number" id="run-dist" placeholder="거리 (km)" step="0.1" inputmode="decimal" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition-colors">
                    <input type="number" id="run-time" placeholder="시간 (분)" inputmode="numeric" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition-colors">
                </div>
                <button onclick="saveRunningRecord('${dateStr}')" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl active:bg-blue-700 text-xs shadow-lg shadow-blue-500/20 transition-transform active:scale-95">기록 저장</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons({root: modal});
}

function handleQuickAddProtein(dateStr, amount, note) {
    if (typeof addProteinEntry === 'function') {
        addProteinEntry(dateStr, amount, note);
    }
    const oldModal = document.getElementById('date-info-modal');
    if (oldModal) oldModal.remove();
    showDateInfo(dateStr);
}

function handleCustomAddProtein(dateStr) {
    const input = document.getElementById('custom-protein-input');
    const val = parseFloat(input ? input.value : 0);
    if (!val || val <= 0) return;
    
    if (typeof addProteinEntry === 'function') {
        addProteinEntry(dateStr, val, '식사');
    }
    const oldModal = document.getElementById('date-info-modal');
    if (oldModal) oldModal.remove();
    showDateInfo(dateStr);
}

function handleRemoveProtein(dateStr, entryId) {
    if (typeof removeProteinEntry === 'function') {
        removeProteinEntry(dateStr, entryId);
    }
    const oldModal = document.getElementById('date-info-modal');
    if (oldModal) oldModal.remove();
    showDateInfo(dateStr);
}

function removeWorkoutRecord(workoutId, dateStr) {
    if (!workoutId) return;
    if (!confirm('정말로 이 운동 기록을 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)')) return;
    
    if (typeof deleteWorkoutHistory === 'function') {
        deleteWorkoutHistory(workoutId);
    }
    
    const oldModal = document.getElementById('date-info-modal');
    if (oldModal) oldModal.remove();
    
    renderCalendar();
    showDateInfo(dateStr);
}

function saveRunningRecord(dateStr) {
    const dist = parseFloat(document.getElementById('run-dist').value);
    const time = parseInt(document.getElementById('run-time').value);
    if(!dist || !time) return;
    
    const paceMin = Math.floor(time / dist);
    const paceSec = Math.round(((time / dist) - paceMin) * 60).toString().padStart(2, '0');
    
    state.history.push({
        id: Date.now().toString(),
        date: dateStr,
        isRunning: true,
        distance: dist,
        duration: time,
        pace: `${paceMin}'${paceSec}"`
    });
    saveData();
    const modal = document.getElementById('date-info-modal');
    if (modal) modal.remove();
    renderCalendar();
}
