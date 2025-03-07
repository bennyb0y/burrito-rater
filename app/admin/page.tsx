'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../config.js';

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
  hasAvocado: boolean;
  hasVegetables: boolean;
  review?: string;
  reviewerName?: string;
  reviewerEmoji?: string;
  confirmed?: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  zipcode?: string;
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
  const [zipcodeFilter, setZipcodeFilter] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Rating>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [uniqueZipcodes, setUniqueZipcodes] = useState<string[]>([]);

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
        
        // Extract unique zipcodes
        const zipcodes = data
          .map((rating: Rating) => rating.zipcode)
          .filter((zipcode: string | undefined) => zipcode && zipcode.trim() !== '')
          .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
          .sort();
        setUniqueZipcodes(zipcodes);
        
        // Apply the confirmed status to the new data
        const updatedRatings = data.map((rating: Rating) => {
          // Ensure the confirmed property exists
          return { 
            ...rating, 
            confirmed: rating.confirmed !== undefined ? rating.confirmed : 0 
          };
        });
        
        // Filter the ratings based on the filterStatus
        let filteredRatings = updatedRatings;
        if (filterStatus === 'confirmed') {
          filteredRatings = updatedRatings.filter((rating: Rating) => {
            if (typeof rating.confirmed === 'number') {
              return rating.confirmed === 1;
            } else if (typeof rating.confirmed === 'boolean') {
              return rating.confirmed === true;
            }
            return false;
          });
        } else if (filterStatus === 'unconfirmed') {
          filteredRatings = updatedRatings.filter((rating: Rating) => {
            if (typeof rating.confirmed === 'number') {
              return rating.confirmed !== 1;
            } else if (typeof rating.confirmed === 'boolean') {
              return rating.confirmed !== true;
            }
            return true;
          });
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
      
      console.log('Using API for confirmation');
      // Call the API to update the database
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
      console.log('Using API for bulk confirmation');
      // Call the API to update the database
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

  const handleZipcodeFilterChange = (zipcode: string) => {
    setZipcodeFilter(zipcode);
  };

  const handleSort = (field: keyof Rating) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort the ratings
  const filteredAndSortedRatings = ratings
    // Apply zipcode filter
    .filter(rating => 
      !zipcodeFilter || 
      (rating.zipcode && rating.zipcode.toLowerCase().includes(zipcodeFilter.toLowerCase()))
    )
    // Sort the ratings
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) {
        return 0;
      }
      
      // Handle different types of values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (
        aValue && 
        bValue && 
        typeof aValue === 'string' && 
        typeof bValue === 'string' && 
        !isNaN(new Date(aValue).getTime()) && 
        !isNaN(new Date(bValue).getTime())
      ) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default comparison for other types
      return 0;
    });

  // Render sort indicator
  const renderSortIndicator = (field: keyof Rating) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
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
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0 || isDeleting}
            className={`px-3 py-1 text-sm rounded ${
              selectedIds.size === 0 || isDeleting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
          </button>
          
          <button
            onClick={handleConfirmSelected}
            disabled={selectedIds.size === 0 || isConfirming}
            className={`px-3 py-1 text-sm rounded ${
              selectedIds.size === 0 || isConfirming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isConfirming ? 'Confirming...' : `Confirm (${selectedIds.size})`}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-black">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as 'all' | 'confirmed' | 'unconfirmed')}
              className="px-2 py-1 rounded-md border border-gray-300 text-xs text-black bg-white"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="unconfirmed">Unconfirmed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-black">Zip:</span>
            <select
              value={zipcodeFilter}
              onChange={(e) => handleZipcodeFilterChange(e.target.value)}
              className="px-2 py-1 rounded-md border border-gray-300 text-xs text-black bg-white w-24"
            >
              <option value="">All</option>
              {uniqueZipcodes.map(zipcode => (
                <option key={zipcode} value={zipcode}>{zipcode}</option>
              ))}
            </select>
          </div>
          
          <span className="text-xs text-black">
            {filteredAndSortedRatings.length} found
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedRatings.length}
                  onChange={handleSelectAll}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-10 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                ID{renderSortIndicator('id')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reviewerName')}
              >
                User{renderSortIndicator('reviewerName')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-10"
              >
                Emoji
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('restaurantName')}
              >
                Restaurant{renderSortIndicator('restaurantName')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('burritoTitle')}
              >
                Burrito{renderSortIndicator('burritoTitle')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                Rating{renderSortIndicator('rating')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Date{renderSortIndicator('createdAt')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('confirmed')}
              >
                Status{renderSortIndicator('confirmed')}
              </th>
              <th 
                scope="col" 
                className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('zipcode')}
              >
                Zip{renderSortIndicator('zipcode')}
              </th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedRatings.map((rating) => (
              <tr key={rating.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rating.id)}
                    onChange={() => handleToggleSelect(rating.id)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black">
                  {rating.id}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black truncate max-w-[6rem]">
                  {rating.reviewerName || '-'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-center">
                  {rating.reviewerEmoji || '-'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black truncate max-w-[8rem]">
                  {rating.restaurantName}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black truncate max-w-[8rem]">
                  {rating.burritoTitle}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xs text-black">{rating.rating.toFixed(1)}</span>
                    <span className="ml-1 text-xs text-black">
                      ({rating.taste.toFixed(1)}/{rating.value.toFixed(1)})
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black">
                  {formatDate(rating.createdAt).split(' ')[0]}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {rating.confirmed ? (
                    <span className="px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-black">
                  {rating.zipcode || '-'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewDetails(rating)}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      className="text-red-600 hover:text-red-900 text-xs"
                    >
                      Del
                    </button>
                    {!rating.confirmed && (
                      <button
                        onClick={() => handleConfirmRating(rating.id)}
                        className="text-green-600 hover:text-green-900 text-xs"
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
                  {renderIngredientBadge(selectedRating.hasAvocado, 'Avocado')}
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