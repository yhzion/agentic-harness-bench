# STEP 010. filterTodos 구현

## 목표

Todo 목록을 필터 기준에 따라 반환한다.

## 읽기 파일

- src/domain/filterTodos.ts
- src/domain/filterTodos.test.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/filterTodos.ts
- src/domain/filterTodos.test.ts

## 구현 조건

- all은 전체 목록을 반환한다.
- active는 completed false만 반환한다.
- completed는 completed true만 반환한다.
- 기존 배열을 mutate하지 않는다.

## 테스트 조건

- all, active, completed 필터가 각각 동작한다.

## 검증 명령

```bash
npm test -- filterTodos
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
