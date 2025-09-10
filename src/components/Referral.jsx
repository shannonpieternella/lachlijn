import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Trophy,
  Target,
  ExternalLink,
  MessageCircle,
  Mail,
  Zap,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react'

const Referral = ({ user }) => {
  const [referralStats, setReferralStats] = useState(null)
  const [copiedItem, setCopiedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch referral stats from API
  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setLoading(false)
          return
        }

        const response = await fetch('/api/referrals/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (data.success) {
          setReferralStats(data.data)
        } else {
          console.error('Failed to fetch referral stats:', data.message)
          // Fallback to default data
          setReferralStats({
            code: user.name ? user.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000) : 'PRANK24',
            totalInvites: 0,
            activeInvites: 0,
            creditsEarned: 0,
            milestones: [],
            nextMilestone: {
              type: 'invite_3',
              threshold: 3,
              remaining: 3,
              credits: 5
            },
            shareUrl: `https://lachlijn.nl/ref/${user.name ? user.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000) : 'PRANK24'}`,
            recentInvites: []
          })
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error)
        // Fallback to default data
        setReferralStats({
          code: user.name ? user.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000) : 'PRANK24',
          totalInvites: 0,
          activeInvites: 0,
          creditsEarned: 0,
          milestones: [],
          nextMilestone: {
            type: 'invite_3',
            threshold: 3,
            remaining: 3,
            credits: 5
          },
          shareUrl: `https://lachlijn.nl/ref/${user.name ? user.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000) : 'PRANK24'}`,
          recentInvites: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReferralStats()
  }, [user])

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(item)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const shareVia = (platform) => {
    const shareText = `🎭 Kom gratis prank calls maken op Lachlijn.nl! Gebruik mijn code ${referralStats.code} voor gratis toegang! `
    const shareUrl = referralStats.shareUrl
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      email: `mailto:?subject=${encodeURIComponent('Gratis Prank Calls!')}&body=${encodeURIComponent(shareText + shareUrl)}`
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  const milestoneRewards = {
    invite_3: { icon: '🎯', credits: 5, title: '3 Vrienden', description: '5 gratis calls' },
    invite_5: { icon: '🚀', credits: 10, title: '5 Vrienden', description: '10 gratis calls' },
    invite_10: { icon: '👑', credits: 25, title: '10 Vrienden', description: '25 gratis calls' },
    invite_25: { icon: '💎', credits: 50, title: '25 Vrienden', description: 'Unlimited week!' }
  }

  if (loading) {
    return (
      <div className="viral-container py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-viral-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-viral-text-secondary">Laden van je referral stats...</p>
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
            <Users className="w-4 h-4" />
            Viral Invite System
          </div>
          <h1 className="viral-heading">Nodig Vrienden Uit 🚀</h1>
          <p className="viral-text">
            Verdien gratis prank calls door je vrienden uit te nodigen! 
            Hoe meer vrienden, hoe meer gratis calls! 
          </p>
        </div>

        {/* Quick Stats */}
        <div className="viral-grid viral-grid-2 lg:grid-cols-4 mb-8">
          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
          >
            <Users className="w-8 h-8 text-viral-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-viral-primary mb-1">{referralStats.totalInvites}</div>
            <div className="text-sm text-viral-text-secondary">Vrienden Uitgenodigd</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
          >
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-yellow-400 mb-1">{referralStats.creditsEarned}</div>
            <div className="text-sm text-viral-text-secondary">Credits Verdiend</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
          >
            <Trophy className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-orange-400 mb-1">{referralStats.milestones.length}</div>
            <div className="text-sm text-viral-text-secondary">Milestones Behaald</div>
          </motion.div>

          <motion.div 
            className="viral-card text-center"
            whileHover={{ y: -5 }}
          >
            <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-400 mb-1">
              {referralStats.nextMilestone?.remaining || 0}
            </div>
            <div className="text-sm text-viral-text-secondary">Tot Volgende Milestone</div>
          </motion.div>
        </div>

        {/* Next Milestone Progress */}
        {referralStats.nextMilestone && (
          <motion.div
            className="viral-card mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Crown className="w-6 h-6 text-viral-primary" />
                Volgende Milestone
              </h2>
              <div className="text-sm text-viral-text-secondary">
                {referralStats.totalInvites} / {referralStats.nextMilestone.threshold}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{milestoneRewards[referralStats.nextMilestone.type]?.title}</span>
                <span className="text-viral-primary font-bold">
                  +{referralStats.nextMilestone.credits} credits
                </span>
              </div>
              <div className="w-full bg-viral-dark-lighter rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-viral-primary to-viral-secondary h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${(referralStats.totalInvites / referralStats.nextMilestone.threshold) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-viral-text-secondary text-sm">
                Nog <strong>{referralStats.nextMilestone.remaining} vrienden</strong> uitnodigen 
                voor <strong>{referralStats.nextMilestone.credits} gratis credits!</strong>
              </p>
            </div>
          </motion.div>
        )}

        <div className="viral-grid viral-grid-2 gap-8">
          {/* Share Section */}
          <div className="viral-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Share2 className="w-6 h-6 text-viral-primary" />
              Deel Je Code
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Je Referral Code
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 p-4 bg-viral-dark-lighter rounded-lg font-mono text-xl text-center border-2 border-viral-primary">
                    {referralStats.code}
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralStats.code, 'code')}
                    className="viral-button viral-button-ghost px-4"
                  >
                    {copiedItem === 'code' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Deel Link
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-viral-dark-lighter rounded-lg text-sm truncate">
                    {referralStats.shareUrl}
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralStats.shareUrl, 'url')}
                    className="viral-button viral-button-ghost px-4"
                  >
                    {copiedItem === 'url' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <p className="text-sm text-viral-text-secondary mb-3">Deel via:</p>
              <div className="grid grid-cols-5 gap-3">
                <button 
                  onClick={() => shareVia('whatsapp')}
                  className="viral-button viral-button-ghost aspect-square flex items-center justify-center"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => shareVia('telegram')}
                  className="viral-button viral-button-ghost aspect-square flex items-center justify-center"
                  title="Telegram"
                >
                  ✈️
                </button>
                
                <button 
                  onClick={() => shareVia('twitter')}
                  className="viral-button viral-button-ghost aspect-square flex items-center justify-center"
                  title="Twitter"
                >
                  🐦
                </button>
                
                <button 
                  onClick={() => shareVia('facebook')}
                  className="viral-button viral-button-ghost aspect-square flex items-center justify-center"
                  title="Facebook"
                >
                  📘
                </button>
                
                <button 
                  onClick={() => shareVia('email')}
                  className="viral-button viral-button-ghost aspect-square flex items-center justify-center"
                  title="Email"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="viral-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-viral-primary" />
              Viral Milestones
            </h2>
            
            <div className="space-y-4">
              {Object.entries(milestoneRewards).map(([type, milestone]) => {
                const isAchieved = referralStats.milestones.some(m => m.type === type)
                const isCurrent = referralStats.nextMilestone?.type === type
                
                return (
                  <motion.div
                    key={type}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isAchieved 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : isCurrent 
                          ? 'bg-viral-primary/10 border-viral-primary/30 ring-2 ring-viral-primary/20' 
                          : 'bg-viral-dark-lighter border-gray-600'
                    }`}
                    whileHover={{ scale: isAchieved || isCurrent ? 1.02 : 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{milestone.icon}</div>
                        <div>
                          <div className="font-bold">{milestone.title}</div>
                          <div className="text-sm text-viral-text-secondary">
                            {milestone.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isAchieved && (
                          <div className="text-green-400 text-sm font-bold">
                            ✓ Behaald!
                          </div>
                        )}
                        {isCurrent && (
                          <div className="text-viral-primary text-sm font-bold">
                            🎯 Huidig Doel
                          </div>
                        )}
                        <div className="text-xs text-viral-text-muted">
                          +{milestone.credits} credits
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Referral Dashboard */}
        {referralStats.recentInvites.length > 0 && (
          <motion.div
            className="viral-card mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-viral-primary" />
              Mijn Referrals Dashboard
            </h2>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-viral-primary">{referralStats.totalInvites}</div>
                <div className="text-xs text-viral-text-secondary">Totaal Gereferreerd</div>
              </div>
              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {referralStats.recentInvites.filter(i => i.hasPurchased).length}
                </div>
                <div className="text-xs text-viral-text-secondary">Hebben Gekocht</div>
              </div>
              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{referralStats.creditsEarned}</div>
                <div className="text-xs text-viral-text-secondary">Credits Verdiend</div>
              </div>
              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {referralStats.recentInvites.filter(i => !i.hasPurchased).length}
                </div>
                <div className="text-xs text-viral-text-secondary">Nog Niet Gekocht</div>
              </div>
            </div>
            
            {/* Referrals List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-viral-text mb-3">Alle Referrals</h3>
              {referralStats.recentInvites.map((invite, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  invite.hasPurchased 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-viral-dark-lighter border-gray-600'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      invite.hasPurchased ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {invite.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{invite.name}</div>
                      <div className="text-sm text-viral-text-secondary">
                        {invite.email}
                      </div>
                      <div className="text-xs text-viral-text-muted">
                        Gereferreerd: {new Date(invite.invitedAt).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {invite.hasPurchased ? (
                      <>
                        <div className="text-green-400 font-bold text-sm mb-1">
                          ✅ +{invite.creditsEarned} credit verdiend!
                        </div>
                        <div className="text-xs text-viral-text-muted">
                          Gekocht: {new Date(invite.rewardedAt).toLocaleDateString('nl-NL')}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-orange-400 font-bold text-sm mb-1">
                          ⏳ Wacht op aankoop
                        </div>
                        <div className="text-xs text-viral-text-muted">
                          Je krijgt 1 credit wanneer ze kopen
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Helpful tip */}
            <div className="mt-6 p-4 bg-viral-primary/10 border border-viral-primary/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-viral-primary">💡</div>
                <div className="text-sm">
                  <div className="font-medium text-viral-text mb-1">Hoe werkt het?</div>
                  <div className="text-viral-text-secondary">
                    Je verdient <strong>1 gratis credit</strong> zodra iemand die jij hebt gereferreerd 
                    voor het eerst credits koopt. Nieuwe gebruikers krijgen 1 gratis credit bij registratie.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="viral-card bg-gradient-to-r from-viral-primary/20 to-viral-secondary/20 border-viral-primary/30">
            <h3 className="text-2xl font-bold mb-4">
              💡 Pro Tip: Deel Je Beste Prank!
            </h3>
            <p className="text-viral-text-secondary mb-6">
              Laat vrienden je grappigste prank opname horen - ze worden gegarandeerd nieuwsgierig en melden zich aan!
            </p>
            <a href="/dashboard" className="viral-button viral-button-primary">
              <Star className="w-5 h-5" />
              Bekijk Je Prank Opnames
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Referral