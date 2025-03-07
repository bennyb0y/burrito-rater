'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getApiUrl } from '../config';

const MiniMap = dynamic(() => import('../components/MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

interface Rating {
  id: string;
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
  reviewerEmoji?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
  zipcode?: string;
  confirmed?: number;
}

export default function ListPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [sortOrder, setSortOrder] = useState<'high' | 'low'>('high');
  const [zipcode, setZipcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching ratings from API');
        
        // Fetch all ratings from the API without the confirmed filter
        const response = await fetch(getApiUrl('ratings'));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch ratings: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched ratings:', data);
        
        // Load confirmed ratings from localStorage
        let confirmedRatings: number[] = [];
        try {
          confirmedRatings = JSON.parse(localStorage.getItem('confirmedRatings') || '[]');
        } catch (e) {
          console.error('Error loading confirmed status from localStorage:', e);
        }
        
        // Create a map of confirmed ratings
        const confirmedMap: Record<number, boolean> = {};
        confirmedRatings.forEach((id: number) => {
          confirmedMap[id] = true;
        });
        
        // Apply the confirmed status to the data and filter to only show confirmed ratings
        const ratingsWithConfirmed = data.map((rating: Rating) => ({
          ...rating,
          confirmed: confirmedMap[Number(rating.id)] ? 1 : (rating.confirmed || 0)
        }));
        
        // Only show confirmed ratings
        const confirmedRatingsList = ratingsWithConfirmed.filter((rating: Rating) => 
          rating.confirmed
        );
        
        setRatings(confirmedRatingsList);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const getSortedRatings = () => {
    let filteredRatings = [...ratings];
    
    // Apply zipcode filter if one is entered
    if (zipcode) {
      filteredRatings = filteredRatings.filter(rating => 
        rating.zipcode?.toLowerCase() === zipcode.toLowerCase()
      );
    }

    // Apply sorting
    return filteredRatings.sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'high' ? b.rating - a.rating : a.rating - b.rating;
      } else {
        return sortOrder === 'high' ? b.price - a.price : a.price - b.price;
      }
    });
  };

  const renderIngredients = (rating: Rating) => {
    const ingredients = [];
    if (rating.hasPotatoes) ingredients.push('🥔 Potatoes');
    if (rating.hasCheese) ingredients.push('🧀 Cheese');
    if (rating.hasBacon) ingredients.push('🥓 Bacon');
    if (rating.hasChorizo) ingredients.push('🌭 Chorizo');
    if (rating.hasOnion) ingredients.push('🧅 Onion');
    if (rating.hasVegetables) ingredients.push('🥬 Vegetables');
    return ingredients.join(' • ') || 'No ingredients listed';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Burrito Ratings</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Zipcode Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white w-full sm:w-32"
            />
            {zipcode && (
              <button
                onClick={() => setZipcode('')}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'price')}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white flex-1 sm:flex-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'high' | 'low')}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white flex-1 sm:flex-none"
            >
              <option value="high">High to Low</option>
              <option value="low">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {getSortedRatings().length} {getSortedRatings().length === 1 ? 'result' : 'results'} found
      </div>

      <div className="grid gap-4 sm:gap-6">
        {getSortedRatings().map((rating) => (
          <div
            key={rating.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:border-blue-500 transition-colors"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Mini Map */}
              <div className="w-full sm:w-48 h-48 flex-shrink-0">
                <MiniMap
                  latitude={rating.latitude}
                  longitude={rating.longitude}
                  rating={rating.rating}
                  restaurantName={rating.restaurantName}
                  burritoTitle={rating.burritoTitle}
                />
              </div>

              {/* Rating Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{rating.restaurantName}</h2>
                    <p className="text-gray-600">{rating.burritoTitle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {rating.reviewerName || 'Anonymous'}
                      </span>
                      {rating.reviewerEmoji && (
                        <span className="text-2xl">{rating.reviewerEmoji}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-800">{rating.rating}</span>
                        <span className="text-blue-600">/5</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${rating.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>😋</span>
                      <span>{rating.taste.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💰</span>
                      <span>{rating.value.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  {renderIngredients(rating)}
                </div>

                {rating.review && (
                  <div className="mt-4 text-gray-700">
                    "{rating.review}"
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={`/?lat=${rating.latitude}&lng=${rating.longitude}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View on Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 