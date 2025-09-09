import { useEffect, useState } from 'react'
import AudioPlayer from './AudioPlayer'

const History = () => {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    load()
  }, [status, limit])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ limit })
      if (status) params.set('status', status)
      const res = await fetch(`/api/calls?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setCalls(data.calls || [])
    } catch (e) {
      setError(e.message || 'Kon calls niet ophalen')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleString('nl-NL') } catch { return '' }
  }
  const fmtDuration = (sec = 0) => {
    const m = Math.floor(sec / 60)
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 flex-1">
            <option value="">Alle status</option>
            <option value="queued">Queued</option>
            <option value="ringing">Ringing</option>
            <option value="in-progress">In progress</option>
            <option value="forwarding">Forwarding</option>
            <option value="ended">Ended</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="timeout">Timeout</option>
          </select>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 sm:w-24">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors sm:w-auto w-full" onClick={load}>Vernieuwen</button>
        </div>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {loading && (
          <div className="bg-gray-800 p-4 rounded-lg text-white text-center">Calls laden...</div>
        )}
        {error && (
          <div className="bg-red-800 p-4 rounded-lg text-red-200 text-center">{error}</div>
        )}
        {!loading && !error && calls.length === 0 && (
          <div className="bg-gray-800 p-4 rounded-lg text-gray-300 text-center">Geen calls gevonden</div>
        )}
        {calls.map((c) => (
          <div key={c._id} className="bg-gray-900/95 border border-gray-600 rounded-xl p-6 mb-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0 bg-gray-800 p-3 rounded-full">{c.scenarioIcon || '🎭'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-2xl mb-2 break-words bg-gray-800/50 p-2 rounded-lg">{c.scenarioName || 'Onbekend scenario'}</div>
                  <div className="text-gray-200 text-lg mb-2 break-all bg-gray-800/30 p-2 rounded font-mono">{c.targetPhone}</div>
                  <div className="text-gray-300 text-base bg-gray-800/20 p-2 rounded">{fmtDate(c.createdAt)}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-white text-lg bg-blue-600 px-5 py-3 rounded-full font-bold shadow-lg">{fmtDuration(c.duration)}</div>
                <div className={`px-5 py-3 rounded-full text-base font-bold shadow-lg ${
                  c.status === 'ended' ? 'bg-green-600 text-white' :
                  c.status === 'failed' ? 'bg-red-600 text-white' :
                  'bg-orange-600 text-white'
                }`}>{c.status}</div>
              </div>
            </div>
            
            <div className="w-full">
              {c.playbackUrl ? (
                <AudioPlayer
                  src={`${c.playbackUrl}?token=${encodeURIComponent(localStorage.getItem('authToken') || '')}`}
                  title={c.scenarioName || 'Opname'}
                  onShare={async () => {
                    try {
                      const res = await fetch(`/api/calls/${c._id}/share`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ platform: 'link' })
                      })
                      const data = await res.json()
                      if (!data.success) throw new Error(data.message || 'Kon share link niet maken')
                      
                      // Try native sharing first (mobile)
                      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        try {
                          await navigator.share({
                            title: `${c.scenarioName} - Lachlijn.nl`,
                            text: 'Luister naar deze comedy call van Lachlijn.nl!',
                            url: data.url
                          })
                          return
                        } catch (shareError) {
                          // Fall back to clipboard if share cancelled
                        }
                      }
                      
                      // Fallback to clipboard
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(data.url)
                        alert('Publieke link gekopieerd naar klembord!')
                      } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea')
                        textArea.value = data.url
                        textArea.style.position = 'fixed'
                        textArea.style.opacity = '0'
                        document.body.appendChild(textArea)
                        textArea.focus()
                        textArea.select()
                        try {
                          document.execCommand('copy')
                          alert('Publieke link gekopieerd!')
                        } catch (err) {
                          prompt('Kopieer deze link:', data.url)
                        }
                        document.body.removeChild(textArea)
                      }
                    } catch (e) {
                      alert('Fout bij delen: ' + e.message)
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center p-2 bg-viral-dark rounded-lg border border-viral-muted">
                  <span className="text-xs text-viral-text-secondary">Geen opname beschikbaar</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History
