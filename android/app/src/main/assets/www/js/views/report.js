// --- Report View & Charts ---

function renderReportView() {
    return `
        <div class="px-4 py-6">
            <h2 class="text-2xl font-black text-white mb-4">성장 리포트</h2>

            <!-- Weekly Muscle Volume Landscape -->
            ${renderWeeklyVolumeLandscape()}

            <!-- Data Backup & Restore -->
            <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-6 shadow-xl">
                <h3 class="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <i data-lucide="database" class="w-4 h-4 text-brand-400"></i> 데이터 백업 및 복원
                </h3>
                <p class="text-xs text-slate-400 mb-4">루틴, 과거 운동 기록, 체중 히스토리를 JSON 파일로 저장하거나 새 기기로 불러옵니다.</p>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="exportFitPulseData()" class="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i> 백업 다운로드
                    </button>
                    <label class="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer shadow-sm text-center">
                        <i data-lucide="upload" class="w-3.5 h-3.5"></i> 백업 불러오기
                        <input type="file" id="backup-file-input" accept=".json" onchange="handleBackupFileSelect(event)" class="hidden">
                    </label>
                </div>
            </div>

            <div class="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/50 shadow-xl mb-6">
                <select id="chart-type-selector" class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 outline-none focus:border-brand-500 font-bold mb-4 appearance-none" onchange="renderCharts()">
                    <option value="volume">📊 [전체] 날짜별 총 운동 볼륨 (kg)</option>
                    <option value="weight">⚖️ [체성분] 내 체중 변화 추이 (kg)</option>
                    ${renderExerciseChartOptions()}
                </select>
                <div class="relative h-64 w-full">
                    <canvas id="growthChart"></canvas>
                </div>
            </div>
        </div>
    `;
}

function renderExerciseChartOptions() {
    const exercises = typeof getPerformedExerciseList === 'function' ? getPerformedExerciseList() : [];
    if (exercises.length === 0) return '';
    return `
        <optgroup label="🏋️ 종목별 1RM 성장 곡선">
            ${exercises.map(name => `<option value="ex:${name}">📈 ${name} (최고 1RM 추이)</option>`).join('')}
        </optgroup>
    `;
}

function renderWeeklyVolumeLandscape() {
    const volumes = typeof calculateWeeklyMuscleVolume === 'function' ? calculateWeeklyMuscleVolume() : [];
    
    return `
        <div class="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/50 shadow-xl mb-6">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-black text-white flex items-center gap-2">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-brand-400"></i> 주간 부위별 유효 세트 수
                </h3>
                <span class="text-[10px] text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700">최근 7일 기준</span>
            </div>
            <p class="text-[11px] text-slate-400 mb-4">💡 과학적 권장 볼륨: 부위당 주 10~20세트 (Jeff Nippard & RP 기준)</p>
            
            <div class="space-y-3">
                ${volumes.map(v => `
                    <div>
                        <div class="flex justify-between items-center text-xs font-bold mb-1">
                            <span class="text-slate-200">${v.category}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] px-1.5 py-0.5 rounded font-black border ${v.badgeColor}">${v.statusLabel}</span>
                                <span class="text-slate-300 font-black">${v.sets} <span class="text-[10px] text-slate-500 font-normal">/ 10~20세트</span></span>
                            </div>
                        </div>
                        <div class="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                            <div class="h-full bg-gradient-to-r ${v.barColor} transition-all duration-500" style="width: ${v.percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

let growthChartInstance = null;
function renderCharts() {
    const ctx = document.getElementById('growthChart');
    if(!ctx) return;
    
    if(growthChartInstance) growthChartInstance.destroy();
    
    const selector = document.getElementById('chart-type-selector');
    const chartType = selector ? selector.value : 'volume';
    let labels = [];
    let data = [];
    let labelName = '';
    let gradientColor = '';
    let borderColor = '';
    
    if (chartType === 'volume') {
        const gymWorkouts = state.history.filter(h => !h.isRunning).slice(-14);
        labels = gymWorkouts.map(h => h.date.slice(5)); // MM-DD
        data = gymWorkouts.map(h => h.totalVolume);
        labelName = '총 볼륨 (kg)';
        borderColor = '#3b82f6';
        gradientColor = 'rgba(59, 130, 246, 0.2)';
    } else if (chartType === 'weight') {
        const wHistory = (state.weightHistory || []).slice(-14);
        labels = wHistory.map(h => h.date.slice(5));
        data = wHistory.map(h => h.weight);
        labelName = '체중 (kg)';
        borderColor = '#10b981'; // emerald
        gradientColor = 'rgba(16, 185, 129, 0.2)';
    } else if (chartType.startsWith('ex:')) {
        const exName = chartType.slice(3);
        const timeSeries = typeof getExerciseHistoryTimeSeries === 'function' ? getExerciseHistoryTimeSeries(exName) : [];
        labels = timeSeries.map(h => h.date.slice(5));
        data = timeSeries.map(h => h.max1RM);
        labelName = `${exName} 최고 1RM (kg)`;
        borderColor = '#f59e0b'; // amber
        gradientColor = 'rgba(245, 158, 11, 0.2)';
    }
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, gradientColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelName,
                data: data,
                backgroundColor: gradient,
                borderColor: borderColor,
                borderWidth: 3,
                pointBackgroundColor: borderColor,
                pointBorderColor: '#0f172a',
                pointBorderWidth: 2,
                pointRadius: 5,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { 
                    beginAtZero: chartType === 'volume',
                    min: chartType === 'weight' && data.length > 0 ? Math.min(...data) - 2 : undefined,
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }, 
                    ticks: { color: '#94a3b8', font:{size: 10} } 
                },
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font:{size: 10} } }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

function saveProfileSettings() {
    const heightEl = document.getElementById('user-height');
    const weightEl = document.getElementById('user-weight');
    const incEl = document.getElementById('user-min-inc');
    
    if (heightEl) {
        const h = parseFloat(heightEl.value);
        if (!isNaN(h) && h >= 50 && h <= 250) state.height = h;
    }
    
    if (weightEl) {
        const w = parseFloat(weightEl.value);
        if (!isNaN(w) && w >= 20 && w <= 300) {
            state.bodyWeight = w;
            const today = typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10);
            if (!state.weightHistory) state.weightHistory = [];
            const wIdx = state.weightHistory.findIndex(entry => entry.date === today);
            if (wIdx > -1) state.weightHistory[wIdx].weight = w;
            else state.weightHistory.push({ date: today, weight: w });
        }
    }
    
    if (incEl) {
        const inc = parseFloat(incEl.value);
        if (!isNaN(inc) && inc >= 0.25 && inc <= 20) state.minIncrement = inc;
    }
    
    saveData();
    const selector = document.getElementById('chart-type-selector');
    if (selector && selector.value === 'weight') renderCharts();
}
