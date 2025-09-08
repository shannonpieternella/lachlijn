import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell,
  Download,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react'

const Profile = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  })
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    shareStats: false,
    saveRecordings: true
  })

  const handleSave = () => {
    onUpdateUser({ ...user, ...formData })
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  return (
    <div className="viral-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="viral-heading">Mijn Profiel 👤</h1>
          <p className="viral-text">Beheer je account instellingen en voorkeuren</p>
        </div>

        <div className="viral-grid viral-grid-2 gap-8">
          {/* Profile Info */}
          <div className="viral-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <User className="w-6 h-6 text-viral-primary" />
                Account Gegevens
              </h2>
              
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`viral-button ${isEditing ? 'viral-button-primary' : 'viral-button-secondary'}`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Opslaan' : 'Bewerken'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Voor- en Achternaam
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="viral-input"
                  />
                ) : (
                  <div className="p-4 bg-viral-dark-lighter rounded-lg">
                    {user.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Email Adres
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="viral-input"
                  />
                ) : (
                  <div className="p-4 bg-viral-dark-lighter rounded-lg">
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-viral-text-secondary mb-2">
                  Telefoonnummer (Optioneel)
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="viral-input"
                    placeholder="+31 6 12345678"
                  />
                ) : (
                  <div className="p-4 bg-viral-dark-lighter rounded-lg">
                    {user.phone || 'Niet ingesteld'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <button onClick={handleSave} className="viral-button viral-button-primary flex-1">
                    <Save className="w-4 h-4" />
                    Wijzigingen Opslaan
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone || ''
                      })
                    }}
                    className="viral-button viral-button-ghost"
                  >
                    <X className="w-4 h-4" />
                    Annuleren
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="viral-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-viral-primary" />
              Account Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
                <div>
                  <div className="font-medium">Account Type</div>
                  <div className="text-sm text-viral-text-secondary">
                    {user.plan === 'free' ? 'Gratis Account' : 'Premium Account'}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  user.plan === 'free' 
                    ? 'bg-gray-500/20 text-gray-400' 
                    : 'bg-viral-primary/20 text-viral-primary'
                }`}>
                  {user.plan === 'free' ? 'Gratis' : 'Premium'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
                <div>
                  <div className="font-medium">Credits Over</div>
                  <div className="text-sm text-viral-text-secondary">
                    Voor prank calls
                  </div>
                </div>
                <div className="text-2xl font-bold text-viral-primary">
                  {user.credits}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
                <div>
                  <div className="font-medium">Lid Sinds</div>
                  <div className="text-sm text-viral-text-secondary">
                    Account aangemaakt
                  </div>
                </div>
                <div className="text-viral-text-secondary">
                  Vandaag
                </div>
              </div>
            </div>

            {user.plan === 'free' && (
              <div className="mt-6">
                <a href="/pricing" className="viral-button viral-button-primary w-full">
                  Upgrade Naar Premium
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="viral-card mt-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Bell className="w-6 h-6 text-viral-primary" />
            Instellingen
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
              <div>
                <div className="font-medium">Email Notificaties</div>
                <div className="text-sm text-viral-text-secondary">
                  Ontvang emails over nieuwe features en updates
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-viral-primary focus:ring-offset-2 focus:ring-offset-viral-dark ${
                  settings.emailNotifications ? 'bg-viral-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
              <div>
                <div className="font-medium">Statistieken Delen</div>
                <div className="text-sm text-viral-text-secondary">
                  Deel anoniem je prank statistieken met anderen
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('shareStats')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-viral-primary focus:ring-offset-2 focus:ring-offset-viral-dark ${
                  settings.shareStats ? 'bg-viral-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.shareStats ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-viral-dark-lighter rounded-lg">
              <div>
                <div className="font-medium">Opnames Bewaren</div>
                <div className="text-sm text-viral-text-secondary">
                  Automatisch je prank call opnames opslaan
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('saveRecordings')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-viral-primary focus:ring-offset-2 focus:ring-offset-viral-dark ${
                  settings.saveRecordings ? 'bg-viral-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.saveRecordings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="viral-card mt-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Download className="w-6 h-6 text-viral-primary" />
            Data & Privacy
          </h2>

          <div className="space-y-4">
            <button className="viral-button viral-button-secondary w-full justify-start">
              <Download className="w-4 h-4" />
              Download Mijn Data
            </button>
            
            <button className="viral-button viral-button-ghost w-full justify-start text-red-400 border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
              Account Verwijderen
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Let op:</strong> Het verwijderen van je account is permanent en kan niet ongedaan worden gemaakt. 
              Al je prank calls en data worden permanent verwijderd.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile