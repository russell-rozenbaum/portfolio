import { useCallback, useEffect, useRef, useState } from 'react'
import type { Track } from '../data/tracks'

export type AudioPlayer = {
  index: number
  current: Track
  isPlaying: boolean
  /** 0..1 position within the current track */
  progress: number
  currentTime: number
  duration: number
  /** true once the very first playback has been allowed by the browser */
  hasStarted: boolean
  /** when on, advancing picks a random track instead of the next in order */
  shuffle: boolean
  toggle: () => void
  toggleShuffle: () => void
  next: () => void
  prev: () => void
  playTrack: (i: number) => void
  seek: (fraction: number) => void
  /** per-channel volume, 0..1 (the speaker knobs) */
  volumes: { left: number; right: number }
  setVolume: (side: 'left' | 'right', value: number) => void
  /** live FFT node for a channel (null until the audio graph is built) */
  getAnalyser: (side: 'left' | 'right') => AnalyserNode | null
}

/** Pick a random index that isn't `current` (uniformly over the rest). */
function randomOther(current: number, len: number): number {
  if (len <= 1) return current
  const r = Math.floor(Math.random() * (len - 1))
  return r >= current ? r + 1 : r
}

/**
 * Drives a single <audio> element for the playbox.
 *
 * Autoplay reality: browsers block sound-on-load until the visitor interacts.
 * So we *try* to autoplay immediately, and if that's blocked we arm one-time
 * listeners that start the music on the first click/scroll/keypress/touch.
 * To the visitor it feels like it "just starts."
 */
export function useAudioPlayer(tracks: Track[]): AudioPlayer {
  // One audio element for the whole app's lifetime.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (audioRef.current === null) {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
  }

  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [shuffle, setShuffle] = useState(true) // on by default
  const [volumes, setVolumes] = useState({ left: 1, right: 1 })
  const volumesRef = useRef(volumes)
  volumesRef.current = volumes

  // Web Audio graph (built lazily on first play): the audio element is split
  // into L/R, each channel gets its own gain (the knobs) + analyser (the shake),
  // then merged back to the speakers.
  const graphRef = useRef<{
    ctx: AudioContext
    gainL: GainNode
    gainR: GainNode
    analyserL: AnalyserNode
    analyserR: AnalyserNode
  } | null>(null)

  // Keep live refs so the audio event listeners read the latest values.
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying
  const shuffleRef = useRef(shuffle)
  shuffleRef.current = shuffle

  // --- Wire up the audio element's events once. ---
  useEffect(() => {
    const audio = audioRef.current!

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () =>
      setIndex((i) =>
        shuffleRef.current ? randomOther(i, tracks.length) : (i + 1) % tracks.length,
      )

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [tracks.length])

  // --- Load the source whenever the track changes; keep playing if we were. ---
  useEffect(() => {
    const audio = audioRef.current!
    audio.src = tracks[index].src
    audio.load()
    setCurrentTime(0)
    if (isPlayingRef.current) {
      audio.play().catch(() => {
        /* blocked or missing file — stay paused */
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // No autoplay: music only starts when the user hits play or clicks a track.

  // Build the split-stereo graph once (createMediaElementSource is one-shot).
  const ensureGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      const ctx = new Ctor()
      const source = ctx.createMediaElementSource(audioRef.current!)
      const splitter = ctx.createChannelSplitter(2)
      const merger = ctx.createChannelMerger(2)
      const gainL = ctx.createGain()
      const gainR = ctx.createGain()
      gainL.gain.value = volumesRef.current.left
      gainR.gain.value = volumesRef.current.right
      const mkAnalyser = () => {
        const a = ctx.createAnalyser()
        a.fftSize = 256
        a.smoothingTimeConstant = 0.8
        return a
      }
      const analyserL = mkAnalyser()
      const analyserR = mkAnalyser()
      source.connect(splitter)
      splitter.connect(gainL, 0) // left channel → left gain
      splitter.connect(gainR, 1) // right channel → right gain
      gainL.connect(analyserL)
      analyserL.connect(merger, 0, 0)
      gainR.connect(analyserR)
      analyserR.connect(merger, 0, 1)
      merger.connect(ctx.destination)
      graphRef.current = { ctx, gainL, gainR, analyserL, analyserR }
      return graphRef.current
    } catch {
      return null // unsupported / blocked — audio still plays normally
    }
  }, [])

  // Resume the context on a user gesture (autoplay policy + iOS).
  const resumeAudio = useCallback(() => {
    const g = ensureGraph()
    if (g && g.ctx.state === 'suspended') g.ctx.resume().catch(() => {})
  }, [ensureGraph])

  const setVolume = useCallback((side: 'left' | 'right', value: number) => {
    const v = Math.min(1, Math.max(0, value))
    setVolumes((prev) => (prev[side] === v ? prev : { ...prev, [side]: v }))
    const g = graphRef.current
    if (g) (side === 'left' ? g.gainL : g.gainR).gain.value = v
  }, [])

  const getAnalyser = useCallback((side: 'left' | 'right') => {
    const g = graphRef.current
    return g ? (side === 'left' ? g.analyserL : g.analyserR) : null
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current!
    resumeAudio()
    setHasStarted(true)
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [resumeAudio])

  const next = useCallback(() => {
    setHasStarted(true)
    setIndex((i) =>
      shuffleRef.current ? randomOther(i, tracks.length) : (i + 1) % tracks.length,
    )
  }, [tracks.length])

  const prev = useCallback(() => {
    setHasStarted(true)
    // If we're more than 3s in, restart the track instead of skipping back.
    const audio = audioRef.current!
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    setIndex((i) =>
      shuffleRef.current
        ? randomOther(i, tracks.length)
        : (i - 1 + tracks.length) % tracks.length,
    )
  }, [tracks.length])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])

  const playTrack = useCallback(
    (i: number) => {
      resumeAudio()
      setHasStarted(true)
      if (i === index) {
        toggle()
        return
      }
      setIsPlaying(true)
      setIndex(i)
    },
    [index, toggle, resumeAudio],
  )

  const seek = useCallback(
    (fraction: number) => {
      const audio = audioRef.current!
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = fraction * audio.duration
        setCurrentTime(audio.currentTime)
      }
    },
    [],
  )

  const progress = duration > 0 ? currentTime / duration : 0

  return {
    index,
    current: tracks[index],
    isPlaying,
    progress,
    currentTime,
    duration,
    hasStarted,
    shuffle,
    toggle,
    toggleShuffle,
    next,
    prev,
    playTrack,
    seek,
    volumes,
    setVolume,
    getAnalyser,
  }
}
