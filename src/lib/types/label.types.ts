/**
 * Legacy label types for backward compatibility
 * These will be gradually migrated to the new Fabric.js type system
 */

// Legacy types for existing components
export interface LabelElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode' | 'qrCode' | 'uuidText' | 'company' | 'product';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  size?: number;
  value?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
  properties: any;
}

export interface Label {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: LabelElement[];
  backgroundColor?: string;
  projectId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LabelCollection {
  [key: string]: Label;
}

export interface TextElementProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
}

export interface ImageElementProperties {
  src: string;
  alt?: string;
  opacity?: number;
}

export interface ShapeElementProperties {
  shape: 'rectangle' | 'circle' | 'triangle';
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface BarcodeElementProperties {
  value: string;
  format: string;
  displayValue?: boolean;
}

export interface QRCodeElementProperties {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}