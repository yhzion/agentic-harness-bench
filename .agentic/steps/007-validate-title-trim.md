# STEP 007. validateTodoTitle — 공백 trim 처리

## 작업 단위
기존 src/domain/validateTodoTitle.ts에 공백 처리 로직을 추가한다. 시그니처는 그대로 유지한다.

## 시그니처 (변경 금지)

```ts
import type { ValidationResult } from '../types/todo'

export function validateTodoTitle(input: string): ValidationResult
```

## 추가 테스트 (verbatim 복사 — 기존 파일에 append, 기존 describe 블록은 변경 금지)

```ts
import { describe, it, expect } from 'vitest'
import { validateTodoTitle } from './validateTodoTitle'

describe('validateTodoTitle - 공백 처리', () => {
  it('공백만 있는 문자열은 EMPTY로 실패한다', () => {
    const result = validateTodoTitle('   ')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('EMPTY')
  })

  it('탭과 개행만 있는 문자열은 EMPTY로 실패한다', () => {
    const result = validateTodoTitle('\t\n  ')
    expect(result.ok).toBe(false)
  })

  it('앞뒤 공백은 trim되어 통과한다', () => {
    expect(validateTodoTitle('  우유 사기  ')).toEqual({ ok: true, value: '우유 사기' })
  })

  it('내부 공백은 보존된다', () => {
    expect(validateTodoTitle('우유  사기')).toEqual({ ok: true, value: '우유  사기' })
  })
})
```

## 작업 지시
1. validateTodoTitle.test.ts에 위 describe 블록을 추가한다(append).
2. validateTodoTitle.ts 본문을 수정해 위 테스트와 STEP 006 테스트를 모두 통과시킨다.

## 수정 가능 파일 (정확히 2개)
- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일
- STEP 006에서 작성한 describe 블록의 내용

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
- STEP 006 + STEP 007의 모든 테스트 통과
