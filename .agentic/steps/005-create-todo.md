# STEP 005. createTodo 구현

## 목표

유효한 title로 Todo 객체를 생성한다.

## 읽기 파일

- src/domain/createTodo.ts
- src/domain/createTodo.test.ts
- src/domain/validateTodoTitle.ts
- src/types/todo.ts

## 수정 가능 파일

- src/domain/createTodo.ts
- src/domain/createTodo.test.ts

## 구현 조건

- title은 validateTodoTitle을 통해 정규화한다.
- id를 생성한다.
- completed 기본값은 false다.
- createdAt과 updatedAt을 설정한다.
- 유효하지 않은 title은 정해진 실패 방식으로 처리한다.

## 테스트 조건

- 정상 title로 Todo가 생성된다.
- completed가 false다.
- createdAt과 updatedAt이 존재한다.
- title이 trim되어 저장된다.

## 검증 명령

```bash
npm test -- createTodo
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
