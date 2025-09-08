import { motion } from 'framer-motion'
import { Mail, MessageCircle, Phone, Clock, MapPin, Send, HelpCircle, Bug, CreditCard } from 'lucide-react'

const Contact = () => {
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
            <Mail className="w-4 h-4" />
            Contact & Hulp
          </motion.div>
          
          <h1 className="viral-title">We Helpen Je Graag!</h1>
          <p className="viral-subtitle max-w-2xl mx-auto">
            Heb je vragen, problemen of suggesties? Ons Nederlandse support team staat klaar om je te helpen. 
            We streven ernaar om binnen 24 uur te reageren!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div 
              className="viral-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-bold mb-2">Email Support</h3>
              <p className="text-sm text-viral-text-secondary mb-4">
                Voor alle vragen en ondersteuning
              </p>
              <a 
                href="mailto:hallo@prankcall.nl"
                className="viral-button viral-button-primary w-full"
              >
                hallo@prankcall.nl
              </a>
            </motion.div>

            <motion.div 
              className="viral-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-bold mb-2">Live Chat</h3>
              <p className="text-sm text-viral-text-secondary mb-4">
                Direct chatten met ons team
              </p>
              <button className="viral-button viral-button-secondary w-full">
                Start Chat (Binnenkort)
              </button>
            </motion.div>

            <motion.div 
              className="viral-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">Reactietijd</h3>
              <p className="text-sm text-viral-text-secondary mb-4">
                Binnen 24 uur een reactie
              </p>
              <div className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
                Ma-Vr 9:00-17:00
              </div>
            </motion.div>
          </div>

          {/* Specific Contact Types */}
          <motion.div 
            className="viral-card mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold mb-6">Specifieke Vragen?</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                  <Bug className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Bug Melden</h3>
                <p className="text-xs text-viral-text-secondary mb-3">
                  Technische problemen of bugs
                </p>
                <a 
                  href="mailto:bugs@prankcall.nl"
                  className="text-xs text-red-400 hover:underline"
                >
                  bugs@prankcall.nl
                </a>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Betaling Hulp</h3>
                <p className="text-xs text-viral-text-secondary mb-3">
                  Credits, betalingen, facturen
                </p>
                <a 
                  href="mailto:billing@prankcall.nl"
                  className="text-xs text-blue-400 hover:underline"
                >
                  billing@prankcall.nl
                </a>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center mb-3">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Algemene Hulp</h3>
                <p className="text-xs text-viral-text-secondary mb-3">
                  Hoe werkt de service?
                </p>
                <a 
                  href="mailto:help@prankcall.nl"
                  className="text-xs text-yellow-400 hover:underline"
                >
                  help@prankcall.nl
                </a>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                  <Send className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Feedback</h3>
                <p className="text-xs text-viral-text-secondary mb-3">
                  Suggesties en verbeteringen
                </p>
                <a 
                  href="mailto:feedback@prankcall.nl"
                  className="text-xs text-green-400 hover:underline"
                >
                  feedback@prankcall.nl
                </a>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div 
              className="viral-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Send className="w-6 h-6 text-viral-primary" />
                Stuur ons een Bericht
              </h2>

              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                      Voor- en Achternaam *
                    </label>
                    <input
                      type="text"
                      className="viral-input"
                      placeholder="Jouw naam"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                      Email Adres *
                    </label>
                    <input
                      type="email"
                      className="viral-input"
                      placeholder="jouw@email.nl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                    Onderwerp
                  </label>
                  <select className="viral-input">
                    <option>Algemene Vraag</option>
                    <option>Technisch Probleem</option>
                    <option>Betaling & Credits</option>
                    <option>Feature Verzoek</option>
                    <option>Bug Rapportage</option>
                    <option>Anders</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                    Jouw Bericht *
                  </label>
                  <textarea
                    rows={6}
                    className="viral-input"
                    placeholder="Beschrijf je vraag, probleem of suggestie zo uitgebreid mogelijk..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="viral-button viral-button-primary w-full">
                  <Send className="w-4 h-4" />
                  Verstuur Bericht
                </button>
              </form>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  💡 <strong>Tip:</strong> Vermeld je account email als je ingelogd bent, 
                  dan kunnen we je sneller helpen!
                </p>
              </div>
            </motion.div>

            {/* FAQ & Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              {/* Company Info */}
              <div className="viral-card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-viral-primary" />
                  Over PrankCall.nl
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">🇳🇱 Nederlands Bedrijf</h3>
                    <p className="text-sm text-viral-text-secondary">
                      PrankCall.nl is een Nederlandse service, gemaakt door Nederlanders 
                      voor Nederlandse prank liefhebbers.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">🤖 AI Technologie</h3>
                    <p className="text-sm text-viral-text-secondary">
                      We gebruiken geavanceerde AI om realistische Nederlandse stemmen 
                      en grappige scenario's te creëren.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">🛡️ Veilig & Privé</h3>
                    <p className="text-sm text-viral-text-secondary">
                      Jouw privacy staat voorop. We slaan geen gevoelige informatie op 
                      en gebruiken veilige betalingen via Stripe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="viral-card">
                <h3 className="font-bold mb-4">🤔 Veelgestelde Vragen</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-viral-primary">
                      Hoe werkt het credits systeem?
                    </h4>
                    <p className="text-xs text-viral-text-secondary">
                      1 credit = 1 prank call. Credits verlopen nooit en je kunt ze 
                      gebruiken wanneer je wilt.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-viral-primary">
                      Kan ik mijn credits terugkrijgen?
                    </h4>
                    <p className="text-xs text-viral-text-secondary">
                      Bij technische problemen wel. Bij misbruik of overtreding 
                      van de regels niet.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-viral-primary">
                      Is PrankCall.nl legaal?
                    </h4>
                    <p className="text-xs text-viral-text-secondary">
                      Ja, voor onschuldige grappen tussen mensen die elkaar kennen. 
                      Gebruik het respectvol en verantwoordelijk.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-viral-primary">
                      Kunnen mensen zien dat het een AI is?
                    </h4>
                    <p className="text-xs text-viral-text-secondary">
                      Onze AI stemmen zijn heel realistisch, maar we raden aan om 
                      na de prank te onthullen dat het een grap was.
                    </p>
                  </div>
                </div>
              </div>

              {/* Support Hours */}
              <div className="viral-card">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-viral-primary" />
                  Support Tijden
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Maandag - Vrijdag</span>
                    <span className="text-green-400">9:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekend</span>
                    <span className="text-yellow-400">Beperkt beschikbaar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feestdagen</span>
                    <span className="text-red-400">Gesloten</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    ⚡ <strong>Snelle Reactie:</strong> 95% van alle emails beantwoord 
                    binnen 4 uur tijdens kantooruren!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Contact