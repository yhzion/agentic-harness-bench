# STEP 006. validateTodoTitle — 빈 문자열 처리

## 작업 단위
src/domain/validateTodoTitle.ts와 그 테스트를 생성한다. 공백 처리는 다음 STEP의 책임이다.

## 시그니처 (변경 금지)

```ts
// src/domain/validateTodoTitle.ts
import type { ValidationResult } from '../types/todo'

export function validateTodoTitle(input: string): ValidationResult
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/validateTodoTitle.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { validateTodoTitle } from './validateTodoTitle'

describe('validateTodoTitle - 빈 문자열', () => {
  it('빈 문자열은 EMPTY 메시지로 실패한다', () => {
    const result = validateTodoTitle('')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('EMPTY')
  })

  it('비어있지 않은 문자열은 그대로 통과한다', () => {
    expect(validateTodoTitle('우유 사기')).toEqual({ ok: true, value: '우유 사기' })
  })

  it('한 글자도 통과한다', () => {
    expect(validateTodoTitle('a')).toEqual({ ok: true, value: 'a' })
  })
})
```

## 작업 지시
1. src/domain/validateTodoTitle.ts에 시그니처를 verbatim 작성한다.
2. 본문을 채워 위 테스트를 통과시킨다.
3. 공백 trim은 이 STEP에서 다루지 않는다 (다음 STEP 책임).

## 수정 가능 파일 (정확히 2개)
- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
- agent:scope = 위 2개 파일과 일치
