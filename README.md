# 🏋️ FitPulse (핏펄스)

간편하고 직관적인 스마트 운동 & 루틴 트래커 모바일/웹 애플리케이션입니다.

---

## 📖 개발 & 기여 가이드 (Git Workflow)

프로젝트의 안정적인 코드 관리를 위해 모든 작업은 **브랜치 기반 워크플로우**를 따릅니다.
자세한 내용은 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) 문서를 확인해주세요.

### 📌 빠른 요약:
1. `git checkout -b fix/<버그명>` 또는 `feature/<기능명>` 브랜치 생성
2. 코드 작업 및 테스트
3. 작업 브랜치에서 커밋 (`git commit -m "..."`)
4. `main` 브랜치로 전환 후 머지 (`git checkout main` -> `git merge <브랜치명>`)
