import { describe, expect, it } from 'vitest'

import { functionName } from './functionName'

describe('functionName', () => {
  it('describes expected behavior', () => {
    expect(functionName('input')).toBe('output')
  })
})
