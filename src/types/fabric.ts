/**
 * Fabric.js Type Extensions
 * Extended types for Fabric.js objects and canvas with comprehensive custom properties
 */

import { fabric } from 'fabric';

// Extend global Fabric namespace
declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      // Custom canvas properties
      canvasId?: string;
      projectId?: string;
      labelId?: string;
      isReadOnly?: boolean;
      gridSize?: number;
      snapToGrid?: boolean;
      showGrid?: boolean;
      units?: 'px' | 'mm' | 'cm' | 'in';
      dpi?: number;
      backgroundColor?: string;
      
      // Custom methods
      exportToCustomJSON(): CustomCanvasJSON;
      loadFromCustomJSON(json: CustomCanvasJSON): Promise<void>;
      getObjectById(id: string): fabric.Object | null;
      deleteObjectById(id: string): boolean;
      moveObjectToLayer(object: fabric.Object, layer: number): void;
      duplicateObject(object: fabric.Object): Promise<fabric.Object>;
      centerObject(object: fabric.Object): void;
      bringObjectToFront(object: fabric.Object): void;
      sendObjectToBack(object: fabric.Object): void;
      bringObjectForward(object: fabric.Object): void;
      sendObjectBackwards(object: fabric.Object): void;
      alignObjects(alignment: AlignmentType): void;
      distributeObjects(distribution: DistributionType): void;
      groupSelectedObjects(): fabric.Group | null;
      ungroupSelectedObjects(): fabric.Object[] | null;
      lockObject(object: fabric.Object, locked: boolean): void;
      setObjectVisibility(object: fabric.Object, visible: boolean): void;
      getCanvasCenter(): { x: number; y: number };
      fitToViewport(): void;
      zoomToFit(): void;
      zoomToSelection(): void;
      clearCanvas(): void;
      exportToPNG(options?: ExportImageOptions): string;
      exportToJPEG(options?: ExportImageOptions): string;
      exportToSVG(options?: ExportSVGOptions): string;
    }

    interface Object {
      // Custom object properties
      id?: string;
      metadata?: Record<string, any>;
      locked?: boolean;
      layer?: number;
      elementType?: ElementType;
      createdAt?: string;
      modifiedAt?: string;
      
      // Label-specific properties
      labelRole?: 'title' | 'content' | 'decoration' | 'barcode' | 'qr';
      constraints?: ObjectConstraints;
      
      // Barcode/QR specific properties
      barcodeValue?: string;
      barcodeType?: BarcodeType;
      qrCodeValue?: string;
      qrCodeLevel?: 'L' | 'M' | 'Q' | 'H';
      
      // Text specific properties
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string | number;
      fontStyle?: string;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
      lineHeight?: number;
      charSpacing?: number;
      
      // Style properties
      borderRadius?: number;
      shadow?: fabric.Shadow;
      gradient?: fabric.Gradient;
      pattern?: fabric.Pattern;
      
      // Animation properties
      animationType?: AnimationType;
      animationDuration?: number;
      animationDelay?: number;
      
      // Custom methods
      toCustomJSON(): CustomObjectJSON;
      fromCustomJSON(json: CustomObjectJSON): void;
      clone(): Promise<fabric.Object>;
      serialize(): SerializedObject;
      deserialize(data: SerializedObject): void;
      validate(): ValidationResult;
      applyConstraints(): void;
      updateTimestamp(): void;
      getDisplayName(): string;
      getBoundingRect(): fabric.Rect;
      isIntersectingWith(object: fabric.Object): boolean;
      getRelativePosition(canvas: fabric.Canvas): { x: number; y: number };
    }

    interface Group {
      // Additional group properties
      groupType?: GroupType;
      isTemplate?: boolean;
      templateId?: string;
    }

    interface Text {
      // Additional text properties
      placeholder?: string;
      maxLength?: number;
      autoResize?: boolean;
      textCase?: 'normal' | 'uppercase' | 'lowercase' | 'capitalize';
    }

    interface Image {
      // Additional image properties
      originalSrc?: string;
      altText?: string;
      cropArea?: CropArea;
      filters?: fabric.IBaseFilter[];
    }
  }
}

/**
 * Extended Fabric.js Canvas interface
 */
export interface ExtendedCanvas extends fabric.Canvas {
  canvasId: string;
  projectId: string;
  isReadOnly: boolean;
  
