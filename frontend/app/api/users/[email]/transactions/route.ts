import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('stressrelief');
    const transactionsCollection = db.collection('transactions');
    
    const email = decodeURIComponent(params.email);
    const transactions = await transactionsCollection
      .find({ userEmail: email })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
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
    const transactionsCollection = db.collection('transactions');
    
    const email = decodeURIComponent(params.email);
    const transaction = await request.json();
    
    const result = await transactionsCollection.insertOne({
      ...transaction,
      userEmail: email,
      timestamp: transaction.timestamp ? new Date(transaction.timestamp) : new Date(),
    });
    
    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
    return NextResponse.json(
      { error: 'Failed to save transaction' },
      { status: 500 }
    );
  }
}

