# 🌿 FitPulse Git 브랜치 & 작업 워크플로우 가이드

모든 기능 개발, 버그 수정, UI 개선 등의 작업을 진행할 때는 **반드시 전용 브랜치를 생성하여 작업한 후, 검증을 거쳐 `main` 브랜치에 머지(Merge)**합니다.

---

## 📌 1. 기본 브랜치 전략

- **`main`**: 언제든지 배포 가능한 안정적인 최신 상용/운영 브랜치
- **`feature/<기능명>`**: 새로운 기능 개발용 브랜치 (예: `feature/routine-timer`, `feature/plate-calculator`)
- **`fix/<버그명>`**: 버그 수정 및 에러 해결용 브랜치 (예: `fix/routine-edit-click`, `fix/backbutton-exit`)
- **`refactor/<개선명>`**: 성능 개선 및 코드 리팩토링용 브랜치 (예: `refactor/modal-structure`)

---

## 🚀 2. 표준 작업 절차 (Step-by-Step)

### Step 1. 최신 `main` 브랜치로 이동 및 동기화
새 작업을 시작하기 전에 항상 최신 코드를 가져옵니다.
```bash
git checkout main
git pull origin main
```

### Step 2. 작업용 새 브랜치 생성 및 전환
작업 목적에 맞는 이름으로 브랜치를 따서 이동합니다.
```bash
# 버그 수정 시
git checkout -b fix/routine-edit-and-backbutton

# 새 기능 개발 시
git checkout -b feature/backup-sync
```

### Step 3. 코드 작업 및 로컬 검증
- 해당 브랜치에서 필요한 소스 코드 수정 및 개발을 진행합니다.
- 변경된 파일 상태 확인:
```bash
git status
```

### Step 4. 변경 사항 커밋 (Commit)
의미 있는 단위로 명확한 커밋 메시지를 작성합니다.
```bash
git add .
git commit -m "fix: 루틴 수정 화면 진입 버그 및 안드로이드 뒤로가기 종료 오류 수정"
```

### Step 5. `main` 브랜치로 전환 및 머지 (Merge)
작업과 검증이 완료되면 `main` 브랜치에 머지합니다.
```bash
# main 브랜치로 이동
git checkout main

# 작업한 브랜치 머지
git merge fix/routine-edit-and-backbutton
```

### Step 6. 원격 저장소 푸시 및 작업 브랜치 정리 (선택)
```bash
# 원격 저장소에 반영
git push origin main

# 머지 완료된 로컬 작업 브랜치 삭제
git branch -d fix/routine-edit-and-backbutton
```

---

## 🤖 3. AI 어시스턴트(AI Agent) 작업 규칙

1. **작업 시작 전**:
   - 요청받은 작업의 유형(신규 기능 / 버그 수정 등)에 맞는 브랜치를 생성하고 전환한다.
   - `git checkout -b <prefix>/<task-name>`
2. **작업 진행 중**:
   - 생성한 작업 브랜치에서만 수정 작업을 진행한다.
3. **작업 완료 후**:
   - 변경 사항을 명확한 커밋 메시지로 커밋한다.
   - `main` 브랜치로 체크아웃한 뒤 머지(`git merge`)를 수행한다.
   - 머지 결과를 확인하고 사용자에게 최종 안내한다.
