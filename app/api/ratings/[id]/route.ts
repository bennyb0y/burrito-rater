import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const numericId = Number(params.id);
    console.log('Delete request received for ID:', numericId);
    
    // Try to delete the rating
    const deletedRating = await prisma.rating.delete({
      where: {
        id: numericId
      }
    });

    if (!deletedRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully deleted rating ${numericId}`
    });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 