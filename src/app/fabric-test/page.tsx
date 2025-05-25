'use client';

import React, { useState } from 'react';
import { fabric } from 'fabric';
import FabricCanvas from '../../components/fabric-editor/FabricCanvas';

export default function FabricTestPage() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [showGrid, setShowGrid] = useState(true);

  const handleCanvasReady = (fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
    console.log('Canvas ready:', fabricCanvas);
  };

  const handleSelectionChange = (objects: fabric.Object[]) => {
    setSelectedObjects(objects);
    console.log('Selection changed:', objects);
  };

  const handleObjectModified = (objects: fabric.Object[]) => {
    console.log('Objects modified:', objects);
  };

  const addRectangle = () => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 50,
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.Text('Hello Fabric.js!', {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: '#374151',
      fontFamily: 'Arial',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas || selectedObjects.length === 0) return;

    selectedObjects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.renderAll();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Fabric.js Canvas Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tools
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={addRectangle}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!canvas}
                >
                  Add Rectangle
                </button>
                
                <button
                  onClick={addCircle}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={!canvas}
                >
                  Add Circle
                </button>
                
                <button
                  onClick={addText}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={!canvas}
                >
                  Add Text
                </button>
                
                <hr className="border-gray-200 dark:border-neutral-700" />
                
                <button
                  onClick={deleteSelected}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  disabled={!canvas || selectedObjects.length === 0}
                >
                  Delete Selected
                </button>
                
                <button
                  onClick={clearCanvas}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  disabled={!canvas}
                >
                  Clear Canvas
                </button>
                
                <hr className="border-gray-200 dark:border-neutral-700" />
                
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded border-gray-300 dark:border-neutral-600"
                  />
                  <span>Show Grid</span>
                </label>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selection Info
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedObjects.length === 0
                    ? 'No objects selected'
                    : `${selectedObjects.length} object(s) selected`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Canvas
              </h2>
              
              <div className="h-96 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <FabricCanvas
                  width={600}
                  height={400}
                  backgroundColor="#ffffff"
                  showGrid={showGrid}
                  gridSize={20}
                  onCanvasReady={handleCanvasReady}
                  onSelectionChange={handleSelectionChange}
                  onObjectModified={handleObjectModified}
                  className="w-full h-full"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Use Ctrl+Mouse Wheel to zoom in/out</li>
                  <li>Use Mouse Wheel or Alt+Drag to pan around</li>
                  <li>Click objects to select them</li>
                  <li>Drag objects to move them</li>
                  <li>Use corner handles to resize objects</li>
                  <li>Use rotation handle to rotate objects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
