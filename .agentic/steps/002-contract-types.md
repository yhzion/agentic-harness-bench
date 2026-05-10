# STEP 002. 타입 계약 정의

## 목표

Todo 도메인 타입을 정의한다.

## 읽기 파일

- .agentic/docs/spec.md
- .agentic/contracts/interfaces.md

## 수정 가능 파일

- src/types/todo.ts
- src/types/index.ts
- src/types/todo.test.ts

## 구현 조건

- Todo 타입을 정의한다.
- TodoFilter 타입을 정의한다.
- TodoCreateInput 타입을 정의한다.
- TodoUpdateInput 타입을 정의한다.
- 컴포넌트나 저장소를 import하지 않는다.

## 테스트 조건

- 타입 레벨 또는 컴파일 테스트가 통과해야 한다.

## 검증 명령

```bash
npm run typecheck
```

## 완료 조건

- 타입 체크 통과
- public 타입 계약이 명확함
