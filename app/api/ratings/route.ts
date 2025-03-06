import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateIdentity } from '@/lib/identity';

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

export async function GET() {
  try {
    const ratings = await prisma.rating.findMany();
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    
    // Create the rating with the data directly
    const rating = await prisma.rating.create({
      data: {
        ...data,
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
        zipcode: data.zipcode || null
      }
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 