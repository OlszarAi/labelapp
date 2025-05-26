/**
 * Element Creation Hook
 * Element creation logic
 */

import { useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { generateQRCode, QRCodeOptions } from '../lib/qr-generator';
import { generateUUID, UUIDOptions } from '../lib/uuid-generator';

export interface ElementCreationState {
  isCreating: boolean;
  lastCreatedElement: fabric.Object | null;
  error: string | null;
}

export interface QRCodeCreationOptions extends QRCodeOptions {
  size?: 'small' | 'medium' | 'large';
  customSize?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface TextCreationOptions {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique' | '';
  textDecoration?: string;
  fill?: string;
  textAlign?: 'left' | 'center' | 'right';
  template?: 'title' | 'subtitle' | 'body' | 'label' | 'custom';
}

export interface ShapeCreationOptions {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
}

export interface UseElementCreationReturn {
  state: ElementCreationState;
  createQRCode: (canvas: fabric.Canvas, text: string, options?: QRCodeCreationOptions) => Promise<fabric.Image | null>;
  createUUID: (canvas: fabric.Canvas, options?: UUIDOptions & TextCreationOptions) => fabric.Text | null;
  createText: (canvas: fabric.Canvas, options?: TextCreationOptions) => fabric.Text | null;
  createShape: (canvas: fabric.Canvas, options: ShapeCreationOptions) => fabric.Object | null;
  createImageFromFile: (canvas: fabric.Canvas, file: File) => Promise<fabric.Image | null>;
  createSVGFromString: (canvas: fabric.Canvas, svgString: string) => Promise<fabric.Object | null>;
  duplicateElement: (canvas: fabric.Canvas, element: fabric.Object) => fabric.Object | null;
  clearError: () => void;
}

export const useElementCreation = (): UseElementCreationReturn => {
  const [state, setState] = useState<ElementCreationState>({
    isCreating: false,
    lastCreatedElement: null,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setCreating = useCallback((isCreating: boolean) => {
    setState(prev => ({ ...prev, isCreating }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isCreating: false }));
  }, []);

  const setLastCreated = useCallback((element: fabric.Object) => {
    setState(prev => ({ ...prev, lastCreatedElement: element, isCreating: false }));
  }, []);

  const createQRCode = useCallback(async (
    canvas: fabric.Canvas, 
    text: string, 
    options?: QRCodeCreationOptions
  ): Promise<fabric.Image | null> => {
    if (!canvas || !text.trim()) {
      setError('Canvas or QR text is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const { size = 'medium', customSize, borderColor, borderWidth = 0, ...qrOptions } = options || {};
      
      // Determine QR code size
      let qrSize = customSize || 100;
      if (!customSize) {
        switch (size) {
          case 'small': qrSize = 80; break;
          case 'medium': qrSize = 120; break;
          case 'large': qrSize = 160; break;
        }
      }

      const qrCodeDataUrl = await generateQRCode(text, {
        width: qrSize,
        height: qrSize,
        ...qrOptions
      });

      return new Promise((resolve) => {
        fabric.Image.fromURL(qrCodeDataUrl, (img) => {
          if (!img) {
            setError('Failed to create QR code image');
            resolve(null);
            return;
          }

          // Position the QR code
          img.set({
            left: 50,
            top: 50,
            scaleX: 1,
            scaleY: 1,
          });

          // Add custom properties
          (img as any).id = `qr_${Date.now()}`;
          (img as any).elementType = 'qrcode';
          (img as any).qrData = text;
          (img as any).qrOptions = options;

          // Add border if specified
          if (borderWidth > 0 && borderColor) {
            img.set({
              stroke: borderColor,
              strokeWidth: borderWidth,
            });
          }

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          setLastCreated(img);
          resolve(img);
        });
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      setError('Failed to generate QR code');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const createUUID = useCallback((
    canvas: fabric.Canvas, 
    options?: UUIDOptions & TextCreationOptions
  ): fabric.Text | null => {
    if (!canvas) {
      setError('Canvas is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const { 
        fontFamily = 'Monaco, monospace',
        fontSize = 12,
        fontWeight = 'normal',
        fill = '#000000',
        textAlign = 'left',
        ...uuidOptions 
      } = options || {};

      const uuid = generateUUID(uuidOptions);

      const textObj = new fabric.Text(uuid, {
        left: 50,
        top: 50,
        fontFamily,
        fontSize,
        fontWeight,
        fill,
        textAlign,
      });

      // Add custom properties
      (textObj as any).id = `uuid_${Date.now()}`;
      (textObj as any).elementType = 'uuid';
      (textObj as any).uuidOptions = uuidOptions;

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();

      setLastCreated(textObj);
      return textObj;
    } catch (error) {
      console.error('Error creating UUID:', error);
      setError('Failed to generate UUID');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const createText = useCallback((
    canvas: fabric.Canvas, 
    options?: TextCreationOptions
  ): fabric.Text | null => {
    if (!canvas) {
      setError('Canvas is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const {
        text: customText,
        fontFamily = 'Arial',
        fontSize = 16,
        fontWeight = 'normal',
        fontStyle = 'normal',
        textDecoration = '',
        fill = '#000000',
        textAlign = 'left',
        template = 'custom'
      } = options || {};

      // Get template text if no custom text provided
      let finalText = customText;
      if (!finalText) {
        switch (template) {
          case 'title': finalText = 'Title'; break;
          case 'subtitle': finalText = 'Subtitle'; break;
          case 'body': finalText = 'Body text'; break;
          case 'label': finalText = 'Label'; break;
          default: finalText = 'Text'; break;
        }
      }

      const textObj = new fabric.Text(finalText, {
        left: 50,
        top: 50,
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        fill,
        textAlign,
      });

      // Add custom properties
      (textObj as any).id = `text_${Date.now()}`;
      (textObj as any).elementType = 'text';
      (textObj as any).template = template;

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();

      setLastCreated(textObj);
      return textObj;
    } catch (error) {
      console.error('Error creating text:', error);
      setError('Failed to create text');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const createShape = useCallback((
    canvas: fabric.Canvas,
    options: ShapeCreationOptions
  ): fabric.Object | null => {
    if (!canvas) {
      setError('Canvas is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const {
        type,
        width = 100,
        height = 100,
        radius = 50,
        fill = '#ff0000',
        stroke = '#000000',
        strokeWidth = 1,
        strokeDashArray = []
      } = options;

      let shape: fabric.Object;

      switch (type) {
        case 'rectangle':
          shape = new fabric.Rect({
            left: 50,
            top: 50,
            width,
            height,
            fill,
            stroke,
            strokeWidth,
            strokeDashArray
          });
          break;

        case 'circle':
          shape = new fabric.Circle({
            left: 50,
            top: 50,
            radius,
            fill,
            stroke,
            strokeWidth,
            strokeDashArray
          });
          break;

        case 'triangle':
          shape = new fabric.Triangle({
            left: 50,
            top: 50,
            width,
            height,
            fill,
            stroke,
            strokeWidth,
            strokeDashArray
          });
          break;

        case 'line':
          shape = new fabric.Line([0, 0, width, 0], {
            left: 50,
            top: 50,
            stroke,
            strokeWidth,
            strokeDashArray
          });
          break;

        case 'arrow':
          // Create arrow using path
          const arrowPath = `M 0 0 L ${width} 0 L ${width - 10} -5 M ${width} 0 L ${width - 10} 5`;
          shape = new fabric.Path(arrowPath, {
            left: 50,
            top: 50,
            fill: 'transparent',
            stroke,
            strokeWidth,
            strokeDashArray
          });
          break;

        default:
          throw new Error(`Unsupported shape type: ${type}`);
      }

      // Add custom properties
      (shape as any).id = `${type}_${Date.now()}`;
      (shape as any).elementType = 'shape';
      (shape as any).shapeType = type;

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();

      setLastCreated(shape);
      return shape;
    } catch (error) {
      console.error('Error creating shape:', error);
      setError(`Failed to create ${options.type}`);
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const createImageFromFile = useCallback(async (
    canvas: fabric.Canvas,
    file: File
  ): Promise<fabric.Image | null> => {
    if (!canvas || !file) {
      setError('Canvas or file is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          
          fabric.Image.fromURL(result, (img) => {
            if (!img) {
              setError('Failed to load image');
              resolve(null);
              return;
            }

            // Scale image to reasonable size
            const maxSize = 200;
            const scale = Math.min(maxSize / (img.width || 1), maxSize / (img.height || 1));
            
            img.set({
              left: 50,
              top: 50,
              scaleX: scale,
              scaleY: scale,
            });

            // Add custom properties
            (img as any).id = `image_${Date.now()}`;
            (img as any).elementType = 'image';
            (img as any).originalFileName = file.name;

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();

            setLastCreated(img);
            resolve(img);
          });
        };

        reader.onerror = () => {
          setError('Failed to read file');
          resolve(null);
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error creating image from file:', error);
      setError('Failed to create image');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const createSVGFromString = useCallback(async (
    canvas: fabric.Canvas,
    svgString: string
  ): Promise<fabric.Object | null> => {
    if (!canvas || !svgString.trim()) {
      setError('Canvas or SVG string is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      return new Promise((resolve) => {
        fabric.loadSVGFromString(svgString, (objects, options) => {
          if (!objects || objects.length === 0) {
            setError('Failed to parse SVG');
            resolve(null);
            return;
          }

          const svgGroup = fabric.util.groupSVGElements(objects, options);
          
          svgGroup.set({
            left: 50,
            top: 50,
          });

          // Add custom properties
          (svgGroup as any).id = `svg_${Date.now()}`;
          (svgGroup as any).elementType = 'svg';

          canvas.add(svgGroup);
          canvas.setActiveObject(svgGroup);
          canvas.renderAll();

          setLastCreated(svgGroup);
          resolve(svgGroup);
        });
      });
    } catch (error) {
      console.error('Error creating SVG:', error);
      setError('Failed to create SVG');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  const duplicateElement = useCallback((
    canvas: fabric.Canvas,
    element: fabric.Object
  ): fabric.Object | null => {
    if (!canvas || !element) {
      setError('Canvas or element is missing');
      return null;
    }

    setCreating(true);
    clearError();

    try {
      const clone = fabric.util.object.clone(element);
      clone.set({
        left: (element.left || 0) + 20,
        top: (element.top || 0) + 20,
      });

      // Update ID for the clone
      (clone as any).id = `${(element as any).elementType || 'element'}_${Date.now()}`;

      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.renderAll();

      setLastCreated(clone);
      return clone;
    } catch (error) {
      console.error('Error duplicating element:', error);
      setError('Failed to duplicate element');
      return null;
    }
  }, [setCreating, clearError, setError, setLastCreated]);

  return {
    state,
    createQRCode,
    createUUID,
    createText,
    createShape,
    createImageFromFile,
    createSVGFromString,
    duplicateElement,
    clearError,
  };
};
