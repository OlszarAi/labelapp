'use client';

import React from 'react';

interface SimpleCanvasAreaProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  showRulers?: boolean;
  rulerUnit?: 'px' | 'mm' | 'cm' | 'in';
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onCanvasReady?: (canvas: any) => void;
  onSelectionChange?: (objects: any[]) => void;
  onObjectModified?: (objects: any[]) => void;
  onZoomChange?: (zoom: number) => void;
}

const SimpleCanvasArea: React.FC<SimpleCanvasAreaProps> = ({
  width = 800,
  height = 600,
  backgroundColor = '#ffffff'
}) => {
  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col">
      {/* Ruler area placeholder */}
      <div className="flex">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 border-b border-gray-300"></div>
      </div>
      
      {/* Canvas area */}
      <div className="flex flex-1">
        <div className="w-8 bg-gray-200 dark:bg-gray-700 border-r border-gray-300"></div>
        <div className="flex-1 overflow-auto p-4">
          <div 
            className="border border-gray-300 shadow-lg mx-auto"
            style={{ 
              width: `${width}px`, 
              height: `${height}px`, 
              backgroundColor 
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Canvas Area ({width} × {height})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCanvasArea;
