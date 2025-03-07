// Simple in-memory database for local development

// Define the Rating type
export interface Rating {
  id: number;
  createdAt: string;
  updatedAt: string;
  restaurantName: string;
  burritoTitle: string;
  latitude: number;
  longitude: number;
  zipcode?: string;
  rating: number;
  taste: number;
  value: number;
  price: number;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
  review?: string;
  reviewerName?: string;
  reviewerEmoji?: string;
  confirmed: boolean;
}

// Initialize with some sample data
let ratings: Rating[] = [
  {
    id: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantName: "Taco Bell",
    burritoTitle: "Breakfast Burrito",
    latitude: 34.0522,
    longitude: -118.2437,
    zipcode: "90012",
    rating: 3.5,
    taste: 3,
    value: 4,
    price: 5.99,
    hasPotatoes: true,
    hasCheese: true,
    hasBacon: true,
    hasChorizo: false,
    hasOnion: true,
    hasVegetables: false,
    review: "Decent fast food breakfast burrito",
    reviewerName: "John",
    reviewerEmoji: "🌮",
    confirmed: true
  },
  {
    id: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantName: "El Burrito",
    burritoTitle: "Super Burrito",
    latitude: 34.0511,
    longitude: -118.2426,
    zipcode: "90012",
    rating: 4.5,
    taste: 5,
    value: 4,
    price: 8.99,
    hasPotatoes: false,
    hasCheese: true,
    hasBacon: false,
    hasChorizo: true,
    hasOnion: true,
    hasVegetables: true,
    review: "Amazing authentic burrito",
    reviewerName: "Maria",
    reviewerEmoji: "🔥",
    confirmed: true
  },
  {
    id: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantName: "Burrito King",
    burritoTitle: "Veggie Burrito",
    latitude: 34.0533,
    longitude: -118.2447,
    zipcode: "90012",
    rating: 4.0,
    taste: 4,
    value: 4,
    price: 7.99,
    hasPotatoes: true,
    hasCheese: true,
    hasBacon: false,
    hasChorizo: false,
    hasOnion: true,
    hasVegetables: true,
    review: "Great vegetarian option",
    reviewerName: "Alex",
    reviewerEmoji: "🥑",
    confirmed: false
  }
];

// Get all ratings
export function getAllRatings(): Rating[] {
  return [...ratings];
}

// Get confirmed ratings
export function getConfirmedRatings(): Rating[] {
  return ratings.filter(rating => rating.confirmed);
}

// Get unconfirmed ratings
export function getUnconfirmedRatings(): Rating[] {
  return ratings.filter(rating => !rating.confirmed);
}

// Get a rating by ID
export function getRatingById(id: number): Rating | undefined {
  return ratings.find(rating => rating.id === id);
}

// Create a new rating
export function createRating(data: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>): Rating {
  const now = new Date().toISOString();
  const newRating: Rating = {
    id: ratings.length > 0 ? Math.max(...ratings.map(r => r.id)) + 1 : 1,
    createdAt: now,
    updatedAt: now,
    ...data
  };
  
  ratings.push(newRating);
  return newRating;
}

// Update a rating
export function updateRating(id: number, data: Partial<Rating>): Rating | null {
  const index = ratings.findIndex(rating => rating.id === id);
  if (index === -1) return null;
  
  const updatedRating = {
    ...ratings[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  ratings[index] = updatedRating;
  return updatedRating;
}

// Confirm a rating
export function confirmRating(id: number): Rating | null {
  return updateRating(id, { confirmed: true });
}

// Bulk confirm ratings
export function bulkConfirmRatings(ids: number[]): number {
  let count = 0;
  
  ids.forEach(id => {
    const result = confirmRating(id);
    if (result) count++;
  });
  
  return count;
}

// Delete a rating
export function deleteRating(id: number): boolean {
  const initialLength = ratings.length;
  ratings = ratings.filter(rating => rating.id !== id);
  return ratings.length < initialLength;
}

// Reset the database (for testing)
export function resetDatabase(): void {
  ratings = [];
} 