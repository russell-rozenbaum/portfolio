export type DocRef = {
  /** Web path to the PDF (served from public/docs) */
  src: string
  /** Title shown on the block + modal */
  title: string
  /** Filename used when the visitor downloads it */
  downloadName: string
}

/**
 * PDFs live in public/docs/ and are referenced here. To swap a file, replace it
 * in public/docs/ (keep the same name) or update the `src` below.
 */
export const docs = {
  resume: {
    src: '/docs/russell-rozenbaum-resume.pdf',
    title: 'Résumé',
    downloadName: 'Russell-Rozenbaum-Resume.pdf',
  },
  poster: {
    src: '/docs/research-poster.pdf',
    title: 'Research Poster — 2025',
    downloadName: 'Rozenbaum-Research-Poster-2025.pdf',
  },
  thesis: {
    src: '/docs/honors-thesis.pdf',
    title: 'Honors Thesis — EECS 443',
    downloadName: 'Rozenbaum-EECS443-Honors-Thesis.pdf',
  },
  slides: {
    src: '/docs/thesis-slides.pdf',
    title: 'Thesis Slides — EECS 443',
    downloadName: 'Rozenbaum-EECS443-Thesis-Slides.pdf',
  },
} satisfies Record<string, DocRef>
