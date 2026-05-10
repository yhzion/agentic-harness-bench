# STEP 015. TodoList 컴포넌트 구현

## 목표

Todo 배열을 목록으로 렌더링한다.

## 읽기 파일

- src/components/TodoList.*
- src/components/TodoList.test.*
- src/components/TodoItem.*

## 수정 가능 파일

- src/components/TodoList.*
- src/components/TodoList.test.*

## 구현 조건

- Todo 배열을 반복 렌더링한다.
- 빈 목록이면 빈 상태 메시지를 표시한다.
- 각 TodoItem에 필요한 props를 전달한다.

## 테스트 조건

- 목록 렌더링과 빈 상태가 검증된다.

## 검증 명령

```bash
npm test -- TodoList
```

## 완료 조건

- 테스트 통과
- key 또는 동등한 식별 처리 존재
