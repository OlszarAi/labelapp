/**
 * Fabric.js Type Extensions
 * Extended types for Fabric.js objects and canvas
 */

import { fabric } from 'fabric';

// Extend global Fabric namespace
declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      // Custom canvas properties
      canvasId?: string;
      projectId?: string;
      isReadOnly?: boolean;
      
      // Custom methods
      exportToCustomJSON(): CustomCanvasJSON;
      loadFromCustomJSON(json: CustomCanvasJSON): Promise<void>;
      getObjectById(id: string): fabric.Object | null;
      deleteObjectById(id: string): boolean;
      moveObjectToLayer(object: fabric.Object, layer: number): void;
    }

    interface Object {
      // Custom object properties
      id?: string;
      metadata?: Record<string, any>;
      locked?: boolean;
      layer?: number;
      elementType?: ElementType;
      
      // Barcode/QR specific properties
      barcodeValue?: string;
      barcodeType?: string;
      
      // Text specific properties
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string | number;
      fontStyle?: string;
      
      // Custom methods
      toCustomJSON(): CustomObjectJSON;
      fromCustomJSON(json: CustomObjectJSON): void;
      clone(): Promise<fabric.Object>;
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
 * Custom JSON format for objects
 */
export interface CustomObjectJSON extends fabric.Object {
  id: string;
  elementType: ElementType;
  customProps: CustomObjectProps;
  fabricProps: any; // Original Fabric.js properties
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
  PATH = 'path'
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
  ZOOM = 'zoom'
}

/**
 * Canvas modes
 */
export enum CanvasMode {
  DESIGN = 'design',
  PREVIEW = 'preview',
  READONLY = 'readonly'
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
  UNGROUP = 'ungroup'
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
  type: string;
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
}
