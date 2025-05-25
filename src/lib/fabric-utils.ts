/**
 * Fabric.js Utilities
 * Comprehensive utility functions for Fabric.js operations
 */

import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import {
  ElementType,
  ToolType,
  CustomObjectJSON,
  CustomCanvasJSON,
  CustomObjectProps,
  BoundingRect,
  ObjectConstraints,
  ExportImageOptions,
  ExportSVGOptions,
  ValidationResult,
  SerializedObject,
  BarcodeConfig,
  QRCodeConfig,
  ObjectTransformation,
  CanvasViewport
} from '../types/fabric';
import {
  CanvasDimensions,
  ExportOptions,
  ImportOptions,
  GridConfiguration,
  SnapConfiguration
} from '../types/canvas';

/**
 * Canvas serialization utilities
 */
export const canvasUtils = {
  /**
   * Serialize canvas to custom JSON format
   */
  exportToCustomJSON(canvas: fabric.Canvas): CustomCanvasJSON {
    const now = new Date().toISOString();
    
    return {
      version: '1.0.0',
      canvasId: (canvas as any).canvasId || uuidv4(),
      projectId: (canvas as any).projectId || '',
      labelId: (canvas as any).labelId,
      objects: canvas.getObjects().map(obj => objectUtils.toCustomJSON(obj)),
      backgroundConfig: typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : undefined,
      backgroundImageConfig: canvas.backgroundImage ? objectUtils.serializeImage(canvas.backgroundImage as fabric.Image) : undefined,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      units: (canvas as any).units || 'px',
      dpi: (canvas as any).dpi || 72,
      gridSize: (canvas as any).gridSize || 20,
      snapToGrid: (canvas as any).snapToGrid || false,
      showGrid: (canvas as any).showGrid || false,
      metadata: (canvas as any).metadata || {},
      created: now,
      modified: now
    };
  },

  /**
   * Load canvas from custom JSON format
   */
  async loadFromCustomJSON(canvas: fabric.Canvas, json: CustomCanvasJSON): Promise<void> {
    // Clear existing objects
    canvas.clear();
    
    // Set canvas properties
    canvas.setWidth(json.width);
    canvas.setHeight(json.height);
    if (json.backgroundConfig) {
      canvas.setBackgroundColor(json.backgroundConfig, canvas.renderAll.bind(canvas));
    }
    
    // Set custom properties
    (canvas as any).canvasId = json.canvasId;
    (canvas as any).projectId = json.projectId;
    (canvas as any).labelId = json.labelId;
    (canvas as any).units = json.units;
    (canvas as any).dpi = json.dpi;
    (canvas as any).gridSize = json.gridSize;
    (canvas as any).snapToGrid = json.snapToGrid;
    (canvas as any).showGrid = json.showGrid;
    (canvas as any).metadata = json.metadata;

    // Load background image if present
    if (json.backgroundImageConfig) {
      const bgImage = await objectUtils.deserializeImage(json.backgroundImageConfig);
      canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas));
    }

    // Load objects
    for (const objData of json.objects) {
      const obj = await objectUtils.fromCustomJSON(objData);
      if (obj) {
        canvas.add(obj);
      }
    }

    canvas.renderAll();
  },

  /**
   * Clone canvas
   */
  async cloneCanvas(sourceCanvas: fabric.Canvas): Promise<fabric.Canvas> {
    const json = this.exportToCustomJSON(sourceCanvas);
    const newCanvas = new fabric.Canvas(null);
    await this.loadFromCustomJSON(newCanvas, json);
    return newCanvas;
  },

  /**
   * Clear canvas while preserving settings
   */
  clearCanvas(canvas: fabric.Canvas, preserveBackground = false): void {
    const objects = canvas.getObjects().slice();
    objects.forEach(obj => canvas.remove(obj));
    
    if (!preserveBackground) {
      canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));
      canvas.backgroundImage = undefined;
    }
    
    canvas.renderAll();
  },

  /**
   * Resize canvas with content scaling
   */
  resizeCanvas(
    canvas: fabric.Canvas, 
    newWidth: number, 
    newHeight: number, 
    scaleContent = false
  ): void {
    const oldWidth = canvas.getWidth();
    const oldHeight = canvas.getHeight();
    
    if (scaleContent && oldWidth > 0 && oldHeight > 0) {
      const scaleX = newWidth / oldWidth;
      const scaleY = newHeight / oldHeight;
      
      canvas.getObjects().forEach(obj => {
        obj.scaleX = (obj.scaleX || 1) * scaleX;
        obj.scaleY = (obj.scaleY || 1) * scaleY;
        obj.left = (obj.left || 0) * scaleX;
        obj.top = (obj.top || 0) * scaleY;
        obj.setCoords();
      });
    }
    
    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    canvas.renderAll();
  },

  /**
   * Get canvas center point
   */
  getCanvasCenter(canvas: fabric.Canvas): { x: number; y: number } {
    return {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2
    };
  },

  /**
   * Fit canvas to viewport
   */
  fitToViewport(canvas: fabric.Canvas): void {
    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    const group = new fabric.Group(objects, { excludeFromExport: true });
    const groupBounds = group.getBoundingRect();
    
    // Ensure bounds are valid
    if (!groupBounds.width || !groupBounds.height) return;
    
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const scaleX = canvasWidth / groupBounds.width;
    const scaleY = canvasHeight / groupBounds.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin
    
    canvas.setZoom(scale);
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const groupCenterX = (groupBounds.left || 0) + groupBounds.width / 2;
    const groupCenterY = (groupBounds.top || 0) + groupBounds.height / 2;
    
    canvas.absolutePan({
      x: centerX - groupCenterX * scale,
      y: centerY - groupCenterY * scale
    });
    
    // Clean up the temporary group
    objects.forEach(obj => canvas.add(obj));
    canvas.renderAll();
  }
};

