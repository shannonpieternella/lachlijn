import mongoose from 'mongoose'

const prankScenarioSchema = new mongoose.Schema({
  // Basic info
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  userDescription: {
    type: String,
    default: '',
    maxlength: 500
  },
  icon: {
    type: String,
    default: '🎭',
    maxlength: 10
  },
  image: {
    type: String,
    default: '',
    trim: true,
    maxlength: 2048
  },

  // Categorization
  category: {
    type: String,
    enum: ['Klassiek', 'Familie', 'Werk', 'Media', 'Verkoop', 'Geluk', 'Nieuw'],
    default: 'Nieuw'
  },
  difficulty: {
    type: String,
    enum: ['Makkelijk', 'Gemiddeld', 'Moeilijk'],
    default: 'Makkelijk'
  },
  duration: {
    type: String,
    default: '2-5 min'
  },

  // Content
  script: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Audio configuration (optional)
  audioUrl: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  },
  audioProvider: {
    type: String,
    enum: ['none', 'elevenlabs', 'upload', 'url'],
    default: 'none'
  },
  voiceId: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100
  },

  // VAPI Integration
  vapiAgentId: {
    type: String,
    trim: true,
    index: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },

  // Statistics
  popularity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Meta
  createdBy: {
    type: String,
    default: 'admin'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }]

}, {
  timestamps: true,
  collection: 'scenarios'
})

// Indexes
prankScenarioSchema.index({ id: 1 })
prankScenarioSchema.index({ category: 1, isActive: 1 })
prankScenarioSchema.index({ popularity: -1 })
prankScenarioSchema.index({ vapiAgentId: 1 })

// Instance method om gebruik te registreren
prankScenarioSchema.methods.recordUsage = async function(rating = null) {
  this.timesUsed += 1
  
  if (rating) {
    // Update average rating
    const totalRating = (this.averageRating * (this.timesUsed - 1)) + rating
    this.averageRating = totalRating / this.timesUsed
  }
  
  // Recalculate popularity based on usage and rating
  this.popularity = Math.min(100, (this.timesUsed * 2) + (this.averageRating * 10))
  
  return await this.save()
}

// Static method om actieve scenarios te krijgen
prankScenarioSchema.statics.getActiveScenarios = function() {
  return this.find({ isActive: true, isPublic: true })
    .sort({ popularity: -1 })
}

// Static method om scenario met agent te vinden
prankScenarioSchema.statics.findByAgent = function(vapiAgentId) {
  return this.findOne({ vapiAgentId, isActive: true })
}

const PrankScenario = mongoose.model('PrankScenario', prankScenarioSchema)

export default PrankScenario
