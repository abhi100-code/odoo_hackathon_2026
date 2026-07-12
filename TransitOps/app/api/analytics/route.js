import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';
import MaintenanceLog from '@/models/MaintenanceLog';
import FuelLog from '@/models/FuelLog';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    await dbConnect();
    const auth = getAuthUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const shopVehicles = await Vehicle.countDocuments({ status: 'In Shop' });

    const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
    const pendingTrips = await Trip.countDocuments({ status: 'Draft' });

    const activeDrivers = await Driver.countDocuments({ status: 'On Trip' });
    const totalDrivers = await Driver.countDocuments();

    const utilization = totalVehicles > 0 ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(1)) : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyFuelExpense = await Expense.aggregate([
      { $match: { category: 'Fuel', date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyFuelCost = monthlyFuelExpense[0]?.total || 0;

    const monthlyMaintExpense = await Expense.aggregate([
      { $match: { category: 'Maintenance', date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyMaintCost = monthlyMaintExpense[0]?.total || 0;

    const categoryExpenses = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    const expensesByCategory = {
      Fuel: 0,
      Maintenance: 0,
      Toll: 0,
      Parking: 0,
      Insurance: 0,
      Miscellaneous: 0,
    };
    categoryExpenses.forEach((item) => {
      if (expensesByCategory[item._id] !== undefined) {
        expensesByCategory[item._id] = item.total;
      }
    });

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        monthName: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        revenue: 0,
        expenses: 0,
      });
    }

    for (const m of last6Months) {
      const revResult = await Trip.aggregate([
        { $match: { status: 'Completed', updatedAt: { $gte: m.start, $lte: m.end } } },
        { $group: { _id: null, total: { $sum: '$revenueGenerated' } } },
      ]);
      m.revenue = revResult[0]?.total || 0;

      const expResult = await Expense.aggregate([
        { $match: { date: { $gte: m.start, $lte: m.end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      m.expenses = expResult[0]?.total || 0;
    }

    const revenueVsExpenses = {
      labels: last6Months.map(m => m.monthName),
      revenue: last6Months.map(m => m.revenue),
      expenses: last6Months.map(m => m.expenses),
    };

    const drivers = await Driver.find().sort({ safetyScore: -1 }).limit(10);
    const driverPerformance = await Promise.all(
      drivers.map(async (d) => {
        const tripsCount = await Trip.countDocuments({ assignedDriver: d._id, status: 'Completed' });
        return {
          name: d.name,
          safetyScore: d.safetyScore,
          tripsCount,
        };
      })
    );

    const allVehicles = await Vehicle.find();
    const vehicleROIReport = await Promise.all(
      allVehicles.map(async (v) => {
        const tripRev = await Trip.aggregate([
          { $match: { assignedVehicle: v._id, status: 'Completed' } },
          { $group: { _id: null, total: { $sum: '$revenueGenerated' } } },
        ]);
        const totalRevenue = tripRev[0]?.total || 0;

        const maintCostAgg = await MaintenanceLog.aggregate([
          { $match: { vehicle: v._id } },
          { $group: { _id: null, total: { $sum: '$cost' } } },
        ]);
        const totalMaintCost = maintCostAgg[0]?.total || 0;

        const fuelCostAgg = await FuelLog.aggregate([
          { $match: { vehicle: v._id } },
          { $group: { _id: null, total: { $sum: '$fuelCost' } } },
        ]);
        const totalFuelCost = fuelCostAgg[0]?.total || 0;

        const totalCost = totalMaintCost + totalFuelCost;
        const netProfit = totalRevenue - totalCost;
        const roi = v.acquisitionCost > 0 ? parseFloat(((netProfit / v.acquisitionCost) * 100).toFixed(2)) : 0;

        return {
          registrationNumber: v.registrationNumber,
          name: v.name,
          acquisitionCost: v.acquisitionCost,
          totalRevenue,
          totalMaintCost,
          totalFuelCost,
          netProfit,
          roi,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalVehicles,
          activeVehicles,
          availableVehicles,
          shopVehicles,
          activeTrips,
          pendingTrips,
          activeDrivers,
          totalDrivers,
          utilization,
          monthlyFuelCost,
          monthlyMaintCost,
        },
        charts: {
          vehicleStatus: {
            Available: availableVehicles,
            'On Trip': activeVehicles,
            'In Shop': shopVehicles,
            Retired: await Vehicle.countDocuments({ status: 'Retired' }),
          },
          expensesByCategory,
          revenueVsExpenses,
          driverPerformance,
        },
        reports: {
          vehicleROI: vehicleROIReport,
        },
      },
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
