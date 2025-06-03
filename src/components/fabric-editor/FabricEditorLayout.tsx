// Professional three-panel layout for the Fabric editor

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import CanvasArea from './CanvasArea';
import { FabricCanvasRef } from './FabricCanvas';

export interface FabricEditorLayoutProps {
  projectId?: string;
  canvasId?: string;
  className?: string;
}

export interface PanelState {
  leftSidebar: {
    visible: boolean;
    width: number;
    collapsed: boolean;
  };
  rightSidebar: {
    visible: boolean;
    width: number;
    collapsed: boolean;
  };
}

const DEFAULT_PANEL_STATE: PanelState = {
  leftSidebar: {
    visible: true,
    width: 250,
    collapsed: false,
  },
  rightSidebar: {
    visible: true,
    width: 300,
    collapsed: false,
  },
};

/**
 * Professional three-panel layout for the Fabric editor
 * Features: resizable panels, keyboard shortcuts, collapsible sidebars, responsive design
 */
export function FabricEditorLayout({
  projectId,
  canvasId,
  className = '',
}: FabricEditorLayoutProps) {
  const [panelState, setPanelState] = useState<PanelState>(DEFAULT_PANEL_STATE);
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [canvasRef, setCanvasRef] = useState<React.RefObject<FabricCanvasRef | null> | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);

  // Canvas reference callback
  const handleCanvasRefReady = useCallback((ref: React.RefObject<FabricCanvasRef | null>) => {
    setCanvasRef(ref);
  }, []);

  // Calculate panel dimensions
  const leftPanelWidth = panelState.leftSidebar.visible 
    ? (panelState.leftSidebar.collapsed ? 48 : panelState.leftSidebar.width)
    : 0;
  
  const rightPanelWidth = panelState.rightSidebar.visible 
    ? (panelState.rightSidebar.collapsed ? 48 : panelState.rightSidebar.width)
    : 0;

  // Panel toggle handlers
  const toggleLeftSidebar = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      leftSidebar: {
        ...prev.leftSidebar,
        visible: !prev.leftSidebar.visible,
      },
    }));
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      rightSidebar: {
        ...prev.rightSidebar,
        visible: !prev.rightSidebar.visible,
      },
    }));
  }, []);

  const collapseLeftSidebar = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      leftSidebar: {
        ...prev.leftSidebar,
        collapsed: !prev.leftSidebar.collapsed,
      },
    }));
  }, []);

  const collapseRightSidebar = useCallback(() => {
    setPanelState(prev => ({
      ...prev,
      rightSidebar: {
        ...prev.rightSidebar,
        collapsed: !prev.rightSidebar.collapsed,
      },
    }));
  }, []);

  // Resize handlers
  const startResize = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(side);
    dragStartX.current = e.clientX;
    dragStartWidth.current = side === 'left' ? leftPanelWidth : rightPanelWidth;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftPanelWidth, rightPanelWidth]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX.current;
    const newWidth = Math.max(200, Math.min(600, dragStartWidth.current + (isDragging === 'left' ? deltaX : -deltaX)));

    setPanelState(prev => ({
      ...prev,
      [isDragging === 'left' ? 'leftSidebar' : 'rightSidebar']: {
        ...prev[isDragging === 'left' ? 'leftSidebar' : 'rightSidebar'],
        width: newWidth,
        collapsed: false, // Expand if collapsed during resize
      },
    }));
  }, [isDragging]);

  const stopResize = useCallback(() => {
    setIsDragging(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            toggleLeftSidebar();
            break;
          case '2':
            e.preventDefault();
            toggleRightSidebar();
            break;
          case 'b':
            e.preventDefault();
            collapseLeftSidebar();
            break;
          case 'p':
            e.preventDefault();
            collapseRightSidebar();
            break;
        }
      }
      
      // Toggle theme with Ctrl+Shift+T
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar, collapseLeftSidebar, collapseRightSidebar]);

  // Mouse resize events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
      
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isDragging, handleResize, stopResize]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div 
      ref={layoutRef}
      className={`fabric-editor-layout flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 ${className}`}
      data-theme={theme}
    >
      {/* Left Sidebar */}
      {panelState.leftSidebar.visible && (
        <>
          <div
            className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 transition-all duration-200"
            style={{ width: `${leftPanelWidth}px` }}
          >
            <LeftSidebar
              collapsed={panelState.leftSidebar.collapsed}
              onToggleCollapse={collapseLeftSidebar}
              onClose={toggleLeftSidebar}
              theme={theme}
              canvasRef={canvasRef}
            />
          </div>
          
          {/* Left Resize Handle */}
          {!panelState.leftSidebar.collapsed && (
            <div
              className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors duration-150 flex-shrink-0"
              onMouseDown={(e) => startResize('left', e)}
              title="Drag to resize left panel"
            />
          )}
        </>
      )}

      {/* Center Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CanvasArea
          projectId={projectId}
          canvasId={canvasId}
          leftPanelVisible={panelState.leftSidebar.visible}
          rightPanelVisible={panelState.rightSidebar.visible}
          onToggleLeftPanel={toggleLeftSidebar}
          onToggleRightPanel={toggleRightSidebar}
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          onCanvasRefReady={handleCanvasRefReady}
        />
      </div>

      {/* Right Sidebar */}
      {panelState.rightSidebar.visible && (
        <>
          {/* Right Resize Handle */}
          {!panelState.rightSidebar.collapsed && (
            <div
              className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors duration-150 flex-shrink-0"
              onMouseDown={(e) => startResize('right', e)}
              title="Drag to resize right panel"
            />
          )}
          
          <div
            className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 transition-all duration-200"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <RightSidebar
              collapsed={panelState.rightSidebar.collapsed}
              onToggleCollapse={collapseRightSidebar}
              onClose={toggleRightSidebar}
              theme={theme}
              canvas={canvasRef?.current?.canvasState?.canvas || null}
            />
          </div>
        </>
      )}

      {/* Minimal Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end z-10">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+1</kbd>
            <span>Tools</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+2</kbd>
            <span>Properties</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FabricEditorLayout;
