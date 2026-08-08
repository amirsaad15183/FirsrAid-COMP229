import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const { default: config } = await import('../config/config.js')
const { default: User } = await import('../server/models/user.model.js')

try {
  await mongoose.connect(config.mongoUri)
  // Rename the former development role without changing administrator accounts.
  const result = await User.updateMany({ role: 'student' }, { $set: { role: 'user' } })
  console.info(`Updated ${result.modifiedCount} account(s) from student to user.`)
} catch (error) {
  console.error('Could not migrate user roles:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
