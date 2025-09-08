import { motion } from 'framer-motion'
import { FileText, Shield, AlertTriangle, CreditCard, Users, Gavel } from 'lucide-react'

const Terms = () => {
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
            <FileText className="w-4 h-4" />
            Algemene Voorwaarden
          </motion.div>
          
          <h1 className="viral-title">Algemene Voorwaarden</h1>
          <p className="viral-subtitle max-w-2xl mx-auto">
            Door gebruik te maken van PrankCall.nl ga je akkoord met deze voorwaarden. 
            Lees ze zorgvuldig door om te begrijpen wat wel en niet is toegestaan.
          </p>
          
          <p className="text-sm text-viral-text-secondary mt-4">
            Laatst bijgewerkt: 5 september 2025
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Service Description */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Wat is PrankCall.nl?</h2>
                <p className="text-viral-text-secondary">
                  PrankCall.nl is een Nederlandse AI-service waarmee je grappige, onschuldige prank calls kunt maken 
                  naar vrienden en familie met verschillende scenario's.
                </p>
              </div>
            </div>

            <div className="bg-viral-dark-lighter p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-viral-primary">Onze Service Omvat:</h3>
              <ul className="text-sm text-viral-text-secondary space-y-1">
                <li>• AI-gegenereerde prank calls in het Nederlands</li>
                <li>• Verschillende grappige scenario's</li>
                <li>• Opname functionaliteit (optioneel)</li>
                <li>• Credits-gebaseerd betalingssysteem</li>
                <li>• Dashboard voor call geschiedenis</li>
              </ul>
            </div>
          </motion.div>

          {/* Acceptable Use */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Toegestaan Gebruik</h2>
                <p className="text-viral-text-secondary">
                  PrankCall.nl is bedoeld voor onschuldige grappen en entertainment tussen mensen die elkaar kennen.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-400">✅ Wel Toegestaan</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Prank calls naar vrienden en familie</li>
                  <li>• Onschuldige, grappige scenario's</li>
                  <li>• Calls waar beide partijen uiteindelijk om kunnen lachen</li>
                  <li>• Respectvolle grappen</li>
                </ul>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">❌ Niet Toegestaan</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Pesten, intimideren of bedreigen</li>
                  <li>• Calls naar onbekenden zonder toestemming</li>
                  <li>• Schadelijke of kwetsende inhoud</li>
                  <li>• Commerciële of spam doeleinden</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Prohibited Activities */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Verboden Activiteiten</h2>
                <p className="text-viral-text-secondary">
                  Deze activiteiten zijn strikt verboden en kunnen leiden tot het sluiten van je account.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">🚫 Schadelijke Activiteiten</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Bedreigingen of intimidatie</li>
                  <li>• Discriminatie of haatdragende taal</li>
                  <li>• Opzettelijk emotionele schade toebrengen</li>
                  <li>• Calls naar hulpdiensten (politie, brandweer, ambulance)</li>
                </ul>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">🚫 Illegale Activiteiten</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Fraude of identiteitsdiefstal</li>
                  <li>• Oplichting of financieel misbruik</li>
                  <li>• Stalking of continue ongewenste contact</li>
                  <li>• Schenden van privacy van anderen</li>
                </ul>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">⚠️ Technisch Misbruik</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Automatiseren van calls via scripts</li>
                  <li>• Overmatig gebruik (spamming)</li>
                  <li>• Omzeilen van beveiligingsmaatregelen</li>
                  <li>• Reverse engineering van onze service</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Payment Terms */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Betaling & Credits</h2>
                <p className="text-viral-text-secondary">
                  PrankCall.nl werkt met een credits-systeem voor eerlijke en transparante prijzen.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Credits Systeem</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• 1 credit = 1 prank call</li>
                  <li>• Credits verlopen niet</li>
                  <li>• Verschillende pakketten beschikbaar</li>
                  <li>• Veilige betalingen via Stripe</li>
                </ul>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-viral-primary">Restitutie Beleid</h3>
                <ul className="text-sm text-viral-text-secondary space-y-1">
                  <li>• Credits bij technische problemen</li>
                  <li>• Geen restitutie bij misbruik</li>
                  <li>• 14 dagen bedenktijd (ongebruikte credits)</li>
                  <li>• Contact support voor vragen</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Account Responsibilities */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-viral-primary" />
              Jouw Verantwoordelijkheden
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Account Beveiliging</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Houd je inloggegevens veilig en deel je account niet met anderen. 
                    Je bent verantwoordelijk voor alle activiteiten op je account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Respectvol Gebruik</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Gebruik onze service alleen voor onschuldige grappen en zorg ervoor dat 
                    de persoon die je belt uiteindelijk om de prank kan lachen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Juridische Naleving</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Je bent zelf verantwoordelijk voor het naleven van lokale wetten en regelgeving 
                    bij het gebruik van onze service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-viral-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Rapportage van Misbruik</h3>
                  <p className="text-sm text-viral-text-secondary">
                    Meld misbruik van onze service direct aan ons team via 
                    <a href="mailto:abuse@prankcall.nl" className="text-viral-primary hover:underline ml-1">
                      abuse@prankcall.nl
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Gavel className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Aansprakelijkheid</h2>
                <p className="text-viral-text-secondary">
                  Belangrijke informatie over onze aansprakelijkheid en jouw eigen verantwoordelijkheid.
                </p>
              </div>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-400">⚠️ Belangrijke Disclaimer</h3>
              <p className="text-sm text-viral-text-secondary leading-relaxed">
                PrankCall.nl biedt deze service "as is" aan. We zijn niet aansprakelijk voor schade 
                die voortvloeit uit het gebruik van onze service. Gebruikers zijn volledig verantwoordelijk 
                voor hun eigen gedrag en de gevolgen van hun prank calls. We raden aan om altijd 
                respect te tonen en rekening te houden met de gevoelens van anderen.
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div 
            className="viral-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-viral-primary" />
              Vragen over de Voorwaarden?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-viral-text-secondary mb-4">
                  Heb je vragen over deze algemene voorwaarden of ben je niet zeker of 
                  bepaald gebruik is toegestaan? Neem contact met ons op!
                </p>
                
                <div className="space-y-2">
                  <a 
                    href="mailto:legal@prankcall.nl" 
                    className="flex items-center gap-2 text-viral-primary hover:text-viral-primary/80 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    legal@prankcall.nl
                  </a>
                </div>
              </div>

              <div className="bg-viral-dark-lighter p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Updates van Voorwaarden</h3>
                <p className="text-sm text-viral-text-secondary">
                  We kunnen deze voorwaarden van tijd tot tijd updaten. 
                  Bij belangrijke wijzigingen sturen we je een email. 📧
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Terms