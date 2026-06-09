import { albums } from '../data/albums'
import './AlbumShelf.css'

export default function AlbumShelf() {
  if (albums.length === 0) return null

  return (
    <section className="albums-grid" aria-label="Albums">
      {albums.map((album) => (
        <a
          key={album.cover}
          className="album-card"
          href={album.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${album.title} (${album.release}) — listen`}
        >
          <span className="album-card__cover sticker">
            <span className="album-card__ph" aria-hidden="true">
              NO
              <br />
              COVER
            </span>
            <img
              src={album.cover}
              alt={`${album.title} cover`}
              loading="lazy"
              onLoad={(e) => e.currentTarget.classList.remove('is-missing')}
              onError={(e) => e.currentTarget.classList.add('is-missing')}
            />
            <span className="album-card__listen" aria-hidden="true">
              Listen ↗
            </span>
          </span>
          <span className="album-card__info">
            <span className="album-card__title">{album.title}</span>
            <span className="album-card__date">{album.release}</span>
          </span>
        </a>
      ))}
    </section>
  )
}
