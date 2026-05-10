# STEP 029. Preview 빌드 검증

## 작업 단위
프로덕션 빌드를 생성하고, 결과 디렉토리 구조를 검증한다. 새 코드는 작성하지 않는다.

## 사전 작성된 검증 스크립트 (verbatim 복사 → .agentic/scripts/check-preview.mjs)

```js
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const indexHtml = path.join(dist, 'index.html')

const errors = []

if (!fs.existsSync(dist)) errors.push('dist/ 디렉토리가 없습니다')
if (!fs.existsSync(indexHtml)) errors.push('dist/index.html이 없습니다')

if (fs.existsSync(indexHtml)) {
  const html = fs.readFileSync(indexHtml, 'utf8')
  if (!/<div id="root"><\/div>|<div id="root"\s*>/.test(html)) {
    errors.push('dist/index.html에 #root 컨테이너가 없습니다')
  }
  if (!/<script\s+[^>]*type="module"/.test(html)) {
    errors.push('dist/index.html에 module 스크립트가 없습니다')
  }
}

const assetsDir = path.join(dist, 'assets')
if (!fs.existsSync(assetsDir)) {
  errors.push('dist/assets/ 디렉토리가 없습니다')
} else {
  const files = fs.readdirSync(assetsDir)
  if (!files.some((f) => f.endsWith('.js'))) errors.push('dist/assets에 .js 파일이 없습니다')
  if (!files.some((f) => f.endsWith('.css'))) errors.push('dist/assets에 .css 파일이 없습니다')
}

if (errors.length > 0) {
  console.error('[preview] FAIL')
  for (const e of errors) console.error('  > ' + e)
  process.exit(1)
}

console.log('[preview] PASS — dist 구조 검증 완료')
```

## package.json 추가 스크립트

```json
{
  "preview:check": "node .agentic/scripts/check-preview.mjs"
}
```

## 작업 지시
1. 위 스크립트를 verbatim 복사한다.
2. package.json scripts에 preview:check 항목을 추가한다.
3. 빌드 실행 후 검증.

## 수정 가능 파일 (정확히 2개)
- .agentic/scripts/check-preview.mjs (신규)
- package.json (scripts 객체에 preview:check 1줄 추가)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일 (이미 모든 도메인/UI 완성됨)

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run preview:check
```

## 완료 조건
- 검증 명령 exit 0
- dist/index.html, dist/assets/*.js, dist/assets/*.css 존재
