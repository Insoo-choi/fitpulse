import test from 'node:test';
import assert from 'node:assert/strict';

function calculateWorkoutStats(workout, userWeight = 70) {
    const durationMin = Math.round((workout.endTime - workout.startTime) / 60000) || 1;
    let tVol = 0, tSets = 0, tReps = 0;
    
    (workout.exercises || []).forEach(e => {
        const wt = e.weightType || 'total';
        const isBodyWt = e.name.includes('풀업') || e.name.includes('딥스') || e.name.includes('푸시업');
        (e.sets || []).forEach(s => {
            let w = parseFloat(s.weight) || 0;
            if (wt === 'single') w *= 2;
            if (isBodyWt) w += userWeight;
            const r = parseInt(s.reps) || 0;
            tVol += (w * r);
            tSets++;
            tReps += r;
        });
    });

    const volPerMin = durationMin > 0 ? (tVol / durationMin) : 0;
    const dynamicMET = durationMin > 0 ? Math.min(Math.max(3.5, 3.5 + (volPerMin / 150) * 2.5), 8.0) : 4.0;
    const kcal = Math.round(dynamicMET * userWeight * (durationMin / 60));
    const intensity = durationMin > 0 ? Math.round(tVol / durationMin) : 0;

    return {
        durationMin,
        totalVolume: Math.round(tVol),
        sets: tSets,
        reps: tReps,
        calories: kcal,
        intensity
    };
}

test('calculateWorkoutStats computes volume, sets, reps, and calories accurately', () => {
    const workout = {
        startTime: Date.now() - 3600000, // 60 mins ago
        endTime: Date.now(),
        exercises: [
            {
                name: '벤치프레스',
                sets: [
                    { weight: '80', reps: '10' }, // 800kg
                    { weight: '80', reps: '8' }   // 640kg
                ]
            },
            {
                name: '바벨 스쿼트',
                sets: [
                    { weight: '100', reps: '5' }, // 500kg
                    { weight: '100', reps: '5' }  // 500kg
                ]
            }
        ]
    };

    const stats = calculateWorkoutStats(workout, 70);
    assert.equal(stats.durationMin, 60);
    assert.equal(stats.totalVolume, 2440);
    assert.equal(stats.sets, 4);
    assert.equal(stats.reps, 28);
    assert.ok(stats.calories > 150);
});
