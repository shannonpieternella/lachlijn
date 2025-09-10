import express from 'express'
import { authenticateToken as requireAuth, optionalAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import crypto from 'crypto'

const router = express.Router()

// Helper to detect Stripe mode from the secret key
const getStripeMode = () => {
  const key = process.env.STRIPE_SECRET_KEY || ''
  if (key.startsWith('sk_test')) return 'test'
  if (key.startsWith('sk_live')) return 'live'
  return 'unknown'
}

// Get available credit packages
router.get('/packages', requireAuth, async (req, res) => {
  try {
    const packages = [
      {
        id: 'small',
        name: '5 Credits',
        price: 6.00,
        credits: 5,
        popular: false,
        description: 'Perfect om te beginnen',
        currency: 'EUR'
      },
      {
        id: 'medium',
        name: '10 Credits', 
        price: 10.00,
        credits: 10,
        popular: true,
        description: 'Beste deal! Bespaar €2',
        currency: 'EUR'
      },
      {
        id: 'large',
        name: '25 Credits',
        price: 22.50,
        credits: 25,
        popular: false,
        description: 'Maximale besparing! Bespaar €7.50',
        currency: 'EUR'
      }
    ]

    res.json({
      success: true,
      packages
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het ophalen van de pakketten'
    })
  }
})

// Create checkout session (renamed from /checkout)
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { packageId, successUrl, cancelUrl } = req.body
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Missing STRIPE_SECRET_KEY' 
      })
    }

    const stripeMode = getStripeMode()
    if (process.env.NODE_ENV !== 'production' && stripeMode === 'live') {
      console.warn('⚠️ Using LIVE Stripe key in non-production environment.')
    }

    // Map plan -> amount and metadata (EUR, amounts in cents)
    const plans = {
      small: { name: '5 Credits', amount: 600, credits: 5 },
      medium: { name: '10 Credits', amount: 1000, credits: 10 },
      large: { name: '25 Credits', amount: 2250, credits: 25 },
    }
    
    const selected = plans[packageId]
    if (!selected) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid packageId' 
      })
    }

    const defaultSuccessUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/dashboard?payment=success'
    const defaultCancelUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/pricing?payment=cancelled'

    // Build form data for Stripe API
    const form = new URLSearchParams()
    form.append('mode', 'payment')
    form.append('success_url', successUrl || defaultSuccessUrl)
    form.append('cancel_url', cancelUrl || defaultCancelUrl)
    form.append('line_items[0][price_data][currency]', 'eur')
    form.append('line_items[0][price_data][unit_amount]', String(selected.amount))
    form.append('line_items[0][price_data][product_data][name]', `${selected.name} – PrankCall.nl`)
    form.append('line_items[0][quantity]', '1')
    form.append('metadata[credits]', String(selected.credits))
    form.append('metadata[packageId]', packageId)
    form.append('metadata[userId]', req.user.id) // Add user ID for fulfillment

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Stripe API error:', errorText)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create checkout session' 
      })
    }

    const session = await response.json()
    
    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      mode: getStripeMode()
    })

  } catch (error) {
    console.error('Checkout error:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het aanmaken van de betaalsessie'
    })
  }
})

