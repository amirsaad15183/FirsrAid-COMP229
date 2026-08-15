import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Backend entry point: load secrets, connect to MongoDB, then start Express.
dotenv.config()

// Load configuration only after environment variables from .env are available.
const { default: config } = await import('./config/config.js')
const { default: app } = await import('./server/express.js')

const startServer = async () => {
  try {
    // The API starts only after MongoDB Atlas accepts the database connection.
    await mongoose.connect(config.mongoUri)
    console.info('Connected to MongoDB.')
    app.listen(config.port, () => {
      console.info('LifeReady Training API started on port %s.', config.port)
    })
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message)
    process.exit(1)
  }
}

startServer()
