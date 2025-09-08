import fetch from 'node-fetch'

const VAPI_BASE_URL = 'https://api.vapi.ai'
const VAPI_API_KEY = process.env.VAPI_API_KEY
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID
const VAPI_PHONE_NUMBER = process.env.VAPI_PHONE_NUMBER

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
    const response = await this.makeRequest('/assistant')
    return response.data || response || []
  }

  // Maak een nieuwe prank call
  async createCall(params) {
    const {
      agentId,
      phoneNumber,
      scenario,
      targetName = null,
      customerNumber = null
    } = params

    // Use exact working format that works in frontend admin
    const callData = {
      type: "outboundPhoneCall",
      assistantId: agentId,
      phoneNumberId: VAPI_PHONE_NUMBER_ID,
      customer: {
        number: phoneNumber
      }
    }

    // Add target name as variable for the assistant to use in scenarios
    if (targetName && targetName.length > 0) {
      console.log('🎯 Adding targetName variable:', targetName)
      callData.assistantOverrides = {
        variableValues: {
          name: targetName
        }
      }
      console.log('📋 Final callData structure:', JSON.stringify(callData, null, 2))
    } else {
      console.log('❌ No targetName provided or empty string')
    }

    console.log('Creating call with data:', callData)
    
    const response = await this.makeRequest('/call', {
      method: 'POST',
      body: JSON.stringify(callData)
    })

    return {
      success: true,
      callId: response.id,
      status: response.status,
      data: response
    }
  }

  // Haal call status op
  async getCallStatus(callId) {
    const response = await this.makeRequest(`/call/${callId}`)
    
    return {
      id: response.id,
      status: response.status,
      startedAt: response.startedAt,
      endedAt: response.endedAt,
      duration: response.duration,
      recordingUrl: response.recordingUrl,
      transcript: response.transcript,
      cost: response.cost,
      
      // Enhanced quality data
      wasAnswered: response.wasAnswered,
      hitVoicemail: response.hitVoicemail,
      callQuality: response.callQuality,
      humanInteraction: response.humanInteraction,
      conversationFlow: response.conversationFlow
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

  // Get VAPI audio file via API
  async getAudioFile(audioId) {
    try {
      const response = await this.makeRequest(`/file/${audioId}`)
      return response
    } catch (error) {
      console.error('Error fetching VAPI audio file:', error)
      throw error
    }
  }

  // Get audio file URL from VAPI
  async getAudioUrl(audioId) {
    try {
      const audioFile = await this.getAudioFile(audioId)
      // VAPI should return the audio file data or URL
      return audioFile.url || audioFile.downloadUrl || null
    } catch (error) {
      console.error('Error getting VAPI audio URL:', error)
      return null
    }
  }

  // Helper to validate if input is a VAPI audio ID
  isVapiAudioId(input) {
    if (!input || typeof input !== 'string') return false
    const trimmed = input.trim()
    // VAPI audio IDs are typically alphanumeric with dashes/underscores
    return /^[a-zA-Z0-9_-]+$/.test(trimmed) && !trimmed.startsWith('http')
  }
}

// Exporteer een singleton instance
const vapiService = new VapiService()
export default vapiService
