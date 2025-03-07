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
  confirmed: boolean;
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [filterStatus]);

  const fetchRatings = async () => {
    try {
      let url = getApiUrl('/api/ratings');
      
      if (filterStatus === 'confirmed') {
        url += '?confirmed=true';
      } else if (filterStatus === 'unconfirmed') {
        url += '?confirmed=false';
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched ratings:', data);
        setRatings(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch ratings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to fetch ratings');
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

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} rating(s)?`)) return;

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Attempting to delete IDs:', Array.from(selectedIds));
      
      const deletePromises = Array.from(selectedIds).map(async id => {
        const response = await fetch(getApiUrl(`/api/ratings/${id}`), {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to delete rating ${id}: ${errorData.error || 'Unknown error'}`);
        }
        
        return response;
      });

      await Promise.all(deletePromises);
      console.log('Successfully deleted all selected ratings');
      
      setSuccessMessage(`Successfully deleted ${selectedIds.size} rating(s)`);
      await fetchRatings();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting ratings:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete ratings');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmRating = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(getApiUrl(`/api/ratings/${id}/confirm`), {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to confirm rating: ${errorData.error || 'Unknown error'}`);
      }
      
      setSuccessMessage(`Rating #${id} confirmed successfully`);
      await fetchRatings();
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
      console.log('Attempting to confirm IDs:', Array.from(selectedIds));
      
      const response = await fetch(getApiUrl('/api/ratings/confirm-bulk'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to confirm ratings: ${errorData.error || 'Unknown error'}`);
      }
      
      const result = await response.json();
      console.log('Successfully confirmed ratings:', result);
      
      setSuccessMessage(`Successfully confirmed ${result.count} rating(s)`);
      await fetchRatings();
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Manage Ratings</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-black">Filter:</span>
            <select 
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as any)}
              className="rounded border-gray-300 text-gray-700 text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="unconfirmed">Unconfirmed Only</option>
            </select>
          </div>
          
          {successMessage && (
            <p className="text-green-600">{successMessage}</p>
          )}
          
          {error && (
            <p className="text-red-600">{error}</p>
          )}
          
          <div className="flex space-x-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleConfirmSelected}
                  disabled={isConfirming}
                  className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${
                    isConfirming ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isConfirming ? 'Confirming...' : `Confirm Selected (${selectedIds.size})`}
                </button>
                
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.size === ratings.length && ratings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Burrito</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No ratings found
                </td>
              </tr>
            ) : (
              ratings.map((rating) => (
                <tr 
                  key={rating.id} 
                  className={selectedIds.has(rating.id) ? 'bg-blue-50' : ''}
                  onClick={() => handleViewDetails(rating)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(rating.id)}
                      onChange={() => handleToggleSelect(rating.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">{rating.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{rating.restaurantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{rating.burritoTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{rating.rating}/5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">${rating.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <div className="flex items-center gap-2">
                      {rating.reviewerEmoji && (
                        <span className="text-2xl">{rating.reviewerEmoji}</span>
                      )}
                      <span>{rating.reviewerName || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    {!rating.confirmed && (
                      <button
                        onClick={() => handleConfirmRating(rating.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete rating #${rating.id}?`)) {
                          const newSelected = new Set([rating.id]);
                          setSelectedIds(newSelected);
                          handleDeleteSelected();
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rating Detail Modal */}
      {selectedRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedRating.burritoTitle}</h3>
                <button 
                  onClick={() => setSelectedRating(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-black">Restaurant Information</h4>
                  <p className="text-black"><span className="font-medium text-black">Restaurant:</span> {selectedRating.restaurantName}</p>
                  <p className="text-black"><span className="font-medium text-black">Location:</span> {selectedRating.latitude.toFixed(6)}, {selectedRating.longitude.toFixed(6)}</p>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2 text-black">Rating Information</h4>
                  <p className="text-black"><span className="font-medium text-black">Overall Rating:</span> {selectedRating.rating}/5</p>
                  <p className="text-black"><span className="font-medium text-black">Taste Rating:</span> {selectedRating.taste}/5</p>
                  <p className="text-black"><span className="font-medium text-black">Value Rating:</span> {selectedRating.value}/5</p>
                  <p className="text-black"><span className="font-medium text-black">Price:</span> ${selectedRating.price.toFixed(2)}</p>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2 text-black">Reviewer Information</h4>
                  <p className="text-black">
                    <span className="font-medium text-black">Reviewer:</span> {selectedRating.reviewerEmoji} {selectedRating.reviewerName || 'Anonymous'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-black">Ingredients</h4>
                  <div className="mb-4">
                    {renderIngredientBadge(selectedRating.hasPotatoes, 'Potatoes')}
                    {renderIngredientBadge(selectedRating.hasCheese, 'Cheese')}
                    {renderIngredientBadge(selectedRating.hasBacon, 'Bacon')}
                    {renderIngredientBadge(selectedRating.hasChorizo, 'Chorizo')}
                    {renderIngredientBadge(selectedRating.hasOnion, 'Onion')}
                    {renderIngredientBadge(selectedRating.hasVegetables, 'Vegetables')}
                  </div>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2 text-black">Review</h4>
                  <p className="bg-gray-50 p-3 rounded text-black">{selectedRating.review || 'No review provided'}</p>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2 text-black">Status Information</h4>
                  <p className="text-black">
                    <span className="font-medium text-black">Status:</span> {' '}
                    {selectedRating.confirmed ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Unconfirmed
                      </span>
                    )}
                  </p>
                  <p className="text-black"><span className="font-medium text-black">Created:</span> {formatDate(selectedRating.createdAt)}</p>
                  <p className="text-black"><span className="font-medium text-black">Last Updated:</span> {formatDate(selectedRating.updatedAt)}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                {!selectedRating.confirmed && (
                  <button
                    onClick={() => {
                      handleConfirmRating(selectedRating.id);
                      setSelectedRating(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Confirm Rating
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete this rating?`)) {
                      const newSelected = new Set([selectedRating.id]);
                      setSelectedIds(newSelected);
                      handleDeleteSelected();
                      setSelectedRating(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Rating
                </button>
                <button
                  onClick={() => setSelectedRating(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 