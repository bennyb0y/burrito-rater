import { NextRequest, NextResponse } from 'next/server';
import * as db from '../../db';

// Configure this route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    console.log(`DELETE /api/ratings/${id}`);
    
    // Check if the rating exists
    const rating = db.getRatingById(id);
    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }
    
    // Delete the rating
    const success = db.deleteRating(id);
    
    if (success) {
      console.log(`Successfully deleted rating ${id}`);
      return NextResponse.json({ message: 'Rating deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    console.log(`PATCH /api/ratings/${id} with body:`, body);
    
    // Check if the rating exists
    const rating = db.getRatingById(id);
    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }
    
    // Update the rating
    const updatedRating = db.updateRating(id, body);
    
    if (updatedRating) {
      console.log(`Successfully updated rating ${id}`);
      return NextResponse.json(updatedRating);
    } else {
      return NextResponse.json(
        { error: 'Failed to update rating' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in ratings API route:', error);
    return NextResponse.json(
      { error: 'Failed to update rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 