  exportToCustomJSON(): CustomCanvasJSON;
  loadFromCustomJSON(json: CustomCanvasJSON): Promise<void>;
  getObjectById(id: string): fabric.Object | null;
  deleteObjectById(id: string): boolean;
  moveObjectToLayer(object: fabric.Object, layer: number): void;
}

/**
 * Extended Fabric.js Object interface
 */
export interface ExtendedObject extends fabric.Object {
  id: string;
  metadata?: Record<string, any>;
  locked?: boolean;
  layer?: number;
  elementType?: ElementType;
  
  toCustomJSON(): CustomObjectJSON;
  fromCustomJSON(json: CustomObjectJSON): void;
  clone(): Promise<fabric.Object>;
}

/**
 * Custom object properties for serialization
 */
export interface CustomObjectProps {
  id: string;
  metadata?: Record<string, any>;
  locked?: boolean;
  layer?: number;
  elementType?: ElementType;
  
  // Barcode/QR specific
  barcodeValue?: string;
  barcodeType?: string;
  
  // Text specific
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  
  // Position and size
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  
  // Appearance
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
}


/**
 * Custom JSON format for canvas
 */
export interface CustomCanvasJSON {
  version: string;
  canvasId: string;
  projectId: string;
  objects: CustomObjectJSON[];
  background?: string | fabric.Pattern | fabric.Gradient;
  backgroundImage?: fabric.Image;
  width: number;
  height: number;
  metadata?: Record<string, any>;
  created: string;
  modified: string;
}

/**
 * Element types for the editor
 */
export enum ElementType {
  TEXT = 'text',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  LINE = 'line',
  POLYGON = 'polygon',
  IMAGE = 'image',
  QR_CODE = 'qr_code',
  BARCODE = 'barcode',
  GROUP = 'group',
  PATH = 'path',
  FREEHAND = 'freehand',
  ARROW = 'arrow',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  STAR = 'star'
}

/**
 * Tool types for the editor
 */
export enum ToolType {
  SELECT = 'select',
  TEXT = 'text',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  LINE = 'line',
  POLYGON = 'polygon',
  IMAGE = 'image',
  QR_CODE = 'qr_code',
  BARCODE = 'barcode',
  HAND = 'hand',
  ZOOM = 'zoom',
  FREEHAND = 'freehand',
  ARROW = 'arrow',
  ERASER = 'eraser'
}

/**
 * Canvas modes
 */
export enum CanvasMode {
  DESIGN = 'design',
  PREVIEW = 'preview',
  READONLY = 'readonly',
  PRESENTATION = 'presentation'
}

/**
 * Alignment types
 */
export enum AlignmentType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom'
}

/**
 * Distribution types
 */
export enum DistributionType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  HORIZONTAL_CENTER = 'horizontal-center',
  VERTICAL_CENTER = 'vertical-center'
}

/**
 * Barcode types
 */
export enum BarcodeType {
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC = 'UPC',
  ITF14 = 'ITF14',
  MSI = 'MSI',
  Pharmacode = 'pharmacode',
  Codabar = 'codabar'
}

/**
 * Group types
 */
export enum GroupType {
  SELECTION = 'selection',
  TEMPLATE = 'template',
  COMPONENT = 'component',
  LAYER = 'layer'
}

/**
 * Animation types
 */
export enum AnimationType {
  NONE = 'none',
  FADE_IN = 'fadeIn',
  FADE_OUT = 'fadeOut',
  SLIDE_IN = 'slideIn',
  SLIDE_OUT = 'slideOut',
  BOUNCE = 'bounce',
  PULSE = 'pulse',
  ROTATE = 'rotate'
}

/**
 * History action types
 */
export enum HistoryActionType {
  ADD = 'add',
  REMOVE = 'remove',
  MODIFY = 'modify',
  MOVE = 'move',
  RESIZE = 'resize',
  ROTATE = 'rotate',
  GROUP = 'group',
  UNGROUP = 'ungroup',
  STYLE_CHANGE = 'style_change',
  TEXT_EDIT = 'text_edit',
  LAYER_CHANGE = 'layer_change',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  SHOW = 'show',
  HIDE = 'hide'
}

/**
 * Object constraints interface
 */
export interface ObjectConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  lockMovementX?: boolean;
  lockMovementY?: boolean;
  lockRotation?: boolean;
  lockScalingX?: boolean;
  lockScalingY?: boolean;
  lockUniScaling?: boolean;
  constrainToCanvas?: boolean;
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  snapTolerance?: number;
}

