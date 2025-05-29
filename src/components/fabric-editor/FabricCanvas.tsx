// Professional Fabric.js Canvas Component

"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { useFabricCanvas, CanvasState, CanvasActions } from '@/hooks/fabric/useFabricCanvas';
import { CanvasUnit } from '@/components/fabric-editor/utils/fabricUtils';

export interface FabricCanvasProps {
  width?: number;
  height?: number;
  unit?: CanvasUnit;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  gridColor?: string;
  rulersEnabled?: boolean;
  snapToGrid?: boolean;
  snapThreshold?: number;
  className?: string;
  onSelectionChange?: (objects: fabric.Object[]) => void;
  onObjectModified?: (object: fabric.Object) => void;
  onCanvasChange?: () => void;
}

export interface FabricCanvasRef {
  canvasState: CanvasState;
  canvasActions: CanvasActions;
}

/**
 * Professional Fabric.js Canvas Component with advanced features
 * Features include: grid system, rulers, zoom/pan, snap-to-grid, multi-selection, boundary enforcement
 */
const FabricCanvas = React.forwardRef<FabricCanvasRef, FabricCanvasProps>(({
  width = 100,
  height = 100,
  unit = 'mm',
  backgroundColor = '#ffffff',
  gridEnabled = true,
  gridSize = 10,
  gridColor = '#e5e7eb',
  rulersEnabled = true,
  snapToGrid = true,
  snapThreshold = 5,
  className = '',
  onSelectionChange,
  onObjectModified,
  onCanvasChange,
}, ref) => {
  const { canvasState, canvasActions, canvasRef, containerRef } = useFabricCanvas();
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize canvas when component mounts
  useEffect(() => {
    if (canvasRef.current && !canvasState.isInitialized) {
      canvasActions.initializeCanvas(canvasRef.current, {
        width,
        height,
        unit,
        backgroundColor,
        gridEnabled,
        gridSize,
        gridColor,
        rulersEnabled,
        snapToGrid,
        snapThreshold,
      });
      setIsCanvasReady(true);
    }
  }, [
    canvasRef,
    canvasState.isInitialized,
    canvasActions,
    width,
    height,
    unit,
    backgroundColor,
    gridEnabled,
    gridSize,
    gridColor,
    rulersEnabled,
    snapToGrid,
    snapThreshold,
  ]);

  // Setup event listeners for canvas changes
  useEffect(() => {
    if (!canvasState.canvas) return;

    const canvas = canvasState.canvas;

    // Object modification events
    const handleObjectModified = (e: fabric.IEvent) => {
      if (e.target && onObjectModified) {
        onObjectModified(e.target);
      }
      if (onCanvasChange) {
        onCanvasChange();
      }
    };

    // Canvas change events
    const handleCanvasChange = () => {
      if (onCanvasChange) {
        onCanvasChange();
      }
    };

    // Bind events
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('object:moving', handleObjectModified);
    canvas.on('object:scaling', handleObjectModified);
    canvas.on('object:rotating', handleObjectModified);

    return () => {
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('object:moving', handleObjectModified);
      canvas.off('object:scaling', handleObjectModified);
      canvas.off('object:rotating', handleObjectModified);
    };
  }, [canvasState.canvas, onObjectModified, onCanvasChange]);

  // Handle selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(canvasState.selectedObjects);
    }
  }, [canvasState.selectedObjects, onSelectionChange]);

  // Expose canvas state and actions through ref
  React.useImperativeHandle(ref, () => ({
    canvasState,
    canvasActions,
  }), [canvasState, canvasActions]);

  // Update canvas when props change
  useEffect(() => {
    if (!isCanvasReady || !canvasState.canvas) return;

    // Update canvas size if changed
    if (
      canvasState.canvasSize.width !== width ||
      canvasState.canvasSize.height !== height ||
      canvasState.canvasSize.unit !== unit
    ) {
      canvasActions.updateCanvasSize(width, height, unit);
    }
  }, [width, height, unit, canvasState.canvas, canvasState.canvasSize, canvasActions, isCanvasReady]);

  useEffect(() => {
    if (!isCanvasReady || !canvasState.canvas) return;

    // Update background color
    canvasActions.setBackgroundColor(backgroundColor);
  }, [backgroundColor, canvasState.canvas, canvasActions, isCanvasReady]);

  useEffect(() => {
    if (!isCanvasReady || !canvasState.canvas) return;

    // Update grid
    if (canvasState.gridOptions.enabled !== gridEnabled) {
      canvasActions.toggleGrid(gridEnabled);
    }
    
    if (gridEnabled && (
      canvasState.gridOptions.size !== gridSize ||
      canvasState.gridOptions.color !== gridColor
    )) {
      canvasActions.updateGridOptions({
        size: gridSize,
        color: gridColor,
      });
    }
  }, [gridEnabled, gridSize, gridColor, canvasState.gridOptions, canvasActions, isCanvasReady, canvasState.canvas]);

  useEffect(() => {
    if (!isCanvasReady || !canvasState.canvas) return;

    // Update rulers
    if (canvasState.rulerOptions.enabled !== rulersEnabled) {
      canvasActions.toggleRulers(rulersEnabled);
    }
  }, [rulersEnabled, canvasState.rulerOptions.enabled, canvasActions, isCanvasReady, canvasState.canvas]);

  return (
    <div className={`fabric-canvas-container ${className}`}>
      {/* Canvas Container with Rulers */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden"
        style={{
          paddingTop: rulersEnabled ? '25px' : '0',
          paddingLeft: rulersEnabled ? '25px' : '0',
        }}
      >
        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          className="block border border-gray-300 dark:border-gray-600 shadow-sm"
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
          }}
        />

        {/* Canvas Info Overlay */}
        {canvasState.isInitialized && (
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div>
                Size: {width} × {height} {unit}
              </div>
              <div>
                Zoom: {Math.round(canvasState.zoom * 100)}%
              </div>
              <div>
                Objects: {canvasActions.getCanvasObjects().length}
              </div>
              {canvasState.selectedObjects.length > 0 && (
                <div>
                  Selected: {canvasState.selectedObjects.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {!canvasState.isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Initializing canvas...</span>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="absolute top-4 left-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded px-2 py-1 shadow-sm border border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100 transition-opacity">
          <div className="space-y-1">
            <div>Space + Drag: Pan</div>
            <div>Mouse Wheel: Zoom</div>
            <div>Del: Delete</div>
            <div>Esc: Deselect</div>
            <div>Arrows: Move (Shift = 10px)</div>
            <div>Ctrl+A: Select All</div>
            <div>Ctrl+D: Duplicate</div>
          </div>
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        {/* Zoom Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center">
          <button
            onClick={canvasActions.zoomOut}
            disabled={canvasState.zoom <= 0.1}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 border-x border-gray-200 dark:border-gray-700 min-w-[60px] text-center">
            {Math.round(canvasState.zoom * 100)}%
          </div>
          
          <button
            onClick={canvasActions.zoomIn}
            disabled={canvasState.zoom >= 5}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={canvasActions.fitToScreen}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
            title="Fit to Screen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4m4 12v4h-4M4 16v4h4" />
            </svg>
          </button>
        </div>

        {/* Grid Toggle */}
        <button
          onClick={() => canvasActions.toggleGrid()}
          className={`p-2 rounded-lg shadow-md border transition-colors ${
            canvasState.gridOptions.enabled
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle Grid"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
        </button>

        {/* Rulers Toggle */}
        <button
          onClick={() => canvasActions.toggleRulers()}
          className={`p-2 rounded-lg shadow-md border transition-colors ${
            canvasState.rulerOptions.enabled
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle Rulers"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V5l7-4v18l-7-4 6-8-6-8" />
          </svg>
        </button>
      </div>
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
