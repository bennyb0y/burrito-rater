import { NextRequest, NextResponse } from 'next/server';

// Configure this route to be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Test API route called');
  
  // Create some mock ratings data
  const mockRatings = [
    {
      id: 1,
      latitude: 34.0011,
      longitude: -118.4285,
      burritoTitle: "Test Burrito 1",
      rating: 4.5,
      taste: 4,
      value: 5,
      price: 8.99,
      restaurantName: "Test Restaurant 1",
      review: "This is a test review",
      reviewerName: "Test User",
      reviewerEmoji: "😎",
      hasPotatoes: true,
      hasCheese: true,
      hasBacon: false,
      hasChorizo: true,
      hasOnion: true,
      hasVegetables: false,
      confirmed: true
    },
    {
      id: 2,
      latitude: 34.0211,
      longitude: -118.4385,
      burritoTitle: "Test Burrito 2",
      rating: 3.5,
      taste: 3,
      value: 4,
      price: 7.99,
      restaurantName: "Test Restaurant 2",
      review: "Another test review",
      reviewerName: "Another User",
      reviewerEmoji: "🤠",
      hasPotatoes: false,
      hasCheese: true,
      hasBacon: true,
      hasChorizo: false,
      hasOnion: true,
      hasVegetables: true,
      confirmed: true
    }
  ];
  
  return NextResponse.json(mockRatings);
} 