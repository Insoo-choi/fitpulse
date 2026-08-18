// --- Constants & Predefined Data ---
const DB_KEY = 'fitpulse_data_v2';
const EXERCISE_DB_KEY = 'fitpulse_exercises';

const defaultExercises = [
    // Chest
    { name: '플랫 바벨 벤치프레스', category: '가슴', type: 'upper_compound' },
    { name: '인클라인 바벨 벤치프레스', category: '가슴', type: 'upper_compound' },
    { name: '인클라인 덤벨 프레스', category: '가슴', type: 'upper_compound' },
    { name: '펙덱 플라이', category: '가슴', type: 'isolation' },
    { name: '시티드 케이블 플라이', category: '가슴', type: 'isolation' },
    { name: '푸시업', category: '가슴', type: 'upper_compound' },
    // Back
    { name: '데드리프트', category: '등', type: 'large_compound' },
    { name: '루마니안 데드리프트', category: '등', type: 'large_compound' },
    { name: '중량 풀업', category: '등', type: 'upper_compound' },
    { name: '턱걸이 (풀업)', category: '등', type: 'upper_compound' },
    { name: '바벨 로우', category: '등', type: 'upper_compound' },
    { name: '데피시트 펜레이 로우', category: '등', type: 'upper_compound' },
    { name: '클로즈 그립 랫 풀다운', category: '등', type: 'upper_compound' },
    { name: '체스트 서포티드 머신 로우', category: '등', type: 'upper_compound' },
    { name: '클로즈 그립 케이블 로우', category: '등', type: 'upper_compound' },
    // Legs
    { name: '바벨 스쿼트', category: '하체', type: 'large_compound' },
    { name: '펜듈럼 스쿼트', category: '하체', type: 'large_compound' },
    { name: '스미스머신 스쿼트', category: '하체', type: 'large_compound' },
    { name: '레그 프레스', category: '하체', type: 'large_compound' },
    { name: '라이잉 레그 컬', category: '하체', type: 'isolation' },
    { name: '시티드 레그 컬', category: '하체', type: 'isolation' },
    { name: '레그 익스텐션', category: '하체', type: 'isolation' },
    { name: '시티드 힙 압덕션', category: '하체', type: 'isolation' },
    { name: '스탠딩 카프 레이즈', category: '하체', type: 'isolation' },
    // Shoulders
    { name: '오버헤드 프레스', category: '어깨', type: 'upper_compound' },
    { name: '머신 숄더 프레스', category: '어깨', type: 'upper_compound' },
    { name: '사이드 레터럴 레이즈', category: '어깨', type: 'isolation' },
    { name: '하이 케이블 사이드 레터럴 레이즈', category: '어깨', type: 'isolation' },
    { name: '리버스 케이블 플라이', category: '어깨', type: 'isolation' },
    { name: '업인 슈러그', category: '어깨', type: 'isolation' },
    // Arms
    { name: '바벨 컬', category: '팔', type: 'isolation' },
    { name: 'EZ바 컬', category: '팔', type: 'isolation' },
    { name: '머신 프리처 컬', category: '팔', type: 'isolation' },
    { name: '베이비안 케이블 컬', category: '팔', type: 'isolation' },
    { name: '오버헤드 케이블 익스텐션', category: '팔', type: 'isolation' },
    { name: '케이블 킥백', category: '팔', type: 'isolation' },
    // Core
    { name: '행잉 레그 레이즈', category: '코어', type: 'isolation' },
    { name: '플랭크', category: '코어', type: 'isolation' },
    { name: '케이블 크런치', category: '코어', type: 'isolation' },
    { name: '앱 롤아웃', category: '코어', type: 'isolation' }
];

let exerciseDB = [];

