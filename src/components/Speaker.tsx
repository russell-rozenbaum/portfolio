import { useEffect, useRef } from 'react'
import type { AudioPlayer } from '../hooks/useAudioPlayer'

/** average of FFT bins [lo, hi) normalised to 0..1 */
const band = (a: Uint8Array, lo: number, hi: number) => {
  let s = 0
  for (let i = lo; i < hi; i++) s += a[i]
  return s / (hi - lo) / 255
}

type Props = {
  side: 'left' | 'right'
  player: AudioPlayer
}

/**
 * A sketched speaker cabinet that (1) carries an L/R volume knob and
 * (2) subtly resonates with its own channel: the woofer pulses on lows/mids,
 * the tweeter on highs. Driven straight to the DOM via rAF — no re-renders.
 */
export default function Speaker({ side, player }: Props) {
  const woofRef = useRef<HTMLSpanElement>(null)
  const tweetRef = useRef<HTMLSpanElement>(null)
  const drag = useRef({ active: false, startY: 0, startVal: 1 })

  // latest player without re-subscribing the rAF every render
  const playerRef = useRef(player)
  playerRef.current = player

  const vol = player.volumes[side]
  const angle = -135 + vol * 270 // dial sweep: -135°..+135°

  // ---- frequency-reactive resonance ----
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const buf = new Uint8Array(128)
    let wScale = 1
    let wShift = 0
    let tHi = 0 // eased high-frequency envelope (drives the tweeter buzz)
    let raf = 0
    const tick = () => {
      const p = playerRef.current
      const an = p.getAnalyser(side)
      let low = 0
      let mid = 0
      let high = 0
      if (an && p.isPlaying) {
        an.getByteFrequencyData(buf)
        low = band(buf, 1, 7)
        mid = band(buf, 7, 34)
        high = band(buf, 30, 100) // wider: hats / snare / presence, not just air
      }
      // woofer: smooth pulse on lows + mids (the part you liked — unchanged)
      const wScaleT = 1 + low * 0.05 + mid * 0.015
      const wShiftT = -low * 2.2
      wScale += (wScaleT - wScale) * 0.35
      wShift += (wShiftT - wShift) * 0.35
      if (woofRef.current)
        woofRef.current.style.transform = `translateY(${wShift.toFixed(2)}px) scale(${wScale.toFixed(3)})`

      // tweeter: a fast buzz/shake whose amplitude tracks the highs. The
      // envelope is eased (smooth ramp), but the offset is re-randomised every
      // frame so it reads as a high-frequency vibration.
      tHi += (high - tHi) * 0.5
      const amp = tHi * 9 // px of jitter at full highs
      const jx = (Math.random() * 2 - 1) * amp
      const jy = (Math.random() * 2 - 1) * amp
      const tScale = 1 + tHi * 0.07
      if (tweetRef.current)
        tweetRef.current.style.transform = `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px) scale(${tScale.toFixed(3)})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [side])

  // ---- volume knob (vertical drag) ----
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startY: e.clientY, startVal: player.volumes[side] }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dv = (drag.current.startY - e.clientY) / 150 // ~150px = full sweep
    player.setVolume(side, drag.current.startVal + dv)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      player.setVolume(side, vol + 0.05)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      player.setVolume(side, vol - 0.05)
    }
  }

  return (
    <div className={`speaker speaker--${side} sticker`}>
      <span className="speaker__tweeter" ref={tweetRef} aria-hidden="true" />
      <span className="speaker__woofer" ref={woofRef} aria-hidden="true" />
      <div
        className="speaker__knob"
        role="slider"
        tabIndex={0}
        aria-label={`${side === 'left' ? 'Left' : 'Right'} speaker volume`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(vol * 100)}
        title={`${side.toUpperCase()} · ${Math.round(vol * 100)}%`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => player.setVolume(side, 1)}
        onKeyDown={onKeyDown}
      >
        <span className="speaker__dial" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="speaker__notch" />
        </span>
        <span className="speaker__klabel">{side === 'left' ? 'L' : 'R'}</span>
      </div>
    </div>
  )
}
