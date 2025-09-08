import { useEffect, useRef, useState } from 'react'

const formatTime = (s = 0) => {
  s = Math.max(0, Math.floor(s))
  const m = Math.floor(s / 60)
  const r = (s % 60).toString().padStart(2, '0')
  return `${m}:${r}`
}

const AudioPlayer = ({ src, title = 'Opname', onShare }) => {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio
    const onLoaded = () => setDuration(audio.duration || 0)
    const onTime = () => setProgress(audio.currentTime || 0)
    const onEnd = () => setPlaying(false)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
    }
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(err => alert('Kan audio niet afspelen: ' + err.message))
    }
  }

  const onSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    const val = Number(e.target.value)
    audio.currentTime = val
    setProgress(val)
  }

  return (
    <div className="flex items-center gap-2 w-full bg-viral-dark-lighter p-2 rounded-lg border border-viral-muted">
      <button 
        className="flex-shrink-0 w-8 h-8 bg-viral-primary hover:bg-viral-primary/80 rounded-full flex items-center justify-center text-white text-xs transition-colors" 
        onClick={toggle}
      >
        {playing ? '⏸️' : '▶️'}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium mb-1 truncate">{title}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-viral-text-secondary min-w-fit">
            {formatTime(progress)}
          </span>
          <input 
            type="range" 
            min={0} 
            max={Math.max(duration || 0, 0)} 
            value={progress} 
            onChange={onSeek} 
            className="flex-1 h-1 bg-viral-dark rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${duration > 0 ? (progress / duration) * 100 : 0}%, #374151 ${duration > 0 ? (progress / duration) * 100 : 0}%, #374151 100%)`
            }}
          />
          <span className="text-xs text-viral-text-secondary min-w-fit">
            {isFinite(duration) ? formatTime(duration) : '0:00'}
          </span>
        </div>
      </div>
      {onShare && (
        <button 
          className="flex-shrink-0 w-12 h-12 bg-viral-primary hover:bg-viral-primary/80 rounded-full flex items-center justify-center text-white transition-colors touch-manipulation min-w-[48px] min-h-[48px]" 
          onClick={onShare}
          title="Deel opname"
        >
          <span className="text-lg">📤</span>
        </button>
      )}
    </div>
  )
}

export default AudioPlayer
