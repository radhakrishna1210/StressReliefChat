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
      { projection: { walletBalance: 1 } }
    );

    return NextResponse.json({
      balance: user?.walletBalance || 0,
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
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
    const { amount } = await request.json();

    const result = await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: { walletBalance: amount, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: result?.walletBalance || amount || 0,
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}

