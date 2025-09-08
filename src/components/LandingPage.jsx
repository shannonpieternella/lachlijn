import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'
import { 
  Phone, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  Star,
  Play,
  Volume2,
  Mic,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Laugh,
  Gift,
  Crown
} from 'lucide-react'

const LandingPage = ({ user, onAuthClick }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    calls: 189432,
    users: 15678,
    laughs: 1234567
  })

  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [selectedScenario, setSelectedScenario] = useState(null)
  
  const testimonials = [
    {
      name: "Emma de Jong",
      text: "Mijn vrienden lagen helemaal dubbel! Deze comedy calls zijn zo realistisch 😂",
      rating: 5,
      avatar: "👩‍🦰"
    },
    {
      name: "Daan Visser",
      text: "Geweldig entertainment! Mijn broer geloofde echt dat hij een prijs had gewonnen 🏆",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Lisa Bakker",
      text: "Ongelofelijk hoe goed de Nederlandse AI is! Perfect voor entertainment! 🇳🇱",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ]

  const [comedyScenarios, setComedyScenarios] = useState([])
  const [scenariosLoading, setScenariosLoading] = useState(true)

  // Fetch scenarios from API
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setScenariosLoading(true)
        const response = await fetch('/api/scenarios')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.scenarios)) {
          console.log('Fetched scenarios:', data.scenarios)
          setComedyScenarios(data.scenarios)
        } else {
          console.error('Failed to fetch scenarios:', data.message)
          setComedyScenarios([])
        }
      } catch (error) {
        console.error('Error fetching scenarios:', error)
        setComedyScenarios([])
      } finally {
        setScenariosLoading(false)
      }
    }

    fetchScenarios()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle direct scenario selection from homepage
  const handleStartComedy = (scenario = null) => {
    if (user) {
      // User is logged in, go directly to comedy call page
      if (scenario) {
        navigate('/prank', { state: { selectedScenario: scenario.id } })
      } else {
        navigate('/prank')
      }
    } else {
      // User not logged in, store scenario and go to registration
      if (scenario) {
        localStorage.setItem('selectedScenario', JSON.stringify(scenario))
      }
      localStorage.setItem('redirectAfterAuth', scenario ? '/prank' : '/prank')
      onAuthClick('register')
    }
  }

  // Handle free trial conversion
  const handleFreeTrial = () => {
    if (user) {
      navigate('/prank')
    } else {
      localStorage.setItem('redirectAfterAuth', '/prank')
      localStorage.setItem('freeTrialIntent', 'true')
      onAuthClick('register')
    }
  }

  
  // Generate demo sources based on first 3 scenarios from database
  // Demo scenarios for homepage preview using new public demo audio route
  const demoScenarios = comedyScenarios.slice(0, 3).map((scenario, index) => {
    let playbackUrl = null
    let hasAudio = false
    
    if (scenario.audioUrl) {
      // Use new public demo audio route
      playbackUrl = `/api/calls/demo/${scenario.audioUrl}/audio`
      hasAudio = true
    }
    
    return {
      ...scenario,
      hasAudio,
      playbackUrl
    }
  })

  // Log final demo scenarios
  console.log('Final demo scenarios:', demoScenarios)


  return (
    <div className="bg-viral-dark">
      {/* Navigation */}
      <motion.nav 
        className="viral-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="viral-container">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Laugh className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold viral-title">Lachlijn.nl</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => scrollToSection('demo')}
                className="viral-button viral-button-ghost hidden md:flex"
              >
                Demo
              </button>
              <button 
                onClick={() => scrollToSection('scenarios')}
                className="viral-button viral-button-ghost hidden md:flex"
              >
                Comedy Calls
              </button>
              {user ? (
                <Link to="/dashboard" className="viral-button viral-button-primary">
                  <Crown className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => onAuthClick('login')} className="viral-button viral-button-ghost">
                    Inloggen
                  </button>
                  <button onClick={handleFreeTrial} className="viral-button viral-button-primary relative">
                    <Gift className="w-4 h-4" />
                    GRATIS Proberen
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">!</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="viral-hero relative overflow-hidden">
        {/* Free Badge */}
        <div className="absolute top-20 right-4 z-20">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2
            }}
          >
            <Gift className="w-4 h-4 inline mr-1" />
            100% GRATIS
          </motion.div>
        </div>

        <div className="viral-container">
          <motion.div 
            className="viral-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="viral-badge mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4" />
              #1 Comedy Call Platform Nederland 🇳🇱
            </motion.div>
            
            <h1 className="viral-title">
              De grappigste manier om je 
              <br />
              <span className="text-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                vrienden te laten lachen
              </span>
              <br />
              🎉
            </h1>
            
            <p className="viral-subtitle mb-8">
              Met onze AI comedy calls kun je je vrienden verrassen met hilarische situaties en unieke stemmen.
              <br />
              <strong className="text-white">Alles 100% vriendelijk en voor entertainment bedoeld.</strong>
            </p>

            {/* FREE CALL HIGHLIGHT */}
            <motion.div 
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">🎁 EERSTE CALL HELEMAAL GRATIS!</div>
                <div className="text-viral-text-secondary">
                  Geen creditcard nodig • Direct beginnen • Veilig & Leuk
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <button 
                onClick={handleFreeTrial}
                className="viral-button viral-button-primary text-lg px-8 py-4 w-full sm:w-auto mx-auto relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  <span className="font-bold">PROBEER NU JE EERSTE COMEDY CALL</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => scrollToSection('demo')}
                  className="viral-button viral-button-secondary"
                >
                  <Volume2 className="w-5 h-5" />
                  Luister Demo Eerst
                </button>
                <button 
                  onClick={() => scrollToSection('scenarios')}
                  className="viral-button viral-button-ghost"
                >
                  <Laugh className="w-5 h-5" />
                  Bekijk Scenario's
                </button>
              </div>
            </motion.div>

            {/* Social Proof Stats */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {stats.calls.toLocaleString()}+
                </div>
                <div className="text-viral-text-secondary">Comedy Calls</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {stats.users.toLocaleString()}+
                </div>
                <div className="text-viral-text-secondary">Gelukkige Gebruikers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                  {stats.laughs.toLocaleString()}+
                </div>
                <div className="text-viral-text-secondary">Lach Momenten</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Value Proposition Section */}
      <section id="features" className="py-20">
        <div className="viral-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="viral-heading">Wat maakt Lachlijn.nl zo bijzonder?</h2>
            <p className="viral-text">
              Dit is geen gemene activiteit – dit is comedy entertainment bedoeld om vrienden en familie even te laten lachen
            </p>
          </motion.div>

          <div className="viral-grid viral-grid-3">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Veilig & Vriendelijk",
                description: "Geen beledigingen of schadelijke content. Alleen comedy calls die wij zelf goedkeuren voor positief entertainment."
              },
              {
                icon: <Laugh className="w-8 h-8" />,
                title: "Entertainment Focus",
                description: "Gericht op plezier, niet op pesten. Alle scenario's zijn bedoeld om mensen aan het lachen te maken."
              },
              {
                icon: <Mic className="w-8 h-8" />,
                title: "100% Nederlandse AI",
                description: "Realistische Nederlandse stem met natuurlijke conversaties voor authentiek entertainment."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Consent & Respect",
                description: "Gebruik alleen bij mensen die van humor houden. Respecteer altijd de grenzen van anderen."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Entertainment",
                description: "Direct beginnen met je gratis call. Geen lange wachttijden, gewoon plezier."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Positieve Scenarios",
                description: "Alleen vrolijke en optimistische scenario's die mensen een glimlach bezorgen."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="viral-card relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-viral-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-viral-text-secondary">{feature.description}</p>
                
                {/* Safety badge for Facebook compliance */}
                {index < 3 && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Demo Section - Hoor Hoe Realistisch Het Klinkt */}
      <section id="scenarios" className="py-20 bg-viral-dark-light relative overflow-hidden">
        {/* Conversion Optimization Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-purple-500/5"></div>
        
        <div className="viral-container relative z-10">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="viral-heading">
              Hoor Hoe Realistisch Het Klinkt
            </h2>
            <p className="viral-text mb-6">
              Onze Nederlandse AI stem is zo natuurlijk, perfect voor vriendelijk entertainment!
              <br />
              <span className="text-green-400 font-semibold">100% veilig • 100% leuk • 100% consent-based</span>
            </p>
          </motion.div>

          <div className="viral-grid viral-grid-3 max-w-6xl mx-auto">
            {scenariosLoading ? (
              // Loading state
              [1, 2, 3].map((index) => (
                <div key={index} className="viral-card viral-card-glow animate-pulse">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-viral-dark-lighter rounded-full mx-auto mb-4"></div>
                    <div className="h-6 bg-viral-dark-lighter rounded mb-2"></div>
                    <div className="h-4 bg-viral-dark-lighter rounded mb-4"></div>
                    <div className="h-10 bg-viral-dark-lighter rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              // Use first 3 scenarios from database with AudioPlayer
              demoScenarios.map((scenario, index) => (
              <motion.div 
                key={index}
                className="viral-card viral-card-glow"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{scenario.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{scenario.name} Demo</h3>
                  <p className="text-viral-text-secondary mb-4">
                    {scenario.userDescription || scenario.description}
                  </p>
                  
                  {scenario.playbackUrl ? (
                    <div className="mb-3">
                      <AudioPlayer
                        src={scenario.playbackUrl}
                        title={`${scenario.name} Demo`}
                      />
                    </div>
                  ) : (
                    <div className="mb-3 p-3 bg-viral-dark-lighter rounded-lg text-viral-text-muted text-sm">
                      Demo niet beschikbaar
                    </div>
                  )}
                  
                  <div className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                    ✓ Entertainment Only
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <button 
              onClick={handleFreeTrial}
              className="viral-button viral-button-primary text-lg"
            >
              <Gift className="w-5 h-5" />
              Probeer Je Eigen Gratis Comedy Call
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="viral-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="viral-heading">Wat Zeggen Onze Gebruikers?</h2>
            <p className="viral-text">Duizenden gelukkige entertainment liefhebbers gingen je voor</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="viral-card text-center"
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-6xl mb-4">
                {testimonials[currentTestimonial].avatar}
              </div>
              
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-xl mb-4 text-viral-text-primary">
                "{testimonials[currentTestimonial].text}"
              </p>
              
              <p className="font-bold text-viral-primary">
                - {testimonials[currentTestimonial].name}
              </p>
            </motion.div>

            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-viral-primary' : 'bg-viral-text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-viral-dark-light to-viral-dark relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        </div>
        
        <div className="viral-container relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="viral-heading mb-6">
              Klaar om je vrienden aan het lachen te maken? 🎉
            </h2>
            <p className="viral-subtitle mb-8">
              Sluit je aan bij duizenden Nederlanders die dagelijks genieten van onze vriendelijke AI comedy calls. 
              <br />
              <strong className="text-green-400">Start vandaag nog met je 100% gratis comedy call!</strong>
            </p>
            
            {/* Final conversion stats */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-sm text-viral-text-secondary">Gratis Start</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">30s</div>
                <div className="text-sm text-viral-text-secondary">Setup Tijd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">∞</div>
                <div className="text-sm text-viral-text-secondary">Lach Garantie</div>
              </div>
            </div>
            
            <button 
              onClick={handleFreeTrial}
              className="viral-button viral-button-primary text-2xl px-16 py-6 relative overflow-hidden group mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-4">
                <Gift className="w-8 h-8" />
                <span className="font-bold">START NU JE GRATIS COMEDY CALL!</span>
                <Sparkles className="w-8 h-8" />
              </div>
            </button>
            
            <p className="text-sm text-viral-text-muted">
              🔒 Geen creditcard nodig • ⚡ Direct na registratie gebruiken • 🎁 1 gratis call gegarandeerd
              <br />
              <span className="text-green-400">100% vriendelijk entertainment • Altijd respectvol</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-viral-dark border-t border-viral-dark-lighter">
        <div className="viral-container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Laugh className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Lachlijn.nl</span>
            </div>
            <p className="text-viral-text-secondary mb-4">
              © 2024 Lachlijn.nl - De #1 AI Comedy Call Platform van Nederland 🇳🇱
            </p>
            <p className="text-xs text-viral-text-muted">
              Vriendelijk entertainment • Respectvolle comedy • Altijd met consent
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
