import { useState, type CSSProperties } from 'react'
import { albums } from '../data/albums'
import './AlbumShelf.css'

// Muted pastel spine colors, cycled by position (kept light so ink text reads).
const SPINE_COLORS = [
  '#e7a99c',
  '#a6cbdd',
  '#e8d199',
  '#abc3a4',
  '#d8b3bf',
  '#b3bcd6',
]

export default function AlbumShelf() {
  const [active, setActive] = useState(0)

  if (albums.length === 0) return null
  const current = albums[active]

  return (
    <section className="shelf-unit" aria-label="Albums">
      <div className="shelf">
        <ul className="spines">
          {albums.map((album, i) => (
            <li key={album.cover}>
              <button
                type="button"
                className={`spine sticker ${i === active ? 'spine--active' : ''}`}
                style={
                  {
                    '--fill': SPINE_COLORS[i % SPINE_COLORS.length],
                    '--cover': `url(${album.cover})`,
                  } as CSSProperties
                }
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-label={album.title}
                aria-pressed={i === active}
              >
                <span className="spine__title">{album.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="shelf__board sticker" aria-hidden="true" />
      </div>

      <a
        className="album"
        href={current.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="album__cover sticker">
          <span className="album__ph" aria-hidden="true">
            NO
            <br />
            COVER
          </span>
          <img
            src={current.cover}
            alt={`${current.title} cover`}
            onLoad={(e) => e.currentTarget.classList.remove('is-missing')}
            onError={(e) => {
              e.currentTarget.classList.add('is-missing')
            }}
          />
        </span>
        <span className="album__info">
          <span className="album__title">{current.title}</span>
          <span className="album__date">{current.release}</span>
          <span className="album__cta">Listen ↗</span>
        </span>
      </a>
    </section>
  )
}
