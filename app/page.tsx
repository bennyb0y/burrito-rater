'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues with Google Maps
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh the map
  const refreshMap = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="w-full h-screen flex flex-col">
      <div className="flex justify-end px-4 py-2 bg-white">
        <button 
          onClick={refreshMap}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 w-full">
        <Map refreshTrigger={refreshTrigger} />
      </div>
    </main>
  );
}