/**
 * Export image options
 */
export interface ExportImageOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  multiplier?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  enableRetinaScaling?: boolean;
  withoutTransform?: boolean;
  withoutShadow?: boolean;
}

/**
 * Export SVG options
 */
export interface ExportSVGOptions {
  suppressPreamble?: boolean;
  viewBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  encoding?: 'UTF-8';
  width?: number;
  height?: number;
  reviver?: (markup: string) => string;
}

/**
 * Crop area interface
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Serialized object interface
 */
export interface SerializedObject {
  id: string;
  type: string;
  elementType: ElementType;
  properties: Record<string, any>;
  customProperties: Record<string, any>;
  timestamp: string;
  version: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Extended Fabric.js Canvas interface
 */
export interface ExtendedCanvas extends fabric.Canvas {
  canvasId: string;
  projectId: string;
  labelId?: string;
  isReadOnly: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  units: 'px' | 'mm' | 'cm' | 'in';
  dpi: number;
  
  exportToCustomJSON(): CustomCanvasJSON;
  loadFromCustomJSON(json: CustomCanvasJSON): Promise<void>;
  getObjectById(id: string): fabric.Object | null;
  deleteObjectById(id: string): boolean;
  moveObjectToLayer(object: fabric.Object, layer: number): void;
  duplicateObject(object: fabric.Object): Promise<fabric.Object>;
  centerObject(object: fabric.Object): void;
  bringObjectToFront(object: fabric.Object): void;
  sendObjectToBack(object: fabric.Object): void;
  bringObjectForward(object: fabric.Object): void;
  sendObjectBackwards(object: fabric.Object): void;
  alignObjects(alignment: AlignmentType): void;
  distributeObjects(distribution: DistributionType): void;
  groupSelectedObjects(): fabric.Group | null;
  ungroupSelectedObjects(): fabric.Object[] | null;
  lockObject(object: fabric.Object, locked: boolean): void;
  setObjectVisibility(object: fabric.Object, visible: boolean): void;
  getCanvasCenter(): { x: number; y: number };
  fitToViewport(): void;
  zoomToFit(): void;
  zoomToSelection(): void;
  clearCanvas(): void;
  exportToPNG(options?: ExportImageOptions): string;
  exportToJPEG(options?: ExportImageOptions): string;
  exportToSVG(options?: ExportSVGOptions): string;
}

/**
 * Extended Fabric.js Object interface with custom properties
 */
export interface ExtendedFabricObject {
  // Core Fabric.js properties
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  visible?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Custom properties for our label editor
  id: string;
  metadata?: Record<string, any>;
  locked?: boolean;
  layer?: number;
  elementType?: ElementType;
  createdAt?: string;
  modifiedAt?: string;
  labelRole?: 'title' | 'content' | 'decoration' | 'barcode' | 'qr';
  constraints?: ObjectConstraints;
  
  // Custom methods
  toCustomJSON(): CustomObjectJSON;
  fromCustomJSON(json: CustomObjectJSON): void;
  clone(): Promise<fabric.Object>;
  serialize(): SerializedObject;
  deserialize(data: SerializedObject): void;
  validate(): ValidationResult;
  applyConstraints(): void;
  updateTimestamp(): void;
  getDisplayName(): string;
  getBoundingRect(): BoundingRect;
  isIntersectingWith(object: fabric.Object): boolean;
  getRelativePosition(canvas: fabric.Canvas): { x: number; y: number };
}

/**
 * Bounding rectangle interface
 */
export interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Custom object properties for serialization
 */
export interface CustomObjectProps {
  id: string;
  metadata?: Record<string, any>;
  locked?: boolean;
  layer?: number;
  elementType?: ElementType;
  createdAt?: string;
  modifiedAt?: string;
  labelRole?: 'title' | 'content' | 'decoration' | 'barcode' | 'qr';
  constraints?: ObjectConstraints;
  
  // Barcode/QR specific
  barcodeValue?: string;
  barcodeTypeEnum?: BarcodeType; // Use different name to avoid conflict
  qrCodeValue?: string;
  qrCodeLevel?: 'L' | 'M' | 'Q' | 'H';
  
  // Text specific
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  charSpacing?: number;
  placeholder?: string;
  maxLength?: number;
  autoResize?: boolean;
  textCase?: 'normal' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Image specific
  originalSrc?: string;
  altText?: string;
  cropArea?: CropArea;
  
