import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const { default: config } = await import('../config/config.js')
const { default: User } = await import('../server/models/user.model.js')

const name = process.env.ADMIN_NAME
const email = process.env.ADMIN_EMAIL?.toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!name || !email || !password) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running this command.')
  process.exit(1)
}

try {
  await mongoose.connect(config.mongoUri)
  const existingAdmin = await User.findOne({ email })
  if (existingAdmin) {
    console.info(`An account already exists for ${email}.`)
  } else {
    const admin = new User({ name, email, role: 'admin' })
    admin.password = password
    await admin.save()
    console.info(`Administrator account created for ${email}.`)
  }
} catch (error) {
  console.error('Could not create administrator:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
