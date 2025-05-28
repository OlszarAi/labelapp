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
  GridSizePreset,
  SnapConfiguration,
  AlignmentConfiguration,
  SpacingInfo,
  CanvasSizePreset,
  BackgroundPatternType,
  RulerConfiguration
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
   * Get predefined grid size presets
   */
  getGridSizePresets(): GridSizePreset[] {
    return [
      { name: '1mm', value: 3.78, unit: 'mm', description: 'Fine grid - 1 millimeter' },
      { name: '2mm', value: 7.56, unit: 'mm', description: 'Fine grid - 2 millimeters' },
      { name: '5mm', value: 18.9, unit: 'mm', description: 'Standard grid - 5 millimeters' },
      { name: '10mm', value: 37.8, unit: 'mm', description: 'Large grid - 10 millimeters' },
      { name: '1/8"', value: 12, unit: 'in', description: 'Fine grid - 1/8 inch' },
      { name: '1/4"', value: 24, unit: 'in', description: 'Standard grid - 1/4 inch' },
      { name: '1/2"', value: 48, unit: 'in', description: 'Large grid - 1/2 inch' },
      { name: '10px', value: 10, unit: 'px', description: 'Small pixel grid' },
      { name: '20px', value: 20, unit: 'px', description: 'Medium pixel grid' },
      { name: '50px', value: 50, unit: 'px', description: 'Large pixel grid' }
    ];
  },

  /**
   * Enhanced grid drawing with multiple types and sub-grids
   */
  drawGrid(canvas: fabric.Canvas, config: GridConfiguration): void {
    if (!config.enabled) {
      this.removeGrid(canvas);
      return;
    }

    const zoom = canvas.getZoom();
    
    // Calculate effective grid size with zoom
    const effectiveSize = config.size * zoom;
    
    // Don't draw if grid would be too small to see
    if (effectiveSize < 2) return;
    
    // Hide subdivisions at low zoom if adaptive zoom is enabled
    const showSubdivisions = !config.adaptiveZoom || effectiveSize > 10;

    switch (config.type) {
      case 'lines':
        this.createAdvancedGridPattern(canvas, config, zoom, showSubdivisions);
        break;
      case 'dots':
        this.createAdvancedDotGrid(canvas, config, zoom, showSubdivisions);
        break;
      case 'cross':
        this.createAdvancedCrossGrid(canvas, config, zoom, showSubdivisions);
        break;
      case 'hybrid':
        this.createHybridGrid(canvas, config, zoom, showSubdivisions);
        break;
      default:
        this.createAdvancedGridPattern(canvas, config, zoom, showSubdivisions);
    }
  },

  /**
   * Create advanced grid pattern with subdivisions
   */
  createAdvancedGridPattern(canvas: fabric.Canvas, config: GridConfiguration, zoom: number, showSubdivisions: boolean): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const effectiveSize = config.size * zoom;
    const subdivisionSize = effectiveSize / config.subdivisions;
    
    let gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="advancedGrid" width="${effectiveSize}" height="${effectiveSize}" patternUnits="userSpaceOnUse">
    `;

    // Add subdivision lines
    if (showSubdivisions && config.subdivisions > 1) {
      for (let i = 1; i < config.subdivisions; i++) {
        const pos = i * subdivisionSize;
        gridSvg += `
          <path d="M ${pos} 0 L ${pos} ${effectiveSize}" 
                stroke="${config.minorLineColor}" 
                stroke-width="${config.minorLineWidth}" 
                opacity="${config.minorLineOpacity}"/>
          <path d="M 0 ${pos} L ${effectiveSize} ${pos}" 
                stroke="${config.minorLineColor}" 
                stroke-width="${config.minorLineWidth}" 
                opacity="${config.minorLineOpacity}"/>
        `;
      }
    }

    // Add major grid lines
    gridSvg += `
      <path d="M ${effectiveSize} 0 L ${effectiveSize} ${effectiveSize} M 0 ${effectiveSize} L ${effectiveSize} ${effectiveSize}" 
            stroke="${config.majorLineColor}" 
            stroke-width="${config.majorLineWidth}" 
            opacity="${config.majorLineOpacity}"/>
    `;

    // Add origin highlight if enabled
    if (config.showOrigin) {
      gridSvg += `
        <circle cx="0" cy="0" r="3" fill="${config.originColor}" opacity="0.8"/>
      `;
    }

    gridSvg += `
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#advancedGrid)" />
      </svg>
    `;

    this.applyGridToCanvas(canvas, gridSvg);
  },

  /**
   * Create advanced dot grid with subdivisions
   */
  createAdvancedDotGrid(canvas: fabric.Canvas, config: GridConfiguration, zoom: number, showSubdivisions: boolean): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const effectiveSize = config.size * zoom;
    const subdivisionSize = effectiveSize / config.subdivisions;
    
    let gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="advancedDotGrid" width="${effectiveSize}" height="${effectiveSize}" patternUnits="userSpaceOnUse">
    `;

    // Add subdivision dots
    if (showSubdivisions && config.subdivisions > 1) {
      for (let i = 1; i < config.subdivisions; i++) {
        for (let j = 1; j < config.subdivisions; j++) {
          const x = i * subdivisionSize;
          const y = j * subdivisionSize;
          gridSvg += `
            <circle cx="${x}" cy="${y}" r="0.5" 
                    fill="${config.minorLineColor}" 
                    opacity="${config.minorLineOpacity}"/>
          `;
        }
      }
    }

    // Add major grid dots
    gridSvg += `
      <circle cx="${effectiveSize}" cy="${effectiveSize}" r="1.5" 
              fill="${config.majorLineColor}" 
              opacity="${config.majorLineOpacity}"/>
    `;

    // Add origin highlight
    if (config.showOrigin) {
      gridSvg += `
        <circle cx="0" cy="0" r="3" fill="${config.originColor}" opacity="0.8"/>
      `;
    }

    gridSvg += `
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#advancedDotGrid)" />
      </svg>
    `;

    this.applyGridToCanvas(canvas, gridSvg);
  },

  /**
   * Create advanced cross grid
   */
  createAdvancedCrossGrid(canvas: fabric.Canvas, config: GridConfiguration, zoom: number, showSubdivisions: boolean): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const effectiveSize = config.size * zoom;
    const subdivisionSize = effectiveSize / config.subdivisions;
    const crossSize = Math.max(2, effectiveSize * 0.1);
    
    let gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="advancedCrossGrid" width="${effectiveSize}" height="${effectiveSize}" patternUnits="userSpaceOnUse">
    `;

    // Add subdivision crosses
    if (showSubdivisions && config.subdivisions > 1) {
      for (let i = 1; i < config.subdivisions; i++) {
        for (let j = 1; j < config.subdivisions; j++) {
          const x = i * subdivisionSize;
          const y = j * subdivisionSize;
          const minorCrossSize = crossSize * 0.5;
          gridSvg += `
            <path d="M ${x-minorCrossSize/2} ${y} L ${x+minorCrossSize/2} ${y} M ${x} ${y-minorCrossSize/2} L ${x} ${y+minorCrossSize/2}" 
                  stroke="${config.minorLineColor}" 
                  stroke-width="${config.minorLineWidth}" 
                  opacity="${config.minorLineOpacity}"/>
          `;
        }
      }
    }

    // Add major cross
    gridSvg += `
      <path d="M ${effectiveSize-crossSize/2} ${effectiveSize} L ${effectiveSize+crossSize/2} ${effectiveSize} M ${effectiveSize} ${effectiveSize-crossSize/2} L ${effectiveSize} ${effectiveSize+crossSize/2}" 
            stroke="${config.majorLineColor}" 
            stroke-width="${config.majorLineWidth}" 
            opacity="${config.majorLineOpacity}"/>
    `;

    gridSvg += `
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#advancedCrossGrid)" />
      </svg>
    `;

    this.applyGridToCanvas(canvas, gridSvg);
  },

  /**
   * Create hybrid grid (combination of lines and dots)
   */
  createHybridGrid(canvas: fabric.Canvas, config: GridConfiguration, zoom: number, showSubdivisions: boolean): void {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const effectiveSize = config.size * zoom;
    const subdivisionSize = effectiveSize / config.subdivisions;
    
    let gridSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hybridGrid" width="${effectiveSize}" height="${effectiveSize}" patternUnits="userSpaceOnUse">
    `;

    // Add subdivision dots
    if (showSubdivisions && config.subdivisions > 1) {
      for (let i = 1; i < config.subdivisions; i++) {
        for (let j = 1; j < config.subdivisions; j++) {
          const x = i * subdivisionSize;
          const y = j * subdivisionSize;
          gridSvg += `
            <circle cx="${x}" cy="${y}" r="0.5" 
                    fill="${config.minorLineColor}" 
                    opacity="${config.minorLineOpacity}"/>
          `;
        }
      }
    }

    // Add major grid lines
    gridSvg += `
      <path d="M ${effectiveSize} 0 L ${effectiveSize} ${effectiveSize} M 0 ${effectiveSize} L ${effectiveSize} ${effectiveSize}" 
            stroke="${config.majorLineColor}" 
            stroke-width="${config.majorLineWidth}" 
            opacity="${config.majorLineOpacity}"/>
    `;

    // Add intersection dots at major grid points
    gridSvg += `
      <circle cx="${effectiveSize}" cy="${effectiveSize}" r="2" 
              fill="${config.majorLineColor}" 
              opacity="${config.majorLineOpacity}"/>
    `;

    gridSvg += `
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hybridGrid)" />
      </svg>
    `;

    this.applyGridToCanvas(canvas, gridSvg);
  },

  /**
   * Apply SVG grid to canvas
   */
  applyGridToCanvas(canvas: fabric.Canvas, gridSvg: string): void {
    const gridUrl = 'data:image/svg+xml;base64,' + btoa(gridSvg);
    
    fabric.Image.fromURL(gridUrl, (img) => {
      if (img) {
        img.set({
          selectable: false,
          evented: false,
          excludeFromExport: true,
          isGridPattern: true
        } as any);
        canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
      }
    });
  },

  /**
   * Remove grid from canvas
   */
  removeGrid(canvas: fabric.Canvas): void {
    canvas.setOverlayImage(null as any, canvas.renderAll.bind(canvas));
  },

  /**
   * Enhanced snap object to grid with subdivision support
   */
  snapObjectToGrid(obj: fabric.Object, config: GridConfiguration): void {
    if (!config.snapToGrid) return;

    const gridSize = config.snapToSubGrid ? config.size / config.subdivisions : config.size;
    const tolerance = config.snapTolerance;

    const objLeft = obj.left || 0;
    const objTop = obj.top || 0;

    // Calculate snapped positions
    const snappedLeft = Math.round(objLeft / gridSize) * gridSize;
    const snappedTop = Math.round(objTop / gridSize) * gridSize;

    // Only snap if within tolerance
    if (Math.abs(objLeft - snappedLeft) <= tolerance && Math.abs(objTop - snappedTop) <= tolerance) {
      obj.set({
        left: snappedLeft,
        top: snappedTop
      });
      obj.setCoords();
    }
  },

  /**
   * Snap all objects to grid
   */
  snapAllObjectsToGrid(canvas: fabric.Canvas, config: GridConfiguration): void {
    canvas.getObjects().forEach(obj => {
      this.snapObjectToGrid(obj, config);
    });
    canvas.renderAll();
  },

  /**
   * Toggle grid visibility
   */
  toggleGrid(canvas: fabric.Canvas, show: boolean, config: GridConfiguration): void {
    if (show) {
      this.drawGrid(canvas, { ...config, enabled: true });
    } else {
      this.removeGrid(canvas);
    }
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

/**
 * Canvas size presets and background pattern utilities
 */
export const canvasPresetUtils = {
  /**
   * Get predefined canvas size presets
   */
  getCanvasSizePresets(): CanvasSizePreset[] {
    return [
      // Standard paper sizes
      { name: 'A4', width: 794, height: 1123, unit: 'pt', category: 'print', description: 'A4 Paper (210 × 297 mm)' },
      { name: 'A3', width: 1123, height: 1587, unit: 'pt', category: 'print', description: 'A3 Paper (297 × 420 mm)' },
      { name: 'Letter', width: 816, height: 1056, unit: 'pt', category: 'print', description: 'US Letter (8.5 × 11 in)' },
      { name: 'Legal', width: 816, height: 1344, unit: 'pt', category: 'print', description: 'US Legal (8.5 × 14 in)' },
      { name: 'Tabloid', width: 1056, height: 1632, unit: 'pt', category: 'print', description: 'Tabloid (11 × 17 in)' },
      
      // Business card and label sizes
      { name: 'Business Card', width: 252, height: 144, unit: 'pt', category: 'standard', description: 'Standard Business Card (3.5 × 2 in)' },
      { name: 'Address Label', width: 252, height: 72, unit: 'pt', category: 'standard', description: 'Address Label (3.5 × 1 in)' },
      { name: 'Shipping Label', width: 288, height: 432, unit: 'pt', category: 'standard', description: 'Shipping Label (4 × 6 in)' },
      { name: 'CD Label', width: 354, height: 354, unit: 'pt', category: 'standard', description: 'CD/DVD Label (120mm diameter)' },
      
      // Web and digital sizes
      { name: 'Full HD', width: 1920, height: 1080, unit: 'px', category: 'web', description: 'Full HD Display (1920 × 1080)' },
      { name: '4K UHD', width: 3840, height: 2160, unit: 'px', category: 'web', description: '4K Ultra HD (3840 × 2160)' },
      { name: 'Social Media Post', width: 1080, height: 1080, unit: 'px', category: 'web', description: 'Square Social Media (1080 × 1080)' },
      { name: 'Social Media Story', width: 1080, height: 1920, unit: 'px', category: 'web', description: 'Vertical Story Format (9:16)' },
      { name: 'Web Banner', width: 728, height: 90, unit: 'px', category: 'web', description: 'Leaderboard Web Banner' },
      
      // Mobile sizes
      { name: 'iPhone 14', width: 390, height: 844, unit: 'px', category: 'mobile', description: 'iPhone 14 Screen (390 × 844)' },
      { name: 'iPhone 14 Pro Max', width: 430, height: 932, unit: 'px', category: 'mobile', description: 'iPhone 14 Pro Max (430 × 932)' },
      { name: 'iPad', width: 768, height: 1024, unit: 'px', category: 'mobile', description: 'iPad Screen (768 × 1024)' },
      { name: 'Android Phone', width: 360, height: 640, unit: 'px', category: 'mobile', description: 'Standard Android (360 × 640)' },
      
      // Custom common sizes
      { name: 'Square Small', width: 400, height: 400, unit: 'px', category: 'custom', description: 'Small Square Canvas' },
      { name: 'Square Medium', width: 800, height: 800, unit: 'px', category: 'custom', description: 'Medium Square Canvas' },
      { name: 'Landscape', width: 1200, height: 800, unit: 'px', category: 'custom', description: 'Landscape Format (3:2)' },
      { name: 'Portrait', width: 800, height: 1200, unit: 'px', category: 'custom', description: 'Portrait Format (2:3)' }
    ];
  },

  /**
   * Apply canvas size preset
   */
  applyCanvasSizePreset(canvas: fabric.Canvas, preset: CanvasSizePreset): void {
    canvas.setDimensions({
      width: preset.width,
      height: preset.height
    });
    canvas.renderAll();
  },

  /**
   * Create background pattern
   */
  createBackgroundPattern(canvas: fabric.Canvas, type: BackgroundPatternType, options: {
    color?: string;
    backgroundColor?: string;
    size?: number;
    opacity?: number;
  } = {}): void {
    const {
      color = '#e5e5e5',
      backgroundColor = '#ffffff',
      size = 20,
      opacity = 0.3
    } = options;

    // Clear existing background pattern
    canvas.backgroundColor = backgroundColor;

    if (type === 'none') {
      canvas.renderAll();
      return;
    }

    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    if (!patternContext) return;

    patternCanvas.width = size;
    patternCanvas.height = size;

    // Set background
    patternContext.fillStyle = backgroundColor;
    patternContext.fillRect(0, 0, size, size);

    // Set pattern color with opacity
    patternContext.globalAlpha = opacity;
    patternContext.fillStyle = color;
    patternContext.strokeStyle = color;
    patternContext.lineWidth = 1;

    switch (type) {
      case 'dots':
        this.createDotPattern(patternContext, size);
        break;
      case 'grid':
        this.createGridPattern(patternContext, size);
        break;
      case 'diagonal':
        this.createDiagonalPattern(patternContext, size);
        break;
      case 'crosshatch':
        this.createCrosshatchPattern(patternContext, size);
        break;
      case 'hexagon':
        this.createHexagonPattern(patternContext, size);
        break;
      case 'triangular':
        this.createTriangularPattern(patternContext, size);
        break;
    }

    const pattern = patternContext.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      canvas.backgroundColor = pattern as unknown as string;
      canvas.renderAll();
    }
  },

  /**
   * Create dot pattern
   */
  createDotPattern(ctx: CanvasRenderingContext2D, size: number): void {
    const center = size / 2;
    const radius = Math.max(1, size / 10);
    
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fill();
  },

  /**
   * Create grid pattern
   */
  createGridPattern(ctx: CanvasRenderingContext2D, size: number): void {
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size, size);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size, size);
    ctx.stroke();
  },

  /**
   * Create diagonal pattern
   */
  createDiagonalPattern(ctx: CanvasRenderingContext2D, size: number): void {
    // Diagonal line from top-left to bottom-right
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.stroke();
  },

  /**
   * Create crosshatch pattern
   */
  createCrosshatchPattern(ctx: CanvasRenderingContext2D, size: number): void {
    // Diagonal line 1
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.stroke();

    // Diagonal line 2
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
  },

  /**
   * Create hexagon pattern
   */
  createHexagonPattern(ctx: CanvasRenderingContext2D, size: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  },

  /**
   * Create triangular pattern
   */
  createTriangularPattern(ctx: CanvasRenderingContext2D, size: number): void {
    const height = size * 0.866; // Height of equilateral triangle
    
    // Triangle 1
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(0, height);
    ctx.lineTo(size, height);
    ctx.closePath();
    ctx.stroke();
  },

  /**
   * Get predefined background pattern options
   */
  getBackgroundPatternOptions(): Array<{
    type: BackgroundPatternType;
    name: string;
    description: string;
    preview?: string;
  }> {
    return [
      { type: 'none', name: 'None', description: 'Solid background color' },
      { type: 'dots', name: 'Dots', description: 'Small dots pattern' },
      { type: 'grid', name: 'Grid', description: 'Simple grid lines' },
      { type: 'diagonal', name: 'Diagonal', description: 'Diagonal lines' },
      { type: 'crosshatch', name: 'Crosshatch', description: 'Crossed diagonal lines' },
      { type: 'hexagon', name: 'Hexagon', description: 'Hexagonal pattern' },
      { type: 'triangular', name: 'Triangular', description: 'Triangular pattern' }
    ];
  }
};

