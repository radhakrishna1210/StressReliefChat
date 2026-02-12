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
      { projection: { previousCalls: 1 } }
    );
    
    return NextResponse.json(user?.previousCalls || []);
  } catch (error) {
    console.error('Error fetching previous calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch previous calls' },
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
    const { previousCalls } = await request.json();
    
    await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: { previousCalls, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving previous calls:', error);
    return NextResponse.json(
      { error: 'Failed to save previous calls' },
      { status: 500 }
    );
  }
}