// Create Stripe Checkout Session (Test mode)
router.post('/checkout', async (req, res) => {
  try {
    const { planId } = req.body || {}
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Missing STRIPE_SECRET_KEY' })
    }

    const stripeMode2 = getStripeMode()
    if (process.env.NODE_ENV !== 'production' && stripeMode2 === 'live') {
      console.warn('⚠️ Using LIVE Stripe key in non-production environment.')
    }

    // Map plan -> amount and metadata (EUR, amounts in cents)
    const plans = {
      small: { name: '5 Credits', amount: 600, credits: 5 },
      medium: { name: '10 Credits', amount: 1000, credits: 10 },
      large: { name: '25 Credits', amount: 2250, credits: 25 },
    }
    const selected = plans[planId]
    if (!selected) {
      return res.status(400).json({ success: false, message: 'Invalid planId' })
    }

    const successUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/pricing?success=1'
    const cancelUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/pricing?canceled=1'

    // Build form data for Stripe API
    const form = new URLSearchParams()
    form.append('mode', 'payment')
    form.append('success_url', successUrl)
    form.append('cancel_url', cancelUrl)
    // Use inline price_data to avoid needing predefined price IDs
    form.append('line_items[0][price_data][currency]', 'eur')
    form.append('line_items[0][price_data][unit_amount]', String(selected.amount))
    form.append('line_items[0][price_data][product_data][name]', `${selected.name} – PrankCall.nl`)
    form.append('line_items[0][quantity]', '1')
    // Pass credits as metadata for webhook fulfillment later
    form.append('metadata[credits]', String(selected.credits))
    form.append('metadata[planId]', planId)

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Stripe error:', text)
      return res.status(500).json({ success: false, message: 'Stripe API error', detail: text })
    }

    const session = await response.json()
    return res.json({ success: true, url: session.url, mode: getStripeMode() })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

// Keep track of processed sessions to prevent double crediting
const processedSessions = new Set()

// Verify payment and credit the user
// Allow optional auth in development to reduce friction
router.get('/verify-payment/:sessionId', process.env.NODE_ENV === 'production' ? requireAuth : optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params
    
    // Check if this session was already processed
    if (processedSessions.has(sessionId)) {
      console.log(`⏭️ Verify-payment: Session ${sessionId} already processed, skipping`)
      return res.json({
        success: true,
        verified: true,
        creditsAdded: 0,
        message: 'Already processed',
        user: req.user
      })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Missing STRIPE_SECRET_KEY' })
    }

    // Retrieve the checkout session from Stripe
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Stripe verify error:', text)
      return res.status(404).json({ success: false, message: 'Checkout session not found' })
    }

    const session = await response.json()
    const paymentStatus = session.payment_status // 'paid' when successful
    const credits = parseInt(session.metadata?.credits || '0', 10) || 0
    const metaUserId = session.metadata?.userId

    if (paymentStatus !== 'paid') {
      return res.json({ success: true, verified: false, message: `Payment status: ${paymentStatus}` })
    }

    // Credit the user
    let creditedUser = req.user
    if (metaUserId && String(metaUserId) !== String(req.user.id)) {
      // If metadata contains a different userId, prefer crediting that user
      const other = await User.findById(metaUserId)
      if (other) creditedUser = other
    }

    // Check if credits were already added via webhook to avoid double crediting
    // Add credits here for immediate feedback, webhook will be idempotent
    let creditsAdded = 0
    if (credits > 0) {
      const creditsBefore = creditedUser.credits
      console.log(`💳 Verify-payment: User ${creditedUser.id} has ${creditsBefore} credits BEFORE adding ${credits}`)
      await creditedUser.addCredits(credits)
      creditsAdded = credits
      console.log(`✅ Verify-payment: Added ${credits} credits, user now has ${creditedUser.credits} credits (was ${creditsBefore})`)
      
      // Process referral rewards: when this user makes first purchase, reward THEIR referrer
      try {
        // Check if this is the user's first purchase
        const isFirstPurchase = !creditedUser.hasEverPurchased
        
        if (isFirstPurchase) {
          // Mark user as having made their first purchase
          creditedUser.hasEverPurchased = true
          await creditedUser.save()
          
          // If this user was referred by someone, reward the referrer
          if (creditedUser.referral.referredBy) {
            const referrer = await User.findById(creditedUser.referral.referredBy)
            
            if (referrer) {
              // Find the invite record for this user
              const inviteIndex = referrer.referral.invites.findIndex(
                invite => invite.userId.toString() === creditedUser._id.toString()
              )
              
              if (inviteIndex !== -1 && referrer.referral.invites[inviteIndex].creditsEarned === 0) {
                // Give 1 credit to the referrer
                referrer.credits += 1
                referrer.referral.creditsEarned += 1
                referrer.referral.invites[inviteIndex].creditsEarned = 1
                referrer.referral.invites[inviteIndex].rewardedAt = new Date()
                
                await referrer.save()
                
                console.log(`🎁 User ${creditedUser.email} made first purchase - rewarded referrer ${referrer.email} with 1 credit`)
                
                // Check for new milestones for referrer
                await referrer.checkViralMilestones()
              }
            }
          }
        } else {
          console.log(`⚠️ Not first purchase for user ${creditedUser.id}, skipping referral rewards`)
        }
      } catch (referralError) {
        console.error('Error processing referral rewards:', referralError)
        // Don't fail the payment if referral processing fails
      }
      
      // Mark session as processed
      processedSessions.add(sessionId)
    }

    return res.json({
      success: true,
      verified: true,
      creditsAdded: creditsAdded,
      message: credits > 0 ? `Added ${credits} credits` : 'Payment verified',
      user: {
        id: creditedUser.id,
        credits: creditedUser.credits
      }
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    return res.status(500).json({ success: false, message: 'Internal error verifying payment' })
  }
})

export default router

// Webhook handler (exported for index.js to mount before body parsers)
export const billingWebhookHandler = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature']
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
      return res.status(500).send('Webhook not configured')
    }

    // Stripe signature verification (no SDK)
    // Header format: t=timestamp,v1=signature
    const header = String(sig || '')
    const parts = Object.fromEntries(header.split(',').map(kv => kv.split('=')))
    const timestamp = parts.t
    const v1 = parts.v1

    if (!timestamp || !v1) {
      return res.status(400).send('Invalid Stripe signature header')
    }

    const signedPayload = `${timestamp}.${req.body.toString('utf8')}`
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))) {
      return res.status(400).send('Signature verification failed')
    }

    // Parse event JSON
    const event = JSON.parse(req.body.toString('utf8'))

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {}
      const paymentStatus = session.payment_status
      const credits = parseInt(session.metadata?.credits || '0', 10) || 0
      const metaUserId = session.metadata?.userId

      // TEMPORARILY DISABLE WEBHOOK CREDIT PROCESSING TO PREVENT DOUBLE CREDITS
      // Only verify-payment endpoint should add credits for now
      console.log(`🚫 Webhook: Credit processing temporarily disabled to prevent double credits`)
      console.log(`ℹ️ Webhook details - paymentStatus: ${paymentStatus}, credits: ${credits}, userId: ${metaUserId}, sessionId: ${session.id}`)
      
      // TODO: Implement proper idempotency later if webhook backup is needed
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.status(400).send('Webhook error')
  }
}
