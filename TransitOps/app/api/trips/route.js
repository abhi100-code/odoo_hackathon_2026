import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/models/Trip';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const vehicleId = searchParams.get('vehicle') || '';
    const driverId = searchParams.get('driver') || '';

    let query = {};
    if (status) query.status = status;
    if (vehicleId) query.assignedVehicle = vehicleId;
    if (driverId) query.assignedDriver = driverId;

    const trips = await Trip.find(query)
      .populate('assignedVehicle')
      .populate('assignedDriver')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: trips });
  } catch (error) {
    console.error('Trips GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Dispatcher', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { sourceLocation, destinationLocation, assignedVehicle, assignedDriver, cargoWeight, plannedDistance, revenueGenerated, status = 'Draft' } = body;

    const vehicle = await Vehicle.findById(assignedVehicle);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
    }

    const driver = await Driver.findById(assignedDriver);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 400 });
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      return NextResponse.json({ error: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg).` }, { status: 400 });
    }

    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return NextResponse.json({ error: `Driver license has expired (Expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}).` }, { status: 400 });
    }

    if (driver.status === 'Suspended') {
      return NextResponse.json({ error: 'Cannot assign a suspended driver.' }, { status: 400 });
    }

    if (vehicle.status === 'Retired') {
      return NextResponse.json({ error: 'Cannot assign a retired vehicle.' }, { status: 400 });
    }

    if (status === 'Dispatched') {
      if (vehicle.status !== 'Available') {
        return NextResponse.json({ error: `Vehicle is currently ${vehicle.status} and cannot be dispatched.` }, { status: 400 });
      }
      if (driver.status !== 'Available') {
        return NextResponse.json({ error: `Driver is currently ${driver.status} and cannot be dispatched.` }, { status: 400 });
      }

      vehicle.status = 'On Trip';
      driver.status = 'On Trip';
      await vehicle.save();
      await driver.save();
    }

    const trip = await Trip.create({
      sourceLocation,
      destinationLocation,
      assignedVehicle,
      assignedDriver,
      cargoWeight,
      plannedDistance,
      revenueGenerated,
      status,
    });

    const populated = await Trip.findById(trip._id).populate('assignedVehicle').populate('assignedDriver');
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error('Trips POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
