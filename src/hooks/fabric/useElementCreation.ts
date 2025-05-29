// Hook for managing element creation in Fabric.js canvas

import { useCallback } from 'react';
import { fabric } from 'fabric';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface TextElementProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  fill: string;
  textAlign: string;
  left?: number;
  top?: number;
}

export interface QRCodeElementProperties {
  value: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  left?: number;
  top?: number;
}

export interface UUIDElementProperties {
  length: 8 | 16 | 32 | 36;
  format: 'with-hyphens' | 'without-hyphens';
  characterSet: 'alphanumeric' | 'numbers-only';
  fontFamily: string;
  fontSize: number;
  fill: string;
  left?: number;
  top?: number;
}

export interface ElementCreationActions {
  createTextElement: (canvas: fabric.Canvas, properties: TextElementProperties) => Promise<fabric.Text>;
  createQRCodeElement: (canvas: fabric.Canvas, properties: QRCodeElementProperties) => Promise<fabric.Image>;
  createUUIDElement: (canvas: fabric.Canvas, properties: UUIDElementProperties) => Promise<fabric.Text>;
  generateUUID: (length: number, format: string, characterSet: string) => string;
  validateElement: (type: string, properties: any) => boolean;
}

// Default properties for each element type
export const DEFAULT_TEXT_PROPERTIES: TextElementProperties = {
  text: 'Sample Text',
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: '',
  fill: '#000000',
  textAlign: 'left',
};

export const DEFAULT_QRCODE_PROPERTIES: QRCodeElementProperties = {
  value: 'https://example.com',
  size: 100,
  errorCorrectionLevel: 'M',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
};

export const DEFAULT_UUID_PROPERTIES: UUIDElementProperties = {
  length: 36,
  format: 'with-hyphens',
  characterSet: 'alphanumeric',
  fontFamily: 'Arial',
  fontSize: 12,
  fill: '#000000',
};

// Common font families
export const COMMON_FONTS = [
  'Arial',
  'Arial Black',
  'Helvetica',
  'Helvetica Neue',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Courier New',
  'Lucida Console',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
];

// Quick text templates
export const TEXT_TEMPLATES = [
  { name: 'Company Name', text: '[Company Name]' },
  { name: 'Product Code', text: 'SKU-0000' },
  { name: 'Date', text: new Date().toLocaleDateString() },
  { name: 'Address', text: '[Company Address]' },
  { name: 'Phone', text: '+1 (555) 123-4567' },
  { name: 'Email', text: 'info@company.com' },
  { name: 'Website', text: 'www.company.com' },
];

// QR Code templates
export const QRCODE_TEMPLATES = [
  { name: 'Website', value: 'https://www.example.com' },
  { name: 'Email', value: 'mailto:info@example.com' },
  { name: 'Phone', value: 'tel:+15551234567' },
  { name: 'Wi-Fi', value: 'WIFI:T:WPA;S:NetworkName;P:password;;' },
  { name: 'SMS', value: 'sms:+15551234567' },
  { name: 'Location', value: 'geo:37.7749,-122.4194' },
];

/**
 * Hook for managing element creation with factory functions and validation
 */
export function useElementCreation(): ElementCreationActions {
  
  // Create text element
  const createTextElement = useCallback(async (canvas: fabric.Canvas, properties: TextElementProperties): Promise<fabric.Text> => {
    const textElement = new fabric.Text(properties.text, {
      left: properties.left || 50,
      top: properties.top || 50,
      fontFamily: properties.fontFamily,
      fontSize: properties.fontSize,
      fontWeight: properties.fontWeight,
      fontStyle: properties.fontStyle,
      textDecoration: properties.textDecoration,
      fill: properties.fill,
      textAlign: properties.textAlign,
      selectable: true,
      editable: true,
    });

    canvas.add(textElement);
    canvas.setActiveObject(textElement);
    canvas.renderAll();

    return textElement;
  }, []);

  // Create QR Code element
  const createQRCodeElement = useCallback(async (canvas: fabric.Canvas, properties: QRCodeElementProperties): Promise<fabric.Image> => {
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(properties.value, {
        width: properties.size,
        margin: 1,
        color: {
          dark: properties.foregroundColor,
          light: properties.backgroundColor,
        },
        errorCorrectionLevel: properties.errorCorrectionLevel,
      });

      // Create fabric image from QR code
      return new Promise((resolve, reject) => {
        fabric.Image.fromURL(qrDataUrl, (img) => {
          if (!img) {
            reject(new Error('Failed to create QR code image'));
            return;
          }

          img.set({
            left: properties.left || 50,
            top: properties.top || 50,
            selectable: true,
            name: 'qrcode',
            qrValue: properties.value,
            qrSize: properties.size,
            qrErrorLevel: properties.errorCorrectionLevel,
            qrForegroundColor: properties.foregroundColor,
            qrBackgroundColor: properties.backgroundColor,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          resolve(img);
        }, {
          crossOrigin: 'anonymous'
        });
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }
  }, []);

  // Create UUID element
  const createUUIDElement = useCallback(async (canvas: fabric.Canvas, properties: UUIDElementProperties): Promise<fabric.Text> => {
    const uuid = generateUUID(properties.length, properties.format, properties.characterSet);
    
    const uuidElement = new fabric.Text(uuid, {
      left: properties.left || 50,
      top: properties.top || 50,
      fontFamily: properties.fontFamily,
      fontSize: properties.fontSize,
      fill: properties.fill,
      selectable: true,
      editable: false,
      name: 'uuid',
      uuidLength: properties.length,
      uuidFormat: properties.format,
      uuidCharacterSet: properties.characterSet,
    });

    canvas.add(uuidElement);
    canvas.setActiveObject(uuidElement);
    canvas.renderAll();

    return uuidElement;
  }, []);

  // Generate UUID with custom options
  const generateUUID = useCallback((length: number, format: string, characterSet: string): string => {
    let characters = '';
    
    switch (characterSet) {
      case 'alphanumeric':
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        break;
      case 'numbers-only':
        characters = '0123456789';
        break;
      default:
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    let result = '';
    
    if (length === 36 && format === 'with-hyphens') {
      // Generate standard UUID format
      return uuidv4();
    }
    
    // Generate custom length UUID
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Add hyphens if requested and length supports it
    if (format === 'with-hyphens' && length >= 8) {
      if (length === 8) {
        result = result.substring(0, 4) + '-' + result.substring(4);
      } else if (length === 16) {
        result = result.substring(0, 4) + '-' + result.substring(4, 8) + '-' + 
                result.substring(8, 12) + '-' + result.substring(12);
      } else if (length === 32) {
        result = result.substring(0, 8) + '-' + result.substring(8, 12) + '-' + 
                result.substring(12, 16) + '-' + result.substring(16, 20) + '-' + 
                result.substring(20);
      }
    }
    
    return result;
  }, []);

  // Validate element properties
  const validateElement = useCallback((type: string, properties: any): boolean => {
    switch (type) {
      case 'text':
        return !!(properties.text && properties.fontFamily && properties.fontSize > 0);
      case 'qrcode':
        return !!(properties.value && properties.size > 0);
      case 'uuid':
        return !!(properties.length && properties.format && properties.characterSet);
      default:
        return false;
    }
  }, []);

  return {
    createTextElement,
    createQRCodeElement,
    createUUIDElement,
    generateUUID,
    validateElement,
  };
}

export default useElementCreation;
