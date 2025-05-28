/**
 * Canvas Objects
 * Custom Fabric.js objects for QR codes and UUIDs
 */

import { fabric } from 'fabric';
import { generateQRCode, QRCodeOptions, QRCodeGenerationResult } from './qr-generator';
import { generateUUID, UUIDOptions, UUIDGenerationResult } from './uuid-generator';

// Enhanced custom object interfaces
export interface CustomObjectProperties {
  id: string;
  metadata: {
    id: string;
    createdAt: number;
    modifiedAt: number;
    version: string;
    locked?: boolean;
    constraints?: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      maintainAspectRatio?: boolean;
    };
  };
}

export interface QRCodeObjectProperties extends CustomObjectProperties {
  qrData: string;
  qrOptions: QRCodeOptions;
  generationResult?: QRCodeGenerationResult;
  linkedUUID?: string;
}

export interface UUIDObjectProperties extends CustomObjectProperties {
  uuidData: string;
  uuidOptions: UUIDOptions;
  generationResult?: UUIDGenerationResult;
  linkedQRCode?: string;
  displayFormat?: {
    showPrefix?: boolean;
    showSeparators?: boolean;
    caseTransform?: 'none' | 'upper' | 'lower';
  };
}

// QR Code Object extending fabric.Image
export class QRCodeObject extends fabric.Image {
  declare qrData: string;
  declare qrOptions: QRCodeOptions;
  declare generationResult?: QRCodeGenerationResult;
  declare linkedUUID?: string;
  declare metadata: CustomObjectProperties['metadata'];

  constructor(
    qrData: string,
    options: Partial<fabric.IImageOptions> & {
      qrOptions?: QRCodeOptions;
      metadata?: Partial<CustomObjectProperties['metadata']>;
      linkedUUID?: string;
    } = {}
  ) {
    // Initialize with a placeholder until QR code is generated
    super('', {
      ...options,
      objectCaching: false, // Disable caching for dynamic updates
    });

    this.type = 'qr-code';
    this.qrData = qrData;
    this.qrOptions = options.qrOptions || {};
    this.linkedUUID = options.linkedUUID;
    this.metadata = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      version: '1.0.0',
      locked: false,
      ...options.metadata
    };

    // Generate QR code
    this.updateQRCode();
  }

  async updateQRCode(): Promise<void> {
    try {
      this.generationResult = await generateQRCode(this.qrData, this.qrOptions);
      
      // Create image element and set source
      const img = new Image();
      img.onload = () => {
        this.setElement(img);
        this.setCoords();
        this.canvas?.renderAll();
        this.metadata.modifiedAt = Date.now();
      };
      img.src = this.generationResult.dataUrl;
    } catch (error) {
      console.error('Failed to update QR code:', error);
    }
  }

  updateQRData(newData: string): void {
    if (this.metadata.locked) return;
    
    this.qrData = newData;
    this.updateQRCode();
  }

  updateQROptions(newOptions: Partial<QRCodeOptions>): void {
    if (this.metadata.locked) return;
    
    this.qrOptions = { ...this.qrOptions, ...newOptions };
    this.updateQRCode();
  }

  linkToUUID(uuidObjectId: string): void {
    this.linkedUUID = uuidObjectId;
    this.metadata.modifiedAt = Date.now();
  }

  // Enhanced serialization
  toObject(propertiesToInclude?: string[]): any {
    return super.toObject([
      'qrData',
      'qrOptions', 
      'linkedUUID',
      'metadata',
      ...(propertiesToInclude || [])
    ]);
  }

  // Custom controls for QR code specific operations
  static getCustomControls() {
    return {
      editQR: new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -16,
        cursorStyle: 'pointer',
        mouseUpHandler: function(eventData: any, transformData: any) {
          const target = transformData.target as QRCodeObject;
          // Trigger QR edit modal/panel
          target.canvas?.fire('qr:edit', { target });
          return true;
        },
        render: function(ctx: CanvasRenderingContext2D, left: number, top: number) {
          const size = 16;
          ctx.save();
          ctx.fillStyle = '#4285f4';
          ctx.fillRect(left - size/2, top - size/2, size, size);
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR', left, top + 4);
          ctx.restore();
        }
      })
    };
  }

  // Performance optimization
  needsItsOwnCache(): boolean {
    return true;
  }
}

// UUID Object extending fabric.Text
export class UUIDObject extends fabric.Text {
  declare uuidData: string;
  declare uuidOptions: UUIDOptions;
  declare generationResult?: UUIDGenerationResult;
  declare linkedQRCode?: string;
  declare displayFormat?: UUIDObjectProperties['displayFormat'];
  declare metadata: CustomObjectProperties['metadata'];

