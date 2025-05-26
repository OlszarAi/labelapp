/**
 * UUID Tool Component
 * Advanced UUID generation with multiple formats and styling options
 */

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { useElementCreation } from '../../../hooks/useElementCreation';
import { generateUUID, getUUIDLength, UUIDOptions } from '../../../lib/uuid-generator';

interface UUIDToolProps {
  canvas: fabric.Canvas | null;
  onUUIDAdd?: (uuid: fabric.Text) => void;
}

const UUIDTool: React.FC<UUIDToolProps> = ({ canvas, onUUIDAdd }) => {
  const { createUUID, state } = useElementCreation();
  
  // UUID Configuration
  const [uuidFormat, setUuidFormat] = useState<'full' | 'short' | 'numbers' | 'custom'>('short');
  const [customLength, setCustomLength] = useState(8);
  const [includeHyphens, setIncludeHyphens] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  
  // Text Styling
  const [fontFamily, setFontFamily] = useState('Monaco, monospace');
  const [fontSize, setFontSize] = useState(12);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [textColor, setTextColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  // Preview
  const [previewUUID, setPreviewUUID] = useState('');

  // Generate preview UUID when settings change
  useEffect(() => {
    const options: UUIDOptions = {
      format: uuidFormat,
      length: customLength,
      includeHyphens,
      prefix,
      suffix
    };
    
    const preview = generateUUID(options);
    setPreviewUUID(preview);
  }, [uuidFormat, customLength, includeHyphens, prefix, suffix]);

  const handleAddUUID = () => {
    if (!canvas) return;

    const options: UUIDOptions = {
      format: uuidFormat,
      length: customLength,
      includeHyphens,
      prefix,
      suffix
    };

    const textOptions = {
      fontFamily,
      fontSize,
      fontWeight,
      fill: textColor,
      textAlign
    };

    const uuidObj = createUUID(canvas, { ...options, ...textOptions });
    
    if (uuidObj) {
      onUUIDAdd?.(uuidObj);
    }
  };

  const handleRegenerateUUID = () => {
    const options: UUIDOptions = {
      format: uuidFormat,
      length: customLength,
      includeHyphens,
      prefix,
      suffix
    };
    
    const newUUID = generateUUID(options);
    setPreviewUUID(newUUID);
  };

  // Format presets
  const formatPresets = [
    { format: 'full' as const, label: 'Full UUID', example: '550e8400-e29b-41d4-a716-446655440000' },
    { format: 'short' as const, label: 'Short Code', example: 'a1b2c3d4' },
    { format: 'numbers' as const, label: 'Numbers Only', example: '12345678' },
    { format: 'custom' as const, label: 'Custom Length', example: 'abc123' }
  ];

  // Font options
  const fontOptions = [
    'Monaco, monospace',
    'Consolas, monospace', 
    'Courier New, monospace',
    'Arial, sans-serif',
    'Helvetica, sans-serif'
  ];

  // Color presets
  const colorPresets = [
    '#000000', '#333333', '#666666', '#999999',
    '#0066CC', '#009900', '#FF6600', '#CC0000'
  ];

  const estimatedLength = getUUIDLength(uuidFormat, customLength);

  return (
    <div className="uuid-tool bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
          <span className="text-yellow-600 dark:text-yellow-400 text-sm">🔢</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          UUID Generator
        </h3>
      </div>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          UUID Format
        </label>
        <div className="grid grid-cols-1 gap-2">
          {formatPresets.map((preset) => (
            <button
              key={preset.format}
              onClick={() => setUuidFormat(preset.format)}
              className={`p-3 border rounded-md text-left transition-colors ${
                uuidFormat === preset.format
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {preset.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {preset.example}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Length */}
      {uuidFormat === 'custom' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Length: {customLength}
          </label>
          <input
            type="range"
            min="4"
            max="32"
            value={customLength}
            onChange={(e) => setCustomLength(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4</span>
            <span>32</span>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Include Hyphens
          </label>
          <button
            onClick={() => setIncludeHyphens(!includeHyphens)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeHyphens ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeHyphens ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prefix
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. ID-"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Suffix
            </label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. -2024"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Text Styling */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Styling
        </label>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="8"
                max="48"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight
              </label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value as 'normal' | 'bold')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alignment
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    textAlign === align
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
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
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => setTextColor(color)}
              className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Preview (Length: {estimatedLength})
          </label>
          <button
            onClick={handleRegenerateUUID}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 New
          </button>
        </div>
        <div
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight,
            color: textColor,
            textAlign
          }}
          className="p-2 bg-white dark:bg-gray-800 rounded border font-mono break-all"
        >
          {previewUUID}
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddUUID}
        disabled={state.isCreating}
        className="w-full px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {state.isCreating ? 'Adding...' : 'Add UUID to Canvas'}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          💡 UUIDs are unique identifiers used for labeling products, 
          inventory management, or tracking systems.
        </p>
      </div>
    </div>
  );
};

export default UUIDTool;