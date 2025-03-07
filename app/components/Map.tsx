'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox, InfoWindow } from '@react-google-maps/api';
import RatingForm from './RatingForm';
import { getApiUrl } from '../config';

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
    maxWidth: '300px',
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    outline: 'none',
    fontSize: '16px',
    color: '#1a202c',
    zIndex: 1
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
  reviewerEmoji?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
  confirmed: boolean;
}

interface MapProps {
  refreshTrigger?: number;
}

const Map: React.FC<MapProps> = ({ refreshTrigger = 0 }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries as any
  });

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
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Fetch ratings when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        console.log('Fetching ratings from API');
        
        // Fetch confirmed ratings from the API
        const response = await fetch('/api/ratings?confirmed=true');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch ratings: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched ratings:', data);
        setRatings(data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [refreshTrigger]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (searchBox && map) {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      const bounds = new google.maps.LatLngBounds();
      const newRestaurants: google.maps.places.PlaceResult[] = [];

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) return;

        if (place.geometry.viewport) {
          bounds.extend(place.geometry.viewport.getNorthEast());
          bounds.extend(place.geometry.viewport.getSouthWest());
        } else {
          bounds.extend(place.geometry.location);
        }

        // Set the selected location for the first place
        if (place.geometry.location && place.name) {
          setSelectedLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.name,
            address: place.formatted_address || ''
          });
        }

        newRestaurants.push(place);
      });

      map.fitBounds(bounds);
      setNearbyRestaurants(newRestaurants);
      setMapBounds({
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng(),
      });
    }
  }, [searchBox, map]);

  const handleStartRating = () => {
    if (selectedLocation) {
      setShowRatingForm(true);
    }
  };

  const handleRatingSubmit = async (ratingData: any) => {
    try {
      const response = await fetch(getApiUrl('/api/ratings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      // After successful submission, fetch the updated ratings list
      const ratingsResponse = await fetch(getApiUrl('/api/ratings'));
      if (!ratingsResponse.ok) throw new Error('Failed to fetch updated ratings');
      
      const updatedRatings = await ratingsResponse.json();
      setRatings(updatedRatings);
      setShowRatingForm(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Keep existing ratings on error
    }
  };

  const getRatingColor = (rating: number, isStroke = false) => {
    const colors = {
      1: isStroke ? '#DC2626' : '#FEE2E2',
      2: isStroke ? '#F97316' : '#FEF3C7',
      3: isStroke ? '#EAB308' : '#FEF9C3',
      4: isStroke ? '#22C55E' : '#DCFCE7',
      5: isStroke ? '#16A34A' : '#BBF7D0',
    };
    const roundedRating = Math.round(rating);
    return colors[roundedRating as keyof typeof colors] || colors[3];
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
      <GoogleMap
        mapContainerClassName={mapContainerClassName}
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          ...mapOptions,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          rotateControl: true,
          rotateControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          }
        }}
      >
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a restaurant"
            className="absolute top-4 left-4 z-10"
            style={searchBoxStyle.input}
          />
        </StandaloneSearchBox>

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
              <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">{selectedLocation.name}</h3>
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
            position={{
              lat: selectedRating.latitude,
              lng: selectedRating.longitude
            }}
            onCloseClick={() => setSelectedRating(null)}
          >
            <div className="p-2 max-w-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">{selectedRating.restaurantName}</h3>
                  <p className="text-sm text-gray-600">{selectedRating.burritoTitle}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {selectedRating.reviewerName || 'Anonymous'}
                    </span>
                    {selectedRating.reviewerEmoji && (
                      <span className="text-2xl">{selectedRating.reviewerEmoji}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="text-lg font-bold text-blue-800">{selectedRating.rating}</span>
                      <span className="text-blue-600">/5</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    ${selectedRating.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>😋</span>
                    <span>{selectedRating.taste.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span>{selectedRating.value.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💵</span>
                    <span>${selectedRating.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedRating.review && (
                <div className="mt-4 text-sm text-gray-700">
                  "{selectedRating.review}"
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Rating Form Modal */}
      {showRatingForm && selectedLocation && (
        <RatingForm
          position={selectedLocation}
          placeName={selectedLocation.name}
          onSubmit={handleRatingSubmit}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedLocation(null);
          }}
        />
      )}
    </div>
  );
}

export default Map; 