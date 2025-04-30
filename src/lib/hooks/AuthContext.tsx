'use client';

import { createContext, ReactNode, useState, useEffect } from 'react';

// Definicje typów
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

// Tworzenie kontekstu autentykacji
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdza, czy użytkownik jest zalogowany przy ładowaniu aplikacji
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${API_URL}/users/check-auth`, {
          method: 'GET',
          credentials: 'include', // Ważne: To umożliwia wysyłanie ciasteczek
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            setUser(data.data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);

  // Rejestracja nowego użytkownika
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        credentials: 'include', // Ważne: To umożliwia odbieranie ciasteczek
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration failed:', data.message);
        return false;
      }

      // Aktualizacja stanu użytkownika
      if (data.data.user) {
        setUser(data.data.user);
      }
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Logowanie użytkownika
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        credentials: 'include', // Ważne: To umożliwia odbieranie ciasteczek
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data.message);
        return false;
      }

      // Aktualizacja stanu użytkownika
      if (data.data.user) {
        setUser(data.data.user);
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Wylogowanie użytkownika
  const logout = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include', // Ważne: To umożliwia wysyłanie/usuwanie ciasteczek
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Logout failed:', data.message);
        return false;
      }

      // Wyczyszczenie stanu użytkownika po stronie klienta
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Żądanie resetowania hasła
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/password-reset/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Password reset request failed:', data.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  // Resetowanie hasła
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Password reset failed:', data.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  // Wartość kontekstu
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}