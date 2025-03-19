'use client';

import { useState } from 'react';

interface BackupResult {
  success: boolean;
  message: string;
  filename?: string;
  timestamp?: string;
  tableCount?: number;
  error?: string;
}

export default function BackupControl() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BackupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('https://burrito-backup-worker.bennyfischer.workers.dev', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data: BackupResult = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create backup');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Database Backup</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={triggerBackup}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Backup...
              </span>
            ) : (
              'Backup Now'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Error creating backup</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && result.success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md">
            <p className="font-medium">Backup created successfully!</p>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="font-medium">Filename:</span> {result.filename}</p>
              <p><span className="font-medium">Timestamp:</span> {new Date(result.timestamp?.replace(/-/g, ':')||'').toLocaleString()}</p>
              <p><span className="font-medium">Tables backed up:</span> {result.tableCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 