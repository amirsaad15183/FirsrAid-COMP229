import mongoose from 'mongoose'

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: 'Name is required', maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, required: 'Email is required', maxlength: 120, match: [/.+\@.+\..+/, 'Please enter a valid email address'] },
    phone: { type: String, trim: true, maxlength: 40 },
    subject: { type: String, trim: true, required: 'Subject is required', maxlength: 160 },
    message: { type: String, trim: true, required: 'Message is required', maxlength: 4000 },
    emailDelivered: { type: Boolean, default: false },
    emailDeliveryNote: { type: String, default: 'Saved in the administrator inbox.' },
  },
  { timestamps: true },
)

ContactMessageSchema.index({ createdAt: -1 })

export default mongoose.model('ContactMessage', ContactMessageSchema)
