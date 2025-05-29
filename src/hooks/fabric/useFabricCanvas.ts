// Professional Fabric.js canvas management hook

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { FabricUtils, CanvasConfig, GridOptions, RulerOptions, CanvasUnit } from '@/components/fabric-editor/utils/fabricUtils';

export interface CanvasState {
  canvas: fabric.Canvas | null;
  isInitialized: boolean;
  zoom: number;
  isDragging: boolean;
  selectedObjects: fabric.Object[];
  canvasSize: { width: number; height: number; unit: CanvasUnit };
  gridOptions: GridOptions;
  rulerOptions: RulerOptions;
}

export interface CanvasActions {
  initializeCanvas: (element: HTMLCanvasElement, config: CanvasConfig) => void;
  updateCanvasSize: (width: number, height: number, unit: CanvasUnit) => void;
  setBackgroundColor: (color: string) => void;
  toggleGrid: (enabled?: boolean) => void;
  updateGridOptions: (options: Partial<GridOptions>) => void;
  toggleRulers: (enabled?: boolean) => void;
  updateRulerOptions: (options: Partial<RulerOptions>) => void;
  setZoom: (zoom: number) => void;
  fitToScreen: () => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  centerCanvas: () => void;
  addObject: (object: fabric.Object) => void;
  removeObject: (object: fabric.Object) => void;
  removeSelectedObjects: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  saveCanvasState: () => string;
  loadCanvasState: (state: string) => void;
  exportCanvas: (options?: ExportOptions) => string;
  clearCanvas: () => void;
  getCanvasObjects: () => fabric.Object[];
  cleanup: () => void;
}

export interface ExportOptions {
  format?: 'png' | 'jpg' | 'svg';
  quality?: number;
  multiplier?: number;
  withoutTransform?: boolean;
}

