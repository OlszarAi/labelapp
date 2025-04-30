"use client";

import { useState, useEffect } from 'react';

/**
 * Hook do przechowywania i odczytywania danych w localStorage
 * Tymczasowe rozwiązanie przed wdrożeniem bazy danych
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Stan do przechowywania naszej wartości
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Pobierz zapisaną wartość z localStorage
      const item = window.localStorage.getItem(key);
      // Analizuj przechowywany JSON lub zwróć initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // W przypadku błędu zwróć initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Pozwala na zapisanie wartości lub funkcji jak w useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Zapisz stan
      setStoredValue(valueToStore);
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Logowanie błędu
      console.error('Error saving to localStorage:', error);
    }
  };

  // Efekt synchronizujący wartość w przypadku zmiany klucza
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing localStorage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}