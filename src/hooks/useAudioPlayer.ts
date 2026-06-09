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

  const toggle = useCallback(() => {
    const audio = audioRef.current!
    setHasStarted(true)
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [])

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
      setHasStarted(true)
      if (i === index) {
        toggle()
        return
      }
      setIsPlaying(true)
      setIndex(i)
    },
    [index, toggle],
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
  }
}
