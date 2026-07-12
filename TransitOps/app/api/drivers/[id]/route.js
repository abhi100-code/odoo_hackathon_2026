import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const driver = await Driver.findById(id);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const trips = await Trip.find({ assignedDriver: id }).populate('assignedVehicle').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { driver, trips } });
  } catch (error) {
    console.error('Driver detail GET error:', error);
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

    if (body.licenseNumber) {
      const exists = await Driver.findOne({
        licenseNumber: body.licenseNumber.toUpperCase(),
        _id: { $ne: id },
      });
      if (exists) {
        return NextResponse.json({ error: 'Driver with this license number already exists.' }, { status: 400 });
      }
      body.licenseNumber = body.licenseNumber.toUpperCase();
    }

    const driver = await Driver.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: driver });
  } catch (error) {
    console.error('Driver PUT error:', error);
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
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    await Trip.deleteMany({ assignedDriver: id });

    return NextResponse.json({ success: true, message: 'Driver and related records deleted successfully' });
  } catch (error) {
    console.error('Driver DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
