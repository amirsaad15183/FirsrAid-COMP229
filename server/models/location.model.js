import mongoose from 'mongoose'

// Locations are maintained by administrators and used by course schedules.
const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: 'Location name is required', unique: true, maxlength: 80 },
    address: { type: String, trim: true, required: 'Location address is required', maxlength: 180 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export default mongoose.model('Location', LocationSchema)
