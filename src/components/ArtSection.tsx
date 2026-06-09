import { paintings } from '../data/art'
import './ArtSection.css'

export default function ArtSection() {
  if (paintings.length === 0) return null
  return (
    <ul className="gallery__grid">
      {paintings.map((piece, i) => (
        <li key={`${piece.image}-${i}`} className="art">
          <span className="art__frame sticker">
            <span className="art__ph" aria-hidden="true">
              NO
              <br />
              IMAGE
            </span>
            <img
              src={piece.image}
              alt={`Oil painting (${piece.date})`}
              loading="lazy"
              onError={(e) => e.currentTarget.classList.add('is-missing')}
            />
          </span>
          {piece.date && (
            <span className="art__cap">
              <span className="art__meta">{piece.date}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
