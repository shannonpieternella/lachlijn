import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Link,
  User,
  Phone,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Bot
} from 'lucide-react'
import vapiService from '../services/vapiService'
import AdminAssistants from './AdminAssistants'

const Admin = ({ user }) => {
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('assistants')
  
  // Prank scenarios (database-sourced)
  const [scenarios, setScenarios] = useState([])

  // VAPI agents management
  const [vapiAgents, setVapiAgents] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  
  // Edit states
  const [editingScenario, setEditingScenario] = useState(null)
  const [isAddingScenario, setIsAddingScenario] = useState(false)
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    userDescription: '', // Description that users will see
    icon: '🎭',
    image: '', // Image URL for the scenario
    category: 'Nieuw',
    difficulty: 'Makkelijk',
    duration: '2-5 min',
    script: '',
    vapiAgentId: '',
    isActive: true,
    availableForUsers: false, // Whether users can see/use this scenario
    audioProvider: 'none',
    audioUrl: '',
    voiceId: ''
  })

  const [copiedId, setCopiedId] = useState(null)

  // Admin authentication
  const handleAdminAuth = (e) => {
    e.preventDefault()
    // In production, this should be a proper authentication system
    if (adminPassword === 'prankadmin2024') {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
    } else {
      alert('Onjuist wachtwoord!')
    }
  }

  // Check if already authenticated
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Fetch VAPI agents
  const fetchVapiAgents = async () => {
    setLoadingAgents(true)
    try {
      console.log('Fetching VAPI agents...')
      const agents = await vapiService.getAgents()
      console.log('Fetched agents:', agents)
      
      if (!Array.isArray(agents)) {
        console.warn('VAPI response is not an array:', agents)
        setVapiAgents([])
        return
      }
      
      // Transform VAPI response to our format
      const formattedAgents = agents.map(agent => ({
        id: agent.id,
        name: agent.name || `Agent ${agent.id}`,
        description: agent.firstMessage || agent.systemMessage || 'VAPI AI Agent',
        model: agent.model?.model || 'gpt-4',
        voice: agent.voice?.provider || 'elevenlabs',
        transcriber: agent.transcriber?.provider || 'deepgram'
      }))
      
      console.log('Formatted agents:', formattedAgents)
      setVapiAgents(formattedAgents)
      
      if (formattedAgents.length === 0) {
        alert('Geen VAPI agents gevonden in je account. Maak eerst agents aan in je VAPI dashboard.')
      }
    } catch (error) {
      console.error('Error fetching VAPI agents:', error)
      alert(`Fout bij ophalen VAPI agents: ${error.message}\n\nControleer je VAPI API key en internetverbinding.`)
      setVapiAgents([])
    }
    setLoadingAgents(false)
  }

  // Fetch scenarios from API
  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/admin/scenarios', {
        headers: {
          'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data.scenarios) && data.scenarios.length > 0) {
          setScenarios(data.scenarios)
        } else {
          console.warn('Admin API returned no scenarios; keeping current list')
        }
      } else {
        console.error('Failed to fetch scenarios:', response.status)
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchVapiAgents()
      fetchScenarios()
    }
  }, [isAuthenticated])

  // Save scenario to API
  const saveScenario = async (scenario) => {
    try {
      // Transform scenario data for the backend model
      const backendScenario = {
        name: scenario.name,
        description: scenario.description || scenario.userDescription || 'Scenario beschrijving', // Use userDescription as fallback
        userDescription: scenario.userDescription || '', // Include separate user description
        script: scenario.script || scenario.description || scenario.userDescription || 'Openingszin voor ' + scenario.name, // script is required
        icon: scenario.icon || '🎭',
        image: scenario.image || '', // Include image field
        category: scenario.category || 'Nieuw',
        difficulty: scenario.difficulty || 'Makkelijk',
        duration: scenario.duration || '2-5 min',
        vapiAgentId: scenario.vapiAgentId || '',
        isActive: scenario.isActive !== undefined ? scenario.isActive : true,
        isPublic: scenario.availableForUsers !== undefined ? scenario.availableForUsers : false, // Map availableForUsers to isPublic
        audioProvider: scenario.audioProvider || 'none',
        audioUrl: scenario.audioUrl || '',
        voiceId: scenario.voiceId || ''
      }

      // Generate unique ID for new scenarios (simple method)
      if (!editingScenario) {
        backendScenario.id = scenario.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '') + '_' + Date.now()
      }

      console.log('Sending scenario data to backend:', backendScenario)
      
      if (editingScenario) {
        // Update existing scenario
        const response = await fetch(`/api/admin/scenarios/${editingScenario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
          },
          body: JSON.stringify(backendScenario)
        })
        
        if (response.ok) {
          await fetchScenarios() // Refresh scenarios list
          setEditingScenario(null)
        } else {
          const errorText = await response.text()
          console.error('Update error response:', errorText)
          throw new Error('Failed to update scenario: ' + errorText)
        }
      } else {
        // Create new scenario
        const response = await fetch('/api/admin/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
          },
          body: JSON.stringify(backendScenario)
        })
        
        if (response.ok) {
          await fetchScenarios() // Refresh scenarios list
          setIsAddingScenario(false)
          setNewScenario({
            name: '',
            description: '',
            userDescription: '',
            icon: '🎭',
            image: '',
            category: 'Nieuw',
            difficulty: 'Makkelijk',
            duration: '2-5 min',
            script: '',
            vapiAgentId: '',
            isActive: true,
            availableForUsers: false,
            audioProvider: 'none',
            audioUrl: '',
            voiceId: ''
          })
        } else {
          const errorText = await response.text()
          console.error('Create error response:', errorText)
          throw new Error('Failed to create scenario: ' + errorText)
        }
      }
    } catch (error) {
      console.error('Error saving scenario:', error)
      alert('Er ging iets mis bij het opslaan van het scenario: ' + error.message)
    }
  }

  const deleteScenario = async (scenario) => {
    if (confirm('Weet je zeker dat je dit scenario wilt verwijderen?')) {
      try {
        const scenarioId = scenario.id || scenario._id
        console.log('🗑️ Deleting scenario:', scenarioId)
        
        const response = await fetch(`/api/admin/scenarios/${scenarioId}`, {
          method: 'DELETE',
          headers: {
            'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
          }
        })
        
        if (response.ok) {
          await fetchScenarios() // Refresh scenarios list
        } else {
          throw new Error('Failed to delete scenario')
        }
      } catch (error) {
        console.error('Error deleting scenario:', error)
        alert('Er ging iets mis bij het verwijderen van het scenario.')
      }
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-viral-dark">
        <motion.div
          className="viral-card max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-viral-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Admin Toegang</h1>
            <p className="text-viral-text-secondary">
              Voer het admin wachtwoord in om toegang te krijgen
            </p>
          </div>

          <form onSubmit={handleAdminAuth}>
            <div className="mb-6">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="viral-input pr-12"
                  placeholder="Admin wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-viral-text-secondary hover:text-viral-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="viral-button viral-button-primary w-full">
              <Shield className="w-5 h-5" />
              Inloggen
            </button>
          </form>
        </motion.div>
      </div>
    )
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="viral-heading">Admin Dashboard 🛠️</h1>
              <p className="viral-text">Beheer prank scenarios en VAPI agents</p>
            </div>
            
            <button
              onClick={() => {
                setIsAuthenticated(false)
                localStorage.removeItem('adminAuth')
              }}
              className="viral-button viral-button-ghost"
            >
              <X className="w-4 h-4" />
              Uitloggen
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('pranks')}
            className={`viral-button ${
              activeTab === 'pranks' ? 'viral-button-primary' : 'viral-button-ghost'
            }`}
          >
            <Phone className="w-4 h-4" />
            Prank Scenarios
          </button>
          
          <button
            onClick={() => setActiveTab('assistants')}
            className={`viral-button ${
              activeTab === 'assistants' ? 'viral-button-primary' : 'viral-button-ghost'
            }`}
          >
            <Bot className="w-4 h-4" />
            VAPI Assistants
          </button>
          
          <button
            onClick={() => setActiveTab('agents')}
            className={`viral-button ${
              activeTab === 'agents' ? 'viral-button-primary' : 'viral-button-ghost'
            }`}
          >
            <User className="w-4 h-4" />
            VAPI Agents
          </button>
        </div>

        {/* VAPI Assistants Tab */}
        {activeTab === 'assistants' && (
          <AdminAssistants />
        )}

        {/* Prank Scenarios Tab */}
        {activeTab === 'pranks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Prank Scenarios</h2>
              <button
                onClick={() => setIsAddingScenario(true)}
                className="viral-button viral-button-primary"
              >
                <Plus className="w-4 h-4" />
                Nieuw Scenario
              </button>
            </div>

            {/* Add New Scenario Form */}
            {isAddingScenario && (
              <ScenarioForm
                scenario={newScenario}
                setScenario={setNewScenario}
                vapiAgents={vapiAgents}
                onSave={() => saveScenario(newScenario)}
                onCancel={() => setIsAddingScenario(false)}
                isEditing={false}
              />
            )}

            {/* Scenarios List */}
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id}>
                  {editingScenario === scenario.id ? (
                    <ScenarioForm
                      scenario={scenario}
                      setScenario={(updated) => setScenarios(prev => 
                        prev.map(s => s.id === scenario.id ? updated : s)
                      )}
                      vapiAgents={vapiAgents}
                      onSave={() => saveScenario(scenarios.find(s => s.id === scenario.id))}
                      onCancel={() => setEditingScenario(null)}
                      isEditing={true}
                    />
                  ) : (
                    <motion.div
                      className="viral-card"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{scenario.icon}</div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{scenario.name}</h3>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  scenario.isActive ? 'bg-green-400' : 'bg-red-400'
                                }`} title={scenario.isActive ? 'Actief' : 'Inactief'} />
                                {scenario.availableForUsers && (
                                  <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                    Voor Users
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-viral-text-secondary text-sm mb-1">
                              <strong>Admin:</strong> {scenario.description}
                            </p>
                            {scenario.userDescription && (
                              <p className="text-viral-text-secondary text-sm mb-2">
                                <strong>User:</strong> {scenario.userDescription}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-viral-text-muted mb-2">
                              <span>{scenario.category}</span>
                              <span>{scenario.difficulty}</span>
                              <span>{scenario.duration}</span>
                              {scenario.popularity && (
                                <span>{scenario.popularity}% populair</span>
                              )}
                            </div>
                            
                            {scenario.image && (
                              <div className="flex items-center gap-2 mb-2">
                                <img 
                                  src={scenario.image} 
                                  alt={scenario.name}
                                  className="w-16 h-10 object-cover rounded"
                                  onError={(e) => {e.target.style.display = 'none'}}
                                />
                                <span className="text-xs text-viral-text-muted">Preview afbeelding</span>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              {scenario.vapiAgentId ? (
                                <div className="flex items-center gap-2">
                                  <Link className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400">
                                    Agent: {vapiAgents.find(a => a.id === scenario.vapiAgentId)?.name || scenario.vapiAgentId}
                                  </span>
                                </div>
                              ) : scenario.availableForUsers && (
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                  <span className="text-xs text-yellow-400">Geen agent gekoppeld</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(scenario.id, scenario.id)}
                            className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors"
                            title="Kopieer ID"
                          >
                            {copiedId === scenario.id ? 
                              <Check className="w-4 h-4 text-green-400" /> : 
                              <Copy className="w-4 h-4" />
                            }
                          </button>
                          
                          <button
                            onClick={() => {
                              const scenarioId = scenario.id || scenario._id
                              console.log('Edit clicked for scenario:', scenarioId)
                              setEditingScenario(scenarioId)
                            }}
                            className="p-2 text-viral-text-secondary hover:text-viral-primary transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteScenario(scenario)}
                            className="p-2 text-viral-text-secondary hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VAPI Agents Tab */}
        {activeTab === 'agents' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">VAPI Agents</h2>
              <button
                onClick={fetchVapiAgents}
                className="viral-button viral-button-secondary"
                disabled={loadingAgents}
              >
                <RefreshCw className={`w-4 h-4 ${loadingAgents ? 'animate-spin' : ''}`} />
                Ververs
              </button>
            </div>

            {loadingAgents ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-viral-primary mx-auto mb-4" />
                <p className="text-viral-text-secondary">Laden van VAPI agents...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vapiAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    className="viral-card"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-viral-primary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{agent.name}</h3>
                          <p className="text-viral-text-secondary text-sm">
                            {agent.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-viral-text-muted">
                            <span className="font-mono bg-viral-dark-lighter px-2 py-1 rounded">
                              ID: {agent.id}
                            </span>
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              {agent.model}
                            </span>
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              {agent.voice}
                            </span>
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              {agent.transcriber}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(agent.id, agent.id)}
                          className="viral-button viral-button-ghost"
                        >
                          {copiedId === agent.id ? 
                            <Check className="w-4 h-4 text-green-400" /> : 
                            <Copy className="w-4 h-4" />
                          }
                          {copiedId === agent.id ? 'Gekopieerd!' : 'Kopieer ID'}
                        </button>
                        
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          scenarios.some(s => s.vapiAgentId === agent.id) 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {scenarios.some(s => s.vapiAgentId === agent.id) ? 'Gekoppeld' : 'Niet gekoppeld'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Scenario Form Component
const ScenarioForm = ({ scenario, setScenario, vapiAgents, onSave, onCancel, isEditing }) => {
  const [localScenario, setLocalScenario] = useState(scenario || {})
  const [previewingAudio, setPreviewingAudio] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Update local state when scenario prop changes
  useEffect(() => {
    if (scenario) {
      setLocalScenario(scenario)
    }
  }, [scenario])
  
  const handleInputChange = (field, value) => {
    const updated = { ...localScenario, [field]: value }
    setLocalScenario(updated)
    if (setScenario) {
      setScenario(updated)
    }
  }

  const handleImageFileChange = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecteer een geldig afbeeldingsbestand')
      return
    }
    if (file.size > 8 * 1024 * 1024) { // 8MB
      alert('Afbeelding is te groot (max 8MB)')
      return
    }
    try {
      setIsUploadingImage(true)
      const toDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const dataUrl = await toDataUrl(file)
      const res = await fetch('/api/admin/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
        },
        body: JSON.stringify({ dataUrl })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Upload mislukt')
      }
      const { url } = await res.json()
      handleInputChange('image', url)
    } catch (err) {
      console.error('Image upload error:', err)
      alert('Afbeelding uploaden mislukt: ' + (err.message || 'Onbekende fout'))
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handlePreviewAudio = async (audioInput) => {
    if (!audioInput || audioInput.trim() === '') return
    
    setPreviewingAudio(true)
    
    try {
      const input = audioInput.trim()
      let audioUrl = input
      
      // Check if it's a VAPI audio ID (not a URL)
      if (!/^https?:\/\//.test(input)) {
        // Try to get the audio URL from VAPI
        const response = await fetch(`/api/admin/audio/${encodeURIComponent(input)}`, {
          headers: {
            'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD || 'prankadmin2024'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          audioUrl = data.audioUrl
        } else {
          throw new Error('Could not fetch VAPI audio')
        }
      }
      
      // Play the audio
      const audio = new Audio(audioUrl)
      audio.play()
      
      // Show feedback
      console.log('🔊 Playing audio:', audioUrl)
      
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('Kan audio niet afspelen: ' + error.message)
    } finally {
      setPreviewingAudio(false)
    }
  }

  return (
    <motion.div
      className="viral-card viral-card-glow mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-bold mb-4">
        {isEditing ? 'Bewerk Scenario' : 'Nieuw Scenario'}
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Naam
            </label>
            <input
              type="text"
              value={localScenario.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="viral-input"
              placeholder="Scenario naam"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={localScenario.icon || ''}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className="viral-input"
              placeholder="🎭"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
            Admin Beschrijving
          </label>
          <textarea
            value={localScenario.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="viral-input"
            rows="2"
            placeholder="Interne beschrijving voor admins"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
            Gebruiker Beschrijving
          </label>
          <textarea
            value={localScenario.userDescription || ''}
            onChange={(e) => handleInputChange('userDescription', e.target.value)}
            className="viral-input"
            rows="2"
            placeholder="Beschrijving die gebruikers zien (verkopend)"
          />
          <p className="text-xs text-viral-text-muted mt-1">
            Dit is wat gebruikers zien als ze het scenario kiezen
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
            Afbeelding URL
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div className="md:col-span-2 space-y-2">
              <input
                type="url"
                value={localScenario.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="viral-input"
                placeholder="https://images.unsplash.com/photo-xxxxx?w=400"
              />
              <div className="flex items-center gap-3">
                <label className="viral-button viral-button-ghost cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e.target.files?.[0])}
                  />
                  {isUploadingImage ? 'Uploaden…' : 'Upload Afbeelding'}
                </label>
                <span className="text-xs text-viral-text-muted">of plak een URL hierboven</span>
              </div>
              <p className="text-xs text-viral-text-muted">
                Afbeelding die gebruikers zien bij het scenario (optioneel). Ondersteund: PNG, JPG, WEBP.
              </p>
            </div>
            <div>
              {localScenario.image && (
                <img
                  src={localScenario.image}
                  alt="Voorbeeld"
                  className="w-40 h-24 object-cover rounded border border-viral-dark-lighter"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Categorie
            </label>
            <select
              value={localScenario.category || 'Klassiek'}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="viral-select"
            >
              <option value="Klassiek">Klassiek</option>
              <option value="Familie">Familie</option>
              <option value="Werk">Werk</option>
              <option value="Media">Media</option>
              <option value="Verkoop">Verkoop</option>
              <option value="Geluk">Geluk</option>
              <option value="Nieuw">Nieuw</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Moeilijkheid
            </label>
            <select
              value={localScenario.difficulty || 'Makkelijk'}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="viral-select"
            >
              <option value="Makkelijk">Makkelijk</option>
              <option value="Gemiddeld">Gemiddeld</option>
              <option value="Moeilijk">Moeilijk</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Duur
            </label>
            <input
              type="text"
              value={localScenario.duration || ''}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="viral-input"
              placeholder="2-4 min"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
            VAPI Agent Koppeling
          </label>
          <select
            value={localScenario.vapiAgentId || ''}
            onChange={(e) => handleInputChange('vapiAgentId', e.target.value)}
            className="viral-select"
          >
            <option value="">Geen agent gekoppeld</option>
            {vapiAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.id})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-viral-text-secondary mb-2">
            Script / Openingszin
          </label>
          <textarea
            value={localScenario.script || ''}
            onChange={(e) => handleInputChange('script', e.target.value)}
            className="viral-input"
            rows="3"
            placeholder="De openingszin voor dit scenario..."
          />
        </div>

        {/* Audio configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Audio Provider
            </label>
            <select
              value={localScenario.audioProvider || 'none'}
              onChange={(e) => handleInputChange('audioProvider', e.target.value)}
              className="viral-select"
            >
              <option value="none">Geen</option>
              <option value="elevenlabs">ElevenLabs</option>
              <option value="url">Extern Audio URL</option>
              <option value="upload">Upload (lokaal)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Voice ID / Preset
            </label>
            <input
              type="text"
              value={localScenario.voiceId || ''}
              onChange={(e) => handleInputChange('voiceId', e.target.value)}
              className="viral-input"
              placeholder="bijv. dutch-male-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-viral-text-secondary mb-2">
              Audio URL (optioneel)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localScenario.audioUrl || ''}
                onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                className="viral-input flex-1"
                placeholder="VAPI audio ID (bijv. abc123) of volledige URL"
              />
              {localScenario.audioUrl && localScenario.audioUrl.trim() && (
                <button
                  type="button"
                  onClick={() => handlePreviewAudio(localScenario.audioUrl)}
                  className="viral-button viral-button-ghost px-3"
                  title="Preview audio"
                  disabled={previewingAudio}
                >
                  {previewingAudio ? '⏳' : '🔊'}
                </button>
              )}
            </div>
            <p className="text-xs text-viral-text-muted mt-1">
              Voer een VAPI audio ID in (bijv. "abc123") of een volledige URL. 
              Klik op 🔊 om de audio te beluisteren.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localScenario.isActive || false}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-viral-primary bg-viral-dark-lighter border-viral-border rounded focus:ring-viral-primary focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium">Scenario Actief</span>
              <p className="text-xs text-viral-text-muted">Scenario is actief in het systeem</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localScenario.availableForUsers || false}
              onChange={(e) => handleInputChange('availableForUsers', e.target.checked)}
              className="w-4 h-4 text-viral-primary bg-viral-dark-lighter border-viral-border rounded focus:ring-viral-primary focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium">Beschikbaar voor Gebruikers</span>
              <p className="text-xs text-viral-text-muted">Gebruikers kunnen dit scenario zien en gebruiken</p>
            </div>
          </label>

          {localScenario.availableForUsers && !localScenario.vapiAgentId && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Koppel een VAPI agent om dit scenario beschikbaar te maken voor gebruikers
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-4 border-t border-viral-dark-lighter">
          <button
            onClick={onSave}
            className="viral-button viral-button-primary"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Opslaan' : 'Toevoegen'}
          </button>
          
          <button
            onClick={onCancel}
            className="viral-button viral-button-ghost"
          >
            <X className="w-4 h-4" />
            Annuleren
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Admin
