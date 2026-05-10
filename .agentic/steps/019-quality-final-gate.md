# STEP 019. 최종 품질 게이트

## 목표

전체 구현이 최종 품질 기준을 만족하는지 검증한다.

## 읽기 파일

- package.json
- .agentic/docs/evaluation.md
- .agentic/docs/quality-gates.md

## 수정 가능 파일

- 필요한 경우 테스트 또는 작은 버그 수정 파일

## 구현 조건

- 새 기능을 추가하지 않는다.
- 실패한 품질 항목만 수정한다.

## 테스트 조건

- 전체 테스트가 통과한다.
- 타입 체크가 통과한다.
- 린트가 통과한다.
- 빌드가 성공한다.

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs full
```

## 완료 조건

- 최종 게이트 통과
