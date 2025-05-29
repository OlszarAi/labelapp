// Professional Fabric.js utilities for the advanced label editor

import { fabric } from 'fabric';

export type CanvasUnit = 'mm' | 'px' | 'in';

export interface CanvasConfig {
  width: number;
  height: number;
  unit: CanvasUnit;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  gridColor?: string;
  rulersEnabled?: boolean;
  snapToGrid?: boolean;
  snapThreshold?: number;
}

export interface GridOptions {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
}

export interface RulerOptions {
  enabled: boolean;
  unit: CanvasUnit;
  majorTickSize: number;
  minorTickSize: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
}

/**
 * Professional Fabric.js utilities with advanced features
 */
export class FabricUtils {
  
  /**
   * Unit conversion utilities
   */
  static readonly UNITS_TO_PX = {
    mm: 3.7795275591, // 96 DPI
    px: 1,
    in: 96
  };

  static readonly PX_TO_UNITS = {
    mm: 1 / 3.7795275591,
    px: 1,
    in: 1 / 96
  };

  /**
   * Convert units to pixels
   */
  static convertToPixels(value: number, unit: CanvasUnit): number {
    return value * this.UNITS_TO_PX[unit];
  }

  /**
   * Convert pixels to units
   */
  static convertFromPixels(value: number, unit: CanvasUnit): number {
    return value * this.PX_TO_UNITS[unit];
  }

  /**
   * Initialize a professional Fabric.js canvas with advanced features
   */
  static initializeCanvas(canvasElement: HTMLCanvasElement, config: CanvasConfig): fabric.Canvas {
    const canvas = new fabric.Canvas(canvasElement, {
      width: this.convertToPixels(config.width, config.unit),
      height: this.convertToPixels(config.height, config.unit),
      backgroundColor: config.backgroundColor || '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      skipTargetFind: false,
      allowTouchScrolling: false,
      centeredScaling: false,
      centeredRotation: true,
      perPixelTargetFind: true,
      targetFindTolerance: 4,
      devicePixelRatio: window.devicePixelRatio || 1,
    });

    // Configure custom selection styling
    this.configureSelectionStyling(canvas);

    // Setup boundary enforcement
    this.setupBoundaryEnforcement(canvas);

    // Setup keyboard shortcuts
    this.setupKeyboardHandlers(canvas);

    return canvas;
  }

  /**
   * Configure custom selection styling for professional look
   */
  static configureSelectionStyling(canvas: fabric.Canvas): void {
    fabric.Object.prototype.set({
      borderColor: '#2563eb',
      borderDashArray: [5, 5],
      borderOpacityWhenMoving: 0.8,
      borderScaleFactor: 1,
      cornerColor: '#2563eb',
      cornerStyle: 'rect',
      cornerSize: 8,
      transparentCorners: false,
      cornerStrokeColor: '#ffffff',
      hasBorders: true,
      hasControls: true,
      padding: 0,
    });

    // Multi-selection styling
    canvas.selectionColor = 'rgba(37, 99, 235, 0.1)';
    canvas.selectionBorderColor = '#2563eb';
    canvas.selectionLineWidth = 1;
    canvas.selectionDashArray = [5, 5];
  }

