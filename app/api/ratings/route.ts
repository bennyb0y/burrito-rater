import { NextRequest, NextResponse } from 'next/server';
import * as db from '../db';

// Configure this route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the confirmed parameter from the URL
    const { searchParams } = new URL(request.url);
    const confirmed = searchParams.get('confirmed');
    
    console.log(`GET /api/ratings with confirmed=${confirmed}`);
    
    let data;
    if (confirmed === 'true') {
      data = db.getConfirmedRatings();
    } else if (confirmed === 'false') {
      data = db.getUnconfirmedRatings();
    } else {
      data = db.getAllRatings();
    }
    
    console.log(`Returning ${data.length} ratings`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('POST /api/ratings with body:', body);
    
    // Create the rating
    const newRating = db.createRating(body);
    
    console.log('Created new rating with ID:', newRating.id);
    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to create rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 