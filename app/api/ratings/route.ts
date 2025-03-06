import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { generateIdentity } from '@/lib/identity';
import { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

interface Rating {
  id: number;
  createdAt: string;
  latitude: number;
  longitude: number;
  burritoTitle: string;
  rating: number;
  taste: number;
  value: number;
  price: number;
  restaurantName: string;
  review?: string;
  reviewerName?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
}

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

export async function GET(request: Request, context: { env?: { DB?: D1Database } }) {
  try {
    const db = await getDatabase(context.env);
    const ratings = await db.getAllRatings();
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { env?: { DB?: D1Database } }) {
  try {
    const data = await request.json();
    console.log('Received data:', data);
    
    // Always generate identity if either field is present
    const hasIdentityFields = data.identityPassword !== undefined || data.reviewerName !== undefined;
    
    if (hasIdentityFields) {
      console.log('Generating identity for:', {
        username: data.reviewerName,
        password: data.identityPassword
      });
      
      const { hash, emoji, display } = generateIdentity(data.reviewerName, data.identityPassword);
      console.log('Generated identity:', { hash, emoji, display });
      
      if (hash && emoji) {
        data.identityPassword = hash;
        data.generatedEmoji = display;
      }
    }
    
    console.log('Final data being sent to database:', data);
    
    const db = await getDatabase(context.env);
    
    // Create the rating with the data
    const ratingData = {
      restaurantName: data.restaurantName,
      burritoTitle: data.burritoTitle,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      rating: parseFloat(data.rating),
      taste: parseFloat(data.taste),
      value: parseFloat(data.value),
      price: parseFloat(data.price),
      hasPotatoes: Boolean(data.hasPotatoes),
      hasCheese: Boolean(data.hasCheese),
      hasBacon: Boolean(data.hasBacon),
      hasChorizo: Boolean(data.hasChorizo),
      hasOnion: Boolean(data.hasOnion),
      hasVegetables: Boolean(data.hasVegetables),
      review: data.review || null,
      reviewerName: data.reviewerName || null,
      reviewerEmoji: data.reviewerEmoji || null,
      identityPassword: data.identityPassword || null,
      generatedEmoji: data.generatedEmoji || null,
      zipcode: data.zipcode || null
    };

    const result = await db.createRating(ratingData);
    
    // Fetch the newly created rating to return it
    const newRating = await db.getRatingById(result.id);

    return NextResponse.json(newRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 