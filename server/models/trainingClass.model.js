import mongoose from 'mongoose'

const TrainingClassSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: 'Class title is required', maxlength: 120 },
    category: {
      type: String,
      required: 'Course category is required',
      enum: ['Emergency First Aid', 'Standard First Aid', 'CPR/AED', 'BLS'],
    },
    format: { type: String, enum: ['full', 'blended'], default: 'full' },
    description: { type: String, trim: true, required: 'Class description is required', maxlength: 2000 },
    classDate: { type: Date, required: 'Class date is required' },
    startTime: { type: String, required: 'Start time is required', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid start time'] },
    endTime: { type: String, required: 'End time is required', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid end time'] },
    durationHours: { type: Number, required: 'Class duration is required', min: 1, max: 24 },
    location: { type: String, trim: true, required: 'Class location is required', maxlength: 160 },
    capacity: { type: Number, required: 'Class capacity is required', min: 1, max: 100 },
    price: { type: Number, required: 'Class price is required', min: 0 },
    instructor: { type: String, trim: true, required: 'Instructor name is required', maxlength: 80 },
    status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
    // Records which administrator created the training-class listing.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

TrainingClassSchema.index({ classDate: 1, status: 1 })

export default mongoose.model('TrainingClass', TrainingClassSchema)
