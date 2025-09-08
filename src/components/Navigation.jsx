import { useState } from 'react'
import { motion } from 'framer-motion'
import { Laugh, Menu, X, Home, Zap, CreditCard, User, LogOut, Gift } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

const Navigation = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Comedy Calls', href: '/prank', icon: Zap },
    { name: 'Credits', href: '/pricing', icon: CreditCard },
    { name: 'Profiel', href: '/profile', icon: User },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <nav className="viral-nav sticky top-0 z-50">
      <div className="viral-container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Laugh className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold viral-title">Lachlijn.nl</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isActive(item.href)
                    ? 'bg-viral-primary text-white'
                    : 'text-viral-text-secondary hover:text-viral-text-primary hover:bg-viral-dark-lighter'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu & Credits */}
          <div className="hidden md:flex items-center gap-4">
            {/* Credits Badge */}
            <div className="flex items-center gap-2">
              <div className="viral-badge">
                <Zap className="w-4 h-4" />
                {user?.credits || 0} credits
              </div>
              {user?.credits === 1 && (
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  GRATIS
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-viral-text-secondary">
                  {user?.plan === 'free' ? 'Gratis Plan' : 'Premium'}
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors rounded-full hover:bg-viral-dark-lighter"
                title="Uitloggen"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-viral-text-secondary hover:text-viral-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          className={`md:hidden overflow-hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: mobileMenuOpen ? 'auto' : 0, 
            opacity: mobileMenuOpen ? 1 : 0 
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="py-4 border-t border-viral-dark-lighter">
            <div className="space-y-2">
              {/* User Info */}
              <div className="p-3 viral-card mb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user?.name}</div>
                      <div className="text-sm text-viral-text-secondary">
                        {user?.plan === 'free' ? 'Gratis Plan' : 'Premium'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="viral-badge flex-shrink-0">
                      <Zap className="w-4 h-4" />
                      <span className="ml-1">{user?.credits || 0} credits</span>
                    </div>
                    {user?.credits === 1 && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        GRATIS CALL
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-viral-primary text-white'
                      : 'text-viral-text-secondary hover:text-viral-text-primary hover:bg-viral-dark-lighter'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}

              {/* Logout */}
              <motion.button
                onClick={() => {
                  onLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 text-viral-text-secondary hover:text-viral-primary transition-colors rounded-lg w-full text-left"
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                Uitloggen
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  )
}

export default Navigation
