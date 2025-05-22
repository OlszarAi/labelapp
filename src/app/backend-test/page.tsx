'use client';

import { useState, useEffect } from 'react';
import BackendTest from '@/components/ui/BackendTest';
import Link from 'next/link';
import { LabelStorageService } from '@/services/labelStorage';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BackendTestPage() {
  const [hasTestedAPI, setHasTestedAPI] = useState(false);
  const [apiResult, setApiResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgotPassword'>('login');
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const testBackendAPI = async () => {
    try {
      const isConnected = await LabelStorageService.checkBackendConnection();
      setApiResult({
        success: isConnected,
        message: isConnected 
          ? 'Successfully connected to backend API!' 
          : 'Failed to connect to the backend API. Make sure the backend server is running.'
      });
    } catch (error) {
      setApiResult({
        success: false,
        message: `Error testing API: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setHasTestedAPI(true);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgotPassword') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center">
          <Link 
            href="/" 
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Backend Health Status</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This component automatically checks the connection to the backend servers health endpoint.
            </p>
            <BackendTest />
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Test API Methods</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click the button below to test the API connection methods in LabelStorageService.
            </p>
            
            <button
              onClick={testBackendAPI}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Test API Connection
            </button>

            {hasTestedAPI && apiResult && (
              <div className={`mt-4 p-4 rounded ${apiResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${apiResult.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{apiResult.success ? 'Success' : 'Failed'}</span>
                </div>
                <p>{apiResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Test Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
          
          {isAuthenticated ? (
            <div className="mb-6">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded mb-4">
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">Logged In As:</h3>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
              </div>
              
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Register
              </button>
              <button
                onClick={() => openAuthModal('forgotPassword')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Forgot Password
              </button>
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-300">
            This section allows you to test the user authentication system including registration, login, and password reset functionality.
            The authentication uses secure HttpOnly cookies with JWT tokens for enhanced security and session persistence.
          </p>
          
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Authentication Features:</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
              <li>User registration with email, username, and password</li>
              <li>Secure login with JWT authentication stored in HttpOnly cookies</li>
              <li>Protection against XSS attacks via HttpOnly cookie mechanism</li>
              <li>CSRF protection with secure Same-Site cookie configuration</li>
              <li>Secure server-side session management</li>
              <li>Password reset via email with time-limited tokens</li>
              <li>Session persistence across page reloads without localStorage exposure</li>
              <li>Secure password storage with bcrypt hashing</li>
              <li>Automatic token invalidation on logout</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Backend Configuration</h2>
          <p className="mb-2">Make sure your backend is properly configured:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Backend server is running on <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3001</code></li>
            <li>The health endpoint is available at <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/api/health</code></li>
            <li>User authentication endpoints are at <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/api/users/...</code></li>
            <li>JWT secret is properly configured in backend <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file</li>
            <li>Email settings are configured for password reset functionality</li>
            <li>CORS is properly configured to allow requests from the frontend</li>
            <li>Database connection is established (PostgreSQL)</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
            <p className="text-blue-800 dark:text-blue-300">
              <strong>Next Steps:</strong> Once the connection and authentication are confirmed working, you can start using the backend API for storing and retrieving label data.
            </p>
          </div>
        </div>
      </div>
      t
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </main>
  );
}