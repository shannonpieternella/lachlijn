import express from 'express'
import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import validator from 'validator'

const router = express.Router()

// Apply rate limiting to all auth routes
router.use(authLimiter)

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email en wachtwoord zijn verplicht'
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Ongeldig email adres'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Wachtwoord moet minimaal 6 tekens zijn'
      })
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email adres is al in gebruik'
      })
    }

    // Handle referral
    let referredBy = null
    let bonusCredits = 1 // Standard: 1 gratis call

    if (referralCode) {
      referredBy = await User.findOne({ 'referral.code': referralCode })
      if (referredBy) {
        bonusCredits = 2 // Modest bonus voor referral: 2 calls
      }
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      credits: bonusCredits,
      referral: {
        code: generateReferralCode(),
        referredBy: referredBy?._id,
        invites: [],
        totalInvites: 0,
        creditsEarned: 0
      }
    })

    await user.save()

    // Update referrer
    if (referredBy) {
      // Check if referrer has purchased credits
      const hasPurchasedCredits = referredBy.hasPurchasedCredits()
      const creditsToGive = hasPurchasedCredits ? 1 : 0 // Only give credit if referrer has purchased credits
      
      referredBy.referral.invites.push({
        userId: user._id,
        email: user.email,
        name: user.name,
        invitedAt: new Date(),
        creditsEarned: creditsToGive
      })
      referredBy.referral.totalInvites += 1
      
      if (hasPurchasedCredits) {
        referredBy.referral.creditsEarned += 1
        referredBy.credits += 1 // Only 1 credit if they have purchased before
        console.log(`🎁 Referrer ${referredBy.email} earned 1 credit for referring ${user.email}`)
      } else {
        console.log(`⏳ Referrer ${referredBy.email} will earn credit when they purchase credits`)
      }
      
      await referredBy.save()
      
      // Check for milestones if credits were given
      if (hasPurchasedCredits) {
        await referredBy.checkViralMilestones()
      }
    }

    // Generate JWT
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: referredBy ? 
        `Account aangemaakt! Je hebt ${bonusCredits} credits gekregen via referral! 🎉` :
        'Account succesvol aangemaakt! Je hebt 1 gratis credit! 🎉',
      user: user.toJSON(),
      token
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het aanmaken van je account'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email en wachtwoord zijn verplicht'
      })
    }

    // Find user with password
    const user = await User.findByEmail(email).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ongeldig email adres of wachtwoord'
      })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Ongeldig email adres of wachtwoord'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is gedeactiveerd. Neem contact op met support.'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Succesvol ingelogd! Welkom terug! 👋',
      user: user.toJSON(),
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het inloggen'
    })
  }
})

// Validate referral code
router.get('/referral/:code', async (req, res) => {
  try {
    const { code } = req.params
    
    const referrer = await User.findOne({ 'referral.code': code })
                              .select('name referral.code')
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Ongeldige referral code'
      })
    }

    res.json({
      success: true,
      referrer: {
        name: referrer.name,
        code: referrer.referral.code
      },
      bonus: {
        newUserCredits: 2,
        referrerCredits: '1 (alleen als referrer credits heeft gekocht)'
      }
    })

  } catch (error) {
    console.error('Referral validation error:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het valideren van de referral code'
    })
  }
})

// Helper function to generate referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

export default router