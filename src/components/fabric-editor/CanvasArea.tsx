// Center canvas area with rulers, controls, and canvas

"use client";

import React, { useState, useRef, useEffect } from 'react';
import FabricCanvas, { FabricCanvasRef } from './FabricCanvas';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3x3, 
  Ruler, 
  RotateCcw, 
  RotateCw, 
  Move, 
  Sun, 
  Moon,
  Menu,
  Settings,
  Download,
  Upload,
  Save,
  Eye,
  MousePointer2
} from 'lucide-react';

export interface CanvasAreaProps {
  projectId?: string;
  canvasId?: string;
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

/**
 * Center canvas area with rulers, zoom controls, and the main Fabric canvas
 */
export function CanvasArea({
  projectId,
  canvasId,
  leftPanelVisible,
  rightPanelVisible,
  onToggleLeftPanel,
  onToggleRightPanel,
  theme,
  onThemeToggle,
}: CanvasAreaProps) {
  const canvasRef = useRef<FabricCanvasRef>(null);
  const [canvasState, setCanvasState] = useState({
    width: 100,
    height: 50,
    unit: 'mm' as const,
    backgroundColor: '#ffffff',
    zoom: 1,
    gridEnabled: true,
    rulersEnabled: true,
    snapToGrid: true,
  });
  
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Canvas control handlers
  const handleZoomIn = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.zoomOut();
    }
  };

  const handleFitToScreen = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.fitToScreen();
    }
  };

  const handleResetZoom = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.resetZoom();
    }
  };

  const handleToggleGrid = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.toggleGrid();
      setCanvasState(prev => ({ ...prev, gridEnabled: !prev.gridEnabled }));
    }
  };

  const handleToggleRulers = () => {
    if (canvasRef.current) {
      canvasRef.current.canvasActions.toggleRulers();
      setCanvasState(prev => ({ ...prev, rulersEnabled: !prev.rulersEnabled }));
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const state = canvasRef.current.canvasActions.saveCanvasState();
      console.log('Canvas saved:', state);
      // TODO: Implement actual save functionality
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.canvasActions.exportCanvas({ format: 'png' });
      console.log('Canvas exported:', dataUrl);
      // TODO: Implement actual export functionality
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle canvas updates
  const handleCanvasChange = () => {
    if (canvasRef.current) {
      const state = canvasRef.current.canvasState;
      setCanvasState(prev => ({
        ...prev,
        zoom: state.zoom,
      }));
    }
  };

  const handleSelectionChange = (objects: fabric.Object[]) => {
    console.log('Selection changed:', objects);
    // TODO: Communicate with right sidebar
  };

  const handleObjectModified = (object: fabric.Object) => {
    console.log('Object modified:', object);
    // TODO: Update properties panel
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Left Toolbar Section */}
        <div className="flex items-center space-x-2">
          {/* Panel Toggles */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleLeftPanel}
              className={`p-2 rounded-lg transition-colors ${
                leftPanelVisible 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle tools panel (Ctrl+1)"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleRightPanel}
              className={`p-2 rounded-lg transition-colors ${
                rightPanelVisible 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle properties panel (Ctrl+2)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Canvas Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleToggleGrid}
              className={`p-2 rounded-lg transition-colors ${
                canvasState.gridEnabled 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle grid (G)"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleRulers}
              className={`p-2 rounded-lg transition-colors ${
                canvasState.rulersEnabled 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle rulers (R)"
            >
              <Ruler className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* View Mode */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'edit' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Edit mode"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Preview mode"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Toolbar Section - Canvas Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {canvasState.width} × {canvasState.height} {canvasState.unit}
          </span>
          <span>
            Zoom: {Math.round(canvasState.zoom * 100)}%
          </span>
        </div>

        {/* Right Toolbar Section */}
        <div className="flex items-center space-x-2">
          {/* File Operations */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleSave}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Zoom out (Ctrl+-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[3rem]"
              title="Reset zoom (Ctrl+0)"
            >
              {Math.round(canvasState.zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Zoom in (Ctrl++)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitToScreen}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fit to screen (Ctrl+0)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme (Ctrl+Shift+T)"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div 
            className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Canvas Component */}
            <FabricCanvas
              ref={canvasRef}
              width={canvasState.width}
              height={canvasState.height}
              unit={canvasState.unit}
              backgroundColor={canvasState.backgroundColor}
              gridEnabled={canvasState.gridEnabled}
              gridSize={10}
              gridColor="#e5e7eb"
              rulersEnabled={canvasState.rulersEnabled}
              snapToGrid={canvasState.snapToGrid}
              snapThreshold={5}
              className="border border-gray-200 dark:border-gray-700"
              onSelectionChange={handleSelectionChange}
              onObjectModified={handleObjectModified}
              onCanvasChange={handleCanvasChange}
            />
          </div>
        </div>

        {/* Canvas Overlay Information */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Canvas:</span>
              <span className="font-mono">{canvasState.width}×{canvasState.height} {canvasState.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Zoom:</span>
              <span className="font-mono">{Math.round(canvasState.zoom * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mode:</span>
              <span className="capitalize">{viewMode}</span>
            </div>
          </div>
        </div>

        {/* Shortcuts Help */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 max-w-xs">
          <div className="font-medium mb-2">Quick Shortcuts</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Pan:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Space + Drag</kbd>
            </div>
            <div className="flex justify-between">
              <span>Zoom:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + Scroll</kbd>
            </div>
            <div className="flex justify-between">
              <span>Select All:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + A</kbd>
            </div>
            <div className="flex justify-between">
              <span>Duplicate:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Delete:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Del</kbd>
            </div>
            <div className="flex justify-between">
              <span>Undo:</span>
              <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl + Z</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CanvasArea;
