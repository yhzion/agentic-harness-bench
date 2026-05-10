import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname)

function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-script-test-'))
  fs.mkdirSync(path.join(dir, '.agentic', 'steps'), { recursive: true })
  fs.mkdirSync(path.join(dir, '.agentic', 'scripts'), { recursive: true })
  fs.cpSync(path.join(repoRoot, '.agentic', 'scripts'), path.join(dir, '.agentic', 'scripts'), {
    recursive: true,
  })
  fs.writeFileSync(
    path.join(dir, '.agentic', 'progress.json'),
    JSON.stringify(
      {
        currentStep: '001-fixture',
        completedSteps: [],
        failedSteps: [],
        retryCount: 0,
        lastResult: 'READY',
        nextStep: '001-fixture',
      },
      null,
      2,
    ) + '\n',
  )
  fs.writeFileSync(
    path.join(dir, '.agentic', 'steps', '001-fixture.md'),
    [
      '# STEP 001. Fixture',
      '',
      '## 수정 가능 파일 (정확히 2개)',
      '- package.json',
      '- src/index.ts',
      '',
    ].join('\n'),
  )
  return dir
}

function runNode(cwd, script, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
  })
}

test('run-gate fails when editable step outputs are missing', () => {
  const cwd = makeFixture()
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ private: true, type: 'module', scripts: {} }, null, 2),
  )

  const result = runNode(cwd, '.agentic/scripts/run-gate.mjs', ['step'])

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /missing editable files/i)
  assert.match(result.stderr, /src\/index\.ts/)
})

test('check-step-scope fails changed files outside the current step allowlist', () => {
  const cwd = makeFixture()
  fs.mkdirSync(path.join(cwd, 'src'), { recursive: true })
  fs.writeFileSync(path.join(cwd, 'package.json'), '{"private":true}\n')
  fs.writeFileSync(path.join(cwd, 'src', 'index.ts'), 'export const ok = true\n')
  fs.writeFileSync(path.join(cwd, 'README.md'), 'outside\n')
  spawnSync('git', ['init'], { cwd, encoding: 'utf8' })
  spawnSync('git', ['add', '.'], { cwd, encoding: 'utf8' })
  spawnSync('git', ['commit', '-m', 'init'], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  })
  fs.appendFileSync(path.join(cwd, 'src', 'index.ts'), 'export const stillOk = true\n')
  fs.appendFileSync(path.join(cwd, 'README.md'), 'changed\n')

  const result = runNode(cwd, '.agentic/scripts/check-step-scope.mjs')

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /outside current STEP allowlist/)
  assert.match(result.stderr, /README\.md/)
  assert.doesNotMatch(result.stderr, /> src\/index\.ts/)
})
