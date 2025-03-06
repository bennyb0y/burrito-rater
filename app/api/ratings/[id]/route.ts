import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

// Helper function to get D1 database instance
async function getDatabase(env?: { DB?: D1Database }) {
  // Check if we're running in a Cloudflare environment with D1 binding
  if (env?.DB) {
    return new Database(env.DB);
  }
  
  // For local development without D1 binding, use Cloudflare's D1 API
  // This requires setting up wrangler.toml and running with wrangler dev
  throw new Error('D1 database binding not available. Please run with wrangler dev');
}

export async function DELETE(
  request: Request,
  { params, env }: { params: { id: string }, env?: { DB?: D1Database } }
) {
  try {
    const numericId = Number(params.id);
    console.log('Delete request received for ID:', numericId);
    
    const db = await getDatabase(env);
    
    // Try to delete the rating
    const success = await db.deleteRating(numericId);

    if (!success) {
      return NextResponse.json(
        { error: 'Rating not found or could not be deleted' },
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