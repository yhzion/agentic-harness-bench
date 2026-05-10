# STEP 013. 상태 훅 또는 Store 구현

## 목표

도메인 함수와 저장소를 연결하는 상태 계층을 구현한다.

## 읽기 파일

- src/hooks/useTodos.ts 또는 src/store/todoStore.ts
- src/domain/*
- src/storage/*
- src/types/todo.ts

## 수정 가능 파일

- src/hooks/useTodos.ts
- src/hooks/useTodos.test.ts
- src/store/todoStore.ts
- src/store/todoStore.test.ts

## 구현 조건

- todos 초기값은 loadTodos 결과다.
- filter 초기값은 all이다.
- visibleTodos는 filterTodos 결과다.
- add/toggle/update/remove action을 제공한다.
- todos 변경 후 saveTodos를 호출한다.

## 테스트 조건

- action 호출 시 상태가 갱신된다.
- 저장 함수가 호출된다.
- filter 변경 시 visibleTodos가 바뀐다.

## 검증 명령

```bash
npm test -- useTodos
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
