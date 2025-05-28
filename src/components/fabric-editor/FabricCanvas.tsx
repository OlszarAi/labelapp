/**
 * Enhanced Fabric.js Canvas Component
 * Professional canvas with rulers, grid system, zoom/pan controls, and precise measurements
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { CanvasDimensions, CanvasState, GridConfiguration } from '../../types/canvas';
import { HistoryActionType } from '../../types/fabric';
import Ruler from '../ui/Ruler';
import CanvasControls from './CanvasControls';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useCanvasHistory } from '../../hooks/useCanvasHistory';

interface FabricCanvasProps {
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
  minZoom?: number;
  maxZoom?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  
  // Canvas options
  aspectRatio?: number | null; // null means no aspect ratio lock
  maintainAspectRatio?: boolean;
  resizable?: boolean;
  
  // Event handlers
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
  onObjectModified?: (objects: fabric.Object[]) => void;
  onCanvasSizeChange?: (width: number, height: number) => void;
  onZoomChange?: (zoom: number) => void;
  onGridChange?: (enabled: boolean, size: number) => void;
  
  // Keyboard shortcuts
  enableKeyboardShortcuts?: boolean;
  onToolChange?: (tool: string) => void;
  
  // Performance and styling
  className?: string;
  showControls?: boolean;
  showInfo?: boolean;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({
  // Canvas configuration
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  
  // Grid system
  showGrid = true,
  gridSize = 20,
  snapToGrid = false,
  
  // Rulers
  showRulers = true,
  rulerUnit = 'px',
  
  // Zoom and pan
  minZoom = 0.1,
  maxZoom = 10,
  enablePan = true,
  enableZoom = true,
  
  // Canvas options
  aspectRatio = null,
  maintainAspectRatio = false,
  resizable = true,
  
  // Event handlers
  onCanvasReady,
  onSelectionChange,
  onObjectModified,
  onCanvasSizeChange,
  onZoomChange,
  onGridChange,
  
  // Keyboard shortcuts
  enableKeyboardShortcuts = true,
  onToolChange,
  
  // Performance and styling
  className = '',
  showControls = true,
  showInfo = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const initializedRef = useRef(false);
  const rulerRefs = useRef<{ horizontal: HTMLDivElement | null; vertical: HTMLDivElement | null }>({
    horizontal: null,
    vertical: null
  });
  
  // Canvas focus state for keyboard shortcuts
  const [canvasFocused, setCanvasFocused] = useState(false);
  
  // Canvas history hook with enhanced options
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    saveStateNow,
    clearHistory,
    getHistoryMetadata,
    historySize,
    currentHistoryIndex
  } = useCanvasHistory(fabricCanvasRef.current, {
    maxHistorySize: 50,
    debounceMs: 500,
    enableCompression: true,
    enableLogging: false,
    compressionThreshold: 10240, // 10KB
    ignoreMinorChanges: true,
    minorChangeThreshold: 100
  });
  
  // Mouse position for ruler tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Helper function to constrain viewport transform within canvas bounds
  const constrainViewportTransform = useCallback((vpt: number[], canvas: fabric.Canvas) => {
    const zoom = canvas.getZoom();
    const canvasWidth = width * zoom;
    const canvasHeight = height * zoom;
    
    if (!containerRef.current) return vpt;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const rulerOffset = showRulers ? 30 : 0;
    
    // Calculate bounds
    const maxX = containerWidth - rulerOffset;
    const maxY = containerHeight - rulerOffset;
    const minX = rulerOffset + Math.min(0, maxX - canvasWidth);
    const minY = rulerOffset + Math.min(0, maxY - canvasHeight);
    
    // Constrain X position
    if (vpt[4] > maxX) vpt[4] = maxX;
    if (vpt[4] < minX) vpt[4] = minX;
    
    // Constrain Y position  
    if (vpt[5] > maxY) vpt[5] = maxY;
    if (vpt[5] < minY) vpt[5] = minY;
    
    return vpt;
  }, [width, height, showRulers]);

  // Helper function to constrain objects within canvas bounds
  const constrainObjectPosition = useCallback((obj: fabric.Object) => {
    const objBounds = obj.getBoundingRect();
    
    // Get object position and size
    let newLeft = obj.left || 0;
    let newTop = obj.top || 0;
    
    // Constrain to canvas bounds
    if (objBounds.left != null && objBounds.left < 0) {
      newLeft -= objBounds.left;
    }
    if (objBounds.top != null && objBounds.top < 0) {
      newTop -= objBounds.top;
    }
    if (objBounds.left != null && objBounds.width != null && objBounds.left + objBounds.width > width) {
      newLeft -= (objBounds.left + objBounds.width - width);
    }
    if (objBounds.top != null && objBounds.height != null && objBounds.top + objBounds.height > height) {
      newTop -= (objBounds.top + objBounds.height - height);
    }
    
    // Apply constrained position
    obj.set({
      left: newLeft,
      top: newTop
    });
    
    obj.setCoords();
  }, [width, height]);
  
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isLoading: true,
    hasError: false,
    errorMessage: '',
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
    minZoom,
    maxZoom,
    viewportTransform: [1, 0, 0, 1, 0, 0],
    visibleArea: { left: 0, top: 0, right: width, bottom: height }
  });
  
  // Grid configuration
  const [gridConfig, setGridConfig] = useState<GridConfiguration>({
    enabled: showGrid,
    size: gridSize,
    color: '#e5e5e5',
    opacity: 0.5,
    subdivisions: 5,
    snapToGrid: snapToGrid || false,
    snapTolerance: 5
  });
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPosition, setPanStartPosition] = useState({ x: 0, y: 0 });

  // Performance optimization - debounced state updates
  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  // Grid background creation with enhanced styling
  const createGridBackground = useCallback((canvas: fabric.Canvas, zoom: number = 1) => {
    if (!gridConfig.enabled) {
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
      return;
    }

    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    
    if (!patternContext) return;

    const effectiveSize = gridConfig.size * zoom;
    const subdivisionSize = effectiveSize / gridConfig.subdivisions;
    
    patternCanvas.width = effectiveSize;
    patternCanvas.height = effectiveSize;

    // Clear background
    patternContext.fillStyle = backgroundColor;
    patternContext.fillRect(0, 0, effectiveSize, effectiveSize);

    // Draw subdivision lines (finer grid)
    if (gridConfig.subdivisions > 1 && zoom > 0.5) {
      patternContext.strokeStyle = gridConfig.color;
      patternContext.globalAlpha = gridConfig.opacity * 0.3;
      patternContext.lineWidth = 0.5;
      
      for (let i = 1; i < gridConfig.subdivisions; i++) {
        const pos = i * subdivisionSize;
        
        // Vertical subdivision line
        patternContext.beginPath();
        patternContext.moveTo(pos, 0);
        patternContext.lineTo(pos, effectiveSize);
        patternContext.stroke();
        
        // Horizontal subdivision line
        patternContext.beginPath();
        patternContext.moveTo(0, pos);
        patternContext.lineTo(effectiveSize, pos);
        patternContext.stroke();
      }
    }

    // Draw main grid lines
    patternContext.strokeStyle = gridConfig.color;
    patternContext.globalAlpha = gridConfig.opacity;
    patternContext.lineWidth = 1;
    
    // Main vertical line
    patternContext.beginPath();
    patternContext.moveTo(effectiveSize, 0);
    patternContext.lineTo(effectiveSize, effectiveSize);
    patternContext.stroke();
    
    // Main horizontal line  
    patternContext.beginPath();
    patternContext.moveTo(0, effectiveSize);
    patternContext.lineTo(effectiveSize, effectiveSize);
    patternContext.stroke();

    const pattern = patternContext.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      canvas.setBackgroundColor(pattern as unknown as string, canvas.renderAll.bind(canvas));
    }
  }, [gridConfig, backgroundColor]);

  // Center view with enhanced calculations
  const centerView = useCallback(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const container = containerRef.current;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate effective canvas size with current zoom
    const canvasWidth = dimensions.width * dimensions.zoom;
    const canvasHeight = dimensions.height * dimensions.zoom;
    
    // Calculate center position with ruler offset
    const rulerOffset = showRulers ? 30 : 0;
    const centerX = (containerWidth - canvasWidth - rulerOffset) / 2 + rulerOffset;
    const centerY = (containerHeight - canvasHeight - rulerOffset) / 2 + rulerOffset;
    
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
  }, [dimensions.width, dimensions.height, dimensions.zoom, showRulers]);

  // Enhanced zoom function with snap points
  const zoomTo = useCallback((zoom: number, point?: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    
    if (point) {
      canvas.zoomToPoint(new fabric.Point(point.x, point.y), clampedZoom);
    } else {
      canvas.setZoom(clampedZoom);
      centerView();
    }
    
    const newDimensions = {
      ...dimensions,
      zoom: clampedZoom
    };
    setDimensions(newDimensions);
    
    // Update grid with new zoom
    createGridBackground(canvas, clampedZoom);
    
    if (onZoomChange) {
      onZoomChange(clampedZoom);
    }
  }, [minZoom, maxZoom, dimensions, centerView, createGridBackground, onZoomChange]);

  // Fit canvas to viewport
  const fitToViewport = useCallback(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const container = containerRef.current;
    
    const rulerOffset = showRulers ? 30 : 0;
    const availableWidth = container.clientWidth - rulerOffset - 40; // 40px margin
    const availableHeight = container.clientHeight - rulerOffset - 40;
    
    const scaleX = availableWidth / dimensions.width;
    const scaleY = availableHeight / dimensions.height;
    const scale = Math.min(scaleX, scaleY, maxZoom);
    
    zoomTo(scale);
  }, [dimensions.width, dimensions.height, maxZoom, showRulers, zoomTo]);

  // Snap object to grid
  const snapObjectToGrid = useCallback((obj: fabric.Object) => {
    if (!snapToGrid || !gridConfig.enabled) return;

    const snappedLeft = Math.round((obj.left || 0) / gridConfig.size) * gridConfig.size;
    const snappedTop = Math.round((obj.top || 0) / gridConfig.size) * gridConfig.size;
    
    obj.set({
      left: snappedLeft,
      top: snappedTop
    });
    
    obj.setCoords();
  }, [snapToGrid, gridConfig]);

  // Handle canvas size changes with aspect ratio
  const handleCanvasSizeChange = useCallback((newWidth: number, newHeight: number) => {
    if (!fabricCanvasRef.current) return;

    let finalWidth = newWidth;
    let finalHeight = newHeight;

    // Apply aspect ratio constraint if enabled
    if (maintainAspectRatio && aspectRatio) {
      if (Math.abs(newWidth / finalHeight - aspectRatio) > Math.abs(finalWidth / newHeight - aspectRatio)) {
        finalHeight = newWidth / aspectRatio;
      } else {
        finalWidth = newHeight * aspectRatio;
      }
    }

    const canvas = fabricCanvasRef.current;
    canvas.setWidth(finalWidth);
    canvas.setHeight(finalHeight);
    
    setDimensions(prev => ({
      ...prev,
      width: finalWidth,
      height: finalHeight
    }));

    createGridBackground(canvas, dimensions.zoom);
    centerView();

    if (onCanvasSizeChange) {
      onCanvasSizeChange(finalWidth, finalHeight);
    }
  }, [maintainAspectRatio, aspectRatio, dimensions.zoom, createGridBackground, centerView, onCanvasSizeChange]);

  // Mouse tracking for rulers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    
    // Convert screen coordinates to canvas coordinates
    const x = (e.clientX - rect.left - vpt[4]) / vpt[0];
    const y = (e.clientY - rect.top - vpt[5]) / vpt[3];
    
    setMousePosition({ x, y });
  }, []);

  // Enhanced canvas initialization
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current || initializedRef.current) return;

    console.log('🎨 FabricCanvas: Starting initialization...');
    
    try {
      updateCanvasState({ isLoading: true });
      
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        imageSmoothingEnabled: true,
        controlsAboveOverlay: true,
        allowTouchScrolling: false,
        stopContextMenu: true,
        fireRightClick: false,
        fireMiddleClick: false,
        
        // Performance optimizations
        renderOnAddRemove: true,
        stateful: true,
        skipTargetFind: false,
        perPixelTargetFind: true,
      });

      console.log('🎨 FabricCanvas: Canvas created successfully', {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        element: canvas.getElement()
      });

      // Enhanced object selection styling
      canvas.selectionBorderColor = '#3b82f6';
      canvas.selectionLineWidth = 2;
      canvas.selectionColor = 'rgba(59, 130, 246, 0.1)';
      canvas.selectionDashArray = [5, 5];

      // Configure enhanced object controls styling
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#3b82f6',
        cornerStyle: 'circle',
        cornerSize: 10,
        borderColor: '#3b82f6',
        borderScaleFactor: 2,
        borderOpacityWhenMoving: 0.8,
        cornerStrokeColor: '#ffffff',
        cornerDashArray: undefined,
        hasRotatingPoint: true,
        rotatingPointOffset: 40,
      });

      // Enhanced event handlers with performance optimizations
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
        onSelectionChange([]);
      });
      
      canvas.on('object:modified', () => {
        if (!fabricCanvasRef.current || !onObjectModified) return;
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        onObjectModified(activeObjects);
        updateCanvasState({ isDirty: true });
      });

      // Enhanced object movement with snap-to-grid
      canvas.on('object:moving', (e) => {
        if (snapToGrid && e.target) {
          snapObjectToGrid(e.target);
        }
      });

      // Object counting for performance monitoring
      canvas.on('object:added', () => {
        const count = canvas.getObjects().length;
        updateCanvasState({ objectCount: count });
      });

      canvas.on('object:removed', () => {
        const count = canvas.getObjects().length;
        updateCanvasState({ objectCount: count });
      });

      // Create initial grid background
      createGridBackground(canvas, 1);

      fabricCanvasRef.current = canvas;
      initializedRef.current = true;
      updateCanvasState({ 
        isLoading: false, 
        isInitialized: true,
        objectCount: 0
      });
      
      console.log('🎨 FabricCanvas: Initialization complete, calling onCanvasReady');
      
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
      
      // Center view after initialization
      setTimeout(() => {
        console.log('🎨 FabricCanvas: Centering view');
        centerView();
      }, 100);
      
    } catch (error) {
      console.error('Failed to initialize Fabric.js canvas:', error);
      updateCanvasState({ 
        isLoading: false, 
        hasError: true, 
        errorMessage: 'Failed to initialize canvas' 
      });
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

  // Canvas actions for keyboard shortcuts
  const handleDelete = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => fabricCanvasRef.current!.remove(obj));
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      saveStateNow(HistoryActionType.REMOVE, `Deleted ${activeObjects.length} object(s)`);
    }
  }, [saveStateNow]);

  const handleCopy = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      // Store in clipboard - simplified version
      console.log('Copy executed for object:', activeObject.type);
    }
  }, []);

  const handlePaste = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    // Simplified paste - would normally paste from clipboard
    console.log('Paste executed');
  }, []);

  const handleDuplicate = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20
        });
        fabricCanvasRef.current!.add(cloned);
        fabricCanvasRef.current!.setActiveObject(cloned);
        fabricCanvasRef.current!.renderAll();
        saveStateNow(HistoryActionType.ADD, 'Duplicated object');
      });
    }
  }, [saveStateNow]);

  const handleSelectAll = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length > 0) {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: fabricCanvasRef.current
      });
      fabricCanvasRef.current.setActiveObject(selection);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const handleDeselectAll = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();
  }, []);

  const handleMoveSelected = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number) => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        const currentLeft = obj.left || 0;
        const currentTop = obj.top || 0;
        
        switch (direction) {
          case 'up':
            obj.set('top', currentTop - distance);
            break;
          case 'down':
            obj.set('top', currentTop + distance);
            break;
          case 'left':
            obj.set('left', currentLeft - distance);
            break;
          case 'right':
            obj.set('left', currentLeft + distance);
            break;
        }
        obj.setCoords();
      });
      fabricCanvasRef.current.renderAll();
      saveStateNow(HistoryActionType.MOVE, `Moved ${activeObjects.length} object(s) ${direction}`);
    }
  }, [saveStateNow]);

  // Handle canvas focus for keyboard shortcuts
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleCanvasClick = () => {
      setCanvasFocused(true);
    };

    const handleCanvasBlur = () => {
      // Check if focus moved to another element outside the canvas
      setTimeout(() => {
        if (!containerRef.current?.contains(document.activeElement)) {
          setCanvasFocused(false);
        }
      }, 0);
    };

    // Listen for canvas events
    canvas.on('mouse:down', handleCanvasClick);
    
    // Listen for global focus events
    document.addEventListener('click', (e) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setCanvasFocused(false);
      }
    });

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [fabricCanvasRef.current]);

  // Save canvas state when objects are modified for history tracking
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectAdded = () => {
      // Use saveState with proper action type
      saveState(HistoryActionType.ADD, 'Added object');
    };

    const handleObjectRemoved = () => {
      // Use saveState with proper action type
      saveState(HistoryActionType.REMOVE, 'Removed object');
    };

    const handleObjectModified = () => {
      // Use default saveState which auto-detects action type
      saveState();
    };

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('path:created', handleObjectAdded); // For drawing tools

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('path:created', handleObjectAdded);
    };
  }, [fabricCanvasRef.current, saveState]);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    canvas: fabricCanvasRef.current,
    canvasFocused,
    enabled: enableKeyboardShortcuts,
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
    onDelete: handleDelete,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDuplicate: handleDuplicate,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onZoomIn: () => zoomTo(dimensions.zoom * 1.1),
    onZoomOut: () => zoomTo(dimensions.zoom / 1.1),
    onFitToScreen: fitToViewport,
    onToggleGrid: () => setGridConfig(prev => ({ ...prev, enabled: !prev.enabled })),
    onToggleRulers: () => console.log('Toggle rulers - implement in parent'),
    onTextTool: () => onToolChange?.('text'),
    onQRCodeTool: () => onToolChange?.('qr'),
    onUUIDTool: () => onToolChange?.('uuid'),
    onMoveSelected: handleMoveSelected
  });

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
      className={`fabric-canvas-container relative w-full h-full overflow-hidden bg-gray-50 dark:bg-neutral-800 ${className}`}
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
      
      {/* Canvas Controls */}
      {showControls && (
        <CanvasControls
          dimensions={dimensions}
          gridConfig={gridConfig}
          onDimensionsChange={handleCanvasSizeChange}
          onGridConfigChange={(config) => setGridConfig(config)}
          onZoomChange={zoomTo}
          onFitToViewport={fitToViewport}
          onCenterView={centerView}
          showInfo={showInfo}
        />
      )}
      
      {/* Rulers */}
      {showRulers && (
        <>
          <Ruler
            orientation="horizontal"
            length={dimensions.width}
            zoom={dimensions.zoom}
            offset={dimensions.offsetX}
            unit={rulerUnit}
            mousePosition={mousePosition}
            className="absolute top-0 left-6 z-20"
          />
          <Ruler
            orientation="vertical"
            length={dimensions.height}
            zoom={dimensions.zoom}
            offset={dimensions.offsetY}
            unit={rulerUnit}
            mousePosition={mousePosition}
            className="absolute left-0 top-6 z-20"
          />
          {/* Corner space for rulers */}
          <div className="absolute top-0 left-0 w-6 h-6 bg-gray-200 dark:bg-neutral-700 border-r border-b border-gray-300 dark:border-neutral-600 z-30" />
        </>
      )}
      
      {/* Canvas container with rulers offset */}
      <div 
        ref={containerRef}
        className="absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg"
        style={{
          top: showRulers ? '24px' : '0',
          left: showRulers ? '24px' : '0',
          right: '0',
          bottom: '0',
          minWidth: '300px',
          minHeight: '200px',
          outline: 'none' // Remove focus outline since we handle it visually
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onFocus={() => setCanvasFocused(true)}
        onBlur={() => setCanvasFocused(false)}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className="block border-2 border-blue-200"
          style={{ 
            maxWidth: 'none',
            maxHeight: 'none',
            display: 'block'
          }}
        />
      </div>
      
      {/* Canvas info overlay */}
      {showInfo && (
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-800/90 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 backdrop-blur-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <span>{Math.round(dimensions.zoom * 100)}% zoom</span>
            <span>{dimensions.width} × {dimensions.height}px</span>
            <span>{canvasState.objectCount} objects</span>
            {canvasState.isDirty && (
              <span className="text-orange-600 dark:text-orange-400">● Unsaved</span>
            )}
            {mousePosition.x !== null && mousePosition.y !== null && (
              <span>
                {Math.round(mousePosition.x)}, {Math.round(mousePosition.y)}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-neutral-800/90 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 backdrop-blur-sm border border-gray-200 dark:border-neutral-700">
        <div className="text-right">
          <div>Ctrl+Scroll: Zoom</div>
          <div>Scroll/Alt+Drag: Pan</div>
          {gridConfig.snapToGrid && <div>Snap: {gridConfig.snapTolerance}px</div>}
        </div>
      </div>
    </div>
  );
};

export default FabricCanvas;
