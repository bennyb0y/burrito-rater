'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
}

export default function ListPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [sortOrder, setSortOrder] = useState<'high' | 'low'>('high');

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('/api/ratings');
        if (!response.ok) throw new Error('Failed to fetch ratings');
        const data = await response.json();
        setRatings(data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, []);

  const getSortedRatings = () => {
    return [...ratings].sort((a, b) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Burrito Ratings</h1>
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'price')}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white"
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'high' | 'low')}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 bg-white"
          >
            <option value="high">High to Low</option>
            <option value="low">Low to High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {getSortedRatings().map((rating) => (
          <div
            key={rating.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{rating.restaurantName}</h2>
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
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="text-lg font-bold text-blue-800">{rating.rating}</span>
                    <span className="text-blue-600">/5</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
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
        ))}
      </div>
    </div>
  );
} 