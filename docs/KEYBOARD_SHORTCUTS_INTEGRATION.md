# Keyboard Shortcuts Integration Guide

This guide explains the comprehensive keyboard shortcuts system integrated into the fabric editor components.

## Overview

The keyboard shortcuts system provides a complete set of keyboard controls for canvas operations including:
- **Undo/Redo** - Canvas history management
- **Object Manipulation** - Delete, copy, paste, duplicate, select/deselect
- **Object Movement** - Arrow key-based object positioning
- **Zoom & Pan** - Canvas navigation controls
- **Tool Selection** - Quick tool switching
- **View Toggles** - Grid, rulers, panels

## Architecture

### Core Components

1. **`useKeyboardShortcuts`** hook (`src/hooks/useKeyboardShortcuts.ts`)
   - Central keyboard event handling
   - Configurable shortcut mappings
   - Context-aware enabling/disabling

2. **`useCanvasHistory`** hook (`src/hooks/useCanvasHistory.ts`)
   - Canvas state management with undo/redo
   - Automatic state saving on modifications
   - Configurable history limits

3. **`FabricCanvas`** component (`src/components/fabric-editor/FabricCanvas.tsx`)
   - Keyboard shortcuts integration
   - Canvas focus management
   - Action handler implementations

4. **Integration Components**:
   - `EditorLayout` - Top-level editor with shortcuts
   - `CanvasArea` - Canvas wrapper with shortcuts passthrough

## Integration Flow

```
EditorLayout (enableKeyboardShortcuts: true)
    ↓
CanvasArea (passes shortcuts props)
    ↓
FabricCanvas (implements useKeyboardShortcuts)
    ↓
Canvas Focus + Action Handlers + History Management
```

## Available Shortcuts

### Canvas Operations
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Z` | Undo | Restore previous canvas state |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo | Restore next canvas state |
| `Delete` / `Backspace` | Delete | Remove selected objects |
| `Ctrl+A` | Select All | Select all canvas objects |
| `Escape` | Deselect | Clear current selection |

### Object Manipulation
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+C` | Copy | Copy selected objects |
| `Ctrl+V` | Paste | Paste from clipboard |
| `Ctrl+D` | Duplicate | Duplicate selected objects |
| `Arrow Keys` | Move | Move selected objects (1px) |
| `Shift+Arrow` | Move Fast | Move selected objects (10px) |

### Zoom & Navigation
| Shortcut | Action | Description |
|----------|--------|-------------|
| `+` / `=` | Zoom In | Increase canvas zoom |
| `-` | Zoom Out | Decrease canvas zoom |
| `0` | Reset Zoom | Reset zoom to 100% |
| `Ctrl+0` | Fit to Screen | Fit canvas to viewport |

### Tool Selection
| Shortcut | Action | Description |
|----------|--------|-------------|
| `V` | Select Tool | Switch to selection tool |
| `R` | Rectangle | Switch to rectangle tool |
| `C` | Circle | Switch to circle tool |
| `T` | Text | Switch to text tool |
| `L` | Line | Switch to line tool |

### View Toggles
| Shortcut | Action | Description |
|----------|--------|-------------|
| `G` | Toggle Grid | Show/hide canvas grid |
| `R` | Toggle Rulers | Show/hide rulers |
| `[` | Left Panel | Toggle left sidebar |
| `]` | Right Panel | Toggle right sidebar |
| `?` | Help | Show shortcuts help modal |

## Usage Examples

### Basic Integration

```tsx
import EditorLayout from '../fabric-editor/EditorLayout';

function MyEditor() {
  return (
    <EditorLayout
      enableKeyboardShortcuts={true}
      onToolChange={(tool) => console.log('Tool changed:', tool)}
      onCanvasReady={(canvas) => console.log('Canvas ready')}
    />
  );
}
```

### Custom Shortcuts Configuration

```tsx
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function CustomCanvas() {
  const { enableShortcuts } = useKeyboardShortcuts({
    enabled: true,
    onUndo: () => history.undo(),
    onRedo: () => history.redo(),
    onDelete: () => deleteSelected(),
    // ... other handlers
  });
  
  return (
    <canvas 
      ref={canvasRef}
      onFocus={() => enableShortcuts(true)}
      onBlur={() => enableShortcuts(false)}
    />
  );
}
```

### Canvas History Management

```tsx
import { useCanvasHistory } from '../hooks/useCanvasHistory';

function MyComponent() {
  const { undo, redo, canUndo, canRedo, saveState } = useCanvasHistory(canvas);
  
  // Save state after modifications
  useEffect(() => {
    if (canvas) {
      canvas.on('object:modified', () => saveState());
      canvas.on('object:added', () => saveState());
      canvas.on('object:removed', () => saveState());
    }
  }, [canvas, saveState]);
  
  return (
    <div>
      <button disabled={!canUndo} onClick={undo}>Undo</button>
      <button disabled={!canRedo} onClick={redo}>Redo</button>
    </div>
  );
}
```

## Focus Management

The keyboard shortcuts system requires proper focus management to work correctly:

### Canvas Focus
- Canvas must be focusable (`tabIndex={0}`)
- Focus events enable/disable shortcuts
- Click events also manage focus

