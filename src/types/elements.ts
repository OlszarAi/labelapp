/**
 * Element Types
 * Custom element types (QR codes, UUIDs, etc.) with comprehensive configurations
 */

import { fabric } from 'fabric';

// Enhanced element type definitions
export type ElementType = 'text' | 'qrcode' | 'uuid' | 'barcode' | 'shape' | 'image' | 'group';

export interface BaseElementProperties {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  layer?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  modifiedAt?: string;
  
  // Constraints
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maintainAspectRatio?: boolean;
    lockMovement?: boolean;
    lockScaling?: boolean;
    lockRotation?: boolean;
  };
}

export interface TextElementProperties extends BaseElementProperties {
  type: 'text';
  text: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  color?: string;
  backgroundColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textCase?: 'normal' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Advanced text properties
  maxLength?: number;
  autoResize?: boolean;
  placeholder?: string;
  textShadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
  };
}

export interface QRCodeElementProperties extends BaseElementProperties {
  type: 'qrcode';
  data: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  quietZone?: number;
  
  // Advanced QR code properties
  logo?: {
    src: string;
    width: number;
    height: number;
    excavate: boolean;
  };
  format?: 'PNG' | 'SVG' | 'UTF8';
  moduleSize?: number;
  version?: number; // QR Code version (1-40)
  mask?: number; // Mask pattern (0-7)
  
  // Styling options
  dotType?: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
  cornerSquareType?: 'square' | 'dot' | 'extra-rounded';
  cornerDotType?: 'square' | 'dot';
  gradientType?: 'radial' | 'linear';
  gradient?: {
    type: 'radial' | 'linear';
    rotation: number;
    colorStops: Array<{
      offset: number;
      color: string;
    }>;
  };
}

export interface UUIDElementProperties extends BaseElementProperties {
  type: 'uuid';
  uuid: string;
  length?: 8 | 16 | 32 | 64;
  format?: 'uppercase' | 'lowercase';
  includeHyphens?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  
  // Advanced UUID properties
  uuidVersion?: 'v1' | 'v4' | 'custom';
  autoRegenerate?: boolean;
  regenerateInterval?: number; // in milliseconds
  prefix?: string;
  suffix?: string;
  customPattern?: string; // Pattern for custom UUIDs
  linkToQRCode?: string; // ID of linked QR code element
}

export interface BarcodeElementProperties extends BaseElementProperties {
  type: 'barcode';
  data: string;
  barcodeType: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14' | 'MSI' | 'Pharmacode' | 'Codabar';
  width?: number;
  height?: number;
  displayValue?: boolean;
  
  // Barcode styling
  lineColor?: string;
  backgroundColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top' | 'none';
  textMargin?: number;
  fontSize?: number;
  fontFamily?: string;
  margin?: number;
  
  // Advanced barcode properties
  quietZone?: number;
  includeChecksum?: boolean;
  checksumPosition?: 'right' | 'left';
}

export interface ShapeElementProperties extends BaseElementProperties {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'star' | 'polygon';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  
  // Advanced shape properties
  borderRadius?: number; // For rectangles
  startAngle?: number; // For arcs
  endAngle?: number; // For arcs
  points?: Array<{ x: number; y: number }>; // For polygons
  gradient?: {
    type: 'linear' | 'radial';
    coords: number[];
    colorStops: Array<{
      offset: number;
      color: string;
    }>;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface ImageElementProperties extends BaseElementProperties {
  type: 'image';
  src: string;
  originalSrc?: string;
  altText?: string;
  
  // Image manipulation
  filters?: fabric.IBaseFilter[];
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Image effects
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  
  // Image fitting
  fitMode?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
  alignment?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface GroupElementProperties extends BaseElementProperties {
  type: 'group';
  children: string[]; // Array of child element IDs
  groupType?: 'selection' | 'template' | 'component' | 'layer';
  
  // Group-specific properties
  clipPath?: boolean;
  isTemplate?: boolean;
  templateId?: string;
  locked?: boolean;
  
  // Layout properties for group
  layout?: {
    type: 'grid' | 'flex' | 'absolute';
    direction?: 'row' | 'column';
    spacing?: number;
    alignment?: 'start' | 'center' | 'end' | 'stretch';
    justification?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  };
}

export type ElementProperties = 
  | TextElementProperties 
  | QRCodeElementProperties 
  | UUIDElementProperties 
  | BarcodeElementProperties
  | ShapeElementProperties 
  | ImageElementProperties
  | GroupElementProperties;

// Canvas element events
export interface ElementEvent {
  type: 'created' | 'modified' | 'deleted' | 'selected' | 'deselected' | 'moved' | 'resized' | 'rotated';
  element: ElementProperties;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  
  // Change details
  changes?: {
    before: Partial<ElementProperties>;
    after: Partial<ElementProperties>;
  };
}

// Element creation options
export interface ElementCreationOptions {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  properties?: Partial<ElementProperties>;
  
  // Creation behavior
  centered?: boolean;
  snapToGrid?: boolean;
  maintainAspectRatio?: boolean;
  
  // Validation options
  validate?: boolean;
  allowOverlap?: boolean;
  maxInstances?: number;
}

// Element validation
export interface ElementValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
}

// Element templates
export interface ElementTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  properties: Partial<ElementProperties>;
  preview?: string; // Base64 image or URL
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  modifiedAt: string;
}
