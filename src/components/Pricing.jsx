import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Zap, 
  Crown, 
  Sparkles,
  Phone,
  Download,
  Share,
  Shield,
  Star,
  Loader,
  User
} from 'lucide-react'
import stripeService from '../services/stripeService'

const Pricing = ({ user, onAuthClick }) => {
  const [selectedPlan, setSelectedPlan] = useState('starter')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  
  useEffect(() => {
    loadCreditPackages()
  }, [])

  const loadCreditPackages = async () => {
    try {
      const packages = await stripeService.getCreditPackages()
      setPlans(packages)
    } catch (error) {
      console.error('Error loading credit packages:', error)
      // Fallback static plans
      setPlans([
        {
          id: 'small',
          name: '5 Credits',
          price: 6.00,
          credits: 5,
          popular: false,
          description: 'Perfect om te beginnen',
          savings: 0,
          features: [
            '5 premium prank calls',
            '6+ verschillende scenario\'s',
            'Nederlandse AI stemmen',
            'HD opname kwaliteit',
            'Download & delen',
            'Email ondersteuning'
          ]
        },
        {
          id: 'medium',
          name: '10 Credits',
          price: 10.00,
          credits: 10,
          popular: true,
          description: 'Beste deal! Bespaar €2',
          savings: 2.00,
          features: [
            '10 premium prank calls',
            '6+ verschillende scenario\'s',
            'Nederlandse AI stemmen',
            'HD opname kwaliteit',
            'Onbeperkt downloaden & delen',
            'Prioriteit ondersteuning',
            'Vroege toegang nieuwe features'
          ]
        },
        {
          id: 'large',
          name: '25 Credits',
          price: 22.50,
          credits: 25,
          popular: false,
          description: 'Maximale besparing! Bespaar €7.50',
          savings: 7.50,
          features: [
            '25 premium prank calls',
            '6+ verschillende scenario\'s',
            'Nederlandse AI stemmen',
            'Premium HD opname kwaliteit',
            'Onbeperkt downloaden & delen',
            'Aangepaste scenario\'s (binnenkort)',
            'Prioriteit ondersteuning',
            'Vroege toegang nieuwe features',
            'Exclusieve scenario\'s'
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (planId) => {
    if (!user) {
      onAuthClick()
      return
    }

    try {
      setPurchasing(planId)
      await stripeService.redirectToCheckout(planId)
    } catch (error) {
      console.error('Error during purchase:', error)
      alert('Er ging iets mis bij de betaling. Probeer het opnieuw.')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="viral-container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            className="viral-badge mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            Credits Systeem
          </motion.div>
          
          <h1 className="viral-title">Kies Je Credit Pakket</h1>
          <p className="viral-subtitle">
            Start gratis of kies het pakket dat bij jou past. Alle pakketten bevatten premium features!
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-viral-primary" />
            <p>Pakketten laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`viral-card relative ${plan.popular ? 'ring-2 ring-viral-primary' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="viral-badge bg-viral-primary text-white">
                      <Crown className="w-4 h-4" />
                      Populair
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-viral-primary to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-viral-text-secondary text-sm sm:text-base mb-4">{plan.description}</p>
                  
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-3xl sm:text-4xl font-bold">€{plan.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-viral-text-secondary text-sm">
                    €{(plan.price / plan.credits).toFixed(2)} per call
                  </div>
                  
                  {plan.savings > 0 && (
                    <div className="text-green-400 font-medium mt-2 text-sm">
                      Bespaar €{plan.savings.toFixed(2)}!
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || loading}
                  className={`viral-button w-full ${
                    plan.popular 
                      ? 'viral-button-primary' 
                      : 'viral-button-secondary'
                  }`}
                >
                  {purchasing === plan.id ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Naar betaalpagina...
                    </div>
                  ) : user ? (
                    <>
                      <Zap className="w-4 h-4" />
                      Kies {plan.name}
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Registreer voor {plan.name}
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <motion.div 
          className="viral-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            Veilig & Betrouwbaar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">SSL Beveiligd</div>
                <div className="text-sm text-viral-text-secondary">256-bit encryptie</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">Stripe Payments</div>
                <div className="text-sm text-viral-text-secondary">Veilige betalingen</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">Direct Beschikbaar</div>
                <div className="text-sm text-viral-text-secondary">Meteen gebruiken</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Pricing