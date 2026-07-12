import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Trip from '@/models/Trip';
import MaintenanceLog from '@/models/MaintenanceLog';
import FuelLog from '@/models/FuelLog';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const trips = await Trip.find({ assignedVehicle: id }).populate('assignedDriver').sort({ createdAt: -1 });
    const maintenance = await MaintenanceLog.find({ vehicle: id }).sort({ serviceDate: -1 });
    const fuel = await FuelLog.find({ vehicle: id }).populate('driver').sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: {
        vehicle,
        history: {
          trips,
          maintenance,
          fuel,
        },
      },
    });
  } catch (error) {
    console.error('Vehicle detail GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Fleet Manager', 'Safety Officer', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.registrationNumber) {
      const exists = await Vehicle.findOne({
        registrationNumber: body.registrationNumber.toUpperCase(),
        _id: { $ne: id },
      });
      if (exists) {
        return NextResponse.json({ error: 'Vehicle with this registration number already exists.' }, { status: 400 });
      }
      body.registrationNumber = body.registrationNumber.toUpperCase();
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Vehicle PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Fleet Manager', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    await Trip.deleteMany({ assignedVehicle: id });
    await MaintenanceLog.deleteMany({ vehicle: id });
    await FuelLog.deleteMany({ vehicle: id });

    return NextResponse.json({ success: true, message: 'Vehicle and related records deleted successfully' });
  } catch (error) {
    console.error('Vehicle DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
