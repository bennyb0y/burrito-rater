'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox, InfoWindow } from '@react-google-maps/api';
import RatingForm from './RatingForm';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapContainerClassName = "absolute inset-0";

const libraries = ['places'];

// Default center (Mar Vista, CA - 90066)
const defaultCenter = {
  lat: 34.0011,
  lng: -118.4285
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: true,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  clickableIcons: false,
  styles: [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }]
};

const searchBoxStyle = {
  input: {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    outline: 'none',
    fontSize: '16px',
    color: '#1a202c'
  }
};

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
  identityPassword?: string;
  reviewerEmoji?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
}

// Helper function to get color based on rating
function getRatingColor(rating: number, isStroke: boolean = false): string {
  const baseColors = {
    1: ['#ff4444', '#cc0000'], // Red
    2: ['#ffbb33', '#ff8800'], // Orange
    3: ['#ffeb3b', '#fdd835'], // Yellow
    4: ['#00C851', '#007E33'], // Green
    5: ['#33b5e5', '#0099CC'], // Blue
  };
  
  const colorPair = baseColors[rating as keyof typeof baseColors] || baseColors[3];
  return isStroke ? colorPair[1] : colorPair[0];
}

// Helper function to get emoji based on rating
function getRatingEmoji(rating: number): string {
  const emojis = {
    1: '😖', // Confounded face
    2: '😕', // Confused face
    3: '😐', // Neutral face
    4: '😋', // Face savoring food
    5: '🤤', // Drooling face
  };
  return emojis[rating as keyof typeof emojis] || '😐';
}

interface MapProps {
  refreshTrigger?: number;
}

