# STEP 012. LocalStorage load/save 구현

## 목표

Todo 목록을 LocalStorage에 저장하고 불러온다.

## 읽기 파일

- src/storage/loadTodos.ts
- src/storage/saveTodos.ts
- src/storage/clearTodosStorage.ts
- src/storage/*.test.ts

## 수정 가능 파일

- src/storage/loadTodos.ts
- src/storage/saveTodos.ts
- src/storage/clearTodosStorage.ts
- src/storage/loadTodos.test.ts
- src/storage/saveTodos.test.ts
- src/storage/clearTodosStorage.test.ts

## 구현 조건

- 저장값이 없으면 빈 배열을 반환한다.
- 저장값이 있으면 deserialize 결과를 반환한다.
- saveTodos는 serialize 결과를 저장한다.
- clearTodosStorage는 저장값을 제거한다.

## 테스트 조건

- load/save/clear 테스트가 통과한다.

## 검증 명령

```bash
npm test -- storage
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
