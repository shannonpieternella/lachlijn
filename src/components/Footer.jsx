import { Laugh, Heart, Shield, Mail, MessageCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-viral-dark to-viral-dark-light border-t border-viral-dark-lighter/50">
      <div className="viral-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Laugh className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Lachlijn.nl
              </span>
            </Link>
            <p className="text-viral-text-secondary mb-4 lg:mb-6 max-w-md leading-relaxed text-sm lg:text-base">
              De #1 AI Comedy Call Platform van Nederland. Vriendelijk entertainment met Nederlandse AI stemmen. 
              100% Nederlands, 100% respectvol, 100% voor de lol!
            </p>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-viral-text-muted">
              Gemaakt met <Heart className="w-4 h-4 text-red-400 animate-pulse" /> in Nederland 🇳🇱
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-viral-text-primary text-sm lg:text-base">Snel Naar</h3>
            <ul className="space-y-2 lg:space-y-3">
              <li>
                <Link to="/prank" className="text-xs lg:text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Comedy Calls
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-xs lg:text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Credits Kopen
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-xs lg:text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Dashboard
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-xs lg:text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Mijn Account
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-bold mb-4 text-viral-text-primary">Informatie</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Privacy Beleid
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Algemene Voorwaarden
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Contact & Hulp
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/responsible-use" className="text-sm text-viral-text-secondary hover:text-viral-primary transition-colors flex items-center gap-2 group">
                  Verantwoord Gebruik
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Responsible Use Notice */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold mb-2 lg:mb-3 text-base lg:text-lg text-green-400">Vriendelijk Entertainment 🤝</h3>
              <p className="text-viral-text-secondary leading-relaxed text-sm lg:text-base">
                Lachlijn.nl is bedoeld voor positief entertainment tussen vrienden en familie. 
                We promoten respectvolle comedy en zorgen ervoor dat iedereen kan meelachen. 
                Gebruik onze service voor vriendelijk vermaak met wederzijds respect en toestemming.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between pt-6 lg:pt-8 border-t border-viral-dark-lighter/50 gap-4 lg:gap-6">
          <div className="text-xs lg:text-sm text-viral-text-secondary text-center lg:text-left">
            © 2024 Lachlijn.nl - Alle rechten voorbehouden
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            <a 
              href="mailto:hallo@lachlijn.nl" 
              className="flex items-center gap-2 text-xs lg:text-sm text-viral-text-secondary hover:text-viral-primary transition-all duration-200 group"
            >
              <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              hallo@lachlijn.nl
            </a>
            
            <div className="hidden lg:block w-px h-4 bg-viral-dark-lighter"></div>
            
            <span className="text-xs text-viral-text-muted text-center">
              Made with ❤️ for Dutch comedy lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer