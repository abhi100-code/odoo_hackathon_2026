import mongoose from 'mongoose';

const FuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle'],
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Please assign a driver'],
  },
  fuelQuantity: {
    type: Number,
    required: [true, 'Please provide fuel quantity in Liters'],
  },
  fuelCost: {
    type: Number,
    required: [true, 'Please provide fuel cost'],
  },
  odometerReading: {
    type: Number,
    required: [true, 'Please provide odometer reading in km'],
  },
  fuelStation: {
    type: String,
    required: [true, 'Please provide fuel station name'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide refuel date'],
  },
}, { timestamps: true });

export default mongoose.models.FuelLog || mongoose.model('FuelLog', FuelLogSchema);
