import { useRef } from 'react'
import { travel } from '../data/travel'
import './TravelSection.css'

/** deterministic 0..1 pseudo-random from a seed (stable across renders) */
const rand = (seed: number, salt = 0) => {
  const x = Math.sin(seed * 12.9898 + salt * 78.233 + 1.3) * 43758.5453
  return x - Math.floor(x)
}

const WOODS = ['var(--cream)', '#efe6d4', '#e9dcc2', '#f2ecdd', '#ede2cb']

/** a sketched sprung-wood clothespin — each one a little different */
const Clothespin = ({ seed }: { seed: number }) => {
  const rot = (rand(seed, 1) * 18 - 9).toFixed(1) // -9..9°
  const len = (0.9 + rand(seed, 2) * 0.24).toFixed(3) // 0.90..1.14 length
  const fill = WOODS[Math.floor(rand(seed, 3) * WOODS.length)]
  const flip = rand(seed, 4) > 0.5 ? -1 : 1
  const sy = (3 + rand(seed, 5) * 1.6).toFixed(1) // spring offset jitter
  return (
    <svg
      className="cl-pin__svg"
      viewBox="0 0 28 50"
      aria-hidden="true"
      style={{ transform: `rotate(${rot}deg) scale(${flip}, ${len})` }}
    >
      {/* body + spring coil (wood) */}
      <g fill={fill} stroke="var(--ink)" strokeWidth="1.8" filter="url(#wobble)">
        <rect x="5" y="3" width="18" height="44" rx="8.5" />
        <circle cx="14" cy={22 + Number(sy)} r="4.3" strokeWidth="1.5" />
      </g>
      {/* the clamp slot (top + bottom prongs) and the spring eye */}
      <g
        stroke="var(--ink)"
        fill="none"
        strokeLinecap="round"
        strokeWidth="1.6"
        filter="url(#wobble)"
      >
        <line x1="14" y1="6" x2="14" y2={17 + Number(sy)} />
        <line x1="14" y1={28 + Number(sy)} x2="14" y2="44" />
        <circle cx="14" cy={22 + Number(sy)} r="1.7" strokeWidth="1.2" />
      </g>
    </svg>
  )
}

/** sketched arrow on a location tag, pointing to that location's photos */
const Arrow = () => (
  <svg className="cl-loc__arrow" viewBox="0 0 64 24" aria-hidden="true">
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#wobble)"
    >
      <path d="M3 12 H52" />
      <path d="M42 4 L55 12 L42 20" />
    </g>
  </svg>
)

export default function TravelSection() {
  const viewportRef = useRef<HTMLDivElement>(null)
  // mouse drag-to-scroll (touch / trackpad use native scrolling)
  const drag = useRef({ active: false, startX: 0, startScroll: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const vp = viewportRef.current
    if (!vp) return
    drag.current = { active: true, startX: e.clientX, startScroll: vp.scrollLeft }
    vp.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const vp = viewportRef.current
    if (!vp) return
    vp.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  if (travel.length === 0) return null

  return (
    <div className="clothesline">
      {/* the string itself — full-bleed, static; photos slide along it */}
      <span className="clothesline__string" aria-hidden="true" />

      <div
        className="clothesline__viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <ul className="clothesline__track">
          {travel.map((item, i) => (
            <li
              key={i}
              className={`cl-item cl-item--${item.kind}`}
              style={{ ['--tilt' as string]: `${(i % 2 ? 1 : -1) * 2}deg` }}
            >
              <span className="cl-pin" aria-hidden="true">
                <Clothespin seed={i + 1} />
              </span>

              {item.kind === 'photo' ? (
                <span className="cl-photo sticker">
                  <img
                    src={item.image}
                    alt={`${item.location} (${item.date})`}
                    loading="lazy"
                    draggable={false}
                    onError={(e) => e.currentTarget.classList.add('is-missing')}
                  />
                </span>
              ) : (
                <span className="cl-loc sticker sticker--thin">
                  <span className="cl-loc__name">{item.location}</span>
                  <Arrow />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
