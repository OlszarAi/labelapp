'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

type AuthMode = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, requestPasswordReset, resetPassword, isAuthenticated } = useAuth();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialMode]);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Extract token from URL if in reset password mode
  useEffect(() => {
    if (mode === 'resetPassword') {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');
      if (token) {
        setResetToken(token);
      }
    }
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      switch (mode) {
        case 'register':
          if (password !== confirmPassword) {
            setError('Hasła nie pasują do siebie');
            break;
          }
          
          const registerSuccess = await register(username, email, password);
          if (registerSuccess) {
            setSuccess('Rejestracja zakończona pomyślnie!');
          } else {
            setError('Nie udało się zarejestrować. Spróbuj ponownie.');
          }
          break;

        case 'login':
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            setSuccess('Logowanie zakończone pomyślnie!');
          } else {
            setError('Nieprawidłowy email lub hasło.');
          }
          break;

        case 'forgotPassword':
          const resetRequestSuccess = await requestPasswordReset(email);
          if (resetRequestSuccess) {
            setSuccess('Jeśli konto istnieje, wysłaliśmy instrukcje na adres email.');
          } else {
            setError('Nie udało się wysłać instrukcji resetowania hasła.');
          }
          break;

        case 'resetPassword':
          if (password !== confirmPassword) {
            setError('Hasła nie pasują do siebie');
            break;
          }
          
          const resetSuccess = await resetPassword(resetToken, password);
          if (resetSuccess) {
            setSuccess('Hasło zostało zresetowane. Możesz się teraz zalogować.');
            setTimeout(() => setMode('login'), 2000);
          } else {
            setError('Nieprawidłowy lub wygasły token resetowania hasła.');
          }
          break;
      }
    } catch (err) {
      setError('Wystąpił błąd. Spróbuj ponownie później.');
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'login' && 'Logowanie'}
            {mode === 'register' && 'Rejestracja'}
            {mode === 'forgotPassword' && 'Reset hasła'}
            {mode === 'resetPassword' && 'Ustaw nowe hasło'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Register fields */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Nazwa użytkownika
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Email field - for all modes except reset password */}
          {mode !== 'resetPassword' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Password fields - for all modes except forgot password */}
          {mode !== 'forgotPassword' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Hasło
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Confirm password field - for register and reset password modes */}
          {(mode === 'register' || mode === 'resetPassword') && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Potwierdź hasło
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Reset token field - for reset password mode (hidden, filled automatically) */}
          {mode === 'resetPassword' && (
            <input type="hidden" value={resetToken} />
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Przetwarzanie...' : (
                <>
                  {mode === 'login' && 'Zaloguj się'}
                  {mode === 'register' && 'Zarejestruj się'}
                  {mode === 'forgotPassword' && 'Wyślij link resetujący'}
                  {mode === 'resetPassword' && 'Ustaw nowe hasło'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' && (
            <>
              <p>
                Nie masz konta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:underline"
                >
                  Zarejestruj się
                </button>
              </p>
              <p className="mt-2">
                <button
                  type="button"
                  onClick={() => setMode('forgotPassword')}
                  className="text-blue-600 hover:underline"
                >
                  Zapomniałeś hasła?
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p>
              Masz już konto?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:underline"
              >
                Zaloguj się
              </button>
            </p>
          )}

          {(mode === 'forgotPassword' || mode === 'resetPassword') && (
            <p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:underline"
              >
                Powrót do logowania
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}