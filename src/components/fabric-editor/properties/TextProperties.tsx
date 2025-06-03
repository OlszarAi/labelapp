// Text Properties Panel for Fabric Editor
// Specialized controls for text objects including fonts, formatting, and spacing

"use client";

import React, { useState, useCallback } from 'react';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Palette
} from 'lucide-react';
import type { TextProperties } from '@/hooks/fabric/useElementProperties';

export interface TextPropertiesProps {
  properties: TextProperties | null;
  onPropertyChange: (property: string, value: any, applyToAll?: boolean) => void;
  hasMultipleSelection: boolean;
  theme: 'light' | 'dark';
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

const TEXT_ALIGNS = [
  { value: 'left', icon: AlignLeft, label: 'Left' },
  { value: 'center', icon: AlignCenter, label: 'Center' },
  { value: 'right', icon: AlignRight, label: 'Right' },
  { value: 'justify', icon: AlignJustify, label: 'Justify' },
];

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

/**
 * Text Properties Panel Component
 * Provides comprehensive text formatting controls for text objects
 */
export function TextProperties({
  properties,
  onPropertyChange,
  hasMultipleSelection,
  theme,
  expanded = true,
  onToggleExpanded,
}: TextPropertiesProps) {
  const isDark = theme === 'dark';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTextChange = useCallback((value: string) => {
    onPropertyChange('text', value, hasMultipleSelection);
  }, [onPropertyChange, hasMultipleSelection]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    onPropertyChange('fontFamily', fontFamily, hasMultipleSelection);
  }, [onPropertyChange, hasMultipleSelection]);

  const handleFontSizeChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onPropertyChange('fontSize', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const handleFontWeightChange = useCallback((fontWeight: string) => {
    onPropertyChange('fontWeight', fontWeight, hasMultipleSelection);
  }, [onPropertyChange, hasMultipleSelection]);

  const handleFontStyleToggle = useCallback(() => {
    if (properties) {
      const newStyle = properties.fontStyle === 'italic' ? 'normal' : 'italic';
      onPropertyChange('fontStyle', newStyle, hasMultipleSelection);
    }
  }, [onPropertyChange, properties, hasMultipleSelection]);

  const handleTextDecorationToggle = useCallback(() => {
    if (properties) {
      const newDecoration = properties.textDecoration === 'underline' ? '' : 'underline';
      onPropertyChange('textDecoration', newDecoration, hasMultipleSelection);
    }
  }, [onPropertyChange, properties, hasMultipleSelection]);

  const handleTextAlignChange = useCallback((align: string) => {
    onPropertyChange('textAlign', align, hasMultipleSelection);
  }, [onPropertyChange, hasMultipleSelection]);

  const handleLineHeightChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onPropertyChange('lineHeight', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const handleCharSpacingChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onPropertyChange('charSpacing', numValue, hasMultipleSelection);
    }
  }, [onPropertyChange, hasMultipleSelection]);

  const openColorPicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = properties?.fill || '#000000';
    input.onchange = (e) => onPropertyChange('fill', (e.target as HTMLInputElement).value, hasMultipleSelection);
    input.click();
  }, [onPropertyChange, properties, hasMultipleSelection]);

  if (!properties) {
    return null;
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
          <Type size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Text Properties
            {hasMultipleSelection && (
              <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                (Multiple)
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
          {/* Text Content */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Text Content
            </label>
            <textarea
              value={properties.text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
              className={`
                w-full px-2 py-1 text-xs border rounded resize-none
                ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              `}
              placeholder="Enter text content..."
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Font Family
            </label>
            <select
              value={properties.fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className={`
                w-full px-2 py-1 text-xs border rounded
                ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              `}
            >
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size and Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Font Size
              </label>
              <div className="flex">
                <select
                  value={properties.fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className={`
                    flex-1 px-2 py-1 text-xs border rounded-l
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                >
                  {FONT_SIZES.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={properties.fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  min="1"
                  max="200"
                  className={`
                    w-12 px-1 py-1 text-xs border-l-0 border rounded-r text-center
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Font Weight
              </label>
              <select
                value={properties.fontWeight}
                onChange={(e) => handleFontWeightChange(e.target.value)}
                className={`
                  w-full px-2 py-1 text-xs border rounded
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              >
                {FONT_WEIGHTS.map(weight => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Formatting */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Formatting
            </label>
            <div className="flex gap-1">
              <button
                onClick={handleFontWeightChange.bind(null, properties.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`
                  flex items-center justify-center p-2 text-xs rounded transition-colors
                  ${properties.fontWeight === 'bold' || properties.fontWeight === '700'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                onClick={handleFontStyleToggle}
                className={`
                  flex items-center justify-center p-2 text-xs rounded transition-colors
                  ${properties.fontStyle === 'italic'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                onClick={handleTextDecorationToggle}
                className={`
                  flex items-center justify-center p-2 text-xs rounded transition-colors
                  ${properties.textDecoration === 'underline'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Underline"
              >
                <Underline size={14} />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Alignment
            </label>
            <div className="flex gap-1">
              {TEXT_ALIGNS.map(align => {
                const Icon = align.icon;
                return (
                  <button
                    key={align.value}
                    onClick={() => handleTextAlignChange(align.value)}
                    className={`
                      flex items-center justify-center p-2 text-xs rounded transition-colors flex-1
                      ${properties.textAlign === align.value
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    title={align.label}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.fill }}
                onClick={openColorPicker}
              />
              <input
                type="text"
                value={properties.fill}
                onChange={(e) => onPropertyChange('fill', e.target.value, hasMultipleSelection)}
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
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`
              flex items-center gap-2 w-full text-xs font-medium transition-colors
              ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}
            `}
          >
            {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Advanced Settings
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              {/* Line Height */}
              <div className="space-y-2">
                <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Line Height
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={properties.lineHeight}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={Math.round(properties.lineHeight * 10) / 10}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    min="0.5"
                    max="3"
                    step="0.1"
                    className={`
                      w-16 px-1 py-1 text-xs border rounded text-center
                      ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    `}
                  />
                </div>
              </div>

              {/* Character Spacing */}
              <div className="space-y-2">
                <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Character Spacing
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={properties.charSpacing}
                    onChange={(e) => handleCharSpacingChange(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={properties.charSpacing}
                    onChange={(e) => handleCharSpacingChange(e.target.value)}
                    min="-50"
                    max="50"
                    className={`
                      w-16 px-1 py-1 text-xs border rounded text-center
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