export interface UseFabricCanvasReturn {
  canvasState: CanvasState;
  canvasActions: CanvasActions;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DEFAULT_GRID_OPTIONS: GridOptions = {
  enabled: true,
  size: 10,
  color: '#e5e7eb',
  opacity: 0.5,
};

const DEFAULT_RULER_OPTIONS: RulerOptions = {
  enabled: true,
  unit: 'mm',
  majorTickSize: 10,
  minorTickSize: 5,
  color: '#6b7280',
  backgroundColor: '#f9fafb',
  fontSize: 10,
};

/**
 * Professional Fabric.js canvas management hook with advanced features
 */
export function useFabricCanvas(): UseFabricCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    canvas: null,
    isInitialized: false,
    zoom: 1,
    isDragging: false,
    selectedObjects: [],
    canvasSize: { width: 100, height: 100, unit: 'mm' },
    gridOptions: DEFAULT_GRID_OPTIONS,
    rulerOptions: DEFAULT_RULER_OPTIONS,
  });

  // Initialize canvas
  const initializeCanvas = useCallback((element: HTMLCanvasElement, config: CanvasConfig) => {
    if (canvasState.canvas) {
      // Clean up existing canvas
      FabricUtils.cleanup(canvasState.canvas);
      FabricUtils.cleanupZoomAndPan(canvasState.canvas);
      canvasState.canvas.dispose();
    }

    const canvas = FabricUtils.initializeCanvas(element, config);

    // Setup zoom and pan
    FabricUtils.setupZoomAndPan(canvas);

    // Setup grid
    if (config.gridEnabled) {
      FabricUtils.createGrid(canvas, {
        enabled: config.gridEnabled,
        size: config.gridSize || DEFAULT_GRID_OPTIONS.size,
        color: config.gridColor || DEFAULT_GRID_OPTIONS.color,
        opacity: DEFAULT_GRID_OPTIONS.opacity,
      });
    }

    // Setup snap to grid
    if (config.snapToGrid) {
      FabricUtils.setupSnapToGrid(
        canvas,
        config.snapToGrid,
        config.gridSize || DEFAULT_GRID_OPTIONS.size,
        config.snapThreshold || 5
      );
    }

    // Setup rulers
    if (config.rulersEnabled && containerRef.current) {
      FabricUtils.createRulers(containerRef.current, canvas, {
        ...DEFAULT_RULER_OPTIONS,
        unit: config.unit,
      });
    }

    // Event listeners
    canvas.on('selection:created', (e) => {
      setCanvasState(prev => ({
        ...prev,
        selectedObjects: e.selected || [],
      }));
    });

    canvas.on('selection:updated', (e) => {
      setCanvasState(prev => ({
        ...prev,
        selectedObjects: e.selected || [],
      }));
    });

    canvas.on('selection:cleared', () => {
      setCanvasState(prev => ({
        ...prev,
        selectedObjects: [],
      }));
    });

    canvas.on('object:added', () => {
      // Force re-render to update state
      setCanvasState(prev => ({ ...prev }));
    });

    canvas.on('object:removed', () => {
      // Force re-render to update state
      setCanvasState(prev => ({ ...prev }));
    });

    setCanvasState(prev => ({
      ...prev,
      canvas,
      isInitialized: true,
      canvasSize: { width: config.width, height: config.height, unit: config.unit },
      gridOptions: {
        enabled: config.gridEnabled || false,
        size: config.gridSize || DEFAULT_GRID_OPTIONS.size,
        color: config.gridColor || DEFAULT_GRID_OPTIONS.color,
        opacity: DEFAULT_GRID_OPTIONS.opacity,
      },
      rulerOptions: {
        ...DEFAULT_RULER_OPTIONS,
        enabled: config.rulersEnabled || false,
        unit: config.unit,
      },
    }));
  }, [canvasState.canvas]);

  // Update canvas size
  const updateCanvasSize = useCallback((width: number, height: number, unit: CanvasUnit) => {
    if (!canvasState.canvas) return;

    FabricUtils.updateCanvasSize(canvasState.canvas, width, height, unit);

    // Update rulers if enabled
    if (canvasState.rulerOptions.enabled && containerRef.current) {
      FabricUtils.createRulers(containerRef.current, canvasState.canvas, {
        ...canvasState.rulerOptions,
        unit,
      });
    }

    // Update grid if enabled
    if (canvasState.gridOptions.enabled) {
      FabricUtils.createGrid(canvasState.canvas, canvasState.gridOptions);
    }

    setCanvasState(prev => ({
      ...prev,
      canvasSize: { width, height, unit },
      rulerOptions: { ...prev.rulerOptions, unit },
    }));
  }, [canvasState.canvas, canvasState.gridOptions, canvasState.rulerOptions]);

  // Set background color
  const setBackgroundColor = useCallback((color: string) => {
    if (!canvasState.canvas) return;

    canvasState.canvas.setBackgroundColor(color, () => {
      canvasState.canvas!.renderAll();
    });
  }, [canvasState.canvas]);

  // Toggle grid
  const toggleGrid = useCallback((enabled?: boolean) => {
    if (!canvasState.canvas) return;

    const newEnabled = enabled !== undefined ? enabled : !canvasState.gridOptions.enabled;
    const newGridOptions = { ...canvasState.gridOptions, enabled: newEnabled };

    FabricUtils.createGrid(canvasState.canvas, newGridOptions);

    setCanvasState(prev => ({
      ...prev,
      gridOptions: newGridOptions,
    }));
  }, [canvasState.canvas, canvasState.gridOptions]);

  // Update grid options
  const updateGridOptions = useCallback((options: Partial<GridOptions>) => {
    if (!canvasState.canvas) return;

    const newGridOptions = { ...canvasState.gridOptions, ...options };
    FabricUtils.createGrid(canvasState.canvas, newGridOptions);

    setCanvasState(prev => ({
      ...prev,
      gridOptions: newGridOptions,
    }));
  }, [canvasState.canvas, canvasState.gridOptions]);

  // Toggle rulers
  const toggleRulers = useCallback((enabled?: boolean) => {
    if (!canvasState.canvas || !containerRef.current) return;

    const newEnabled = enabled !== undefined ? enabled : !canvasState.rulerOptions.enabled;
    const newRulerOptions = { ...canvasState.rulerOptions, enabled: newEnabled };

    if (newEnabled) {
      FabricUtils.createRulers(containerRef.current, canvasState.canvas, newRulerOptions);
    } else {
      FabricUtils.removeRulers(containerRef.current);
    }

    setCanvasState(prev => ({
      ...prev,
      rulerOptions: newRulerOptions,
    }));
  }, [canvasState.canvas, canvasState.rulerOptions]);

  // Update ruler options
  const updateRulerOptions = useCallback((options: Partial<RulerOptions>) => {
    if (!canvasState.canvas || !containerRef.current) return;

    const newRulerOptions = { ...canvasState.rulerOptions, ...options };

    if (newRulerOptions.enabled) {
      FabricUtils.createRulers(containerRef.current, canvasState.canvas, newRulerOptions);
    }

    setCanvasState(prev => ({
      ...prev,
      rulerOptions: newRulerOptions,
    }));
  }, [canvasState.canvas, canvasState.rulerOptions]);

  // Zoom controls
  const setZoom = useCallback((zoom: number) => {
    if (!canvasState.canvas) return;

    const clampedZoom = Math.max(0.1, Math.min(5, zoom));
    canvasState.canvas.setZoom(clampedZoom);
    canvasState.canvas.renderAll();

    setCanvasState(prev => ({
      ...prev,
      zoom: clampedZoom,
    }));
  }, [canvasState.canvas]);

  const fitToScreen = useCallback(() => {
    if (!canvasState.canvas || !containerRef.current) return;

    const container = containerRef.current;
    const canvasWidth = canvasState.canvas.width!;
    const canvasHeight = canvasState.canvas.height!;
    const containerWidth = container.clientWidth - 50; // Account for rulers
    const containerHeight = container.clientHeight - 50;

    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    setZoom(scale);
    
    // Center the canvas
    const vpt = canvasState.canvas.viewportTransform!;
    vpt[4] = (containerWidth - canvasWidth * scale) / 2 + 25; // Account for ruler
    vpt[5] = (containerHeight - canvasHeight * scale) / 2 + 25;
    canvasState.canvas.requestRenderAll();
  }, [canvasState.canvas, setZoom]);

  const resetZoom = useCallback(() => setZoom(1), [setZoom]);
  const zoomIn = useCallback(() => setZoom(canvasState.zoom * 1.2), [canvasState.zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(canvasState.zoom / 1.2), [canvasState.zoom, setZoom]);

  const centerCanvas = useCallback(() => {
    if (!canvasState.canvas || !containerRef.current) return;

    const container = containerRef.current;
    const canvasWidth = canvasState.canvas.width!;
    const canvasHeight = canvasState.canvas.height!;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const vpt = canvasState.canvas.viewportTransform!;
    vpt[4] = (containerWidth - canvasWidth * canvasState.zoom) / 2;
    vpt[5] = (containerHeight - canvasHeight * canvasState.zoom) / 2;
    canvasState.canvas.requestRenderAll();
  }, [canvasState.canvas, canvasState.zoom]);

  // Object manipulation
  const addObject = useCallback((object: fabric.Object) => {
    if (!canvasState.canvas) return;

    canvasState.canvas.add(object);
    canvasState.canvas.renderAll();
  }, [canvasState.canvas]);

  const removeObject = useCallback((object: fabric.Object) => {
    if (!canvasState.canvas) return;

    canvasState.canvas.remove(object);
    canvasState.canvas.renderAll();
  }, [canvasState.canvas]);

  const removeSelectedObjects = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObjects = canvasState.canvas.getActiveObjects();
    activeObjects.forEach(obj => canvasState.canvas!.remove(obj));
    canvasState.canvas.discardActiveObject();
    canvasState.canvas.renderAll();
  }, [canvasState.canvas]);

  const selectAll = useCallback(() => {
    if (!canvasState.canvas) return;

    const objects = canvasState.canvas.getObjects().filter(obj => obj.selectable !== false);
    const selection = new fabric.ActiveSelection(objects, {
      canvas: canvasState.canvas,
    });
    canvasState.canvas.setActiveObject(selection);
    canvasState.canvas.renderAll();
  }, [canvasState.canvas]);

  const deselectAll = useCallback(() => {
    if (!canvasState.canvas) return;

    canvasState.canvas.discardActiveObject();
    canvasState.canvas.renderAll();
  }, [canvasState.canvas]);

  const duplicateSelected = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      });
      canvasState.canvas!.add(cloned);
      canvasState.canvas!.setActiveObject(cloned);
      canvasState.canvas!.renderAll();
    });
  }, [canvasState.canvas]);

  // Layer management
  const bringToFront = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (activeObject) {
      canvasState.canvas.bringToFront(activeObject);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  const sendToBack = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (activeObject) {
      canvasState.canvas.sendToBack(activeObject);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  const bringForward = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (activeObject) {
      canvasState.canvas.bringForward(activeObject);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  const sendBackward = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (activeObject) {
      canvasState.canvas.sendBackward(activeObject);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  const groupSelected = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObjects = canvasState.canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      const group = new fabric.Group(activeObjects, {
        left: 0,
        top: 0,
      });
      canvasState.canvas.remove(...activeObjects);
      canvasState.canvas.add(group);
      canvasState.canvas.setActiveObject(group);
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  const ungroupSelected = useCallback(() => {
    if (!canvasState.canvas) return;

    const activeObject = canvasState.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'group') {
      const group = activeObject as fabric.Group;
      const objects = group.getObjects();
      
      group.destroy();
      canvasState.canvas.remove(group);
      
      objects.forEach((obj: fabric.Object) => {
        canvasState.canvas!.add(obj);
      });
      
      canvasState.canvas.renderAll();
    }
  }, [canvasState.canvas]);

  // Save/Load canvas state
  const saveCanvasState = useCallback((): string => {
    if (!canvasState.canvas) return '';

    return JSON.stringify(canvasState.canvas.toJSON());
  }, [canvasState.canvas]);

  const loadCanvasState = useCallback((state: string) => {
    if (!canvasState.canvas) return;

    try {
      canvasState.canvas.loadFromJSON(state, () => {
        canvasState.canvas!.renderAll();
      });
    } catch (error) {
      console.error('Failed to load canvas state:', error);
    }
  }, [canvasState.canvas]);

  // Export canvas
  const exportCanvas = useCallback((options: ExportOptions = {}): string => {
    if (!canvasState.canvas) return '';

    const defaultOptions = {
      format: 'png' as const,
      quality: 1,
      multiplier: 1,
      withoutTransform: false,
    };

    const exportOptions = { ...defaultOptions, ...options };

    return canvasState.canvas.toDataURL({
      format: exportOptions.format,
      quality: exportOptions.quality,
      multiplier: exportOptions.multiplier,
      enableRetinaScaling: true,
    });
  }, [canvasState.canvas]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!canvasState.canvas) return;

    canvasState.canvas.clear();
    canvasState.canvas.setBackgroundColor('#ffffff', () => {
      canvasState.canvas!.renderAll();
    });

    // Recreate grid and rulers if enabled
    if (canvasState.gridOptions.enabled) {
      FabricUtils.createGrid(canvasState.canvas, canvasState.gridOptions);
    }
    if (canvasState.rulerOptions.enabled && containerRef.current) {
      FabricUtils.createRulers(containerRef.current, canvasState.canvas, canvasState.rulerOptions);
    }
  }, [canvasState.canvas, canvasState.gridOptions, canvasState.rulerOptions]);

  // Get canvas objects
  const getCanvasObjects = useCallback((): fabric.Object[] => {
    if (!canvasState.canvas) return [];

    return canvasState.canvas.getObjects().filter(obj => {
      return (obj as any).name !== 'grid'; // Exclude grid from objects
    });
  }, [canvasState.canvas]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (canvasState.canvas) {
      FabricUtils.cleanup(canvasState.canvas);
      FabricUtils.cleanupZoomAndPan(canvasState.canvas);
      canvasState.canvas.dispose();
    }
    if (containerRef.current) {
      FabricUtils.removeRulers(containerRef.current);
    }
  }, [canvasState.canvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const canvasActions: CanvasActions = {
    initializeCanvas,
    updateCanvasSize,
    setBackgroundColor,
    toggleGrid,
    updateGridOptions,
    toggleRulers,
    updateRulerOptions,
    setZoom,
    fitToScreen,
    resetZoom,
    zoomIn,
    zoomOut,
    centerCanvas,
    addObject,
    removeObject,
    removeSelectedObjects,
    selectAll,
    deselectAll,
    duplicateSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    groupSelected,
    ungroupSelected,
    saveCanvasState,
    loadCanvasState,
    exportCanvas,
    clearCanvas,
    getCanvasObjects,
    cleanup,
  };

  return {
    canvasState,
    canvasActions,
    canvasRef,
    containerRef,
  };
}

export default useFabricCanvas;
