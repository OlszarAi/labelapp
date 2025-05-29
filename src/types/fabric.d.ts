// Enhanced Fabric.js type definitions for better TypeScript support

import { fabric } from 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface ICanvasOptions {
      backgroundColor?: string;
      width?: number;
      height?: number;
      selection?: boolean;
      preserveObjectStacking?: boolean;
      renderOnAddRemove?: boolean;
      skipTargetFind?: boolean;
      allowTouchScrolling?: boolean;
      imageSmoothingEnabled?: boolean;
      enableRetinaScaling?: boolean;
      devicePixelRatio?: number;
    }

    interface IObjectOptions {
      id?: string;
      name?: string;
      metadata?: Record<string, any>;
      lockMovementX?: boolean;
      lockMovementY?: boolean;
      lockRotation?: boolean;
      lockScalingX?: boolean;
      lockScalingY?: boolean;
      lockUniScaling?: boolean;
      hasControls?: boolean;
      hasBorders?: boolean;
      selectable?: boolean;
      evented?: boolean;
      visible?: boolean;
      opacity?: number;
      fill?: string | fabric.Pattern | fabric.Gradient;
      stroke?: string;
      strokeWidth?: number;
      strokeDashArray?: number[];
      shadow?: fabric.Shadow | string;
      borderColor?: string;
      borderDashArray?: number[];
      cornerColor?: string;
      cornerStyle?: string;
      cornerSize?: number;
      transparentCorners?: boolean;
      padding?: number;
    }

    interface ITextOptions extends IObjectOptions {
      text?: string;
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      fontStyle?: string;
      textAlign?: string;
      lineHeight?: number;
      charSpacing?: number;
      textBackgroundColor?: string;
      textDecoration?: string;
      underline?: boolean;
      overline?: boolean;
      linethrough?: boolean;
    }

    interface Canvas {
      toDataURL(options?: {
        format?: string;
        quality?: number;
        multiplier?: number;
        left?: number;
        top?: number;
        width?: number;
        height?: number;
        enableRetinaScaling?: boolean;
      }): string;
      
      loadFromJSON(json: string | object, callback?: () => void, reviver?: (o: any, object: fabric.Object) => void): fabric.Canvas;
      toJSON(propertiesToInclude?: string[]): object;
      
      // Enhanced methods for our editor
      setBackgroundColor(backgroundColor: string | fabric.Pattern | fabric.Gradient, callback?: () => void): fabric.Canvas;
      setDimensions(dimensions: { width: number; height: number }, options?: { backstoreOnly?: boolean; cssOnly?: boolean }): fabric.Canvas;
    }

    interface Object {
      id?: string;
      name?: string;
      metadata?: Record<string, any>;
      
      // Enhanced methods
      clone(callback?: (clone: fabric.Object) => void, propertiesToInclude?: string[]): fabric.Object;
      toObject(propertiesToInclude?: string[]): object;
      set(key: string | object, value?: any): fabric.Object;
      get(property: string): any;
    }

    // Custom object types for our editor
    interface QRCodeObject extends fabric.Object {
      qrValue?: string;
      qrSize?: number;
      qrErrorLevel?: 'L' | 'M' | 'Q' | 'H';
      qrForegroundColor?: string;
      qrBackgroundColor?: string;
    }

    interface UUIDObject extends fabric.Text {
      uuidLength?: number;
      uuidFormat?: 'with-hyphens' | 'without-hyphens';
      uuidCharSet?: 'alphanumeric' | 'numbers-only';
      autoRegenerate?: boolean;
    }
  }
}

// Export enhanced types
export interface FabricCanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  gridColor?: string;
  rulersEnabled?: boolean;
  snapToGrid?: boolean;
  snapThreshold?: number;
}

export interface FabricObjectConfig {
  type: 'text' | 'qrcode' | 'uuid' | 'rect' | 'circle' | 'image';
  properties: fabric.IObjectOptions;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface CanvasExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality?: number;
  dpi?: number;
  width?: number;
  height?: number;
  includeGrid?: boolean;
  includeRulers?: boolean;
}

export interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  thumbnail?: string;
}
