import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    
    let query = {};
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Vehicles GET error:', error);
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
    const { registrationNumber } = body;

    const exists = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (exists) {
      return NextResponse.json({ error: 'Vehicle with this registration number already exists.' }, { status: 400 });
    }

    const vehicle = await Vehicle.create({
      ...body,
      registrationNumber: registrationNumber.toUpperCase(),
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('Vehicles POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
