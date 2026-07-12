import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['License Expiry', 'Maintenance Due', 'General'],
    required: [true, 'Please provide notification type'],
  },
  message: {
    type: String,
    required: [true, 'Please provide notification message'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
