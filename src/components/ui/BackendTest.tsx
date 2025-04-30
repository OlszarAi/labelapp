'use client';

import { useState, useEffect } from 'react';

interface BackendStatus {
  connected: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

export default function BackendTest() {
  const [status, setStatus] = useState<BackendStatus>({
    connected: false,
    message: 'Testing connection to backend...'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/health');
        
        if (!response.ok) {
          throw new Error(`Backend responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus({
          connected: true,
          message: data.message || 'Connected to backend successfully!',
          timestamp: data.timestamp
        });
      } catch (error) {
        console.error('Error connecting to backend:', error);
        setStatus({
          connected: false,
          message: 'Failed to connect to backend',
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkBackendConnection();
  }, []);

  return (
    <div className="p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-2">Backend Status</h2>
      
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          <span>Testing connection...</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">{status.connected ? 'Connected' : 'Not Connected'}</span>
          </div>
          
          <p className="mb-1">{status.message}</p>
          
          {status.timestamp && (
            <p className="text-sm text-gray-500">Server time: {new Date(status.timestamp).toLocaleString()}</p>
          )}
          
          {status.error && (
            <p className="text-sm text-red-500 mt-2">Error: {status.error}</p>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            Test Again
          </button>
        </div>
      )}
    </div>
  );
}