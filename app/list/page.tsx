'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniMap from '../components/MiniMap';
import { getApiUrl } from '../config.js';

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
  hasAvocado: boolean;
  hasVegetables: boolean;
  zipcode?: string;
  confirmed?: number;
  createdAt?: string;
}

export default function ListPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [sortOrder, setSortOrder] = useState<'high' | 'low'>('high');
  const [zipcode, setZipcode] = useState<string>('');
  const mapError = false;

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Fetch all ratings from the API
        const response = await fetch(getApiUrl('ratings'));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch ratings: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Filter ratings that have confirmed=1 or confirmed=true
        const confirmedRatings = data.filter((rating: Rating) => {
          return (typeof rating.confirmed === 'number' && rating.confirmed === 1) || 
                 (typeof rating.confirmed === 'boolean' && rating.confirmed === true);
        });
        
        setRatings(confirmedRatings);
      } catch (error) {
        console.error('Error fetching ratings');
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
      // Handle undefined values
      if (a[sortBy] === undefined && b[sortBy] === undefined) return 0;
      if (a[sortBy] === undefined) return sortOrder === 'high' ? -1 : 1;
      if (b[sortBy] === undefined) return sortOrder === 'high' ? 1 : -1;

      // Sort by rating or price
      if (sortBy === 'rating') {
        return sortOrder === 'high' ? b.rating - a.rating : a.rating - b.rating;
      } else if (sortBy === 'price') {
        return sortOrder === 'high' ? b.price - a.price : a.price - b.price;
      }
      
      return 0;
    });
  };

  const renderIngredients = (rating: Rating) => {
    const ingredients = [];
    if (rating.hasPotatoes) ingredients.push('🥔 Potatoes');
    if (rating.hasCheese) ingredients.push('🧀 Cheese');
    if (rating.hasBacon) ingredients.push('🥓 Bacon');
    if (rating.hasChorizo) ingredients.push('🌭 Chorizo');
    if (rating.hasAvocado) ingredients.push('🥑 Avocado');
    if (rating.hasVegetables) ingredients.push('🥬 Vegetables');
    return ingredients.join(' • ') || 'No ingredients listed';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
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

        <div className="grid gap-3">
          {getSortedRatings().map((rating) => (
            <div
              key={rating.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mini Map */}
                <div className="w-full sm:w-36 h-36 flex-shrink-0">
                  {!mapError ? (
                    <MiniMap
                      latitude={rating.latitude}
                      longitude={rating.longitude}
                      rating={rating.rating}
                      restaurantName={rating.restaurantName}
                      burritoTitle={rating.burritoTitle}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Map unavailable</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{rating.restaurantName}</h2>
                      <p className="text-sm text-gray-600">{rating.burritoTitle}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-gray-500 italic">by</span>
                        <span className="text-xs font-bold text-gray-700">
                          {rating.reviewerName || 'Anonymous'}
                        </span>
                        {rating.reviewerEmoji && (
                          <span className="text-sm">{rating.reviewerEmoji}</span>
                        )}
                        <span className="text-xs text-gray-500 ml-2">
                          {rating.createdAt ? formatDate(rating.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="text-base font-bold text-blue-800">{rating.rating}</span>
                        <span className="text-xs text-blue-600">/5</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        ${rating.price.toFixed(2)}
                      </div>
                      {rating.zipcode && (
                        <div className="text-xs text-gray-500 mt-1">
                          ZIP: {rating.zipcode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>😋</span>
                      <span>Taste: {rating.taste.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💰</span>
                      <span>Value: {rating.value.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🧩</span>
                      <span>Ingredients: {renderIngredients(rating)}</span>
                    </div>
                  </div>

                  {rating.review && (
                    <div className="mt-2 text-xs text-gray-700 line-clamp-2">
                      &ldquo;{rating.review}&rdquo;
                    </div>
                  )}

                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/?lat=${rating.latitude}&lng=${rating.longitude}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
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
    </div>
  );
} 