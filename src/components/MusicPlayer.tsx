import { useRef } from 'react'
import type { AudioPlayer } from '../hooks/useAudioPlayer'
import type { Track } from '../data/tracks'
import './MusicPlayer.css'

// Where the "Russell Roze" header links to — your music landing page.
const MUSIC_URL = 'https://ffm.bio/russellroze'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4.5l13 7.5-13 7.5z" />
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5.5" y="4.5" width="4.5" height="15" rx="1" />
    <rect x="14" y="4.5" width="4.5" height="15" rx="1" />
  </svg>
)
const PrevIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4.5" width="3" height="15" rx="1" />
    <path d="M21 4.5v15l-12-7.5z" />
  </svg>
)
const NextIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="17" y="4.5" width="3" height="15" rx="1" />
    <path d="M3 4.5v15l12-7.5z" />
  </svg>
)

type Props = {
  tracks: Track[]
  player: AudioPlayer
}

export default function MusicPlayer({ tracks, player }: Props) {
  const barRef = useRef<HTMLDivElement | null>(null)

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    player.seek(Math.min(1, Math.max(0, fraction)))
  }

  return (
    <section className="playbox sticker" aria-label="Music player">
      {/* ---- the LCD screen ---- */}
      <div className="screen sticker">
        <div className="screen__inner">
          <header className="screen__head">
            <span className="star">✦</span>
            <a
              className="screen__link"
              href={MUSIC_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Russell Roze
            </a>
            <span className="star">✦</span>
          </header>

          <ol className="tracklist">
            {tracks.map((track, i) => {
              const active = i === player.index
              // title is the big readout; until it's filled, the raw label shows.
              const primary = track.title || track.label
              const secondary = track.title ? track.label : ''
              return (
                <li key={track.src}>
                  <button
                    type="button"
                    className={`track ${active ? 'track--active' : ''}`}
                    onClick={() => player.playTrack(i)}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="track__num">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="track__text">
                      {secondary && (
                        <span className="track__label">{secondary}</span>
                      )}
                      <span className="track__name">{primary}</span>
                    </span>
                    <span className="track__icon" aria-hidden="true">
                      {active && player.isPlaying ? (
                        <span className="bars">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <PlayIcon />
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="scrub">
            <div
              className="scrub__bar"
              ref={barRef}
              onClick={onScrub}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(player.progress * 100)}
              tabIndex={0}
            >
              <div
                className="scrub__fill"
                style={{ width: `${player.progress * 100}%` }}
              />
            </div>
            <div className="scrub__times">
              <span>{formatTime(player.currentTime)}</span>
              <span>{formatTime(player.duration)}</span>
            </div>
          </div>
        </div>
        {/* scanlines + screen glare, painted over the LCD */}
        <div className="screen__scan" aria-hidden="true" />
      </div>

      {/* ---- physical transport buttons on the casing ---- */}
      <div className="controls">
        <button
          type="button"
          className="ctrl"
          onClick={player.prev}
          aria-label="Previous track"
        >
          <PrevIcon />
        </button>
        <button
          type="button"
          className="ctrl ctrl--play sticker"
          onClick={player.toggle}
          aria-label={player.isPlaying ? 'Pause' : 'Play'}
        >
          {player.isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={player.next}
          aria-label="Next track"
        >
          <NextIcon />
        </button>
      </div>
    </section>
  )
}
