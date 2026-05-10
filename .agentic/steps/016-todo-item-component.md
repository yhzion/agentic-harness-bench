# STEP 016. TodoItem 컴포넌트 구현

## 목표

개별 Todo를 표시하고 완료/삭제/수정 이벤트를 제공한다.

## 읽기 파일

- src/components/TodoItem.*
- src/components/TodoItem.test.*
- src/types/todo.ts

## 수정 가능 파일

- src/components/TodoItem.*
- src/components/TodoItem.test.*

## 구현 조건

- 체크박스를 렌더링한다.
- title을 렌더링한다.
- 삭제 버튼을 렌더링한다.
- completed 상태를 표시한다.
- 체크박스 클릭 시 onToggle을 호출한다.
- 삭제 버튼 클릭 시 onRemove를 호출한다.
- 수정 모드를 제공한다.

## 테스트 조건

- 렌더링, 토글, 삭제, 수정 저장/취소가 검증된다.

## 검증 명령

```bash
npm test -- TodoItem
```

## 완료 조건

- 테스트 통과
- 키보드 기본 조작 가능
