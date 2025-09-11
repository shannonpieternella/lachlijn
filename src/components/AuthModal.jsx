import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Laugh } from 'lucide-react'

const AuthModal = ({ isOpen, onClose, onAuth, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const referralCode = localStorage.getItem('referralCode')
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            ...(referralCode && { referralCode })
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token)
        
        // Pass user data to parent with registration flag
        const isNewRegistration = mode === 'register'
        onAuth(data.user, isNewRegistration)
        
        // Reset form
        setFormData({ name: '', email: '', password: '' })
      } else {
        // Handle error - you might want to show an error message
        console.error('Auth error:', data.message)
        alert(data.message) // Simple error display - you can make this better
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Sync mode when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login')
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="viral-modal-overlay">
        <motion.div 
          className="viral-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-viral-text-secondary hover:text-viral-text-primary transition-colors rounded-full hover:bg-viral-dark-lighter"
            aria-label="Sluit popup"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Laugh className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welkom Terug!' : 'Start Je Comedy Avontuur!'}
            </h2>
            <p className="text-viral-text-secondary">
              {isLogin 
                ? 'Log in om verder te gaan met comedy calls' 
                : 'Maak een account en krijg 1 gratis comedy call!'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Voor- en Achternaam *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-viral-text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="viral-input pl-12"
                    placeholder="bijv. Jan de Vries"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                Email Adres
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-viral-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="viral-input pl-12"
                  placeholder="jan@example.com"
                  required
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-viral-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="viral-input pl-12 pr-12"
                  placeholder="Minimaal 6 karakters"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-viral-text-muted hover:text-viral-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="viral-button viral-button-primary w-full"
            >
              {loading ? (
                <div className="viral-loading">
                  <div className="viral-spinner" />
                  {isLogin ? 'Inloggen...' : 'Account Aanmaken...'}
                </div>
              ) : (
                <>
                  {isLogin ? 'Inloggen' : 'Gratis Account Aanmaken'}
                  {!isLogin && <span className="ml-2">🎉</span>}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-viral-text-secondary">
              {isLogin ? 'Nog geen account?' : 'Heb je al een account?'}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-viral-primary hover:text-viral-primary-light transition-colors font-medium mt-2"
            >
              {isLogin ? 'Maak er gratis een aan' : 'Log hier in'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">
                    Gratis Welkomstcadeau! 🎁
                  </p>
                  <p className="text-xs text-viral-text-secondary">
                    Krijg 1 gratis comedy call bij aanmelding - geen creditcard nodig!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-viral-text-muted text-center">
            Door een account aan te maken ga je akkoord met onze{' '}
            <span className="text-viral-primary">voorwaarden</span> en{' '}
            <span className="text-viral-primary">privacybeleid</span>.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthModal
