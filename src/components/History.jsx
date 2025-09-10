import { useEffect, useState } from 'react'
import { Share } from 'lucide-react'

const History = () => {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(50)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [status, limit])

  const token = () => localStorage.getItem('authToken') || ''

  async function load() {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ limit: String(limit) })
      if (status) params.set('status', status)
      const res = await fetch(`/api/calls?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setCalls(Array.isArray(data.calls) ? data.calls : [])
    } catch (e) {
      setError(e.message || 'Kon calls niet ophalen')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (iso) => { try { return new Date(iso).toLocaleString('nl-NL') } catch { return '' } }
  const fmtDuration = (sec = 0) => `${Math.floor((sec || 0)/60)}:${String((sec||0)%60).padStart(2,'0')}`

  const shareCall = async (call) => {
    try {
      const res = await fetch(`/api/calls/${call._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({ platform: 'link' })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Kon share link niet maken')
      
      const shareText = `🎭 Luister naar deze hilarische prank call! ${data.url}`
      
      if (navigator.share) {
        await navigator.share({
          title: `Prank Call: ${call.scenarioName}`,
          text: shareText,
          url: data.url
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        alert('Publieke link gekopieerd naar clipboard! 📋')
      }
    } catch (e) {
      alert(`Fout bij delen: ${e.message}`)
    }
  }

  const filtered = calls.filter(c => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const hay = `${c.scenarioName || ''} ${c.targetPhone || ''}`.toLowerCase()
    return hay.includes(q)
  })

  return (
    <div className="min-h-screen bg-viral-dark text-white">
      <header className="sticky top-0 z-10 bg-viral-dark/90 backdrop-blur border-b border-viral-border">
        <div className="viral-container py-3">
          <h1 className="text-lg font-semibold">Alle Calls</h1>
        </div>
      </header>

      <div className="viral-container py-4">
        {/* Filters */}
        <div className="bg-viral-dark-card border border-viral-border rounded-xl p-4 flex flex-wrap gap-3 mb-4">
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op scenario of nummer"
            className="viral-input flex-1 min-w-[220px]"
          />
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="viral-select w-44"
          >
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
          <select 
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="viral-select w-28"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button onClick={load} className="viral-button viral-button-ghost">🔄 Vernieuwen</button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="viral-card text-center">⏳ Laden...</div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-200 rounded-xl p-4 mb-4 text-center">❌ {error}</div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="viral-card text-center">
            <div className="text-5xl mb-3">🎭</div>
            <div className="font-semibold mb-1">Geen calls gevonden</div>
            <div className="text-viral-text-secondary mb-3">Maak je eerste comedy call!</div>
            <a href="/prank" className="viral-button viral-button-primary">🎉 Start Nu</a>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filtered.map((c) => {
            const audioSrc = c.playbackUrl ? `${c.playbackUrl}?token=${encodeURIComponent(token())}` : null
            const canShare = c.status === 'ended' && audioSrc
            return (
              <div key={c._id} className="bg-viral-dark-card border border-viral-border rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:items-center">
                  {/* Primary */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl">{c.scenarioIcon || '🎭'}</div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.scenarioName || 'Onbekend scenario'}</div>
                      <div className="text-sm text-viral-text-secondary">{c.formattedPhone || c.targetPhone || ''}</div>
                    </div>
                  </div>
                  <div className="text-sm text-viral-text-secondary">{fmtDate(c.createdAt)}</div>
                  <div className="text-sm">Duur: {fmtDuration(c.duration)}</div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full border inline-block ${
                      c.status === 'ended' ? 'text-green-400 border-green-600/40 bg-green-500/10' :
                      (c.status === 'failed' || c.status === 'cancelled') ? 'text-red-400 border-red-600/40 bg-red-500/10' :
                      'text-yellow-400 border-yellow-600/40 bg-yellow-500/10'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="md:justify-self-end w-full md:w-52">
                    {audioSrc ? (
                      <audio className="w-full h-8" controls preload="none" src={audioSrc} />
                    ) : (
                      <span className="text-sm text-viral-text-muted">Geen opname</span>
                    )}
                  </div>
                  <div className="md:justify-self-end">
                    {canShare ? (
                      <button 
                        onClick={() => shareCall(c)}
                        className="viral-button viral-button-ghost px-3 py-2 text-sm flex items-center gap-2"
                        title="Deel deze prank call"
                      >
                        <Share className="w-4 h-4" />
                        Deel
                      </button>
                    ) : (
                      <div className="w-16"></div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default History