/**
 * Object manipulation utilities
 */
export const objectUtils = {
  /**
   * Generate unique ID for objects
   */
  generateId(): string {
    return uuidv4();
  },

  /**
   * Convert Fabric object to custom JSON
   */
  toCustomJSON(obj: fabric.Object): CustomObjectJSON {
    const now = new Date().toISOString();
    
    const customProps: CustomObjectProps = {
      id: (obj as any).id || this.generateId(),
      metadata: (obj as any).metadata,
      locked: (obj as any).locked,
      layer: (obj as any).layer,
      elementType: (obj as any).elementType || this.getElementTypeFromObject(obj),
      createdAt: (obj as any).createdAt || now,
      modifiedAt: now,
      labelRole: (obj as any).labelRole,
      constraints: (obj as any).constraints,
      barcodeValue: (obj as any).barcodeValue,
      barcodeTypeEnum: (obj as any).barcodeType,
      qrCodeValue: (obj as any).qrCodeValue,
      qrCodeLevel: (obj as any).qrCodeLevel,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: (obj as any).textAlign,
      lineHeight: (obj as any).lineHeight,
      charSpacing: (obj as any).charSpacing,
      placeholder: (obj as any).placeholder,
      maxLength: (obj as any).maxLength,
      autoResize: (obj as any).autoResize,
      textCase: (obj as any).textCase,
      originalSrc: (obj as any).originalSrc,
      altText: (obj as any).altText,
      cropArea: (obj as any).cropArea,
      left: obj.left,
      top: obj.top,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      fillColor: obj.fill as string,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      strokeDashArray: obj.strokeDashArray,
      opacity: obj.opacity,
      visible: obj.visible,
      borderRadius: (obj as any).borderRadius,
      shadowConfig: obj.shadow,
      animationType: (obj as any).animationType,
      animationDuration: (obj as any).animationDuration,
      animationDelay: (obj as any).animationDelay
    };

    return {
      id: customProps.id,
      type: obj.type || 'object',
      elementType: customProps.elementType!,
      customProps,
      fabricProps: obj.toObject(),
      version: '1.0.0',
      created: customProps.createdAt!,
      modified: customProps.modifiedAt!
    };
  },

  /**
   * Create Fabric object from custom JSON
   */
  async fromCustomJSON(json: CustomObjectJSON): Promise<fabric.Object | null> {
    try {
      let obj: fabric.Object;

      // Create object based on type
      switch (json.elementType) {
        case ElementType.TEXT:
          obj = new fabric.Text(json.fabricProps.text || 'Text', json.fabricProps);
          break;
        case ElementType.RECTANGLE:
          obj = new fabric.Rect(json.fabricProps);
          break;
        case ElementType.CIRCLE:
          obj = new fabric.Circle(json.fabricProps);
          break;
        case ElementType.ELLIPSE:
          obj = new fabric.Ellipse(json.fabricProps);
          break;
        case ElementType.LINE:
          obj = new fabric.Line([0, 0, 100, 100], json.fabricProps);
          break;
        case ElementType.IMAGE:
          obj = await this.createImageFromJSON(json);
          break;
        case ElementType.GROUP:
          obj = await this.createGroupFromJSON(json);
          break;
        default:
          console.warn(`Unknown element type: ${json.elementType}`);
          return null;
      }

      // Apply custom properties
      this.applyCustomProperties(obj, json.customProps);
      
      return obj;
    } catch (error) {
      console.error('Error creating object from JSON:', error);
      return null;
    }
  },

  /**
   * Apply custom properties to object
   */
  applyCustomProperties(obj: fabric.Object, props: CustomObjectProps): void {
    Object.keys(props).forEach(key => {
      if (props[key as keyof CustomObjectProps] !== undefined) {
        (obj as any)[key] = props[key as keyof CustomObjectProps];
      }
    });
    
    // Set position and transformation
    if (props.left !== undefined) obj.set('left', props.left);
    if (props.top !== undefined) obj.set('top', props.top);
    if (props.scaleX !== undefined) obj.set('scaleX', props.scaleX);
    if (props.scaleY !== undefined) obj.set('scaleY', props.scaleY);
    if (props.angle !== undefined) obj.set('angle', props.angle);
    
    obj.setCoords();
  },

  /**
   * Get element type from Fabric object
   */
  getElementTypeFromObject(obj: fabric.Object): ElementType {
    if (obj instanceof fabric.Text) return ElementType.TEXT;
    if (obj instanceof fabric.Rect) return ElementType.RECTANGLE;
    if (obj instanceof fabric.Circle) return ElementType.CIRCLE;
    if (obj instanceof fabric.Ellipse) return ElementType.ELLIPSE;
    if (obj instanceof fabric.Line) return ElementType.LINE;
    if (obj instanceof fabric.Image) return ElementType.IMAGE;
    if (obj instanceof fabric.Group) return ElementType.GROUP;
    if (obj instanceof fabric.Path) return ElementType.PATH;
    return ElementType.RECTANGLE; // Default fallback
  },

  /**
   * Create image object from JSON
   */
  async createImageFromJSON(json: CustomObjectJSON): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      const imgSrc = json.customProps.originalSrc || json.fabricProps.src;
      fabric.Image.fromURL(imgSrc, (img) => {
        if (img) {
          img.set(json.fabricProps);
          resolve(img);
        } else {
          reject(new Error('Failed to load image'));
        }
      });
    });
  },

  /**
   * Create group object from JSON
   */
  async createGroupFromJSON(json: CustomObjectJSON): Promise<fabric.Group> {
    // This would need to be implemented based on how groups are serialized
    // For now, return an empty group
    return new fabric.Group([], json.fabricProps);
  },

  /**
   * Serialize image for storage
   */
  serializeImage(img: fabric.Image): any {
    return {
      src: (img as any)._originalElement?.src || (img as any).src,
      ...img.toObject()
    };
  },

  /**
   * Deserialize image from storage
   */
  async deserializeImage(data: any): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(data.src, (img) => {
        if (img) {
          img.set(data);
          resolve(img);
        } else {
          reject(new Error('Failed to deserialize image'));
        }
      });
    });
  },

  /**
   * Clone object
   */
  async cloneObject(obj: fabric.Object): Promise<fabric.Object> {
    return new Promise((resolve) => {
      obj.clone((cloned: fabric.Object) => {
        // Generate new ID for cloned object
        (cloned as any).id = this.generateId();
        (cloned as any).createdAt = new Date().toISOString();
        (cloned as any).modifiedAt = new Date().toISOString();
        
        // Offset position slightly
        cloned.set({
          left: (cloned.left || 0) + 10,
          top: (cloned.top || 0) + 10
        });
        
        resolve(cloned);
      });
    });
  },

  /**
   * Validate object
   */
  validateObject(obj: fabric.Object): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check required properties
    if (!(obj as any).id) {
      errors.push({
        field: 'id',
        message: 'Object must have a unique ID',
        severity: 'error'
      });
    }

    // Check bounds
    if (obj.left && obj.left < 0) {
      warnings.push({
        field: 'left',
        message: 'Object is positioned outside canvas bounds',
        suggestion: 'Move object to visible area'
      });
    }

    // Check dimensions
    if (obj.width && obj.width <= 0) {
      errors.push({
        field: 'width',
        message: 'Object width must be greater than 0',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Apply constraints to object
   */
  applyConstraints(obj: fabric.Object, constraints: ObjectConstraints): void {
    if (!constraints) return;

    // Apply size constraints
    if (constraints.minWidth && obj.width && obj.width < constraints.minWidth) {
      obj.set('width', constraints.minWidth);
    }
    if (constraints.maxWidth && obj.width && obj.width > constraints.maxWidth) {
      obj.set('width', constraints.maxWidth);
    }
    if (constraints.minHeight && obj.height && obj.height < constraints.minHeight) {
      obj.set('height', constraints.minHeight);
    }
    if (constraints.maxHeight && obj.height && obj.height > constraints.maxHeight) {
      obj.set('height', constraints.maxHeight);
    }

    // Apply movement constraints
    obj.set({
      lockMovementX: constraints.lockMovementX || false,
      lockMovementY: constraints.lockMovementY || false,
      lockRotation: constraints.lockRotation || false,
      lockScalingX: constraints.lockScalingX || false,
      lockScalingY: constraints.lockScalingY || false,
      lockUniScaling: constraints.lockUniScaling || false
    });

    obj.setCoords();
  },

  /**
   * Get object display name
   */
  getDisplayName(obj: fabric.Object): string {
    if ((obj as any).name) return (obj as any).name;
    
    const elementType = (obj as any).elementType || this.getElementTypeFromObject(obj);
    const id = (obj as any).id || 'unnamed';
    
    switch (elementType) {
      case ElementType.TEXT:
        const text = (obj as fabric.Text).text;
        return text && text.length > 20 ? `${text.substring(0, 20)}...` : text || 'Text';
      case ElementType.IMAGE:
        return 'Image';
      default:
        return `${elementType} ${id.substring(0, 8)}`;
    }
  }
};

/**
 * Coordinate transformation utilities
 */
export const coordinateUtils = {
  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvas: fabric.Canvas, point: { x: number; y: number }): { x: number; y: number } {
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    
    return {
      x: point.x * zoom + (vpt ? vpt[4] : 0),
      y: point.y * zoom + (vpt ? vpt[5] : 0)
    };
  },

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(canvas: fabric.Canvas, point: { x: number; y: number }): { x: number; y: number } {
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    
    return {
      x: (point.x - (vpt ? vpt[4] : 0)) / zoom,
      y: (point.y - (vpt ? vpt[5] : 0)) / zoom
    };
  },

  /**
   * Get object bounds in canvas coordinates
   */
  getObjectBounds(obj: fabric.Object): BoundingRect {
    const bounds = obj.getBoundingRect();
    return {
      left: bounds.left || 0,
      top: bounds.top || 0,
      width: bounds.width || 0,
      height: bounds.height || 0
    };
  },

  /**
   * Check if point is inside object
   */
  isPointInsideObject(obj: fabric.Object, point: { x: number; y: number }): boolean {
    const bounds = this.getObjectBounds(obj);
    return point.x >= bounds.left && 
           point.x <= bounds.left + bounds.width &&
           point.y >= bounds.top && 
           point.y <= bounds.top + bounds.height;
  },

  /**
   * Calculate distance between two points
   */
  distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate angle between two points
   */
  angle(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  },

  /**
   * Rotate point around center
   */
  rotatePoint(
    point: { x: number; y: number }, 
    center: { x: number; y: number }, 
    angle: number
  ): { x: number; y: number } {
    const cos = Math.cos(angle * Math.PI / 180);
    const sin = Math.sin(angle * Math.PI / 180);
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  },

  /**
   * Snap point to grid
   */
  snapToGrid(point: { x: number; y: number }, gridSize: number): { x: number; y: number } {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  },

  /**
   * Snap point to object edges
   */
  snapToObjects(
    point: { x: number; y: number }, 
    objects: fabric.Object[], 
    tolerance = 5
  ): { x: number; y: number } {
    let snappedPoint = { ...point };
    
    for (const obj of objects) {
      const bounds = this.getObjectBounds(obj);
      
      // Snap to left edge
      if (Math.abs(point.x - bounds.left) <= tolerance) {
        snappedPoint.x = bounds.left;
      }
      // Snap to right edge
      if (Math.abs(point.x - (bounds.left + bounds.width)) <= tolerance) {
        snappedPoint.x = bounds.left + bounds.width;
      }
      // Snap to top edge
      if (Math.abs(point.y - bounds.top) <= tolerance) {
        snappedPoint.y = bounds.top;
      }
      // Snap to bottom edge
      if (Math.abs(point.y - (bounds.top + bounds.height)) <= tolerance) {
        snappedPoint.y = bounds.top + bounds.height;
      }
    }
    
    return snappedPoint;
  }
};

/**
 * Export/Import utilities
 */
export const exportUtils = {
  /**
   * Export canvas as PNG
   */
  exportToPNG(canvas: fabric.Canvas, options: ExportImageOptions = {}): string {
    return canvas.toDataURL({
      format: 'png',
      quality: options.quality || 1,
      multiplier: options.multiplier || 1,
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
      enableRetinaScaling: options.enableRetinaScaling !== false,
      withoutTransform: options.withoutTransform || false,
      withoutShadow: options.withoutShadow || false
    });
  },

  /**
   * Export canvas as JPEG
   */
  exportToJPEG(canvas: fabric.Canvas, options: ExportImageOptions = {}): string {
    return canvas.toDataURL({
      format: 'jpeg',
      quality: options.quality || 0.8,
      multiplier: options.multiplier || 1,
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
      enableRetinaScaling: options.enableRetinaScaling !== false,
      withoutTransform: options.withoutTransform || false
    });
  },

  /**
   * Export canvas as SVG
   */
  exportToSVG(canvas: fabric.Canvas, options: ExportSVGOptions = {}): string {
    return canvas.toSVG({
      suppressPreamble: options.suppressPreamble || false,
      viewBox: options.viewBox,
      encoding: options.encoding || 'UTF-8',
      width: options.width,
      height: options.height
    });
  },

  /**
   * Export canvas as JSON
   */
  exportToJSON(canvas: fabric.Canvas): string {
    const customJSON = canvasUtils.exportToCustomJSON(canvas);
    return JSON.stringify(customJSON, null, 2);
  },

  /**
   * Import from JSON
   */
  async importFromJSON(canvas: fabric.Canvas, jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString) as CustomCanvasJSON;
      await canvasUtils.loadFromCustomJSON(canvas, data);
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error}`);
    }
  },

  /**
   * Download file
   */
  downloadFile(content: string | Blob, filename: string, mimeType = 'application/octet-stream'): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  },

  /**
   * Convert canvas to blob
   */
  canvasToBlob(canvas: fabric.Canvas, options: ExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const dataURL = canvas.toDataURL({
        format: options.format === 'jpeg' ? 'jpeg' : 'png',
        quality: options.quality || 1,
        multiplier: options.dpi ? options.dpi / 72 : 1,
        width: options.width,
        height: options.height
      });
      
      // Convert data URL to blob
      fetch(dataURL)
        .then(res => res.blob())
        .then(resolve)
        .catch(reject);
    });
  }
};

/**
 * Grid and snap utilities
 */
export const gridUtils = {
  /**
   * Draw grid on canvas
   */
  drawGrid(canvas: fabric.Canvas, config: GridConfiguration): void {
    if (!config.enabled) return;

    const width = canvas.getWidth();
    const height = canvas.getHeight();
    const { size, color, opacity, subdivisions } = config;

    // Create grid pattern
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d')!;
    
    patternCanvas.width = size;
    patternCanvas.height = size;
    
    patternCtx.strokeStyle = color;
    patternCtx.globalAlpha = opacity;
    patternCtx.lineWidth = 1;
    
    // Draw grid lines
    patternCtx.beginPath();
    patternCtx.moveTo(0, 0);
    patternCtx.lineTo(size, 0);
    patternCtx.moveTo(0, 0);
    patternCtx.lineTo(0, size);
    patternCtx.stroke();
    
    // Draw subdivisions if specified
    if (subdivisions > 1) {
      const subSize = size / subdivisions;
      patternCtx.globalAlpha = opacity * 0.5;
      patternCtx.lineWidth = 0.5;
      
      for (let i = 1; i < subdivisions; i++) {
        patternCtx.beginPath();
        patternCtx.moveTo(i * subSize, 0);
        patternCtx.lineTo(i * subSize, size);
        patternCtx.moveTo(0, i * subSize);
        patternCtx.lineTo(size, i * subSize);
        patternCtx.stroke();
      }
    }
    
    // Create pattern and set as overlay
    const patternDataUrl = patternCanvas.toDataURL();
    const patternImage = new Image();
    patternImage.onload = () => {
      const pattern = new fabric.Pattern({
        source: patternImage,
        repeat: 'repeat'
      });
      
      canvas.setOverlayColor(pattern, canvas.renderAll.bind(canvas));
    };
    patternImage.src = patternDataUrl;
  },

  /**
   * Remove grid from canvas
   */
  removeGrid(canvas: fabric.Canvas): void {
    canvas.setOverlayColor('', canvas.renderAll.bind(canvas));
  },

  /**
   * Snap object to grid
   */
  snapObjectToGrid(obj: fabric.Object, gridSize: number): void {
    const snappedLeft = Math.round((obj.left || 0) / gridSize) * gridSize;
    const snappedTop = Math.round((obj.top || 0) / gridSize) * gridSize;
    
    obj.set({
      left: snappedLeft,
      top: snappedTop
    });
    
    obj.setCoords();
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Optimize canvas rendering
   */
  optimizeRendering(canvas: fabric.Canvas): void {
    // Disable object caching for better performance with many objects
    canvas.getObjects().forEach(obj => {
      obj.set('objectCaching', false);
    });
    
    // Enable stateful mode for better performance
    canvas.stateful = true;
    
    // Set rendering optimization flags
    canvas.renderOnAddRemove = false;
    canvas.skipTargetFind = false;
  },

  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  },

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  /**
   * Monitor canvas performance
   */
  monitorPerformance(canvas: fabric.Canvas): {
    getMetrics: () => any;
    dispose: () => void;
  } {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    
    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    const animationId = requestAnimationFrame(measureFrame);
    
    return {
      getMetrics: () => ({
        fps,
        objectCount: canvas.getObjects().length,
        canvasSize: {
          width: canvas.getWidth(),
          height: canvas.getHeight()
        }
      }),
      dispose: () => cancelAnimationFrame(animationId)
    };
  }
};
