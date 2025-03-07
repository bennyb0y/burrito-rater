'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../config';

interface Rating {
  id: number;
  burritoTitle: string;
  restaurantName: string;
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
  confirmed?: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [filterStatus]);

  const fetchRatings = async () => {
    try {
      let url = getApiUrl('ratings');
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched ratings:', data);
        
        // Determine if we're in development or production
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        console.log('Environment:', isDevelopment ? 'Development' : 'Production');
        
        // Create a map of confirmed ratings from the current state
        const confirmedMap: Record<number, boolean> = {};
        ratings.forEach(rating => {
          if (rating.confirmed) {
            confirmedMap[rating.id] = true;
          }
        });
        
        // For development environment, use localStorage
        if (isDevelopment) {
          console.log('Using localStorage for confirmations (Development)');
          try {
            const confirmedRatings = JSON.parse(localStorage.getItem('confirmedRatings') || '[]');
            confirmedRatings.forEach((id: number) => {
              confirmedMap[id] = true;
            });
          } catch (e) {
            console.error('Error loading confirmed status from localStorage:', e);
          }
        }
        
        // Apply the confirmed status to the new data
        const updatedRatings = data.map((rating: Rating) => {
          // If the rating was previously confirmed, keep it confirmed
          if (confirmedMap[rating.id]) {
            return { ...rating, confirmed: 1 };
          }
          // Otherwise, use the value from the API or default to 0
          return { ...rating, confirmed: rating.confirmed || 0 };
        });
        
        // Filter the ratings based on the filterStatus
        let filteredRatings = updatedRatings;
        if (filterStatus === 'confirmed') {
          filteredRatings = updatedRatings.filter((rating: Rating) => rating.confirmed);
        } else if (filterStatus === 'unconfirmed') {
          filteredRatings = updatedRatings.filter((rating: Rating) => !rating.confirmed);
        }
        
        setRatings(filteredRatings);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch ratings');
        } catch (e) {
          setError('Failed to fetch ratings');
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch ratings');
    }
  };

  const handleToggleSelect = (id: number) => {
    console.log('Toggling selection for ID:', id);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === ratings.length) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(ratings.map(r => r.id));
      console.log('Selected all IDs:', Array.from(newSelected));
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert('Please select items to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} rating(s)?`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Attempting to delete IDs:', Array.from(selectedIds));
      
      const deletePromises = Array.from(selectedIds).map(async id => {
        const response = await fetch(getApiUrl(`ratings/${id}`), {
          method: 'DELETE',
        });
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // If we can't parse the JSON, use a default object
          responseData = {};
        }
        
        if (!response.ok) {
          throw new Error(`Failed to delete rating ${id}: ${responseData.error || response.statusText || 'Unknown error'}`);
        }
        
        return id;
      });

      const deletedIds = await Promise.all(deletePromises);
      console.log('Successfully deleted ratings with IDs:', deletedIds);
      
      // Remove the deleted ratings from the state
      setRatings(prevRatings => prevRatings.filter(rating => !selectedIds.has(rating.id)));
      
      setSuccessMessage(`Successfully deleted ${selectedIds.size} rating(s)`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting ratings:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete ratings');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (rating: Rating) => {
    setSelectedRating(rating);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderIngredientBadge = (hasIngredient: boolean, name: string) => {
    return hasIngredient ? (
      <span className="px-2 py-1 mr-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
        {name}
      </span>
    ) : null;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl(`ratings/${id}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // If we can't parse the JSON, use a default object
          responseData = {};
        }

        if (!response.ok) {
          throw new Error(`Failed to delete rating: ${responseData.error || response.statusText || 'Unknown error'}`);
        }

        // Remove the deleted rating from the state
        setRatings(ratings.filter(rating => rating.id !== id));
        setSuccessMessage('Rating deleted successfully');
      } catch (error) {
        console.error('Error deleting rating:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete rating');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmRating = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      // Determine if we're in development or production
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        console.log('Using localStorage for confirmation (Development)');
        // Development: Client-side only solution - just update the UI state
        setRatings(prevRatings => 
          prevRatings.map(rating => 
            rating.id === id ? { ...rating, confirmed: 1 } : rating
          )
        );
        
        // Store the confirmed status in localStorage to persist it
        try {
          const confirmedRatings = JSON.parse(localStorage.getItem('confirmedRatings') || '[]');
          if (!confirmedRatings.includes(id)) {
            confirmedRatings.push(id);
            localStorage.setItem('confirmedRatings', JSON.stringify(confirmedRatings));
          }
        } catch (e) {
          console.error('Error storing confirmed status in localStorage:', e);
        }
      } else {
        console.log('Using API for confirmation (Production)');
        // Production: Call the API to update the database
        const response = await fetch(getApiUrl(`ratings/${id}/confirm`), {
          method: 'PUT',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to confirm rating');
        }
        
        // Update the UI state
        setRatings(prevRatings => 
          prevRatings.map(rating => 
            rating.id === id ? { ...rating, confirmed: 1 } : rating
          )
        );
      }
      
      setSuccessMessage(`Rating #${id} marked as confirmed`);
    } catch (error) {
      console.error('Error confirming rating:', error);
      setError(error instanceof Error ? error.message : 'Failed to confirm rating');
    }
  };

  const handleConfirmSelected = async () => {
    if (selectedIds.size === 0) {
      alert('Please select items to confirm');
      return;
    }

    setIsConfirming(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Marking selected ratings as confirmed:', Array.from(selectedIds));
      
      // Determine if we're in development or production
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        console.log('Using localStorage for bulk confirmation (Development)');
        // Development: Client-side only solution - just update the UI state
        setRatings(prevRatings => 
          prevRatings.map(rating => 
            selectedIds.has(rating.id) ? { ...rating, confirmed: 1 } : rating
          )
        );
        
        // Store the confirmed status in localStorage to persist it
        try {
          const confirmedRatings = JSON.parse(localStorage.getItem('confirmedRatings') || '[]');
          const newConfirmedRatings = [...confirmedRatings];
          
          selectedIds.forEach(id => {
            if (!newConfirmedRatings.includes(id)) {
              newConfirmedRatings.push(id);
            }
          });
          
          localStorage.setItem('confirmedRatings', JSON.stringify(newConfirmedRatings));
        } catch (e) {
          console.error('Error storing confirmed status in localStorage:', e);
        }
      } else {
        console.log('Using API for bulk confirmation (Production)');
        // Production: Call the API to update the database
        const response = await fetch(getApiUrl('ratings/confirm-bulk'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to confirm ratings');
        }
        
        // Update the UI state
        setRatings(prevRatings => 
          prevRatings.map(rating => 
            selectedIds.has(rating.id) ? { ...rating, confirmed: 1 } : rating
          )
        );
      }
      
      setSuccessMessage(`Marked ${selectedIds.size} rating(s) as confirmed`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error confirming ratings:', error);
      setError(error instanceof Error ? error.message : 'Failed to confirm ratings');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFilterChange = (status: 'all' | 'confirmed' | 'unconfirmed') => {
    setFilterStatus(status);
  };

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-black mb-8">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Success: </strong>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0 || isDeleting}
            className={`px-4 py-2 rounded ${
              selectedIds.size === 0 || isDeleting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
          
          <button
            onClick={handleConfirmSelected}
            disabled={selectedIds.size === 0 || isConfirming}
            className={`px-4 py-2 rounded ${
              selectedIds.size === 0 || isConfirming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isConfirming ? 'Confirming...' : `Confirm Selected (${selectedIds.size})`}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as 'all' | 'confirmed' | 'unconfirmed')}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm text-black bg-white"
            >
              <option value="all">All Ratings</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="unconfirmed">Unconfirmed Only</option>
            </select>
          </div>
          
          <span className="text-sm text-black">
            {ratings.length} ratings found
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === ratings.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-16">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Restaurant
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Burrito
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-32">
                Rating
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-32">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-28">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ratings.map((rating) => (
              <tr key={rating.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rating.id)}
                    onChange={() => handleToggleSelect(rating.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                  {rating.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                  {rating.restaurantName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                  {rating.burritoTitle}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-black">{rating.rating.toFixed(1)}</span>
                    <span className="ml-2 text-xs text-black">
                      (T: {rating.taste.toFixed(1)} | V: {rating.value.toFixed(1)})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                  {formatDate(rating.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap w-28">
                  {rating.confirmed ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Unconfirmed
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-32">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(rating)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    {!rating.confirmed && (
                      <button
                        onClick={() => handleConfirmRating(rating.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Rating Details Modal */}
      {selectedRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-black">Rating Details</h2>
                <button
                  onClick={() => setSelectedRating(null)}
                  className="text-black hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">{selectedRating.restaurantName}</h3>
                  <p className="text-black">{selectedRating.burritoTitle}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-black mr-2">Overall:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {selectedRating.rating.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-black mr-2">Taste:</span>
                      <span>{selectedRating.taste.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-black mr-2">Value:</span>
                      <span className="text-black">{selectedRating.value.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-black mr-2">Price:</span>
                      <span className="text-black">${selectedRating.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <span className="font-semibold text-black block mb-1">Reviewer:</span>
                    <div className="flex items-center">
                      <span className="text-black">{selectedRating.reviewerName || 'Anonymous'}</span>
                      {selectedRating.reviewerEmoji && (
                        <span className="ml-2 text-2xl">{selectedRating.reviewerEmoji}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="font-semibold text-black block mb-1">Date:</span>
                    <span className="text-black">{formatDate(selectedRating.createdAt)}</span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="font-semibold text-black block mb-1">Status:</span>
                    {selectedRating.confirmed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Unconfirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedRating.review && (
                <div className="mb-4">
                  <span className="font-semibold text-black block mb-1">Review:</span>
                  <p className="text-black bg-gray-50 p-3 rounded">{selectedRating.review}</p>
                </div>
              )}
              
              <div className="mb-4">
                <span className="font-semibold text-black block mb-2">Ingredients:</span>
                <div className="flex flex-wrap gap-2">
                  {renderIngredientBadge(selectedRating.hasPotatoes, 'Potatoes')}
                  {renderIngredientBadge(selectedRating.hasCheese, 'Cheese')}
                  {renderIngredientBadge(selectedRating.hasBacon, 'Bacon')}
                  {renderIngredientBadge(selectedRating.hasChorizo, 'Chorizo')}
                  {renderIngredientBadge(selectedRating.hasOnion, 'Onion')}
                  {renderIngredientBadge(selectedRating.hasVegetables, 'Vegetables')}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedRating(null)}
                  className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedRating.id);
                    setSelectedRating(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                {!selectedRating.confirmed && (
                  <button
                    onClick={() => {
                      handleConfirmRating(selectedRating.id);
                      setSelectedRating(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 