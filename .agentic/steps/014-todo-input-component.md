# STEP 014. TodoInput 컴포넌트 구현

## 목표

사용자가 title을 입력하고 할일 추가 이벤트를 발생시킬 수 있게 한다.

## 읽기 파일

- src/components/TodoInput.*
- src/components/TodoInput.test.*

## 수정 가능 파일

- src/components/TodoInput.*
- src/components/TodoInput.test.*

## 구현 조건

- 입력창을 렌더링한다.
- 추가 버튼을 렌더링한다.
- 입력 변경을 반영한다.
- 버튼 클릭 시 onAdd를 호출한다.
- Enter 입력 시 onAdd를 호출한다.
- 제출 후 입력값을 초기화한다.

## 테스트 조건

- 입력, 버튼 클릭, Enter 동작이 검증된다.

## 검증 명령

```bash
npm test -- TodoInput
```

## 완료 조건

- 테스트 통과
- 접근 가능한 label 또는 name 존재
