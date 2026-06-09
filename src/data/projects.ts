import projectsConfig from './projects.json'

export type Project = {
  /** Grouping label shown as a sub-heading — e.g. "YouTube" */
  category: string
  /** Project / video title */
  name: string
  /** Where clicking the project goes */
  url: string
  /** Image shown on the right (for YouTube: an i.ytimg.com thumbnail URL) */
  thumbnail: string
  /** Skills learned — rendered as little bullets under the name */
  skills: string[]
  /** Optional branded thumbnail: smaller logo + wordmark + motto (e.g. Sprachy) */
  brand?: { name: string; motto: string }
}

/**
 * Personal Projects — configured in `projects.json`.
 *
 *   • Add a project → new { } entry (grouped on the page by "category")
 *   • For a YouTube video, thumbnail is:
 *       https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg
 *     (falls back to hqdefault automatically if maxres doesn't exist)
 */
export const projects: Project[] = projectsConfig as Project[]
