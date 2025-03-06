'use client';

import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries = ['places'];

interface MiniMapProps {
  latitude: number;
  longitude: number;
  rating: number;
  restaurantName: string;
  burritoTitle: string;
}

const MiniMap: React.FC<MiniMapProps> = ({ latitude, longitude, rating, restaurantName, burritoTitle }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyD-ner96UaZTvp6Aaj1wLttaT0SV-CWOEs',
    libraries: libraries as any
  });

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
          <p className="text-sm">Error loading map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          gestureHandling: 'none',
          clickableIcons: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          title={`${restaurantName}: ${burritoTitle}`}
          label={{
            text: '🌯',
            fontSize: '24px',
            className: 'marker-label'
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: getRatingColor(rating),
            fillOpacity: 0.7,
            strokeWeight: 2,
            strokeColor: getRatingColor(rating, true)
          } as google.maps.Symbol}
        />
      </GoogleMap>
    </div>
  );
};

export default MiniMap; 