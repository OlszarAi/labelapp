// Text element creation tool for the left sidebar

"use client";

import React, { useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Plus,
  RotateCcw
} from 'lucide-react';
import { 
  useElementCreation, 
  TextElementProperties, 
  DEFAULT_TEXT_PROPERTIES, 
  COMMON_FONTS, 
  TEXT_TEMPLATES 
} from '@/hooks/fabric/useElementCreation';

interface TextToolProps {
  canvas: fabric.Canvas | null;
  onElementCreated?: (element: fabric.Text) => void;
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

export function TextTool({ canvas, onElementCreated }: TextToolProps) {
  const { createTextElement } = useElementCreation();
  const [properties, setProperties] = useState<TextElementProperties>(DEFAULT_TEXT_PROPERTIES);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Update property
  const updateProperty = useCallback((key: keyof TextElementProperties, value: any) => {
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle text style toggles
  const toggleBold = useCallback(() => {
    updateProperty('fontWeight', properties.fontWeight === 'bold' ? 'normal' : 'bold');
  }, [properties.fontWeight, updateProperty]);

  const toggleItalic = useCallback(() => {
    updateProperty('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic');
  }, [properties.fontStyle, updateProperty]);

  const toggleUnderline = useCallback(() => {
    const hasUnderline = properties.textDecoration.includes('underline');
    updateProperty('textDecoration', hasUnderline ? '' : 'underline');
  }, [properties.textDecoration, updateProperty]);

  // Handle alignment
  const setAlignment = useCallback((align: string) => {
    updateProperty('textAlign', align);
  }, [updateProperty]);

  // Apply template
  const applyTemplate = useCallback((template: { name: string; text: string }) => {
    updateProperty('text', template.text);
  }, [updateProperty]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setProperties(DEFAULT_TEXT_PROPERTIES);
  }, []);

  // Create text element
  const handleCreateText = useCallback(async () => {
    if (!canvas || isCreating) return;

    setIsCreating(true);
    try {
      const textElement = await createTextElement(canvas, properties);
      onElementCreated?.(textElement);
    } catch (error) {
      console.error('Error creating text element:', error);
    } finally {
      setIsCreating(false);
    }
  }, [canvas, createTextElement, properties, onElementCreated, isCreating]);

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Text Tool</h3>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Content
        </label>
        <textarea
          value={properties.text}
          onChange={(e) => updateProperty('text', e.target.value)}
          placeholder="Enter your text..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </label>
        <div 
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-md 
                   bg-gray-50 dark:bg-gray-700 min-h-[60px] flex items-center justify-center"
          style={{
            fontFamily: properties.fontFamily,
            fontSize: `${Math.min(properties.fontSize, 24)}px`,
            fontWeight: properties.fontWeight,
            fontStyle: properties.fontStyle,
            textDecoration: properties.textDecoration,
            color: properties.fill,
            textAlign: properties.textAlign as any,
          }}
        >
          {properties.text || 'Preview text'}
        </div>
      </div>

      {/* Font Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Font Family */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Font Family
          </label>
          <select
            value={properties.fontFamily}
            onChange={(e) => updateProperty('fontFamily', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {COMMON_FONTS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Size
          </label>
          <select
            value={properties.fontSize}
            onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Style Controls */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Style
        </label>
        <div className="flex space-x-1">
          <button
            onClick={toggleBold}
            className={`p-2 rounded border ${
              properties.fontWeight === 'bold'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            } hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={toggleItalic}
            className={`p-2 rounded border ${
              properties.fontStyle === 'italic'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            } hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={toggleUnderline}
            className={`p-2 rounded border ${
              properties.textDecoration.includes('underline')
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            } hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors`}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Alignment
        </label>
        <div className="flex space-x-1">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setAlignment(value)}
              className={`p-2 rounded border ${
                properties.textAlign === value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              } hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Color
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 
                     rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: properties.fill }}
            />
            <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          {showColorPicker && (
            <input
              type="color"
              value={properties.fill}
              onChange={(e) => updateProperty('fill', e.target.value)}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Quick Templates
        </label>
        <div className="grid grid-cols-2 gap-1">
          {TEXT_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 
                       rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={handleCreateText}
          disabled={!canvas || isCreating}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 
                   bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Adding...' : 'Add Text'}</span>
        </button>
        <button
          onClick={resetToDefaults}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                   rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default TextTool;
