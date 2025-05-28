'use client';

import React, { useState, useRef } from 'react';
import { fabric } from 'fabric';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import CanvasArea from './CanvasArea';

interface EditorLayoutProps {
  /**
   * Canvas configuration
   */
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  
  /**
   * Grid system
   */
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  
  /**
   * Rulers
   */
  showRulers?: boolean;
  rulerUnit?: 'px' | 'mm' | 'cm' | 'in';
  
  /**
   * Zoom and pan
   */
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  
  /**
   * Panel state
   */
  leftSidebarCollapsed?: boolean;
  rightSidebarCollapsed?: boolean;
  
  /**
   * Keyboard shortcuts
   */
  enableKeyboardShortcuts?: boolean;
  
  /**
   * Event handlers
   */
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
  onObjectModified?: (objects: fabric.Object[]) => void;
  onCanvasSizeChange?: (width: number, height: number) => void;
  onZoomChange?: (zoom: number) => void;
  onToolChange?: (tool: string) => void;
  
  /**
   * Custom styling
   */
  className?: string;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  // Canvas configuration
  canvasWidth = 800,
  canvasHeight = 600,
  backgroundColor = '#ffffff',
  
  // Grid system
  showGrid = true,
  gridSize = 20,
  snapToGrid = false,
  
  // Rulers
  showRulers = true,
  rulerUnit = 'px',
  
  // Zoom and pan
  zoom = 1,
  minZoom = 0.1,
  maxZoom = 10,
  
  // Panel state
  leftSidebarCollapsed = false,
  rightSidebarCollapsed = false,
  
  // Keyboard shortcuts
  enableKeyboardShortcuts = true,
  
  // Event handlers
  onCanvasReady,
  onSelectionChange,
  onObjectModified,
  onCanvasSizeChange,
  onZoomChange,
  onToolChange,
  