  /**
   * Setup boundary enforcement to prevent objects from moving outside canvas
   */
  static setupBoundaryEnforcement(canvas: fabric.Canvas): void {
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      
      // Get object bounds
      const left = obj.left!;
      const top = obj.top!;
      const width = obj.getScaledWidth();
      const height = obj.getScaledHeight();

      // Enforce boundaries
      if (left < 0) obj.set('left', 0);
      if (top < 0) obj.set('top', 0);
      if (left + width > canvasWidth) obj.set('left', canvasWidth - width);
      if (top + height > canvasHeight) obj.set('top', canvasHeight - height);
    });

    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (!obj) return;

      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      
      const left = obj.left!;
      const top = obj.top!;
      const width = obj.getScaledWidth();
      const height = obj.getScaledHeight();

      // Prevent scaling beyond canvas bounds
      if (left + width > canvasWidth || top + height > canvasHeight) {
        const maxScaleX = (canvasWidth - left) / obj.width!;
        const maxScaleY = (canvasHeight - top) / obj.height!;
        const maxScale = Math.min(maxScaleX, maxScaleY, obj.scaleX!, obj.scaleY!);
        
        obj.set({
          scaleX: Math.min(obj.scaleX!, maxScale),
          scaleY: Math.min(obj.scaleY!, maxScale)
        });
      }
    });
  }

  /**
   * Setup keyboard handlers for professional shortcuts
   */
  static setupKeyboardHandlers(canvas: fabric.Canvas): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for our shortcuts
      const activeObject = canvas.getActiveObject();
      
      if (e.key === 'Delete' && activeObject) {
        e.preventDefault();
        canvas.remove(activeObject);
        canvas.renderAll();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Arrow key movement
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && activeObject) {
        e.preventDefault();
        const moveDistance = e.shiftKey ? 10 : 1;
        
        switch (e.key) {
          case 'ArrowUp':
            activeObject.set('top', Math.max(0, activeObject.top! - moveDistance));
            break;
          case 'ArrowDown':
            activeObject.set('top', Math.min(canvas.height! - activeObject.getScaledHeight(), activeObject.top! + moveDistance));
            break;
          case 'ArrowLeft':
            activeObject.set('left', Math.max(0, activeObject.left! - moveDistance));
            break;
          case 'ArrowRight':
            activeObject.set('left', Math.min(canvas.width! - activeObject.getScaledWidth(), activeObject.left! + moveDistance));
            break;
        }
        
        canvas.renderAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Store reference for cleanup
    (canvas as any).__keydownHandler = handleKeyDown;
  }

  /**
   * Create and render grid on canvas
   */
  static createGrid(canvas: fabric.Canvas, options: GridOptions): void {
    if (!options.enabled) {
      this.removeGrid(canvas);
      return;
    }

    this.removeGrid(canvas); // Remove existing grid

    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    const gridSize = options.size;

    const gridGroup = new fabric.Group([], {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      name: 'grid'
    });

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      const line = new fabric.Line([x, 0, x, canvasHeight], {
        stroke: options.color,
        strokeWidth: 0.5,
        opacity: options.opacity,
        selectable: false,
        evented: false,
      });
      gridGroup.addWithUpdate(line);
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      const line = new fabric.Line([0, y, canvasWidth, y], {
        stroke: options.color,
        strokeWidth: 0.5,
        opacity: options.opacity,
        selectable: false,
        evented: false,
      });
      gridGroup.addWithUpdate(line);
    }

    canvas.add(gridGroup);
    canvas.sendToBack(gridGroup);
    canvas.renderAll();
  }

  /**
   * Remove grid from canvas
   */
  static removeGrid(canvas: fabric.Canvas): void {
    const objects = canvas.getObjects();
    const grid = objects.find(obj => (obj as any).name === 'grid');
    if (grid) {
      canvas.remove(grid);
      canvas.renderAll();
    }
  }

  /**
   * Setup snap-to-grid functionality
   */
  static setupSnapToGrid(canvas: fabric.Canvas, enabled: boolean, gridSize: number, threshold: number = 5): void {
    if (!enabled) {
      canvas.off('object:moving', this.snapToGridHandler);
      return;
    }

    const snapToGridHandler = (e: fabric.IEvent) => {
      const obj = e.target;
      if (!obj) return;

      const left = obj.left!;
      const top = obj.top!;

      // Snap to grid
      const snappedLeft = Math.round(left / gridSize) * gridSize;
      const snappedTop = Math.round(top / gridSize) * gridSize;

      if (Math.abs(left - snappedLeft) < threshold) {
        obj.set('left', snappedLeft);
      }
      if (Math.abs(top - snappedTop) < threshold) {
        obj.set('top', snappedTop);
      }
    };

    this.snapToGridHandler = snapToGridHandler;
    canvas.on('object:moving', snapToGridHandler);
  }

  private static snapToGridHandler: (e: fabric.IEvent) => void;

  /**
   * Create rulers for canvas
   */
  static createRulers(canvasContainer: HTMLElement, canvas: fabric.Canvas, options: RulerOptions): void {
    if (!options.enabled) {
      this.removeRulers(canvasContainer);
      return;
    }

    this.removeRulers(canvasContainer);

    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // Create horizontal ruler
    const horizontalRuler = document.createElement('div');
    horizontalRuler.className = 'fabric-ruler fabric-ruler-horizontal';
    horizontalRuler.style.cssText = `
      position: absolute;
      top: 0;
      left: 25px;
      width: ${canvasWidth}px;
      height: 25px;
      background-color: ${options.backgroundColor};
      border-bottom: 1px solid ${options.color};
      font-size: ${options.fontSize}px;
      font-family: Arial, sans-serif;
      color: ${options.color};
      z-index: 10;
    `;

    // Create vertical ruler
    const verticalRuler = document.createElement('div');
    verticalRuler.className = 'fabric-ruler fabric-ruler-vertical';
    verticalRuler.style.cssText = `
      position: absolute;
      top: 25px;
      left: 0;
      width: 25px;
      height: ${canvasHeight}px;
      background-color: ${options.backgroundColor};
      border-right: 1px solid ${options.color};
      font-size: ${options.fontSize}px;
      font-family: Arial, sans-serif;
      color: ${options.color};
      writing-mode: vertical-lr;
      text-orientation: mixed;
      z-index: 10;
    `;

    // Add ruler marks
    this.addRulerMarks(horizontalRuler, canvasWidth, options, 'horizontal');
    this.addRulerMarks(verticalRuler, canvasHeight, options, 'vertical');

    canvasContainer.appendChild(horizontalRuler);
    canvasContainer.appendChild(verticalRuler);
  }

  /**
   * Add ruler marks to ruler element
   */
  private static addRulerMarks(ruler: HTMLElement, size: number, options: RulerOptions, orientation: 'horizontal' | 'vertical'): void {
    const unit = options.unit;
    const pixelsPerUnit = this.UNITS_TO_PX[unit];
    const majorTickInterval = options.majorTickSize;
    const minorTickInterval = options.minorTickSize;

    for (let pos = 0; pos <= size; pos += pixelsPerUnit * minorTickInterval) {
      const unitValue = this.convertFromPixels(pos, unit);
      const isMajorTick = unitValue % majorTickInterval === 0;
      
      const tick = document.createElement('div');
      tick.style.position = 'absolute';
      tick.style.backgroundColor = options.color;
      
      if (orientation === 'horizontal') {
        tick.style.left = `${pos}px`;
        tick.style.top = isMajorTick ? '15px' : '20px';
        tick.style.width = '1px';
        tick.style.height = isMajorTick ? '10px' : '5px';
        
        if (isMajorTick && unitValue % (majorTickInterval * 2) === 0) {
          const label = document.createElement('div');
          label.textContent = Math.round(unitValue).toString();
          label.style.position = 'absolute';
          label.style.left = `${pos + 2}px`;
          label.style.top = '2px';
          label.style.fontSize = `${options.fontSize}px`;
          label.style.color = options.color;
          ruler.appendChild(label);
        }
      } else {
        tick.style.top = `${pos}px`;
        tick.style.left = isMajorTick ? '15px' : '20px';
        tick.style.height = '1px';
        tick.style.width = isMajorTick ? '10px' : '5px';
        
        if (isMajorTick && unitValue % (majorTickInterval * 2) === 0) {
          const label = document.createElement('div');
          label.textContent = Math.round(unitValue).toString();
          label.style.position = 'absolute';
          label.style.top = `${pos + 2}px`;
          label.style.left = '2px';
          label.style.fontSize = `${options.fontSize}px`;
          label.style.color = options.color;
          label.style.writingMode = 'horizontal-tb';
          ruler.appendChild(label);
        }
      }
      
      ruler.appendChild(tick);
    }
  }

  /**
   * Remove rulers from container
   */
  static removeRulers(container: HTMLElement): void {
    const rulers = container.querySelectorAll('.fabric-ruler');
    rulers.forEach(ruler => ruler.remove());
  }

  /**
   * Update canvas size with unit conversion
   */
  static updateCanvasSize(canvas: fabric.Canvas, width: number, height: number, unit: CanvasUnit): void {
    const pixelWidth = this.convertToPixels(width, unit);
    const pixelHeight = this.convertToPixels(height, unit);
    
    canvas.setDimensions({
      width: pixelWidth,
      height: pixelHeight
    });
    
    canvas.renderAll();
  }

  /**
   * Clean up event listeners and handlers
   */
  static cleanup(canvas: fabric.Canvas): void {
    // Remove keyboard handler
    const keydownHandler = (canvas as any).__keydownHandler;
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      delete (canvas as any).__keydownHandler;
    }

    // Remove snap to grid handler
    if (this.snapToGridHandler) {
      canvas.off('object:moving', this.snapToGridHandler);
    }

    // Remove grid
    this.removeGrid(canvas);
  }

  /**
   * Setup zoom and pan functionality
   */
  static setupZoomAndPan(canvas: fabric.Canvas): void {
    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      
      // Limit zoom range
      zoom = Math.max(0.1, Math.min(5, zoom));
      
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan with space + mouse drag
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        isPanning = true;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        canvas.selection = false;
        canvas.forEachObject(obj => obj.set('selectable', false));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPanning) {
        isPanning = false;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.selection = true;
        canvas.forEachObject(obj => obj.set('selectable', true));
      }
    };

    const handleMouseDown = (opt: fabric.IEvent) => {
      if (isPanning) {
        canvas.isDragging = true;
        canvas.selection = false;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        canvas.defaultCursor = 'grabbing';
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (canvas.isDragging && isPanning) {
        const vpt = canvas.viewportTransform!;
        vpt[4] += opt.e.clientX - lastPosX;
        vpt[5] += opt.e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = 'grab';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    // Store handlers for cleanup
    (canvas as any).__panHandlers = {
      keydown: handleKeyDown,
      keyup: handleKeyUp,
      mousedown: handleMouseDown,
      mousemove: handleMouseMove,
      mouseup: handleMouseUp
    };
  }

  /**
   * Cleanup zoom and pan handlers
   */
  static cleanupZoomAndPan(canvas: fabric.Canvas): void {
    const handlers = (canvas as any).__panHandlers;
    if (handlers) {
      document.removeEventListener('keydown', handlers.keydown);
      document.removeEventListener('keyup', handlers.keyup);
      canvas.off('mouse:down', handlers.mousedown);
      canvas.off('mouse:move', handlers.mousemove);
      canvas.off('mouse:up', handlers.mouseup);
      delete (canvas as any).__panHandlers;
    }
  }
}

export default FabricUtils;
