import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  Clock,
  PhoneOff
} from 'lucide-react'

const RefundNotification = ({ call, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto dismiss after 10 seconds for successful calls
    if (call.refundReason !== 'none') {
      const timer = setTimeout(() => {
        handleDismiss()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [call])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  const getRefundInfo = (reason) => {
    switch (reason) {
      case 'voicemail':
        return {
          icon: <PhoneOff className="w-5 h-5" />,
          title: 'Voicemail Gedetecteerd',
          message: 'Je credit is teruggestort omdat de call op voicemail terechtkwam.',
          color: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
          iconColor: 'text-blue-400'
        }
      case 'too_short':
        return {
          icon: <Clock className="w-5 h-5" />,
          title: 'Call Te Kort',
          message: 'Je credit is teruggestort omdat de call korter dan 7 seconden duurde.',
          color: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
          iconColor: 'text-orange-400'
        }
      case 'no_answer':
        return {
          icon: <PhoneOff className="w-5 h-5" />,
          title: 'Niet Opgenomen',
          message: 'Je credit is teruggestort omdat er geen menselijke interactie was.',
          color: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
          iconColor: 'text-gray-400'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          title: 'Call Mislukt',
          message: 'Je credit is teruggestort omdat de call technisch is mislukt.',
          color: 'bg-red-500/20 border-red-500/30 text-red-400',
          iconColor: 'text-red-400'
        }
      case 'poor_quality':
        return {
          icon: <RefreshCw className="w-5 h-5" />,
          title: 'Slechte Kwaliteit',
          message: 'Je credit is teruggestort vanwege slechte gespreksflow.',
          color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
          iconColor: 'text-yellow-400'
        }
      default:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          title: 'Call Succesvol',
          message: 'Je prank call is succesvol voltooid!',
          color: 'bg-green-500/20 border-green-500/30 text-green-400',
          iconColor: 'text-green-400'
        }
    }
  }

  const refundInfo = getRefundInfo(call.refundReason || 'none')

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`viral-card border-2 ${refundInfo.color} mb-4`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`${refundInfo.iconColor} mt-1`}>
                {refundInfo.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold mb-1">{refundInfo.title}</h3>
                <p className="text-sm mb-3">{refundInfo.message}</p>
                
                <div className="flex items-center gap-4 text-xs text-viral-text-muted">
                  <span>Scenario: {call.scenarioName}</span>
                  <span>Duur: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
                  {call.creditsRefunded > 0 && (
                    <span className="text-green-400 font-medium">
                      +{call.creditsRefunded} credit{call.creditsRefunded !== 1 ? 's' : ''} teruggestort
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-viral-dark-lighter rounded transition-colors"
              title="Sluiten"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar for auto-dismiss */}
          {call.refundReason !== 'none' && (
            <div className="mt-4">
              <div className="w-full bg-viral-dark-lighter rounded-full h-1">
                <motion.div
                  className={`h-1 rounded-full ${refundInfo.iconColor.replace('text-', 'bg-')}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Notification Manager Component
const RefundNotificationManager = ({ calls, onDismiss }) => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Filter calls that need notifications
    const needsNotification = calls.filter(call => 
      call.status === 'ended' && 
      !notifications.find(n => n.id === call.id)
    )

    if (needsNotification.length > 0) {
      setNotifications(prev => [...prev, ...needsNotification])
    }
  }, [calls])

  const handleDismiss = (callId) => {
    setNotifications(prev => prev.filter(n => n.id !== callId))
    onDismiss?.(callId)
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2">
      {notifications.map(call => (
        <RefundNotification
          key={call.id}
          call={call}
          onDismiss={() => handleDismiss(call.id)}
        />
      ))}
    </div>
  )
}

export default RefundNotification
export { RefundNotificationManager }