/**
 * Utility types for ensuring compatibility between different LabelElement definitions
 * across the application.
 */

import { LabelElement as LibLabelElement } from '@/lib/types/label.types';
import { LabelElement as ApiLabelElement } from '@/services/labelStorage';

/**
 * Compatible LabelElement type that can be used when working with both
 * the strict library type and the less strict API type.
 */
export type CompatibleLabelElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  fontSize?: number;
  value?: string;
  color?: string;
  rotation?: number;
  uuidLength?: number;
  properties?: any;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
};

/**
 * Helper function to convert any LabelElement-like object to conform to the
 * library's strict LabelElement type
 */
export function toLibLabelElement(element: CompatibleLabelElement): LibLabelElement {
  // Convert generic type string to one of the allowed types
  const validType = isValidElementType(element.type) 
    ? element.type 
    : 'text';

  return {
    ...element,
    type: validType as LibLabelElement['type'],
    rotation: element.rotation || 0, // Ensure rotation is provided
    properties: element.properties || {}, // Ensure properties is provided
  };
}

/**
 * Type guard to check if a string is a valid LabelElement type
 */
function isValidElementType(type: string): boolean {
  const validTypes = [
    'text', 'image', 'shape', 'barcode', 
    'qrCode', 'uuidText', 'company', 'product'
  ];
  return validTypes.includes(type);
}
