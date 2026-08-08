import mongoose from 'mongoose'

// A single public company-information record drives the About page.
const CompanyInfoSchema = new mongoose.Schema(
  {
    organizationName: { type: String, trim: true, required: 'Organization name is required', maxlength: 100 },
    mission: { type: String, trim: true, required: 'Mission statement is required', maxlength: 800 },
    description: { type: String, trim: true, required: 'Company description is required', maxlength: 2000 },
    email: { type: String, trim: true, lowercase: true, required: 'Contact email is required', maxlength: 120, match: [/.+\@.+\..+/, 'Please enter a valid email address'] },
    phone: { type: String, trim: true, required: 'Contact phone is required', maxlength: 40 },
    serviceArea: { type: String, trim: true, required: 'Service area is required', maxlength: 160 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('CompanyInfo', CompanyInfoSchema)
