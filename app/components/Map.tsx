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
  reviewerEmoji?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasOnion: boolean;
  hasVegetables: boolean;
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
        const response = await fetch('/api/ratings');
        if (!response.ok) throw new Error('Failed to fetch ratings');
        const data = await response.json();
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
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      // Refresh ratings list
      const updatedRatings = await response.json();
      setRatings(updatedRatings);
      setShowRatingForm(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
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
        options={mapOptions}
        onLoad={onMapLoad}
      >
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for restaurants..."
            className="absolute top-4 left-4 w-64 px-4 py-2 rounded-md shadow-md"
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
                <div className="mt-4 text-gray-700">
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