// --- Report View & Charts ---

function renderReportView() {
    return `
        <div class="px-4 py-6">
            <h2 class="text-2xl font-black text-white mb-4">성장 리포트</h2>
            
            <!-- Profile Settings -->
            <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-6 shadow-xl">
                <h3 class="text-sm font-bold text-brand-400 mb-4 flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> 체성분 및 증량 설정</h3>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label class="text-[10px] text-slate-400 font-bold ml-1">키 (cm)</label>
                        <input type="number" id="user-height" value="${state.height || 175}" onchange="saveProfileSettings()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-brand-500 transition-colors">
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 font-bold ml-1">몸무게 (kg)</label>
                        <input type="number" id="user-weight" value="${state.bodyWeight || 70}" onchange="saveProfileSettings()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-brand-500 transition-colors">
                    </div>
                </div>
                <div>
                    <label class="text-[10px] text-slate-400 font-bold ml-1">헬스장 최소 증량 단위 (kg) - AI 코치 기준</label>
                    <input type="number" id="user-min-inc" step="0.5" value="${state.minIncrement || 2.5}" onchange="saveProfileSettings()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-brand-500 transition-colors">
                </div>
            </div>

            <div class="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/50 shadow-xl mb-6">
                <select id="chart-type-selector" class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 outline-none focus:border-brand-500 font-bold mb-4 appearance-none" onchange="renderCharts()">
                    <option value="volume">📊 [전체] 날짜별 총 운동 볼륨 (kg)</option>
                    <option value="weight">⚖️ [체성분] 내 체중 변화 추이 (kg)</option>
                </select>
                <div class="relative h-64 w-full">
                    <canvas id="growthChart"></canvas>
                </div>
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
    
    if(chartType === 'volume') {
        const gymWorkouts = state.history.filter(h => !h.isRunning).slice(-14);
        labels = gymWorkouts.map(h => h.date.slice(5)); // MM-DD
        data = gymWorkouts.map(h => h.totalVolume);
        labelName = '총 볼륨 (kg)';
        borderColor = '#3b82f6';
        gradientColor = 'rgba(59, 130, 246, 0.2)';
    } else {
        const wHistory = (state.weightHistory || []).slice(-14);
        labels = wHistory.map(h => h.date.slice(5));
        data = wHistory.map(h => h.weight);
        labelName = '체중 (kg)';
        borderColor = '#10b981'; // emerald
        gradientColor = 'rgba(16, 185, 129, 0.2)';
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
    
    if (heightEl) state.height = parseFloat(heightEl.value) || state.height;
    const newWeight = weightEl ? (parseFloat(weightEl.value) || state.bodyWeight) : state.bodyWeight;
    state.bodyWeight = newWeight;
    if (incEl) state.minIncrement = parseFloat(incEl.value) || 2.5;
    
    const today = new Date().toISOString().slice(0, 10);
    const wIdx = state.weightHistory.findIndex(w => w.date === today);
    if(wIdx > -1) state.weightHistory[wIdx].weight = newWeight;
    else state.weightHistory.push({date: today, weight: newWeight});
    
    saveData();
    const selector = document.getElementById('chart-type-selector');
    if(selector && selector.value === 'weight') renderCharts();
}
