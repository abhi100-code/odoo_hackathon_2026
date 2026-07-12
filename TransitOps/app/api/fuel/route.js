import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FuelLog from '@/models/FuelLog';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
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
    const driverId = searchParams.get('driver') || '';

    let query = {};
    if (vehicleId) query.vehicle = vehicleId;
    if (driverId) query.driver = driverId;

    const logs = await FuelLog.find(query)
      .populate('vehicle')
      .populate('driver')
      .sort({ date: -1 });

    const logsWithEfficiency = await Promise.all(
      logs.map(async (log) => {
        const prevLog = await FuelLog.findOne({
          vehicle: log.vehicle?._id,
          date: { $lt: log.date },
        }).sort({ date: -1 });

        let efficiency = 0;
        let distance = 0;
        if (prevLog && log.odometerReading > prevLog.odometerReading) {
          distance = log.odometerReading - prevLog.odometerReading;
          efficiency = distance / log.fuelQuantity;
        }

        return {
          ...log.toObject(),
          distanceTravelled: distance,
          fuelEfficiency: parseFloat(efficiency.toFixed(2)),
        };
      })
    );

    return NextResponse.json({ success: true, data: logsWithEfficiency });
  } catch (error) {
    console.error('Fuel logs GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request, ['Fleet Manager', 'Financial Analyst', 'Transport Administrator']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { vehicle: vehicleId, driver: driverId, fuelQuantity, fuelCost, odometerReading, fuelStation, date } = body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
    }

    if (odometerReading > vehicle.odometerReading) {
      vehicle.odometerReading = odometerReading;
      await vehicle.save();
    }

    const log = await FuelLog.create({
      vehicle: vehicleId,
      driver: driverId,
      fuelQuantity,
      fuelCost,
      odometerReading,
      fuelStation,
      date,
    });

    await Expense.create({
      category: 'Fuel',
      amount: fuelCost,
      date,
      description: `Fuel purchase of ${fuelQuantity}L at ${fuelStation} for ${vehicle.name}`,
      referenceId: log._id,
    });

    const populated = await FuelLog.findById(log._id).populate('vehicle').populate('driver');
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error('Fuel POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
