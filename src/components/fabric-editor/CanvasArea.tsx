'use client';

import React, { useRef, useEffect, useState } from 'react';
import FabricCanvas from './FabricCanvas';

interface CanvasAreaProps {
  // Canvas configuration
  width?: number;
  height?: number;
  backgroundColor?: string;
  
  // Grid system
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  
  // Rulers
  showRulers?: boolean;
  rulerUnit?: 'px' | 'mm' | 'cm' | 'in';
  
  // Zoom and pan
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  
  // Keyboard shortcuts
  enableKeyboardShortcuts?: boolean;
  onToolChange?: (tool: string) => void;
  
  // Event handlers
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
  onObjectModified?: (objects: fabric.Object[]) => void;
  onZoomChange?: (zoom: number) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  showGrid = true,
  gridSize = 20,
  snapToGrid = false,
  showRulers = true,
  rulerUnit = 'px',
  zoom = 1,
  minZoom = 0.1,
  maxZoom = 10,
  enableKeyboardShortcuts = true,
  onCanvasReady,
  onSelectionChange,
  onObjectModified,
  onZoomChange,
  onToolChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial size
    updateSize();

    // Listen for resize
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 relative"
    >
      {/* Canvas controls bar */}
      <div className="flex-none h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Canvas info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono">{width} × {height} px</span>
            <span className="mx-2">|</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View options */}
          <div className="flex items-center gap-1">
            {showGrid && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                Grid: {gridSize}px
              </span>
            )}
            {showRulers && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                Rulers: {rulerUnit}
              </span>
            )}
            {snapToGrid && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
                Snap
              </span>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onZoomChange?.(1)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Reset zoom to 100%"
            >
              100%
            </button>
            <button
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Fit canvas to view"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Fabric Canvas - Simplified layout */}
        <div className="w-full h-full">
          <FabricCanvas
            width={width}
            height={height}
            backgroundColor={backgroundColor}
            showGrid={showGrid}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            showRulers={showRulers}
            rulerUnit={rulerUnit}
            minZoom={minZoom}
            maxZoom={maxZoom}
            enableKeyboardShortcuts={enableKeyboardShortcuts}
            onCanvasReady={onCanvasReady}
            onSelectionChange={onSelectionChange}
            onObjectModified={onObjectModified}
            onZoomChange={onZoomChange}
            onToolChange={onToolChange}
            className="w-full h-full"
            showControls={false} // Hide controls since we have them in the layout
            showInfo={true} // Show info overlay
          />
        </div>

        {/* Canvas status overlay - simplified */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/75 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
            <div className="space-y-1">
              <div>Canvas: {width} × {height} px</div>
              <div>Zoom: {Math.round(zoom * 100)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas footer with additional info */}
      <div className="flex-none h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          {showGrid && <span>Grid: {gridSize}px</span>}
          {showRulers && <span>Unit: {rulerUnit}</span>}
        </div>
        
        <div className="flex items-center gap-4">
          <span>
            Canvas: {width} × {height} px
            {rulerUnit !== 'px' && (
              <>
                {' '}({Math.round(width * (rulerUnit === 'mm' ? 0.264583 : rulerUnit === 'cm' ? 0.0264583 : 0.0104167))}{rulerUnit})
              </>
            )}
          </span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
