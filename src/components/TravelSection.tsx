import { travel } from '../data/travel'
import './TravelSection.css'

export default function TravelSection() {
  if (travel.length === 0) return null
  return (
    <ul className="travel__list">
      {travel.map((stop, i) => (
        <li key={`${stop.image}-${i}`} className="travel__row">
          <span className="travel__frame sticker">
            <span className="travel__ph" aria-hidden="true">
              NO
              <br />
              IMAGE
            </span>
            <img
              src={stop.image}
              alt={`${stop.location} (${stop.date})`}
              loading="lazy"
              onError={(e) => e.currentTarget.classList.add('is-missing')}
            />
          </span>
          <span className="travel__cap">
            {stop.location && (
              <span className="travel__loc">{stop.location}</span>
            )}
            {stop.date && <span className="travel__date">{stop.date}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}
