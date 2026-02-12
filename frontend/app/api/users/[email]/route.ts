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
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return sensitive data
    const { _id, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('stressrelief');
    const usersCollection = db.collection('users');

    const email = decodeURIComponent(params.email);
    const body = await request.json();

    // Upsert user (create if doesn't exist, update if exists)
    const result = await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: {
          ...body,
          email,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create/update user' },
        { status: 500 }
      );
    }

    const { _id, ...userData } = result || {};
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
}

