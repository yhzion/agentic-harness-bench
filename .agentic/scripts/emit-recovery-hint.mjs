import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const patternsFile = path.join(root, '.agentic', 'contracts', 'failure-patterns.json')
const reportFile = path.join(root, '.agentic', 'reports', 'recovery-hint.md')

export function emit({ gate, violations = [], extra = null }) {
  const patterns = loadPatterns()
  if (!patterns) return

  const matched = patterns.find((p) => p.detect?.gate === gate)
  if (!matched) {
    writeReport({
      gate,
      violations,
      pattern: null,
      message: `gate "${gate}" 의 failure-pattern 매핑이 .agentic/contracts/failure-patterns.json 에 없음. 사용자에게 보고 필요.`,
      extra,
    })
    return
  }

  writeReport({ gate, violations, pattern: matched, message: null, extra })
}

function loadPatterns() {
  try {
    const data = JSON.parse(fs.readFileSync(patternsFile, 'utf8'))
    return data.patterns || []
  } catch {
    return null
  }
}

function writeReport({ gate, violations, pattern, message, extra }) {
  fs.mkdirSync(path.dirname(reportFile), { recursive: true })

  const lines = []
  lines.push(`# Recovery Hint (auto-generated)`)
  lines.push('')
  lines.push(`- **fail 한 gate**: \`${gate}\``)
  lines.push(`- **timestamp**: ${new Date().toISOString()}`)
  lines.push(`- **참조**: \`.agentic/contracts/recovery-playbook.md\` 의 매크로 원칙을 먼저 읽을 것`)
  lines.push('')

  if (message) {
    lines.push(`> ⚠️ ${message}`)
    lines.push('')
  }

  if (violations && violations.length > 0) {
    lines.push(`## 위반 내역 (${violations.length}건)`)
    lines.push('')
    for (const v of violations.slice(0, 20)) {
      lines.push(`- ${formatViolation(v)}`)
    }
    if (violations.length > 20) {
      lines.push(`- ... 그 외 ${violations.length - 20}건`)
    }
    lines.push('')
  }

  if (pattern) {
    lines.push(`## 패턴: \`${pattern.id}\``)
    lines.push('')
    if (pattern.diagnosis?.length) {
      lines.push(`### 진단`)
      for (const d of pattern.diagnosis) lines.push(`- ${d}`)
      lines.push('')
    }
    if (pattern.self_test_procedure?.length) {
      lines.push(`### 자가검증 절차 (반드시 직접 실행하라)`)
      for (const s of pattern.self_test_procedure) lines.push(`- ${s}`)
      lines.push('')
    }
    if (pattern.investigation_questions?.length) {
      lines.push(`### 조사 질문 (답을 추측하지 말고 위 절차로 확인)`)
      for (const q of pattern.investigation_questions) lines.push(`- ${q}`)
      lines.push('')
    }
    if (pattern.do_not?.length) {
      lines.push(`### 절대 하지 말 것`)
      for (const d of pattern.do_not) lines.push(`- ${d}`)
      lines.push('')
    }
  }

  if (extra) {
    lines.push(`## 추가 정보`)
    lines.push('')
    lines.push('```')
    lines.push(typeof extra === 'string' ? extra : JSON.stringify(extra, null, 2))
    lines.push('```')
    lines.push('')
  }

  lines.push(`---`)
  lines.push(`이 hint 는 매 gate fail 마다 갱신된다. retry 전 반드시 읽고 절차를 수행하라.`)

  fs.writeFileSync(reportFile, lines.join('\n') + '\n')
}

function formatViolation(v) {
  if (typeof v === 'string') return v
  if (v.file && v.line) {
    const tok = v.token || v.specifier || ''
    const reason = v.reason || v.why || ''
    return `\`${v.file}:${v.line}\` ${tok ? `\`${tok}\`` : ''} ${reason ? `— ${reason}` : ''}`.trim()
  }
  if (v.target) return `\`${v.target}\` ${v.expected_sha ? `expected ${v.expected_sha.slice(0, 12)}… got ${v.actual_sha.slice(0, 12)}…` : ''}`.trim()
  if (v.label) return `\`${v.label}\`${v.module ? ` module=\`${v.module}\`` : ''}${v.detail ? ` — ${String(v.detail).slice(0, 100)}` : ''}`
  return JSON.stringify(v)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const gate = process.argv[2]
  if (!gate) {
    console.error('usage: emit-recovery-hint.mjs <gate-name> [--message "..."]')
    process.exit(1)
  }
  const messageIdx = process.argv.indexOf('--message')
  const message = messageIdx > -1 ? process.argv[messageIdx + 1] : null
  emit({ gate, violations: [], extra: message })
  console.log(`recovery hint emitted → ${path.relative(root, reportFile)}`)
}
