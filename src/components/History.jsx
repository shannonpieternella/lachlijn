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
    <div className="viral-container py-8">
      <div className="viral-card mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="viral-input flex-1">
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
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="viral-input sm:w-20">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button className="viral-button sm:w-auto w-full" onClick={load}>Vernieuwen</button>
        </div>
      </div>

      <div className="space-y-2">
        {loading && (
          <div className="viral-card">Calls laden...</div>
        )}
        {error && (
          <div className="viral-card text-red-400">{error}</div>
        )}
        {!loading && !error && calls.length === 0 && (
          <div className="viral-card">Geen calls gevonden</div>
        )}
        {calls.map((c) => (
          <div key={c._id} className="viral-card p-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl flex-shrink-0">{c.scenarioIcon || '🎭'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{c.scenarioName || 'Onbekend scenario'}</div>
                  <div className="text-viral-text-secondary text-sm truncate">{fmtDate(c.createdAt)} • {c.targetPhone}</div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="text-viral-text-secondary text-sm">{fmtDuration(c.duration)}</div>
                  <div className="px-2 py-1 rounded-full border border-viral-muted text-xs capitalize">{c.status}</div>
                </div>
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
                      await navigator.clipboard.writeText(data.url)
                      alert('Publieke link gekopieerd!')
                    } catch (e) {
                      alert(e.message)
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
