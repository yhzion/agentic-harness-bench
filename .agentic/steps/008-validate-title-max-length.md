# STEP 008. validateTodoTitle — 길이 상한

## 작업 단위
title 길이 상한 200자를 추가한다. 시그니처 그대로.

## 시그니처 (변경 금지)

```ts
export function validateTodoTitle(input: string): ValidationResult
```

## 상수 (이 STEP에서 정의)

```ts
export const TODO_TITLE_MAX_LENGTH = 200
```

## 추가 테스트 (verbatim append → src/domain/validateTodoTitle.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { validateTodoTitle, TODO_TITLE_MAX_LENGTH } from './validateTodoTitle'

describe('validateTodoTitle - 길이 상한', () => {
  it('TODO_TITLE_MAX_LENGTH 상수는 200이다', () => {
    expect(TODO_TITLE_MAX_LENGTH).toBe(200)
  })

  it('상한 길이까지는 통과한다', () => {
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH)
    expect(validateTodoTitle(title)).toEqual({ ok: true, value: title })
  })

  it('상한을 초과하면 TOO_LONG 메시지로 실패한다', () => {
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH + 1)
    const result = validateTodoTitle(title)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('TOO_LONG')
  })

  it('trim 후 길이로 판정한다 — 공백 포함 201자도 trim 결과가 200 이하면 통과', () => {
    const title = ' ' + 'a'.repeat(TODO_TITLE_MAX_LENGTH) + ' '
    expect(validateTodoTitle(title).ok).toBe(true)
  })
})
```

## 작업 지시
1. TODO_TITLE_MAX_LENGTH 상수를 export한다.
2. 본문에 길이 검사를 추가한다(trim 후 길이로 판정).
3. 위 테스트 + STEP 006, 007의 모든 테스트가 함께 통과해야 한다.

## 수정 가능 파일 (정확히 2개)
- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일
- STEP 006, 007에서 작성한 describe 블록의 내용

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
