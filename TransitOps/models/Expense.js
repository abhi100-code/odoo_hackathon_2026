import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Fuel', 'Maintenance', 'Toll', 'Parking', 'Insurance', 'Miscellaneous'],
    required: [true, 'Please select an expense category'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the expense amount'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide the expense date'],
  },
  description: {
    type: String,
    default: '',
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
