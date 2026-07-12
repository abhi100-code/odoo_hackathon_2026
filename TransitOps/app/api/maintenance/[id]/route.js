import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MaintenanceLog from '@/models/MaintenanceLog';
import Vehicle from '@/models/Vehicle';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/apiAuth';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Fleet Manager', 'Safety Officer', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, cost: newCost } = body;

    const log = await MaintenanceLog.findById(id);
    if (!log) {
      return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 });
    }

    if (newStatus && newStatus !== log.status) {
      if (newStatus === 'Closed') {
        await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
      } else if (newStatus === 'Open') {
        await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'In Shop' });
      }
    }

    if (newCost !== undefined && newCost !== log.cost) {
      await Expense.findOneAndUpdate(
        { referenceId: log._id },
        { amount: newCost }
      );
    }

    Object.assign(log, body);
    await log.save();

    const populated = await MaintenanceLog.findById(log._id).populate('vehicle');
    return NextResponse.json({ success: true, data: populated });
  } catch (error) {
    console.error('Maintenance PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
