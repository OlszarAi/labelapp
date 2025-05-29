// Right sidebar with properties panels and layer management

"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  History, 
  X, 
  Menu,
  ChevronDown,
  ChevronRight,
  Palette,
  Move,
  RotateCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Maximize2
} from 'lucide-react';

export interface RightSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

interface PropertySection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  expanded: boolean;
}

interface LayerItem {
  id: string;
  name: string;
  type: 'text' | 'qrcode' | 'uuid' | 'rectangle' | 'circle' | 'image';
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

/**
 * Right sidebar with canvas properties, object properties, layer management, and history
 */
export function RightSidebar({
  collapsed,
  onToggleCollapse,
  onClose,
  theme,
}: RightSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['canvas', 'object', 'layers'])
  );
  
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [canvasProperties, setCanvasProperties] = useState({
    width: 100,
    height: 50,
    unit: 'mm' as const,
    backgroundColor: '#ffffff',
    gridEnabled: true,
    gridSize: 10,
    rulersEnabled: true,
  });

  const [objectProperties, setObjectProperties] = useState({
    x: 0,
    y: 0,
    width: 50,
    height: 20,
    rotation: 0,
    opacity: 100,
    fill: '#333333',
    stroke: '#000000',
    strokeWidth: 0,
  });

  const [layers] = useState<LayerItem[]>([
    { id: '1', name: 'Background', type: 'rectangle', visible: true, locked: false, zIndex: 0 },
    { id: '2', name: 'Company Logo', type: 'image', visible: true, locked: false, zIndex: 1 },
    { id: '3', name: 'Product Name', type: 'text', visible: true, locked: false, zIndex: 2 },
    { id: '4', name: 'QR Code', type: 'qrcode', visible: true, locked: false, zIndex: 3 },
  ]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const propertySections: PropertySection[] = [
    {
      id: 'canvas',
      title: 'Canvas Properties',
      icon: Maximize2,
      expanded: expandedSections.has('canvas'),
    },
    {
      id: 'object',
      title: 'Object Properties',
      icon: Settings,
      expanded: expandedSections.has('object'),
    },
    {
      id: 'layers',
      title: 'Layers',
      icon: Layers,
      expanded: expandedSections.has('layers'),
    },
    {
      id: 'history',
      title: 'History',
      icon: History,
      expanded: expandedSections.has('history'),
    },
  ];

  const getLayerIcon = (type: LayerItem['type']) => {
    switch (type) {
      case 'text': return 'T';
      case 'qrcode': return 'QR';
      case 'uuid': return '#';
      case 'rectangle': return '□';
      case 'circle': return '○';
      case 'image': return '📷';
      default: return '?';
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col h-full">
        {/* Collapsed Header */}
        <div className="flex items-center justify-center p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Expand sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsed Section Icons */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          {propertySections.map(section => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  onToggleCollapse();
                  toggleSection(section.id);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={section.title}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Properties</h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Collapse sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {propertySections.map(section => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="mb-4">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <SectionIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="mt-2 space-y-3">
                    {section.id === 'canvas' && (
                      <div className="space-y-3">
                        {/* Canvas Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Canvas Size
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              value={canvasProperties.width}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                              placeholder="Width"
                            />
                            <input
                              type="number"
                              value={canvasProperties.height}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                              placeholder="Height"
                            />
                            <select
                              value={canvasProperties.unit}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, unit: e.target.value as any }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            >
                              <option value="mm">mm</option>
                              <option value="px">px</option>
                              <option value="in">in</option>
                            </select>
                          </div>
                        </div>

                        {/* Background Color */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Background
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={canvasProperties.backgroundColor}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, backgroundColor: e.target.value }))}
                              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                            />
                            <input
                              type="text"
                              value={canvasProperties.backgroundColor}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, backgroundColor: e.target.value }))}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>

                        {/* Grid Settings */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Grid</span>
                            <input
                              type="checkbox"
                              checked={canvasProperties.gridEnabled}
                              onChange={(e) => setCanvasProperties(prev => ({ ...prev, gridEnabled: e.target.checked }))}
                              className="rounded"
                            />
                          </div>
                          {canvasProperties.gridEnabled && (
                            <div>
                              <input
                                type="range"
                                min="5"
                                max="50"
                                value={canvasProperties.gridSize}
                                onChange={(e) => setCanvasProperties(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Size: {canvasProperties.gridSize}px</span>
                            </div>
                          )}
                        </div>

                        {/* Rulers */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Rulers</span>
                          <input
                            type="checkbox"
                            checked={canvasProperties.rulersEnabled}
                            onChange={(e) => setCanvasProperties(prev => ({ ...prev, rulersEnabled: e.target.checked }))}
                            className="rounded"
                          />
                        </div>
                      </div>
                    )}

                    {section.id === 'object' && selectedObjectId && (
                      <div className="space-y-3">
                        {/* Position */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Position
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="number"
                                value={objectProperties.x}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                placeholder="X"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">X</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={objectProperties.y}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                placeholder="Y"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Y</span>
                            </div>
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Size
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="number"
                                value={objectProperties.width}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                placeholder="Width"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">W</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={objectProperties.height}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                placeholder="Height"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400">H</span>
                            </div>
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rotation
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={objectProperties.rotation}
                              onChange={(e) => setObjectProperties(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{objectProperties.rotation}°</span>
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Fill Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={objectProperties.fill}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, fill: e.target.value }))}
                                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                              />
                              <input
                                type="text"
                                value={objectProperties.fill}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, fill: e.target.value }))}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Stroke
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="color"
                                value={objectProperties.stroke}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, stroke: e.target.value }))}
                                className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                              />
                              <input
                                type="number"
                                value={objectProperties.strokeWidth}
                                onChange={(e) => setObjectProperties(prev => ({ ...prev, strokeWidth: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                placeholder="Width"
                                min="0"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">px</span>
                            </div>
                          </div>
                        </div>

                        {/* Opacity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Opacity
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={objectProperties.opacity}
                              onChange={(e) => setObjectProperties(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{objectProperties.opacity}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'object' && !selectedObjectId && (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Select an object to edit its properties
                        </p>
                      </div>
                    )}

                    {section.id === 'layers' && (
                      <div className="space-y-1">
                        {layers.map(layer => (
                          <div
                            key={layer.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              selectedObjectId === layer.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' : ''
                            }`}
                            onClick={() => setSelectedObjectId(layer.id)}
                          >
                            {/* Layer Icon */}
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-mono">
                              {getLayerIcon(layer.type)}
                            </div>

                            {/* Layer Name */}
                            <span className="flex-1 text-sm truncate">{layer.name}</span>

                            {/* Layer Controls */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle visibility
                                }}
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title={layer.visible ? 'Hide layer' : 'Show layer'}
                              >
                                {layer.visible ? (
                                  <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                )}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle lock
                                }}
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                              >
                                {layer.locked ? (
                                  <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <Unlock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Layer Actions */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-1">
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Move layer up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Move layer down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Duplicate layer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                              title="Delete layer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'history' && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            Added text element
                          </div>
                          <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            Changed font size
                          </div>
                          <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            Added QR code
                          </div>
                          <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            Canvas resized
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
