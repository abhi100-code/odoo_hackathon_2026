import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/models/Trip';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const trip = await Trip.findById(id).populate('assignedVehicle').populate('assignedDriver');
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error) {
    console.error('Trip detail GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Dispatcher', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const vehicle = await Vehicle.findById(trip.assignedVehicle);
    const driver = await Driver.findById(trip.assignedDriver);

    if (newStatus && newStatus !== trip.status) {
      if (newStatus === 'Dispatched') {
        if (trip.status !== 'Draft') {
          return NextResponse.json({ error: 'Only Draft trips can be dispatched.' }, { status: 400 });
        }
        if (!vehicle || vehicle.status !== 'Available') {
          return NextResponse.json({ error: 'Assigned vehicle is not available.' }, { status: 400 });
        }
        if (!driver || driver.status !== 'Available') {
          return NextResponse.json({ error: 'Assigned driver is not available.' }, { status: 400 });
        }
        
        if (driver && new Date(driver.licenseExpiryDate) < new Date()) {
          return NextResponse.json({ error: 'Cannot dispatch trip: Assigned driver has an expired license.' }, { status: 400 });
        }

        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        await vehicle.save();
        await driver.save();
      }

      if (newStatus === 'Completed') {
        if (trip.status !== 'Dispatched') {
          return NextResponse.json({ error: 'Only Dispatched trips can be completed.' }, { status: 400 });
        }
        if (vehicle) {
          vehicle.status = 'Available';
          await vehicle.save();
        }
        if (driver) {
          driver.status = 'Available';
          await driver.save();
        }
      }

      if (newStatus === 'Cancelled') {
        if (trip.status === 'Completed') {
          return NextResponse.json({ error: 'Cannot cancel a completed trip.' }, { status: 400 });
        }
        if (trip.status === 'Dispatched') {
          if (vehicle) {
            vehicle.status = 'Available';
            await vehicle.save();
          }
          if (driver) {
            driver.status = 'Available';
            await driver.save();
          }
        }
      }
    }

    Object.assign(trip, body);
    await trip.save();

    const populated = await Trip.findById(trip._id).populate('assignedVehicle').populate('assignedDriver');
    return NextResponse.json({ success: true, data: populated });
  } catch (error) {
    console.error('Trip PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Dispatcher', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.assignedVehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.assignedDriver, { status: 'Available' });
    }

    await Trip.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Trip DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
