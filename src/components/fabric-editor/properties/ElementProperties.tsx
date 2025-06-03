// Element Properties Panel for Fabric Editor
// Controls selected object properties like position, size, colors, opacity, etc.

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Move, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Palette,
  ChevronDown,
  ChevronRight,
  Link,
  Unlink
} from 'lucide-react';
import { ObjectProperties } from '@/hooks/fabric/useElementProperties';

export interface ElementPropertiesProps {
  properties: ObjectProperties | null;
  onPropertyChange: (property: string, value: any, applyToAll?: boolean) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  hasMultipleSelection: boolean;
  selectedObjectTypes: string[];
  theme: 'light' | 'dark';
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

/**
 * Element Properties Panel Component
 * Provides comprehensive controls for selected objects including position, size, styling, and layer management
 */
export function ElementProperties({
  properties,
  onPropertyChange,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  hasMultipleSelection,
  selectedObjectTypes,
  theme,
  expanded = true,
  onToggleExpanded,
}: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  // Update aspect ratio when properties change
  useEffect(() => {
    if (properties && properties.width && properties.height) {
      setOriginalAspectRatio(properties.width / properties.height);
    }
  }, [properties?.width, properties?.height]);

  const handlePositionChange = useCallback((axis: 'left' | 'top', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onPropertyChange(axis, numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && properties) {
      if (aspectRatioLocked) {
        if (dimension === 'width') {
          const newHeight = numValue / originalAspectRatio;
          onPropertyChange('width', numValue, hasMultipleSelection);
          onPropertyChange('height', newHeight, hasMultipleSelection);
        } else {
          const newWidth = numValue * originalAspectRatio;
          onPropertyChange('height', numValue, hasMultipleSelection);
          onPropertyChange('width', newWidth, hasMultipleSelection);
        }
      } else {
        onPropertyChange(dimension, numValue, hasMultipleSelection);
      }
    }
  }, [onPropertyChange, hasMultipleSelection, aspectRatioLocked, originalAspectRatio, properties]);

  const handleRotationChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onPropertyChange('angle', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const handleOpacityChange = useCallback((value: string) => {
    const numValue = parseFloat(value) / 100; // Convert percentage to 0-1
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      onPropertyChange('opacity', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const handleColorChange = useCallback((property: 'fill' | 'stroke', color: string) => {
    onPropertyChange(property, color, hasMultipleSelection);
  }, [onPropertyChange, hasMultipleSelection]);

  const handleStrokeWidthChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onPropertyChange('strokeWidth', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const toggleVisibility = useCallback(() => {
    if (properties) {
      onPropertyChange('visible', !properties.visible, hasMultipleSelection);
    }
  }, [onPropertyChange, properties, hasMultipleSelection]);

  const toggleLock = useCallback(() => {
    if (properties) {
      onPropertyChange('locked', !properties.locked, hasMultipleSelection);
    }
  }, [onPropertyChange, properties, hasMultipleSelection]);

  const openColorPicker = useCallback((property: 'fill' | 'stroke') => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = properties?.[property] || '#000000';
    input.onchange = (e) => handleColorChange(property, (e.target as HTMLInputElement).value);
    input.click();
  }, [handleColorChange, properties]);

  if (!properties) {
    return (
      <div className={`
        border-b border-gray-200 dark:border-gray-700
        ${isDark ? 'bg-gray-800' : 'bg-white'}
      `}>
        <div className="p-3">
          <div className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Select an object to edit properties
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      border-b border-gray-200 dark:border-gray-700
      ${isDark ? 'bg-gray-800' : 'bg-white'}
    `}>
      {/* Section Header */}
      <div 
        className={`
          flex items-center justify-between p-3 cursor-pointer
          ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
        `}
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          <Move size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Object Properties
            {hasMultipleSelection && (
              <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ({selectedObjectTypes.length} selected)
              </span>
            )}
          </span>
        </div>
        {onToggleExpanded && (
          expanded ? 
            <ChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} /> :
            <ChevronRight size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        )}
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="p-3 space-y-4">
          {/* Position Controls */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={Math.round(properties.left * 100) / 100}
                  onChange={(e) => handlePositionChange('left', e.target.value)}
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>X</span>
              </div>
              <div>
                <input
                  type="number"
                  value={Math.round(properties.top * 100) / 100}
                  onChange={(e) => handlePositionChange('top', e.target.value)}
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Y</span>
              </div>
            </div>
          </div>

          {/* Size Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Size
              </label>
              <button
                onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                className={`
                  p-1 rounded transition-colors
                  ${aspectRatioLocked
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {aspectRatioLocked ? <Link size={14} /> : <Unlink size={14} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={Math.round(properties.width * 100) / 100}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                  min="1"
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Width</span>
              </div>
              <div>
                <input
                  type="number"
                  value={Math.round(properties.height * 100) / 100}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  min="1"
                  className={`
                    w-full px-2 py-1 text-xs border rounded
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Height</span>
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Rotation
            </label>
            <div className="flex items-center gap-2">
              <RotateCw size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <input
                type="number"
                value={Math.round(properties.angle * 100) / 100}
                onChange={(e) => handleRotationChange(e.target.value)}
                min="-360"
                max="360"
                className={`
                  flex-1 px-2 py-1 text-xs border rounded
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>°</span>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Colors
            </label>
            
            {/* Fill Color */}
            <div className="flex items-center gap-2">
              <span className={`text-xs w-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fill</span>
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.fill }}
                onClick={() => openColorPicker('fill')}
              />
              <input
                type="text"
                value={properties.fill}
                onChange={(e) => handleColorChange('fill', e.target.value)}
                className={`
                  flex-1 px-2 py-1 text-xs border rounded font-mono
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
            </div>

            {/* Stroke Color */}
            <div className="flex items-center gap-2">
              <span className={`text-xs w-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stroke</span>
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.stroke }}
                onClick={() => openColorPicker('stroke')}
              />
              <input
                type="text"
                value={properties.stroke}
                onChange={(e) => handleColorChange('stroke', e.target.value)}
                className={`
                  flex-1 px-2 py-1 text-xs border rounded font-mono
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-2">
              <span className={`text-xs w-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Width</span>
              <input
                type="number"
                value={properties.strokeWidth}
                onChange={(e) => handleStrokeWidthChange(e.target.value)}
                min="0"
                max="50"
                className={`
                  flex-1 px-2 py-1 text-xs border rounded
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>px</span>
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(properties.opacity * 100)}
                onChange={(e) => handleOpacityChange(e.target.value)}
                className="flex-1"
              />
              <input
                type="number"
                value={Math.round(properties.opacity * 100)}
                onChange={(e) => handleOpacityChange(e.target.value)}
                min="0"
                max="100"
                className={`
                  w-12 px-1 py-1 text-xs border rounded text-center
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>

          {/* Object State */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              State
            </label>
            <div className="flex gap-2">
              <button
                onClick={toggleVisibility}
                className={`
                  flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors flex-1
                  ${properties.visible
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {properties.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                {properties.visible ? 'Visible' : 'Hidden'}
              </button>
              <button
                onClick={toggleLock}
                className={`
                  flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors flex-1
                  ${properties.locked
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {properties.locked ? <Lock size={12} /> : <Unlock size={12} />}
                {properties.locked ? 'Locked' : 'Unlocked'}
              </button>
            </div>
          </div>

          {/* Layer Controls */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Layer Order
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={onBringToFront}
                className={`
                  flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <ArrowUp size={12} />
                To Front
              </button>
              <button
                onClick={onSendToBack}
                className={`
                  flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <ArrowDown size={12} />
                To Back
              </button>
              <button
                onClick={onBringForward}
                className={`
                  flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Forward
              </button>
              <button
                onClick={onSendBackward}
                className={`
                  flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors
                  ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Backward
              </button>
            </div>
          </div>

          {/* Actions */}
          {(onDuplicate || onDelete) && (
            <div className="space-y-2">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Actions
              </label>
              <div className="flex gap-2">
                {onDuplicate && (
                  <button
                    onClick={onDuplicate}
                    className={`
                      flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors flex-1
                      ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className={`
                      flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors flex-1
                      ${isDark ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}
                    `}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