const Map: React.FC<MapProps> = ({ refreshTrigger = 0 }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyD-ner96UaZTvp6Aaj1wLttaT0SV-CWOEs',
    libraries: libraries as any
  });

  // Debug logging
  console.log('Load Error:', loadError);
  console.log('Is Loaded:', isLoaded);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    address: string;
  } | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [sortOrder, setSortOrder] = useState<'high' | 'low'>('high');

  // Sort ratings by overall rating
  const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);

  // Fetch ratings when component mounts or refreshTrigger changes
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
  }, [refreshTrigger]); // Add refreshTrigger to dependencies

  // Function to fetch nearby restaurants
  const fetchNearbyRestaurants = useCallback((center: google.maps.LatLng) => {
    if (!map) return;

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: center.toJSON(),
      radius: 1000, // 1km radius
      type: 'restaurant'
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyRestaurants(results);
      }
    });
  }, [map]);

  // Add bounds_changed handler
  const handleBoundsChanged = useCallback(() => {
    if (!map) return;
    const bounds = map.getBounds();
    if (bounds) {
      setMapBounds({
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      });
    }
  }, [map]);

  // Update map load handler
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
    const center = map.getCenter();
    if (center) {
      fetchNearbyRestaurants(center);
    }
    // Get initial bounds
    const bounds = map.getBounds();
    if (bounds) {
      setMapBounds({
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      });
    }
  }, [fetchNearbyRestaurants]);

  // Add center changed handler
  const handleCenterChanged = useCallback(() => {
    if (!map) return;
    const center = map.getCenter();
    if (center) {
      fetchNearbyRestaurants(center);
    }
  }, [map, fetchNearbyRestaurants]);

  // Handle restaurant click
  const handleRestaurantClick = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;
    
    setSelectedLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      name: place.name || 'Unknown Location',
      address: place.vicinity || 'No address available'
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    console.log('Search box loaded successfully');
    setSearchBox(ref);
  };

  // Updated map click handler to find nearby places
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!map || !e.latLng) return;

    // Close any existing info windows first
    setSelectedLocation(null);
    setSelectedRating(null);

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: e.latLng.toJSON(),
      radius: 50, // 50 meters radius
      type: 'restaurant'
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
        const place = results[0];
        const location = place.geometry?.location;
        if (location) {
          service.getDetails({
            placeId: place.place_id!,
            fields: ['name', 'formatted_address']
          }, (details, detailsStatus) => {
            if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && details) {
              setSelectedLocation({
                lat: location.lat(),
                lng: location.lng(),
                name: details.name || 'Unknown Location',
                address: details.formatted_address || 'No address available'
              });
            }
          });
        }
      }
    });
  }, [map]);

  // Add function to open Google Maps
  const openInGoogleMaps = useCallback((placeId?: string, lat?: number, lng?: number) => {
    let url = 'https://www.google.com/maps/search/?api=1';
    if (placeId) {
      url += `&query=&query_place_id=${placeId}`;
    } else if (lat && lng) {
      url += `&query=${lat},${lng}`;
    }
    window.open(url, '_blank');
  }, []);

  // Start rating for selected location
  const handleStartRating = useCallback(() => {
    if (selectedLocation) {
      setShowRatingForm(true);
    }
  }, [selectedLocation]);

  // Update places changed handler
  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location && map) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          map.panTo(location);
          map.setZoom(15);
        }
      }
    }
  };

  const handleRatingSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Close the form and reset selection
      setShowRatingForm(false);
      setSelectedLocation(null);
      
      // Fetch updated ratings
      const updatedResponse = await fetch('/api/ratings');
      if (!updatedResponse.ok) throw new Error('Failed to fetch updated ratings');
      const updatedData = await updatedResponse.json();
      setRatings(updatedData);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const renderIngredients = (rating: any) => {
    const ingredients = [];
    if (rating.hasPotatoes) ingredients.push('Potatoes');
    if (rating.hasCheese) ingredients.push('Cheese');
    if (rating.hasBacon) ingredients.push('Bacon');
    if (rating.hasChorizo) ingredients.push('Chorizo');
    if (rating.hasOnion) ingredients.push('Onion');
    if (rating.hasVegetables) ingredients.push('Random Vegetables');
    return ingredients.join(', ') || 'No ingredients listed';
  };

  const getSortedRatings = () => {
    return [...ratings].sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'high' ? b.rating - a.rating : a.rating - b.rating;
      } else {
        return sortOrder === 'high' ? b.price - a.price : a.price - b.price;
      }
    });
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Google Maps</h2>
          <p>Please check your API key and enabled services.</p>
          <p className="text-sm mt-2">Error: {loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-white rounded-md shadow-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {isSidebarOpen ? '✕ Close List' : '☰ View List'}
      </button>

      {/* Ratings Sidebar */}
      <div 
        className={`absolute right-0 top-0 h-full bg-white w-96 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 h-full overflow-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Rated Burritos</h2>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                List View
              </button>
            </div>
            {viewMode === 'list' && (
              <div className="flex gap-2 items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'price')}
                  className="px-2 py-1 rounded-md border border-gray-300 text-sm text-black"
                >
                  <option value="rating">Rating</option>
                  <option value="price">Price</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'high' | 'low')}
                  className="px-2 py-1 rounded-md border border-gray-300 text-sm text-black"
                >
                  <option value="high">High to Low</option>
                  <option value="low">Low to High</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {getSortedRatings().map((rating) => (
              <div
                key={rating.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedRating(rating);
                  if (map) {
                    map.panTo({ lat: rating.latitude, lng: rating.longitude });
                    map.setZoom(16);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{rating.restaurantName}</h3>
                    <p className="text-sm text-gray-500">{rating.burritoTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {rating.reviewerName || 'Anonymous'}
                      </span>
                      {rating.reviewerEmoji && (
                        <span className="text-2xl">{rating.reviewerEmoji}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded">
                        <span className="text-blue-800 font-medium">{rating.rating}</span>
                        <span className="text-blue-600">/5</span>
                      </div>
                      <div className="text-gray-800 font-medium">
                        ${rating.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">Taste:</span> {rating.taste}/5
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">Value:</span> {rating.value}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                {rating.review && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 italic">
                    "{rating.review}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-96 max-w-[90%]">
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a location"
            style={searchBoxStyle.input}
          />
        </StandaloneSearchBox>
      </div>

      <div className={mapContainerClassName}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onCenterChanged={handleCenterChanged}
          onBoundsChanged={handleBoundsChanged}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {/* Nearby restaurant markers */}
          {nearbyRestaurants.map((restaurant, index) => {
            if (restaurant.geometry?.location) {
              return (
                <Marker
                  key={`${restaurant.place_id}-${index}`}
                  position={{
                    lat: restaurant.geometry.location.lat(),
                    lng: restaurant.geometry.location.lng()
                  }}
                  onClick={() => handleRestaurantClick(restaurant)}
                  title={restaurant.name || 'Unknown Restaurant'}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#6B7280',
                    fillOpacity: 0.7,
                    strokeWeight: 2,
                    strokeColor: '#4B5563'
                  } as google.maps.Symbol}
                />
              );
            }
            return null;
          })}

          {/* Existing ratings markers */}
          {ratings.map((rating) => (
            <Marker
              key={rating.id}
              position={{ lat: rating.latitude, lng: rating.longitude }}
              onClick={() => setSelectedRating(rating)}
              title={`${rating.restaurantName}: ${rating.burritoTitle}`}
              label={{
                text: '🌯',
                fontSize: '24px',
                className: 'marker-label'
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 16,
                fillColor: getRatingColor(rating.rating),
                fillOpacity: 0.7,
                strokeWeight: 2,
                strokeColor: getRatingColor(rating.rating, true)
              } as google.maps.Symbol}
            />
          ))}

          {/* Selected location info window */}
          {selectedLocation && (
            <InfoWindow
              position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng
              }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-700 mb-4">{selectedLocation.address}</p>
                <div className="space-y-2">
                  <button
                    onClick={handleStartRating}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Rate a Burrito Here
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Selected rating info window */}
          {selectedRating && (
            <InfoWindow
              position={{ lat: selectedRating.latitude, lng: selectedRating.longitude }}
              onCloseClick={() => setSelectedRating(null)}
            >
              <div className="p-4 max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{selectedRating.restaurantName}</h3>
                    <p className="text-sm text-gray-500">{selectedRating.burritoTitle}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-800">{selectedRating.rating}</span>
                        <span className="text-blue-600">/5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-800">
                        {selectedRating.reviewerName || 'Anonymous'}
                      </span>
                      {selectedRating.reviewerEmoji && (
                        <span className="text-3xl">{selectedRating.reviewerEmoji}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-200 p-2 rounded">
                    <p className="text-sm flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <span role="img" aria-label="taste">👅</span> Taste:
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800">{selectedRating.taste}/5</span>
                        <span role="img" aria-label="taste rating">{getRatingEmoji(selectedRating.taste)}</span>
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    <p className="text-sm flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <span role="img" aria-label="value">💰</span> Value:
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800">{selectedRating.value}/5</span>
                        <span role="img" aria-label="value rating">{getRatingEmoji(selectedRating.value)}</span>
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    <p className="text-sm flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <span role="img" aria-label="price">💵</span> Price:
                      </span>
                      <span className="text-gray-800">${selectedRating.price.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {selectedRating.review && (
                  <div className="mb-3">
                    <p className="text-sm italic text-gray-700">"{selectedRating.review}"</p>
                  </div>
                )}

                <div className="text-sm text-gray-800">
                  <p className="font-semibold mb-1 flex items-center gap-1">
                    <span role="img" aria-label="ingredients">🧂</span> Ingredients:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRating.hasPotatoes && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="potatoes">🥔</span> Potatoes
                      </span>
                    )}
                    {selectedRating.hasCheese && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="cheese">🧀</span> Cheese
                      </span>
                    )}
                    {selectedRating.hasBacon && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="bacon">🥓</span> Bacon
                      </span>
                    )}
                    {selectedRating.hasChorizo && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="chorizo">🌭</span> Chorizo
                      </span>
                    )}
                    {selectedRating.hasOnion && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="onion">🧅</span> Onion
                      </span>
                    )}
                    {selectedRating.hasVegetables && (
                      <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-800 flex items-center gap-1">
                        <span role="img" aria-label="vegetables">🥬</span> Vegetables
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => openInGoogleMaps(undefined, selectedRating.latitude, selectedRating.longitude)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    View on Google Maps
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {showRatingForm && selectedLocation && (
        <RatingForm
          position={selectedLocation}
          placeName={selectedLocation.address}
          onSubmit={handleRatingSubmit}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedLocation(null);
          }}
        />
      )}
    </div>
  );
};

export default Map; 