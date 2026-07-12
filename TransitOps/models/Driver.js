import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a driver name'],
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide a license number'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  licenseCategory: {
    type: String,
    required: [true, 'Please provide a license category'],
    trim: true,
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'Please provide a license expiry date'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number'],
    trim: true,
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  emergencyContact: {
    type: String,
    required: [true, 'Please provide emergency contact details'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
    default: 'Available',
  },
}, { timestamps: true });

export default mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
