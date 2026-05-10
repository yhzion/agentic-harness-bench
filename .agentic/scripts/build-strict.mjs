import { spawn } from 'node:child_process'

const child = spawn('npx', ['vite', 'build', '--logLevel', 'warn'], {
  shell: process.platform === 'win32',
})

const warningPattern = /\b(warning|warn)\b/i
const ignorePattern = /(no warnings|0 warnings|--max-warnings)/i

let buffer = ''
let warningFound = false
let warningLines = []

function consume(chunk, sink) {
  buffer += chunk.toString()
  const lines = buffer.split('\n')
  buffer = lines.pop() ?? ''
  for (const line of lines) {
    sink.write(line + '\n')
    if (!warningFound && warningPattern.test(line) && !ignorePattern.test(line)) {
      warningFound = true
      warningLines.push(line)
    }
  }
}

child.stdout.on('data', (chunk) => consume(chunk, process.stdout))
child.stderr.on('data', (chunk) => consume(chunk, process.stderr))

child.on('close', (code) => {
  if (buffer.length > 0) process.stdout.write(buffer + '\n')

  if (code !== 0) {
    console.error(`[build:strict] vite build exited with code ${code}`)
    process.exit(code ?? 1)
  }

  if (warningFound) {
    console.error('[build:strict] FAIL — warning detected in build output:')
    for (const line of warningLines) console.error('  > ' + line)
    process.exit(1)
  }

  console.log('[build:strict] PASS — no warnings')
})
