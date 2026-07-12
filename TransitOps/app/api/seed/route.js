import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';
import MaintenanceLog from '@/models/MaintenanceLog';
import FuelLog from '@/models/FuelLog';
import Expense from '@/models/Expense';
import Notification from '@/models/Notification';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    await Notification.deleteMany({});

    const hashedPassword = await hashPassword('password123');

    const users = await User.create([
      { name: 'John Fleet', email: 'manager@transitops.com', password: hashedPassword, role: 'Fleet Manager' },
      { name: 'Alice Dispatch', email: 'dispatcher@transitops.com', password: hashedPassword, role: 'Dispatcher' },
      { name: 'Officer Safety', email: 'safety@transitops.com', password: hashedPassword, role: 'Safety Officer' },
      { name: 'Sarah Finance', email: 'finance@transitops.com', password: hashedPassword, role: 'Financial Analyst' },
      { name: 'Super Admin', email: 'admin@transitops.com', password: hashedPassword, role: 'Transport Administrator' },
    ]);

    const vehicle1 = await Vehicle.create({
      registrationNumber: 'TX-987-AB',
      name: 'Freightliner Cascadia',
      model: '2022 Semi-Truck',
      type: 'Semi-Truck',
      maxLoadCapacity: 15000,
      odometerReading: 82400,
      acquisitionCost: 145000,
      insuranceExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      registrationExpiryDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
      status: 'On Trip',
    });

    const vehicle2 = await Vehicle.create({
      registrationNumber: 'CA-456-XY',
      name: 'Ford Transit 350',
      model: '2021 Cargo Van',
      type: 'Van',
      maxLoadCapacity: 2500,
      odometerReading: 45000,
      acquisitionCost: 42000,
      insuranceExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      registrationExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'Available',
    });

    const vehicle3 = await Vehicle.create({
      registrationNumber: 'NY-123-CD',
      name: 'Hino 268',
      model: '2020 Box Truck',
      type: 'Box Truck',
      maxLoadCapacity: 8000,
      odometerReading: 110200,
      acquisitionCost: 85000,
      insuranceExpiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      registrationExpiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'In Shop',
    });

    const vehicle4 = await Vehicle.create({
      registrationNumber: 'FL-789-RE',
      name: 'Volvo VNL 860',
      model: '2015 Flatbed',
      type: 'Semi-Truck',
      maxLoadCapacity: 18000,
      odometerReading: 450000,
      acquisitionCost: 130000,
      insuranceExpiryDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      registrationExpiryDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      status: 'Retired',
    });

    const driver1 = await Driver.create({
      name: 'David Miller',
      licenseNumber: 'DL-9876543-TX',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0199',
      safetyScore: 95,
      emergencyContact: 'Mary Miller (+1-555-0198)',
      status: 'On Trip',
    });

    const driver2 = await Driver.create({
      name: 'Robert Garcia',
      licenseNumber: 'DL-1234567-CA',
      licenseCategory: 'Class B CDL',
      licenseExpiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0177',
      safetyScore: 88,
      emergencyContact: 'Elena Garcia (+1-555-0176)',
      status: 'Available',
    });

    const driver3 = await Driver.create({
      name: 'James Wilson',
      licenseNumber: 'DL-7654321-NY',
      licenseCategory: 'Standard Class D',
      licenseExpiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0155',
      safetyScore: 78,
      emergencyContact: 'Patricia Wilson (+1-555-0154)',
      status: 'Available',
    });

    const driver4 = await Driver.create({
      name: 'Michael Brown',
      licenseNumber: 'DL-4567890-FL',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0133',
      safetyScore: 92,
      emergencyContact: 'Linda Brown (+1-555-0132)',
      status: 'Off Duty',
    });

    const driver5 = await Driver.create({
      name: 'Thomas Anderson',
      licenseNumber: 'DL-0000000-NE',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0111',
      safetyScore: 45,
      emergencyContact: 'Agent Smith (+1-555-0110)',
      status: 'Suspended',
    });

    const trip1 = await Trip.create({
      sourceLocation: 'Houston Warehouse A',
      destinationLocation: 'Dallas Distribution Center',
      assignedVehicle: vehicle1._id,
      assignedDriver: driver1._id,
      cargoWeight: 12000,
      plannedDistance: 380,
      revenueGenerated: 2400,
      status: 'Completed',
    });

    const trip2 = await Trip.create({
      sourceLocation: 'Austin Logistics Hub',
      destinationLocation: 'San Antonio Store #12',
      assignedVehicle: vehicle1._id,
      assignedDriver: driver1._id,
      cargoWeight: 9500,
      plannedDistance: 130,
      revenueGenerated: 950,
      status: 'Dispatched',
    });

    const trip3 = await Trip.create({
      sourceLocation: 'Los Angeles Depot 2',
      destinationLocation: 'San Francisco Retail Hub',
      assignedVehicle: vehicle2._id,
      assignedDriver: driver2._id,
      cargoWeight: 1800,
      plannedDistance: 610,
      revenueGenerated: 1850,
      status: 'Draft',
    });

    const maint1 = await MaintenanceLog.create({
      vehicle: vehicle1._id,
      maintenanceType: 'Oil Change',
      description: 'Scheduled oil and filter change. Verified fluid levels.',
      cost: 150,
      serviceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      vendorName: 'Speedy Fleet Lube',
      nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'Closed',
    });

    const maint2 = await MaintenanceLog.create({
      vehicle: vehicle3._id,
      maintenanceType: 'Brake Service',
      description: 'Replaced front brake pads and rotors. Waiting for parts delivery.',
      cost: 650,
      serviceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      vendorName: 'Midtown Truck Repair',
      nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'Open',
    });

    const fuel1 = await FuelLog.create({
      vehicle: vehicle1._id,
      driver: driver1._id,
      fuelQuantity: 180,
      fuelCost: 270,
      odometerReading: 82000,
      fuelStation: "Love's Travel Stop #45",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    });

    const fuel2 = await FuelLog.create({
      vehicle: vehicle1._id,
      driver: driver1._id,
      fuelQuantity: 210,
      fuelCost: 315,
      odometerReading: 82400,
      fuelStation: 'Pilot Travel Center #12',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await Expense.create([
      { category: 'Fuel', amount: 270, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), description: 'Fuel purchase 180L Cascadia', referenceId: fuel1._id },
      { category: 'Fuel', amount: 315, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), description: 'Fuel purchase 210L Cascadia', referenceId: fuel2._id },
      { category: 'Maintenance', amount: 150, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), description: 'Oil Change - Freightliner Cascadia', referenceId: maint1._id },
      { category: 'Maintenance', amount: 650, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Brake Service - Hino 268', referenceId: maint2._id },
      { category: 'Toll', amount: 45, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), description: 'TX Express Toll Roads' },
      { category: 'Insurance', amount: 1200, date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), description: 'Semi-truck Commercial Insurance Premium' },
      { category: 'Parking', amount: 30, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), description: 'Overnight Secure Terminal Parking' },
    ]);

    await Notification.create([
      { type: 'General', message: 'TransitOps Platform successfully initialized.' },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      usersCount: users.length,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