  constructor(
    uuidData: string,
    options: Partial<fabric.ITextOptions> & {
      uuidOptions?: UUIDOptions;
      metadata?: Partial<CustomObjectProperties['metadata']>;
      linkedQRCode?: string;
      displayFormat?: UUIDObjectProperties['displayFormat'];
    } = {}
  ) {
    const displayText = UUIDObject.formatDisplayText(uuidData, options.displayFormat);
    
    super(displayText, {
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize: 14,
      fill: '#000000',
      ...options,
    });

    this.type = 'uuid-text';
    this.uuidData = uuidData;
    this.uuidOptions = options.uuidOptions || {};
    this.linkedQRCode = options.linkedQRCode;
    this.displayFormat = options.displayFormat || {};
    this.metadata = {
      id: `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      version: '1.0.0',
      locked: false,
      ...options.metadata
    };
  }

  static formatDisplayText(
    uuid: string, 
    displayFormat?: UUIDObjectProperties['displayFormat']
  ): string {
    let formatted = uuid;
    
    if (displayFormat?.caseTransform === 'upper') {
      formatted = formatted.toUpperCase();
    } else if (displayFormat?.caseTransform === 'lower') {
      formatted = formatted.toLowerCase();
    }
    
    return formatted;
  }

  updateUUID(newUuidData?: string, newOptions?: UUIDOptions): void {
    if (this.metadata.locked) return;
    
    if (newUuidData) {
      this.uuidData = newUuidData;
    } else if (newOptions) {
      this.uuidOptions = { ...this.uuidOptions, ...newOptions };
      this.generationResult = generateUUID(this.uuidOptions);
      this.uuidData = this.generationResult.uuid;
    }
    
    const displayText = UUIDObject.formatDisplayText(this.uuidData, this.displayFormat);
    this.set('text', displayText);
    this.metadata.modifiedAt = Date.now();
    
    this.canvas?.renderAll();
  }

  regenerateUUID(): void {
    if (this.metadata.locked) return;
    
    this.generationResult = generateUUID(this.uuidOptions);
    this.updateUUID(this.generationResult.uuid);
  }

  updateDisplayFormat(newFormat: UUIDObjectProperties['displayFormat']): void {
    this.displayFormat = { ...this.displayFormat, ...newFormat };
    const displayText = UUIDObject.formatDisplayText(this.uuidData, this.displayFormat);
    this.set('text', displayText);
    this.metadata.modifiedAt = Date.now();
    this.canvas?.renderAll();
  }

  linkToQRCode(qrObjectId: string): void {
    this.linkedQRCode = qrObjectId;
    this.metadata.modifiedAt = Date.now();
  }

  // Enhanced serialization
  toObject(propertiesToInclude?: string[]): any {
    return super.toObject([
      'uuidData',
      'uuidOptions',
      'linkedQRCode',
      'displayFormat',
      'metadata',
      ...(propertiesToInclude || [])
    ]);
  }

  // Custom controls for UUID specific operations
  static getCustomControls() {
    return {
      regenerate: new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -16,
        cursorStyle: 'pointer',
        mouseUpHandler: function(eventData: any, transformData: any) {
          const target = transformData.target as UUIDObject;
          target.regenerateUUID();
          return true;
        },
        render: function(ctx: CanvasRenderingContext2D, left: number, top: number) {
          const size = 16;
          ctx.save();
          ctx.fillStyle = '#34a853';
          ctx.fillRect(left - size/2, top - size/2, size, size);
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('↻', left, top + 4);
          ctx.restore();
        }
      })
    };
  }
}

// Factory functions for object creation
export const createQRCodeObject = async (
  qrData: string,
  options: {
    left?: number;
    top?: number;
    qrOptions?: QRCodeOptions;
    metadata?: Partial<CustomObjectProperties['metadata']>;
    linkedUUID?: string;
  } = {}
): Promise<QRCodeObject> => {
  const qrObject = new QRCodeObject(qrData, {
    left: options.left || 100,
    top: options.top || 100,
    qrOptions: options.qrOptions,
    metadata: options.metadata,
    linkedUUID: options.linkedUUID
  });

  // Add custom controls
  const controls = QRCodeObject.getCustomControls();
  Object.assign(qrObject.controls, controls);

  return qrObject;
};

export const createUUIDObject = (
  uuidData?: string,
  options: {
    left?: number;
    top?: number;
    uuidOptions?: UUIDOptions;
    metadata?: Partial<CustomObjectProperties['metadata']>;
    linkedQRCode?: string;
    displayFormat?: UUIDObjectProperties['displayFormat'];
    textOptions?: Partial<fabric.ITextOptions>;
  } = {}
): UUIDObject => {
  // Generate UUID if not provided
  let finalUuidData = uuidData;
  if (!finalUuidData) {
    const result = generateUUID(options.uuidOptions);
    finalUuidData = result.uuid;
  }

  const uuidObject = new UUIDObject(finalUuidData, {
    left: options.left || 100,
    top: options.top || 150,
    uuidOptions: options.uuidOptions,
    metadata: options.metadata,
    linkedQRCode: options.linkedQRCode,
    displayFormat: options.displayFormat,
    ...options.textOptions
  });

  // Add custom controls
  const controls = UUIDObject.getCustomControls();
  Object.assign(uuidObject.controls, controls);

  return uuidObject;
};

// Linked QR + UUID creation
export const createLinkedQRUUIDPair = async (
  baseUrl?: string,
  options: {
    qrPosition?: { left: number; top: number };
    uuidPosition?: { left: number; top: number };
    qrOptions?: QRCodeOptions;
    uuidOptions?: UUIDOptions;
    spacing?: number;
  } = {}
): Promise<{ qrObject: QRCodeObject; uuidObject: UUIDObject }> => {
  const spacing = options.spacing || 20;
  
  // Generate UUID first
  const uuidResult = generateUUID(options.uuidOptions);
  const qrData = baseUrl ? `${baseUrl}/${uuidResult.uuid}` : uuidResult.uuid;
  
  // Create objects
  const qrObject = await createQRCodeObject(qrData, {
    left: options.qrPosition?.left || 100,
    top: options.qrPosition?.top || 100,
    qrOptions: options.qrOptions,
    linkedUUID: uuidResult.uuid
  });
  
  const uuidObject = createUUIDObject(uuidResult.uuid, {
    left: options.uuidPosition?.left || 100,
    top: options.uuidPosition?.top || (100 + (options.qrOptions?.height || 256) + spacing),
    uuidOptions: options.uuidOptions,
    linkedQRCode: qrObject.metadata.id
  });
  
  return { qrObject, uuidObject };
};

// Register custom object types with Fabric.js
export const registerCustomObjects = (): void => {
  // Register QR Code object with proper typing
  (fabric as any).QRCodeObject = QRCodeObject;
  (fabric as any).QRCodeObject.fromObject = function(object: any, callback: (obj: QRCodeObject) => void) {
    const qrObject = new QRCodeObject(object.qrData, {
      ...object,
      qrOptions: object.qrOptions,
      metadata: object.metadata,
      linkedUUID: object.linkedUUID
    });
    callback(qrObject);
  };

  // Register UUID object with proper typing
  (fabric as any).UUIDObject = UUIDObject;
  (fabric as any).UUIDObject.fromObject = function(object: any, callback: (obj: UUIDObject) => void) {
    const uuidObject = new UUIDObject(object.uuidData, {
      ...object,
      uuidOptions: object.uuidOptions,
      metadata: object.metadata,
      linkedQRCode: object.linkedQRCode,
      displayFormat: object.displayFormat
    });
    callback(uuidObject);
  };
};

// Object validation and constraints
export const validateObjectConstraints = (
  object: QRCodeObject | UUIDObject
): { isValid: boolean; violations: string[] } => {
  const violations: string[] = [];
  const constraints = object.metadata.constraints;
  
  if (!constraints) {
    return { isValid: true, violations: [] };
  }
  
  const objectWidth = object.getScaledWidth();
  const objectHeight = object.getScaledHeight();
  
  if (constraints.minWidth && objectWidth < constraints.minWidth) {
    violations.push(`Width ${objectWidth} is below minimum ${constraints.minWidth}`);
  }
  
  if (constraints.maxWidth && objectWidth > constraints.maxWidth) {
    violations.push(`Width ${objectWidth} exceeds maximum ${constraints.maxWidth}`);
  }
  
  if (constraints.minHeight && objectHeight < constraints.minHeight) {
    violations.push(`Height ${objectHeight} is below minimum ${constraints.minHeight}`);
  }
  
  if (constraints.maxHeight && objectHeight > constraints.maxHeight) {
    violations.push(`Height ${objectHeight} exceeds maximum ${constraints.maxHeight}`);
  }
  
  return { isValid: violations.length === 0, violations };
};

// Performance optimizations
export const optimizeObjectPerformance = (object: QRCodeObject | UUIDObject): void => {
  // Disable unnecessary features for better performance using individual set calls
  (object as any).perPixelTargetFind = false;
  (object as any).moveCursor = 'move';
  (object as any).hoverCursor = 'move';
  
  // Enable object caching for static objects
  if (!object.metadata.locked) {
    object.objectCaching = true;
  }
};
