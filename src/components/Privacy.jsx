import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react'

const Privacy = () => {
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
            <Shield className="w-4 h-4" />
            Privacy Beleid
          </motion.div>
          
          <h1 className="viral-title">Jouw Privacy is Belangrijk</h1>
          <p className="viral-subtitle max-w-2xl mx-auto">
            Bij PrankCall.nl nemen we jouw privacy serieus. Dit beleid legt uit hoe we jouw gegevens verzamelen, 
            gebruiken en beschermen wanneer je onze AI prank call service gebruikt.
          </p>
          
          <p className="text-sm text-viral-text-secondary mt-4">
            Laatst bijgewerkt: 5 september 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Data Collection */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Welke Gegevens Verzamelen We?</h2>
                <p className="text-viral-text-secondary">
                  We verzamelen alleen de gegevens die nodig zijn om onze service te leveren en je ervaring te verbeteren.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Account Informatie</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Email adres (voor account aanmaken en login)</li>
                  <li>• Naam (voor personalisatie)</li>
                  <li>• Wachtwoord (veilig gehashed)</li>
                </ul>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Prank Call Gegevens</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Telefoonnummers die je belt (voor call uitvoering)</li>
                  <li>• Gekozen scenario's (voor service verbetering)</li>
                  <li>• Call statistieken (duur, succes rate)</li>
                  <li>• Opnames (optioneel, alleen als je dit inschakelt)</li>
                </ul>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Betaling Informatie</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Betaalgeschiedenis (via Stripe, veilig verwerkt)</li>
                  <li>• Credit saldo</li>
                  <li>• We slaan geen creditcard gegevens op</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Data Usage */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Hoe Gebruiken We Jouw Gegevens?</h2>
                <p className="text-viral-text-secondary">
                  Jouw gegevens worden alleen gebruikt voor de doeleinden waarvoor je ze hebt verstrekt.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Service Levering</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Prank calls uitvoeren</li>
                  <li>• Account beheer</li>
                  <li>• Betalingen verwerken</li>
                  <li>• Klantenondersteuning</li>
                </ul>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Verbetering</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Service kwaliteit verhogen</li>
                  <li>• Nieuwe features ontwikkelen</li>
                  <li>• Bugs en problemen oplossen</li>
                  <li>• Gebruikerservaring optimaliseren</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Hoe Beschermen We Jouw Gegevens?</h2>
                <p className="text-viral-text-secondary">
                  We gebruiken moderne beveiligingstechnologieën om jouw gegevens veilig te houden.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">SSL Encryptie</h3>
                <p className="text-xs text-viral-text-secondary">
                  256-bit SSL voor alle data overdracht
                </p>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Veilige Opslag</h3>
                <p className="text-xs text-viral-text-secondary">
                  Gegevens veilig opgeslagen in MongoDB
                </p>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg text-center">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Wachtwoord Beveiliging</h3>
                <p className="text-xs text-viral-text-secondary">
                  Gehashed met moderne algoritmen
                </p>
              </div>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-viral-primary" />
              Jouw Rechten
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recht op Inzage</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Je kunt altijd vragen welke gegevens we van je hebben opgeslagen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recht op Correctie</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Onjuiste gegevens kunnen altijd worden aangepast via je profiel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recht op Verwijdering</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Je kunt je account en alle gegevens permanent laten verwijderen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recht op Overdraagbaarheid</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Je kunt een kopie van je gegevens downloaden via je profiel.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Mail className="w-6 h-6 text-viral-primary" />
              Vragen over Privacy?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-viral-text-secondary mb-4">
                  Heb je vragen over dit privacy beleid of over hoe we met jouw gegevens omgaan? 
                  Neem dan contact met ons op!
                </p>
                
                <div className="space-y-2">
                  <a 
                    href="mailto:privacy@prankcall.nl" 
                    className="flex items-center gap-2 text-viral-primary hover:text-viral-primary/80 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    privacy@prankcall.nl
                  </a>
                </div>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Snelle Reactie Garantie</h3>
                <p className="text-sm text-viral-text-secondary">
                  We reageren binnen 24 uur op alle privacy gerelateerde vragen. 
                  Jouw privacy is onze prioriteit! 🔒
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Privacy