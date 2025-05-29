// DEPRECATED: This file is part of the legacy editor and will be replaced by the new Fabric.js editor
// Please use components from src/components/fabric-editor/ for new development
"use client";

import { useState, useRef, useEffect } from 'react';

interface ColorPickerTabProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export default function ColorPickerTab({
  color,
  onChange,
  presetColors = ['#333333', '#000000', '#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#F57C00', '#5D4037']
}: ColorPickerTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRgbaPicker, setShowRgbaPicker] = useState(false);
  const [rgbaValues, setRgbaValues] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Konwersja koloru HEX na wartości RGBA
  useEffect(() => {
    if (color.startsWith('#')) {
      // HEX do RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      setRgbaValues({
        r: r,
        g: g,
        b: b,
        a: 1
      });
    } else if (color.startsWith('rgba')) {
      // RGBA string do wartości
      const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (rgbaMatch) {
        setRgbaValues({
          r: parseInt(rgbaMatch[1]),
          g: parseInt(rgbaMatch[2]),
          b: parseInt(rgbaMatch[3]),
          a: parseFloat(rgbaMatch[4])
        });
      }
    }
  }, [color]);

  // Konwersja wartości RGBA na string
  const getRgbaString = () => {
    return `rgba(${rgbaValues.r}, ${rgbaValues.g}, ${rgbaValues.b}, ${rgbaValues.a})`;
  };

  // Konwersja RGB na HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Obsługa kliknięcia poza komponentem do zamknięcia
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowRgbaPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Aktualizacja wartości RGBA i wywołanie funkcji onChange
  const handleRgbaChange = (field: string, value: number) => {
    const newValues = { ...rgbaValues, [field]: value };
    setRgbaValues(newValues);
    
    if (field === 'a') {
      // Jeśli zmieniono kanał alpha, użyj formatu RGBA
      onChange(getRgbaString());
    } else {
      // W przeciwnym razie użyj HEX, jeśli alpha jest 1 (pełna nieprzezroczystość)
      if (newValues.a === 1) {
        onChange(rgbToHex(newValues.r, newValues.g, newValues.b));
      } else {
        onChange(getRgbaString());
      }
    }
  };

  return (
    <div className="relative mb-3" ref={containerRef}>
      <label className="block text-sm text-gray-700 dark:text-gray-400 mb-1">Kolor</label>
      
      <button
        type="button"
        className="flex items-center justify-between w-full py-1 px-2 border border-gray-200 rounded-md text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: color }}
          ></div>
          <span>{color}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="p-2">
            <div className="mb-3">
              <div className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-2">Podstawowe kolory</div>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((presetColor, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-6 w-6 rounded-md border ${
                      color === presetColor ? 'ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => {
                      onChange(presetColor);
                      setIsExpanded(false);
                    }}
                    title={presetColor}
                  ></button>
                ))}
              </div>
            </div>
            
            <div>
              <button
                type="button"
                className="w-full py-1.5 px-2 text-left text-sm border border-gray-200 dark:border-neutral-700 rounded-md flex items-center justify-between"
                onClick={() => setShowRgbaPicker(!showRgbaPicker)}
              >
                <span className="text-gray-700 dark:text-gray-300">Wybierz własny kolor</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  {showRgbaPicker ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  )}
                </svg>
              </button>
              
              {showRgbaPicker && (
                <div className="mt-2 p-2 border border-gray-200 dark:border-neutral-700 rounded-md">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">R (Czerwony: 0-255)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgbaValues.r}
                          onChange={(e) => handleRgbaChange('r', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={rgbaValues.r}
                          onChange={(e) => handleRgbaChange('r', parseInt(e.target.value) || 0)}
                          className="w-16 py-0.5 px-1 border border-gray-200 rounded text-sm dark:bg-neutral-900 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">G (Zielony: 0-255)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgbaValues.g}
                          onChange={(e) => handleRgbaChange('g', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={rgbaValues.g}
                          onChange={(e) => handleRgbaChange('g', parseInt(e.target.value) || 0)}
                          className="w-16 py-0.5 px-1 border border-gray-200 rounded text-sm dark:bg-neutral-900 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">B (Niebieski: 0-255)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgbaValues.b}
                          onChange={(e) => handleRgbaChange('b', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={rgbaValues.b}
                          onChange={(e) => handleRgbaChange('b', parseInt(e.target.value) || 0)}
                          className="w-16 py-0.5 px-1 border border-gray-200 rounded text-sm dark:bg-neutral-900 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">A (Przezroczystość: 0-1)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={rgbaValues.a}
                          onChange={(e) => handleRgbaChange('a', parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={rgbaValues.a}
                          onChange={(e) => handleRgbaChange('a', parseFloat(e.target.value) || 0)}
                          className="w-16 py-0.5 px-1 border border-gray-200 rounded text-sm dark:bg-neutral-900 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="h-8 w-full rounded-md border border-gray-300 dark:border-gray-600" style={{ backgroundColor: getRgbaString() }}></div>
                      <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">{rgbaValues.a < 1 ? getRgbaString() : rgbToHex(rgbaValues.r, rgbaValues.g, rgbaValues.b)}</div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="py-1 px-3 text-xs rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setShowRgbaPicker(false);
                          setIsExpanded(false);
                        }}
                      >
                        Anuluj
                      </button>
                      <button
                        type="button"
                        className="py-1 px-3 text-xs rounded-md bg-blue-600 border border-blue-600 text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500"
                        onClick={() => {
                          onChange(rgbaValues.a < 1 ? getRgbaString() : rgbToHex(rgbaValues.r, rgbaValues.g, rgbaValues.b));
                          setShowRgbaPicker(false);
                          setIsExpanded(false);
                        }}
                      >
                        Zastosuj
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}