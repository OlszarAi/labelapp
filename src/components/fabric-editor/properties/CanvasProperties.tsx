// Canvas Properties Panel for Fabric Editor
// Controls canvas size, background, grid, rulers, zoom, and export settings

"use client";

import React, { useState, useCallback } from 'react';
import { 
  Maximize2, 
  Grid3X3, 
  Ruler, 
  ZoomIn, 
  ZoomOut, 
  Download,
  RotateCcw,
  Palette,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { CanvasUnit } from '@/components/fabric-editor/utils/fabricUtils';
import type { CanvasProperties } from '@/hooks/fabric/useElementProperties';

export interface CanvasPropertiesProps {
  properties: CanvasProperties;
  onPropertyChange: (property: keyof CanvasProperties, value: any) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  onExport: (format: 'pdf' | 'png' | 'jpg' | 'svg') => void;
  theme: 'light' | 'dark';
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const CANVAS_UNITS: { value: CanvasUnit; label: string }[] = [
  { value: 'mm', label: 'mm' },
  { value: 'px', label: 'px' },
  { value: 'in', label: 'in' },
];

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'png', label: 'PNG', icon: '🖼️' },
  { value: 'jpg', label: 'JPG', icon: '🖼️' },
  { value: 'svg', label: 'SVG', icon: '⚡' },
] as const;

const ZOOM_PRESETS = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
  { value: 2, label: '200%' },
];

/**
 * Canvas Properties Panel Component
 * Provides comprehensive controls for canvas settings, grid, rulers, zoom, and export
 */
export function CanvasProperties({
  properties,
  onPropertyChange,
  onFitToScreen,
  onResetZoom,
  onExport,
  theme,
  expanded = true,
  onToggleExpanded,
}: CanvasPropertiesProps) {
  const isDark = theme === 'dark';
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg' | 'svg'>('pdf');

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onPropertyChange(dimension, numValue);
    }
  }, [onPropertyChange]);

  const handleUnitChange = useCallback((unit: CanvasUnit) => {
    onPropertyChange('unit', unit);
  }, [onPropertyChange]);

  const handleBackgroundColorChange = useCallback((color: string) => {
    onPropertyChange('backgroundColor', color);
  }, [onPropertyChange]);

  const handleGridToggle = useCallback(() => {
    onPropertyChange('gridEnabled', !properties.gridEnabled);
  }, [onPropertyChange, properties.gridEnabled]);

  const handleRulersToggle = useCallback(() => {
    onPropertyChange('rulersEnabled', !properties.rulersEnabled);
  }, [onPropertyChange, properties.rulersEnabled]);

  const handleZoomChange = useCallback((zoom: number) => {
    onPropertyChange('zoom', zoom);
  }, [onPropertyChange]);

  const handleExportClick = useCallback(() => {
    onExport(exportFormat);
  }, [onExport, exportFormat]);

  return (
    <div className={`
      border-b border-gray-200 dark:border-gray-700
      ${isDark ? 'bg-gray-800' : 'bg-white'}
    `}>
      {/* Section Header */}
      <div 
        className={`
          flex items-center justify-between p-3 cursor-pointer
          ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
        `}
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          <Settings size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Canvas Properties
          </span>
        </div>
        {onToggleExpanded && (
          expanded ? 
            <ChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} /> :
            <ChevronRight size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        )}
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="p-3 space-y-4">
          {/* Canvas Size */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Canvas Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number"
                  value={properties.width}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                  placeholder="Width"
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Width
                </span>
              </div>
              <div>
                <input
                  type="number"
                  value={properties.height}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  placeholder="Height"
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Height
                </span>
              </div>
              <div>
                <select
                  value={properties.unit}
                  onChange={(e) => handleUnitChange(e.target.value as CanvasUnit)}
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                >
                  {CANVAS_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Unit
                </span>
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.backgroundColor }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = properties.backgroundColor;
                  input.onchange = (e) => handleBackgroundColorChange((e.target as HTMLInputElement).value);
                  input.click();
                }}
              />
              <input
                type="text"
                value={properties.backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className={`
                  flex-1 px-2 py-1 text-xs border rounded font-mono
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
            </div>
          </div>

          {/* Grid Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Grid
              </label>
              <button
                onClick={handleGridToggle}
                className={`
                  flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${properties.gridEnabled
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Grid3X3 size={12} />
                {properties.gridEnabled ? 'On' : 'Off'}
              </button>
            </div>
            {properties.gridEnabled && (
              <div className="pl-2">
                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Grid Size
                </label>
                <input
                  type="number"
                  value={properties.gridSize}
                  onChange={(e) => onPropertyChange('gridSize', parseFloat(e.target.value) || 10)}
                  min="1"
                  max="100"
                  className={`
                    w-full px-2 py-1 text-xs border rounded mt-1
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
              </div>
            )}
          </div>

          {/* Rulers */}
          <div className="flex items-center justify-between">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Rulers
            </label>
            <button
              onClick={handleRulersToggle}
              className={`
                flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                ${properties.rulersEnabled
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Ruler size={12} />
              {properties.rulersEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Zoom
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoomChange(Math.max(0.1, properties.zoom - 0.1))}
                className={`
                  p-1 rounded transition-colors
                  ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                <ZoomOut size={14} />
              </button>
              <select
                value={properties.zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className={`
                  flex-1 px-2 py-1 text-xs border rounded
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              >
                {ZOOM_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleZoomChange(Math.min(5, properties.zoom + 0.1))}
                className={`
                  p-1 rounded transition-colors
                  ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                <ZoomIn size={14} />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={onFitToScreen}
                className={`
                  flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <Maximize2 size={12} />
                Fit
              </button>
              <button
                onClick={onResetZoom}
                className={`
                  flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Export
            </label>
            <div className="flex gap-1">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
                className={`
                  flex-1 px-2 py-1 text-xs border rounded
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              >
                {EXPORT_FORMATS.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.icon} {format.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExportClick}
                className="
                  flex items-center justify-center gap-1 px-3 py-1 text-xs rounded
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors
                "
              >
                <Download size={12} />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
