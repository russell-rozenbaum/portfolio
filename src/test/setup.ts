import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// jsdom has no matchMedia. Default to a "fine" pointer so the custom cursor
// activates; individual tests override window.matchMedia as needed.
function fakeMatchMedia(fine: boolean) {
  return (query: string): MediaQueryList =>
    ({
      matches: query.includes('pointer: fine') ? fine : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList
}

if (!window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).matchMedia = fakeMatchMedia(true)
}

export { fakeMatchMedia }
