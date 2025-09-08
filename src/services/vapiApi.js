import axios from 'axios';

const BASE_URL = 'https://api.vapi.ai';

class VapiApiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all call logs
  async getCalls(limit = 100, offset = 0) {
    try {
      // Try without parameters first
      const response = await this.api.get('/call');
      return response.data;
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  // Get specific call details
  async getCall(callId) {
    try {
      const response = await this.api.get(`/call/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw error;
    }
  }

  // Create a new call
  async createCall(callData) {
    try {
      const response = await this.api.post('/call', callData);
      return response.data;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  // Get call recordings/audio
  async getCallRecording(callId) {
    try {
      // Recording URL is already in the call data from getCalls
      const call = await this.getCall(callId);
      return {
        url: call.recordingUrl,
        stereoUrl: call.stereoRecordingUrl
      };
    } catch (error) {
      console.error('Error fetching call recording:', error);
      throw error;
    }
  }

  // Get call transcript
  async getCallTranscript(callId) {
    try {
      // Transcript is already in the call data
      const call = await this.getCall(callId);
      return call.transcript;
    } catch (error) {
      console.error('Error fetching call transcript:', error);
      throw error;
    }
  }

  // Get assistants
  async getAssistants() {
    try {
      const response = await this.api.get('/assistant');
      return response.data;
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error;
    }
  }

  // Wait for call completion
  async waitForCallCompletion(callId, maxWaitTime = 300000) {
    const startTime = Date.now();
    const pollInterval = 5000; // Poll every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const call = await this.getCall(callId);
        const status = call.status;
        
        // Check if call is completed
        if (status === 'completed' || 
            status === 'failed' || 
            status === 'ended' ||
            call.endedReason) {
          return call;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error polling call status:', error);
        // If we can't get call status, assume it failed
        return { status: 'failed', error: error.message };
      }
    }

    // Timeout reached
    return { status: 'timeout', error: 'Call monitoring timed out' };
  }

  // Create sequential bulk calls
  async createSequentialBulkCalls(phoneNumbers, assistantId, phoneNumberId, onProgress) {
    const results = [];
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i];
      
      try {
        // Update progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: phoneNumbers.length,
            phoneNumber,
            status: 'starting'
          });
        }

        // Create the call
        const callData = {
          assistantId,
          phoneNumberId,
          customer: {
            number: phoneNumber
          }
        };

        const call = await this.createCall(callData);
        
        // Update progress - call started
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: phoneNumbers.length,
            phoneNumber,
            status: 'calling',
            callId: call.id
          });
        }

        // Wait for call completion
        const completedCall = await this.waitForCallCompletion(call.id);
        
        results.push({
          phoneNumber,
          status: completedCall.status === 'completed' ? 'success' : 'failed',
          callId: call.id,
          result: completedCall,
          endedReason: completedCall.endedReason
        });

        // Update progress - call completed
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: phoneNumbers.length,
            phoneNumber,
            status: 'completed',
            callId: call.id,
            callResult: completedCall
          });
        }

      } catch (error) {
        results.push({
          phoneNumber,
          status: 'failed',
          error: error.response?.data?.message || error.message || 'Unknown error'
        });

        // Update progress - call failed
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: phoneNumbers.length,
            phoneNumber,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Small delay between calls
      if (i < phoneNumbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
}

export default VapiApiService;