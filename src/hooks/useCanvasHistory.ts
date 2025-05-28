/**
 * Enhanced Canvas History Hook
 * Advanced undo/redo functionality with performance optimization and metadata
 */

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { fabric } from 'fabric';
import { HistoryActionType } from '../types/fabric';

/**
 * History state interface with enhanced metadata
 */
interface HistoryState {
  id: string;
  canvasData: string;
  compressedData?: string; // Compressed version for memory efficiency
  timestamp: number;
  actionType: HistoryActionType;
  description: string;
  objectIds: string[]; // IDs of affected objects
  
  // Performance metadata
  dataSize: number;
  compressionRatio?: number;
  
  // User context
  userId?: string;
  sessionId?: string;
  
  // Change metadata
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

/**
 * History configuration options
 */
interface CanvasHistoryOptions {
  maxHistorySize?: number;     // Default: 50
  debounceMs?: number;         // Default: 500
  enableCompression?: boolean; // Default: true
  enableLogging?: boolean;     // Default: false
  compressionThreshold?: number; // Compress if data > N bytes (default: 10KB)
  ignoreMinorChanges?: boolean;  // Default: true
  minorChangeThreshold?: number; // Bytes diff threshold (default: 100)
}

/**
 * Hook return interface
 */
interface UseCanvasHistoryReturn {
  // Core functionality
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveState: (actionType?: HistoryActionType, description?: string, metadata?: Record<string, any>) => void;
  clearHistory: () => void;
  
  // Enhanced functionality
  saveStateNow: (actionType?: HistoryActionType, description?: string) => void; // No debounce
  getHistory: () => HistoryState[];
  getHistoryMetadata: () => { 
    totalStates: number; 
    currentIndex: number; 
    memoryUsage: number;
    compressionRatio: number;
  };
  
  // State queries
  historySize: number;
  currentHistoryIndex: number;
  canNavigateToIndex: (index: number) => boolean;
  navigateToIndex: (index: number) => void;
  
  // Performance
  getMemoryUsage: () => number;
  compressHistory: () => void;
  cleanupOldStates: (keepCount?: number) => void;
}

/**
 * Utility functions for history management
 */
class HistoryUtils {
  static generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getSessionId(): string {
    // Use existing session ID or create a new one
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('canvas_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('canvas_session_id', sessionId);
      }
      return sessionId;
    }
    return 'server_session';
  }

  static calculateDataSize(data: string): number {
    return new Blob([data]).size;
  }

  static compressData(data: string): string {
    // Simple compression using built-in compression
    try {
      // For browsers that support compression streams
      if (typeof CompressionStream !== 'undefined') {
        // Note: CompressionStream is async, so we'll use a simplified approach
        // In a real implementation, you might want to use a library like pako
        return data; // Placeholder - implement actual compression
      }
      
      // Fallback: basic string compression
      return data.replace(/\s+/g, ' ').replace(/,\s*/g, ',').replace(/:\s*/g, ':');
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return data;
    }
  }

  static detectActionType(
    previousData: string | null, 
    currentData: string,
    canvas: fabric.Canvas
  ): HistoryActionType {
    if (!previousData) return HistoryActionType.ADD;

    try {
      const prevState = JSON.parse(previousData);
      const currState = JSON.parse(currentData);
      
      const prevObjects = prevState.objects || [];
      const currObjects = currState.objects || [];
      
      // Check for object count changes
      if (currObjects.length > prevObjects.length) {
        return HistoryActionType.ADD;
      } else if (currObjects.length < prevObjects.length) {
        return HistoryActionType.REMOVE;
      }
      
      // Check for modifications
      for (let i = 0; i < currObjects.length; i++) {
        const prevObj = prevObjects[i];
        const currObj = currObjects[i];
        
        if (prevObj && currObj) {
          // Check for position changes
          if (prevObj.left !== currObj.left || prevObj.top !== currObj.top) {
            return HistoryActionType.MOVE;
          }
          
          // Check for size changes
          if (prevObj.width !== currObj.width || prevObj.height !== currObj.height ||
              prevObj.scaleX !== currObj.scaleX || prevObj.scaleY !== currObj.scaleY) {
            return HistoryActionType.RESIZE;
          }
          
          // Check for rotation
          if (prevObj.angle !== currObj.angle) {
            return HistoryActionType.ROTATE;
          }
          
          // Check for text changes
          if (prevObj.type === 'text' && prevObj.text !== currObj.text) {
            return HistoryActionType.TEXT_EDIT;
          }
          
          // Check for style changes
          if (prevObj.fill !== currObj.fill || prevObj.stroke !== currObj.stroke) {
            return HistoryActionType.STYLE_CHANGE;
          }
        }
      }
      
      return HistoryActionType.MODIFY;
    } catch (error) {
      console.warn('Failed to detect action type:', error);
      return HistoryActionType.MODIFY;
    }
  }

