import { useRef } from 'react'
import { travel } from '../data/travel'
import './TravelSection.css'

/** deterministic 0..1 pseudo-random from a seed (stable across renders) */
const rand = (seed: number, salt = 0) => {
  const x = Math.sin(seed * 12.9898 + salt * 78.233 + 1.3) * 43758.5453
  return x - Math.floor(x)
}

const WOODS = ['var(--cream)', '#efe6d4', '#e9dcc2', '#f2ecdd', '#ede2cb']

/* waisted, open-jawed clothespin silhouette (centre x = 15) */
const PIN_BODY =
  'M15 3 C10.6 3 9 5.6 9 9.6 C8.6 12 7.7 13.6 7.7 17 ' +
  'C7.7 21 9.9 24.6 10 29 C9.9 33.6 7.7 37 7.7 41 ' +
  'C7.7 44.6 8.6 46 9 49.4 C9 52.8 10.6 55 13.2 55 L14.2 55 ' +
  'L15 51.4 L15.8 55 L16.8 55 C19.4 55 21 52.8 21 49.4 ' +
  'C21.4 46 22.3 44.6 22.3 41 C22.3 37 20.1 33.6 20 29 ' +
  'C20.1 24.6 22.3 21 22.3 17 C22.3 13.6 21.4 12 21 9.6 ' +
  'C21 5.6 19.4 3 15 3 Z'

/** a sketched sprung-wood clothespin — each one a little different */
const Clothespin = ({ seed }: { seed: number }) => {
  const rot = (rand(seed, 1) * 18 - 9).toFixed(1) // -9..9°
  const len = (0.92 + rand(seed, 2) * 0.2).toFixed(3) // 0.92..1.12 length
  const fill = WOODS[Math.floor(rand(seed, 3) * WOODS.length)]
  const flip = rand(seed, 4) > 0.5 ? -1 : 1
  return (
    <svg
      className="cl-pin__svg"
      viewBox="0 0 30 58"
      aria-hidden="true"
      style={{ transform: `rotate(${rot}deg) scale(${flip}, ${len})` }}
    >
      {/* wooden body (waist pinched at the spring, jaws split at the foot) */}
      <path
        d={PIN_BODY}
        fill={fill}
        stroke="var(--ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        filter="url(#wobble)"
      />
      {/* the slot between the two prongs (broken at the spring) */}
      <g
        stroke="var(--ink)"
        fill="none"
        strokeLinecap="round"
        strokeWidth="1.4"
        filter="url(#wobble)"
      >
        <path d="M15 6 V25" />
        <path d="M15 33 V51" />
        {/* coiled metal spring + wire ends poking out at the waist */}
        <path d="M10 29 L6.4 26.2 M20 29 L23.6 26.2" strokeWidth="1.5" />
      </g>
      <circle
        cx="15"
        cy="29"
        r="3.4"
        fill={fill}
        stroke="var(--ink)"
        strokeWidth="1.5"
        filter="url(#wobble)"
      />
      <circle cx="15" cy="29" r="1.4" fill="none" stroke="var(--ink)" strokeWidth="1.1" />
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
