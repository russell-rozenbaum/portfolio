import trackConfig from './tracks.json'

export type Track = {
  /** Big title shown in the playbox */
  title: string
  /** Small label above the title (artist, project, mood — your call) */
  label: string
  /** Web path to the audio file (built from the filename in tracks.json) */
  src: string
}

/**
 * The playlist is configured in `tracks.json` — edit THAT file to change the
 * order, titles, and labels. You don't need to touch this file.
 *
 *   • Reorder        → move the lines in tracks.json up/down
 *   • Rename a track → change "title" / "label"
 *   • Point at audio → set "file" to a filename you dropped in public/music/
 *
 * Here we just turn each "file" into a real web path (/music/<file>).
 */
export const tracks: Track[] = trackConfig.map((t) => ({
  title: t.title,
  label: t.label,
  src: `/music/${t.file}`,
}))
