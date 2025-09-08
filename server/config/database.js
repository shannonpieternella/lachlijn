import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()
// Also try to load top-level .env so server can share env with root
try {
  const topLevelEnv = path.join(process.cwd(), '..', '.env')
  dotenv.config({ path: topLevelEnv })
} catch (_) {}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    
    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

    return conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📴 Shutting down gracefully...')
  
  try {
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message)
    process.exit(1)
  }
})

export default connectDB
