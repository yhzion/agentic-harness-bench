# STEP 017. TodoFilter 컴포넌트 구현

## 목표

전체/미완료/완료 필터 버튼을 제공한다.

## 읽기 파일

- src/components/TodoFilter.*
- src/components/TodoFilter.test.*
- src/types/todo.ts

## 수정 가능 파일

- src/components/TodoFilter.*
- src/components/TodoFilter.test.*

## 구현 조건

- all, active, completed 버튼을 렌더링한다.
- 현재 필터를 강조한다.
- 버튼 클릭 시 onChange를 호출한다.

## 테스트 조건

- 각 버튼 클릭 시 올바른 filter 값이 전달된다.

## 검증 명령

```bash
npm test -- TodoFilter
```

## 완료 조건

- 테스트 통과
- 접근 가능한 버튼 이름 존재
