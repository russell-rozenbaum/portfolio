import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import './PdfDoc.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

/** Render a PDF page into a canvas at a target pixel width. */
async function renderPage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  renderWidth: number,
) {
  const page = await pdf.getPage(pageNum)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: renderWidth / base.width })
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  await page.render({ canvasContext: ctx, viewport }).promise
}

const DocIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h8l4 4v16H6V2zm8 1.2V6h2.8L14 3.2zM8.2 11h7.6v1.5H8.2zm0 3.2h7.6v1.5H8.2zm0 3.2h4.8v1.5H8.2z" />
  </svg>
)

type Props = {
  src: string
  title: string
  downloadName: string
  /** small label above the title, e.g. "PDF" or "Poster" */
  kind?: string
  /** "block" = clickable preview card; "icon" = compact icon trigger */
  variant?: 'block' | 'icon'
}

export default function PdfDoc({
  src,
  title,
  downloadName,
  kind = 'PDF',
  variant = 'block',
}: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [zoom, setZoom] = useState(1) // 1 = fit whole page in view

  const thumbRef = useRef<HTMLCanvasElement>(null)
  const modalRef = useRef<HTMLCanvasElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  // Render the current modal page. Default (zoom=1) fits the WHOLE page in view;
  // zoom re-renders at the new resolution so it stays crisp (no CSS upscaling).
  const renderModal = useCallback(async () => {
    const canvas = modalRef.current
    const body = bodyRef.current
    if (!pdf || !canvas || !body) return
    const pageObj = await pdf.getPage(page)
    const base = pageObj.getViewport({ scale: 1 })
    const aspect = base.width / base.height
    const margin = 28
    const availW = Math.max(80, body.clientWidth - margin * 2)
    const availH = Math.max(80, body.clientHeight - margin * 2)
    const fitW = Math.min(availW, availH * aspect) // width that fits the whole page
    const displayW = fitW * zoomRef.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderW = Math.min(4000, Math.round(displayW * dpr))
    const viewport = pageObj.getViewport({ scale: renderW / base.width })
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    canvas.style.width = `${Math.round(displayW)}px`
    canvas.style.height = 'auto'
    await pageObj.render({ canvasContext: ctx, viewport }).promise
  }, [pdf, page])

  // load the document
  useEffect(() => {
    let cancelled = false
    const task = pdfjsLib.getDocument(src)
    task.promise
      .then((doc) => {
        if (cancelled) return
        setPdf(doc)
        setNumPages(doc.numPages)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [src])

  // render the block thumbnail (page 1)
  useEffect(() => {
    if (!pdf || !thumbRef.current) return
    renderPage(pdf, 1, thumbRef.current, 600).catch(() => {})
  }, [pdf])

  // render the current page in the modal; re-render on zoom + window resize
  useEffect(() => {
    if (!open) return
    renderModal().catch(() => {})
    const onResize = () => renderModal().catch(() => {})
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, renderModal, zoom])

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.min(Math.max(1, n), numPages || 1)
      setPage(clamped)
      setPageInput(String(clamped))
    },
    [numPages],
  )

  // open / close + body scroll lock + Esc + arrow keys
  const openModal = () => {
    setPage(1)
    setPageInput('1')
    setZoom(1)
    setOpen(true)
  }
  const zoomBy = (factor: number) =>
    setZoom((z) => Math.min(4, Math.max(0.3, z * factor)))

  // Mouse click-drag to pan when zoomed. Touch is left to native scrolling
  // (which already pans + has momentum), so we only hijack the mouse here.
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(
    null,
  )
  const onPanDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const body = bodyRef.current
    if (!body) return
    const canScroll =
      body.scrollWidth > body.clientWidth || body.scrollHeight > body.clientHeight
    if (!canScroll) return
    pan.current = {
      x: e.clientX,
      y: e.clientY,
      left: body.scrollLeft,
      top: body.scrollTop,
    }
    body.setPointerCapture(e.pointerId)
    body.classList.add('is-grabbing')
  }
  const onPanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const body = bodyRef.current
    if (!pan.current || !body) return
    body.scrollLeft = pan.current.left - (e.clientX - pan.current.x)
    body.scrollTop = pan.current.top - (e.clientY - pan.current.y)
  }
  const onPanUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const body = bodyRef.current
    pan.current = null
    body?.classList.remove('is-grabbing')
    if (body?.hasPointerCapture(e.pointerId)) body.releasePointerCapture(e.pointerId)
  }
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      else if (e.key === 'ArrowRight') goTo(page + 1)
      else if (e.key === 'ArrowLeft') goTo(page - 1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, page, goTo])

  const multi = numPages > 1

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          className="pdf-icon"
          onClick={openModal}
          aria-label={`Open ${title}`}
          title={title}
        >
          <DocIcon />
        </button>
      ) : (
        <button type="button" className="pdf-block sticker" onClick={openModal}>
          <span className="pdf-block__preview">
            <canvas ref={thumbRef} className="pdf-block__canvas" />
          </span>
          <span className="pdf-block__cap">
            <span className="pdf-block__kind">
              {kind}
              {numPages
                ? ` · ${numPages} ${numPages === 1 ? 'page' : 'pages'}`
                : ''}
            </span>
            <span className="pdf-block__title">{title}</span>
            <span className="pdf-block__open">Open ↗</span>
          </span>
        </button>
      )}

      {open &&
        createPortal(
        <div
          className="pdf-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="pdf-modal__panel sticker"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pdf-modal__bar">
              {/* top-left: page nav (only when multi-page) */}
              <div className="pdf-modal__nav">
                {multi && (
                  <>
                    <button
                      type="button"
                      className="pdf-btn"
                      onClick={() => goTo(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>
                    <span className="pdf-modal__pages">
                      <input
                        className="pdf-modal__pageinput"
                        type="text"
                        inputMode="numeric"
                        value={pageInput}
                        aria-label="Page number"
                        onChange={(e) =>
                          setPageInput(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        onBlur={() => goTo(Number(pageInput) || page)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') goTo(Number(pageInput) || page)
                        }}
                      />
                      <span> / {numPages}</span>
                    </span>
                    <button
                      type="button"
                      className="pdf-btn"
                      onClick={() => goTo(page + 1)}
                      disabled={page >= numPages}
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* center: zoom */}
              <div className="pdf-modal__zoom">
                <button
                  type="button"
                  className="pdf-btn"
                  onClick={() => zoomBy(1 / 1.25)}
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  type="button"
                  className="pdf-btn pdf-btn--zoom"
                  onClick={() => setZoom(1)}
                  title="Fit page"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className="pdf-btn"
                  onClick={() => zoomBy(1.25)}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>

              {/* top-right: download + close */}
              <div className="pdf-modal__actions">
                <a
                  className="pdf-btn pdf-btn--download"
                  href={src}
                  download={downloadName}
                >
                  ↓ Download
                </a>
                <button
                  type="button"
                  className="pdf-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className="pdf-modal__body"
              ref={bodyRef}
              onPointerDown={onPanDown}
              onPointerMove={onPanMove}
              onPointerUp={onPanUp}
              onPointerCancel={onPanUp}
            >
              <canvas ref={modalRef} className="pdf-modal__canvas" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
