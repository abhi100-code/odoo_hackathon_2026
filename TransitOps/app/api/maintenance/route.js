import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MaintenanceLog from '@/models/MaintenanceLog';
import Vehicle from '@/models/Vehicle';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicle') || '';
    const maintenanceType = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    let query = {};
    if (vehicleId) query.vehicle = vehicleId;
    if (maintenanceType) query.maintenanceType = maintenanceType;
    if (status) query.status = status;

    const logs = await MaintenanceLog.find(query).populate('vehicle').sort({ serviceDate: -1 });
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Fleet Manager', 'Safety Officer', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { vehicle: vehicleId, maintenanceType, description, cost, serviceDate, vendorName, nextServiceDate, status = 'Open' } = body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
    }

    vehicle.status = 'In Shop';
    await vehicle.save();

    const log = await MaintenanceLog.create({
      vehicle: vehicleId,
      maintenanceType,
      description,
      cost,
      serviceDate,
      vendorName,
      nextServiceDate,
      status,
    });

    await Expense.create({
      category: 'Maintenance',
      amount: cost,
      date: serviceDate,
      description: `${maintenanceType} on ${vehicle.name} (${vehicle.registrationNumber}) by ${vendorName}`,
      referenceId: log._id,
    });

    const populated = await MaintenanceLog.findById(log._id).populate('vehicle');
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error('Maintenance POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
