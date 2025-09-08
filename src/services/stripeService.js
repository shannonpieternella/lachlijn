// Stripe Service voor Credit Betalingen
class StripeService {
  constructor() {
    // Use relative URL; Vite proxy routes to backend in dev
    this.baseURL = `/api/billing`
  }

  // Helper method voor API calls naar backend
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment error occurred')
      }

      return await response.json()
      
    } catch (error) {
      console.error('Stripe Service Error:', error)
      throw error
    }
  }

  // Maak een Stripe Checkout sessie voor credits
  async createCheckoutSession(packageId, successUrl = null, cancelUrl = null) {
    try {
      const response = await this.makeRequest('/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          packageId,
          successUrl: successUrl || `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?payment=cancelled`
        })
      })

      if (response.success) {
        return {
          success: true,
          checkoutUrl: response.checkoutUrl,
          sessionId: response.sessionId
        }
      } else {
        throw new Error(response.message || 'Failed to create checkout session')
      }

    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Redirect naar Stripe Checkout
  async redirectToCheckout(packageId) {
    try {
      const session = await this.createCheckoutSession(packageId)
      
      if (session.success && session.checkoutUrl) {
        window.location.href = session.checkoutUrl
      } else {
        throw new Error('Invalid checkout session')
      }

    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      alert('Er ging iets mis bij het openen van de betaalpagina. Probeer het opnieuw.')
    }
  }

  // Haal beschikbare credit packages op
  async getCreditPackages() {
    try {
      const response = await this.makeRequest('/packages')
      return response.packages || []
    } catch (error) {
      console.error('Error fetching credit packages:', error)
      // Return fallback packages als API niet beschikbaar is
      return [
        {
          id: 'starter',
          name: 'Starter Pack',
          credits: 10,
          price: 9.99,
          currency: 'EUR',
          description: '10 prank calls',
          popular: false
        },
        {
          id: 'popular',
          name: 'Popular Pack',
          credits: 25,
          price: 19.99,
          currency: 'EUR',
          description: '25 prank calls + bonus',
          popular: true
        },
        {
          id: 'premium',
          name: 'Premium Pack',
          credits: 50,
          price: 34.99,
          currency: 'EUR',
          description: '50 prank calls + extra features',
          popular: false
        }
      ]
    }
  }

  // Haal betaalgeschiedenis op
  async getPaymentHistory() {
    try {
      const response = await this.makeRequest('/history')
      return response.payments || []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  // Verifieer betaling status
  async verifyPayment(sessionId) {
    try {
      const response = await this.makeRequest(`/verify-payment/${sessionId}`)
      return {
        success: response.success,
        verified: response.verified,
        credits: response.creditsAdded,
        message: response.message,
        user: response.user // Include updated user data
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      return {
        success: false,
        verified: false,
        message: 'Could not verify payment'
      }
    }
  }

  // Format price voor display
  formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Bereken prijs per credit
  calculatePricePerCredit(price, credits) {
    return (price / credits).toFixed(2)
  }
}

// Exporteer een singleton instance
const stripeService = new StripeService()
export default stripeService

// Exporteer ook de class
export { StripeService }
