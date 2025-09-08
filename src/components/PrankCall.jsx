import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  PhoneCall,
  PhoneOff, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Share,
  Heart,
  Zap,
  Clock,
  User,
  MessageCircle,
  Sparkles,
  Laugh,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react'
import vapiService from '../services/vapiService'
import { Link } from 'react-router-dom'

const PrankCall = ({ user: initialUser }) => {
  // Local user state to handle credit updates
  const [user, setUser] = useState(initialUser)
  
  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('🔄 Refreshing user data from server:', result.user.credits)
        setUser(result.user)
        // Keep App state/localStorage in sync as well
        try {
          const stored = localStorage.getItem('prankUser')
          if (stored) {
            const parsed = JSON.parse(stored)
            localStorage.setItem('prankUser', JSON.stringify({ ...parsed, ...result.user }))
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [targetPhone, setTargetPhone] = useState('')
  const [targetName, setTargetName] = useState('')
  const [callStatus, setCallStatus] = useState('idle') // idle, validating, connecting, queued, ringing, in-progress, ended, failed
  const [callDuration, setCallDuration] = useState(0)
  const [callStartTime, setCallStartTime] = useState(null)
  const [isRecording, setIsRecording] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [callHistory, setCallHistory] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currentCallId, setCurrentCallId] = useState(null)
  const [callError, setCallError] = useState(null)
  const [phoneValidation, setPhoneValidation] = useState({ isValid: true, message: '' })
  
  // Advanced options
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'dutch-female-1',
    speed: 1.0,
    pitch: 1.0
  })

  const [scenarios, setScenarios] = useState([])

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios')
        const data = await res.json()
        if (data.success && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
          setScenarios(data.scenarios)
        } else {
          throw new Error('Invalid or empty scenarios response')
        }
      } catch (e) {
        console.error('Error loading scenarios from API:', e)
        // No fallback: always use database
        setScenarios([])
      }
    }
    loadScenarios()
  }, [])

  // Refresh user data when component mounts to sync with database
  useEffect(() => {
    refreshUserData()
  }, [])

  const voiceOptions = [
    { id: 'dutch-female-1', name: 'Emma (Amsterdam)', accent: 'Amsterdams' },
    { id: 'dutch-male-1', name: 'Daan (Rotterdam)', accent: 'Rotterdams' },
    { id: 'dutch-female-2', name: 'Sophie (Den Haag)', accent: 'Haags' },
    { id: 'dutch-male-2', name: 'Lars (Groningen)', accent: 'Gronings' },
    { id: 'dutch-female-3', name: 'Lotte (Limburg)', accent: 'Limburgs' },
  ]

  useEffect(() => {
    let interval
    console.log('🔄 Timer useEffect triggered - status:', callStatus, 'startTime:', callStartTime)
    
    if (callStatus === 'in-progress') {
      console.log('🕐 Call is in-progress, starting simple counter timer')
      let counter = 0
      interval = setInterval(() => {
        counter += 1
        console.log('⏱️ Timer tick:', counter, 'seconds')
        setCallDuration(counter)
      }, 1000)
    } else {
      console.log('❌ Timer not starting - status is not in-progress:', callStatus)
    }
    
    return () => {
      if (interval) {
        console.log('🛑 Clearing timer interval')
        clearInterval(interval)
      }
    }
  }, [callStatus]) // Only depend on callStatus, not callStartTime

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startCall = async () => {
    if (!selectedScenario || !targetPhone || user.credits < 1) return
    
    const scenario = scenarios.find(s => s.id === selectedScenario)
    if (!scenario || !scenario.vapiAgentId) {
      setCallError('Dit scenario heeft geen gekoppelde AI agent. Contacteer admin.')
      return
    }
    
    // Valideer telefoonnummer
    setCallStatus('validating')
    const validation = vapiService.validatePhoneNumber(targetPhone)
    
    if (!validation.isValid) {
      setCallError('Ongeldig Nederlands telefoonnummer. Gebruik formaat +31 6 12345678')
      setCallStatus('idle')
      setPhoneValidation({ isValid: false, message: 'Ongeldig Nederlands nummer' })
      return
    }

    setCallError(null)
    setPhoneValidation({ isValid: true, message: '' })
    setCallStatus('connecting')
    // Don't reset duration here - wait until call actually starts
    
    try {
      // Call backend API instead of VAPI directly
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          scenarioName: scenario.name,
          scenarioIcon: scenario.icon,
          targetPhone: validation.formatted,
          targetName: targetName.trim(),
          vapiAgentId: scenario.vapiAgentId
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCurrentCallId(result.call.id)
        setCallStatus('queued')
        
        // Update user credits with proper React state
        console.log('💰 Updating user credits from', user.credits, 'to', result.user.credits)
        setUser(prevUser => ({
          ...prevUser,
          credits: result.user.credits
        }))
        
        // Add to history
        const newCall = {
          id: result.call._id,
          scenario: selectedScenario,
          phone: validation.formatted,
          startTime: new Date(),
          status: 'queued',
          vapiCallId: result.call.vapiCallId
        }
        setCallHistory(prev => [newCall, ...prev])
        
        // Start polling call status via backend using the backend call ID
        pollCallStatus(result.call.id)
        
      } else {
        throw new Error(result.message || 'Failed to create call')
      }
      
    } catch (error) {
      console.error('Error starting call:', error)
      setCallError(`Fout bij starten call: ${error.message}`)
      setCallStatus('failed')
      
      setTimeout(() => {
        setCallStatus('idle')
        setCallError(null)
      }, 5000)
    }
  }

  // Poll call status via backend API
  const pollCallStatus = async (backendCallId) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/calls/${backendCallId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to get call status: ${response.status}`)
        }
        
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message || 'Failed to get call status')
        }
        
        const call = result.call
        console.log('Call status update:', call)
        
        // Update call status based on backend response
        switch (call.status) {
          case 'queued':
            setCallStatus('queued')
            break
          case 'ringing':
            setCallStatus('ringing')
            break
          case 'in-progress':
            // Only set start time on first transition - use callStartTime as the check
            if (!callStartTime) {
              console.log('🚀 Call going in-progress! Setting start time (first time)')
              const startTime = new Date()
              setCallStartTime(startTime)
              setCallDuration(0)
              console.log('⏰ Call start time set to:', startTime)
            } else {
              console.log('⚠️ Already have start time, keeping existing:', callStartTime)
            }
            setCallStatus('in-progress')
            break
          case 'forwarding':
            // Only set start time on first transition - use callStartTime as the check  
            if (!callStartTime) {
              console.log('🚀 Call forwarding (treating as in-progress)! Setting start time (first time)')
              const startTime = new Date()
              setCallStartTime(startTime)
              setCallDuration(0)
              console.log('⏰ Call start time set to:', startTime)
            } else {
              console.log('⚠️ Already have start time, keeping existing:', callStartTime)
            }
            setCallStatus('in-progress') // Treat as active
            break
          case 'ended':
          case 'completed':
            setCallStatus('ended')
            
            // Update call history with final data
            setCallHistory(prev => prev.map(historyCall => 
              historyCall.id === backendCallId 
                ? { 
                    ...historyCall, 
                    status: 'completed', 
                    duration: call.duration || callDuration,
                    endTime: new Date(call.endedAt || new Date()),
                    recordingUrl: call.vapiData?.recordingUrl,
                    playbackUrl: call.playbackUrl || null,
                    cost: call.vapiData?.cost
                  }
                : historyCall
            ))
            
            // Reset after 5 seconds
            setTimeout(() => {
              setCallStatus('idle')
              setSelectedScenario(null)
              setTargetPhone('')
              setCallDuration(0)
              setCallStartTime(null)
              setCurrentCallId(null)
            }, 5000)
            
            return // Stop polling
          case 'failed':
            setCallStatus('failed')
            return // Stop polling
          default:
            break
        }
        
        // Continue polling if call is still active
        if (['queued', 'ringing', 'in-progress', 'forwarding'].includes(call.status)) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        }
        
      } catch (error) {
        console.error('Error polling call status:', error)
        // Retry after 5 seconds on error
        setTimeout(poll, 5000)
      }
    }
    
    // Start polling after 1 second
    setTimeout(poll, 1000)
  }

  const endCall = async () => {
    if (!currentCallId) {
      // If no active call, just reset UI
      setCallStatus('ended')
      setTimeout(() => {
        setCallStatus('idle')
        setSelectedScenario(null)
        setTargetPhone('')
        setCallDuration(0)
        setCallStartTime(null)
        setCurrentCallId(null)
      }, 3000)
      return
    }

    try {
      // End call via backend API
      const response = await fetch(`/api/calls/${currentCallId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('Call ended successfully')
        setCallStatus('ended')
        
        // Update call history
        setCallHistory(prev => prev.map(call => 
          call.id === currentCallId
            ? { ...call, status: 'completed', duration: callDuration, endTime: new Date() }
            : call
        ))
      } else {
        throw new Error(result.message || 'Failed to end call')
      }
      
    } catch (error) {
      console.error('Error ending call:', error)
      // Still set to ended even if API call failed
      setCallStatus('ended')
    }
    
    // Reset UI after 3 seconds
    setTimeout(() => {
      setCallStatus('idle')
      setSelectedScenario(null)
      setTargetPhone('')
      setCallDuration(0)
      setCallStartTime(null)
      setCurrentCallId(null)
    }, 3000)
  }

  const canStartCall = selectedScenario && targetPhone && user.credits > 0 && callStatus === 'idle'

  return (
    <div className="viral-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="viral-heading">Start Je Comedy Call 🎭</h1>
          <p className="viral-text">
            Kies een scenario, voer een telefoonnummer in en laat de AI het werk doen!
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="viral-badge">
              <Zap className="w-4 h-4" />
              {user.credits} credits over
            </div>
            <div className="viral-status-live">
              AI Systeem Online
            </div>
          </div>
        </div>

        {/* Call Interface */}
        {callStatus !== 'idle' ? (
          <CallInterface 
            scenario={scenarios.find(s => s.id === selectedScenario)}
            targetPhone={targetPhone}
            callStatus={callStatus}
            callDuration={callDuration}
            formatDuration={formatDuration}
            endCall={endCall}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        ) : (
          <>
            {/* Scenario Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-viral-primary" />
                Stap 1: Kies Je Comedy Scenario
              </h2>
              
              <div className="viral-grid viral-grid-3">
                {scenarios.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    className={`viral-card cursor-pointer transition-all relative ${
                      selectedScenario === scenario.id 
                        ? 'ring-2 ring-viral-primary bg-viral-primary/10 border-viral-primary shadow-lg shadow-viral-primary/25 transform scale-105' 
                        : 'hover:border-viral-primary/50 hover:transform hover:scale-102'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      {scenario.image && (
                        <img
                          src={scenario.image}
                          alt={scenario.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )}
                      <div className="text-4xl mb-3">{scenario.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{scenario.name}</h3>
                      <p className="text-sm text-viral-text-secondary mb-4">
                        {scenario.userDescription || scenario.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-viral-text-muted mb-3">
                        <span>{scenario.category}</span>
                        <span>{scenario.duration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{scenario.popularity}%</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          scenario.difficulty === 'Makkelijk' ? 'bg-green-500/20 text-green-400' :
                          scenario.difficulty === 'Gemiddeld' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {scenario.difficulty}
                        </div>
                      </div>
                    </div>
                    
                    {selectedScenario === scenario.id && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Scenario Display */}
            {selectedScenario && (
              <motion.div
                className="viral-card bg-gradient-to-r from-viral-primary/10 to-viral-secondary/10 border-viral-primary/30 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-viral-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-viral-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-viral-primary mb-1">✅ Gekozen Comedy Scenario:</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenarios.find(s => s.id === selectedScenario)?.icon}</span>
                      <div>
                        <div className="font-medium text-lg">{scenarios.find(s => s.id === selectedScenario)?.name}</div>
                        <div className="text-sm text-viral-text-secondary">
                          {scenarios.find(s => s.id === selectedScenario)?.userDescription || scenarios.find(s => s.id === selectedScenario)?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="text-viral-text-secondary hover:text-viral-primary transition-colors px-3 py-2 rounded-lg hover:bg-viral-dark-lighter text-sm font-medium"
                    title="Ander scenario kiezen"
                  >
                    Wijzig
                  </button>
                </div>
              </motion.div>
            )}

            {/* Phone Number Input */}
            {selectedScenario && (
              <motion.div
                className="viral-card mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-viral-primary" />
                  Stap 2: Telefoonnummer Invoeren
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                      Nummer van je slachtoffer... eh, vriend 😏
                    </label>
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => {
                        setTargetPhone(e.target.value)
                        if (phoneValidation.message) {
                          setPhoneValidation({ isValid: true, message: '' })
                        }
                      }}
                      className={`viral-input ${
                        phoneValidation.isValid === false ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="+31 6 12345678"
                    />
                    {phoneValidation.message && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {phoneValidation.message}
                      </div>
                    )}
                    <p className="text-xs text-viral-text-muted mt-2">
                      Zorg dat het een vriend/familie is die een grapje kan waarderen!
                    </p>
                  </div>

                  {/* Target Name */}
                  <div>
                    <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                      Naam van de persoon (optioneel)
                    </label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="viral-input"
                      placeholder="Shannon"
                    />
                    <p className="text-xs text-viral-text-muted mt-2">
                      De AI zal beginnen met "Hello [naam]" als je een naam invult
                    </p>
                  </div>
                  
                  {/* Advanced Options */}
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-viral-primary hover:text-viral-primary-light transition-colors"
                    >
                      <span className="text-sm">Geavanceerde Opties</span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {showAdvanced && (
                      <motion.div
                        className="mt-4 space-y-4"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div>
                          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                            AI Stem Keuze
                          </label>
                          <select
                            value={voiceSettings.voice}
                            onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                            className="viral-select"
                          >
                            {voiceOptions.map(voice => (
                              <option key={voice.id} value={voice.id}>
                                {voice.name} - {voice.accent}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                              Spreeksnelheid: {voiceSettings.speed}x
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={voiceSettings.speed}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                              Stem Hoogte: {voiceSettings.pitch}x
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="1.5"
                              step="0.1"
                              value={voiceSettings.pitch}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {callError && (
              <motion.div
                className="viral-card bg-red-500/10 border-red-500/20 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h3 className="font-medium">Call Error</h3>
                    <p className="text-sm">{callError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Start Call Button */}
            {selectedScenario && targetPhone && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={startCall}
                  disabled={!canStartCall || callStatus !== 'idle'}
                  className={`viral-button viral-button-primary w-full sm:w-auto text-base sm:text-lg px-6 sm:px-12 py-3 sm:py-4 ${
                    (!canStartCall || callStatus !== 'idle') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {callStatus === 'validating' && <Loader className="w-6 h-6 animate-spin" />}
                  {callStatus === 'connecting' && <Loader className="w-6 h-6 animate-spin" />}
                  {callStatus === 'idle' && <PhoneCall className="w-6 h-6" />}
                  
                  {callStatus === 'validating' && 'Valideren...'}
                  {callStatus === 'connecting' && 'Verbinden...'}
                  {callStatus === 'idle' && 'Start Comedy Call Nu!'}
                  
                  {callStatus === 'idle' && <span className="text-sm ml-2">(1 credit)</span>}
                </button>
                
                {user.credits === 0 && (
                  <p className="text-viral-accent text-sm mt-3">
            Je hebt geen credits meer! <Link to="/pricing" className="text-viral-primary hover:underline">Koop er hier meer</Link>
                  </p>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Recent Calls */}
        {callHistory.length > 0 && callStatus === 'idle' && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-viral-primary" />
              Jouw Recente Comedy Calls
            </h2>
            
            <div className="space-y-4">
              {callHistory.slice(0, 5).map((call) => (
                <CallHistoryItem key={call.id} call={call} scenarios={scenarios} />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// Call Interface Component
const CallInterface = ({ 
  scenario, 
  targetPhone, 
  callStatus, 
  callDuration, 
  formatDuration, 
  endCall,
  isRecording,
  setIsRecording,
  isMuted,
  setIsMuted
}) => {
  return (
    <motion.div
      className="max-w-2xl mx-auto text-center px-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="viral-card viral-card-glow">
        {/* Call Status */}
        <div className="mb-6">
          {scenario?.image && (
            <img
              src={scenario.image}
              alt={scenario.name}
              className="w-full h-40 object-cover rounded-md mb-4"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
          <div className="text-4xl sm:text-6xl mb-4">{scenario.icon}</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{scenario.name}</h2>
          <div className="text-viral-text-secondary mb-4 text-sm sm:text-base truncate">{targetPhone}</div>
          
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            callStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
            callStatus === 'queued' ? 'bg-orange-500/20 text-orange-400 animate-pulse' :
            callStatus === 'ringing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
            (callStatus === 'in-progress' || callStatus === 'active') ? 'bg-green-500/20 text-green-400' :
            callStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {callStatus === 'connecting' && 'Verbinden met VAPI...'}
            {callStatus === 'queued' && 'In wachtrij... ⏳'}
            {callStatus === 'ringing' && 'Bellen... 📞'}
            {(callStatus === 'in-progress' || callStatus === 'active') && `🎭 Live Comedy - ${formatDuration(callDuration)}`}
            {callStatus === 'ended' && '✅ Comedy Voltooid!'}
            {callStatus === 'failed' && '❌ Call Mislukt'}
          </div>
        </div>

        {/* Call Controls */}
        {(callStatus === 'in-progress' || callStatus === 'active') && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 sm:p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-500/20 text-red-400' : 'bg-viral-dark-lighter text-viral-text-secondary'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </motion.button>
            
            <motion.button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 sm:p-4 rounded-full transition-colors ${
                isRecording ? 'bg-viral-primary/20 text-viral-primary' : 'bg-viral-dark-lighter text-viral-text-secondary'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRecording ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
            </motion.button>
          </div>
        )}

        {/* End Call Button */}
        {(callStatus === 'in-progress' || callStatus === 'active' || callStatus === 'ringing' || callStatus === 'queued') && (
          <motion.button
            onClick={endCall}
            className="viral-button bg-red-500 hover:bg-red-600 text-white border-red-500 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PhoneOff className="w-5 h-5" />
            Gesprek Beëindigen
          </motion.button>
        )}

        {/* Call Ended Actions */}
        {callStatus === 'ended' && (
          <div className="space-y-4">
            <div className="text-viral-success">
              🎉 Comedy call voltooid! Hopelijk had je vriend er om kunnen lachen!
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button className="viral-button viral-button-ghost">
                <Download className="w-4 h-4" />
                Download Opname
              </button>
              <button className="viral-button viral-button-ghost">
                <Share className="w-4 h-4" />
                Delen
              </button>
              <button className="viral-button viral-button-ghost">
                <Heart className="w-4 h-4" />
                Opslaan
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Call History Item Component
const CallHistoryItem = ({ call, scenarios }) => {
  const scenario = scenarios.find(s => s.id === call.scenario)
  
  return (
    <div className="viral-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{scenario?.icon}</div>
          <div>
            <div className="font-medium">{scenario?.name}</div>
            <div className="text-sm text-viral-text-secondary">
              {call.phone} • {call.startTime.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`text-xs px-2 py-1 rounded-full ${
            call.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            call.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {call.status === 'completed' && '✓ Voltooid'}
            {call.status === 'failed' && '✗ Mislukt'}
            {call.status === 'active' && '⚡ Bezig'}
          </div>
          
          {call.duration && (
            <div className="text-xs text-viral-text-muted">
              {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
          
          <div className="flex gap-2">
            <button className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors">
              <Play className="w-4 h-4" />
            </button>
            <button className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrankCall
