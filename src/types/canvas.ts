/**
 * Canvas-specific Types
 * Comprehensive interfaces and types for canvas state management
 */

import { fabric } from 'fabric';
import { ElementType, ToolType, CanvasMode, HistoryActionType } from './fabric';

/**
 * Canvas state interface - tracks overall canvas state
 */
export interface CanvasState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  isDirty: boolean;
  lastSaved?: Date;
  isInitialized: boolean;
  canvasId?: string;
  projectId?: string;
  labelId?: string;
  version: string;
  readonly: boolean;
  
  // Performance tracking
  renderTime?: number;
  objectCount: number;
  memoryUsage?: number;
}

/**
 * Canvas dimensions and viewport interface
 */
export interface CanvasDimensions {
  width: number;
  height: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  offsetX: number;
  offsetY: number;
  
  // Viewport bounds
  viewportTransform: number[];
  visibleArea: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

/**
 * Canvas object selection interface
 */
export interface ObjectSelection {
  selectedObjects: string[]; // Object IDs
  activeObject?: string; // Active object ID
  selectionType: 'single' | 'multiple' | 'none';
  selectionBounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  
  // Selection properties
  isMultiSelect: boolean;
  canMove: boolean;
  canResize: boolean;
  canRotate: boolean;
  canDelete: boolean;
}

/**
 * Canvas history entry interface
 */
export interface CanvasHistoryEntry {
  id: string;
  timestamp: Date;
  action: HistoryActionType;
  description: string;
  canvasData: string; // JSON string of canvas state
  objectId?: string; // For object-specific actions
  
  // Change metadata
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  
  // User context
  userId?: string;
  sessionId?: string;
}

/**
 * Canvas export options
 */
export interface ExportOptions {
  format: 'json' | 'png' | 'jpeg' | 'svg' | 'pdf' | 'webp';
  quality?: number; // 0-1 for JPEG/WebP
  dpi?: number; // For PDF/print exports
  width?: number; // Override canvas width
  height?: number; // Override canvas height
  includeMetadata?: boolean;
  compression?: boolean;
  backgroundTransparent?: boolean; // For PNG exports
  
  // Export bounds
  bounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  
  // PDF specific options
  pdfOptions?: {
    format: 'A4' | 'A3' | 'Letter' | 'Legal' | 'custom';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

/**
 * Canvas import options
 */
export interface ImportOptions {
  preserveObjectIds?: boolean;
  merge?: boolean; // Merge with existing content or replace
  position?: { x: number; y: number }; // Position for imported content
  scale?: number; // Scale factor for imported content
  validateObjects?: boolean; // Validate objects before import
  replaceExisting?: boolean; // Replace objects with same ID
  
  // Import behavior
  centerContent?: boolean;
  fitToCanvas?: boolean;
  maintainAspectRatio?: boolean;
}

/**
 * Canvas interaction state
 */
export interface CanvasInteractionState {
  currentTool: ToolType;
  mode: CanvasMode;
  isPanning: boolean;
  isDrawing: boolean;
  isSelecting: boolean;
  isTransforming: boolean;
  
  // Mouse/touch state
  pointer: {
    x: number;
    y: number;
  };
  
  // Keyboard state
  keysPressed: Set<string>;
  
  // Drawing state
  drawingPath?: fabric.Path;
  startPoint?: { x: number; y: number };
  
  // Gesture state (for touch devices)
  gestureState?: {
    scale: number;
    rotation: number;
    center: { x: number; y: number };
  };
}

/**
 * Grid types available
 */
export type GridType = 'lines' | 'dots' | 'cross' | 'hybrid';

/**
 * Predefined grid sizes in different units
 */
export interface GridSizePreset {
  name: string;
  value: number; // In pixels
  unit: string;
  description: string;
}

/**
 * Canvas grid configuration
 */
export interface GridConfiguration {
  enabled: boolean;
  type: GridType; // Grid visual style
  size: number; // Primary grid size in pixels
  subdivisions: number; // Number of subdivisions between major lines
  
  // Visual appearance
  color: string;
  opacity: number;
  majorLineColor: string;
  minorLineColor: string;
  majorLineOpacity: number;
  minorLineOpacity: number;
  majorLineWidth: number;
  minorLineWidth: number;
  
  // Snap configuration
  snapToGrid: boolean;
  snapToSubGrid: boolean; // Snap to subdivision lines
  snapTolerance: number;
  
  // Advanced options
  adaptiveZoom: boolean; // Hide minor grid at low zoom levels
  showOrigin: boolean; // Highlight 0,0 point
  originColor: string;
  showLabels: boolean; // Show coordinate labels
  labelInterval: number; // Show labels every N grid lines
}

/**
 * Canvas snap configuration
 */
export interface SnapConfiguration {
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToCanvas: boolean;
  snapToCenter: boolean;
  snapTolerance: number;
  
  // Snap line appearance
  showSnapLines: boolean;
  snapLineColor: string;
  snapLineOpacity: number;
  snapLineDash: number[];
}

/**
 * Alignment types for object positioning
 */
export type AlignmentType = 
  | 'left' | 'center' | 'right'
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontal' | 'distribute-vertical'
  | 'align-to-canvas' | 'align-to-selection';

/**
 * Smart spacing detection result
 */
export interface SpacingInfo {
  spacing: number;
  direction: 'horizontal' | 'vertical';
  objects: fabric.Object[];
  isConsistent: boolean;
  suggestedSpacing?: number;
}

/**
 * Object alignment configuration
 */
export interface AlignmentConfiguration {
  showGuides: boolean; // Show alignment guides
  guideColor: string;
  guideOpacity: number;
  snapTolerance: number;
  
  // Smart spacing
  enableSmartSpacing: boolean;
  spacingTolerance: number;
  highlightSpacing: boolean;
  spacingColor: string;
  
  // Canvas edge alignment
  alignToCanvas: boolean;
  canvasMargin: number; // Margin from canvas edges
  
  // Distribution settings
  distributionSpacing: number;
  preserveOriginalSpacing: boolean;
}

/**
 * Canvas layer information
 */
export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number; // Z-index
  objects: string[]; // Object IDs in this layer
  
  // Layer properties
  blendMode?: string;
  clipMask?: boolean;
  parentLayer?: string; // For nested layers
  childLayers?: string[]; // Child layer IDs
}

/**
 * Canvas size presets
 */
export interface CanvasSizePreset {
  name: string;
  width: number;
  height: number;
  unit: string;
  category: 'standard' | 'print' | 'web' | 'mobile' | 'custom';
  description?: string;
}

/**
 * Background pattern types
 */
export type BackgroundPatternType = 'none' | 'dots' | 'grid' | 'diagonal' | 'crosshatch' | 'hexagon' | 'triangular';

/**
 * Canvas ruler configuration
 */
export interface RulerConfiguration {
  enabled: boolean;
  units: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  precision: number; // Decimal places
  color: string;
  backgroundColor: string;
  fontSize: number;
  
  // Ruler appearance
  tickColor: string;
  majorTickLength: number;
  minorTickLength: number;
  labelOffset: number;
  
  // Advanced features
  showGuides: boolean; // Show ruler guides
  guidesColor: string;
  guidesOpacity: number;
  snapToGuides: boolean;
  guidesTolerance: number;
  
  // Distance measurement
  enableMeasurement: boolean;
  measurementColor: string;
  measurementTextColor: string;
  measurementLineWidth: number;
  
  // Multiple unit display
  showMultipleUnits: boolean;
  secondaryUnit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
}

/**
 * Canvas performance metrics
 */
export interface CanvasPerformanceMetrics {
  renderTime: number; // Last render time in ms
  frameRate: number; // Current FPS
  objectCount: number;
  memoryUsage: number; // Estimated memory usage in MB
  
  // Performance warnings
  isSlowRendering: boolean;
  isMemoryHigh: boolean;
  recommendations?: string[];
}

/**
 * Canvas event handlers interface
 */
export interface CanvasEventHandlers {
  // Object events
  onObjectAdded?: (object: fabric.Object) => void;
  onObjectRemoved?: (object: fabric.Object) => void;
  onObjectModified?: (object: fabric.Object) => void;
  onObjectSelected?: (object: fabric.Object) => void;
  onObjectDeselected?: (object: fabric.Object) => void;
  
  // Selection events
  onSelectionCreated?: (selection: fabric.ActiveSelection) => void;
  onSelectionUpdated?: (selection: fabric.ActiveSelection) => void;
  onSelectionCleared?: () => void;
  
  // Canvas events
  onCanvasCleared?: () => void;
  onCanvasResized?: (dimensions: CanvasDimensions) => void;
  onZoomChanged?: (zoom: number) => void;
  onViewportChanged?: (viewport: CanvasDimensions) => void;
  
  // Tool events
  onToolChanged?: (tool: ToolType) => void;
  onModeChanged?: (mode: CanvasMode) => void;
  
  // Drawing events
  onDrawingStart?: (pointer: { x: number; y: number }) => void;
  onDrawingProgress?: (path: fabric.Path) => void;
  onDrawingComplete?: (path: fabric.Path) => void;
  
  // History events
  onHistoryChanged?: (canUndo: boolean, canRedo: boolean) => void;
  onSaveStateChanged?: (isDirty: boolean) => void;
  
  // Error events
  onError?: (error: Error) => void;
  onWarning?: (warning: string) => void;
}

/**
 * Canvas configuration interface
 */
export interface CanvasConfiguration {
  // Basic settings
  width: number;
  height: number;
  backgroundColor: string;
  
  // Grid and snap
  grid: GridConfiguration;
  snap: SnapConfiguration;
  ruler: RulerConfiguration;
  
  // Interaction settings
  allowSelection: boolean;
  allowMultiSelect: boolean;
  allowDrawing: boolean;
  allowPanning: boolean;
  allowZooming: boolean;
  
  // Performance settings
  renderOnAddRemove: boolean;
  stateful: boolean;
  enableRetinaScaling: boolean;
  imageSmoothingEnabled: boolean;
  
  // Touch/mobile settings
  touchEnabled: boolean;
  gestureEnabled: boolean;
  
  // Development settings
  debugMode: boolean;
  showFPS: boolean;
  showMemoryUsage: boolean;
}

/**
 * Canvas context interface for providers
 */
export interface CanvasContextValue {
  // Canvas instance and state
  canvas: fabric.Canvas | null;
  canvasState: CanvasState;
  dimensions: CanvasDimensions;
  selection: ObjectSelection;
  interaction: CanvasInteractionState;
  configuration: CanvasConfiguration;
  
  // Actions
  actions: {
    // Canvas management
    initializeCanvas: (element: HTMLCanvasElement) => void;
    disposeCanvas: () => void;
    clearCanvas: () => void;
    resizeCanvas: (width: number, height: number) => void;
    
    // Object management
    addObject: (object: fabric.Object) => void;
    removeObject: (object: fabric.Object) => void;
    updateObject: (object: fabric.Object, properties: any) => void;
    duplicateObject: (object: fabric.Object) => void;
    
    // Selection management
    selectObject: (object: fabric.Object) => void;
    selectObjects: (objects: fabric.Object[]) => void;
    deselectAll: () => void;
    
    // History management
    saveState: () => void;
    undo: () => void;
    redo: () => void;
    
    // View management
    setZoom: (zoom: number) => void;
    panTo: (x: number, y: number) => void;
    fitToViewport: () => void;
    zoomToFit: () => void;
    
    // Tool management
    setTool: (tool: ToolType) => void;
    setMode: (mode: CanvasMode) => void;
    
    // Export/Import
    exportCanvas: (options: ExportOptions) => Promise<string | Blob>;
    importCanvas: (data: string, options: ImportOptions) => Promise<void>;
  };
  
  // Event handlers
  eventHandlers: CanvasEventHandlers;
  
  // Performance metrics
  performance: CanvasPerformanceMetrics;
}
