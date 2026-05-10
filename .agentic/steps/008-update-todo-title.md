# STEP 008. updateTodoTitle 구현

## 목표

대상 Todo의 title을 수정한다.

## 읽기 파일

- src/domain/updateTodoTitle.ts
- src/domain/updateTodoTitle.test.ts
- src/domain/validateTodoTitle.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/updateTodoTitle.ts
- src/domain/updateTodoTitle.test.ts

## 구현 조건

- title은 validateTodoTitle을 통해 검증한다.
- 대상 Todo의 title과 updatedAt만 변경한다.
- 기존 배열을 mutate하지 않는다.
- 없는 id면 기존 상태를 유지한다.

## 테스트 조건

- title이 변경된다.
- title이 trim된다.
- updatedAt이 갱신된다.
- 다른 Todo는 유지된다.
- 없는 id면 상태가 유지된다.

## 검증 명령

```bash
npm test -- updateTodoTitle
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
