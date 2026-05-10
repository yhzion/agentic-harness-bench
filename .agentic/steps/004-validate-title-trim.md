# STEP 004. validateTodoTitle trim 처리

## 목표

title 앞뒤 공백을 제거해 검증 결과로 반환한다.

## 읽기 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 가능 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 구현 조건

- 정상 title은 trim된 value를 반환한다.
- 공백만 있는 문자열은 실패한다.
- 함수 시그니처를 변경하지 않는다.

## 테스트 조건

- validateTodoTitle('  hello  ')가 { ok: true, value: 'hello' }를 반환한다.
- validateTodoTitle('   ')가 실패한다.

## 검증 명령

```bash
npm test -- validateTodoTitle
```

## 완료 조건

- 테스트 통과
- 타입 에러 없음
