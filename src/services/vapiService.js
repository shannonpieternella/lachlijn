// VAPI Service voor AI Prank Calls
const VAPI_BASE_URL = 'https://api.vapi.ai'
const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY

class VapiService {
  constructor() {
    this.apiKey = VAPI_API_KEY
    this.baseURL = VAPI_BASE_URL
  }

  // Helper method voor API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...options,
    }

    // Merge headers properly
    if (options.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers,
      }
    }

    try {
      console.log('VAPI Request:', url, defaultOptions)
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`VAPI API Error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('VAPI Response:', data)
      return data
      
    } catch (error) {
      console.error('VAPI Service Error:', error)
      throw error
    }
  }

  // Haal alle assistants/agents op
  async getAgents() {
    try {
      const response = await this.makeRequest('/assistant')
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching agents:', error)
      throw error
    }
  }

  // Maak een nieuwe prank call
  async createCall(params) {
    const {
      agentId,
      phoneNumber,
      scenario,
      customerNumber = null // Nederlands nummer van gebruiker (optioneel)
    } = params

    try {
      // Use exact working format from your example
      const callData = {
        type: "outboundPhoneCall",
        assistantId: agentId,
        phoneNumberId: import.meta.env.VITE_VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber
        }
      }

      console.log('Creating call with corrected data:', callData)
      
      const response = await this.makeRequest('/call', {
        method: 'POST',
        body: JSON.stringify(callData)
      })

      console.log('Call creation successful:', response)
      
      return {
        success: true,
        callId: response.id,
        status: response.status,
        data: response
      }

    } catch (error) {
      console.error('Error creating call:', error)
      throw error
    }
  }

  // Haal call status op
  async getCallStatus(callId) {
    try {
      const response = await this.makeRequest(`/call/${callId}`)
      
      return {
        id: response.id,
        status: response.status, // queued, ringing, in-progress, forwarding, ended
        startedAt: response.startedAt,
        endedAt: response.endedAt,
        duration: response.duration,
        recordingUrl: response.recordingUrl,
        transcript: response.transcript,
        cost: response.cost
      }
      
    } catch (error) {
      console.error('Error getting call status:', error)
      throw error
    }
  }

  // Stop een lopende call
  async hangupCall(callId) {
    try {
      await this.makeRequest(`/call/${callId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'ended'
        })
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error hanging up call:', error)
      return { success: false, error: error.message }
    }
  }

  // Maak een nieuwe assistant/agent
  async createAgent(agentData) {
    const {
      name,
      firstMessage,
      systemMessage,
      model = 'gpt-4',
      voice = 'elevenlabs',
      transcriber = 'deepgram'
    } = agentData

    try {
      const assistantData = {
        name: name,
        firstMessage: firstMessage,
        systemMessage: systemMessage,
        model: {
          provider: 'openai',
          model: model,
          messages: [
            {
              role: 'system',
              content: systemMessage
            }
          ]
        },
        voice: {
          provider: voice,
          voiceId: 'dutch-male' // Of andere Nederlandse stem
        },
        transcriber: {
          provider: transcriber,
          model: 'nova-2',
          language: 'nl' // Nederlands
        }
      }

      const response = await this.makeRequest('/assistant', {
        method: 'POST',
        body: JSON.stringify(assistantData)
      })

      return {
        success: true,
        agent: response
      }

    } catch (error) {
      console.error('Error creating agent:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update een bestaande agent
  async updateAgent(agentId, agentData) {
    try {
      const response = await this.makeRequest(`/assistant/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(agentData)
      })

      return {
        success: true,
        agent: response
      }

    } catch (error) {
      console.error('Error updating agent:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Verwijder een agent
  async deleteAgent(agentId) {
    try {
      await this.makeRequest(`/assistant/${agentId}`, {
        method: 'DELETE'
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting agent:', error)
      return { success: false, error: error.message }
    }
  }

  // Test API verbinding
  async testConnection() {
    try {
      // Test met het ophalen van assistants als connectie test
      await this.makeRequest('/assistant')
      return { success: true }
    } catch (error) {
      console.error('VAPI connection test failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Valideer telefoonnummer (Nederlandse nummers)
  validatePhoneNumber(phoneNumber) {
    // Nederlandse mobiele nummers: +31 6 xxxxxxxx
    // Nederlandse vaste nummers: +31 xx xxxxxxx
    const dutchMobileRegex = /^(\+31|0031|0)6[0-9]{8}$/
    const dutchLandlineRegex = /^(\+31|0031|0)[1-9][0-9]{7,8}$/
    
    const cleanNumber = phoneNumber.replace(/[\s-()]/g, '')
    
    return {
      isValid: dutchMobileRegex.test(cleanNumber) || dutchLandlineRegex.test(cleanNumber),
      isMobile: dutchMobileRegex.test(cleanNumber),
      isLandline: dutchLandlineRegex.test(cleanNumber),
      formatted: this.formatDutchNumber(cleanNumber)
    }
  }

  // Formatteer Nederlands nummer
  formatDutchNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s-()]/g, '')
    
    // Converteer naar +31 formaat
    if (cleanNumber.startsWith('0')) {
      return '+31' + cleanNumber.substring(1)
    } else if (cleanNumber.startsWith('0031')) {
      return '+31' + cleanNumber.substring(4)
    } else if (cleanNumber.startsWith('+31')) {
      return cleanNumber
    }
    
    return phoneNumber
  }
}

// Exporteer een singleton instance
const vapiService = new VapiService()
export default vapiService

// Exporteer ook de class voor als je meerdere instances nodig hebt
export { VapiService }
