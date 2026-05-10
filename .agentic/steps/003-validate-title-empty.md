# STEP 003. validateTodoTitle 빈 문자열 처리

## 목표

빈 문자열 title은 유효하지 않게 처리한다.

## 읽기 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 구현 조건

- 함수 시그니처를 변경하지 않는다.
- title이 빈 문자열이면 실패 결과를 반환한다.
- 예외를 던지지 않는다.
- 공백 문자열, 최대 길이 검사는 이 STEP에서 구현하지 않는다.

## 테스트 조건

- validateTodoTitle('')가 실패 결과를 반환해야 한다.

## 검증 명령

```bash
npm test -- validateTodoTitle
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
