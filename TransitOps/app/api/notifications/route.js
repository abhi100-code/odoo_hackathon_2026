import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import Driver from '@/models/Driver';
import MaintenanceLog from '@/models/MaintenanceLog';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringDrivers = await Driver.find({
      licenseExpiryDate: { $lte: thirtyDaysFromNow },
    });

    for (const driver of expiringDrivers) {
      const daysLeft = Math.ceil((new Date(driver.licenseExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let message = '';
      if (daysLeft < 0) {
        message = `CRITICAL: Driver ${driver.name}'s license (${driver.licenseNumber}) expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}!`;
      } else {
        message = `Reminder: Driver ${driver.name}'s license (${driver.licenseNumber}) is expiring in ${daysLeft} days on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}.`;
      }

      const exists = await Notification.findOne({
        type: 'License Expiry',
        message: message,
      });

      if (!exists) {
        await Notification.create({
          type: 'License Expiry',
          message: message,
        });
        console.log(`[MOCK EMAIL REMINDER] To: fleetops-alerts@transitops.com | Msg: ${message}`);
      }
    }

    const nearDueMaintenance = await MaintenanceLog.find({
      status: 'Open',
      nextServiceDate: { $lte: sevenDaysFromNow },
    }).populate('vehicle');

    for (const log of nearDueMaintenance) {
      if (!log.vehicle) continue;
      const daysLeft = Math.ceil((new Date(log.nextServiceDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let message = '';
      if (daysLeft < 0) {
        message = `OVERDUE: Maintenance (${log.maintenanceType}) for vehicle ${log.vehicle.name} (${log.vehicle.registrationNumber}) was due on ${new Date(log.nextServiceDate).toLocaleDateString()}!`;
      } else {
        message = `Alert: Maintenance (${log.maintenanceType}) for vehicle ${log.vehicle.name} (${log.vehicle.registrationNumber}) is due in ${daysLeft} days.`;
      }

      const exists = await Notification.findOne({
        type: 'Maintenance Due',
        message: message,
      });

      if (!exists) {
        await Notification.create({
          type: 'Maintenance Due',
          message: message,
        });
      }
    }

    const notifications = await Notification.find().sort({ read: 1, date: -1 }).limit(50);
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, read = true } = body;

    if (id) {
      await Notification.findByIdAndUpdate(id, { read });
    } else {
      await Notification.updateMany({ read: false }, { read: true });
    }

    return NextResponse.json({ success: true, message: 'Notifications updated successfully' });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
