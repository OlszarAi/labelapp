/**
 * Advanced Fabric Canvas Management Hook
 * Comprehensive canvas state management with all features
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { 
  CanvasState, 
  CanvasDimensions, 
  ObjectSelection, 
  GridConfiguration, 
  SnapConfiguration,
  RulerConfiguration,
  ExportOptions,
  ImportOptions
} from '../types/canvas';
import { 
  ToolType, 
  ElementType, 
  CustomObjectProps,
  ExtendedCanvas,
  WorkspaceSettings
} from '../types/fabric';
import { canvasUtils, objectUtils, gridUtils, performanceUtils } from '../lib/fabric-utils';
import { generateQRCode } from '../lib/qr-generator';
import { generateUUID } from '../lib/uuid-generator';

interface UseFabricCanvasOptions {
  // Canvas configuration
  initialWidth?: number;
  initialHeight?: number;
  backgroundColor?: string;
  
  // Grid settings
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  
  // Ruler settings
  rulersEnabled?: boolean;
  rulerUnit?: 'px' | 'mm' | 'cm' | 'in';
  
  // Zoom settings
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  
  // Performance settings
  enableRetinaScaling?: boolean;
  renderOnAddRemove?: boolean;
  stateful?: boolean;
  
  // Workspace settings
  projectId?: string;
  labelId?: string;
  readonly?: boolean;
}

interface UseFabricCanvasReturn {
  // Canvas instance and state
  canvas: fabric.Canvas | null;
  canvasState: CanvasState;
  isReady: boolean;
  
  // Dimensions and viewport
  dimensions: CanvasDimensions;
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number, point?: { x: number; y: number }) => void;
  fitToViewport: () => void;
  centerView: () => void;
  
  // Grid system
  gridConfig: GridConfiguration;
  setGridEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (enabled: boolean) => void;
  updateGridConfig: (config: Partial<GridConfiguration>) => void;
  
  // Ruler system
  rulerConfig: RulerConfiguration;
  setRulersEnabled: (enabled: boolean) => void;
  updateRulerConfig: (config: Partial<RulerConfiguration>) => void;
  getRulerMeasurements: () => { horizontal: number[]; vertical: number[] };
  
  // Object selection
  selection: ObjectSelection;
  selectObject: (objectId: string) => void;
  selectObjects: (objectIds: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => Promise<fabric.Object[]>;
  
  // Object creation methods
  createText: (text: string, options?: Partial<fabric.ITextOptions>) => Promise<fabric.Text>;
  createRectangle: (options?: Partial<fabric.IRectOptions>) => fabric.Rect;
  createCircle: (options?: Partial<fabric.ICircleOptions>) => fabric.Circle;
  createLine: (points: number[], options?: Partial<fabric.ILineOptions>) => fabric.Line;
  createQRCode: (data: string, options?: any) => Promise<fabric.Image>;
  createUUID: (options?: any) => Promise<fabric.Text>;
  addImage: (url: string, options?: Partial<fabric.IImageOptions & { shadow?: string | fabric.Shadow }>) => Promise<fabric.Image>;
  
  // Object manipulation
  bringToFront: (objectId: string) => void;
  sendToBack: (objectId: string) => void;
  bringForward: (objectId: string) => void;
  sendBackward: (objectId: string) => void;
  lockObject: (objectId: string, locked: boolean) => void;
  setObjectVisibility: (objectId: string, visible: boolean) => void;
  alignObjects: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeObjects: (distribution: 'horizontal' | 'vertical') => void;
  groupSelected: () => fabric.Group | null;
  ungroupSelected: () => fabric.Object[] | null;
  
  // Canvas serialization
  exportCanvas: (options?: ExportOptions) => string | Promise<string>;
  importCanvas: (data: string, options?: ImportOptions) => Promise<void>;
  getCanvasJSON: () => string;
  loadFromJSON: (json: string) => Promise<void>;
  
  // Canvas state management
  clearCanvas: () => void;
  setCanvasBackground: (color: string) => void;
  setCanvasMode: (mode: 'design' | 'preview' | 'readonly') => void;
  
  // Performance and utilities
  getObjectById: (id: string) => fabric.Object | null;
  getAllObjects: () => fabric.Object[];
  getObjectCount: () => number;
  getCanvasMetrics: () => any;
  
  // Initialization
  initializeCanvas: (canvasElement: HTMLCanvasElement) => void;
  
  // Event handlers
  onSelectionChanged?: (objects: fabric.Object[]) => void;
  onObjectModified?: (objects: fabric.Object[]) => void;
  onCanvasChanged?: () => void;
}

export const useFabricCanvas = (options: UseFabricCanvasOptions = {}): UseFabricCanvasReturn => {
  const {
    initialWidth = 800,
    initialHeight = 600,
    backgroundColor = '#ffffff',
    gridEnabled = true,
    gridSize = 20,
    snapToGrid = false,
    rulersEnabled = true,
    rulerUnit = 'px',
    minZoom = 0.1,
    maxZoom = 10,
    initialZoom = 1,
    enableRetinaScaling = true,
    renderOnAddRemove = true,
    stateful = true,
    projectId,
    labelId,
    readonly = false
  } = options;

  // Refs
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLCanvasElement | null>(null);
  const performanceMonitor = useRef<any>(null);

  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isLoading: true,
    hasError: false,
    isDirty: false,
    isInitialized: false,
    version: '1.0.0',
    readonly,
    objectCount: 0,
    canvasId: uuidv4(),
    projectId,
    labelId
  });

  // Dimensions state
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: initialWidth,
    height: initialHeight,
    zoom: initialZoom,
    minZoom,
    maxZoom,
    offsetX: 0,
    offsetY: 0,
    viewportTransform: [1, 0, 0, 1, 0, 0],
    visibleArea: { 
      left: 0, 
      top: 0, 
      right: initialWidth, 
      bottom: initialHeight 
    }
  });

  // Grid configuration
  const [gridConfig, setGridConfig] = useState<GridConfiguration>({
    enabled: gridEnabled,
    size: gridSize,
    subdivisions: 5,
    color: '#e5e5e5',
    opacity: 0.5,
    snapToGrid: snapToGrid,
    snapTolerance: 5,
    majorLineColor: '#cccccc',
    minorLineColor: '#e5e5e5',
    majorLineOpacity: 0.8,
    minorLineOpacity: 0.4
  });

  // Ruler configuration
  const [rulerConfig, setRulerConfig] = useState<RulerConfiguration>({
    enabled: rulersEnabled,
    units: rulerUnit,
    precision: 0,
    color: '#333333',
    backgroundColor: '#f8f9fa',
    fontSize: 10,
    tickColor: '#666666',
    majorTickLength: 12,
    minorTickLength: 6,
    labelOffset: 2
  });

  // Selection state
  const [selection, setSelection] = useState<ObjectSelection>({
    selectedObjects: [],
    selectionType: 'none',
    isMultiSelect: false,
    canMove: true,
    canResize: true,
    canRotate: true,
    canDelete: true
  });

  // Update canvas state helper
  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  // Performance optimized state updates
  const debouncedUpdateCanvasState = useCallback(
    performanceUtils.debounce(updateCanvasState, 100),
    [updateCanvasState]
  );

  // Initialize canvas
  const initializeCanvas = useCallback((canvasElement: HTMLCanvasElement) => {
    if (canvasRef.current || !canvasElement) return;

    try {
      const canvas = new fabric.Canvas(canvasElement, {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor,
        enableRetinaScaling,
        renderOnAddRemove,
        stateful,
        preserveObjectStacking: true,
        imageSmoothingEnabled: true,
        allowTouchScrolling: false,
        selection: !readonly,
        skipTargetFind: readonly,
        interactive: !readonly
      }) as ExtendedCanvas;

      // Set custom properties
      canvas.canvasId = canvasState.canvasId!;
      canvas.projectId = projectId || '';
      canvas.labelId = labelId;
      canvas.isReadOnly = readonly;
      canvas.gridSize = gridConfig.size;
      canvas.snapToGrid = gridConfig.snapToGrid;
      canvas.showGrid = gridConfig.enabled;
      canvas.units = rulerConfig.units as 'px' | 'mm' | 'cm' | 'in';
      canvas.dpi = 72;

      // Enhanced object selection styling
      fabric.Object.prototype.set({
        borderColor: '#2563eb',
        borderScaleFactor: 1,
        cornerColor: '#2563eb',
        cornerStyle: 'circle',
        cornerSize: 8,
        transparentCorners: false,
        borderOpacityWhenMoving: 0.5
      });

      // Setup canvas event listeners
      setupCanvasEvents(canvas);

      // Initialize grid if enabled
      if (gridConfig.enabled) {
        gridUtils.drawGrid(canvas, {
          enabled: true,
          size: gridConfig.size,
          color: gridConfig.color,
          opacity: gridConfig.opacity,
          style: 'lines',
          subdivisions: gridConfig.subdivisions
        });
      }

      // Setup performance monitoring
      performanceMonitor.current = performanceUtils.monitorPerformance(canvas);

      canvasRef.current = canvas;
      containerRef.current = canvasElement;

      updateCanvasState({
        isLoading: false,
        isInitialized: true,
        hasError: false
      });

    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      updateCanvasState({
        isLoading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [dimensions.width, dimensions.height, backgroundColor, enableRetinaScaling, renderOnAddRemove, stateful, readonly, canvasState.canvasId, projectId, labelId, gridConfig, rulerConfig.units]);

  // Setup canvas event listeners
  const setupCanvasEvents = useCallback((canvas: fabric.Canvas) => {
    // Selection events
    canvas.on('selection:created', (e) => {
      const objects = e.selected || [];
      updateSelection(objects);
    });

    canvas.on('selection:updated', (e) => {
      const objects = e.selected || [];
      updateSelection(objects);
    });

    canvas.on('selection:cleared', () => {
      setSelection({
        selectedObjects: [],
        selectionType: 'none',
        isMultiSelect: false,
        canMove: true,
        canResize: true,
        canRotate: true,
        canDelete: true
      });
    });

    // Object modification events
    canvas.on('object:modified', (e) => {
      if (e.target) {
        debouncedUpdateCanvasState({ isDirty: true });
      }
    });

    canvas.on('object:moving', (e) => {
      if (gridConfig.snapToGrid && e.target) {
        snapObjectToGrid(e.target);
      }
    });

    // Canvas change events
    canvas.on('object:added', () => {
      const count = canvas.getObjects().length;
      updateCanvasState({ objectCount: count, isDirty: true });
    });

    canvas.on('object:removed', () => {
      const count = canvas.getObjects().length;
      updateCanvasState({ objectCount: count, isDirty: true });
    });

    // Path created (for drawing tools)
    canvas.on('path:created', () => {
      debouncedUpdateCanvasState({ isDirty: true });
    });

  }, [gridConfig.snapToGrid, debouncedUpdateCanvasState, updateCanvasState]);

  // Update selection helper
  const updateSelection = useCallback((objects: fabric.Object[]) => {
    const objectIds = objects.map(obj => (obj as any).id || obj.get('id') || '').filter(Boolean);
    
    setSelection({
      selectedObjects: objectIds,
      activeObject: objectIds[0],
      selectionType: objectIds.length === 0 ? 'none' : 
                    objectIds.length === 1 ? 'single' : 'multiple',
      isMultiSelect: objectIds.length > 1,
      canMove: objects.every(obj => !obj.lockMovementX && !obj.lockMovementY),
      canResize: objects.every(obj => !obj.lockScalingX && !obj.lockScalingY),
      canRotate: objects.every(obj => !obj.lockRotation),
      canDelete: objects.every(obj => !(obj as any).locked)
    });
  }, []);

  // Snap object to grid
  const snapObjectToGrid = useCallback((obj: fabric.Object) => {
    if (!gridConfig.snapToGrid) return;

    const snappedLeft = Math.round((obj.left || 0) / gridConfig.size) * gridConfig.size;
    const snappedTop = Math.round((obj.top || 0) / gridConfig.size) * gridConfig.size;
    
    obj.set({
      left: snappedLeft,
      top: snappedTop
    });
    obj.setCoords();
  }, [gridConfig.snapToGrid, gridConfig.size]);

  // Canvas size management
  const setCanvasSize = useCallback((width: number, height: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.setDimensions({ width, height });
    
    setDimensions(prev => ({ ...prev, width, height }));
    
    // Update grid if enabled
    if (gridConfig.enabled) {
      gridUtils.drawGrid(canvas, {
        enabled: true,
        size: gridConfig.size,
        color: gridConfig.color,
        opacity: gridConfig.opacity
      });
    }

    debouncedUpdateCanvasState({ isDirty: true });
  }, [gridConfig, debouncedUpdateCanvasState]);

  // Zoom management
  const setZoom = useCallback((zoom: number, point?: { x: number; y: number }) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    
    if (point) {
      canvas.zoomToPoint(new fabric.Point(point.x, point.y), clampedZoom);
    } else {
      canvas.setZoom(clampedZoom);
    }
    
    setDimensions(prev => ({ ...prev, zoom: clampedZoom }));
    
    // Update grid with new zoom
    if (gridConfig.enabled) {
      gridUtils.drawGrid(canvas, {
        enabled: true,
        size: gridConfig.size * clampedZoom,
        color: gridConfig.color,
        opacity: gridConfig.opacity
      });
    }

    canvas.renderAll();
  }, [minZoom, maxZoom, gridConfig]);

  // Fit to viewport
  const fitToViewport = useCallback(() => {
    if (!canvasRef.current) return;
    canvasUtils.fitToViewport(canvasRef.current);
  }, []);

  // Center view
  const centerView = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const center = canvas.getCenter();
    canvas.absolutePan(new fabric.Point(center.left, center.top));
    canvas.renderAll();
  }, []);

  // Grid management functions
  const setGridEnabled = useCallback((enabled: boolean) => {
    setGridConfig(prev => ({ ...prev, enabled }));
    
    if (canvasRef.current) {
      if (enabled) {
        gridUtils.drawGrid(canvasRef.current, {
          enabled: true,
          size: gridConfig.size,
          color: gridConfig.color,
          opacity: gridConfig.opacity
        });
      } else {
        gridUtils.removeGrid(canvasRef.current);
      }
    }
  }, [gridConfig.size, gridConfig.color, gridConfig.opacity]);

  const setGridSize = useCallback((size: number) => {
    setGridConfig(prev => ({ ...prev, size }));
    
    if (canvasRef.current && gridConfig.enabled) {
      gridUtils.drawGrid(canvasRef.current, {
        enabled: true,
        size,
        color: gridConfig.color,
        opacity: gridConfig.opacity
      });
    }
  }, [gridConfig.enabled, gridConfig.color, gridConfig.opacity]);

  const setSnapToGrid = useCallback((enabled: boolean) => {
    setGridConfig(prev => ({ ...prev, snapToGrid: enabled }));
    
    if (canvasRef.current) {
      (canvasRef.current as ExtendedCanvas).snapToGrid = enabled;
    }
  }, []);

  const updateGridConfig = useCallback((config: Partial<GridConfiguration>) => {
    setGridConfig(prev => ({ ...prev, ...config }));
    
    if (canvasRef.current && gridConfig.enabled) {
      gridUtils.drawGrid(canvasRef.current, {
        enabled: true,
        size: config.size || gridConfig.size,
        color: config.color || gridConfig.color,
        opacity: config.opacity || gridConfig.opacity
      });
    }
  }, [gridConfig]);

  // Ruler management functions
  const setRulersEnabled = useCallback((enabled: boolean) => {
    setRulerConfig(prev => ({ ...prev, enabled }));
  }, []);

  const updateRulerConfig = useCallback((config: Partial<RulerConfiguration>) => {
    setRulerConfig(prev => ({ ...prev, ...config }));
  }, []);

  const getRulerMeasurements = useCallback(() => {
    // Implementation for ruler measurements
    const horizontalMarks: number[] = [];
    const verticalMarks: number[] = [];
    
    // Generate ruler marks based on zoom and units
    const majorStep = rulerConfig.units === 'px' ? 50 : 10;
    const minorStep = rulerConfig.units === 'px' ? 10 : 2;
    
    for (let i = 0; i <= dimensions.width; i += minorStep) {
      horizontalMarks.push(i);
    }
    
    for (let i = 0; i <= dimensions.height; i += minorStep) {
      verticalMarks.push(i);
    }
    
    return { horizontal: horizontalMarks, vertical: verticalMarks };
  }, [rulerConfig.units, dimensions.width, dimensions.height]);

  // Object selection functions
  const selectObject = useCallback((objectId: string) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      canvasRef.current.setActiveObject(obj);
      canvasRef.current.renderAll();
    }
  }, []);

  const selectObjects = useCallback((objectIds: string[]) => {
    if (!canvasRef.current) return;
    
    const objects = canvasRef.current.getObjects().filter(o => 
      objectIds.includes((o as any).id)
    );
    
    if (objects.length > 0) {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: canvasRef.current
      });
      canvasRef.current.setActiveObject(selection);
      canvasRef.current.renderAll();
    }
  }, []);

  const clearSelection = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    if (!canvasRef.current) return;
    
    const activeObjects = canvasRef.current.getActiveObjects();
    activeObjects.forEach(obj => {
      canvasRef.current!.remove(obj);
    });
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
  }, []);

  const duplicateSelected = useCallback(async (): Promise<fabric.Object[]> => {
    if (!canvasRef.current) return [];
    
    const activeObjects = canvasRef.current.getActiveObjects();
    const duplicated: fabric.Object[] = [];
    
    for (const obj of activeObjects) {
      const cloned = await new Promise<fabric.Object>((resolve) => {
        obj.clone((clonedObj: fabric.Object) => {
          clonedObj.set({
            left: (clonedObj.left || 0) + 20,
            top: (clonedObj.top || 0) + 20
          });
          (clonedObj as any).id = uuidv4();
          resolve(clonedObj);
        });
      });
      
      canvasRef.current.add(cloned);
      duplicated.push(cloned);
    }
    
    canvasRef.current.renderAll();
    return duplicated;
  }, []);

  // Object creation functions
  const createText = useCallback(async (text: string, options: Partial<fabric.ITextOptions> = {}): Promise<fabric.Text> => {
    const textObj = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
      ...options
    });
    
    (textObj as any).id = uuidv4();
    (textObj as any).elementType = ElementType.TEXT;
    
    if (canvasRef.current) {
      canvasRef.current.add(textObj);
      canvasRef.current.setActiveObject(textObj);
      canvasRef.current.renderAll();
    }
    
    return textObj;
  }, []);

  const createRectangle = useCallback((options: Partial<fabric.IRectOptions> = {}): fabric.Rect => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#ff0000',
      stroke: '#000000',
      strokeWidth: 1,
      ...options
    });
    
    (rect as any).id = uuidv4();
    (rect as any).elementType = ElementType.RECTANGLE;
    
    if (canvasRef.current) {
      canvasRef.current.add(rect);
      canvasRef.current.setActiveObject(rect);
      canvasRef.current.renderAll();
    }
    
    return rect;
  }, []);

  const createCircle = useCallback((options: Partial<fabric.ICircleOptions> = {}): fabric.Circle => {
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: '#00ff00',
      stroke: '#000000',
      strokeWidth: 1,
      ...options
    });
    
    (circle as any).id = uuidv4();
    (circle as any).elementType = ElementType.CIRCLE;
    
    if (canvasRef.current) {
      canvasRef.current.add(circle);
      canvasRef.current.setActiveObject(circle);
      canvasRef.current.renderAll();
    }
    
    return circle;
  }, []);

  const createLine = useCallback((points: number[], options: Partial<fabric.ILineOptions> = {}): fabric.Line => {
    const line = new fabric.Line(points, {
      stroke: '#000000',
      strokeWidth: 2,
      ...options
    });
    
    (line as any).id = uuidv4();
    (line as any).elementType = ElementType.LINE;
    
    if (canvasRef.current) {
      canvasRef.current.add(line);
      canvasRef.current.setActiveObject(line);
      canvasRef.current.renderAll();
    }
    
    return line;
  }, []);

  const createQRCode = useCallback(async (data: string, options: any = {}): Promise<fabric.Image> => {
    const qrCodeDataUrl = await generateQRCode(data, {
      width: options.size || 100,
      height: options.size || 100,
      ...options
    });
    
    return new Promise((resolve) => {
      fabric.Image.fromURL(qrCodeDataUrl, (img) => {
        img.set({
          left: 100,
          top: 100,
          ...options
        });
        
        (img as any).id = uuidv4();
        (img as any).elementType = ElementType.QR_CODE;
        (img as any).qrData = data;
        
        if (canvasRef.current) {
          canvasRef.current.add(img);
          canvasRef.current.setActiveObject(img);
          canvasRef.current.renderAll();
        }
        
        resolve(img);
      });
    });
  }, []);

  const createUUID = useCallback(async (options: any = {}): Promise<fabric.Text> => {
    const uuid = generateUUID(options);
    
    const textObj = new fabric.Text(uuid, {
      left: 100,
      top: 100,
      fontFamily: 'Monaco, monospace',
      fontSize: 14,
      fill: '#000000',
      ...options
    });
    
    (textObj as any).id = uuidv4();
    (textObj as any).elementType = ElementType.UUID;
    (textObj as any).uuidOptions = options;
    
    if (canvasRef.current) {
      canvasRef.current.add(textObj);
      canvasRef.current.setActiveObject(textObj);
      canvasRef.current.renderAll();
    }
    
    return textObj;
  }, []);

  const addImage = useCallback(async (url: string, options: Partial<fabric.IImageOptions & { shadow?: string | fabric.Shadow }> = {}): Promise<fabric.Image> => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, (img) => {
        if (!img) {
          reject(new Error('Failed to load image'));
          return;
        }
        
        // Handle shadow property conversion and create clean options
        const { shadow, ...cleanOptions } = options;
        const setOptions: any = {
          left: 100,
          top: 100,
          ...cleanOptions
        };
        
        if (shadow) {
          if (typeof shadow === 'string') {
            try {
              setOptions.shadow = new fabric.Shadow(shadow);
            } catch (error) {
              // If conversion fails, omit the shadow property
            }
          } else {
            setOptions.shadow = shadow;
          }
        }
        
        img.set(setOptions);
        
        (img as any).id = uuidv4();
        (img as any).elementType = ElementType.IMAGE;
        
        if (canvasRef.current) {
          canvasRef.current.add(img);
          canvasRef.current.setActiveObject(img);
          canvasRef.current.renderAll();
        }
        
        resolve(img);
      });
    });
  }, []);

  // Object manipulation functions
  const bringToFront = useCallback((objectId: string) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      canvasRef.current.bringToFront(obj);
      canvasRef.current.renderAll();
    }
  }, []);

  const sendToBack = useCallback((objectId: string) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      canvasRef.current.sendToBack(obj);
      canvasRef.current.renderAll();
    }
  }, []);

  const bringForward = useCallback((objectId: string) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      canvasRef.current.bringForward(obj);
      canvasRef.current.renderAll();
    }
  }, []);

  const sendBackward = useCallback((objectId: string) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      canvasRef.current.sendBackwards(obj);
      canvasRef.current.renderAll();
    }
  }, []);

  const lockObject = useCallback((objectId: string, locked: boolean) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      obj.set({
        lockMovementX: locked,
        lockMovementY: locked,
        lockRotation: locked,
        lockScalingX: locked,
        lockScalingY: locked,
        lockUniScaling: locked,
        selectable: !locked
      });
      (obj as any).locked = locked;
      canvasRef.current.renderAll();
    }
  }, []);

  const setObjectVisibility = useCallback((objectId: string, visible: boolean) => {
    if (!canvasRef.current) return;
    
    const obj = canvasRef.current.getObjects().find(o => (o as any).id === objectId);
    if (obj) {
      obj.set({ visible });
      canvasRef.current.renderAll();
    }
  }, []);

  const alignObjects = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!canvasRef.current) return;
    
    const activeObjects = canvasRef.current.getActiveObjects();
    if (activeObjects.length < 2) return;

    const canvasCenter = canvasRef.current.getCenter();
    
    activeObjects.forEach(obj => {
      switch (alignment) {
        case 'left':
          obj.set({ left: 0 });
          break;
        case 'center':
          obj.set({ left: canvasCenter.left - (obj.width || 0) / 2 });
          break;
        case 'right':
          obj.set({ left: canvasRef.current!.getWidth() - (obj.width || 0) });
          break;
        case 'top':
          obj.set({ top: 0 });
          break;
        case 'middle':
          obj.set({ top: canvasCenter.top - (obj.height || 0) / 2 });
          break;
        case 'bottom':
          obj.set({ top: canvasRef.current!.getHeight() - (obj.height || 0) });
          break;
      }
      obj.setCoords();
    });
    
    canvasRef.current.renderAll();
  }, []);

  const distributeObjects = useCallback((distribution: 'horizontal' | 'vertical') => {
    if (!canvasRef.current) return;
    
    const activeObjects = canvasRef.current.getActiveObjects();
    if (activeObjects.length < 3) return;

    // Sort objects by position
    const sortedObjects = [...activeObjects].sort((a, b) => {
      if (distribution === 'horizontal') {
        return (a.left || 0) - (b.left || 0);
      } else {
        return (a.top || 0) - (b.top || 0);
      }
    });

    const first = sortedObjects[0];
    const last = sortedObjects[sortedObjects.length - 1];
    
    if (distribution === 'horizontal') {
      const totalSpace = (last.left || 0) - (first.left || 0);
      const spacing = totalSpace / (sortedObjects.length - 1);
      
      sortedObjects.forEach((obj, index) => {
        if (index > 0 && index < sortedObjects.length - 1) {
          obj.set({ left: (first.left || 0) + spacing * index });
          obj.setCoords();
        }
      });
    } else {
      const totalSpace = (last.top || 0) - (first.top || 0);
      const spacing = totalSpace / (sortedObjects.length - 1);
      
      sortedObjects.forEach((obj, index) => {
        if (index > 0 && index < sortedObjects.length - 1) {
          obj.set({ top: (first.top || 0) + spacing * index });
          obj.setCoords();
        }
      });
    }
    
    canvasRef.current.renderAll();
  }, []);

  const groupSelected = useCallback((): fabric.Group | null => {
    if (!canvasRef.current) return null;
    
    const activeObjects = canvasRef.current.getActiveObjects();
    if (activeObjects.length < 2) return null;

    const group = new fabric.Group(activeObjects, {
      canvas: canvasRef.current
    });
    
    (group as any).id = uuidv4();
    (group as any).elementType = ElementType.GROUP;
    
    // Remove individual objects and add group
    activeObjects.forEach(obj => canvasRef.current!.remove(obj));
    canvasRef.current.add(group);
    canvasRef.current.setActiveObject(group);
    canvasRef.current.renderAll();
    
    return group;
  }, []);

  const ungroupSelected = useCallback((): fabric.Object[] | null => {
    if (!canvasRef.current) return null;
    
    const activeObject = canvasRef.current.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return null;

    const group = activeObject as fabric.Group;
    const objects = group.getObjects();
    
    // Remove group and add individual objects
    canvasRef.current.remove(group);
    objects.forEach(obj => {
      (obj as any).id = uuidv4();
      canvasRef.current!.add(obj);
    });
    
    canvasRef.current.renderAll();
    return objects;
  }, []);

  // Canvas serialization functions
  const exportCanvas = useCallback((options: ExportOptions = { format: 'json' }): string | Promise<string> => {
    if (!canvasRef.current) return '';
    
    const { format } = options;
    
    switch (format) {
      case 'json':
        return JSON.stringify(canvasUtils.exportToCustomJSON(canvasRef.current));
      case 'png':
      case 'jpeg':
      case 'webp':
        return canvasRef.current.toDataURL({
          format: format === 'jpeg' ? 'jpeg' : 'png',
          quality: options.quality || 1,
          width: options.width,
          height: options.height
        });
      case 'svg':
        return canvasRef.current.toSVG();
      default:
        return '';
    }
  }, []);

  const importCanvas = useCallback(async (data: string, options: ImportOptions = {}): Promise<void> => {
    if (!canvasRef.current) return;
    
    try {
      const jsonData = JSON.parse(data);
      await canvasUtils.loadFromCustomJSON(canvasRef.current, jsonData);
      updateCanvasState({ isDirty: false });
    } catch (error) {
      console.error('Failed to import canvas:', error);
      updateCanvasState({ 
        hasError: true, 
        errorMessage: 'Failed to import canvas data' 
      });
    }
  }, [updateCanvasState]);

  const getCanvasJSON = useCallback((): string => {
    if (!canvasRef.current) return '';
    return JSON.stringify(canvasUtils.exportToCustomJSON(canvasRef.current));
  }, []);

  const loadFromJSON = useCallback(async (json: string): Promise<void> => {
    await importCanvas(json);
  }, [importCanvas]);

  // Canvas state management functions
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
    canvasRef.current.renderAll();
    updateCanvasState({ isDirty: true, objectCount: 0 });
  }, [updateCanvasState]);

  const setCanvasBackground = useCallback((color: string) => {
    if (!canvasRef.current) return;
    canvasRef.current.setBackgroundColor(color, canvasRef.current.renderAll.bind(canvasRef.current));
    debouncedUpdateCanvasState({ isDirty: true });
  }, [debouncedUpdateCanvasState]);

  const setCanvasMode = useCallback((mode: 'design' | 'preview' | 'readonly') => {
    if (!canvasRef.current) return;
    
    const isReadonly = mode === 'readonly' || mode === 'preview';
    canvasRef.current.selection = !isReadonly;
    canvasRef.current.skipTargetFind = isReadonly;
    canvasRef.current.interactive = !isReadonly;
    
    updateCanvasState({ readonly: isReadonly });
  }, [updateCanvasState]);

  // Utility functions
  const getObjectById = useCallback((id: string): fabric.Object | null => {
    if (!canvasRef.current) return null;
    return canvasRef.current.getObjects().find(obj => (obj as any).id === id) || null;
  }, []);

  const getAllObjects = useCallback((): fabric.Object[] => {
    if (!canvasRef.current) return [];
    return canvasRef.current.getObjects();
  }, []);

  const getObjectCount = useCallback((): number => {
    if (!canvasRef.current) return 0;
    return canvasRef.current.getObjects().length;
  }, []);

  const getCanvasMetrics = useCallback(() => {
    if (!performanceMonitor.current) return {};
    return performanceMonitor.current.getMetrics();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceMonitor.current) {
        performanceMonitor.current.dispose();
      }
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, []);

  return {
    // Canvas instance and state
    canvas: canvasRef.current,
    canvasState,
    isReady: canvasState.isInitialized && !canvasState.isLoading,
    
    // Dimensions and viewport
    dimensions,
    setCanvasSize,
    setZoom,
    fitToViewport,
    centerView,
    
    // Grid system
    gridConfig,
    setGridEnabled,
    setGridSize,
    setSnapToGrid,
    updateGridConfig,
    
    // Ruler system
    rulerConfig,
    setRulersEnabled,
    updateRulerConfig,
    getRulerMeasurements,
    
    // Object selection
    selection,
    selectObject,
    selectObjects,
    clearSelection,
    deleteSelected,
    duplicateSelected,
    
    // Object creation methods
    createText,
    createRectangle,
    createCircle,
    createLine,
    createQRCode,
    createUUID,
    addImage,
    
    // Object manipulation
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    lockObject,
    setObjectVisibility,
    alignObjects,
    distributeObjects,
    groupSelected,
    ungroupSelected,
    
    // Canvas serialization
    exportCanvas,
    importCanvas,
    getCanvasJSON,
    loadFromJSON,
    
    // Canvas state management
    clearCanvas,
    setCanvasBackground,
    setCanvasMode,
    
    // Performance and utilities
    getObjectById,
    getAllObjects,
    getObjectCount,
    getCanvasMetrics,
    
    // Initialize function - to be called with canvas element ref
    initializeCanvas
  };
};
