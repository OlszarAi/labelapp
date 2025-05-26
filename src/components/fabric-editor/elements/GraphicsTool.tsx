/**
 * Graphics Tool Component
 * Comprehensive graphic elements creation with shape library, icons, and image support
 */

import React, { useState, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useElementCreation } from '../../../hooks/useElementCreation';

interface GraphicsToolProps {
  canvas: fabric.Canvas | null;
  onShapeAdd?: (shape: fabric.Object) => void;
}

type TabType = 'shapes' | 'icons' | 'images' | 'svg';

interface ShapeTemplate {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  name: string;
  icon: string;
  color: string;
}

interface IconTemplate {
  name: string;
  svg: string;
  category: string;
}

const GraphicsTool: React.FC<GraphicsToolProps> = ({ canvas, onShapeAdd }) => {
  const [activeTab, setActiveTab] = useState<TabType>('shapes');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1f2937');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [svgInput, setSvgInput] = useState('');
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, createShape, createImageFromFile, createSVGFromString } = useElementCreation();

  // Shape templates library
  const shapeTemplates: ShapeTemplate[] = [
    { type: 'rectangle', name: 'Prostokąt', icon: '⬛', color: 'bg-blue-500' },
    { type: 'circle', name: 'Koło', icon: '⚫', color: 'bg-green-500' },
    { type: 'triangle', name: 'Trójkąt', icon: '🔺', color: 'bg-purple-500' },
    { type: 'line', name: 'Linia', icon: '—', color: 'bg-orange-500' },
    { type: 'arrow', name: 'Strzałka', icon: '→', color: 'bg-red-500' },
  ];

  // Common icons library
  const iconTemplates: IconTemplate[] = [
    {
      name: 'Serce',
      category: 'symbols',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    },
    {
      name: 'Gwiazda',
      category: 'symbols',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: 'Dom',
      category: 'objects',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
    },
    {
      name: 'Telefon',
      category: 'objects',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`
    },
    {
      name: 'Email',
      category: 'objects',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
    },
    {
      name: 'Lokalizacja',
      category: 'objects',
      svg: `<svg viewBox="0 0 24 24" fill="${fillColor}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
    },
  ];

  // Size configurations
  const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return { width: 60, height: 60, radius: 30 };
      case 'medium': return { width: 100, height: 100, radius: 50 };
      case 'large': return { width: 150, height: 150, radius: 75 };
    }
  };

  // Stroke dash array configurations
  const getStrokeDashArray = (style: 'solid' | 'dashed' | 'dotted') => {
    switch (style) {
      case 'solid': return [];
      case 'dashed': return [5, 5];
      case 'dotted': return [2, 2];
    }
  };

  // Shape creation handler
  const handleShapeCreate = useCallback(async (shapeType: ShapeTemplate['type']) => {
    if (!canvas) return;

    const sizeConfig = getSizeConfig(selectedSize);
    const strokeDashArray = getStrokeDashArray(strokeStyle);

    const shape = createShape(canvas, {
      type: shapeType,
      width: sizeConfig.width,
      height: sizeConfig.height,
      radius: sizeConfig.radius,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      strokeDashArray,
    });

    if (shape) {
      onShapeAdd?.(shape);
    }
  }, [canvas, selectedSize, strokeStyle, fillColor, strokeColor, strokeWidth, createShape, onShapeAdd]);

  // Icon creation handler
  const handleIconCreate = useCallback(async (icon: IconTemplate) => {
    if (!canvas) return;

    try {
      const shape = await createSVGFromString(canvas, icon.svg);
      if (shape) {
        onShapeAdd?.(shape);
      }
    } catch (error) {
      console.error('Error creating icon:', error);
    }
  }, [canvas, createSVGFromString, onShapeAdd]);

  // Image upload handler
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    try {
      const image = await createImageFromFile(canvas, file);
      if (image) {
        onShapeAdd?.(image);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [canvas, createImageFromFile, onShapeAdd]);

  // SVG import handler
  const handleSVGImport = useCallback(async () => {
    if (!canvas || !svgInput.trim()) return;

    try {
      const shape = await createSVGFromString(canvas, svgInput);
      if (shape) {
        onShapeAdd?.(shape);
        setSvgInput('');
      }
    } catch (error) {
      console.error('Error importing SVG:', error);
    }
  }, [canvas, svgInput, createSVGFromString, onShapeAdd]);

  // Drag start handler
  const handleDragStart = useCallback((e: React.DragEvent, elementId: string) => {
    setDraggedElement(elementId);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Color presets
  const colorPresets = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280'
  ];

  return (
    <div className="graphics-tool bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Elementy graficzne
      </h3>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
        {[
          { id: 'shapes', label: 'Kształty', icon: '⚪' },
          { id: 'icons', label: 'Ikony', icon: '⭐' },
          { id: 'images', label: 'Obrazy', icon: '🖼️' },
          { id: 'svg', label: 'SVG', icon: '📝' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading and Error States */}
      {state.isCreating && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">Tworzenie elementu...</span>
          </div>
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <span className="text-sm text-red-700 dark:text-red-300">{state.error}</span>
        </div>
      )}

      {/* Shapes Tab */}
      {activeTab === 'shapes' && (
        <div className="space-y-4">
          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rozmiar
            </label>
            <div className="flex gap-2">
              {[
                { id: 'small', label: 'Mały' },
                { id: 'medium', label: 'Średni' },
                { id: 'large', label: 'Duży' }
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id as any)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedSize === size.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shape Library */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dodaj kształt
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shapeTemplates.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => handleShapeCreate(shape.type)}
                  onDragStart={(e) => handleDragStart(e, `shape-${shape.type}`)}
                  draggable
                  disabled={state.isCreating}
                  className={`px-3 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${shape.color}`}
                >
                  <span className="text-lg">{shape.icon}</span>
                  {shape.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Icons Tab */}
      {activeTab === 'icons' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biblioteka ikon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {iconTemplates.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => handleIconCreate(icon)}
                  onDragStart={(e) => handleDragStart(e, `icon-${icon.name}`)}
                  draggable
                  disabled={state.isCreating}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div 
                    className="w-8 h-8 mx-auto mb-1"
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{icon.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wgraj obraz
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={state.isCreating}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={state.isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Wybierz plik
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF do 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SVG Tab */}
      {activeTab === 'svg' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importuj SVG
            </label>
            <textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder="Wklej kod SVG..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
              disabled={state.isCreating}
            />
            <button
              onClick={handleSVGImport}
              disabled={!svgInput.trim() || state.isCreating}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importuj SVG
            </button>
          </div>
        </div>
      )}

      {/* Style Controls */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Opcje stylu
        </h4>

        {/* Fill Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kolor wypełnienia
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="#3b82f6"
            />
          </div>
          <div className="flex gap-1">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => setFillColor(color)}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Stroke Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kolor obramowania
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="#1f2937"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Grubość obramowania: {strokeWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0px</span>
            <span>10px</span>
          </div>
        </div>

        {/* Stroke Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Styl obramowania
          </label>
          <div className="flex gap-2">
            {[
              { id: 'solid', label: 'Ciągła' },
              { id: 'dashed', label: 'Przerywana' },
              { id: 'dotted', label: 'Kropkowana' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setStrokeStyle(style.id as any)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  strokeStyle === style.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drag and Drop Helper */}
      {draggedElement && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Przeciągnij element na płótno lub kliknij aby dodać
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphicsTool;
