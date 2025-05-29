// Essential Fabric.js utilities for the label editor

import { fabric } from 'fabric';

/**
 * Basic Fabric.js utilities for canvas initialization
 */
export class FabricUtils {
  
  /**
   * Initialize a new Fabric.js canvas with default settings
   */
  static initializeCanvas(canvasElement: HTMLCanvasElement, options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  } = {}): fabric.Canvas {
    const canvas = new fabric.Canvas(canvasElement, {
      width: options.width || 800,
      height: options.height || 600,
      backgroundColor: options.backgroundColor || '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
    });

    return canvas;
  }
}

export default FabricUtils;
