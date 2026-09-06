import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins plain class names', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('drops falsy values', () => {
    const isHidden = false
    expect(cn('flex', isHidden && 'hidden', undefined, null, 'gap-2')).toBe('flex gap-2')
  })

  it('resolves conflicting Tailwind utilities to the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('lets a caller override a variant className without a conflict lingering', () => {
    expect(cn('text-sm text-muted-foreground', 'text-destructive')).toBe('text-sm text-destructive')
  })
})
