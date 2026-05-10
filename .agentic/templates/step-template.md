# STEP 000. STEP 제목

## 목표

이 STEP의 목표를 한 문장으로 작성한다.

## 선행 조건

- 이전에 완료되어 있어야 하는 조건을 작성한다.

## 읽기 파일

- path/to/file.ts

## 수정 가능 파일

- path/to/file.ts
- path/to/file.test.ts

## 수정 금지 파일

- path/to/forbidden/*

## 구현 조건

- 현재 STEP에서 구현할 조건만 작성한다.
- 미래 STEP의 기능은 작성하지 않는다.

## 테스트 조건

- 어떤 테스트가 무엇을 검증해야 하는지 작성한다.

## 검증 명령

```bash
npm test -- test-name
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
- 수정 가능 파일 외 변경 없음
- public API 변경 없음
