# STEP 018. App 통합

## 목표

상태 계층과 컴포넌트를 연결해 사용자 시나리오가 동작하도록 한다.

## 읽기 파일

- src/App.*
- src/components/*
- src/hooks/* 또는 src/store/*

## 수정 가능 파일

- src/App.*
- src/App.test.*

## 구현 조건

- TodoInput을 연결한다.
- TodoFilter를 연결한다.
- TodoList를 연결한다.
- 에러 메시지가 있다면 연결한다.
- 액션을 props로 전달한다.

## 테스트 조건

- 정상 할일 추가 시나리오가 통과한다.
- 완료 처리 시나리오가 통과한다.
- 삭제 시나리오가 통과한다.
- 필터 변경 시나리오가 통과한다.

## 검증 명령

```bash
npm test -- App
```

## 완료 조건

- 통합 테스트 통과
- 타입 에러 없음