### Implementation Details
```tsx
// In FabricCanvas component
const [canvasFocused, setCanvasFocused] = useState(false);

const handleCanvasContainerFocus = () => {
  setCanvasFocused(true);
};

const handleCanvasContainerBlur = () => {
  setCanvasFocused(false);
};

// Canvas container
<div
  ref={canvasContainerRef}
  tabIndex={0}
  onFocus={handleCanvasContainerFocus}
  onBlur={handleCanvasContainerBlur}
  onClick={handleCanvasContainerFocus}
>
```

## Action Handlers

### Object Manipulation
```tsx
const handleDelete = useCallback(() => {
  if (!canvas) return;
  const activeObjects = canvas.getActiveObjects();
  activeObjects.forEach(obj => canvas.remove(obj));
  canvas.discardActiveObject();
  canvas.renderAll();
  saveState();
}, [canvas, saveState]);

const handleDuplicate = useCallback(() => {
  if (!canvas) return;
  const activeObjects = canvas.getActiveObjects();
  activeObjects.forEach(obj => {
    obj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      });
      canvas.add(cloned);
    });
  });
  canvas.renderAll();
  saveState();
}, [canvas, saveState]);
```

### Movement Controls
```tsx
const handleMoveSelected = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number = 1) => {
  if (!canvas) return;
  const activeObjects = canvas.getActiveObjects();
  
  activeObjects.forEach(obj => {
    const currentLeft = obj.left || 0;
    const currentTop = obj.top || 0;
    
    switch (direction) {
      case 'up': obj.set('top', currentTop - distance); break;
      case 'down': obj.set('top', currentTop + distance); break;
      case 'left': obj.set('left', currentLeft - distance); break;
      case 'right': obj.set('left', currentLeft + distance); break;
    }
    obj.setCoords();
  });
  
  canvas.renderAll();
  saveState();
}, [canvas, saveState]);
```

## Configuration Options

### Keyboard Shortcuts Hook Options
```tsx
interface KeyboardShortcutsOptions {
  enabled: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  enableSelection: boolean;
  enableHistory: boolean;
  enableObjectManipulation: boolean;
  enableToolSwitching: boolean;
  enableViewToggle: boolean;
  moveDistance: number;
  fastMoveDistance: number;
  zoomStep: number;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onMoveSelected?: (direction: string, distance: number) => void;
  onZoom?: (direction: 'in' | 'out' | 'reset' | 'fit') => void;
  onToolChange?: (tool: string) => void;
  onToggleGrid?: () => void;
  onToggleRulers?: () => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  onShowHelp?: () => void;
}
```

### Canvas History Options
```tsx
interface CanvasHistoryOptions {
  maxHistorySize?: number;  // Default: 50
  debounceMs?: number;      // Default: 300
  enableLogging?: boolean;  // Default: false
}
```

## Best Practices

### 1. Focus Management
- Always implement proper focus handling
- Use `tabIndex={0}` on canvas containers
- Handle both focus events and click events

### 2. State Management
- Save canvas state after all modifications
- Use debouncing for frequent operations
- Implement proper cleanup in useEffect

### 3. Performance
- Use `useCallback` for action handlers
- Debounce state saving operations
- Limit history size appropriately

### 4. Accessibility
- Provide keyboard navigation alternatives
- Include proper ARIA labels
- Support screen readers where possible

### 5. Error Handling
- Check canvas availability before operations
- Provide fallbacks for unsupported operations
- Log errors appropriately

## Troubleshooting

### Common Issues

1. **Shortcuts not working**
   - Check if canvas has focus
   - Verify `enableKeyboardShortcuts` prop
   - Check browser console for errors

2. **Focus issues**
   - Ensure `tabIndex={0}` on canvas container
   - Implement both focus and click handlers
   - Check for conflicting focus management

3. **History not working**
   - Verify canvas is passed to history hook
   - Check if `saveState()` is called after modifications
   - Review history configuration options

4. **Performance issues**
   - Implement debouncing for state saves
   - Reduce history size limit
   - Use `useCallback` for handlers

### Debug Tools

Enable logging for troubleshooting:

```tsx
const history = useCanvasHistory(canvas, {
  enableLogging: true  // Shows history operations in console
});

const shortcuts = useKeyboardShortcuts({
  // Add console.log in handlers to debug
  onUndo: () => {
    console.log('Undo triggered');
    history.undo();
  }
});
```

## Migration Guide

### From Previous Implementation

1. **Update component props**:
   ```tsx
   // Before
   <FabricCanvas />
   
   // After
   <FabricCanvas 
     enableKeyboardShortcuts={true}
     onToolChange={handleToolChange}
   />
   ```

2. **Add history management**:
   ```tsx
   // Add to existing canvas setup
   const history = useCanvasHistory(canvas);
   
   // Connect to canvas events
   useEffect(() => {
     if (canvas) {
       canvas.on('object:modified', () => history.saveState());
     }
   }, [canvas, history]);
   ```

3. **Update layout components**:
   - Pass keyboard shortcuts props through component hierarchy
   - Implement tool change handlers
   - Add focus management where needed

## API Reference

See individual component and hook documentation for detailed API information:
- [`useKeyboardShortcuts`](../hooks/useKeyboardShortcuts.ts)
- [`useCanvasHistory`](../hooks/useCanvasHistory.ts)
- [`FabricCanvas`](../components/fabric-editor/FabricCanvas.tsx)
- [`EditorLayout`](../components/fabric-editor/EditorLayout.tsx)
