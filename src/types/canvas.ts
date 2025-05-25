/**
 * Canvas-specific Types
 * Interfaces and types for canvas state management
 */

// Canvas-specific interfaces will be defined here

/**
 * Canvas state interface
 */
export interface CanvasState {
  // Canvas state properties will be defined here
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  isDirty: boolean;
  lastSaved?: Date;
}

/**
 * Canvas dimensions interface
 */
export interface CanvasDimensions {
  width: number;
  height: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Canvas object selection interface
 */
export interface ObjectSelection {
  // Selection properties will be defined here
  selectedObjects: string[];
  selectionType: 'single' | 'multiple' | 'none';
}

/**
 * Canvas history entry interface
 */
export interface CanvasHistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  canvasData: string; // JSON string
}

/**
 * Canvas export options
 */
export interface ExportOptions {
  format: 'json' | 'png' | 'jpeg' | 'svg' | 'pdf';
  quality?: number;
  dpi?: number;
  includeMetadata?: boolean;
}
