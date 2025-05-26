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
  createdAt?: string;
  modifiedAt?: string;
  
  // Barcode/QR specific
  barcodeValue?: string;
  barcodeType?: string;
  qrCodeValue?: string;
  qrCodeLevel?: 'L' | 'M' | 'Q' | 'H';
  
  // Text specific
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  placeholder?: string;
  maxLength?: number;
  autoResize?: boolean;
  textCase?: string;
  
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
  fillColor?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  opacity?: number;
  visible?: boolean;
  borderRadius?: number;
  shadowConfig?: fabric.Shadow;
  
  // Label-specific properties
  labelRole?: 'title' | 'content' | 'decoration' | 'barcode' | 'qr';
  constraints?: ObjectConstraints;
  
  // Animation properties
  animationType?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
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
  UUID = 'uuid',
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
 * Bounding rectangle interface
 */
export interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/**
 * History entry interface
 */
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: HistoryActionType;
  description: string;
  canvasData: string;
  objectId?: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

/**
 * Layer information
 */
export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
  objects: string[];
}

/**
 * Barcode configuration
 */
export interface BarcodeConfig {
  type: BarcodeType;
  value: string;
  width: number;
  height: number;
  format: {
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
  };
}

/**
 * QR Code configuration
 */
export interface QRCodeConfig {
  text: string;
  width: number;
  height: number;
  colorDark: string;
  colorLight: string;
  correctLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  format: 'PNG' | 'SVG' | 'UTF8';
}

/**
 * Canvas workspace settings
 */
export interface WorkspaceSettings {
  width: number;
  height: number;
  units: 'px' | 'mm' | 'cm' | 'in';
  dpi: number;
  backgroundColor: string;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showRulers: boolean;
  rulerUnits: 'px' | 'mm' | 'cm' | 'in';
}

/**
 * Ruler interface
 */
export interface RulerInterface {
  orientation: 'horizontal' | 'vertical';
  length: number;
  units: 'px' | 'mm' | 'cm' | 'in';
  zoom: number;
  offset: number;
  visible: boolean;
  color: string;
  backgroundColor: string;
  tickColor: string;
  labelColor: string;
  majorTickInterval: number;
  minorTickInterval: number;
}

/**
 * Grid interface
 */
export interface GridInterface {
  enabled: boolean;
  size: number;
  subdivisions: number;
  color: string;
  opacity: number;
  style: 'dots' | 'lines' | 'cross';
  snapToGrid: boolean;
  snapTolerance: number;
}
