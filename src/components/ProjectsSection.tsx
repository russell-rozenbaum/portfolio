import { projects, type Project } from '../data/projects'
import './ProjectsSection.css'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4.5l13 7.5-13 7.5z" />
  </svg>
)

function ProjectRow({ project }: { project: Project }) {
  const isVideo = /youtube\.com|youtu\.be/.test(project.url)
  const isLogo = project.thumbnail.endsWith('.svg')
  return (
    <div className="project">
      <div className="project__info">
        <h4 className="project__name">
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            {project.name}
          </a>
        </h4>
        {project.skills.length > 0 && (
          <ul className="project__skills">
            {project.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        )}
      </div>

      {project.brand ? (
        <a
          className="project__thumb project__thumb--brand sticker"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open: ${project.brand.name}`}
        >
          <img
            className="project__brandlogo"
            src={project.thumbnail}
            alt={`${project.brand.name} logo`}
            loading="lazy"
          />
          <span className="project__brandname">{project.brand.name}</span>
          <span className="project__brandmotto">{project.brand.motto}</span>
        </a>
      ) : (
        <a
          className="project__thumb sticker"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch: ${project.name}`}
        >
          <img
            className={isLogo ? 'is-logo' : undefined}
            src={project.thumbnail}
            alt={`${project.name} thumbnail`}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1'
                img.src = img.src.replace('maxresdefault', 'hqdefault')
              }
            }}
          />
          {isVideo && (
            <span className="project__play" aria-hidden="true">
              <PlayIcon />
            </span>
          )}
        </a>
      )}
    </div>
  )
}

export default function ProjectsSection() {
  if (projects.length === 0) return null

  // group projects by category, preserving first-seen order
  const groups: { category: string; items: Project[] }[] = []
  for (const project of projects) {
    let group = groups.find((g) => g.category === project.category)
    if (!group) {
      group = { category: project.category, items: [] }
      groups.push(group)
    }
    group.items.push(project)
  }

  return (
    <div className="projects">
      {groups.map((group) => (
        <div className="projects__cat" key={group.category}>
          <h3 className="projects__cat-title">{group.category}</h3>
          {group.items.map((project) => (
            <ProjectRow key={project.url} project={project} />
          ))}
        </div>
      ))}
    </div>
  )
}
