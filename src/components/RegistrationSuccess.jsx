import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RegistrationSuccess = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Facebook Pixel - Track registration completion
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration')
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-viral-purple via-viral-blue to-viral-pink flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welkom bij Lachlijn! 🎉</h1>
          <p className="text-viral-text-light">Je account is succesvol aangemaakt</p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Je bent nu klaar om te beginnen!</h2>
          <div className="text-viral-text-light space-y-2">
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              Je hebt 1 gratis call om te proberen
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              Kies uit 10+ hilarische scenario's
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              Deel je grappigste momenten
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-viral-text-light mb-4">
            Je wordt over <span className="text-white font-bold text-xl">{countdown}</span> seconden doorgestuurd naar je dashboard
          </p>
          
          <button
            onClick={goToDashboard}
            className="w-full bg-gradient-to-r from-viral-purple to-viral-blue text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            Ga nu naar Dashboard →
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-viral-text-light">
          <p>Tip: Bookmark deze pagina voor snelle toegang!</p>
        </div>
      </div>
    </div>
  )
}

export default RegistrationSuccess