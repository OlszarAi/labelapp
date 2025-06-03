// Property management hook for Fabric editor elements
// Handles real-time property updates, validation, and multi-selection

import { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { CanvasUnit } from '@/components/fabric-editor/utils/fabricUtils';

export interface CanvasProperties {
  width: number;
  height: number;
  unit: CanvasUnit;
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number;
  gridColor: string;
  rulersEnabled: boolean;
  snapToGrid: boolean;
  snapThreshold: number;
  zoom: number;
}

export interface ObjectProperties {
  // Position and transform
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  
  // Visual properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  
  // Object state
  visible: boolean;
  locked: boolean;
  selectable: boolean;
  
  // Layer management
  zIndex: number;
  
  // Aspect ratio
  aspectRatioLocked: boolean;
  originalAspectRatio: number;
}

export interface TextProperties extends ObjectProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
  textDecoration: string;
  textShadow: string;
}

export interface QRCodeProperties extends ObjectProperties {
  value: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  version: number;
  foregroundColor: string;
  backgroundColor: string;
}

export interface UUIDProperties extends ObjectProperties {
  length: number;
  format: 'default' | 'no-hyphens' | 'uppercase' | 'lowercase';
  charset: 'alphanumeric' | 'numeric' | 'alphabetic';
  value: string;
}

export interface PropertyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UseElementPropertiesOptions {
  canvas: fabric.Canvas | null;
  onPropertyChange?: (property: string, value: any, object?: fabric.Object) => void;
  onValidationError?: (errors: string[]) => void;
  enableRealTimeUpdates?: boolean;
  debounceDelay?: number;
}

