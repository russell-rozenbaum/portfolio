import { useEffect, useRef } from 'react'
import './Cursor.css'

// things that should trigger the inverted/expanded hover state
const INTERACTIVE =
  'a, button, [role="slider"], [role="button"], input, select, textarea, label, summary, .album-card, .project__thumb, [data-cursor="hover"]'

/**
 * JS-driven custom cursor: a theme-blue dot inside a black ring that follows
 * the mouse. On hover over interactive elements it inverts and grows — the
 * black ring collapses to a dot while the blue dot expands into a circle.
 * (The native cursor is hidden via `cursor: none` for fine pointers.)
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // mouse devices only — touch has no cursor
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return

    let shown = false
    const onMove = (e: PointerEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      if (!shown) {
        shown = true
        el.classList.add('is-visible')
      }
      const target = e.target as Element | null
      const hovering = !!target?.closest?.(INTERACTIVE)
      el.classList.toggle('is-hover', hovering)
    }
    const onLeave = () => el.classList.remove('is-visible')
    const onEnter = () => el.classList.add('is-visible')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__dot" />
    </div>
  )
}
