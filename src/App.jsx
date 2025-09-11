import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Components
import LandingPage from './components/LandingPage'
import AuthModal from './components/AuthModal'
import Dashboard from './components/Dashboard'
import PrankCall from './components/PrankCall'
import Pricing from './components/Pricing'
import Profile from './components/Profile'
import Admin from './components/Admin'
import ThankYou from './components/ThankYou'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import Contact from './components/Contact'
import ResponsibleUse from './components/ResponsibleUse'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import PublicRecording from './components/PublicRecording'
import History from './components/History'
import Referral from './components/Referral'
import RegistrationSuccess from './components/RegistrationSuccess'

// Styles
import './viral.css'

// Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function AppContent() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('prankUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // Always try to sync with server profile when token exists
    const token = localStorage.getItem('authToken')
    if (token) {
      fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success && data.user) {
            setUser(data.user)
            try {
              localStorage.setItem('prankUser', JSON.stringify(data.user))
            } catch {}
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleAuth = (userData, isNewRegistration = false) => {
    setUser(userData)
    localStorage.setItem('prankUser', JSON.stringify(userData))
    setShowAuthModal(false)
    
    if (isNewRegistration) {
      navigate('/registration-success') // New users go to success page first
    } else {
      navigate('/dashboard') // Existing users go directly to dashboard
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('prankUser')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-viral-dark flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-viral-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-viral-dark">
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/r/:shareId" 
            element={
              <>
                <PublicRecording />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/ref/:code" 
            element={
              <LandingPage 
                user={user} 
                onAuthClick={(mode = 'register') => { setAuthMode(mode); setShowAuthModal(true) }} 
              />
            } 
          />
          <Route 
            path="/" 
            element={
              <LandingPage 
                user={user} 
                onAuthClick={(mode = 'register') => { setAuthMode(mode); setShowAuthModal(true) }} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <Dashboard user={user} />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/prank" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <PrankCall user={user} />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/pricing" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Pricing user={user} onAuthClick={(mode = 'register') => { setAuthMode(mode); setShowAuthModal(true) }} />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/profile" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <Profile user={user} onUpdateUser={setUser} />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/history" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <History />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/referral" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <Referral user={user} />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/registration-success" 
            element={
              user ? (
                <RegistrationSuccess />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={<Admin user={user} />} 
          />
          <Route 
            path="/thank-you" 
            element={
              user ? (
                <>
                  <Navigation user={user} onLogout={handleLogout} />
                  <ThankYou user={user} onUserUpdate={setUser} />
                  <Footer />
                </>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Privacy />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/terms" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Terms />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <Contact />
                <Footer />
              </>
            } 
          />
          <Route 
            path="/responsible-use" 
            element={
              <>
                <Navigation user={user} onLogout={handleLogout} />
                <ResponsibleUse />
                <Footer />
              </>
            } 
          />
        </Routes>
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
        initialMode={authMode}
      />
    </div>
  )
}

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <AppContent />
      </Router>
    </Elements>
  )
}

export default App
