import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Transport Administrator'],
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
