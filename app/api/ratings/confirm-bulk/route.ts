import { NextRequest, NextResponse } from 'next/server';
import * as db from '../../db';

// Configure this route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    console.log(`POST /api/ratings/confirm-bulk with ids:`, ids);
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty rating IDs' },
        { status: 400 }
      );
    }
    
    // Bulk confirm ratings
    const count = db.bulkConfirmRatings(ids);
    
    console.log(`Successfully confirmed ${count} ratings`);
    return NextResponse.json({
      message: 'Ratings confirmed successfully',
      count
    });
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to bulk confirm ratings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 