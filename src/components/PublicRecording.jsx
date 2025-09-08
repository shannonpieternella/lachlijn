import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AudioPlayer from './AudioPlayer'

const PublicRecording = () => {
  const { shareId } = useParams()
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/calls/public/${shareId}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Niet gevonden')
        setMeta(data.call)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [shareId])

  if (error) return <div className="viral-container py-8"><div className="viral-card">{error}</div></div>
  if (!meta) return <div className="viral-container py-8"><div className="viral-card">Laden...</div></div>

  const shareUrl = `${window.location.origin}/r/${shareId}`
  const shareText = encodeURIComponent(`🎭 Luister deze prank call: ${meta.scenarioName} — ${shareUrl}`)

  return (
    <div className="viral-container py-8">
      <div className="viral-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{meta.scenarioIcon || '🎭'}</div>
            <div>
              <div className="text-xl font-bold">{meta.scenarioName || 'Prank Call'}</div>
              <div className="text-viral-text-secondary text-sm">Duur ~ {Math.round((meta.duration || 0)/60)} min • {new Date(meta.createdAt).toLocaleString('nl-NL')}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a className="viral-button viral-button-ghost" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a className="viral-button viral-button-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} target="_blank" rel="noreferrer">Telegram</a>
            <a className="viral-button viral-button-ghost" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} target="_blank" rel="noreferrer">X</a>
            <a className="viral-button viral-button-ghost" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
            <button className="viral-button" onClick={() => navigator.clipboard.writeText(shareUrl).then(() => alert('Link gekopieerd!'))}>Kopieer Link</button>
          </div>
        </div>
        <AudioPlayer src={meta.playbackUrl} title={meta.scenarioName} />
      </div>
    </div>
  )
}

export default PublicRecording
