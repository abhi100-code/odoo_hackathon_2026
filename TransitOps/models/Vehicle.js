import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Please provide a registration number'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a vehicle name'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please provide a vehicle model'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please provide a vehicle type'],
    trim: true,
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Please provide maximum load capacity in kg'],
  },
  odometerReading: {
    type: Number,
    required: [true, 'Please provide odometer reading in km'],
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Please provide acquisition cost'],
  },
  insuranceExpiryDate: {
    type: Date,
    required: [true, 'Please provide insurance expiry date'],
  },
  registrationExpiryDate: {
    type: Date,
    required: [true, 'Please provide registration expiry date'],
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available',
  },
  documentUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
