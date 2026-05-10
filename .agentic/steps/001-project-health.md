# STEP 001. 프로젝트 상태 검증

## 목표

프로젝트가 에이전트 구현 루프를 실행할 수 있는 기본 상태인지 확인한다.

## 읽기 파일

- package.json
- tsconfig.json

## 수정 가능 파일

- package.json
- tsconfig.json

## 구현 조건

- 필요한 경우 test, typecheck, lint, build 스크립트 이름을 확인하거나 정리한다.
- 실제 프로젝트에 없는 명령은 `.agentic/scripts/run-gate.mjs`에서 제외한다.

## 테스트 조건

- 프로젝트 기본 명령이 실행 가능해야 한다.

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs smoke
```

## 완료 조건

- 기본 명령 확인 완료
- progress 업데이트 가능
