# STEP 033. e2e — 추가 검증 (엣지케이스)

## 작업 단위
정확히 1개의 spec 파일(e2e/add-validation.spec.ts)을 신규 작성한다. 빈 입력, 공백, 길이 상한, 긴 텍스트, 특수문자 회귀를 커버한다.

## 사전 작성된 spec (verbatim 복사 → e2e/add-validation.spec.ts)

```ts
import { test, expect } from './_fixtures'

const TODO_TITLE_MAX_LENGTH = 200

test.describe('@edge add-validation', () => {
  test('빈 input 으로 Enter — 항목 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('textbox').press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('공백만 입력 — 추가 안 됨 (trim 후 빈 문자열)', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('   ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('탭/개행만 입력 — 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('\t\n  ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('앞뒤 공백 — trim 되어 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('  trimmed  ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('trimmed', { exact: true })).toBeVisible()
  })

  test('내부 공백 — 보존', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('우유  사기')
    await input.press('Enter')
    await expect(page.getByText('우유  사기', { exact: true })).toBeVisible()
  })

  test('상한 길이 (200자) — 통과', async ({ page }) => {
    await page.goto('/')
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH)
    const input = page.getByRole('textbox')
    await input.fill(title)
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })

  test('상한 초과 (201자) — 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    const title = 'b'.repeat(TODO_TITLE_MAX_LENGTH + 1)
    const input = page.getByRole('textbox')
    await input.fill(title)
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('이모지 입력 — 정상 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('휴가 🌴 가기')
    await input.press('Enter')
    await expect(page.getByText('휴가 🌴 가기')).toBeVisible()
  })

  test('한자 입력 — 정상 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('讀書')
    await input.press('Enter')
    await expect(page.getByText('讀書')).toBeVisible()
  })

  test('HTML-injection 흉내 입력 — 텍스트로 escape 되어 표시', async ({ page }) => {
    await page.goto('/')
    const malicious = '<script>window.__pwned=true</script>'
    const input = page.getByRole('textbox')
    await input.fill(malicious)
    await input.press('Enter')
    await expect(page.getByText(malicious, { exact: true })).toBeVisible()
  })
})
```

## 작업 지시
- 모든 시나리오는 한 번의 `goto('/')` 후 단일 흐름. 시나리오 간 상태 공유 금지(_fixtures 의 cleanLocalStorage 가 처리).
- HTML-injection 시나리오는 React 의 textContent escape 가 정상 작동함을 회귀 보장.

## 수정 가능 파일 (정확히 1개)
- e2e/add-validation.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- 위 1개 외 모든 e2e/* 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/add-validation.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 10개 엣지 시나리오 모두 통과