/**
 * Enhanced ruler system utilities
 */
export const rulerUtils = {
  /**
   * Create ruler with enhanced features
   */
  createEnhancedRuler(
    canvas: fabric.Canvas,
    orientation: 'horizontal' | 'vertical',
    config: RulerConfiguration
  ): fabric.Group {
    const rulerSize = 30; // Height/width of ruler
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const rulerLength = orientation === 'horizontal' ? canvasWidth : canvasHeight;
    const rulerElements: fabric.Object[] = [];

    // Create ruler background
    const background = new fabric.Rect({
      left: 0,
      top: 0,
      width: orientation === 'horizontal' ? rulerLength : rulerSize,
      height: orientation === 'horizontal' ? rulerSize : rulerLength,
      fill: config.backgroundColor,
      stroke: config.color,
      strokeWidth: 1,
      selectable: false,
      evented: false
    });
    rulerElements.push(background);

    // Add ticks and labels
    this.addRulerTicks(rulerElements, orientation, rulerLength, rulerSize, config);

    // Create ruler group
    const rulerGroup = new fabric.Group(rulerElements, {
      left: orientation === 'horizontal' ? 0 : -rulerSize,
      top: orientation === 'horizontal' ? -rulerSize : 0,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    return rulerGroup;
  },

  /**
   * Add ruler ticks and labels
   */
  addRulerTicks(
    elements: fabric.Object[],
    orientation: 'horizontal' | 'vertical',
    length: number,
    rulerSize: number,
    config: RulerConfiguration
  ): void {
    const pixelsPerUnit = this.getPixelsPerUnit(config.units);
    const majorTickInterval = pixelsPerUnit;
    const minorTickInterval = pixelsPerUnit / 10;

    // Add ticks
    for (let pos = 0; pos <= length; pos += minorTickInterval) {
      const isMajorTick = pos % majorTickInterval === 0;
      const tickLength = isMajorTick ? config.majorTickLength : config.minorTickLength;
      
      const tick = new fabric.Line(
        orientation === 'horizontal' 
          ? [pos, rulerSize - tickLength, pos, rulerSize]
          : [rulerSize - tickLength, pos, rulerSize, pos],
        {
          stroke: config.tickColor,
          strokeWidth: 1,
          selectable: false,
          evented: false
        }
      );
      elements.push(tick);

      // Add labels for major ticks
      if (isMajorTick && pos > 0) {
        const value = this.convertPixelsToUnit(pos, config.units, config.precision);
        const label = new fabric.Text(value.toString(), {
          left: orientation === 'horizontal' ? pos : config.labelOffset,
          top: orientation === 'horizontal' ? config.labelOffset : pos,
          fontSize: config.fontSize,
          fill: config.color,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });
        elements.push(label);

        // Add secondary unit if enabled
        if (config.showMultipleUnits && config.secondaryUnit !== config.units) {
          const secondaryValue = this.convertPixelsToUnit(pos, config.secondaryUnit, config.precision);
          const secondaryLabel = new fabric.Text(`(${secondaryValue})`, {
            left: orientation === 'horizontal' ? pos : config.labelOffset + 15,
            top: orientation === 'horizontal' ? config.labelOffset + 12 : pos + 12,
            fontSize: config.fontSize - 2,
            fill: config.color,
            opacity: 0.7,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
          });
          elements.push(secondaryLabel);
        }
      }
    }
  },

  /**
   * Get pixels per unit conversion
   */
  getPixelsPerUnit(unit: 'px' | 'mm' | 'cm' | 'in' | 'pt'): number {
    const dpi = 96; // Standard screen DPI
    
    switch (unit) {
      case 'px': return 1;
      case 'mm': return dpi / 25.4;
      case 'cm': return dpi / 2.54;
      case 'in': return dpi;
      case 'pt': return dpi / 72;
      default: return 1;
    }
  },

  /**
   * Convert pixels to specified unit
   */
  convertPixelsToUnit(pixels: number, unit: 'px' | 'mm' | 'cm' | 'in' | 'pt', precision: number = 0): number {
    const pixelsPerUnit = this.getPixelsPerUnit(unit);
    const value = pixels / pixelsPerUnit;
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  },

  /**
   * Create measurement tool for distance measurement
   */
  createMeasurementTool(
    canvas: fabric.Canvas,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    config: RulerConfiguration
  ): fabric.Group {
    const elements: fabric.Object[] = [];

    // Measurement line
    const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
      stroke: config.measurementColor,
      strokeWidth: config.measurementLineWidth,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false
    });
    elements.push(line);

    // Calculate distance
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );

    // Convert to configured unit
    const value = this.convertPixelsToUnit(distance, config.units, config.precision);
    const unitLabel = config.units;

    // Distance label
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    
    const distanceLabel = new fabric.Text(`${value} ${unitLabel}`, {
      left: midX,
      top: midY - 15,
      fontSize: 12,
      fill: config.measurementTextColor,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    });
    elements.push(distanceLabel);

    // Start and end markers
    const startMarker = new fabric.Circle({
      left: startPoint.x,
      top: startPoint.y,
      radius: 3,
      fill: config.measurementColor,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    });
    elements.push(startMarker);

    const endMarker = new fabric.Circle({
      left: endPoint.x,
      top: endPoint.y,
      radius: 3,
      fill: config.measurementColor,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    });
    elements.push(endMarker);

    return new fabric.Group(elements, {
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
  },

  /**
   * Create alignment guides
   */
  createAlignmentGuides(
    canvas: fabric.Canvas,
    activeObject: fabric.Object,
    config: RulerConfiguration
  ): fabric.Object[] {
    if (!config.showGuides) return [];

    const guides: fabric.Object[] = [];
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objectBounds = activeObject.getBoundingRect();

    // Ensure bounds are valid
    const left = objectBounds.left ?? 0;
    const top = objectBounds.top ?? 0;
    const width = objectBounds.width ?? 0;
    const height = objectBounds.height ?? 0;

    // Vertical guides (left, center, right)
    const verticalPositions = [
      left,
      left + width / 2,
      left + width
    ];

    verticalPositions.forEach(x => {
      if (typeof x === 'number' && isFinite(x)) {
        const guide = new fabric.Line([x, 0, x, canvasHeight], {
          stroke: config.guidesColor,
          strokeWidth: 1,
          strokeDashArray: [3, 3],
          opacity: config.guidesOpacity,
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        guides.push(guide);
      }
    });

    // Horizontal guides (top, middle, bottom)
    const horizontalPositions = [
      top,
      top + height / 2,
      top + height
    ];

    horizontalPositions.forEach(y => {
      if (typeof y === 'number' && isFinite(y)) {
        const guide = new fabric.Line([0, y, canvasWidth, y], {
          stroke: config.guidesColor,
          strokeWidth: 1,
          strokeDashArray: [3, 3],
          opacity: config.guidesOpacity,
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        guides.push(guide);
      }
    });

    return guides;
  }
};
