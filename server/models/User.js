import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Naam is verplicht'],
    trim: true,
    minlength: [2, 'Naam moet minimaal 2 tekens zijn'],
    maxlength: [50, 'Naam mag maximaal 50 tekens zijn']
  },
  email: {
    type: String,
    required: [true, 'Email is verplicht'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Ongeldig email adres']
  },
  password: {
    type: String,
    required: [true, 'Wachtwoord is verplicht'],
    minlength: [6, 'Wachtwoord moet minimaal 6 tekens zijn'],
    select: false // Standaard niet meeleveren bij queries
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true // Phone is optioneel
        // Nederlandse telefoonnummer validatie
        const dutchPhoneRegex = /^(\+31|0031|0)[1-9][0-9]{7,8}$/
        return dutchPhoneRegex.test(v.replace(/[\s-()]/g, ''))
      },
      message: 'Ongeldig Nederlands telefoonnummer'
    }
  },
  credits: {
    type: Number,
    default: 1, // 1 gratis call bij aanmaken account
    min: [0, 'Credits kunnen niet negatief zijn']
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'unlimited'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  stripeCustomerId: {
    type: String // Voor Stripe integratie
  },
  // Usage statistics
  stats: {
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    favoriteScenario: { type: String },
    achievements: [{
      name: String,
      earnedAt: { type: Date, default: Date.now }
    }]
  },
  // Settings
  settings: {
    emailNotifications: { type: Boolean, default: true },
    shareStats: { type: Boolean, default: false },
    saveRecordings: { type: Boolean, default: true },
    preferredVoice: { type: String, default: 'dutch-female-1' }
  },

  // Referral System - VIRAL COMPONENT! 🚀
  referral: {
    code: {
      type: String,
      unique: true,
      sparse: true, // Allows null values
      uppercase: true,
      minlength: 6,
      maxlength: 6
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invites: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: String,
      name: String,
      invitedAt: { type: Date, default: Date.now },
      creditsEarned: { type: Number, default: 2 },
      isActive: { type: Boolean, default: true }
    }],
    totalInvites: { type: Number, default: 0 },
    creditsEarned: { type: Number, default: 0 },
    
    // Viral Milestones
    milestones: [{
      type: { type: String, enum: ['invite_3', 'invite_5', 'invite_10', 'invite_25'] },
      achievedAt: { type: Date, default: Date.now },
      reward: { type: String } // "10_free_calls", "unlimited_week", etc.
    }]
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
})

// Index voor snellere queries
userSchema.index({ email: 1 })
userSchema.index({ plan: 1 })
userSchema.index({ 'stats.totalCalls': -1 })

// Password hash middleware
userSchema.pre('save', async function(next) {
  // Only hash password als het gemodificeerd is
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method om password te checken
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Instance method om credits te gebruiken
userSchema.methods.useCredits = async function(amount = 1) {
  if (this.credits < amount) {
    throw new Error('Onvoldoende credits')
  }
  
  this.credits -= amount
  return await this.save()
}

// Instance method om credits toe te voegen
userSchema.methods.addCredits = async function(amount) {
  this.credits += amount
  return await this.save()
}

// REFERRAL SYSTEM METHODS 🚀

// Check en award viral milestones
userSchema.methods.checkViralMilestones = async function() {
  const milestones = [
    { type: 'invite_3', threshold: 3, reward: '5_free_calls', credits: 5 },
    { type: 'invite_5', threshold: 5, reward: '10_free_calls', credits: 10 },
    { type: 'invite_10', threshold: 10, reward: '25_free_calls', credits: 25 },
    { type: 'invite_25', threshold: 25, reward: 'unlimited_week', credits: 50 }
  ]

  const newMilestones = []
  
  for (const milestone of milestones) {
    const hasAchieved = this.referral.milestones.some(m => m.type === milestone.type)
    
    if (!hasAchieved && this.referral.totalInvites >= milestone.threshold) {
      // Award milestone!
      this.referral.milestones.push({
        type: milestone.type,
        achievedAt: new Date(),
        reward: milestone.reward
      })
      
      this.credits += milestone.credits
      newMilestones.push(milestone)
    }
  }
  
  if (newMilestones.length > 0) {
    await this.save()
  }
  
  return newMilestones
}

// Get referral stats
userSchema.methods.getReferralStats = function() {
  const activeInvites = this.referral.invites.filter(invite => invite.isActive)
  
  return {
    code: this.referral.code,
    totalInvites: this.referral.totalInvites,
    activeInvites: activeInvites.length,
    creditsEarned: this.referral.creditsEarned,
    milestones: this.referral.milestones,
    nextMilestone: this.getNextMilestone(),
    shareUrl: `https://prankcall.nl/ref/${this.referral.code}`
  }
}

// Get next milestone info
userSchema.methods.getNextMilestone = function() {
  const milestoneTypes = ['invite_3', 'invite_5', 'invite_10', 'invite_25']
  const thresholds = [3, 5, 10, 25]
  const rewards = [5, 10, 25, 50]
  
  for (let i = 0; i < milestoneTypes.length; i++) {
    const hasAchieved = this.referral.milestones.some(m => m.type === milestoneTypes[i])
    
    if (!hasAchieved) {
      return {
        type: milestoneTypes[i],
        threshold: thresholds[i],
        remaining: Math.max(0, thresholds[i] - this.referral.totalInvites),
        credits: rewards[i]
      }
    }
  }
  
  return null // All milestones achieved!
}

// Static method om user te vinden met email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Virtual voor display naam
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0]
})

// Transform bij JSON serialisatie
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  
  // Verwijder gevoelige velden
  delete userObject.password
  delete userObject.__v
  delete userObject.stripeCustomerId
  
  return userObject
}

const User = mongoose.model('User', userSchema)

export default User