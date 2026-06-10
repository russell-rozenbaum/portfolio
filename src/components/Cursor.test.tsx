import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Cursor from './Cursor'
import { fakeMatchMedia } from '../test/setup'

/** point window.matchMedia at a fine (mouse) or coarse (touch) pointer */
function setPointerFine(fine: boolean) {
  ;(window as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia =
    fakeMatchMedia(fine)
}

/** dispatch a pointermove that bubbles up to the window listener */
function move(target: EventTarget, clientX: number, clientY: number) {
  target.dispatchEvent(
    new MouseEvent('pointermove', { clientX, clientY, bubbles: true })
  )
}

describe('Cursor — the always-on custom pointer', () => {
  beforeEach(() => setPointerFine(true))

  it('renders a decorative cursor with a ring and a dot', () => {
    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor')
    expect(cursor).not.toBeNull()
    expect(container.querySelector('.cursor__ring')).not.toBeNull()
    expect(container.querySelector('.cursor__dot')).not.toBeNull()
    // hidden from the a11y tree — it's purely visual
    expect(cursor?.getAttribute('aria-hidden')).toBe('true')
  })

  it('follows the pointer position on every move', () => {
    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement
    move(document.body, 123, 456)
    expect(cursor.style.transform).toBe('translate3d(123px, 456px, 0)')
    move(document.body, 7, 9)
    expect(cursor.style.transform).toBe('translate3d(7px, 9px, 0)')
  })

  it('becomes visible only after the first move', () => {
    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement
    expect(cursor.classList.contains('is-visible')).toBe(false)
    move(document.body, 10, 10)
    expect(cursor.classList.contains('is-visible')).toBe(true)
  })

  it('enters the hover state over interactive elements (link/button/input)', () => {
    const link = document.createElement('a')
    link.href = '#x'
    const button = document.createElement('button')
    const input = document.createElement('input')
    const plain = document.createElement('div')
    document.body.append(link, button, input, plain)

    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement

    for (const el of [link, button, input]) {
      move(el, 5, 5)
      expect(cursor.classList.contains('is-hover')).toBe(true)
    }

    // moving onto a non-interactive element drops the hover state
    move(plain, 5, 5)
    expect(cursor.classList.contains('is-hover')).toBe(false)

    link.remove()
    button.remove()
    input.remove()
    plain.remove()
  })

  it('detects hover on a child inside an interactive ancestor', () => {
    const link = document.createElement('a')
    link.href = '#x'
    const child = document.createElement('span')
    link.appendChild(child)
    document.body.appendChild(link)

    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement
    move(child, 5, 5)
    expect(cursor.classList.contains('is-hover')).toBe(true)

    link.remove()
  })

  it('toggles visibility on document mouseleave / mouseenter', () => {
    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement
    move(document.body, 1, 1)
    expect(cursor.classList.contains('is-visible')).toBe(true)

    document.dispatchEvent(new MouseEvent('mouseleave'))
    expect(cursor.classList.contains('is-visible')).toBe(false)

    document.dispatchEvent(new MouseEvent('mouseenter'))
    expect(cursor.classList.contains('is-visible')).toBe(true)
  })

  it('does nothing on coarse (touch) pointers — no listeners attached', () => {
    setPointerFine(false)
    const { container } = render(<Cursor />)
    const cursor = container.querySelector('.cursor') as HTMLElement
    move(document.body, 50, 50)
    expect(cursor.classList.contains('is-visible')).toBe(false)
    expect(cursor.style.transform).toBe('')
  })

  it('removes its listeners on unmount and never throws afterward', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Cursor />)
    unmount()
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(() => move(document.body, 9, 9)).not.toThrow()
    remove.mockRestore()
  })
})
