import MusicPlayer from './components/MusicPlayer'
import AlbumShelf from './components/AlbumShelf'
import ArtSection from './components/ArtSection'
import TravelSection from './components/TravelSection'
import ProjectsSection from './components/ProjectsSection'
import PdfDoc from './components/PdfDoc'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { tracks } from './data/tracks'
import { docs } from './data/docs'
import experience from './data/experience.json'
import hazelPRs from './data/hazelPRs.json'
import './App.css'

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 4h20a1 1 0 011 1v14a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1zm.4 2L12 12l9.6-6H2.4zM3 7.3V18h18V7.3l-9 5.6-9-5.6z" />
  </svg>
)

export default function App() {
  const player = useAudioPlayer(tracks)

  return (
    <div className="site">
      {/* ---- forest-green sketched top bar ---- */}
      <nav className="topbar sticker">
        <a
          className="topbar__name"
          href="."
          onClick={(e) => {
            e.preventDefault()
            window.location.reload()
          }}
        >
          Russell Rozenbaum
        </a>
        <div className="topbar__links">
          <a
            className="topbar__icon"
            href="https://github.com/russell-rozenbaum"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a
            className="topbar__icon"
            href="https://www.linkedin.com/in/rrozenbaum/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedinIcon />
          </a>
          <a
            className="topbar__icon"
            href="mailto:rjrozenbaum@gmail.com"
            aria-label="Email"
          >
            <MailIcon />
          </a>
          <span className="topbar__icon">
            <PdfDoc
              src={docs.resume.src}
              title={docs.resume.title}
              downloadName={docs.resume.downloadName}
              kind="Résumé"
              variant="icon"
            />
          </span>
        </div>
      </nav>

      <main className="sections">
        {/* ---- Overview: photo + bio ---- */}
        <section id="overview" className="section">
          <h2 className="section__title">Overview</h2>
          <div className="overview">
            <figure className="overview__photo sticker">
              <img src="/portrait.jpg" alt="Russell Rozenbaum" />
            </figure>
            <div className="overview__bio">
              <p>
                [ bio placeholder ] — a couple of sentences about who you are,
                what you build, and what you care about.
              </p>
              <p>
                [ more placeholder ] — background, current focus, and anything
                else you'd like visitors to know.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Work Experience ---- */}
        <section id="work" className="section">
          <h2 className="section__title">Work Experience</h2>
          <div className="xp xp--logos">
            {experience.map((item) => (
              <div className="xp__item" key={`${item.org}-${item.role}`}>
                {item.logo && (
                  <span className="xp__logo sticker sticker--thin">
                    <img
                      src={`/logos/${item.logo}`}
                      alt={`${item.org} logo`}
                      loading="lazy"
                      onError={(e) =>
                        e.currentTarget.classList.add('is-missing')
                      }
                    />
                  </span>
                )}
                <div className="xp__body">
                  <div className="xp__head">
                    <span className="xp__role">{item.role}</span>
                    <span className="xp__meta">
                      {item.org} · {item.location} · {item.dates}
                    </span>
                  </div>
                  <ul className="xp__bullets">
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="docs-row">
            <PdfDoc
              src={docs.resume.src}
              title={docs.resume.title}
              downloadName={docs.resume.downloadName}
              kind="Résumé"
            />
          </div>
        </section>

        {/* ---- Research ---- */}
        <section id="research" className="section">
          <h2 className="section__title">Research</h2>
          <div className="xp">
            <div className="xp__item">
              <div className="xp__head xp__head--logo">
                <span className="xp__inline-logo">
                  <img src="/logos/hazel.svg" alt="Hazel logo" />
                </span>
                <span className="xp__headtext">
                  <span className="xp__role">
                    Undergraduate AI / PL Researcher
                  </span>
                  <span className="xp__meta">
                    Future of Programming Lab · Ann Arbor, MI · May 2024 –
                    Present
                  </span>
                </span>
              </div>
              <ul className="xp__bullets">
                <li>
                  Designed an LLM code-completion assistant in the Hazel editor
                  that completes tasks purely through a structure-based action
                  language (OCaml, Bonsai, OpenRouter API).
                </li>
                <li>
                  Built an in-editor exercise suite letting instructors author
                  and edit problems directly within Hazel.
                </li>
              </ul>
              <div className="prs">
                <span className="prs__label">Merged PRs · hazelgrove/hazel</span>
                <ul className="prs__list">
                  {hazelPRs.map((pr) => (
                    <li key={pr.number}>
                      <a
                        className="pr"
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="pr__gh" aria-hidden="true">
                          <GithubIcon />
                        </span>
                        <span className="pr__num">#{pr.number}</span>
                        <span className="pr__title">{pr.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="xp__item">
              <div className="xp__head">
                <span className="xp__role">Senior Honors Thesis — EECS 443</span>
                <span className="xp__meta">University of Michigan · 2024 – 2025</span>
              </div>
              <ul className="xp__bullets">
                <li>
                  Authored "Structure-Level Interactions for LLM-Based Coding
                  Agents" — a structure-based action language for LLM coding
                  agents in Hazel (advised by Prof. Cyrus Omar).
                </li>
              </ul>
            </div>
          </div>
          <div className="docs-row">
            <PdfDoc
              src={docs.poster.src}
              title={docs.poster.title}
              downloadName={docs.poster.downloadName}
              kind="Poster"
            />
            <PdfDoc
              src={docs.thesis.src}
              title={docs.thesis.title}
              downloadName={docs.thesis.downloadName}
              kind="Thesis"
            />
            <PdfDoc
              src={docs.slides.src}
              title={docs.slides.title}
              downloadName={docs.slides.downloadName}
              kind="Slides"
            />
          </div>
        </section>

        {/* ---- Personal Projects ---- */}
        <section id="projects" className="section">
          <h2 className="section__title">Personal Projects</h2>
          <ProjectsSection />
        </section>

        {/* ---- Music: shelf (left) · player (right) ---- */}
        <section id="music" className="section">
          <h2 className="section__title">Music</h2>
          <div className="music-row">
            <div className="music-row__shelf">
              <AlbumShelf />
            </div>
            <aside className="music-row__player" aria-label="Music player">
              <MusicPlayer tracks={tracks} player={player} />
            </aside>
          </div>
        </section>

        {/* ---- Oil Paintings ---- */}
        <section id="paintings" className="section">
          <h2 className="section__title">Oil Paintings</h2>
          <ArtSection />
        </section>

        {/* ---- Travel (very bottom) ---- */}
        <section id="travel" className="section">
          <h2 className="section__title">Travel</h2>
          <TravelSection />
        </section>
      </main>
    </div>
  )
}
