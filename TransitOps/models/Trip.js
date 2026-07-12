import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  sourceLocation: {
    type: String,
    required: [true, 'Please provide a source location'],
    trim: true,
  },
  destinationLocation: {
    type: String,
    required: [true, 'Please provide a destination location'],
    trim: true,
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle'],
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Please assign a driver'],
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Please provide cargo weight in kg'],
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Please provide planned distance in km'],
  },
  revenueGenerated: {
    type: Number,
    required: [true, 'Please provide revenue generated'],
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);
