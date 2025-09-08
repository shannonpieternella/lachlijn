import { motion } from 'framer-motion'
import { Shield, Heart, Users, AlertTriangle, CheckCircle, XCircle, Phone, Scale } from 'lucide-react'

const ResponsibleUse = () => {
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
            Verantwoord Gebruik
          </motion.div>
          
          <h1 className="viral-title">Prank Responsibly 🛡️</h1>
          <p className="viral-subtitle max-w-2xl mx-auto">
            PrankCall.nl is gemaakt om mensen aan het lachen te maken, niet om ze te kwetsen. 
            Leer hoe je onze service op een leuke en respectvolle manier gebruikt.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Philosophy */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-viral-primary to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Onze Filosofie</h2>
                <p className="text-viral-text-secondary">
                  Een goede prank zorgt ervoor dat iedereen uiteindelijk kan lachen - inclusief de persoon die geprankd wordt. 
                  Het gaat om plezier maken, niet om mensen pijn te doen.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-viral-primary/5 to-yellow-500/5 border border-viral-primary/20 rounded-lg p-6">
              <h3 className="font-bold mb-3 text-center">🎭 De Gouden Regel van Pranken</h3>
              <p className="text-center text-lg font-medium text-viral-primary">
                "Prank alleen mensen die je kent en die uiteindelijk om de grap kunnen lachen"
              </p>
            </div>
          </motion.div>

          {/* Good vs Bad Examples */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Scale className="w-6 h-6 text-viral-primary" />
              Goed vs. Slecht Gebruik
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Good Examples */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="font-bold text-green-400">✅ Goede Pranks</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">🍕 Pizza Bestelling bij Vriend</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Je belt je beste vriend met het pizza scenario. Hij lacht erom en jullie 
                      hebben er later samen plezier om.
                    </p>
                  </div>

                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">📻 Radio DJ bij Zus</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Je "verjaardag felicitatie" van een radio station naar je zus. 
                      Ze is blij verrast en vindt het grappig.
                    </p>
                  </div>

                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">👵 Verwarde Oma bij Partner</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Een onschuldige "verkeerd nummer" prank bij je partner. 
                      Jullie lachen er samen om.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bad Examples */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <h3 className="font-bold text-red-400">❌ Slechte Pranks</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">😢 Nepziekenhuis Nieuws</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Nep-slecht nieuws over gezondheid of ongevallen. Dit kan 
                      echt emotionele schade veroorzaken.
                    </p>
                  </div>

                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">🚨 Bellen naar Hulpdiensten</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Nooit bellen naar politie, brandweer, of ambulance. 
                      Dit is illegaal en gevaarlijk.
                    </p>
                  </div>

                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">💼 Werk Gerelateerde Pranks</h4>
                    <p className="text-xs text-viral-text-secondary">
                      Pranks die iemands baan in gevaar kunnen brengen of 
                      professionele reputatie kunnen schaden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guidelines */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-viral-primary" />
              Praktische Richtlijnen
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-4 text-viral-primary">Voor de Prank</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="text-sm">
                      <strong>Ken je "doelwit":</strong> Prank alleen mensen die je goed kent 
                      en die om dit soort grappen kunnen lachen.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="text-sm">
                      <strong>Kies het juiste moment:</strong> Niet tijdens belangrijke meetings, 
                      examens, of stressvolle periodes.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div className="text-sm">
                      <strong>Kies een onschuldig scenario:</strong> Vermijd gevoelige onderwerpen 
                      zoals gezondheid, relaties, of werk.
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4 text-viral-primary">Na de Prank</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="text-sm">
                      <strong>Onthul de grap:</strong> Laat binnen redelijke tijd weten dat 
                      het een prank was.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="text-sm">
                      <strong>Check hun reactie:</strong> Als ze boos of verdrietig zijn, 
                      excuseer je oprecht.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div className="text-sm">
                      <strong>Lach samen:</strong> Het doel is dat jullie er samen om kunnen lachen. 
                      Zo niet, dan was het geen goede prank.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Warning Signs */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Waarschuwingssignalen</h2>
                <p className="text-viral-text-secondary">
                  Stop onmiddellijk als je deze signalen opmerkt tijdens of na je prank.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">🚨 Stop Signalen</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Persoon wordt boos of verdrietig</li>
                  <li>• Ze vragen je om te stoppen</li>
                  <li>• Ze beginnen te huilen</li>
                  <li>• Ze dreigen de politie te bellen</li>
                </ul>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">⚠️ Waarschuwing</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Ze reageren niet zoals verwacht</li>
                  <li>• De prank duurt te lang</li>
                  <li>• Ze stellen veel vragen</li>
                  <li>• Hun stem klinkt gestrest</li>
                </ul>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-400">💡 Actie Ondernemen</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Onthul de prank onmiddellijk</li>
                  <li>• Excuseer je oprecht</li>
                  <li>• Leg uit dat het een grap was</li>
                  <li>• Bied aan het goed te maken</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Legal & Ethical */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Scale className="w-6 h-6 text-viral-primary" />
              Juridisch & Ethisch
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-viral-primary">⚖️ Nederlandse Wetgeving</h3>
                <p className="text-sm text-viral-text-secondary mb-3">
                  Prank calls zijn legaal in Nederland als ze:
                </p>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Onschuldig en grappig zijn</li>
                  <li>• Niet bedreigend of intimiderend</li>
                  <li>• Geen schade veroorzaken</li>
                  <li>• Niet discriminerend zijn</li>
                </ul>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-viral-primary">❤️ Ethische Overwegingen</h3>
                <p className="text-sm text-viral-text-secondary mb-3">
                  Vraag jezelf af:
                </p>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Zou ik hier zelf om kunnen lachen?</li>
                  <li>• Kan dit iemand echt pijn doen?</li>
                  <li>• Is dit respectvol?</li>
                  <li>• Versterk ik onze relatie hiermee?</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Community Standards */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Phone className="w-6 h-6 text-viral-primary" />
              Community Standaarden
            </h2>

            <div className="bg-gradient-to-r from-viral-primary/10 to-yellow-500/10 border border-viral-primary/20 rounded-lg p-6">
              <h3 className="font-bold mb-4 text-center">🤝 PrankCall.nl Community Belofte</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-viral-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-viral-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Respectvol</h4>
                  <p className="text-sm text-viral-text-secondary">
                    We behandelen anderen zoals we zelf behandeld willen worden
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-viral-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-viral-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Inclusief</h4>
                  <p className="text-sm text-viral-text-secondary">
                    Iedereen moet kunnen lachen, niemand wordt uitgesloten
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-viral-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-viral-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Veilig</h4>
                  <p className="text-sm text-viral-text-secondary">
                    Een veilige ruimte voor onschuldige grappen en plezier
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-viral-text-secondary mb-4">
                Door PrankCall.nl te gebruiken, ga je akkoord met deze community standaarden 
                en beloof je om onze service respectvol te gebruiken.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="mailto:abuse@prankcall.nl"
                  className="viral-button viral-button-secondary"
                >
                  Misbruik Melden
                </a>
                <a 
                  href="/contact"
                  className="viral-button viral-button-ghost"
                >
                  Vragen? Contact Ons
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default ResponsibleUse