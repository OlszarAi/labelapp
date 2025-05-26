/**
 * Text Tool Component
 * Advanced text creation with comprehensive formatting options
 */

import React, { useState } from 'react';
import { fabric } from 'fabric';
import { useElementCreation } from '../../../hooks/useElementCreation';

interface TextToolProps {
  canvas: fabric.Canvas | null;
  onTextAdd?: (text: fabric.Text) => void;
}

const TextTool: React.FC<TextToolProps> = ({ canvas, onTextAdd }) => {
  const { createText, state } = useElementCreation();
  
  // Font and styling options
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textColor, setTextColor] = useState('#000000');
  
  // Custom text input
  const [customText, setCustomText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'title' | 'subtitle' | 'body' | 'label' | 'custom'>('custom');

  const handleAddText = (templateType?: string, presetText?: string) => {
    if (!canvas) return;

    const finalText = presetText || customText || 'New text';
    const template = templateType as any || selectedTemplate;

    const textObj = createText(canvas, {
      text: finalText,
      fontFamily: selectedFont,
      fontSize,
      fontWeight,
      fontStyle,
      fill: textColor,
      textAlign,
      template
    });

    if (textObj) {
      onTextAdd?.(textObj);
      // Clear custom text after adding
      if (!presetText) {
        setCustomText('');
      }
    }
  };

  // Font categories
  const fontCategories = {
    'Sans Serif': ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Geneva'],
    'Serif': ['Times New Roman', 'Georgia', 'Garamond', 'Book Antiqua'],
    'Monospace': ['Monaco', 'Consolas', 'Courier New', 'Lucida Console'],
    'Display': ['Impact', 'Bebas Neue', 'Oswald', 'Montserrat']
  };

  // Text templates
  const textTemplates = [
    { type: 'title', label: 'Title', example: 'Main Title', icon: '📝' },
    { type: 'subtitle', label: 'Subtitle', example: 'Subtitle', icon: '📄' },
    { type: 'body', label: 'Body Text', example: 'Body content', icon: '📃' },
    { type: 'label', label: 'Label', example: 'Label text', icon: '🏷️' }
  ];

  // Quick text options
  const quickTexts = [
    { label: 'Product Name', text: 'Product Name', icon: '📦' },
    { label: 'Brand', text: 'Brand Name', icon: '🏪' },
    { label: 'Description', text: 'Product Description', icon: '📋' },
    { label: 'Price', text: '$0.00', icon: '💰' },
    { label: 'SKU', text: 'SKU-12345', icon: '🔢' },
    { label: 'Date', text: new Date().toLocaleDateString(), icon: '📅' }
  ];

  // Color presets
  const colorPresets = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000'
  ];

  return (
    <div className="text-tool bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 text-sm">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Text Tools
        </h3>
      </div>

      {/* Custom Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Text
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter your text..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => handleAddText()}
            disabled={!customText.trim() || state.isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Text Templates */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Templates
        </label>
        <div className="grid grid-cols-2 gap-2">
          {textTemplates.map((template) => (
            <button
              key={template.type}
              onClick={() => handleAddText(template.type, template.example)}
              disabled={state.isCreating}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{template.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {template.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {template.example}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Text Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Text
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickTexts.map((quick) => (
            <button
              key={quick.label}
              onClick={() => handleAddText('custom', quick.text)}
              disabled={state.isCreating}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{quick.icon}</span>
                <div className="text-xs">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {quick.label}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">
                    {quick.text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Family
        </label>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {Object.entries(fontCategories).map(([category, fonts]) => (
            <optgroup key={category} label={category}>
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Font Styling */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="8"
            max="200"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight
          </label>
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value as 'normal' | 'bold')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Style
          </label>
          <select
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value as 'normal' | 'italic')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alignment
          </label>
          <select
            value={textAlign}
            onChange={(e) => setTextAlign(e.target.value as 'left' | 'center' | 'right')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* Color Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Color
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-5 gap-1">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => setTextColor(color)}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview
        </div>
        <div
          style={{
            fontFamily: selectedFont,
            fontSize: `${fontSize}px`,
            fontWeight,
            fontStyle,
            color: textColor,
            textAlign
          }}
          className="min-h-[40px] flex items-center"
        >
          {customText || 'Sample text'}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Tips: Use templates for consistent styling. Choose fonts that match your label's purpose.
          Ensure good contrast for readability.
        </p>
      </div>
    </div>
  );
};

export default TextTool;