export function useElementProperties({
  canvas,
  onPropertyChange,
  onValidationError,
  enableRealTimeUpdates = true,
  debounceDelay = 150,
}: UseElementPropertiesOptions) {
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [canvasProperties, setCanvasProperties] = useState<CanvasProperties>({
    width: 100,
    height: 100,
    unit: 'mm',
    backgroundColor: '#ffffff',
    gridEnabled: true,
    gridSize: 10,
    gridColor: '#e5e7eb',
    rulersEnabled: true,
    snapToGrid: true,
    snapThreshold: 5,
    zoom: 1,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  // Update selected objects when canvas selection changes
  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = (e: any) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          const selection = activeObject as fabric.ActiveSelection;
          setSelectedObjects(selection.getObjects());
        } else {
          setSelectedObjects([activeObject]);
        }
      }
    };

    const handleSelectionUpdated = handleSelectionCreated;
    
    const handleSelectionCleared = () => {
      setSelectedObjects([]);
    };

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas]);

  // Debounced property update function
  const debouncedUpdate = useCallback((fn: () => void) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (!isUpdatingRef.current) {
        fn();
      }
    }, debounceDelay);
  }, [debounceDelay]);

  // Validate property values
  const validateProperty = useCallback((property: string, value: any, objectType?: string): PropertyValidationResult => {
    const result: PropertyValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    switch (property) {
      case 'width':
      case 'height':
        if (typeof value !== 'number' || value <= 0) {
          result.isValid = false;
          result.errors.push(`${property} must be a positive number`);
        }
        if (value > 1000) {
          result.warnings.push(`${property} is very large (${value})`);
        }
        break;

      case 'opacity':
        if (typeof value !== 'number' || value < 0 || value > 1) {
          result.isValid = false;
          result.errors.push('Opacity must be between 0 and 1');
        }
        break;

      case 'angle':
        if (typeof value !== 'number') {
          result.isValid = false;
          result.errors.push('Angle must be a number');
        }
        break;

      case 'fontSize':
        if (typeof value !== 'number' || value <= 0) {
          result.isValid = false;
          result.errors.push('Font size must be a positive number');
        }
        if (value > 200) {
          result.warnings.push(`Font size is very large (${value}px)`);
        }
        break;

      case 'strokeWidth':
        if (typeof value !== 'number' || value < 0) {
          result.isValid = false;
          result.errors.push('Stroke width must be a non-negative number');
        }
        break;

      case 'fill':
      case 'stroke':
      case 'backgroundColor':
        if (typeof value !== 'string' || (!value.match(/^#[0-9A-Fa-f]{6}$/) && !value.match(/^rgba?\(/))) {
          result.isValid = false;
          result.errors.push('Invalid color format');
        }
        break;
    }

    return result;
  }, []);

  // Update canvas properties
  const updateCanvasProperty = useCallback((property: keyof CanvasProperties, value: any) => {
    if (!canvas) return;

    const validation = validateProperty(property, value);
    if (!validation.isValid) {
      onValidationError?.(validation.errors);
      return;
    }

    setCanvasProperties(prev => ({
      ...prev,
      [property]: value,
    }));

    // Apply canvas changes immediately
    switch (property) {
      case 'width':
      case 'height':
        if (property === 'width') {
          canvas.setWidth(value);
        } else {
          canvas.setHeight(value);
        }
        canvas.renderAll();
        break;

      case 'backgroundColor':
        canvas.setBackgroundColor(value, () => {
          canvas.renderAll();
        });
        break;

      case 'zoom':
        canvas.setZoom(value);
        canvas.renderAll();
        break;
    }

    onPropertyChange?.(property, value);
  }, [canvas, onPropertyChange, onValidationError, validateProperty]);

  // Update object properties
  const updateObjectProperty = useCallback((property: string, value: any, applyToAll = false) => {
    if (!canvas || selectedObjects.length === 0) return;

    const validation = validateProperty(property, value, selectedObjects[0]?.type);
    if (!validation.isValid) {
      onValidationError?.(validation.errors);
      return;
    }

    isUpdatingRef.current = true;

    const objectsToUpdate = applyToAll ? selectedObjects : [selectedObjects[0]];

    objectsToUpdate.forEach(obj => {
      switch (property) {
        case 'left':
        case 'top':
          obj.set(property, value);
          break;

        case 'width':
        case 'height':
          if (obj.type === 'i-text' || obj.type === 'text') {
            // For text objects, we need to scale instead of setting width/height directly
            const textObj = obj as fabric.Text;
            if (property === 'width') {
              const scaleX = value / (textObj.width || 1);
              textObj.set('scaleX', scaleX);
            } else {
              const scaleY = value / (textObj.height || 1);
              textObj.set('scaleY', scaleY);
            }
          } else {
            obj.set(property, value);
          }
          break;

        case 'angle':
          obj.set('angle', value);
          break;

        case 'opacity':
          obj.set('opacity', value);
          break;

        case 'fill':
        case 'stroke':
        case 'strokeWidth':
          obj.set(property, value);
          break;

        case 'visible':
          obj.set('visible', value);
          break;

        case 'locked':
          obj.set('selectable', !value);
          obj.set('evented', !value);
          break;

        // Text-specific properties
        case 'text':
          if (obj.type === 'i-text' || obj.type === 'text') {
            (obj as fabric.Text).set('text', value);
          }
          break;

        case 'fontFamily':
        case 'fontSize':
        case 'fontWeight':
        case 'fontStyle':
        case 'textAlign':
        case 'lineHeight':
        case 'charSpacing':
          if (obj.type === 'i-text' || obj.type === 'text') {
            (obj as fabric.Text).set(property, value);
          }
          break;
      }

      obj.setCoords();
    });

    if (enableRealTimeUpdates) {
      canvas.renderAll();
    }

    isUpdatingRef.current = false;
    onPropertyChange?.(property, value, selectedObjects[0]);
  }, [canvas, selectedObjects, onPropertyChange, onValidationError, validateProperty, enableRealTimeUpdates]);

  // Get current object properties
  const getObjectProperties = useCallback((): ObjectProperties | null => {
    if (selectedObjects.length === 0) return null;

    const obj = selectedObjects[0];
    const originalAspectRatio = (obj.width || 1) / (obj.height || 1);

    return {
      left: obj.left || 0,
      top: obj.top || 0,
      width: obj.width || 0,
      height: obj.height || 0,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      angle: obj.angle || 0,
      fill: obj.fill as string || '#000000',
      stroke: obj.stroke as string || '#000000',
      strokeWidth: obj.strokeWidth || 0,
      opacity: obj.opacity || 1,
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      selectable: obj.selectable !== false,
      zIndex: canvas?.getObjects().indexOf(obj) || 0,
      aspectRatioLocked: false,
      originalAspectRatio,
    };
  }, [selectedObjects, canvas]);

  // Get text properties for text objects
  const getTextProperties = useCallback((): TextProperties | null => {
    if (selectedObjects.length === 0 || !selectedObjects[0] || 
        (selectedObjects[0].type !== 'i-text' && selectedObjects[0].type !== 'text')) {
      return null;
    }

    const textObj = selectedObjects[0] as fabric.Text;
    const baseProps = getObjectProperties();
    if (!baseProps) return null;

    return {
      ...baseProps,
      text: textObj.text || '',
      fontFamily: textObj.fontFamily || 'Arial',
      fontSize: textObj.fontSize || 16,
      fontWeight: String(textObj.fontWeight) || 'normal',
      fontStyle: textObj.fontStyle || 'normal',
      textAlign: textObj.textAlign || 'left',
      lineHeight: textObj.lineHeight || 1.2,
      charSpacing: textObj.charSpacing || 0,
      textDecoration: (textObj as any).textDecoration || '',
      textShadow: textObj.shadow?.toString() || '',
    };
  }, [selectedObjects, getObjectProperties]);

  // Layer management functions
  const bringToFront = useCallback(() => {
    if (!canvas || selectedObjects.length === 0) return;
    selectedObjects.forEach(obj => canvas.bringToFront(obj));
    canvas.renderAll();
  }, [canvas, selectedObjects]);

  const sendToBack = useCallback(() => {
    if (!canvas || selectedObjects.length === 0) return;
    selectedObjects.forEach(obj => canvas.sendToBack(obj));
    canvas.renderAll();
  }, [canvas, selectedObjects]);

  const bringForward = useCallback(() => {
    if (!canvas || selectedObjects.length === 0) return;
    selectedObjects.forEach(obj => canvas.bringForward(obj));
    canvas.renderAll();
  }, [canvas, selectedObjects]);

  const sendBackward = useCallback(() => {
    if (!canvas || selectedObjects.length === 0) return;
    selectedObjects.forEach(obj => canvas.sendBackwards(obj));
    canvas.renderAll();
  }, [canvas, selectedObjects]);

  // Multi-selection property editing
  const getCommonProperty = useCallback((property: string): any => {
    if (selectedObjects.length === 0) return undefined;
    
    const firstValue = (selectedObjects[0] as any)[property];
    const allSame = selectedObjects.every(obj => (obj as any)[property] === firstValue);
    
    return allSame ? firstValue : 'mixed';
  }, [selectedObjects]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    selectedObjects,
    canvasProperties,
    
    // Property getters
    getObjectProperties,
    getTextProperties,
    getCommonProperty,
    
    // Property updaters
    updateCanvasProperty,
    updateObjectProperty,
    
    // Layer management
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    
    // Validation
    validateProperty,
    
    // Utilities
    hasSelection: selectedObjects.length > 0,
    hasMultipleSelection: selectedObjects.length > 1,
    selectedObjectTypes: selectedObjects.map(obj => obj.type || 'unknown'),
  };
}
