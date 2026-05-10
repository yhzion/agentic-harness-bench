# STEP 007. toggleTodo 구현

## 목표

대상 Todo의 completed 값을 반전한다.

## 읽기 파일

- src/domain/toggleTodo.ts
- src/domain/toggleTodo.test.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/toggleTodo.ts
- src/domain/toggleTodo.test.ts

## 구현 조건

- 대상 Todo의 completed만 반전한다.
- 대상 Todo의 updatedAt을 갱신한다.
- 기존 배열을 mutate하지 않는다.
- 없는 id면 기존 상태를 유지한다.

## 테스트 조건

- completed가 반전된다.
- 다른 Todo는 유지된다.
- 기존 배열은 변경되지 않는다.
- 없는 id면 상태가 유지된다.

## 검증 명령

```bash
npm test -- toggleTodo
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