  static generateDescription(actionType: HistoryActionType, objectCount: number = 0): string {
    switch (actionType) {
      case HistoryActionType.ADD:
        return objectCount > 1 ? `Added ${objectCount} objects` : 'Added object';
      case HistoryActionType.REMOVE:
        return objectCount > 1 ? `Removed ${objectCount} objects` : 'Removed object';
      case HistoryActionType.MOVE:
        return objectCount > 1 ? `Moved ${objectCount} objects` : 'Moved object';
      case HistoryActionType.RESIZE:
        return objectCount > 1 ? `Resized ${objectCount} objects` : 'Resized object';
      case HistoryActionType.ROTATE:
        return objectCount > 1 ? `Rotated ${objectCount} objects` : 'Rotated object';
      case HistoryActionType.GROUP:
        return 'Grouped objects';
      case HistoryActionType.UNGROUP:
        return 'Ungrouped objects';
      case HistoryActionType.STYLE_CHANGE:
        return 'Changed style';
      case HistoryActionType.TEXT_EDIT:
        return 'Edited text';
      case HistoryActionType.LAYER_CHANGE:
        return 'Changed layer order';
      case HistoryActionType.LOCK:
        return 'Locked object';
      case HistoryActionType.UNLOCK:
        return 'Unlocked object';
      default:
        return 'Modified canvas';
    }
  }

  static extractObjectIds(canvasData: string): string[] {
    try {
      const state = JSON.parse(canvasData);
      const objects = state.objects || [];
      return objects
        .map((obj: any) => obj.id || obj.uuid)
        .filter((id: string) => !!id);
    } catch (error) {
      console.warn('Failed to extract object IDs:', error);
      return [];
    }
  }

  static isMinorChange(previousData: string, currentData: string, threshold: number): boolean {
    const sizeDiff = Math.abs(currentData.length - previousData.length);
    return sizeDiff < threshold;
  }
}

/**
 * Enhanced Canvas History Hook
 */
