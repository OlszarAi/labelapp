/**
 * Canvas Controls Component
 * Professional canvas size controls, grid settings, and zoom controls
 */

import React, { useState } from 'react';
import { CanvasDimensions, GridConfiguration } from '../../types/canvas';

interface CanvasControlsProps {
  dimensions: CanvasDimensions;
  gridConfig: GridConfiguration;
  onDimensionsChange: (width: number, height: number) => void;
  onGridConfigChange: (config: GridConfiguration) => void;
  onZoomChange: (zoom: number) => void;
  onFitToViewport: () => void;
  onCenterView: () => void;
  showInfo?: boolean;
  className?: string;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  dimensions,
  gridConfig,
  onDimensionsChange,
  onGridConfigChange,
  onZoomChange,
  onFitToViewport,
  onCenterView,
  showInfo = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempWidth, setTempWidth] = useState(dimensions.width.toString());
  const [tempHeight, setTempHeight] = useState(dimensions.height.toString());

  // Preset canvas sizes
  const presetSizes = [
    { name: 'A4 Portrait', width: 794, height: 1123 },
    { name: 'A4 Landscape', width: 1123, height: 794 },
    { name: 'Letter Portrait', width: 816, height: 1056 },
    { name: 'Letter Landscape', width: 1056, height: 816 },
    { name: 'HD 1080p', width: 1920, height: 1080 },
    { name: 'Square', width: 800, height: 800 },
    { name: 'Custom', width: dimensions.width, height: dimensions.height }
  ];

  // Zoom presets
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

  const handleDimensionSubmit = () => {
    const width = parseInt(tempWidth, 10);
    const height = parseInt(tempHeight, 10);
    
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      onDimensionsChange(width, height);
    } else {
      // Reset to current values if invalid
      setTempWidth(dimensions.width.toString());
      setTempHeight(dimensions.height.toString());
    }
  };

  const handlePresetSelect = (preset: typeof presetSizes[0]) => {
    if (preset.name !== 'Custom') {
      setTempWidth(preset.width.toString());
      setTempHeight(preset.height.toString());
      onDimensionsChange(preset.width, preset.height);
    }
  };

  const handleGridConfigChange = (updates: Partial<GridConfiguration>) => {
    onGridConfigChange({ ...gridConfig, ...updates });
  };

  return (
    <div className={`canvas-controls ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 right-4 z-30 bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        title="Canvas Controls"
      >
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-45' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Controls Panel */}
      {isExpanded && (
        <div className="absolute top-16 right-4 z-30 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 p-4 w-80 max-h-96 overflow-y-auto">
          
          {/* Canvas Size Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Canvas Size</h3>
            
            {/* Preset Sizes */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetSizes.slice(0, -1).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            
            {/* Custom Size Inputs */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={tempWidth}
                onChange={(e) => setTempWidth(e.target.value)}
                onBlur={handleDimensionSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleDimensionSubmit()}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Width"
                min="1"
                max="10000"
              />
              <span className="text-gray-500 dark:text-gray-400">×</span>
              <input
                type="number"
                value={tempHeight}
                onChange={(e) => setTempHeight(e.target.value)}
                onBlur={handleDimensionSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleDimensionSubmit()}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Height"
                min="1"
                max="10000"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Zoom</h3>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
                {Math.round(dimensions.zoom * 100)}%
              </span>
              <input
                type="range"
                min={dimensions.minZoom}
                max={dimensions.maxZoom}
                step="0.1"
                value={dimensions.zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="flex-1"
              />
            </div>
            
            <div className="flex gap-1 mb-2">
              {zoomLevels.map((zoom) => (
                <button
                  key={zoom}
                  onClick={() => onZoomChange(zoom)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    Math.abs(dimensions.zoom - zoom) < 0.01
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {zoom * 100}%
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onFitToViewport}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
              >
                Fit to View
              </button>
              <button
                onClick={onCenterView}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded transition-colors"
              >
                Center
              </button>
            </div>
          </div>

          {/* Grid Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Grid</h3>
            
            <div className="space-y-3">
              {/* Grid Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gridConfig.enabled}
                    onChange={(e) => handleGridConfigChange({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Snap to Grid */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Snap to Grid</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gridConfig.snapToGrid}
                    onChange={(e) => handleGridConfigChange({ snapToGrid: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Grid Size */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Grid Size</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{gridConfig.size}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={gridConfig.size}
                  onChange={(e) => handleGridConfigChange({ size: parseInt(e.target.value, 10) })}
                  className="w-full"
                />
              </div>
              
              {/* Snap Tolerance */}
              {gridConfig.snapToGrid && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Snap Tolerance</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{gridConfig.snapTolerance}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={gridConfig.snapTolerance}
                    onChange={(e) => handleGridConfigChange({ snapTolerance: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Grid Opacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Grid Opacity</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(gridConfig.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={gridConfig.opacity}
                  onChange={(e) => handleGridConfigChange({ opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Canvas Info */}
          {showInfo && (
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
              <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Canvas Info</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Dimensions: {dimensions.width} × {dimensions.height}px</div>
                <div>Zoom: {Math.round(dimensions.zoom * 100)}%</div>
                <div>Viewport: {Math.round(dimensions.offsetX)}, {Math.round(dimensions.offsetY)}</div>
                <div>Visible Area: {Math.round(dimensions.visibleArea.right - dimensions.visibleArea.left)} × {Math.round(dimensions.visibleArea.bottom - dimensions.visibleArea.top)}px</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasControls;
