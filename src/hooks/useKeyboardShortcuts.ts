/**
 * Keyboard Shortcuts Hook
 * Handles keyboard shortcuts for canvas operations
 */

import { useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';

// Keyboard shortcut configuration
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void | Promise<void>;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
}

// Hook options interface
interface UseKeyboardShortcutsOptions {
  // Canvas and state
  canvas?: fabric.Canvas | null;
  canvasFocused?: boolean;
  
  // History actions
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Object actions
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  
  // Canvas actions
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onToggleGrid?: () => void;
  onToggleRulers?: () => void;
  
  // Tool actions
  onTextTool?: () => void;
  onQRCodeTool?: () => void;
  onUUIDTool?: () => void;
  
  // Help actions
  onShowHelp?: () => void;
  
  // Pan actions
  onStartPan?: () => void;
  onEndPan?: () => void;
  
  // Movement actions
  onMoveSelected?: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void;
  
  // Configuration
  enabled?: boolean;
  moveStep?: number;
  fastMoveStep?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// Hook return interface
interface UseKeyboardShortcutsReturn {
  shortcuts: KeyboardShortcut[];
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  getShortcutDescription: (action: string) => string | undefined;
  getShortcutTooltip: (action: string) => string | undefined;
}

// Platform detection
const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const modifierKey = isMac ? 'Cmd' : 'Ctrl';

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}): UseKeyboardShortcutsReturn => {
  const {
    canvas,
    canvasFocused = true,
    onUndo,
    onRedo,
    canUndo = true,
    canRedo = true,
    onDelete,
    onCopy,
    onPaste,
    onDuplicate,
    onSelectAll,
    onDeselectAll,
    onZoomIn,
    onZoomOut,
    onFitToScreen,
    onToggleGrid,
    onToggleRulers,
    onTextTool,
    onQRCodeTool,
    onUUIDTool,
    onShowHelp,
    onStartPan,
    onEndPan,
    onMoveSelected,
    enabled = true,
    moveStep = 1,
    fastMoveStep = 10,
    preventDefault = true,
    stopPropagation = true
  } = options;

  const enabledRef = useRef(enabled);
  const panningRef = useRef(false);
  const spaceKeyDownRef = useRef(false);
  const mouseDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Update enabled ref when prop changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Handle object movement
  const moveSelectedObjects = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number) => {
    if (!canvas || !onMoveSelected) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    onMoveSelected(direction, distance);

    // Also handle direct movement if no callback provided
    activeObjects.forEach(obj => {
      const currentLeft = obj.left || 0;
      const currentTop = obj.top || 0;

      switch (direction) {
        case 'left':
          obj.set({ left: currentLeft - distance });
          break;
        case 'right':
          obj.set({ left: currentLeft + distance });
          break;
        case 'up':
          obj.set({ top: currentTop - distance });
          break;
        case 'down':
          obj.set({ top: currentTop + distance });
          break;
      }
      obj.setCoords();
    });

    canvas.renderAll();
  }, [canvas, onMoveSelected]);

  // Handle panning
  const handlePanStart = useCallback(() => {
    if (!panningRef.current && onStartPan) {
      panningRef.current = true;
      onStartPan();
    }
  }, [onStartPan]);

  const handlePanEnd = useCallback(() => {
    if (panningRef.current && onEndPan) {
      panningRef.current = false;
      onEndPan();
    }
  }, [onEndPan]);

  // Handle mouse events for Space+drag panning
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (spaceKeyDownRef.current && canvas) {
      mouseDownRef.current = true;
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      
      // Change cursor to grabbing when panning starts
      const canvasEl = canvas.getElement();
      if (canvasEl && canvasEl.style) {
        canvasEl.style.cursor = 'grabbing';
      }
      
      event.preventDefault();
      event.stopPropagation();
    }
  }, [canvas]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (spaceKeyDownRef.current && mouseDownRef.current && canvas) {
      const deltaX = event.clientX - lastMousePosRef.current.x;
      const deltaY = event.clientY - lastMousePosRef.current.y;
      
      // Pan the canvas
      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] += deltaX;
        vpt[5] += deltaY;
        canvas.setViewportTransform(vpt);
        canvas.renderAll();
      }
      
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
      event.stopPropagation();
    }
  }, [canvas]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (mouseDownRef.current && canvas) {
      mouseDownRef.current = false;
      
      // Reset cursor when panning ends
      const canvasEl = canvas.getElement();
      if (canvasEl && canvasEl.style) {
        canvasEl.style.cursor = spaceKeyDownRef.current ? 'grab' : 'default';
      }
      
      event.preventDefault();
      event.stopPropagation();
    }
  }, [canvas]);

  // Shortcut definitions
  const shortcuts: KeyboardShortcut[] = [
    // History shortcuts
    {
      key: 'z',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Undo',
      action: () => {
        if (canUndo && onUndo) {
          onUndo();
        }
      },
      enabled: !!onUndo && canUndo
    },
    {
      key: 'y',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Redo',
      action: () => {
        if (canRedo && onRedo) {
          onRedo();
        }
      },
      enabled: !!onRedo && canRedo
    },
    {
      key: 'z',
      ctrlKey: !isMac,
      metaKey: isMac,
      shiftKey: true,
      description: 'Redo (Shift+Ctrl+Z)',
      action: () => {
        if (canRedo && onRedo) {
          onRedo();
        }
      },
      enabled: !!onRedo && canRedo
    },
    
    // Object manipulation shortcuts
    {
      key: 'Delete',
      description: 'Delete selected objects',
      action: () => {
        if (onDelete) onDelete();
      },
      enabled: !!onDelete
    },
    {
      key: 'Backspace',
      description: 'Delete selected objects',
      action: () => {
        if (onDelete) onDelete();
      },
      enabled: !!onDelete
    },
    {
      key: 'c',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Copy',
      action: () => {
        if (onCopy) onCopy();
      },
      enabled: !!onCopy
    },
    {
      key: 'v',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Paste',
      action: () => {
        if (onPaste) onPaste();
      },
      enabled: !!onPaste
    },
    {
      key: 'd',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Duplicate',
      action: () => {
        if (onDuplicate) onDuplicate();
      },
      enabled: !!onDuplicate
    },
    {
      key: 'a',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Select all',
      action: () => {
        if (onSelectAll) onSelectAll();
      },
      enabled: !!onSelectAll
    },
    {
      key: 'Escape',
      description: 'Deselect all',
      action: () => {
        if (onDeselectAll) onDeselectAll();
      },
      enabled: !!onDeselectAll
    },
    
    // Movement shortcuts
    {
      key: 'ArrowUp',
      description: 'Move up',
      action: () => moveSelectedObjects('up', moveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowDown',
      description: 'Move down',
      action: () => moveSelectedObjects('down', moveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowLeft',
      description: 'Move left',
      action: () => moveSelectedObjects('left', moveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowRight',
      description: 'Move right',
      action: () => moveSelectedObjects('right', moveStep),
      enabled: !!canvas
    },
    
    // Fast movement shortcuts (with Shift)
    {
      key: 'ArrowUp',
      shiftKey: true,
      description: 'Move up (fast)',
      action: () => moveSelectedObjects('up', fastMoveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowDown',
      shiftKey: true,
      description: 'Move down (fast)',
      action: () => moveSelectedObjects('down', fastMoveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowLeft',
      shiftKey: true,
      description: 'Move left (fast)',
      action: () => moveSelectedObjects('left', fastMoveStep),
      enabled: !!canvas
    },
    {
      key: 'ArrowRight',
      shiftKey: true,
      description: 'Move right (fast)',
      action: () => moveSelectedObjects('right', fastMoveStep),
      enabled: !!canvas
    },
    
    // Zoom shortcuts
    {
      key: '=',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Zoom in',
      action: () => {
        if (onZoomIn) onZoomIn();
      },
      enabled: !!onZoomIn
    },
    {
      key: '+',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Zoom in',
      action: () => {
        if (onZoomIn) onZoomIn();
      },
      enabled: !!onZoomIn
    },
    {
      key: '-',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Zoom out',
      action: () => {
        if (onZoomOut) onZoomOut();
      },
      enabled: !!onZoomOut
    },
    {
      key: '0',
      ctrlKey: !isMac,
      metaKey: isMac,
      description: 'Fit to screen',
      action: () => {
        if (onFitToScreen) onFitToScreen();
      },
      enabled: !!onFitToScreen
    },
    
    // View shortcuts
    {
      key: 'g',
      description: 'Toggle grid',
      action: () => {
        if (onToggleGrid) onToggleGrid();
      },
      enabled: !!onToggleGrid
    },
    {
      key: 'r',
      description: 'Toggle rulers',
      action: () => {
        if (onToggleRulers) onToggleRulers();
      },
      enabled: !!onToggleRulers
    },
    
    // Tool shortcuts
    {
      key: 't',
      description: 'Text tool',
      action: () => {
        if (onTextTool) onTextTool();
      },
      enabled: !!onTextTool
    },
    {
      key: 'q',
      description: 'QR code tool',
      action: () => {
        if (onQRCodeTool) onQRCodeTool();
      },
      enabled: !!onQRCodeTool
    },
    {
      key: 'u',
      description: 'UUID tool',
      action: () => {
        if (onUUIDTool) onUUIDTool();
      },
      enabled: !!onUUIDTool
    },
    
    // Help shortcut
    {
      key: '?',
      description: 'Show keyboard shortcuts help',
      action: () => {
        if (onShowHelp) onShowHelp();
      },
      enabled: !!onShowHelp
    }
  ];

  // Check if a shortcut matches the event
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    // Check if shortcut is enabled
    if (shortcut.enabled === false) return false;

    // Check key
    if (event.key !== shortcut.key) return false;

    // Check modifiers
    if (!!event.ctrlKey !== !!shortcut.ctrlKey) return false;
    if (!!event.shiftKey !== !!shortcut.shiftKey) return false;
    if (!!event.altKey !== !!shortcut.altKey) return false;
    if (!!event.metaKey !== !!shortcut.metaKey) return false;

    return true;
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabledRef.current) return;

    // Skip if canvas is not focused (unless it's a global shortcut)
    if (!canvasFocused && !['Space'].includes(event.key)) return;

    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    )) {
      return;
    }

    // Handle space key for panning
    if (event.key === ' ' || event.code === 'Space') {
      if (!spaceKeyDownRef.current) {
        spaceKeyDownRef.current = true;
        handlePanStart();
        
        // Change cursor to grab when space is pressed
        if (canvas) {
          const canvasEl = canvas.getElement();
          if (canvasEl && canvasEl.style) {
            canvasEl.style.cursor = 'grab';
          }
        }
        
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
      }
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => matchesShortcut(event, shortcut));

    if (matchingShortcut) {
      // Prevent default behavior
      if (preventDefault && matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (stopPropagation && matchingShortcut.stopPropagation !== false) {
        event.stopPropagation();
      }

      // Execute shortcut action
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [shortcuts, matchesShortcut, canvasFocused, preventDefault, stopPropagation, handlePanStart]);

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    // Handle space key release for panning
    if ((event.key === ' ' || event.code === 'Space') && spaceKeyDownRef.current) {
      spaceKeyDownRef.current = false;
      mouseDownRef.current = false; // Reset mouse state
      handlePanEnd();
      
      // Reset cursor when space is released
      if (canvas) {
        const canvasEl = canvas.getElement();
        if (canvasEl && canvasEl.style) {
          canvasEl.style.cursor = 'default';
        }
      }
      
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
    }
  }, [preventDefault, stopPropagation, handlePanEnd, canvas]);

  // Set up event listeners
  useEffect(() => {
    if (!enabledRef.current) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Clean up panning state on unmount
  useEffect(() => {
    return () => {
      if (spaceKeyDownRef.current) {
        handlePanEnd();
      }
    };
  }, [handlePanEnd]);

  // Helper functions
  const setEnabled = useCallback((newEnabled: boolean) => {
    enabledRef.current = newEnabled;
  }, []);

  const getShortcutDescription = useCallback((action: string): string | undefined => {
    const shortcut = shortcuts.find(s => s.description.toLowerCase().includes(action.toLowerCase()));
    return shortcut?.description;
  }, [shortcuts]);

  const getShortcutTooltip = useCallback((action: string): string | undefined => {
    const shortcut = shortcuts.find(s => s.description.toLowerCase().includes(action.toLowerCase()));
    if (!shortcut) return undefined;

    const keys: string[] = [];
    
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.metaKey) keys.push('Cmd');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    
    return `${shortcut.description} (${keys.join('+')})`;
  }, [shortcuts]);

  return {
    shortcuts: shortcuts.filter(s => s.enabled !== false),
    isEnabled: enabledRef.current,
    setEnabled,
    getShortcutDescription,
    getShortcutTooltip
  };
};