  // Custom styling
  className = ''
}) => {
  // Panel state management
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(leftSidebarCollapsed);
  const [isRightCollapsed, setIsRightCollapsed] = useState(rightSidebarCollapsed);
  
  // Canvas state
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: canvasWidth,
    height: canvasHeight
  });
  
  // Tool management
  const [currentTool, setCurrentTool] = useState<string>('select');
  
  // Grid and ruler state
  const [gridSettings, setGridSettings] = useState({
    show: showGrid,
    size: gridSize,
    snap: snapToGrid
  });
  const [rulerSettings, setRulerSettings] = useState({
    show: showRulers,
    unit: rulerUnit
  });
  
  // Refs for panel sizing
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);
  
  // Canvas reference
  const canvasRef = useRef<fabric.Canvas | null>(null);
  
  // Handle canvas events
  const handleCanvasReady = (canvas: fabric.Canvas) => {
    canvasRef.current = canvas;
    onCanvasReady?.(canvas);
  };
  
  const handleSelectionChange = (objects: fabric.Object[]) => {
    setSelectedObjects(objects);
    onSelectionChange?.(objects);
  };
  
  const handleObjectModified = (objects: fabric.Object[]) => {
    onObjectModified?.(objects);
  };
  
  const handleCanvasSizeChange = (width: number, height: number) => {
    setCanvasDimensions({ width, height });
    onCanvasSizeChange?.(width, height);
  };
  
  const handleZoomChange = (newZoom: number) => {
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);
  };
  
  // Tool change handler
  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
    onToolChange?.(tool);
    console.log(`✅ Tool changed to: ${tool}`);
  };
  
  // Panel collapse handlers
  const toggleLeftSidebar = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
  };
  
  const toggleRightSidebar = () => {
    setIsRightCollapsed(!isRightCollapsed);
  };
  
  // Grid controls
  const handleGridToggle = () => {
    setGridSettings(prev => ({ ...prev, show: !prev.show }));
  };
  
  const handleGridSizeChange = (size: number) => {
    setGridSettings(prev => ({ ...prev, size }));
  };
  
  const handleSnapToggle = () => {
    setGridSettings(prev => ({ ...prev, snap: !prev.snap }));
  };
  
  // Ruler controls
  const handleRulerToggle = () => {
    setRulerSettings(prev => ({ ...prev, show: !prev.show }));
  };
  
  const handleRulerUnitChange = (unit: 'px' | 'mm' | 'cm' | 'in') => {
    setRulerSettings(prev => ({ ...prev, unit }));
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom * 1.2, maxZoom);
    handleZoomChange(newZoom);
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom * 0.8, minZoom);
    handleZoomChange(newZoom);
  };
  
  const handleZoomReset = () => {
    handleZoomChange(1);
  };
  
  const handleFitToScreen = () => {
    // This will be implemented based on canvas container size
    handleZoomChange(1);
  };

  // Element creation handler
  const handleElementCreate = (elementType: string, config: any) => {
    if (!canvasRef.current) {
      console.warn('Canvas not ready for element creation');
      return;
    }

    const canvas = canvasRef.current;
    let element: fabric.Object | null = null;
    
    // Generate unique ID
    const elementId = `${elementType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create fabric.js objects based on element type
    switch (elementType) {
      case 'rectangle':
        element = new fabric.Rect({
          left: 100,
          top: 100,
          width: config.width || 100,
          height: config.height || 60,
          fill: config.fill || '#f0f0f0',
          stroke: config.stroke || '#333',
          strokeWidth: config.strokeWidth || 1
        });
        break;

      case 'circle':
        element = new fabric.Circle({
          left: 100,
          top: 100,
          radius: config.radius || 50,
          fill: config.fill || '#f0f0f0',
          stroke: config.stroke || '#333',
          strokeWidth: config.strokeWidth || 1
        });
        break;

      case 'line':
        element = new fabric.Line([50, 50, 150, 50], {
          stroke: config.stroke || '#333',
          strokeWidth: config.strokeWidth || 2
        });
        break;

      case 'text':
      case 'heading':
      case 'label':
        element = new fabric.Text(config.text || 'Text', {
          left: 100,
          top: 100,
          fontSize: config.fontSize || 16,
          fontFamily: config.fontFamily || 'Arial',
          fill: config.fill || '#333',
          fontWeight: config.fontWeight || 'normal'
        });
        break;

      case 'triangle':
        element = new fabric.Triangle({
          left: 100,
          top: 100,
          width: config.width || 80,
          height: config.height || 80,
          fill: config.fill || '#f0f0f0',
          stroke: config.stroke || '#333',
          strokeWidth: config.strokeWidth || 1
        });
        break;

      case 'star':
        // Create a star using fabric.Polygon
        const starPoints = createStarPoints(
          config.points || 5,
          config.outerRadius || 50,
          config.innerRadius || 25
        );
        element = new fabric.Polygon(starPoints, {
          left: 100,
          top: 100,
          fill: config.fill || '#f0f0f0',
          stroke: config.stroke || '#333',
          strokeWidth: config.strokeWidth || 1
        });
        break;

      default:
        console.warn(`Element type "${elementType}" not implemented yet`);
        return;
    }

    if (element) {
      // Add unique ID to the element
      (element as any).id = elementId;
      
      canvas.add(element);
      canvas.setActiveObject(element);
      canvas.renderAll();
      console.log(`✅ Added ${elementType} with ID ${elementId} to canvas`);
    }
  };

  // Helper function to create star points
  const createStarPoints = (numPoints: number, outerRadius: number, innerRadius: number) => {
    const points = [];
    const step = (Math.PI * 2) / numPoints;
    
    for (let i = 0; i < numPoints; i++) {
      const outerAngle = i * step - Math.PI / 2;
      const innerAngle = (i + 0.5) * step - Math.PI / 2;
      
      points.push({
        x: outerRadius * Math.cos(outerAngle),
        y: outerRadius * Math.sin(outerAngle)
      });
      
      points.push({
        x: innerRadius * Math.cos(innerAngle),
        y: innerRadius * Math.sin(innerAngle)
      });
    }
    
    return points;
  };

  // Object property change handler
  const handleObjectPropertyChange = (objectId: string, property: string, value: any) => {
    if (!canvasRef.current) {
      console.warn('Canvas not ready for property changes');
      return;
    }

    const canvas = canvasRef.current;
    const objects = canvas.getObjects();
    
    // Find object by ID or apply to selected objects
    const targetObjects = objectId === 'selected' 
      ? canvas.getActiveObjects() 
      : objects.filter(obj => (obj as any).id === objectId);

    if (targetObjects.length === 0) {
      console.warn(`Object with ID "${objectId}" not found`);
      return;
    }

    targetObjects.forEach(obj => {
      (obj as any)[property] = value;
      obj.setCoords?.();
    });

    canvas.renderAll();
    console.log(`✅ Updated property "${property}" to "${value}" for ${targetObjects.length} object(s)`);
  };

  // Keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableKeyboardShortcuts) return;
      
      const { key, ctrlKey, shiftKey, altKey } = e;
      
      // Prevent default actions for these keys
      if (key === 'Control' || key === 'Shift' || key === 'Alt') {
        e.preventDefault();
      }
      
      switch (key) {
        // Toggle left sidebar
        case 'ArrowLeft':
          if (ctrlKey) {
            e.preventDefault();
            toggleLeftSidebar();
          }
          break;
          
        // Toggle right sidebar
        case 'ArrowRight':
          if (ctrlKey) {
            e.preventDefault();
            toggleRightSidebar();
          }
          break;
          
        // Zoom in
        case '=':
        case '+':
          if (ctrlKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
          
        // Zoom out
        case '-':
          if (ctrlKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
          
        // Reset zoom
        case '0':
          if (ctrlKey) {
            e.preventDefault();
            handleZoomReset();
          }
          break;
          
        // Fit to screen
        case 'f':
        case 'F':
          if (ctrlKey) {
            e.preventDefault();
            handleFitToScreen();
          }
          break;
          
        // Select tool
        case 'v':
        case 'V':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('select');
          }
          break;
          
        // Rectangle tool
        case 'r':
        case 'R':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('rectangle');
          }
          break;
          
        // Circle tool
        case 'c':
        case 'C':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('circle');
          }
          break;
          
        // Line tool
        case 'l':
        case 'L':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('line');
          }
          break;
          
        // Text tool
        case 't':
        case 'T':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('text');
          }
          break;
          
        // Triangle tool
        case 'y':
        case 'Y':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('triangle');
          }
          break;
          
        // Star tool
        case 's':
        case 'S':
          if (ctrlKey) {
            e.preventDefault();
            handleToolChange('star');
          }
          break;
          
        // Delete selected objects
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const activeObjects = canvas.getActiveObjects();
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardShortcuts, currentZoom, selectedObjects]);

  return (
    <div className={`w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${className}`}>
      {/* Header with canvas controls */}
      <header className="flex-none h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {/* Left sidebar toggle */}
          <button
            onClick={toggleLeftSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isLeftCollapsed ? "Show element panel" : "Hide element panel"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isLeftCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
          
          {/* Canvas size controls */}
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-700 dark:text-gray-300">Canvas:</label>
            <input
              type="number"
              value={canvasDimensions.width}
              onChange={(e) => handleCanvasSizeChange(Number(e.target.value), canvasDimensions.height)}
              className="w-16 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              min="100"
              max="5000"
            />
            <span className="text-gray-500">×</span>
            <input
              type="number"
              value={canvasDimensions.height}
              onChange={(e) => handleCanvasSizeChange(canvasDimensions.width, Number(e.target.value))}
              className="w-16 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              min="100"
              max="5000"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
          
          {/* Grid controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGridToggle}
              className={`px-3 py-1 text-xs rounded ${
                gridSettings.show 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors`}
            >
              Grid
            </button>
            
            <button
              onClick={handleRulerToggle}
              className={`px-3 py-1 text-xs rounded ${
                rulerSettings.show 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors`}
            >
              Rulers
            </button>
          </div>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={currentZoom <= minZoom}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-sm font-mono w-12 text-center">
            {Math.round(currentZoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={currentZoom >= maxZoom}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={handleFitToScreen}
            className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Fit to screen"
          >
            Fit
          </button>
          
          {/* Right sidebar toggle */}
          <button
            onClick={toggleRightSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
            title={isRightCollapsed ? "Show properties panel" : "Hide properties panel"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isRightCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main editor content */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Sidebar - Element creation tools */}
          {!isLeftCollapsed && (
            <>
              <Panel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30}
                className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
              >
                <LeftSidebar
                  canvas={canvasRef.current}
                  onElementAdd={(element) => {
                    if (canvasRef.current) {
                      canvasRef.current.add(element);
                      canvasRef.current.setActiveObject(element);
                      canvasRef.current.renderAll();
                    }
                  }}
                />
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
            </>
          )}
          
          {/* Center Canvas Area */}
          <Panel defaultSize={isLeftCollapsed && isRightCollapsed ? 100 : 60}>
            <CanvasArea
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              backgroundColor={backgroundColor}
              showGrid={gridSettings.show}
              gridSize={gridSettings.size}
              snapToGrid={gridSettings.snap}
              showRulers={rulerSettings.show}
              rulerUnit={rulerSettings.unit}
              zoom={currentZoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
              enableKeyboardShortcuts={enableKeyboardShortcuts}
              onCanvasReady={handleCanvasReady}
              onSelectionChange={handleSelectionChange}
              onObjectModified={handleObjectModified}
              onZoomChange={handleZoomChange}
              onToolChange={handleToolChange}
            />
          </Panel>
          
          {/* Right Sidebar - Properties panel */}
          {!isRightCollapsed && (
            <>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
              <Panel 
                defaultSize={20} 
                minSize={15} 
                maxSize={35}
                className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
              >
                <RightSidebar
                  selectedObjects={selectedObjects}
                  canvasWidth={canvasDimensions.width}
                  canvasHeight={canvasDimensions.height}
                  canvasBackgroundColor={backgroundColor}
                  gridEnabled={gridSettings.show}
                  gridSize={gridSettings.size}
                  snapToGrid={gridSettings.snap}
                  rulersEnabled={rulerSettings.show}
                  rulerUnit={rulerSettings.unit}
                  zoom={currentZoom}
                  onCanvasSizeChange={handleCanvasSizeChange}
                  onGridToggle={handleGridToggle}
                  onGridSizeChange={handleGridSizeChange}
                  onSnapToggle={handleSnapToggle}
                  onRulerToggle={handleRulerToggle}
                  onRulerUnitChange={handleRulerUnitChange}
                  onZoomChange={handleZoomChange}
                  onObjectPropertyChange={handleObjectPropertyChange}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      
      {/* Status bar */}
      <footer className="flex-none h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>
            {selectedObjects.length === 0 
              ? 'No selection' 
              : selectedObjects.length === 1 
                ? '1 object selected' 
                : `${selectedObjects.length} objects selected`
            }
          </span>
          <span>
            Canvas: {canvasDimensions.width} × {canvasDimensions.height} px
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(currentZoom * 100)}%</span>
          <span>
            Grid: {gridSettings.show ? 'On' : 'Off'}
            {gridSettings.show && ` (${gridSettings.size}px)`}
          </span>
          <span>Rulers: {rulerSettings.show ? 'On' : 'Off'}</span>
        </div>
      </footer>
    </div>
  );
};

export default EditorLayout;
