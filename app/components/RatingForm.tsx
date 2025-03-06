'use client';

import { useState } from 'react';
import { generateUserEmoji, validatePassword } from '../utils/auth';

interface Position {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface Props {
  position: Position;
  placeName: string;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

// Helper function to get rating emoji
function getRatingEmoji(rating: number): string {
  const roundedRating = Math.round(rating);
  const emojis = {
    1: '😖', // Confounded face
    2: '😕', // Confused face
    3: '😐', // Neutral face
    4: '😋', // Face savoring food
    5: '🤤', // Drooling face
  };
  return emojis[roundedRating as keyof typeof emojis] || '😐';
}

// Helper function to get price reaction emoji
function getPriceEmoji(price: number): string {
  if (price <= 5) return '🤑'; // Money face - great deal
  if (price <= 8) return '😊'; // Happy face - good price
  if (price <= 12) return '😐'; // Neutral face - okay price
  if (price <= 15) return '😟'; // Worried face - getting expensive
  if (price <= 20) return '😠'; // Angry face - expensive
  if (price <= 25) return '🤬'; // Very angry face - very expensive
  return '🤯'; // Mind blown - extremely expensive
}

// Helper function to extract zipcode from address
function extractZipcode(address: string): string | undefined {
  const zipcodeMatch = address.match(/\b\d{5}\b/);
  return zipcodeMatch ? zipcodeMatch[0] : undefined;
}

export default function RatingForm({ position, placeName, onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [burritoTitle, setBurritoTitle] = useState('Breakfast Burrito');
  const [rating, setRating] = useState(3);
  const [taste, setTaste] = useState(3);
  const [value, setValue] = useState(3);
  const [price, setPrice] = useState(10);
  const [review, setReview] = useState('');
  const [ingredients, setIngredients] = useState({
    hasPotatoes: false,
    hasCheese: false,
    hasBacon: false,
    hasChorizo: false,
    hasOnion: false,
    hasVegetables: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate emoji if password is provided
    const reviewerEmoji = password.length >= 4 ? generateUserEmoji(password) : undefined;
    
    // Extract zipcode from address
    const zipcode = extractZipcode(position.address);
    
    onSubmit({
      latitude: position.lat,
      longitude: position.lng,
      burritoTitle,
      rating,
      taste,
      value,
      price,
      restaurantName: position.name,
      review,
      reviewerName: name.trim() || 'Anonymous',
      identityPassword: password.length >= 4 ? password : undefined,
      reviewerEmoji,
      zipcode,
      ...ingredients,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
        <div className="p-3 sm:p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-black">Rate this Burrito</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-bold text-black">Restaurant</label>
              <p className="text-black leading-tight">{position.name}</p>
              <p className="text-sm text-black leading-tight">{position.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-black">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Anonymous"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-black">
                  Reviewer Identity Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4-10 characters for your unique emoji identity"
                  maxLength={10}
                />
                {password && !validatePassword(password) && (
                  <p className="text-sm text-black leading-tight mt-1">
                    Password must be between 4 and 10 characters
                  </p>
                )}
                {validatePassword(password) && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md mt-1">
                    <span className="text-3xl">{generateUserEmoji(password)}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">Your Reviewer Identity</span>
                      <span className="text-xs text-gray-600">This emoji will appear on your review</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="burritoTitle" className="block text-sm font-bold text-black">
                Burrito Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="burritoTitle"
                  value={burritoTitle}
                  onChange={(e) => setBurritoTitle(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validatePassword(password) && (
                  <span className="text-2xl" role="img" aria-label="reviewer identity">
                    {generateUserEmoji(password)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-bold text-black">Overall Rating</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-2xl sm:text-3xl" role="img" aria-label="rating emotion">
                    {getRatingEmoji(rating)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black leading-tight mt-1">
                  <span>Poor</span>
                  <span>Amazing</span>
                </div>
                <p className="text-center text-sm font-medium text-black mt-1">
                  Rating: {rating.toFixed(1)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black">Taste</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={taste}
                    onChange={(e) => setTaste(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-2xl sm:text-3xl" role="img" aria-label="taste rating">
                    {getRatingEmoji(taste)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black leading-tight mt-1">
                  <span>Poor</span>
                  <span>Delicious</span>
                </div>
                <p className="text-center text-sm font-medium text-black mt-1">
                  Taste: {taste.toFixed(1)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black">Value for Money</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-2xl sm:text-3xl" role="img" aria-label="value rating">
                    {getRatingEmoji(value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black leading-tight mt-1">
                  <span>Poor</span>
                  <span>Great Value</span>
                </div>
                <p className="text-center text-sm font-medium text-black mt-1">
                  Value: {value.toFixed(1)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black">Price ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="35"
                    step="0.5"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-2xl sm:text-3xl" role="img" aria-label="price reaction">
                    {getPriceEmoji(price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-black leading-tight mt-1">
                  <span>$3</span>
                  <span>$35</span>
                </div>
                <p className="text-center text-lg font-bold text-black leading-tight mt-1">
                  ${price.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black">
                <span className="flex items-center gap-1">
                  Ingredients <span className="text-2xl">🧂</span>
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
                {Object.entries(ingredients).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setIngredients((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-black flex items-center gap-1">
                      <span className="text-xl">
                        {key === 'hasPotatoes' && '🥔'}
                        {key === 'hasCheese' && '🧀'}
                        {key === 'hasBacon' && '🥓'}
                        {key === 'hasChorizo' && '🌭'}
                        {key === 'hasOnion' && '🧅'}
                        {key === 'hasVegetables' && '🥬'}
                      </span>
                      {key.replace('has', '')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review" className="block text-sm font-bold text-black">
                Review (Optional)
              </label>
              <textarea
                id="review"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts about this burrito..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Rating
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 