import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'src')

function allCssFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...allCssFiles(p))
    else if (name.endsWith('.css')) out.push(p)
  }
  return out
}

/**
 * These guard the invariant the user asked for: the native cursor must NEVER
 * show on a mouse device — not the default arrow, not the link pointer, not the
 * text I-beam. The JS cursor (Cursor.tsx) draws the pointer; these tests make
 * sure nothing in CSS can defeat the global hide.
 */
// SKIPPED: the custom cursor is currently disabled in the UI (SHOW_CUSTOM_CURSOR
// in App.tsx is false and the `cursor: none` rule in index.css is commented out),
// so these invariants intentionally no longer hold. The component and CSS are
// kept in the codebase; re-enable the cursor and remove `.skip` to restore these.
describe.skip('custom-cursor CSS invariant — native cursor can never win', () => {
  it('index.css hides the native cursor on EVERY element for fine pointers', () => {
    const css = readFileSync(join(SRC, 'index.css'), 'utf8')
    // @media (pointer: fine) { * { cursor: none !important } }
    const re =
      /@media\s*\(\s*pointer:\s*fine\s*\)\s*\{\s*\*\s*\{[^}]*cursor:\s*none\s*!important/i
    expect(
      re.test(css),
      'expected a `@media (pointer: fine) { * { cursor: none !important } }` rule in index.css'
    ).toBe(true)
  })

  it('no stylesheet overrides the cursor with a non-none !important value', () => {
    // An `!important` cursor that is anything but `none` would beat the global
    // hide (which is also `!important` but on `*`, the lowest specificity).
    const offenders: string[] = []
    for (const file of allCssFiles(SRC)) {
      const css = readFileSync(file, 'utf8')
      const re = /cursor\s*:\s*([^;{}]*?)\s*!important/gi
      let m: RegExpExecArray | null
      while ((m = re.exec(css)) !== null) {
        const value = m[1].trim().toLowerCase()
        if (value !== 'none') offenders.push(`${file} → "cursor: ${value} !important"`)
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })

  it('App.tsx imports and mounts the custom <Cursor /> component', () => {
    const app = readFileSync(join(SRC, 'App.tsx'), 'utf8')
    expect(app).toMatch(/import\s+Cursor\s+from\s+['"]\.\/components\/Cursor['"]/)
    expect(app).toMatch(/<Cursor\s*\/>/)
  })

  it('the cursor element itself stays click-through (pointer-events: none)', () => {
    // If the cursor div captured pointer events it would become the hit target,
    // breaking both hover detection and clicks underneath it.
    const css = readFileSync(join(SRC, 'components/Cursor.css'), 'utf8')
    const re = /\.cursor\s*\{[^}]*pointer-events:\s*none/i
    expect(re.test(css)).toBe(true)
  })
})