  // Position and size
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  
  // Appearance
  fillColor?: string; // Use different name to avoid conflict
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  opacity?: number;
  visible?: boolean;
  borderRadius?: number;
  shadowConfig?: any; // Use any to avoid fabric.Shadow conflict
  
  // Animation
  animationType?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
}

/**
 * Custom JSON format for objects
 */
export interface CustomObjectJSON {
  id: string;
  type: string;
  elementType: ElementType;
  customProps: CustomObjectProps;
  fabricProps: Record<string, any>; // Original Fabric.js properties as plain object
  version: string;
  created: string;
  modified: string;
}

/**
 * Custom JSON format for canvas
 */
export interface CustomCanvasJSON {
  version: string;
  canvasId: string;
  projectId: string;
  labelId?: string;
  objects: CustomObjectJSON[];
  backgroundConfig?: string; // Use different name to avoid conflict
  backgroundImageConfig?: any; // Use different name to avoid conflict
  width: number;
  height: number;
  units: 'px' | 'mm' | 'cm' | 'in';
  dpi: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  metadata?: Record<string, any>;
  created: string;
  modified: string;
}

/**
 * History entry interface
 */
export interface HistoryEntry {
  id: string;
  action: HistoryActionType;
  timestamp: number;
  before?: CustomCanvasJSON;
  after?: CustomCanvasJSON;
  objectId?: string;
  description?: string;
}

/**
 * Layer information
 */
export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
  objects: string[]; // Object IDs
}

/**
 * Barcode configuration
 */
export interface BarcodeConfig {
  type: BarcodeType;
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  fontOptions?: string;
  font?: string;
  textAlign?: string;
  textPosition?: string;
  textMargin?: number;
  background?: string;
  lineColor?: string;
}

/**
 * QR Code configuration
 */
export interface QRCodeConfig {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

/**
 * Editor state interface
 */
export interface EditorState {
  activeObject: fabric.Object | null;
  selectedObjects: fabric.Object[];
  tool: ToolType;
  mode: CanvasMode;
  zoom: number;
  canvasSize: { width: number; height: number };
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
}

/**
 * Canvas settings interface
 */
export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  units: 'px' | 'mm' | 'cm' | 'in';
  dpi: number;
  zoomLimits: {
    min: number;
    max: number;
  };
  panLimits?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

/**
 * Snap settings interface
 */
export interface SnapSettings {
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToCanvas: boolean;
  snapTolerance: number;
  showSnapLines: boolean;
  snapLineColor: string;
}

/**
 * Grid settings interface
 */
export interface GridSettings {
  size: number;
  enabled: boolean;
  color: string;
  opacity: number;
  subdivisions: number;
}

/**
 * Keyboard shortcuts mapping
 */
export interface KeyboardShortcuts {
  [key: string]: {
    action: string;
    description: string;
    handler: () => void;
  };
}

/**
 * Canvas events interface
 */
export interface CanvasEvents {
  onObjectAdded?: (e: fabric.IEvent) => void;
  onObjectRemoved?: (e: fabric.IEvent) => void;
  onObjectModified?: (e: fabric.IEvent) => void;
  onSelectionCreated?: (e: fabric.IEvent) => void;
  onSelectionUpdated?: (e: fabric.IEvent) => void;
  onSelectionCleared?: (e: fabric.IEvent) => void;
  onPathCreated?: (e: fabric.IEvent) => void;
  onMouseDown?: (e: fabric.IEvent) => void;
  onMouseMove?: (e: fabric.IEvent) => void;
  onMouseUp?: (e: fabric.IEvent) => void;
  onMouseWheel?: (e: fabric.IEvent) => void;
}

/**
 * Export options for different formats
 */
export interface ExportOptions {
  format: 'json' | 'png' | 'jpeg' | 'svg' | 'pdf';
  quality?: number;
  dpi?: number;
  width?: number;
  height?: number;
  includeMetadata?: boolean;
  compression?: boolean;
  backgroundTransparent?: boolean;
}

/**
 * Import options for different formats
 */
export interface ImportOptions {
  preserveObjectIds?: boolean;
  merge?: boolean;
  position?: { x: number; y: number };
  scale?: number;
  validateObjects?: boolean;
}

/**
 * Object transformation interface
 */
export interface ObjectTransformation {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX?: number;
  skewY?: number;
}

/**
 * Canvas viewport interface
 */
export interface CanvasViewport {
  zoom: number;
  center: { x: number; y: number };
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}
