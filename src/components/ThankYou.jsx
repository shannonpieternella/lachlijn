import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle,
  Zap,
  ArrowRight,
  Loader,
  Crown,
  Star,
  Heart
} from 'lucide-react'
import stripeService from '../services/stripeService'

const ThankYou = ({ user, onUserUpdate }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [baselineCredits] = useState(user?.credits || 0)
  const [isProcessing, setIsProcessing] = useState(false) // Prevent double processing

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError('Geen betaling sessie gevonden')
      setVerifying(false)
      return
    }

    // EMERGENCY FIX: Use sessionStorage to prevent any duplicate processing
    const processingKey = `payment_processing_${sessionId}`
    if (sessionStorage.getItem(processingKey) === 'true') {
      console.log('🛑 EMERGENCY STOP: Payment already processing for session:', sessionId)
      setVerifying(false)
      return
    }

    if (!isProcessing) {
      console.log('🚀 ThankYou: useEffect triggered, starting verification for:', sessionId)
      sessionStorage.setItem(processingKey, 'true')
      verifyPayment(sessionId)
    }
  }, [searchParams]) // REMOVED isProcessing from dependencies to prevent infinite loop

  const verifyPayment = async (sessionId) => {
    const processingKey = `payment_processing_${sessionId}`
    
    if (isProcessing) {
      console.log('⏸️ ThankYou: Already processing, skipping duplicate call')
      return
    }
    
    setIsProcessing(true)
    try {
      console.log('🔍 ThankYou: Starting payment verification for session:', sessionId)
      console.log('🔍 ThankYou: Current user credits before verification:', user?.credits)
      
      const result = await stripeService.verifyPayment(sessionId)
      console.log('🔍 ThankYou: Verification result:', result)
      
      if (result.success && result.verified) {
        console.log('✅ ThankYou: Payment verified successfully')
        console.log('📊 ThankYou: Credits from server:', result.credits)
        console.log('📊 ThankYou: User data from server:', result.user)
        
        setPaymentData({
          credits: result.credits,
          message: result.message
        })
        
        // Update user data with fresh data from server (server already added credits)
        if (onUserUpdate && result.user) {
          // Use exact user data from server (credits already updated)
          console.log('🔄 ThankYou: Updating user with server data:', result.user.credits, 'credits')
          onUserUpdate(result.user)
        } else if (onUserUpdate) {
          console.log('⚠️ ThankYou: No user data from server, fetching fresh data')
          // Fallback: refresh user data from server instead of manual calculation
          // This prevents double credit display issues
          fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              onUserUpdate(data.user)
            }
          })
          .catch(err => console.error('Failed to refresh user data:', err))
        }
      } else {
        // Fallback: treat as pending (webhook will credit). Start polling profile.
        setPending(true)
        pollForCreditIncrease()
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      // If verify endpoint not available (404) or other issues, do not error the UI.
      setPending(true)
      pollForCreditIncrease()
    } finally {
      // EMERGENCY FIX: Clear sessionStorage flag when processing is complete
      sessionStorage.removeItem(processingKey)
      setVerifying(false)
      setIsProcessing(false)
    }
  }

  // Poll backend profile to detect credits added by webhook (up to ~60s)
  const pollForCreditIncrease = async () => {
    const start = Date.now()
    const timeoutMs = 60000
    const intervalMs = 3000

    const check = async () => {
      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
        if (res.ok) {
          const data = await res.json()
          const currentCredits = data?.user?.credits ?? baselineCredits
          if (currentCredits > baselineCredits) {
            // Credits arrived via webhook
            setPaymentData({ credits: currentCredits - baselineCredits, message: 'Credits toegevoegd via webhook' })
            if (onUserUpdate) onUserUpdate(data.user)
            setPending(false)
            return
          }
        }
      } catch {}
      if (Date.now() - start < timeoutMs) {
        setTimeout(check, intervalMs)
      } else {
        // Give a friendly non-error message
        setPending(false)
        setPaymentData({ credits: 0, message: 'Betaling verwerkt. Credits worden binnen enkele minuten zichtbaar.' })
      }
    }
    setTimeout(check, intervalMs)
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  if (verifying) {
    return (
      <div className="viral-container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="viral-card">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-viral-primary" />
            <h2 className="text-xl font-bold mb-2">Betaling Verifiëren...</h2>
            <p className="text-viral-text-secondary">
              Even geduld terwijl we je betaling verwerken
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Never show a hard error UI; fallback to pending message handled below

  return (
    <div className="viral-container py-16">
      <div className="max-w-md mx-auto text-center">
        <motion.div 
          className="viral-card relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          {/* Success Animation Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-viral-primary/5 -z-10"></div>
          
          {/* Success Icon */}
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-viral-primary bg-clip-text text-transparent">
              Bedankt! 🎉
            </h1>
            <p className="text-viral-text-secondary mb-6">
              Je betaling is succesvol verwerkt!
            </p>
          </motion.div>

          {/* Credits Info */}
          {paymentData && (
            <motion.div
              className="bg-viral-dark-lighter rounded-lg p-6 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-viral-primary rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-viral-primary">
                    {paymentData.credits > 0 ? `+${paymentData.credits} Credits` : 'Betaling verwerkt'}
                  </div>
                  <div className="text-sm text-viral-text-secondary">
                    Toegevoegd aan je account
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-viral-text-secondary">
                {paymentData.credits > 0 ? (
                  <>Je hebt nu <span className="text-viral-primary font-bold">{user?.credits || 0} credits</span> in totaal!</>
                ) : (
                  <>Credits worden binnen enkele minuten zichtbaar. Vernieuw je dashboard zometeen.</>
                )}
                {console.log('🎭 ThankYou Display: user.credits =', user?.credits, 'paymentData.credits =', paymentData?.credits, 'showing total =', user?.credits || 0)}
              </div>
            </motion.div>
          )}

          {pending && (
            <motion.div
              className="bg-viral-dark-lighter rounded-lg p-6 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Loader className="w-6 h-6 text-viral-primary animate-spin" />
                <div className="text-viral-text-secondary">Betaling geverifieerd, credits worden toegevoegd...</div>
              </div>
              <div className="text-xs text-viral-text-muted text-center">Dit kan tot 1 minuut duren</div>
            </motion.div>
          )}

          {/* Features Reminder */}
          <motion.div
            className="text-left mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-bold text-center mb-4 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Nu kun je genieten van:
            </h3>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <Star className="w-4 h-4 text-green-400 flex-shrink-0" />
                Premium AI prank calls
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-4 h-4 text-green-400 flex-shrink-0" />
                6+ verschillende scenario's
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-4 h-4 text-green-400 flex-shrink-0" />
                HD opname kwaliteit
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-4 h-4 text-green-400 flex-shrink-0" />
                Downloaden & delen
              </li>
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button 
              onClick={handleContinue}
              className="viral-button viral-button-primary w-full flex items-center justify-center gap-3"
            >
              <ArrowRight className="w-4 h-4" />
              Start Je Eerste Prank!
            </button>
            
            <button 
              onClick={() => navigate('/prank')}
              className="viral-button viral-button-secondary w-full"
            >
              Direct Naar Prank Calls
            </button>
          </motion.div>

          {/* Thank You Message */}
          <motion.p 
            className="text-xs text-viral-text-secondary mt-6 flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Bedankt voor je vertrouwen in PrankCall.nl 
            <Heart className="w-3 h-3 text-red-400" />
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default ThankYou
