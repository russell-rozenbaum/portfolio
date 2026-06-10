import { useEffect, useRef } from 'react'
import type { AudioPlayer } from '../hooks/useAudioPlayer'

/** average of FFT bins [lo, hi) normalised to 0..1 */
const band = (a: Uint8Array, lo: number, hi: number) => {
  let s = 0
  for (let i = lo; i < hi; i++) s += a[i]
  return s / (hi - lo) / 255
}

type Props = { player: AudioPlayer }

/**
 * Mobile view: sketched wired earbuds whose two buds each resonate with their
 * own channel (smooth pulse on lows/mids + a small capped shimmer on highs).
 * The two wires merge into one cable that plugs into the bottom of the player.
 * Drawn as a full-rig overlay (preserveAspectRatio="none"); the cable is a thin
 * line so the slight non-uniform scaling is invisible. Driven via rAF.
 */
export default function Earbuds({ player }: Props) {
  const leftRef = useRef<SVGGElement>(null)
  const rightRef = useRef<SVGGElement>(null)

  const playerRef = useRef(player)
  playerRef.current = player

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const buf = new Uint8Array(128)
    const env = { left: { pulse: 0, hi: 0 }, right: { pulse: 0, hi: 0 } }
    let raf = 0

    const drive = (side: 'left' | 'right', ref: React.RefObject<SVGGElement>) => {
      const p = playerRef.current
      const an = p.getAnalyser(side)
      let low = 0
      let mid = 0
      let high = 0
      if (an && p.isPlaying) {
        an.getByteFrequencyData(buf)
        low = band(buf, 1, 7)
        mid = band(buf, 7, 34)
        high = band(buf, 30, 100)
      }
      const e = env[side]
      e.pulse += (low * 0.06 + mid * 0.02 - e.pulse) * 0.35
      e.hi += (high - e.hi) * 0.5
      const amp = Math.min(e.hi * 9, 1.2)
      const jx = (Math.random() * 2 - 1) * amp
      const jy = (Math.random() * 2 - 1) * amp
      const scale = 1 + e.pulse
      if (ref.current)
        ref.current.style.transform = `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px) scale(${scale.toFixed(3)})`
    }

    const tick = () => {
      drive('left', leftRef)
      drive('right', rightRef)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      className="earbuds"
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {/* one cable: both wires merge then run down to the plug at the bottom */}
      <path
        className="eb-cable"
        d="M72 66 C 78 88, 96 92, 100 108 C 104 92, 122 88, 128 66"
      />
      <path
        className="eb-cable"
        d="M100 108 C 90 132, 24 138, 18 168 C 13 208, 23 246, 18 283"
      />

      {/* 3.5 mm plug seated in the bottom-left of the player */}
      <rect className="eb-plug" x="11" y="288" width="14" height="12" rx="2.5" />
      <rect className="eb-plug-tip" x="14.5" y="275" width="7" height="15" rx="1.5" />
      <rect className="eb-plug-band" x="14.5" y="281" width="7" height="2" />

      {/* left earbud */}
      <ellipse className="eb-tip" cx="72" cy="30" rx="7" ry="9" />
      <circle className="eb-bud" cx="72" cy="48" r="19" />
      <g className="eb-driver" ref={leftRef}>
        <circle cx="72" cy="48" r="14" />
        <circle cx="72" cy="48" r="8" />
        <circle className="eb-dot" cx="72" cy="48" r="3" />
      </g>

      {/* right earbud */}
      <ellipse className="eb-tip" cx="128" cy="30" rx="7" ry="9" />
      <circle className="eb-bud" cx="128" cy="48" r="19" />
      <g className="eb-driver" ref={rightRef}>
        <circle cx="128" cy="48" r="14" />
        <circle cx="128" cy="48" r="8" />
        <circle className="eb-dot" cx="128" cy="48" r="3" />
      </g>
    </svg>
  )
}
