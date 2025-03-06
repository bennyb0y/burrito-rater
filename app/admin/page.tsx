'use client';

import { useState, useEffect } from 'react';

interface Rating {
  id: number;
  burritoTitle: string;
  restaurantName: string;
  rating: number;
  reviewerName?: string;
  reviewerEmoji?: string;
}

export default function AdminPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/ratings');
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

    try {
      console.log('Attempting to delete IDs:', Array.from(selectedIds));
      
      const deletePromises = Array.from(selectedIds).map(async id => {
        const response = await fetch(`/api/ratings/${id}`, {
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
      
      await fetchRatings();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting ratings:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete ratings');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Burrito Ratings Admin</h1>
        <div className="flex items-center gap-4">
          {error && (
            <p className="text-red-600">{error}</p>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.size === ratings.length && ratings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burrito</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ratings.map((rating) => (
              <tr key={rating.id} className={selectedIds.has(rating.id) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rating.id)}
                    onChange={() => handleToggleSelect(rating.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{rating.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.restaurantName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.burritoTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.rating}/5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {rating.reviewerEmoji && (
                      <span className="text-2xl">{rating.reviewerEmoji}</span>
                    )}
                    <span>{rating.reviewerName || 'Anonymous'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 