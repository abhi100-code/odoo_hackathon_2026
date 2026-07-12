import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: drivers });
  } catch (error) {
    console.error('Drivers GET error:', error);
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
    const { licenseNumber } = body;

    const exists = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (exists) {
      return NextResponse.json({ error: 'Driver with this license number already exists.' }, { status: 400 });
    }

    const driver = await Driver.create({
      ...body,
      licenseNumber: licenseNumber.toUpperCase(),
    });

    return NextResponse.json({ success: true, data: driver }, { status: 201 });
  } catch (error) {
    console.error('Drivers POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
