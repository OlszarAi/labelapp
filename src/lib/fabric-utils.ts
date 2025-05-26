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
  QRCodeConfig
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
      barcodeType: (obj as any).barcodeType,
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
   * Deserialize image from stored data
   */
  async deserializeImage(imageData: any): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageData.src, (img) => {
        if (img) {
          img.set(imageData);
          resolve(img);
        } else {
          reject(new Error('Failed to deserialize image'));
        }
      });
    });
  },

  /**
   * Clone fabric object
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
   * Validate object properties
   */
  validateObject(obj: fabric.Object): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic validations
    if (!obj.width || obj.width <= 0) {
      errors.push({
        field: 'width',
        message: 'Width must be greater than 0',
        severity: 'error'
      });
    }

    if (!obj.height || obj.height <= 0) {
      errors.push({
        field: 'height',
        message: 'Height must be greater than 0',
        severity: 'error'
      });
    }

    // Check if object is outside canvas bounds (warning)
    if (obj.left && obj.left < 0) {
      warnings.push({
        field: 'left',
        message: 'Object extends beyond left canvas boundary',
        suggestion: 'Move object to the right'
      });
    }

    if (obj.top && obj.top < 0) {
      warnings.push({
        field: 'top',
        message: 'Object extends beyond top canvas boundary',
        suggestion: 'Move object down'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Serialize object for storage
   */
  serializeObject(obj: fabric.Object): SerializedObject {
    const customProps = this.toCustomJSON(obj);
    
    return {
      id: customProps.id,
      type: obj.type || 'object',
      elementType: customProps.elementType,
      properties: customProps.fabricProps,
      customProperties: customProps.customProps,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  /**
   * Deserialize object from storage
   */
  async deserializeObject(data: SerializedObject): Promise<fabric.Object | null> {
    const customJSON: CustomObjectJSON = {
      id: data.id,
      type: data.type,
      elementType: data.elementType,
      customProps: {
        id: data.id,
        ...data.customProperties
      },
      fabricProps: data.properties,
      version: data.version,
      created: data.timestamp,
      modified: data.timestamp
    };

    return this.fromCustomJSON(customJSON);
  },

  /**
   * Get display name for object
   */
  getDisplayName(obj: fabric.Object): string {
    const elementType = (obj as any).elementType || this.getElementTypeFromObject(obj);
    const id = (obj as any).id || 'unknown';
    
    // Create friendly display name based on type
    switch (elementType) {
      case ElementType.TEXT:
        const text = (obj as fabric.Text).text || 'Text';
        return `Text: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`;
      case ElementType.RECTANGLE:
        return 'Rectangle';
      case ElementType.CIRCLE:
        return 'Circle';
      case ElementType.ELLIPSE:
        return 'Ellipse';
      case ElementType.LINE:
        return 'Line';
      case ElementType.IMAGE:
        return 'Image';
      case ElementType.QR_CODE:
        const qrValue = (obj as any).qrCodeValue || 'QR Code';
        return `QR: ${qrValue.substring(0, 15)}${qrValue.length > 15 ? '...' : ''}`;
      case ElementType.BARCODE:
        const barcodeValue = (obj as any).barcodeValue || 'Barcode';
        return `Barcode: ${barcodeValue.substring(0, 15)}${barcodeValue.length > 15 ? '...' : ''}`;
      case ElementType.GROUP:
        return 'Group';
      default:
        return `${elementType} (${id.substring(0, 8)})`;
    }
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
    const defaultOptions = {
      format: 'png',
      quality: 1,
      multiplier: 1,
      enableRetinaScaling: false,
      withoutTransform: false,
      withoutShadow: false,
      ...options
    };

    return canvas.toDataURL({
      format: defaultOptions.format,
      quality: defaultOptions.quality,
      multiplier: defaultOptions.multiplier,
      left: defaultOptions.left,
      top: defaultOptions.top,
      width: defaultOptions.width,
      height: defaultOptions.height,
      enableRetinaScaling: defaultOptions.enableRetinaScaling,
      withoutTransform: defaultOptions.withoutTransform,
      withoutShadow: defaultOptions.withoutShadow
    });
  },

  /**
   * Export canvas as JPEG
   */
  exportToJPEG(canvas: fabric.Canvas, options: ExportImageOptions = {}): string {
    const defaultOptions = {
      format: 'jpeg',
      quality: 0.8,
      multiplier: 1,
      enableRetinaScaling: false,
      withoutTransform: false,
      withoutShadow: false,
      ...options
    };

    return canvas.toDataURL({
      format: defaultOptions.format,
      quality: defaultOptions.quality,
      multiplier: defaultOptions.multiplier,
      left: defaultOptions.left,
      top: defaultOptions.top,
      width: defaultOptions.width,
      height: defaultOptions.height,
      enableRetinaScaling: defaultOptions.enableRetinaScaling,
      withoutTransform: defaultOptions.withoutTransform,
      withoutShadow: defaultOptions.withoutShadow
    });
  },

  /**
   * Export canvas as SVG
   */
  exportToSVG(canvas: fabric.Canvas, options: ExportSVGOptions = {}): string {
    const defaultOptions = {
      suppressPreamble: false,
      encoding: 'UTF-8',
      ...options
    };

    return canvas.toSVG({
      suppressPreamble: defaultOptions.suppressPreamble,
      viewBox: defaultOptions.viewBox,
      encoding: defaultOptions.encoding,
      width: defaultOptions.width,
      height: defaultOptions.height
    });
  },

  /**
   * Export canvas to blob
   */
  async exportToBlob(
    canvas: fabric.Canvas, 
    options: ExportImageOptions = {}
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toCanvasElement(options.multiplier || 1).toBlob(
        (blob) => resolve(blob),
        `image/${options.format || 'png'}`,
        options.quality || 1
      );
    });
  },

  /**
   * Download canvas as image file
   */
  async downloadAsImage(
    canvas: fabric.Canvas,
    filename: string,
    options: ExportImageOptions = {}
  ): Promise<void> {
    const blob = await this.exportToBlob(canvas, options);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export canvas to JSON
   */
  exportToJSON(canvas: fabric.Canvas): string {
    return JSON.stringify(canvasUtils.exportToCustomJSON(canvas), null, 2);
  },

  /**
   * Download file helper
   */
  downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Grid utilities
 */
export const gridUtils = {
  /**
   * Create grid pattern
   */
  createGridPattern(
    canvas: fabric.Canvas,
    size: number,
    color = '#ddd',
    opacity = 0.5
  ): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
            <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;
    
    const gridUrl = 'data:image/svg+xml;base64,' + btoa(gridSvg);
    
    fabric.Image.fromURL(gridUrl, (img) => {
      if (img) {
        img.set({
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
      }
    });
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
  },

  /**
   * Toggle grid visibility
   */
  toggleGrid(canvas: fabric.Canvas, show: boolean, size = 20, color = '#ddd'): void {
    if (show) {
      this.createGridPattern(canvas, size, color);
    } else {
      this.removeGrid(canvas);
    }
  },

  /**
   * Snap all objects to grid
   */
  snapAllObjectsToGrid(canvas: fabric.Canvas, gridSize: number): void {
    canvas.getObjects().forEach(obj => {
      this.snapObjectToGrid(obj, gridSize);
    });
    canvas.renderAll();
  },

  /**
   * Draw grid on canvas
   */
  drawGrid(canvas: fabric.Canvas, options: {
    enabled?: boolean;
    size?: number;
    color?: string;
    opacity?: number;
    style?: 'dots' | 'lines' | 'cross';
    subdivisions?: number;
    snapToGrid?: boolean;
    snapTolerance?: number;
  } = {}): void {
    const { 
      enabled = true, 
      size = 20, 
      color = '#ddd', 
      opacity = 0.5, 
      style = 'lines'
    } = options;
    
    if (!enabled) return;
    
    if (style === 'lines') {
      this.createGridPattern(canvas, size, color, opacity);
    } else if (style === 'dots') {
      this.createDotGrid(canvas, size, color, opacity);
    } else if (style === 'cross') {
      this.createCrossGrid(canvas, size, color, opacity);
    }
  },

  /**
   * Create dot grid pattern
   */
  createDotGrid(canvas: fabric.Canvas, size: number, color = '#ddd', opacity = 0.5): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
            <circle cx="${size/2}" cy="${size/2}" r="1" fill="${color}" opacity="${opacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>
    `;
    
    const gridUrl = 'data:image/svg+xml;base64,' + btoa(gridSvg);
    
    fabric.Image.fromURL(gridUrl, (img) => {
      if (img) {
        img.set({
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
      }
    });
  },

  /**
   * Create cross grid pattern
   */
  createCrossGrid(canvas: fabric.Canvas, size: number, color = '#ddd', opacity = 0.5): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crossgrid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
            <path d="M ${size/2-2} ${size/2} L ${size/2+2} ${size/2} M ${size/2} ${size/2-2} L ${size/2} ${size/2+2}" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crossgrid)" />
      </svg>
    `;
    
    const gridUrl = 'data:image/svg+xml;base64,' + btoa(gridSvg);
    
    fabric.Image.fromURL(gridUrl, (img) => {
      if (img) {
        img.set({
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
      }
    });
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
    let fps = 0;
    let frameCount = 0;
    let lastTime = performance.now();
    
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

/**
 * Coordinate transformation and geometry utilities
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
   * Snap point to grid
   */
  snapToGrid(point: { x: number; y: number }, gridSize: number): { x: number; y: number } {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
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
   * Calculate angle between two points in radians
   */
  angle(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  },

  /**
   * Get object bounds in canvas coordinates
   */
  getObjectBounds(obj: fabric.Object): BoundingRect {
    const bounds = obj.getBoundingRect();
    const left = bounds.left || 0;
    const top = bounds.top || 0;
    const width = bounds.width || 0;
    const height = bounds.height || 0;
    
    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height
    };
  },

  /**
   * Check if a point is inside an object
   */
  isPointInsideObject(obj: fabric.Object, point: { x: number; y: number }): boolean {
    const bounds = obj.getBoundingRect();
    const left = bounds.left || 0;
    const top = bounds.top || 0;
    const width = bounds.width || 0;
    const height = bounds.height || 0;
    
    return point.x >= left && 
           point.x <= left + width &&
           point.y >= top && 
           point.y <= top + height;
  },

  /**
   * Get center point of an object
   */
  getObjectCenter(obj: fabric.Object): { x: number; y: number } {
    return {
      x: obj.left! + (obj.width! * obj.scaleX!) / 2,
      y: obj.top! + (obj.height! * obj.scaleY!) / 2
    };
  },

  /**
   * Rotate point around center by angle
   */
  rotatePoint(point: { x: number; y: number }, center: { x: number; y: number }, angle: number): { x: number; y: number } {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  }
};
