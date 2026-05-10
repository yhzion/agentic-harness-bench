# Current Step Runner Prompt

현재 STEP 하나만 처리하세요.

## 수행 순서

1. `.agentic/progress.json`에서 `currentStep`을 확인하세요.
2. `.agentic/steps/<currentStep>.md`를 읽으세요.
3. 해당 STEP에 명시된 파일만 읽고 수정하세요.
4. 테스트를 먼저 작성하거나 기존 테스트를 확인하세요.
5. 구현은 현재 STEP의 조건을 만족하는 최소 변경만 수행하세요.
6. 검증 명령을 실행하세요.
7. 통과하면 progress를 업데이트하세요.
8. 실패하면 같은 STEP에서 최대 3회 수정하세요.

## 금지

```txt
다음 STEP 미리 구현 금지
수정 가능 파일 밖 수정 금지
시그니처 변경 금지
스펙 외 기능 추가 금지
대규모 리팩터링 금지
```
