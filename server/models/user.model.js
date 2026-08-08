import mongoose from 'mongoose'
import crypto from 'crypto'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: 'Name is required', maxlength: 80 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address'],
      required: 'Email is required',
    },
    // Public registrations are regular users; administrator accounts are seeded separately.
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    hashedPassword: { type: String, required: 'Password is required', select: false },
    salt: { type: String, required: 'Password is required', select: false },
  },
  { timestamps: true, toJSON: { virtuals: true } },
)

UserSchema.virtual('password')
  .set(function setPassword(password) {
    // Store only a salted password hash, never the original password.
    this._password = password
    this.salt = crypto.randomBytes(16).toString('hex')
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(function getPassword() {
    return this._password
  })

UserSchema.path('hashedPassword').validate(function validatePassword() {
  if (this._password && this._password.length < 8) {
    this.invalidate('password', 'Password must be at least 8 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

UserSchema.methods.authenticate = function authenticate(plainText) {
  const passwordHash = this.encryptPassword(plainText)
  return Boolean(passwordHash) && crypto.timingSafeEqual(
    Buffer.from(passwordHash, 'hex'),
    Buffer.from(this.hashedPassword, 'hex'),
  )
}

UserSchema.methods.encryptPassword = function encryptPassword(password) {
  if (!password || !this.salt) return ''
  return crypto.pbkdf2Sync(password, this.salt, 310000, 64, 'sha512').toString('hex')
}

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, user) => {
    delete user.hashedPassword
    delete user.salt
    delete user.__v
    return user
  },
})

export default mongoose.model('User', UserSchema)