const jeffRoutines = [
    {
        id: 'jeff_upper', name: '1. Upper (상체 전체)',
        exercises: [
            { name: '인클라인 바벨 벤치프레스', sets: [{weight:'60', reps:'8'},{weight:'60', reps:'8'},{weight:'60', reps:'8'}] },
            { name: '시티드 케이블 플라이', sets: [{weight:'15', reps:'12'},{weight:'15', reps:'12'},{weight:'15', reps:'12'}] },
            { name: '중량 풀업', sets: [{weight:'10', reps:'8'},{weight:'10', reps:'8'},{weight:'10', reps:'8'}] },
            { name: '하이 케이블 사이드 레터럴 레이즈', sets: [{weight:'10', reps:'15'},{weight:'10', reps:'15'},{weight:'10', reps:'15'}] },
            { name: '데피시트 펜레이 로우', sets: [{weight:'70', reps:'10'},{weight:'70', reps:'10'},{weight:'70', reps:'10'}] },
            { name: '오버헤드 케이블 삼두 익스텐션', sets: [{weight:'20', reps:'12'},{weight:'20', reps:'12'},{weight:'20', reps:'12'}] },
            { name: '베이비안 케이블 컬', sets: [{weight:'15', reps:'12'},{weight:'15', reps:'12'},{weight:'15', reps:'12'}] }
        ]
    },
    {
        id: 'jeff_lower1', name: '2. Lower 1 (하체/스쿼트)',
        exercises: [
            { name: '라이잉 레그 컬', sets: [{weight:'40', reps:'12'},{weight:'40', reps:'12'},{weight:'40', reps:'12'}] },
            { name: '펜듈럼 스쿼트', sets: [{weight:'60', reps:'8'},{weight:'60', reps:'8'},{weight:'60', reps:'8'}] },
            { name: '루마니안 데드리프트', sets: [{weight:'80', reps:'10'},{weight:'80', reps:'10'},{weight:'80', reps:'10'}] },
            { name: '레그 익스텐션', sets: [{weight:'50', reps:'12'},{weight:'50', reps:'12'},{weight:'50', reps:'12'}] },
            { name: '시티드 힙 압덕션', sets: [{weight:'45', reps:'15'},{weight:'45', reps:'15'},{weight:'45', reps:'15'}] },
            { name: '스탠딩 카프 레이즈', sets: [{weight:'60', reps:'15'},{weight:'60', reps:'15'},{weight:'60', reps:'15'}] }
        ]
    },
    {
        id: 'jeff_push', name: '3. Push (밀기)',
        exercises: [
            { name: '플랫 바벨 벤치프레스', sets: [{weight:'70', reps:'8'},{weight:'70', reps:'8'},{weight:'70', reps:'8'}] },
            { name: '머신 숄더 프레스', sets: [{weight:'50', reps:'10'},{weight:'50', reps:'10'},{weight:'50', reps:'10'}] },
            { name: '펙덱 플라이', sets: [{weight:'40', reps:'15'},{weight:'40', reps:'15'},{weight:'40', reps:'15'}] },
            { name: '하이 케이블 사이드 레터럴 레이즈', sets: [{weight:'10', reps:'15'},{weight:'10', reps:'15'},{weight:'10', reps:'15'},{weight:'10', reps:'15'}] },
            { name: '오버헤드 케이블 익스텐션', sets: [{weight:'25', reps:'12'},{weight:'25', reps:'12'},{weight:'25', reps:'12'}] }
        ]
    },
    {
        id: 'jeff_pull', name: '4. Pull (당기기)',
        exercises: [
            { name: '클로즈 그립 랫 풀다운', sets: [{weight:'55', reps:'10'},{weight:'55', reps:'10'},{weight:'55', reps:'10'}] },
            { name: '체스트 서포티드 머신 로우', sets: [{weight:'60', reps:'10'},{weight:'60', reps:'10'},{weight:'60', reps:'10'}] },
            { name: '클로즈 그립 케이블 로우', sets: [{weight:'50', reps:'12'},{weight:'50', reps:'12'},{weight:'50', reps:'12'}] },
            { name: '리버스 케이블 플라이', sets: [{weight:'10', reps:'15'},{weight:'10', reps:'15'},{weight:'10', reps:'15'}] },
            { name: '업인 슈러그', sets: [{weight:'60', reps:'12'},{weight:'60', reps:'12'},{weight:'60', reps:'12'}] },
            { name: 'EZ바 컬', sets: [{weight:'25', reps:'10'},{weight:'25', reps:'10'},{weight:'25', reps:'10'}] }
        ]
    },
    {
        id: 'jeff_legs2', name: '5. Legs 2 (하체/데드)',
        exercises: [
            { name: '시티드 레그 컬', sets: [{weight:'45', reps:'12'},{weight:'45', reps:'12'},{weight:'45', reps:'12'}] },
            { name: '스미스머신 스쿼트', sets: [{weight:'70', reps:'8'},{weight:'70', reps:'8'},{weight:'70', reps:'8'}] },
            { name: '루마니안 데드리프트', sets: [{weight:'90', reps:'8'},{weight:'90', reps:'8'},{weight:'90', reps:'8'}] },
            { name: '레그 익스텐션', sets: [{weight:'50', reps:'15'},{weight:'50', reps:'15'},{weight:'50', reps:'15'}] },
            { name: '스탠딩 카프 레이즈', sets: [{weight:'60', reps:'15'},{weight:'60', reps:'15'},{weight:'60', reps:'15'}] }
        ]
    }
];
