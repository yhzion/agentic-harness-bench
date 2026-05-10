# STEP 011. Storage 직렬화 구현

## 목표

Todo 배열을 저장 가능한 문자열로 변환하고 복원한다.

## 읽기 파일

- src/storage/serializeTodos.ts
- src/storage/deserializeTodos.ts
- src/storage/*.test.ts
- src/types/todo.ts

## 수정 가능 파일

- src/storage/serializeTodos.ts
- src/storage/deserializeTodos.ts
- src/storage/serializeTodos.test.ts
- src/storage/deserializeTodos.test.ts

## 구현 조건

- JSON 문자열로 직렬화한다.
- 잘못된 JSON은 빈 배열을 반환한다.
- 배열이 아닌 값은 빈 배열을 반환한다.
- 잘못된 Todo 구조는 제외한다.

## 테스트 조건

- 정상 직렬화/역직렬화가 통과한다.
- 잘못된 값 처리 테스트가 통과한다.

## 검증 명령

```bash
npm test -- storage
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
