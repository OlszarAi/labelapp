/**
 * Main Fabric.js Canvas Component
 * Handles canvas initialization, rendering, and basic interactions
 */

import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { CanvasDimensions, CanvasState } from '../../types/canvas';

interface FabricCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  showGrid?: boolean;
  gridSize?: number;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
  onObjectModified?: (objects: fabric.Object[]) => void;
  className?: string;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  showGrid = true,
  gridSize = 20,
  onCanvasReady,
  onSelectionChange,
  onObjectModified,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const initializedRef = useRef(false);
  
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isLoading: true,
    hasError: false,
    isDirty: false,
    isInitialized: false,
    version: '1.0.0',
    readonly: false,
    objectCount: 0
  });
  
  // Canvas dimensions and view state
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width,
    height,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    minZoom: 0.1,
    maxZoom: 10,
    viewportTransform: [1, 0, 0, 1, 0, 0],
    visibleArea: { left: 0, top: 0, right: width, bottom: height }
  });
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPosition, setPanStartPosition] = useState({ x: 0, y: 0 });

  // Create grid background pattern
  const createGridBackground = (canvas: fabric.Canvas, zoom: number = 1) => {
    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    
    if (!patternContext) return;

    const size = gridSize * zoom;
    patternCanvas.width = size;
    patternCanvas.height = size;

    // Draw grid lines
    patternContext.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    patternContext.lineWidth = 0.5;
    
    // Vertical line
    patternContext.beginPath();
    patternContext.moveTo(size, 0);
    patternContext.lineTo(size, size);
    patternContext.stroke();
    
    // Horizontal line  
    patternContext.beginPath();
    patternContext.moveTo(0, size);
    patternContext.lineTo(size, size);
    patternContext.stroke();

    const pattern = patternContext.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      canvas.setBackgroundColor(pattern as unknown as string, canvas.renderAll.bind(canvas));
    }
  };

  // Center view
  const centerView = () => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const container = containerRef.current;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const canvasWidth = dimensions.width * dimensions.zoom;
    const canvasHeight = dimensions.height * dimensions.zoom;
    
    const centerX = (containerWidth - canvasWidth) / 2;
    const centerY = (containerHeight - canvasHeight) / 2;
    
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] = centerX;
      vpt[5] = centerY;
      canvas.requestRenderAll();
      
      setDimensions(prev => ({
        ...prev,
        offsetX: centerX,
        offsetY: centerY
      }));
    }
  };

  // Initialize canvas - only once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current || initializedRef.current) return;

    try {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        controlsAboveOverlay: true,
        allowTouchScrolling: false,
        stopContextMenu: true,
        fireRightClick: false,
        fireMiddleClick: false,
        enableRetinaScaling: true,
      });

      // Configure canvas styling
      canvas.selectionBorderColor = '#3b82f6';
      canvas.selectionLineWidth = 2;
      canvas.selectionColor = 'rgba(59, 130, 246, 0.1)';

      // Configure object controls styling
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#3b82f6',
        cornerStyle: 'circle',
        cornerSize: 8,
        borderColor: '#3b82f6',
        borderScaleFactor: 2,
        borderOpacityWhenMoving: 0.8,
      });

      // Create grid background if enabled
      if (showGrid) {
        createGridBackground(canvas, 1);
      }

      // Event listeners
      canvas.on('selection:created', () => {
        if (!fabricCanvasRef.current || !onSelectionChange) return;
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        onSelectionChange(activeObjects);
      });
      
      canvas.on('selection:updated', () => {
        if (!fabricCanvasRef.current || !onSelectionChange) return;
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        onSelectionChange(activeObjects);
      });
      
      canvas.on('selection:cleared', () => {
        if (!fabricCanvasRef.current || !onSelectionChange) return;
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        onSelectionChange(activeObjects);
      });
      
      canvas.on('object:modified', () => {
        if (!fabricCanvasRef.current || !onObjectModified) return;
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        onObjectModified(activeObjects);
        setCanvasState(prev => ({ ...prev, isDirty: true }));
      });

      fabricCanvasRef.current = canvas;
      initializedRef.current = true;
      setCanvasState(prev => ({ ...prev, isLoading: false }));
      
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }

      // Center view after initialization
      setTimeout(() => centerView(), 100);
      
    } catch (error) {
      console.error('Failed to initialize Fabric.js canvas:', error);
      setCanvasState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasError: true, 
        errorMessage: 'Failed to initialize canvas' 
      }));
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []); // Only run once

  // Handle wheel events for zoom and pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!fabricCanvasRef.current || !containerRef.current) return;

      const canvas = fabricCanvasRef.current;
      const rect = container.getBoundingClientRect();
      
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        const zoom = canvas.getZoom();
        const delta = e.deltaY * -0.002;
        const newZoom = Math.max(0.1, Math.min(10, zoom + delta));
        
        canvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), newZoom);
        setDimensions(prev => ({ ...prev, zoom: newZoom }));
        
        // Update grid if enabled
        if (showGrid) {
          createGridBackground(canvas, newZoom);
        }
      } else {
        // Pan with wheel
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += -e.deltaX;
          vpt[5] += -e.deltaY;
          canvas.requestRenderAll();
          
          setDimensions(prev => ({
            ...prev,
            offsetX: vpt[4],
            offsetY: vpt[5]
          }));
        }
      }
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [showGrid, gridSize]); // Minimal dependencies

  // Handle mouse pan
  useEffect(() => {
    if (!isPanning) return;

    const mouseMoveHandler = (e: MouseEvent) => {
      const deltaX = e.clientX - panStartPosition.x;
      const deltaY = e.clientY - panStartPosition.y;
      
      if (fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          canvas.requestRenderAll();
          
          setDimensions(prev => ({
            ...prev,
            offsetX: vpt[4],
            offsetY: vpt[5]
          }));
        }
      }
      
      setPanStartPosition({ x: e.clientX, y: e.clientY });
    };

    const mouseUpHandler = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    
    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [isPanning, panStartPosition]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeHandler = () => {
      if (!fabricCanvasRef.current || !containerRef.current) return;

      const canvas = fabricCanvasRef.current;
      const container = containerRef.current;
      
      const { clientWidth, clientHeight } = container;
      
      canvas.setDimensions({
        width: clientWidth,
        height: clientHeight
      });
      
      centerView();
    };

    const resizeObserver = new ResizeObserver(resizeHandler);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // No dependencies

  // Update dimensions when props change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      setDimensions(prev => ({ ...prev, width, height }));
      fabricCanvasRef.current.setDimensions({ width, height });
      centerView();
    }
  }, [width, height]);

  // Update grid when showGrid changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      if (showGrid) {
        createGridBackground(fabricCanvasRef.current, dimensions.zoom);
      } else {
        fabricCanvasRef.current.setBackgroundColor(backgroundColor, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
      }
    }
  }, [showGrid, gridSize, backgroundColor]);

  // Mouse down handler for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse button or Alt + left click for panning
      e.preventDefault();
      setIsPanning(true);
      setPanStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  if (canvasState.hasError) {
    return (
      <div className={`fabric-canvas-container error ${className}`}>
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Canvas Error</p>
            <p className="text-sm opacity-75">{canvasState.errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fabric-canvas-container relative w-full h-full overflow-hidden bg-gray-50 dark:bg-neutral-800 ${className}`}
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: isPanning ? 'grabbing' : 'default',
        userSelect: 'none'
      }}
    >
      {canvasState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-800/80 z-10">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-r-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Initializing canvas...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="block"
        style={{ 
          maxWidth: 'none',
          maxHeight: 'none'
        }}
      />
      
      {/* Canvas info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-800/90 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 backdrop-blur-sm border border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <span>{Math.round(dimensions.zoom * 100)}% zoom</span>
          <span>{dimensions.width} × {dimensions.height}px</span>
          {canvasState.isDirty && (
            <span className="text-orange-600 dark:text-orange-400">● Unsaved</span>
          )}
        </div>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-neutral-800/90 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 backdrop-blur-sm border border-gray-200 dark:border-neutral-700">
        <div className="text-right">
          <div>Ctrl+Scroll: Zoom</div>
          <div>Scroll/Alt+Drag: Pan</div>
        </div>
      </div>
    </div>
  );
};

export default FabricCanvas;
