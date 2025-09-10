import express from 'express'
import User from '../models/User.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Generate unique referral code
const generateReferralCode = async () => {
  let code
  let exists = true
  
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const existingUser = await User.findOne({ 'referral.code': code })
    exists = !!existingUser
  }
  
  return code
}

// Get user's referral stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referral.invites.userId', 'name email createdAt stats')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Generate referral code if user doesn't have one
    if (!user.referral.code) {
      user.referral.code = await generateReferralCode()
      await user.save()
    }

    const referralStats = user.getReferralStats()
    
    res.json({
      success: true,
      data: {
        ...referralStats,
        recentInvites: user.referral.invites
          .filter(invite => invite.isActive)
          .sort((a, b) => new Date(b.invitedAt) - new Date(a.invitedAt))
          .slice(0, 5)
          .map(invite => ({
            name: invite.name,
            email: invite.email.replace(/(.{1}).*(@.*)/, '$1***$2'), // Mask email
            invitedAt: invite.invitedAt,
            creditsEarned: invite.creditsEarned,
            isActive: invite.isActive
          }))
      }
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Process referral signup (called during user registration)
router.post('/process-signup', optionalAuth, async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body

    if (!referralCode || !newUserId) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and new user ID required'
      })
    }

    // Find referrer by code
    const referrer = await User.findOne({ 'referral.code': referralCode })
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      })
    }

    // Find the new user
    const newUser = await User.findById(newUserId)
    
    if (!newUser) {
      return res.status(404).json({
        success: false,
        message: 'New user not found'
      })
    }

    // Check if user already has a referrer
    if (newUser.referral.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'User already has a referrer'
      })
    }

    // Set the referrer relationship
    newUser.referral.referredBy = referrer._id
    await newUser.save()

    // Add invite to referrer's list
    referrer.referral.invites.push({
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
      invitedAt: new Date(),
      creditsEarned: 0, // Will be set to 1 when referrer has purchased credits
      isActive: true
    })

    referrer.referral.totalInvites += 1
    await referrer.save()

    res.json({
      success: true,
      message: 'Referral processed successfully'
    })
  } catch (error) {
    console.error('Error processing referral:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Process referral reward (called when referrer purchases credits)
router.post('/process-reward', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id
    
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if user has purchased credits (has more than the initial free credit)
    const hasPurchasedCredits = user.stats.totalCalls > 0 || user.credits > 1

    if (!hasPurchasedCredits) {
      return res.status(400).json({
        success: false,
        message: 'User must purchase credits first'
      })
    }

    let rewardsGiven = 0

    // Process pending invites that haven't been rewarded yet
    for (let invite of user.referral.invites) {
      if (invite.isActive && invite.creditsEarned === 0) {
        // Give 1 credit to referrer for this invite
        user.credits += 1
        user.referral.creditsEarned += 1
        invite.creditsEarned = 1
        rewardsGiven += 1
      }
    }

    if (rewardsGiven > 0) {
      await user.save()
      
      // Check for new milestones
      const newMilestones = await user.checkViralMilestones()
      
      res.json({
        success: true,
        message: `${rewardsGiven} referral rewards processed`,
        data: {
          creditsAwarded: rewardsGiven,
          newMilestones: newMilestones
        }
      })
    } else {
      res.json({
        success: true,
        message: 'No pending referral rewards',
        data: {
          creditsAwarded: 0,
          newMilestones: []
        }
      })
    }
  } catch (error) {
    console.error('Error processing referral rewards:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Validate referral code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params
    
    const referrer = await User.findOne({ 'referral.code': code })
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      })
    }

    res.json({
      success: true,
      data: {
        referrerName: referrer.name,
        isValid: true
      }
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router