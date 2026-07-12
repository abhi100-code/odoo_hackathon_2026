import mongoose from 'mongoose';

const MaintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle'],
  },
  maintenanceType: {
    type: String,
    enum: ['Oil Change', 'Brake Service', 'Tire Replacement', 'Engine Repair', 'General Service'],
    required: [true, 'Please provide a maintenance type'],
  },
  description: {
    type: String,
    default: '',
  },
  cost: {
    type: Number,
    required: [true, 'Please provide maintenance cost'],
  },
  serviceDate: {
    type: Date,
    required: [true, 'Please provide service date'],
  },
  vendorName: {
    type: String,
    required: [true, 'Please provide vendor name'],
    trim: true,
  },
  nextServiceDate: {
    type: Date,
    required: [true, 'Please provide next service date'],
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
}, { timestamps: true });

export default mongoose.models.MaintenanceLog || mongoose.model('MaintenanceLog', MaintenanceLogSchema);
