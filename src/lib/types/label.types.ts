/**
 * Definicje typów dla etykiet
 */

export interface LabelElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'barcode' | 'qrCode' | 'uuidText' | 'company' | 'product';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number; // Changed from optional to required to match backend
  size?: number; // Legacy field, use fontSize for text elements
  value?: string;
  color?: string;
  // Text styling properties
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
  properties: any; // Changed from optional to required to match backend
}

export interface TextElementProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface ImageElementProperties {
  src: string;
  alt: string;
  objectFit: 'contain' | 'cover' | 'fill';
}

export interface ShapeElementProperties {
  shapeType: 'rectangle' | 'ellipse' | 'line';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface BarcodeElementProperties {
  barcodeType: 'qr' | 'code128' | 'code39' | 'ean13';
  value: string;
  includeText: boolean;
}

export interface Label {
  id: string;
  name: string;
  width: number; // szerokość etykiety w mm
  height: number; // wysokość etykiety w mm
  elements: LabelElement[];
  projectId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LabelTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: LabelElement[];
}

export interface LabelCollection {
  id: string;
  name: string;
  labels: Label[];
  createdAt: Date;
  updatedAt: Date;
}