export const useCanvasHistory = (
  canvas?: fabric.Canvas | null,
  options: CanvasHistoryOptions = {}
): UseCanvasHistoryReturn => {
  const {
    maxHistorySize = 50,
    debounceMs = 500,
    enableCompression = true,
    enableLogging = false,
    compressionThreshold = 10240, // 10KB
    ignoreMinorChanges = true,
    minorChangeThreshold = 100
  } = options;

  // State
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Refs for performance and control
  const isUndoRedo = useRef(false);
  const lastSavedData = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(HistoryUtils.generateId());

  // Debounced save state function
  const debouncedSaveState = useCallback((
    actionType: HistoryActionType = HistoryActionType.MODIFY,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveStateNow(actionType, description);
    }, debounceMs);
  }, [debounceMs]);

  // Immediate save state function
  const saveStateNow = useCallback((
    actionType: HistoryActionType = HistoryActionType.MODIFY,
    description?: string
  ) => {
    if (!canvas || isUndoRedo.current) return;

    try {
      const canvasData = JSON.stringify(canvas.toJSON());
      
      // Check for minor changes if enabled
      if (ignoreMinorChanges && lastSavedData.current) {
        if (HistoryUtils.isMinorChange(lastSavedData.current, canvasData, minorChangeThreshold)) {
          if (enableLogging) {
            console.log('🔄 Canvas History: Ignoring minor change');
          }
          return;
        }
      }

      // Auto-detect action type if not provided
      const detectedActionType = actionType || HistoryUtils.detectActionType(
        lastSavedData.current || null, 
        canvasData, 
        canvas
      );

      // Extract object information
      const objectIds = HistoryUtils.extractObjectIds(canvasData);
      const dataSize = HistoryUtils.calculateDataSize(canvasData);
      
      // Generate description if not provided
      const finalDescription = description || HistoryUtils.generateDescription(
        detectedActionType, 
        objectIds.length
      );

      // Create compressed data if needed
      let compressedData: string | undefined;
      let compressionRatio: number | undefined;
      
      if (enableCompression && dataSize > compressionThreshold) {
        compressedData = HistoryUtils.compressData(canvasData);
        compressionRatio = compressedData.length / canvasData.length;
      }

      const newState: HistoryState = {
        id: HistoryUtils.generateId(),
        canvasData,
        compressedData,
        timestamp: Date.now(),
        actionType: detectedActionType,
        description: finalDescription,
        objectIds,
        dataSize,
        compressionRatio,
        sessionId: sessionId.current
      };

      setHistory(prev => {
        // Remove any redo states if we're not at the end
        const trimmedHistory = prev.slice(0, currentIndex + 1);
        
        // Add new state
        const newHistory = [...trimmedHistory, newState];
        
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          const removed = newHistory.slice(0, newHistory.length - maxHistorySize);
          if (enableLogging) {
            console.log(`🗑️ Canvas History: Removed ${removed.length} old states`);
          }
          return newHistory.slice(-maxHistorySize);
        }
        
        return newHistory;
      });

      setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
      lastSavedData.current = canvasData;
      
      if (enableLogging) {
        console.log(`💾 Canvas History: Saved state - ${finalDescription}`, {
          actionType: detectedActionType,
          objects: objectIds.length,
          size: `${(dataSize / 1024).toFixed(1)}KB`,
          compressed: !!compressedData,
          ratio: compressionRatio?.toFixed(2)
        });
      }
      
    } catch (error) {
      console.error('❌ Canvas History: Failed to save state:', error);
    }
  }, [
    canvas, 
    currentIndex, 
    maxHistorySize, 
    enableCompression, 
    compressionThreshold, 
    enableLogging,
    ignoreMinorChanges,
    minorChangeThreshold
  ]);

  // Public save state function (debounced)
  const saveState = useCallback((
    actionType?: HistoryActionType,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    debouncedSaveState(actionType || HistoryActionType.MODIFY, description, metadata);
  }, [debouncedSaveState]);

  // Undo function
  const undo = useCallback(() => {
    if (!canvas || currentIndex <= 0) return;

    isUndoRedo.current = true;
    
    const previousState = history[currentIndex - 1];
    if (previousState) {
      const dataToLoad = previousState.compressedData || previousState.canvasData;
      
      canvas.loadFromJSON(dataToLoad, () => {
        canvas.renderAll();
        isUndoRedo.current = false;
        
        if (enableLogging) {
          console.log(`↶ Canvas History: Undo - ${previousState.description}`);
        }
      });
      
      setCurrentIndex(prev => prev - 1);
      lastSavedData.current = dataToLoad;
    }
  }, [canvas, history, currentIndex, enableLogging]);

  // Redo function
  const redo = useCallback(() => {
    if (!canvas || currentIndex >= history.length - 1) return;

    isUndoRedo.current = true;
    
    const nextState = history[currentIndex + 1];
    if (nextState) {
      const dataToLoad = nextState.compressedData || nextState.canvasData;
      
      canvas.loadFromJSON(dataToLoad, () => {
        canvas.renderAll();
        isUndoRedo.current = false;
        
        if (enableLogging) {
          console.log(`↷ Canvas History: Redo - ${nextState.description}`);
        }
      });
      
      setCurrentIndex(prev => prev + 1);
      lastSavedData.current = dataToLoad;
    }
  }, [canvas, history, currentIndex, enableLogging]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastSavedData.current = '';
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    if (enableLogging) {
      console.log('🧹 Canvas History: Cleared all history');
    }
  }, [enableLogging]);

  // Get history array
  const getHistory = useCallback(() => {
    return [...history];
  }, [history]);

  // Get history metadata
  const getHistoryMetadata = useCallback(() => {
    const totalSize = history.reduce((sum, state) => sum + state.dataSize, 0);
    const compressedSize = history.reduce((sum, state) => 
      sum + (state.compressedData?.length || state.dataSize), 0
    );
    
    return {
      totalStates: history.length,
      currentIndex,
      memoryUsage: totalSize,
      compressionRatio: totalSize > 0 ? compressedSize / totalSize : 1
    };
  }, [history, currentIndex]);

  // Navigation functions
  const canNavigateToIndex = useCallback((index: number) => {
    return index >= 0 && index < history.length;
  }, [history.length]);

  const navigateToIndex = useCallback((index: number) => {
    if (!canvas || !canNavigateToIndex(index)) return;

    isUndoRedo.current = true;
    
    const targetState = history[index];
    if (targetState) {
      const dataToLoad = targetState.compressedData || targetState.canvasData;
      
      canvas.loadFromJSON(dataToLoad, () => {
        canvas.renderAll();
        isUndoRedo.current = false;
        
        if (enableLogging) {
          console.log(`🎯 Canvas History: Navigate to ${targetState.description}`);
        }
      });
      
      setCurrentIndex(index);
      lastSavedData.current = dataToLoad;
    }
  }, [canvas, history, canNavigateToIndex, enableLogging]);

  // Performance functions
  const getMemoryUsage = useCallback(() => {
    return history.reduce((sum, state) => sum + state.dataSize, 0);
  }, [history]);

  const compressHistory = useCallback(() => {
    if (!enableCompression) return;
    
    setHistory(prev => prev.map(state => {
      if (!state.compressedData && state.dataSize > compressionThreshold) {
        const compressed = HistoryUtils.compressData(state.canvasData);
        return {
          ...state,
          compressedData: compressed,
          compressionRatio: compressed.length / state.canvasData.length
        };
      }
      return state;
    }));
    
    if (enableLogging) {
      console.log('🗜️ Canvas History: Compressed existing states');
    }
  }, [enableCompression, compressionThreshold, enableLogging]);

  const cleanupOldStates = useCallback((keepCount: number = 20) => {
    if (history.length <= keepCount) return;
    
    const statesToRemove = history.length - keepCount;
    setHistory(prev => prev.slice(statesToRemove));
    setCurrentIndex(prev => Math.max(0, prev - statesToRemove));
    
    if (enableLogging) {
      console.log(`🧹 Canvas History: Cleaned up ${statesToRemove} old states`);
    }
  }, [history.length, enableLogging]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Initialize with current canvas state if available
  useEffect(() => {
    if (canvas && history.length === 0) {
      // Save initial state without debounce
      saveStateNow(HistoryActionType.ADD, 'Initial canvas state');
    }
  }, [canvas, history.length, saveStateNow]);

  // Computed values
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    // Core functionality
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    clearHistory,
    
    // Enhanced functionality  
    saveStateNow,
    getHistory,
    getHistoryMetadata,
    
    // State queries
    historySize: history.length,
    currentHistoryIndex: currentIndex,
    canNavigateToIndex,
    navigateToIndex,
    
    // Performance
    getMemoryUsage,
    compressHistory,
    cleanupOldStates
  };
};

export type { HistoryState, CanvasHistoryOptions, UseCanvasHistoryReturn };
