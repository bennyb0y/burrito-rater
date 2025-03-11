'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../config.js';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

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
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to confirm rating');
      }
      
      // Update the UI state
      setRatings(prevRatings => 
        prevRatings.map(rating => 
          rating.id === id ? { ...rating, confirmed: 1 } : rating
        )
      );
      
      setSuccessMessage('Rating confirmed successfully');
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 