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
