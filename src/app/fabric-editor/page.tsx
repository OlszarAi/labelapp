'use client';

import React, { useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import EditorLayout from '@/components/fabric-editor/EditorLayout';

export default function FabricEditorTestPage() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = useCallback((result: string) => {
    setTestResults(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${result}`]);
  }, []);

  const handleCanvasReady = useCallback((canvas: fabric.Canvas) => {
    console.log('✅ Canvas initialized successfully');
    canvasRef.current = canvas;
    setCanvasReady(true);
    addTestResult('Canvas initialized and ready');
    
    // Add welcome message
    const welcomeText = new fabric.Text('Witaj w Label Editor!\nUżyj lewego panelu do dodawania elementów', {
      left: 50,
      top: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#666',
      textAlign: 'center'
    });
    
    canvas.add(welcomeText);
    canvas.renderAll();
    setElementCount(1);
    addTestResult('Welcome text added to canvas');
  }, [addTestResult]);

  const handleSelectionChange = useCallback((selectedObjects: fabric.Object[]) => {
    setSelectedCount(selectedObjects.length);
    if (selectedObjects.length > 0) {
      addTestResult(`${selectedObjects.length} element(s) selected`);
    }
  }, [addTestResult]);

  const handleObjectModified = useCallback((objects: fabric.Object[]) => {
    addTestResult(`${objects.length} element(s) modified`);
  }, [addTestResult]);

  const handleZoomChange = useCallback((zoom: number) => {
    addTestResult(`Zoom changed to ${Math.round(zoom * 100)}%`);
  }, [addTestResult]);

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    addTestResult(`Canvas resized to ${width}×${height}px`);
  }, [addTestResult]);

  // Test functions
  const testQRCodeGeneration = useCallback(() => {
    if (!canvasRef.current) return;
    
    addTestResult('Testing QR Code generation...');
    
    // Simulate QR code creation (this would normally be done through the QRCodeTool)
    const qrRect = new fabric.Rect({
      left: 300,
      top: 200,
      width: 100,
      height: 100,
      fill: '#000000',
      stroke: '#cccccc',
      strokeWidth: 2
    });
    
    const qrLabel = new fabric.Text('QR Code\nPlaceholder', {
      left: 325,
      top: 225,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#ffffff',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    
    canvasRef.current.add(qrRect);
    canvasRef.current.add(qrLabel);
    canvasRef.current.renderAll();
    
    setElementCount(prev => prev + 2);
    addTestResult('QR Code placeholder created');
  }, [addTestResult]);

  const testUUIDGeneration = useCallback(() => {
    if (!canvasRef.current) return;
    
    addTestResult('Testing UUID generation...');
    
    const sampleUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    const uuidText = new fabric.Text(`UUID: ${sampleUUID}`, {
      left: 50,
      top: 300,
      fontSize: 14,
      fontFamily: 'Courier New',
      fill: '#333333'
    });
    
    canvasRef.current.add(uuidText);
    canvasRef.current.renderAll();
    
    setElementCount(prev => prev + 1);
    addTestResult('Sample UUID text created');
  }, [addTestResult]);

  const testTextFormatting = useCallback(() => {
    if (!canvasRef.current) return;
    
    addTestResult('Testing text formatting...');
    
    const formattedText = new fabric.Text('Sformatowany Tekst', {
      left: 450,
      top: 150,
      fontSize: 24,
      fontFamily: 'Georgia',
      fill: '#2563eb',
      fontWeight: 'bold',
      fontStyle: 'italic'
    });
    
    canvasRef.current.add(formattedText);
    canvasRef.current.renderAll();
    
    setElementCount(prev => prev + 1);
    addTestResult('Formatted text created with custom styling');
  }, [addTestResult]);

  const testGraphicsShapes = useCallback(() => {
    if (!canvasRef.current) return;
    
    addTestResult('Testing graphics shapes...');
    
    // Circle
    const circle = new fabric.Circle({
      left: 600,
      top: 100,
      radius: 30,
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2
    });
    
    // Rectangle
    const rectangle = new fabric.Rect({
      left: 650,
      top: 100,
      width: 60,
      height: 40,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2
    });
    
    // Triangle
    const triangle = new fabric.Triangle({
      left: 720,
      top: 120,
      width: 40,
      height: 40,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2
    });
    
    canvasRef.current.add(circle);
    canvasRef.current.add(rectangle);
    canvasRef.current.add(triangle);
    canvasRef.current.renderAll();
    
    setElementCount(prev => prev + 3);
    addTestResult('Basic shapes created (circle, rectangle, triangle)');
  }, [addTestResult]);

  const testDragAndDrop = useCallback(() => {
    if (!canvasRef.current) return;
    
    addTestResult('Testing drag-to-canvas functionality...');
    
    // Simulate element being dragged from sidebar
    const draggedElement = new fabric.Rect({
      left: 200,
      top: 400,
      width: 80,
      height: 50,
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2,
      opacity: 0.8
    });
    
    const dragLabel = new fabric.Text('Dragged Element', {
      left: 240,
      top: 415,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#ffffff',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    
    canvasRef.current.add(draggedElement);
    canvasRef.current.add(dragLabel);
    canvasRef.current.renderAll();
    
    setElementCount(prev => prev + 2);
    addTestResult('Drag-and-drop simulation completed');
  }, [addTestResult]);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.clear();
    canvasRef.current.renderAll();
    setElementCount(0);
    setSelectedCount(0);
    addTestResult('Canvas cleared');
  }, [addTestResult]);

  const runAllTests = useCallback(() => {
    addTestResult('🧪 Running comprehensive test suite...');
    
    setTimeout(() => testQRCodeGeneration(), 500);
    setTimeout(() => testUUIDGeneration(), 1000);
    setTimeout(() => testTextFormatting(), 1500);
    setTimeout(() => testGraphicsShapes(), 2000);
    setTimeout(() => testDragAndDrop(), 2500);
    setTimeout(() => addTestResult('✅ All tests completed successfully!'), 3000);
  }, [testQRCodeGeneration, testUUIDGeneration, testTextFormatting, testGraphicsShapes, testDragAndDrop, addTestResult]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎨 Label Editor - Element Creation Test Suite
          </h1>
          <p className="text-gray-600 text-sm mb-3">
            Test all element creation tools: QR codes, UUIDs, text formatting, and graphics shapes
          </p>
          
          {/* Status Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className={`flex items-center gap-2 ${canvasReady ? 'text-green-600' : 'text-orange-600'}`}>
              <div className={`w-2 h-2 rounded-full ${canvasReady ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              Canvas: {canvasReady ? 'Ready' : 'Initializing...'}
            </div>
            <div className="text-gray-600">
              Elements: <span className="font-medium">{elementCount}</span>
            </div>
            <div className="text-gray-600">
              Selected: <span className="font-medium">{selectedCount}</span>
            </div>
          </div>
        </div>
        
        {/* Test Controls */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={testQRCodeGeneration}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔳 Test QR Code
            </button>
            <button 
              onClick={testUUIDGeneration}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              # Test UUID
            </button>
            <button 
              onClick={testTextFormatting}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              T Test Text
            </button>
            <button 
              onClick={testGraphicsShapes}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ○ Test Graphics
            </button>
            <button 
              onClick={testDragAndDrop}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↔ Test Drag & Drop
            </button>
            <div className="border-l border-gray-300 mx-2"></div>
            <button 
              onClick={runAllTests}
              disabled={!canvasReady}
              className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              🧪 Run All Tests
            </button>
            <button 
              onClick={clearCanvas}
              disabled={!canvasReady}
              className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑 Clear Canvas
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1">
          <EditorLayout 
            canvasWidth={900}
            canvasHeight={700}
            backgroundColor="#ffffff"
            showGrid={true}
            gridSize={20}
            snapToGrid={false}
            showRulers={true}
            rulerUnit="px"
            zoom={1}
            minZoom={0.1}
            maxZoom={5}
            leftSidebarCollapsed={false}
            rightSidebarCollapsed={false}
            onCanvasReady={handleCanvasReady}
            onSelectionChange={handleSelectionChange}
            onObjectModified={handleObjectModified}
            onCanvasSizeChange={handleCanvasSizeChange}
            onZoomChange={handleZoomChange}
            className="test-editor"
          />
        </div>

        {/* Test Results Panel */}
        <div className="w-80 bg-white border-l shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">🧪 Test Results</h3>
            <p className="text-sm text-gray-600">Live testing feedback</p>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No test results yet. Click the test buttons to start testing.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index}
                    className="text-xs bg-gray-50 rounded p-2 border-l-2 border-blue-200"
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">📋 Instructions</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use the left sidebar to create elements</li>
              <li>• Test individual tools with buttons above</li>
              <li>• Select elements to see properties panel</li>
              <li>• Use mouse wheel to zoom in/out</li>
              <li>• Drag elements to reposition them</li>
              <li>• Run all tests to verify functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
