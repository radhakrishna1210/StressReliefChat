import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('stressrelief');
    const usersCollection = db.collection('users');
    
    const email = decodeURIComponent(params.email);
    const user = await usersCollection.findOne(
      { email },
      { projection: { favorites: 1 } }
    );
    
    return NextResponse.json(user?.favorites || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('stressrelief');
    const usersCollection = db.collection('users');
    
    const email = decodeURIComponent(params.email);
    const { favorites } = await request.json();
    
    await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: { favorites, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving favorites:', error);
    return NextResponse.json(
      { error: 'Failed to save favorites' },
      { status: 500 }
    );
  }
}

