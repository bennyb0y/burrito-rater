import { NextRequest, NextResponse } from 'next/server';
import * as db from '../../../db';

// Configure this route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    console.log(`POST /api/ratings/${id}/confirm`);
    
    // Check if the rating exists
    const rating = db.getRatingById(id);
    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }
    
    // Confirm the rating
    const confirmedRating = db.confirmRating(id);
    
    if (confirmedRating) {
      console.log(`Successfully confirmed rating ${id}`);
      return NextResponse.json(confirmedRating);
    } else {
      return NextResponse.json(
        { error: 'Failed to confirm rating' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to confirm rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 