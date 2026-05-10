# STEP 006. addTodo 구현

## 목표

기존 Todo 배열에 새 Todo를 불변 방식으로 추가한다.

## 읽기 파일

- src/domain/addTodo.ts
- src/domain/addTodo.test.ts
- src/domain/createTodo.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/addTodo.ts
- src/domain/addTodo.test.ts

## 구현 조건

- 기존 배열을 mutate하지 않는다.
- 새 배열을 반환한다.
- 정상 title이면 Todo를 추가한다.
- 유효하지 않은 title이면 스펙에 정의된 방식으로 처리한다.

## 테스트 조건

- Todo가 추가된다.
- 기존 배열이 변경되지 않는다.
- 새 배열이 반환된다.

## 검증 명령

```bash
npm test -- addTodo
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
