import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Music,
  Filter,
  Search,
  Calendar,
  Star,
  Download,
  Share2,
  Play,
  Clock,
  TrendingUp,
  Users,
  Trophy,
  Eye,
  Heart
} from 'lucide-react'
import AudioPlayer from './AudioPlayer'

const PrankLibrary = ({ user }) => {
  const [calls, setCalls] = useState([])
  const [filteredCalls, setFilteredCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all') // all, successful, shared, liked
  const [sortBy, setSortBy] = useState('date') // date, duration, rating, shares
  const [selectedCall, setSelectedCall] = useState(null)
  const [stats, setStats] = useState({})

  // Mock data - replace with API calls
  useEffect(() => {
    setTimeout(() => {
      const mockCalls = [
        {
          id: 'call_1',
          scenarioId: 'pizza-order',
          scenarioName: 'Pizza Bestelling',
          scenarioIcon: '🍕',
          targetPhone: '+31 6 ****678',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 225, // 3:45
          status: 'ended',
          userRating: 5,
          wasSuccessful: true,
          recording: {
            isAvailable: true,
            url: 'mock-audio-url-1',
            duration: 225,
            downloadCount: 3,
            shareCount: 12,
            isPublic: false,
            allowSharing: true
          }
        },
        {
          id: 'call_2',
          scenarioId: 'radio-dj',
          scenarioName: 'Radio DJ',
          scenarioIcon: '📻',
          targetPhone: '+31 6 ****123',
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 372, // 6:12
          status: 'ended',
          userRating: 5,
          wasSuccessful: true,
          recording: {
            isAvailable: true,
            url: 'mock-audio-url-2',
            duration: 372,
            downloadCount: 7,
            shareCount: 28,
            isPublic: true,
            allowSharing: true
          }
        },
        {
          id: 'call_3',
          scenarioId: 'wrong-grandma',
          scenarioName: 'Verwarde Oma',
          scenarioIcon: '👵',
          targetPhone: '+31 6 ****456',
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          duration: 273, // 4:33
          status: 'ended',
          userRating: 4,
          wasSuccessful: true,
          recording: {
            isAvailable: true,
            url: 'mock-audio-url-3',
            duration: 273,
            downloadCount: 1,
            shareCount: 5,
            isPublic: false,
            allowSharing: true
          }
        }
      ]

      setCalls(mockCalls)
      setFilteredCalls(mockCalls)
      
      // Calculate stats
      const totalShares = mockCalls.reduce((sum, call) => sum + (call.recording?.shareCount || 0), 0)
      const totalDownloads = mockCalls.reduce((sum, call) => sum + (call.recording?.downloadCount || 0), 0)
      const avgRating = mockCalls.reduce((sum, call) => sum + (call.userRating || 0), 0) / mockCalls.length
      const totalDuration = mockCalls.reduce((sum, call) => sum + call.duration, 0)
      
      setStats({
        totalCalls: mockCalls.length,
        totalShares: totalShares,
        totalDownloads: totalDownloads,
        avgRating: avgRating,
        totalDuration: totalDuration,
        successfulCalls: mockCalls.filter(c => c.wasSuccessful).length
      })
      
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort calls
  useEffect(() => {
    let filtered = [...calls]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(call => 
        call.scenarioName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.targetPhone.includes(searchQuery)
      )
    }

    // Category filter
    switch (filterBy) {
      case 'successful':
        filtered = filtered.filter(call => call.wasSuccessful)
        break
      case 'shared':
        filtered = filtered.filter(call => call.recording?.shareCount > 0)
        break
      case 'liked':
        filtered = filtered.filter(call => call.userRating >= 4)
        break
    }

    // Sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        break
      case 'duration':
        filtered.sort((a, b) => b.duration - a.duration)
        break
      case 'rating':
        filtered.sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
        break
      case 'shares':
        filtered.sort((a, b) => (b.recording?.shareCount || 0) - (a.recording?.shareCount || 0))
        break
    }

    setFilteredCalls(filtered)
  }, [calls, searchQuery, filterBy, sortBy])

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleShare = (platform) => {
    console.log(`Shared via ${platform}`)
  }

  const handleLike = (callId) => {
    console.log(`Liked call ${callId}`)
  }

  const handleDownload = (callId) => {
    console.log(`Downloaded call ${callId}`)
  }

  if (loading) {
    return (
      <div className="viral-container py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-viral-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-viral-text-secondary">Laden van je prank bibliotheek...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="viral-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="viral-badge mb-4">
            <Music className="w-4 h-4" />
            Prank Bibliotheek
          </div>
          <h1 className="viral-heading">Jouw Prank Opnames 🎧</h1>
          <p className="viral-text">
            Luister terug naar je beste pranks, deel ze met vrienden en bouw je eigen viral collectie!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="viral-grid viral-grid-2 lg:grid-cols-4 mb-8">
          <motion.div className="viral-card text-center" whileHover={{ y: -5 }}>
            <Play className="w-8 h-8 text-viral-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-viral-primary mb-1">{stats.totalCalls}</div>
            <div className="text-sm text-viral-text-secondary">Totaal Calls</div>
          </motion.div>

          <motion.div className="viral-card text-center" whileHover={{ y: -5 }}>
            <Share2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalShares}</div>
            <div className="text-sm text-viral-text-secondary">Keer Gedeeld</div>
          </motion.div>

          <motion.div className="viral-card text-center" whileHover={{ y: -5 }}>
            <Download className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalDownloads}</div>
            <div className="text-sm text-viral-text-secondary">Downloads</div>
          </motion.div>

          <motion.div className="viral-card text-center" whileHover={{ y: -5 }}>
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.avgRating?.toFixed(1)}</div>
            <div className="text-sm text-viral-text-secondary">Gemiddelde Score</div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="viral-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-viral-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek scenarios of nummers..."
                className="viral-input pl-10"
              />
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="viral-select min-w-[150px]"
            >
              <option value="all">Alle Calls</option>
              <option value="successful">Succesvol</option>
              <option value="shared">Gedeeld</option>
              <option value="liked">Hoog Gewaardeerd</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="viral-select min-w-[150px]"
            >
              <option value="date">Nieuwste Eerst</option>
              <option value="duration">Langste Eerst</option>
              <option value="rating">Hoogst Gewaardeerd</option>
              <option value="shares">Meest Gedeeld</option>
            </select>
          </div>
        </div>

        {/* Selected Call Player */}
        {selectedCall && (
          <div className="mb-8">
            <AudioPlayer
              call={selectedCall}
              onShare={handleShare}
              onLike={handleLike}
              onDownload={handleDownload}
            />
          </div>
        )}

        {/* Calls Grid */}
        {filteredCalls.length === 0 ? (
          <div className="viral-card text-center py-12">
            <Music className="w-16 h-16 text-viral-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Geen opnames gevonden</h3>
            <p className="text-viral-text-secondary mb-6">
              {searchQuery || filterBy !== 'all' 
                ? 'Probeer andere zoekfilters' 
                : 'Maak je eerste prank call om opnames te krijgen!'}
            </p>
            {!searchQuery && filterBy === 'all' && (
              <a href="/prank" className="viral-button viral-button-primary">
                <Play className="w-5 h-5" />
                Start Je Eerste Prank
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                className={`viral-card cursor-pointer transition-all ${
                  selectedCall?.id === call.id ? 'ring-2 ring-viral-primary bg-viral-primary/5' : 'hover:border-viral-primary/50'
                }`}
                onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-viral-primary rounded-full flex items-center justify-center text-white text-xl">
                      {call.scenarioIcon}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-1">{call.scenarioName}</h3>
                      <div className="flex items-center gap-4 text-sm text-viral-text-secondary">
                        <span>{call.targetPhone}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(call.startedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (call.userRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-viral-text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {call.recording?.shareCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {call.recording?.downloadCount || 0}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      {selectedCall?.id === call.id ? (
                        <div className="w-8 h-8 bg-viral-primary rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-viral-dark-lighter rounded-full flex items-center justify-center hover:bg-viral-primary/20 transition-colors">
                          <Play className="w-4 h-4 text-viral-text-muted ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Viral CTA */}
        <motion.div
          className="viral-card mt-12 bg-gradient-to-r from-viral-primary/20 to-viral-secondary/20 border-viral-primary/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Trophy className="w-12 h-12 text-viral-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Deel Je Beste Pranks & Verdien Credits! 🚀
          </h3>
          <p className="text-viral-text-secondary mb-6 max-w-2xl mx-auto">
            Elke keer dat iemand jouw gedeelde prank beluistert en zich aanmeldt, 
            krijg jij <strong>2 gratis credits</strong>! Plus, de grappigste pranks krijgen een plekje 
            in onze Hall of Fame.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/referral" className="viral-button viral-button-primary">
              <Users className="w-5 h-5" />
              Bekijk Referral Stats
            </a>
            <a href="/prank" className="viral-button viral-button-secondary">
              <TrendingUp className="w-5 h-5" />
              Maak Nieuwe Prank
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PrankLibrary