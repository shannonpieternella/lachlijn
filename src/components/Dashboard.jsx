import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Phone, 
  TrendingUp, 
  Calendar,
  Play,
  Share,
  Download,
  Star,
  Trophy,
  Target,
  Clock,
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AudioPlayer from './AudioPlayer'

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    successRate: 0,
    totalLaughs: 0,
    favoriteScenario: 'Geen calls nog'
  })
  const [recentCalls, setRecentCalls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats and recent calls in parallel
      const [statsResponse, callsResponse] = await Promise.all([
        fetch('/api/calls/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch('/api/calls/history?limit=3', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }
      }

      if (callsResponse.ok) {
        const callsData = await callsResponse.json()
        if (callsData.success) {
          setRecentCalls(callsData.calls.map(call => ({
            id: call._id,
            scenario: call.scenarioName || 'Unknown Scenario',
            icon: call.scenarioIcon || '📞',
            target: call.targetPhone ? call.targetPhone.replace(/(\d{2})(\d{1})(\d{8})/, '+$1 $2 ****$3'.substring(0, 14)) : 'Unknown',
            date: formatDate(call.createdAt),
            duration: formatDuration(call.duration || 0),
            status: call.status,
            rating: call.rating || (call.status === 'completed' ? 5 : 3),
            playbackUrl: call.playbackUrl || null
          })))
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHrs < 1) return 'Net voltooid'
    if (diffHrs < 24) return `${diffHrs} uur geleden`
    if (diffDays === 1) return 'Gisteren'
    return `${diffDays} dagen geleden`
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Fallback mock data for empty state
  const mockRecentCalls = [
    {
      id: 1,
      scenario: 'Pizza Bestelling',
      icon: '🍕',
      target: '+31 6 ****678',
      date: '2 uur geleden',
      duration: '3:45',
      status: 'success',
      rating: 5
    },
    {
      id: 2,
      scenario: 'Radio DJ',
      icon: '📻',
      target: '+31 6 ****123',
      date: 'Gisteren',
      duration: '6:12',
      status: 'success',
      rating: 5
    },
    {
      id: 3,
      scenario: 'Verwarde Oma',
      icon: '👵',
      target: '+31 6 ****456',
      date: '2 dagen geleden',
      duration: '4:33',
      status: 'success',
      rating: 4
    }
  ]

  // Dynamic achievements based on stats
  const achievements = [
    { 
      name: 'Eerste Prank', 
      icon: '🎉', 
      description: 'Je eerste prank call voltooid!', 
      earned: stats.totalCalls > 0 
    },
    { 
      name: 'Call Master', 
      icon: '📞', 
      description: '10 prank calls voltooid', 
      earned: stats.totalCalls >= 10 
    },
    { 
      name: 'Succes Expert', 
      icon: '⭐', 
      description: '80% succes rate behalen', 
      earned: stats.successRate >= 80 
    },
    { 
      name: 'Comedy King', 
      icon: '👑', 
      description: '50 succesvolle pranks', 
      earned: stats.totalCalls >= 50 
    },
  ]

  return (
    <div className="viral-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="viral-heading">Welkom terug, {user.name}! 👋</h1>
          <p className="viral-text">
            Klaar voor meer pranks? Hier is een overzicht van jouw prank avonturen!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="viral-grid viral-grid-2 lg:grid-cols-4 mb-8">
          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-viral-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-viral-primary mb-1">{user.credits}</div>
            <div className="text-sm text-viral-text-secondary">Credits Over</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalCalls}</div>
            <div className="text-sm text-viral-text-secondary">Totaal Calls</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.successRate}%</div>
            <div className="text-sm text-viral-text-secondary">Succes Rate</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.totalLaughs}</div>
            <div className="text-sm text-viral-text-secondary">Lach Momenten</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="viral-card mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <Target className="w-6 h-6 text-viral-primary" />
            Snel Aan De Slag
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.a
              href="/prank"
              className="viral-button viral-button-primary flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-5 h-5" />
              Nieuwe Prank Call
            </motion.a>
            
            <motion.a
              href="/pricing"
              className="viral-button viral-button-secondary flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="w-5 h-5" />
              Credits Bijkopen
            </motion.a>
            
            <motion.button
              onClick={() => {
                const referralCode = user.referral?.code || user._id
                const shareUrl = `${window.location.origin}/ref/${referralCode}`
                const shareText = `🎭 Check deze hilarische AI prank call app! Krijg 1 gratis call bij aanmelding! ${shareUrl}`
                
                if (navigator.share) {
                  navigator.share({
                    title: 'Lachlijn.nl - AI Comedy Calls',
                    text: shareText,
                    url: shareUrl
                  })
                } else {
                  navigator.clipboard.writeText(shareText).then(() => {
                    alert('Referral link gekopieerd naar clipboard! 📋')
                  }).catch(() => {
                    alert(`Deel deze link: ${shareUrl}`)
                  })
                }
              }}
              className="viral-button viral-button-ghost flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5" />
              Deel met Vrienden
            </motion.button>
          </div>
        </div>

        <div className="viral-grid viral-grid-2 gap-8">
          {/* Recent Calls */}
          <div className="viral-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-viral-primary" />
              Recente Prank Calls
            </h2>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="viral-spinner mx-auto mb-4"></div>
                  <p>Recente calls laden...</p>
                </div>
              ) : recentCalls.length > 0 ? (
                recentCalls.map((call) => (
                  <motion.div
                    key={call.id}
                    className="p-4 bg-viral-dark-lighter rounded-lg overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">{call.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{call.scenario}</div>
                          <div className="text-sm text-viral-text-secondary">
                            {call.target} • {call.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-viral-text-secondary">{call.duration}</div>
                          <div className="flex">
                            {[...Array(call.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <button className="p-1 text-viral-text-secondary hover:text-viral-primary transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      {call.playbackUrl ? (
                        <AudioPlayer
                          src={`${call.playbackUrl}?token=${encodeURIComponent(localStorage.getItem('authToken') || '')}`}
                          title={call.scenario}
                          onShare={async () => {
                            try {
                              const res = await fetch(`/api/calls/${call.id}/share`, {
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
                          <Play className="w-4 h-4 text-viral-text-secondary mr-2" />
                          <span className="text-xs text-viral-text-secondary">Geen opname beschikbaar</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-viral-text-muted mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Nog geen prank calls</h3>
                  <p className="text-viral-text-secondary mb-4">Start je eerste prank call om hier activiteit te zien!</p>
                  <Link to="/prank" className="viral-button viral-button-primary">
                    Eerste Prank Call
                  </Link>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/history" className="viral-button viral-button-ghost">
                Bekijk Alle Calls
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div className="viral-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-viral-primary" />
              Prestaties
            </h2>
            
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    achievement.earned 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-viral-dark-lighter opacity-60'
                  }`}
                  whileHover={{ scale: achievement.earned ? 1.02 : 1 }}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-viral-text-secondary">
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.earned && (
                    <div className="text-green-400">
                      ✓
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Favorite Scenario */}
        <motion.div 
          className="viral-card mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <Star className="w-6 h-6 text-viral-primary" />
            Jouw Favoriete Scenario
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🍕</div>
              <div>
                <div className="text-lg font-bold">{stats.favoriteScenario}</div>
                <div className="text-viral-text-secondary">
                  {stats.totalCalls > 0 
                    ? `${stats.totalCalls} calls gemaakt • ${stats.successRate}% succes rate`
                    : 'Start je eerste prank call!'
                  }
                </div>
              </div>
            </div>
            
            <Link to="/prank" className="viral-button viral-button-primary">
              Gebruik Weer
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard
