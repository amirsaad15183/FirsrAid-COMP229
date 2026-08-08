import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const { default: config } = await import('../config/config.js')
const { default: User } = await import('../server/models/user.model.js')
const { default: Location } = await import('../server/models/location.model.js')
const { default: TrainingClass } = await import('../server/models/trainingClass.model.js')

const locations = [
  { name: 'Toronto', address: 'Toronto Training Centre, Toronto, ON' },
  { name: 'Markham', address: 'Markham Training Centre, Markham, ON' },
]

const classes = [
  { title: 'Standard First Aid', category: 'Standard First Aid', description: 'Comprehensive hands-on first-aid training for workplace and community learners.', classDate: new Date('2026-09-12T12:00:00-04:00'), startTime: '09:00', endTime: '17:00', durationHours: 8, location: 'Toronto', capacity: 16, price: 150, instructor: 'LifeReady Instructor' },
  { title: 'Emergency First Aid', category: 'Emergency First Aid', description: 'Focused in-class first-aid training for essential emergency response skills.', classDate: new Date('2026-09-19T12:00:00-04:00'), startTime: '09:00', endTime: '15:00', durationHours: 6, location: 'Markham', capacity: 16, price: 100, instructor: 'LifeReady Instructor' },
  { title: 'Basic Life Support (HCP)', category: 'BLS', description: 'Instructor-led Basic Life Support training for healthcare professionals and learners.', classDate: new Date('2026-09-26T12:00:00-04:00'), startTime: '09:00', endTime: '13:00', durationHours: 4, location: 'Toronto', capacity: 16, price: 80, instructor: 'LifeReady Instructor' },
]

try {
  await mongoose.connect(config.mongoUri)
  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })
  if (!admin) throw new Error('Create an administrator account before seeding the catalogue.')

  for (const location of locations) {
    await Location.updateOne({ name: location.name }, { $setOnInsert: { ...location, isActive: true, createdBy: admin._id } }, { upsert: true })
  }
  for (const trainingClass of classes) {
    await TrainingClass.updateOne({ title: trainingClass.title, classDate: trainingClass.classDate }, { $setOnInsert: { ...trainingClass, format: 'full', status: 'scheduled', createdBy: admin._id } }, { upsert: true })
  }
  console.log('LifeReady catalogue is ready: Toronto, Markham, and three course listings.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
