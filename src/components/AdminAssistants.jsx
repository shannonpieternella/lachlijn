import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Phone,
  MessageCircle,
  Settings,
  PlayCircle,
  TestTube
} from 'lucide-react'
import vapiService from '../services/vapiService'

const AdminAssistants = () => {
  const [assistants, setAssistants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [testCallAssistant, setTestCallAssistant] = useState(null)
  const [testPhoneNumber, setTestPhoneNumber] = useState('')
  const [testingCall, setTestingCall] = useState(false)
  const [apiConnected, setApiConnected] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    firstMessage: '',
    systemMessage: '',
    model: 'gpt-4',
    voice: 'elevenlabs',
    transcriber: 'deepgram'
  })

  useEffect(() => {
    loadAssistants()
    checkApiConnection()
  }, [])

  const checkApiConnection = async () => {
    try {
      const result = await vapiService.testConnection()
      setApiConnected(result.success)
    } catch (error) {
      console.error('Error checking API connection:', error)
      setApiConnected(false)
    }
  }

  const loadAssistants = async () => {
    try {
      setLoading(true)
      const data = await vapiService.getAgents()
      setAssistants(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading assistants:', error)
      setAssistants([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssistant = async (e) => {
    e.preventDefault()
    try {
      const result = await vapiService.createAgent(formData)
      if (result.success) {
        await loadAssistants()
        setShowCreateForm(false)
        resetForm()
        alert('Assistant succesvol aangemaakt!')
      } else {
        alert('Fout bij aanmaken assistant: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating assistant:', error)
      alert('Er ging iets mis bij het aanmaken van de assistant')
    }
  }

  const handleUpdateAssistant = async (assistantId, updates) => {
    try {
      const result = await vapiService.updateAgent(assistantId, updates)
      if (result.success) {
        await loadAssistants()
        setSelectedAssistant(null)
        alert('Assistant succesvol bijgewerkt!')
      } else {
        alert('Fout bij bijwerken assistant: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating assistant:', error)
      alert('Er ging iets mis bij het bijwerken van de assistant')
    }
  }

  const handleDeleteAssistant = async (assistantId) => {
    if (!confirm('Weet je zeker dat je deze assistant wilt verwijderen?')) return
    
    try {
      const result = await vapiService.deleteAgent(assistantId)
      if (result.success) {
        await loadAssistants()
        alert('Assistant succesvol verwijderd!')
      } else {
        alert('Fout bij verwijderen assistant: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting assistant:', error)
      alert('Er ging iets mis bij het verwijderen van de assistant')
    }
  }

  const handleTestCall = async () => {
    if (!testPhoneNumber) {
      alert('Voer een telefoonnummer in')
      return
    }

    // Check API connection first
    if (apiConnected === false) {
      alert('VAPI API is niet verbonden. Check je API key en internetverbinding.')
      return
    }

    const validation = vapiService.validatePhoneNumber(testPhoneNumber)
    if (!validation.isValid) {
      alert('Ongeldig Nederlands telefoonnummer. Gebruik format: +31 6 12345678 of 06 12345678')
      return
    }

    try {
      setTestingCall(true)
      const result = await vapiService.createCall({
        agentId: testCallAssistant.id,
        phoneNumber: validation.formatted,
        scenario: { name: 'Test Call' }
      })

      if (result.success) {
        alert(`✅ Test call gestart!\n\nCall ID: ${result.callId}\nNummer: ${validation.formatted}\n\nDe AI assistant zal nu bellen naar het opgegeven nummer.`)
        setTestCallAssistant(null)
        setTestPhoneNumber('')
      } else {
        alert('❌ Fout bij starten test call: ' + (result.error || 'Onbekende fout'))
      }
    } catch (error) {
      console.error('Error starting test call:', error)
      alert('❌ Er ging iets mis bij het starten van de test call. Check de console voor meer details.')
    } finally {
      setTestingCall(false)
    }
  }

  const openTestCallModal = (assistant) => {
    if (apiConnected === false) {
      alert('⚠️ VAPI API is niet verbonden. Check je API key in de .env file.')
      return
    }
    setTestCallAssistant(assistant)
    setTestPhoneNumber('')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      firstMessage: '',
      systemMessage: '',
      model: 'gpt-4',
      voice: 'elevenlabs',
      transcriber: 'deepgram'
    })
  }

  return (
    <div className="viral-container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="viral-heading flex items-center gap-3">
            <Bot className="w-8 h-8 text-viral-primary" />
            VAPI Assistants
          </h1>
          <p className="viral-text">Beheer je AI assistants voor prank calls</p>
          
          {/* API Connection Status */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${
              apiConnected === null ? 'bg-yellow-400' : 
              apiConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm text-viral-text-secondary">
              VAPI API: {
                apiConnected === null ? 'Checking...' :
                apiConnected ? 'Connected' : 'Disconnected'
              }
            </span>
            <button 
              onClick={checkApiConnection}
              className="text-xs text-viral-primary hover:underline ml-2"
            >
              Refresh
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="viral-button viral-button-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nieuwe Assistant
        </button>
      </div>

      {/* Create Assistant Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="viral-card mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nieuwe Assistant Aanmaken</h2>
            <button
              onClick={() => {setShowCreateForm(false); resetForm()}}
              className="text-viral-text-secondary hover:text-viral-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateAssistant} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Assistant Naam</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="viral-input"
                  placeholder="bijv. Pizza Bot NL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                  className="viral-input"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Eerste Bericht</label>
              <input
                type="text"
                value={formData.firstMessage}
                onChange={(e) => setFormData(prev => ({...prev, firstMessage: e.target.value}))}
                className="viral-input"
                placeholder="Hallo, u spreekt met Pizza Express..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">System Message (Instructies)</label>
              <textarea
                value={formData.systemMessage}
                onChange={(e) => setFormData(prev => ({...prev, systemMessage: e.target.value}))}
                className="viral-input min-h-[120px]"
                placeholder="Je bent een Nederlandse pizza bezorger die belt omdat er 47 pizza's zijn besteld..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="viral-button viral-button-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Aanmaken
              </button>
              <button
                type="button"
                onClick={() => {setShowCreateForm(false); resetForm()}}
                className="viral-button viral-button-secondary"
              >
                Annuleren
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Test Call Modal */}
      {testCallAssistant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="viral-card mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Test Call - {testCallAssistant.name}</h2>
            <button
              onClick={() => setTestCallAssistant(null)}
              className="text-viral-text-secondary hover:text-viral-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">📞 Nederlandse Telefoonnummer Formaten</h3>
              <div className="text-sm text-viral-text-secondary space-y-1">
                <div>• <code className="bg-viral-dark-lighter px-2 py-1 rounded">+31 6 12345678</code> (volledig internationaal)</div>
                <div>• <code className="bg-viral-dark-lighter px-2 py-1 rounded">06 12345678</code> (Nederlands mobiel)</div>
                <div>• <code className="bg-viral-dark-lighter px-2 py-1 rounded">+31 20 1234567</code> (vastnet met netnummer)</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefoonnummer voor Test Call
              </label>
              <input
                type="tel"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="viral-input"
                placeholder="bijv. +31 6 12345678 of 06 12345678"
                disabled={testingCall}
              />
              <p className="text-xs text-viral-text-secondary mt-1">
                Let op: De AI assistant zal daadwerkelijk dit nummer bellen!
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Test Call Informatie</h3>
              <ul className="text-sm text-viral-text-secondary space-y-1">
                <li>• Deze test call kost 1 credit en belt naar een echt nummer</li>
                <li>• De AI assistant gebruikt het eerste bericht: "{testCallAssistant.firstMessage}"</li>
                <li>• Zorg dat je het nummer mag bellen en leg uit dat het een test is</li>
                <li>• Call wordt direct gestart en is zichtbaar in je call geschiedenis</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTestCall}
                disabled={!testPhoneNumber || testingCall || !apiConnected}
                className={`viral-button flex items-center gap-2 ${
                  testPhoneNumber && !testingCall && apiConnected 
                    ? 'viral-button-primary' 
                    : 'viral-button-secondary opacity-50'
                }`}
              >
                {testingCall ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Call Starten...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Start Test Call
                  </>
                )}
              </button>
              
              <button
                onClick={() => setTestCallAssistant(null)}
                className="viral-button viral-button-ghost"
                disabled={testingCall}
              >
                Annuleren
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Assistants List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="viral-spinner mx-auto mb-4"></div>
          <p>Assistants laden...</p>
        </div>
      ) : assistants.length === 0 ? (
        <div className="viral-card text-center py-12">
          <Bot className="w-16 h-16 text-viral-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Geen Assistants Gevonden</h3>
          <p className="text-viral-text-secondary mb-6">
            Maak je eerste AI assistant aan om te beginnen met prank calls
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="viral-button viral-button-primary"
          >
            Eerste Assistant Aanmaken
          </button>
        </div>
      ) : (
        <div className="viral-grid viral-grid-2 lg:grid-cols-3">
          {assistants.map((assistant) => (
            <motion.div
              key={assistant.id}
              className="viral-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-viral-primary rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{assistant.name}</h3>
                    <p className="text-sm text-viral-text-secondary">
                      {assistant.model?.model || 'Unknown Model'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openTestCallModal(assistant)}
                    className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors"
                    title="Test Call"
                  >
                    <TestTube className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedAssistant(assistant)}
                    className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors"
                    title="Bewerken"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAssistant(assistant.id)}
                    className="p-2 text-viral-text-secondary hover:text-red-500 transition-colors"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-viral-text-muted" />
                    <span className="text-sm font-medium">Eerste Bericht:</span>
                  </div>
                  <p className="text-sm text-viral-text-secondary bg-viral-dark-lighter p-3 rounded">
                    {assistant.firstMessage || 'Geen eerste bericht ingesteld'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-viral-text-secondary">Voice:</span>
                  <span className="font-medium">{assistant.voice?.provider || 'Default'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-viral-text-secondary">Transcriber:</span>
                  <span className="font-medium">{assistant.transcriber?.provider || 'Default'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-viral-border">
                <button
                  onClick={() => openTestCallModal(assistant)}
                  className={`viral-button w-full flex items-center justify-center gap-2 ${
                    apiConnected ? 'viral-button-primary' : 'viral-button-secondary opacity-50'
                  }`}
                  disabled={!apiConnected}
                >
                  <Phone className="w-4 h-4" />
                  Test Call
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminAssistants