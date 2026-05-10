# STEP 009. removeTodo 구현

## 목표

대상 Todo를 배열에서 제거한다.

## 읽기 파일

- src/domain/removeTodo.ts
- src/domain/removeTodo.test.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/removeTodo.ts
- src/domain/removeTodo.test.ts

## 구현 조건

- 대상 id의 Todo만 제거한다.
- 기존 배열을 mutate하지 않는다.
- 없는 id면 기존 상태를 유지한다.

## 테스트 조건

- 대상 Todo가 제거된다.
- 다른 Todo는 유지된다.
- 기존 배열은 변경되지 않는다.

## 검증 명령

```bash
npm test -- removeTodo
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
